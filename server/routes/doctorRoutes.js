const express = require('express');
const { 
  getProfile, 
  updateProfile, 
  getAppointments, 
  updateAppointmentStatus,
  addTiming,
  getTimings,
  deleteTiming,
  getDashboardStats,
  completeAppointmentWithDetails,
  getConsultationDetails
} = require('../controllers/doctorController');
const { protect, authorize } = require('../middleware/authMiddleware');

const router = express.Router();

// Protect all routes
router.use(protect);
router.use(authorize('doctor'));

// Profile routes
router.route('/profile')
  .get(getProfile)
  .put(updateProfile);

// Appointment routes
router.route('/appointments')
  .get(getAppointments);

router.route('/appointments/:appointmentId/status')
  .put(updateAppointmentStatus);

// Consultation details routes
router.route('/appointments/:appointmentId/complete')
  .post(completeAppointmentWithDetails);

router.route('/appointments/:appointmentId/consultation')
  .get(getConsultationDetails);

// Timing routes
router.route('/timings')
  .get(getTimings)
  .post(addTiming);

router.route('/timings/:timingId')
  .delete(deleteTiming);

// Dashboard routes
router.get('/dashboard/stats', getDashboardStats);

module.exports = router;