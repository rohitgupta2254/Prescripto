const express = require('express');
const { protect } = require('../middleware/authMiddleware');
const AppointmentController = require('../controllers/appointmentController');

const router = express.Router();

// Protect all routes
router.use(protect);

// Patient routes
router.post('/:appointmentId/request-cancellation', AppointmentController.requestCancellation);
router.get('/refund-history', AppointmentController.getRefundHistory);

// Doctor routes
router.post('/:appointmentId/cancel-by-doctor', AppointmentController.cancelByDoctor);
router.get('/doctor/pending-cancellations', AppointmentController.getPendingCancellations);
router.post('/cancellation/:requestId/approve', AppointmentController.approveCancellation);
router.post('/cancellation/:requestId/reject', AppointmentController.rejectCancellation);
router.get('/doctor/revenue-summary', AppointmentController.getDoctorRevenueSummary);

module.exports = router;