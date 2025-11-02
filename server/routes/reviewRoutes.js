const express = require('express');
const { 
  addReview, 
  getDoctorReviews, 
  getPatientReviews,
  updateReview,
  deleteReview
} = require('../controllers/reviewController');
const { protect } = require('../middleware/authMiddleware');

const router = express.Router();

// Public routes
router.get('/doctor/:doctorId', getDoctorReviews);

// Protect all other routes
router.use(protect);

router.route('/')
  .post(addReview)
  .get(getPatientReviews);

router.route('/:reviewId')
  .put(updateReview)
  .delete(deleteReview);

module.exports = router;