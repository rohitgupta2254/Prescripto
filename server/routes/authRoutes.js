const express = require('express');
const { 
  registerDoctor, 
  loginDoctor, 
  registerPatient, 
  loginPatient,
  getMe 
} = require('../controllers/authController');
const { protect } = require('../middleware/authMiddleware');

const router = express.Router();

// Doctor routes
router.post('/doctor/register', registerDoctor);
router.post('/doctor/login', loginDoctor);

// Patient routes
router.post('/patient/register', registerPatient);
router.post('/patient/login', loginPatient);

// Common routes
router.get('/me', protect, getMe);

module.exports = router;