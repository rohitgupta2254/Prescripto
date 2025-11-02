const express = require('express');
const { 
  getNotifications, 
  markAsRead, 
  getReminders 
} = require('../controllers/notificationController');
const { protect } = require('../middleware/authMiddleware');

const router = express.Router();

// Protect all routes
router.use(protect);

router.get('/', getNotifications);
router.put('/:notificationId/read', markAsRead);
router.get('/reminders', getReminders);

module.exports = router;