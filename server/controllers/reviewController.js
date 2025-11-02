const Review = require('../models/Review');
const db = require('../config/database');

// Add review
exports.addReview = async (req, res) => {
  try {
    const { doctorId, appointmentId, rating, comment } = req.body;

    if (!doctorId || !appointmentId || !rating) {
      return res.status(400).json({
        success: false,
        message: 'Doctor ID, appointment ID, and rating are required'
      });
    }

    if (rating < 1 || rating > 5) {
      return res.status(400).json({
        success: false,
        message: 'Rating must be between 1 and 5'
      });
    }

    // Check if appointment exists and belongs to patient
    const [appointment] = await db.execute(
      'SELECT * FROM appointments WHERE id = ? AND patient_id = ? AND status = "completed"',
      [appointmentId, req.user.id]
    );

    if (appointment.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Appointment not found or not completed'
      });
    }

    // Check if review already exists
    const existingReview = await Review.findByAppointmentId(appointmentId);
    if (existingReview) {
      return res.status(400).json({
        success: false,
        message: 'Review already exists for this appointment'
      });
    }

    // Add review
    const result = await Review.create({
      doctor_id: doctorId,
      patient_id: req.user.id,
      appointment_id: appointmentId,
      rating: parseInt(rating),
      comment: comment || ''
    });

    if (result.affectedRows === 1) {
      res.status(201).json({
        success: true,
        data: {
          reviewId: result.insertId
        },
        message: 'Review added successfully'
      });
    } else {
      res.status(400).json({
        success: false,
        message: 'Failed to add review'
      });
    }
  } catch (error) {
    console.error('Add review error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
};

// Get doctor reviews
exports.getDoctorReviews = async (req, res) => {
  try {
    const { doctorId } = req.params;

    const reviews = await Review.findByDoctorId(doctorId);
    const ratingStats = await Review.getRatingStats(doctorId);

    res.json({
      success: true,
      data: {
        reviews,
        ratingStats
      }
    });
  } catch (error) {
    console.error('Get doctor reviews error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
};

// Get patient reviews
exports.getPatientReviews = async (req, res) => {
  try {
    const reviews = await Review.findByPatientId(req.user.id);

    res.json({
      success: true,
      data: {
        reviews,
        total: reviews.length
      }
    });
  } catch (error) {
    console.error('Get patient reviews error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
};

// Update review
exports.updateReview = async (req, res) => {
  try {
    const { reviewId } = req.params;
    const { rating, comment } = req.body;

    // Check if review exists and belongs to patient
    const [review] = await db.execute(
      'SELECT * FROM reviews WHERE id = ? AND patient_id = ?',
      [reviewId, req.user.id]
    );

    if (review.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Review not found'
      });
    }

    const [result] = await db.execute(
      'UPDATE reviews SET rating = ?, comment = ? WHERE id = ?',
      [rating, comment, reviewId]
    );

    if (result.affectedRows === 1) {
      res.json({
        success: true,
        message: 'Review updated successfully'
      });
    } else {
      res.status(400).json({
        success: false,
        message: 'Failed to update review'
      });
    }
  } catch (error) {
    console.error('Update review error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
};

// Delete review
exports.deleteReview = async (req, res) => {
  try {
    const { reviewId } = req.params;

    // Check if review exists and belongs to patient
    const [review] = await db.execute(
      'SELECT * FROM reviews WHERE id = ? AND patient_id = ?',
      [reviewId, req.user.id]
    );

    if (review.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Review not found'
      });
    }

    const [result] = await db.execute(
      'DELETE FROM reviews WHERE id = ?',
      [reviewId]
    );

    if (result.affectedRows === 1) {
      res.json({
        success: true,
        message: 'Review deleted successfully'
      });
    } else {
      res.status(400).json({
        success: false,
        message: 'Failed to delete review'
      });
    }
  } catch (error) {
    console.error('Delete review error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
};