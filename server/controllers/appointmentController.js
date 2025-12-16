const db = require('../config/database');
const Appointment = require('../models/Appointment');
const Payment = require('../models/Payment');
const CancellationRequest = require('../models/CancellationRequest');
const PaymentService = require('../services/paymentService');
const EmailService = require('../services/emailService');

class AppointmentController {
  // Request appointment cancellation by patient
  static async requestCancellation(req, res) {
    try {
      const { appointmentId } = req.params;
      const { reason } = req.body;
      const patientId = req.user.id;

      // Verify appointment exists and belongs to patient
      const appointment = await Appointment.findById(appointmentId);
      if (!appointment || appointment.patient_id !== patientId) {
        return res.status(404).json({ message: 'Appointment not found' });
      }

      // Check if appointment is more than 2 hours away
      const appointmentDateTime = new Date(`${appointment.appointment_date}T${appointment.appointment_time}`);
      const now = new Date();
      const timeDiff = appointmentDateTime - now;
      const hoursDiff = timeDiff / (1000 * 60 * 60);

      if (hoursDiff < 2) {
        return res.status(400).json({ 
          message: 'Cannot cancel appointment within 2 hours of scheduled time' 
        });
      }

      // Get payment amount
      const payment = await Payment.findByAppointmentId(appointmentId);
      if (!payment || !['completed', 'pending'].includes(payment.status)) {
        return res.status(400).json({ 
          message: 'No valid payment found for this appointment' 
        });
      }

      // Verify payment has valid ID
      if (!payment.id) {
        return res.status(400).json({ 
          message: 'Payment record is invalid' 
        });
      }

      // Create cancellation request
      const cancellation = await CancellationRequest.create({
        appointment_id: appointmentId,
        requested_by: 'patient',
        reason,
        refund_amount: payment.amount
      });

      // Update payment status to refund_pending (only if not already pending a refund)
      if (payment.status !== 'refund_pending') {
        await db.execute(
          'UPDATE payments SET status = ? WHERE id = ?',
          ['refund_pending', payment.id]
        );
      }

      // Send email to doctor for approval
      await EmailService.sendCancellationRequest(appointment, 'patient', reason);

      res.json({
        message: 'Cancellation request submitted. Awaiting doctor approval.',
        data: cancellation
      });
    } catch (error) {
      console.error('Cancel appointment error:', error);
      res.status(500).json({ message: error.message });
    }
  }

  // Doctor cancels appointment
  static async cancelByDoctor(req, res) {
    try {
      const { appointmentId } = req.params;
      const { reason } = req.body;
      const doctorId = req.user.id;

      // Verify appointment exists and belongs to doctor
      const appointment = await Appointment.findById(appointmentId);
      if (!appointment || appointment.doctor_id !== doctorId) {
        return res.status(404).json({ message: 'Appointment not found' });
      }

      if (appointment.status === 'cancelled') {
        return res.status(400).json({ message: 'Appointment is already cancelled' });
      }

      // Get payment details
      const payment = await Payment.findByAppointmentId(appointmentId);

      // Create cancellation request as doctor-initiated
      await CancellationRequest.create({
        appointment_id: appointmentId,
        requested_by: 'doctor',
        reason,
        refund_amount: payment?.amount || 0
      });

      // Process immediate refund if payment is completed
      if (payment && payment.status === 'completed') {
        await this._processRefund(appointment, payment, appointmentId, reason);
      } else {
        // Just cancel the appointment and mark payment as cancelled
        await Appointment.updateStatus(appointmentId, 'cancelled');
        if (payment) {
          await db.execute(
            'UPDATE payments SET status = ? WHERE id = ?',
            ['refunded', payment.id]
          );
        }
      }

      // Send cancellation email to patient
      await EmailService.sendCancellationNotification(appointment, 'doctor', reason);

      res.json({
        message: 'Appointment cancelled by doctor. Refund initiated if applicable.',
        data: { appointmentId, cancelled: true }
      });
    } catch (error) {
      console.error('Doctor cancel appointment error:', error);
      res.status(500).json({ message: error.message });
    }
  }

  // Doctor approves cancellation request
  static async approveCancellation(req, res) {
    try {
      const { requestId } = req.params;
      const { notes } = req.body;
      const doctorId = req.user.id;

      // Get cancellation request
      const cancellation = await CancellationRequest.findById(requestId);
      if (!cancellation) {
        return res.status(404).json({ message: 'Cancellation request not found' });
      }

      // Verify doctor owns this appointment
      if (cancellation.doctor_id !== doctorId) {
        return res.status(403).json({ message: 'Unauthorized' });
      }

      if (cancellation.status !== 'pending') {
        return res.status(400).json({ message: 'Request already processed' });
      }

      // Get appointment and payment details
      const appointment = await Appointment.findById(cancellation.appointment_id);
      const payment = await Payment.findByAppointmentId(cancellation.appointment_id);

      // Process refund
      let refundTransactionId = null;
      if (payment && payment.status === 'completed') {
        refundTransactionId = await this._processRefund(
          appointment,
          payment,
          cancellation.appointment_id,
          notes
        );
      } else {
        // Mark appointment as cancelled without refund processing
        await Appointment.updateStatus(cancellation.appointment_id, 'cancelled');
        if (payment) {
          await db.execute(
            'UPDATE payments SET status = ? WHERE id = ?',
            ['refunded', payment.id]
          );
        }
      }

      // Update cancellation request
      await CancellationRequest.updateStatus(requestId, 'approved', notes, refundTransactionId);

      // Send approval email to patient
      await EmailService.sendCancellationApproved(appointment, cancellation.refund_amount);

      res.json({
        message: 'Cancellation approved. Refund processed.',
        data: { requestId, status: 'approved' }
      });
    } catch (error) {
      console.error('Approve cancellation error:', error);
      res.status(500).json({ message: error.message });
    }
  }

  // Doctor rejects cancellation request
  static async rejectCancellation(req, res) {
    try {
      const { requestId } = req.params;
      const { notes } = req.body;
      const doctorId = req.user.id;

      // Get cancellation request
      const cancellation = await CancellationRequest.findById(requestId);
      if (!cancellation) {
        return res.status(404).json({ message: 'Cancellation request not found' });
      }

      // Verify doctor owns this appointment
      if (cancellation.doctor_id !== doctorId) {
        return res.status(403).json({ message: 'Unauthorized' });
      }

      if (cancellation.status !== 'pending') {
        return res.status(400).json({ message: 'Request already processed' });
      }

      // Revert payment status from refund_pending to completed
      const payment = await Payment.findByAppointmentId(cancellation.appointment_id);
      if (payment && payment.status === 'refund_pending') {
        await db.execute(
          'UPDATE payments SET status = ? WHERE id = ?',
          ['completed', payment.id]
        );
      }

      // Update cancellation request
      await CancellationRequest.updateStatus(requestId, 'rejected', notes);

      const appointment = await Appointment.findById(cancellation.appointment_id);
      // Send rejection email to patient
      await EmailService.sendCancellationRejected(appointment, notes);

      res.json({
        message: 'Cancellation request rejected.',
        data: { requestId, status: 'rejected' }
      });
    } catch (error) {
      console.error('Reject cancellation error:', error);
      res.status(500).json({ message: error.message });
    }
  }

  // Get doctor's pending cancellation requests
  static async getPendingCancellations(req, res) {
    try {
      const doctorId = req.user.id;
      const requests = await CancellationRequest.getPendingRequests(doctorId);
      
      res.json({
        message: 'Pending cancellation requests',
        data: { requests }
      });
    } catch (error) {
      console.error('Get pending cancellations error:', error);
      res.status(500).json({ message: error.message });
    }
  }

  // Get refund history
  static async getRefundHistory(req, res) {
    try {
      const userId = req.user.id;
      const userType = req.query.userType || 'patient'; // 'patient' or 'doctor'

      const history = await CancellationRequest.getRefundHistory(userType, userId);

      res.json({
        message: 'Refund history',
        data: { history }
      });
    } catch (error) {
      console.error('Get refund history error:', error);
      res.status(500).json({ message: error.message });
    }
  }

  // Private method to process refund
  static async _processRefund(appointment, payment, appointmentId, reason) {
    try {
      // If payment was done via Stripe, process refund through Stripe
      if (payment.payment_method === 'card' && payment.transaction_id) {
        const refundResult = await PaymentService.refundPayment(
          payment.transaction_id,
          Math.round(payment.amount * 100) // Convert to cents
        );
        
        // Update payment status to refunded
        await db.execute(
          'UPDATE payments SET status = ? WHERE id = ?',
          ['refunded', payment.id]
        );

        // Cancel appointment
        await Appointment.updateStatus(appointmentId, 'cancelled');

        return refundResult.refund_id || refundResult.id;
      } else {
        // For non-Stripe payments, just mark as refunded
        await db.execute(
          'UPDATE payments SET status = ? WHERE id = ?',
          ['refunded', payment.id]
        );

        // Cancel appointment
        await Appointment.updateStatus(appointmentId, 'cancelled');

        return 'refund-' + appointmentId + '-' + Date.now();
      }
    } catch (error) {
      console.error('Refund processing error:', error);
      throw error;
    }
  }

  // Get doctor's revenue summary with cancellations
  static async getDoctorRevenueSummary(req, res) {
    try {
      const doctorId = req.user.id;

      // Get total completed appointments and revenue
      const [totalStats] = await db.execute(`
        SELECT 
          COUNT(*) as total_appointments,
          SUM(CASE WHEN p.status = 'completed' THEN p.amount ELSE 0 END) as total_revenue,
          SUM(CASE WHEN p.status = 'refunded' THEN p.amount ELSE 0 END) as total_refunds,
          COUNT(CASE WHEN a.status = 'completed' THEN 1 END) as completed_appointments,
          COUNT(CASE WHEN a.status = 'cancelled' THEN 1 END) as cancelled_appointments
        FROM appointments a
        LEFT JOIN payments p ON a.id = p.appointment_id
        WHERE a.doctor_id = ?
      `, [doctorId]);

      // Get this month's stats
      const [monthlyStats] = await db.execute(`
        SELECT 
          COUNT(*) as monthly_appointments,
          SUM(CASE WHEN p.status = 'completed' THEN p.amount ELSE 0 END) as monthly_revenue,
          SUM(CASE WHEN p.status = 'refunded' THEN p.amount ELSE 0 END) as monthly_refunds,
          COUNT(CASE WHEN a.status = 'completed' THEN 1 END) as monthly_completed
        FROM appointments a
        LEFT JOIN payments p ON a.id = p.appointment_id
        WHERE a.doctor_id = ? AND MONTH(a.appointment_date) = MONTH(NOW()) 
              AND YEAR(a.appointment_date) = YEAR(NOW())
      `, [doctorId]);

      const stats = totalStats[0];
      const monthlyData = monthlyStats[0];

      const netRevenue = (stats.total_revenue || 0) - (stats.total_refunds || 0);
      const monthlyNetRevenue = (monthlyData.monthly_revenue || 0) - (monthlyData.monthly_refunds || 0);

      res.json({
        message: 'Revenue summary',
        data: {
          total: {
            appointments: stats.total_appointments,
            revenue: stats.total_revenue || 0,
            refunds: stats.total_refunds || 0,
            netRevenue,
            completed: stats.completed_appointments,
            cancelled: stats.cancelled_appointments
          },
          monthly: {
            appointments: monthlyData.monthly_appointments,
            revenue: monthlyData.monthly_revenue || 0,
            refunds: monthlyData.monthly_refunds || 0,
            netRevenue: monthlyNetRevenue,
            completed: monthlyData.monthly_completed
          }
        }
      });
    } catch (error) {
      console.error('Get revenue summary error:', error);
      res.status(500).json({ message: error.message });
    }
  }
}

module.exports = AppointmentController;
