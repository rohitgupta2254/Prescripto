const Payment = require('../models/Payment');
const PaymentService = require('../services/paymentService');
const EmailService = require('../services/emailService');
const db = require('../config/database');

const isMockMode = process.env.SKIP_PAYMENT_TEST === "true";

// Create payment intent
exports.createPaymentIntent = async (req, res) => {
  try {
    const { appointmentId, amount } = req.body;

    if (!appointmentId || !amount) {
      return res.status(400).json({
        success: false,
        message: 'Appointment ID and amount are required'
      });
    }

    // Verify appointment belongs to patient
    const [appointment] = await db.execute(
      'SELECT * FROM appointments WHERE id = ? AND patient_id = ?',
      [appointmentId, req.user.id]
    );

    if (appointment.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Appointment not found'
      });
    }

    const paymentData = await PaymentService.createPaymentIntent(amount, appointmentId);
    
    res.json({
      success: true,
      data: {
        clientSecret: paymentData.clientSecret,
        paymentIntentId: paymentData.paymentIntentId
      }
    });
  } catch (error) {
    console.error('Create payment intent error:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Payment processing error'
    });
  }
};

// UPI (mock/test) payment handler — allows testing UPI payments locally
exports.payWithUPI = async (req, res) => {
  try {
    const { appointmentId, amount, upiId } = req.body;

    if (!appointmentId || !amount || !upiId) {
      return res.status(400).json({ success: false, message: 'appointmentId, amount and upiId are required' });
    }

    // Verify appointment belongs to patient
    const [appointmentRows] = await db.execute(
      'SELECT * FROM appointments WHERE id = ? AND patient_id = ?',
      [appointmentId, req.user.id]
    );

    if (appointmentRows.length === 0) {
      return res.status(404).json({ success: false, message: 'Appointment not found' });
    }

    // Create a payment record and mark as completed (test mode)
    const transactionId = `upi_${Date.now()}`;

    const Payment = require('../models/Payment');
    await Payment.create({
      appointment_id: appointmentId,
      amount,
      payment_method: 'upi',
      transaction_id: transactionId,
      status: 'completed'
    });

    // Update appointment status to scheduled
    await db.execute('UPDATE appointments SET status = "scheduled" WHERE id = ?', [appointmentId]);

    // Send payment receipt email (best-effort)
    const [appointmentData] = await db.execute(
      `SELECT a.*, p.name as patient_name, p.email as patient_email, 
              d.name as doctor_name, d.specialization, d.fees
       FROM appointments a
       INNER JOIN patients p ON a.patient_id = p.id
       INNER JOIN doctors d ON a.doctor_id = d.id
       WHERE a.id = ?`,
      [appointmentId]
    );

    const payment = await Payment.findByAppointmentId(appointmentId);

    if (appointmentData.length > 0 && payment) {
      EmailService.sendPaymentReceipt(
        payment,
        appointmentData[0],
        { name: appointmentData[0].patient_name, email: appointmentData[0].patient_email },
        { name: appointmentData[0].doctor_name }
      ).catch(err => console.error('Failed to send payment receipt:', err));
    }

    res.json({ success: true, data: { paymentId: payment.id || payment.transaction_id || transactionId }, message: 'UPI payment (test) completed' });
  } catch (error) {
    console.error('UPI payment error:', error);
    res.status(500).json({ success: false, message: 'Server error during UPI payment' });
  }
};
// Confirm payment
exports.confirmPayment = async (req, res) => {
  try {
    const { paymentIntentId, appointmentId } = req.body;

    if (!paymentIntentId || !appointmentId) {
      return res.status(400).json({
        success: false,
        message: 'Payment intent ID and appointment ID are required'
      });
    }

    const result = await PaymentService.confirmPayment(paymentIntentId, appointmentId);

    if (result.status === 'completed') {
      // Update appointment status to scheduled (from pending)
      await db.execute(
        'UPDATE appointments SET status = "scheduled" WHERE id = ?',
        [appointmentId]
      );

      // Send payment receipt email
      const [appointment] = await db.execute(
        `SELECT a.*, p.name as patient_name, p.email as patient_email, 
                d.name as doctor_name, d.specialization, d.fees
         FROM appointments a
         INNER JOIN patients p ON a.patient_id = p.id
         INNER JOIN doctors d ON a.doctor_id = d.id
         WHERE a.id = ?`,
        [appointmentId]
      );

      const payment = await Payment.findByAppointmentId(appointmentId);

      if (appointment.length > 0 && payment) {
        EmailService.sendPaymentReceipt(
          payment,
          appointment[0],
          { name: appointment[0].patient_name, email: appointment[0].patient_email },
          { name: appointment[0].doctor_name }
        ).catch(err => console.error('Failed to send payment receipt:', err));
      }

      res.json({
        success: true,
        data: {
          paymentId: result.paymentId,
          status: result.status
        },
        message: 'Payment completed successfully'
      });
    } else {
      res.status(400).json({
        success: false,
        message: `Payment ${result.status}`
      });
    }
  } catch (error) {
    console.error('Confirm payment error:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Payment confirmation error'
    });
  }
};

// Get payment history
exports.getPaymentHistory = async (req, res) => {
  try {
    const payments = await Payment.findByUserId(req.user.id, req.user.role);

    res.json({
      success: true,
      data: {
        payments,
        total: payments.length
      }
    });
  } catch (error) {
    console.error('Get payment history error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
};

// Get payment by appointment
exports.getPaymentByAppointment = async (req, res) => {
  try {
    const { appointmentId } = req.params;

    // Verify appointment belongs to user
    let query = 'SELECT * FROM appointments WHERE id = ?';
    if (req.user.role === 'patient') {
      query += ' AND patient_id = ?';
    } else {
      query += ' AND doctor_id = ?';
    }

    const [appointment] = await db.execute(query, [appointmentId, req.user.id]);

    if (appointment.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Appointment not found'
      });
    }

    const payment = await Payment.findByAppointmentId(appointmentId);

    res.json({
      success: true,
      data: payment
    });
  } catch (error) {
    console.error('Get payment by appointment error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
};