const express = require('express');
const { 
  searchDoctors, 
  getDoctorProfile, 
  getAvailableSlots, 
  bookAppointment,
  getAppointments,
  cancelAppointment,
  getProfile,
  updateProfile
} = require('../controllers/patientController');
const { protect, authorize } = require('../middleware/authMiddleware');

const router = express.Router();

// Public routes
router.get('/doctors/search', searchDoctors);
router.get('/doctors/:doctorId', getDoctorProfile);
router.get('/doctors/:doctorId/slots', getAvailableSlots);

// Protect all other routes
router.use(protect);
router.use(authorize('patient'));

// Appointment routes
router.route('/appointments')
  .get(getAppointments)
  .post(bookAppointment);

router.route('/appointments/:appointmentId/cancel')
  .put(cancelAppointment);

// Profile routes
router.route('/profile')
  .get(getProfile)
  .put(updateProfile);

module.exports = router;