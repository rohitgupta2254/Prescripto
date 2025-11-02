const express = require('express');
const { protect } = require('../middleware/authMiddleware');

const router = express.Router();

// Protect all routes
router.use(protect);

// Routes will be implemented based on specific needs
// Most appointment functionality is in doctor and patient routes

module.exports = router;