const Doctor = require('../models/Doctor');
const Appointment = require('../models/Appointment');
const Review = require('../models/Review');

// Search doctors
exports.searchDoctors = async (req, res) => {
  try {
    const filters = {
      specialization: req.query.specialization,
      location: req.query.location,
      minRating: req.query.minRating,
      maxFees: req.query.maxFees
    };

    const doctors = await Doctor.getDoctorsByFilters(filters);

    res.json({
      success: true,
      data: {
        doctors,
        total: doctors.length
      }
    });
  } catch (error) {
    console.error('Search doctors error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
};

// Get doctor profile for patient
exports.getDoctorProfile = async (req, res) => {
  try {
    const { doctorId } = req.params;

    const doctor = await Doctor.findById(doctorId);
    if (!doctor) {
      return res.status(404).json({
        success: false,
        message: 'Doctor not found'
      });
    }

    // Get doctor timings
    const timings = await Doctor.getTimings(doctorId);

    // Get rating stats and reviews
    const ratingStats = await Review.getRatingStats(doctorId);
    const reviews = await Review.findByDoctorId(doctorId);

    res.json({
      success: true,
      data: {
        ...doctor,
        timings,
        ratingStats,
        reviews
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

// Get available slots
exports.getAvailableSlots = async (req, res) => {
  try {
    const { doctorId } = req.params;
    const { date } = req.query;

    if (!date) {
      return res.status(400).json({
        success: false,
        message: 'Date is required'
      });
    }

    const slots = await Appointment.getAvailableSlots(doctorId, date);

    res.json({
      success: true,
      data: {
        slots,
        date
      }
    });
  } catch (error) {
    console.error('Get available slots error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
};

// Book appointment
exports.bookAppointment = async (req, res) => {
  try {
    const { doctorId, appointment_date, appointment_time, consultation_type, symptoms } = req.body;

    if (!doctorId || !appointment_date || !appointment_time) {
      return res.status(400).json({
        success: false,
        message: 'Please provide doctor, date, and time'
      });
    }

    // Check slot availability
    const isAvailable = await Appointment.checkSlotAvailability(doctorId, appointment_date, appointment_time);
    if (!isAvailable) {
      return res.status(400).json({
        success: false,
        message: 'Selected slot is no longer available'
      });
    }

    // Create appointment
    const result = await Appointment.create({
      doctor_id: doctorId,
      patient_id: req.user.id,
      appointment_date,
      appointment_time,
      consultation_type: consultation_type || 'in_person',
      symptoms: symptoms || ''
    });

    if (result.affectedRows === 1) {
      const appointment = await Appointment.findById(result.insertId);

      // Send confirmation email (in background)
      const EmailService = require('../services/emailService');
      const doctor = await Doctor.findById(doctorId);
      const patient = await require('../models/Patient').findById(req.user.id);

      EmailService.sendAppointmentConfirmation(appointment, patient, doctor)
        .catch(err => console.error('Email sending failed:', err));

      res.status(201).json({
        success: true,
        data: appointment,
        message: 'Appointment booked successfully'
      });
    } else {
      res.status(400).json({
        success: false,
        message: 'Failed to book appointment'
      });
    }
  } catch (error) {
    console.error('Book appointment error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
};

// Get patient appointments
exports.getAppointments = async (req, res) => {
  try {
    const { status } = req.query;
    const appointments = await Appointment.findByPatientId(req.user.id, status);

    res.json({
      success: true,
      data: {
        appointments,
        total: appointments.length
      }
    });
  } catch (error) {
    console.error('Get patient appointments error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
};

// Cancel appointment
exports.cancelAppointment = async (req, res) => {
  try {
    const { appointmentId } = req.params;

    const appointment = await Appointment.findById(appointmentId);
    if (!appointment) {
      return res.status(404).json({
        success: false,
        message: 'Appointment not found'
      });
    }

    if (appointment.patient_id !== req.user.id) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to cancel this appointment'
      });
    }

    // Check if appointment can be cancelled (at least 2 hours before)
    const appointmentDateTime = new Date(`${appointment.appointment_date}T${appointment.appointment_time}`);
    const now = new Date();
    const timeDiff = appointmentDateTime - now;
    const hoursDiff = timeDiff / (1000 * 60 * 60);

    if (hoursDiff < 2) {
      return res.status(400).json({
        success: false,
        message: 'Appointments can only be cancelled at least 2 hours in advance'
      });
    }

    const result = await Appointment.updateStatus(appointmentId, 'cancelled');

    if (result.affectedRows === 1) {
      res.json({
        success: true,
        message: 'Appointment cancelled successfully'
      });
    } else {
      res.status(400).json({
        success: false,
        message: 'Failed to cancel appointment'
      });
    }
  } catch (error) {
    console.error('Cancel appointment error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
};

// Get patient profile
exports.getProfile = async (req, res) => {
  try {
    const patient = await require('../models/Patient').findById(req.user.id);
    
    if (!patient) {
      return res.status(404).json({
        success: false,
        message: 'Patient not found'
      });
    }

    res.json({
      success: true,
      data: patient
    });
  } catch (error) {
    console.error('Get patient profile error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
};

// Update patient profile
exports.updateProfile = async (req, res) => {
  try {
    const { name, phone, date_of_birth, address } = req.body;

    const result = await require('../models/Patient').updateProfile(req.user.id, {
      name,
      phone,
      date_of_birth,
      address
    });

    if (result.affectedRows === 1) {
      const updatedPatient = await require('../models/Patient').findById(req.user.id);
      res.json({
        success: true,
        data: updatedPatient,
        message: 'Profile updated successfully'
      });
    } else {
      res.status(400).json({
        success: false,
        message: 'Failed to update profile'
      });
    }
  } catch (error) {
    console.error('Update patient profile error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
};