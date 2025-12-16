const Doctor = require('../models/Doctor');
const Appointment = require('../models/Appointment');
const Review = require('../models/Review');

// Get doctor profile
exports.getProfile = async (req, res) => {
  try {
    const doctor = await Doctor.findById(req.user.id);
    
    if (!doctor) {
      return res.status(404).json({
        success: false,
        message: 'Doctor not found'
      });
    }

    // Get rating stats
    const ratingStats = await Review.getRatingStats(req.user.id);

    res.json({
      success: true,
      data: {
        ...doctor,
        ratingStats
      }
    });
  } catch (error) {
    console.error('Get doctor profile error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
};

// Update doctor profile
exports.updateProfile = async (req, res) => {
  try {
    const {
      name,
      specialization,
      fees,
      address,
      phone,
      experience_years,
      qualifications,
      profile_picture
    } = req.body;

    const result = await Doctor.updateProfile(req.user.id, {
      name,
      specialization,
      fees: fees ? parseFloat(fees) : undefined,
      address,
      phone,
      experience_years: experience_years ? parseInt(experience_years) : undefined,
      qualifications,
      profile_picture
    });

    if (result.affectedRows === 1) {
      const updatedDoctor = await Doctor.findById(req.user.id);
      res.json({
        success: true,
        data: updatedDoctor,
        message: 'Profile updated successfully'
      });
    } else {
      res.status(400).json({
        success: false,
        message: 'Failed to update profile'
      });
    }
  } catch (error) {
    console.error('Update doctor profile error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
};

// Get doctor appointments
exports.getAppointments = async (req, res) => {
  try {
    const { status } = req.query;
    const appointments = await Appointment.findByDoctorId(req.user.id, status);

    res.json({
      success: true,
      data: {
        appointments,
        total: appointments.length
      }
    });
  } catch (error) {
    console.error('Get doctor appointments error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
};

// Update appointment status
exports.updateAppointmentStatus = async (req, res) => {
  try {
    const { appointmentId } = req.params;
    const { status } = req.body;

    if (!['scheduled', 'completed', 'cancelled', 'no_show'].includes(status)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid status'
      });
    }

    const appointment = await Appointment.findById(appointmentId);
    if (!appointment) {
      return res.status(404).json({
        success: false,
        message: 'Appointment not found'
      });
    }

    if (appointment.doctor_id !== req.user.id) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to update this appointment'
      });
    }

    const result = await Appointment.updateStatus(appointmentId, status);

    if (result.affectedRows === 1) {
      res.json({
        success: true,
        message: 'Appointment status updated successfully'
      });
    } else {
      res.status(400).json({
        success: false,
        message: 'Failed to update appointment status'
      });
    }
  } catch (error) {
    console.error('Update appointment status error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
};

// Add doctor timing
exports.addTiming = async (req, res) => {
  try {
    const { day_of_week, start_time, end_time, slot_duration } = req.body;

    if (!day_of_week || !start_time || !end_time) {
      return res.status(400).json({
        success: false,
        message: 'Please provide day, start time, and end time'
      });
    }

    const result = await Doctor.addTiming(req.user.id, {
      day_of_week,
      start_time,
      end_time,
      slot_duration
    });

    if (result.affectedRows === 1) {
      res.status(201).json({
        success: true,
        message: 'Timing added successfully'
      });
    } else {
      res.status(400).json({
        success: false,
        message: 'Failed to add timing'
      });
    }
  } catch (error) {
    console.error('Add doctor timing error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
};

// Get doctor timings
exports.getTimings = async (req, res) => {
  try {
    const timings = await Doctor.getTimings(req.user.id);
    
    res.json({
      success: true,
      data: timings
    });
  } catch (error) {
    console.error('Get doctor timings error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
};

// Delete doctor timing
exports.deleteTiming = async (req, res) => {
  try {
    const { timingId } = req.params;

    const result = await Doctor.deleteTiming(timingId, req.user.id);

    if (result.affectedRows === 1) {
      res.json({
        success: true,
        message: 'Timing deleted successfully'
      });
    } else {
      res.status(404).json({
        success: false,
        message: 'Timing not found'
      });
    }
  } catch (error) {
    console.error('Delete doctor timing error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
};

// Get doctor dashboard stats
exports.getDashboardStats = async (req, res) => {
  try {
    const db = require('../config/database');
    
    // Get total appointments
    const [totalAppointments] = await db.execute(
      'SELECT COUNT(*) as total FROM appointments WHERE doctor_id = ?',
      [req.user.id]
    );

    // Get today's appointments
    const [todayAppointments] = await db.execute(
      'SELECT COUNT(*) as total FROM appointments WHERE doctor_id = ? AND appointment_date = CURDATE()',
      [req.user.id]
    );

    // Get monthly appointments
    const [monthlyAppointments] = await db.execute(
      'SELECT COUNT(*) as total FROM appointments WHERE doctor_id = ? AND MONTH(appointment_date) = MONTH(CURDATE()) AND YEAR(appointment_date) = YEAR(CURDATE())',
      [req.user.id]
    );

    // Get total revenue
    const [revenue] = await db.execute(
      `SELECT COALESCE(SUM(p.amount), 0) as total 
       FROM payments p 
       INNER JOIN appointments a ON p.appointment_id = a.id 
       WHERE a.doctor_id = ? AND p.status = 'completed'`,
      [req.user.id]
    );

    // Get rating stats
    const ratingStats = await Review.getRatingStats(req.user.id);

    res.json({
      success: true,
      data: {
        totalAppointments: totalAppointments[0].total,
        todayAppointments: todayAppointments[0].total,
        monthlyAppointments: monthlyAppointments[0].total,
        totalRevenue: revenue[0].total,
        ratingStats
      }
    });
  } catch (error) {
    console.error('Get dashboard stats error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
};

// Complete appointment with consultation details
exports.completeAppointmentWithDetails = async (req, res) => {
  try {
    const { appointmentId } = req.params;
    const { medicines, notes, followUpDays, followUpReason } = req.body;
    const doctorId = req.user.id;

    // Verify appointment exists and belongs to doctor
    const appointment = await Appointment.findById(appointmentId);
    if (!appointment || appointment.doctor_id !== doctorId) {
      return res.status(404).json({
        success: false,
        message: 'Appointment not found or not authorized'
      });
    }

    // Update appointment status to completed
    await Appointment.updateStatus(appointmentId, 'completed');

    // Import ConsultationDetail model
    const ConsultationDetail = require('../models/ConsultationDetail');

    // Check if consultation details already exist
    const existingDetails = await ConsultationDetail.findByAppointmentId(appointmentId);

    let consultationDetails;
    if (existingDetails) {
      consultationDetails = await ConsultationDetail.update(appointmentId, {
        medicines,
        notes,
        followUpDays,
        followUpReason
      });
    } else {
      consultationDetails = await ConsultationDetail.create({
        appointmentId,
        doctorId,
        patientId: appointment.patient_id,
        medicines,
        notes,
        followUpDays,
        followUpReason
      });
    }

    // Send email to patient with consultation details
    const patient = await require('../models/Patient').findById(appointment.patient_id);
    if (patient && patient.email) {
      await require('../services/emailService').sendConsultationDetails(
        patient.email,
        patient.name,
        appointment,
        consultationDetails
      );
    }

    res.json({
      success: true,
      message: 'Appointment completed with consultation details',
      data: consultationDetails
    });
  } catch (error) {
    console.error('Complete appointment error:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Server error'
    });
  }
};

// Get consultation details for an appointment
exports.getConsultationDetails = async (req, res) => {
  try {
    const { appointmentId } = req.params;
    const userId = req.user.id;

    // Verify user has access to this appointment
    const appointment = await Appointment.findById(appointmentId);
    if (!appointment) {
      return res.status(404).json({
        success: false,
        message: 'Appointment not found'
      });
    }

    if (appointment.doctor_id !== userId && appointment.patient_id !== userId) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to view this appointment'
      });
    }

    const ConsultationDetail = require('../models/ConsultationDetail');
    const details = await ConsultationDetail.findByAppointmentId(appointmentId);

    if (!details) {
      return res.json({
        success: true,
        data: null
      });
    }

    res.json({
      success: true,
      data: details
    });
  } catch (error) {
    console.error('Get consultation details error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
};