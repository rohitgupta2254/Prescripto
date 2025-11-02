const db = require('../config/database');

// Get user notifications
exports.getNotifications = async (req, res) => {
  try {
    let query = '';
    let params = [];

    if (req.user.role === 'patient') {
      const [patient] = await db.execute('SELECT email FROM patients WHERE id = ?', [req.user.id]);
      query = 'SELECT * FROM email_notifications WHERE recipient_email = ? ORDER BY created_at DESC LIMIT 50';
      params = [patient[0].email];
    } else {
      const [doctor] = await db.execute('SELECT email FROM doctors WHERE id = ?', [req.user.id]);
      query = 'SELECT * FROM email_notifications WHERE recipient_email = ? ORDER BY created_at DESC LIMIT 50';
      params = [doctor[0].email];
    }

    const [notifications] = await db.execute(query, params);

    res.json({
      success: true,
      data: {
        notifications,
        total: notifications.length
      }
    });
  } catch (error) {
    console.error('Get notifications error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
};

// Mark notification as read
exports.markAsRead = async (req, res) => {
  try {
    const { notificationId } = req.params;

    const [result] = await db.execute(
      'UPDATE email_notifications SET status = "sent" WHERE id = ?',
      [notificationId]
    );

    if (result.affectedRows === 1) {
      res.json({
        success: true,
        message: 'Notification marked as read'
      });
    } else {
      res.status(404).json({
        success: false,
        message: 'Notification not found'
      });
    }
  } catch (error) {
    console.error('Mark notification as read error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
};

// Get appointment reminders
exports.getReminders = async (req, res) => {
  try {
    let query = '';
    let params = [];

    if (req.user.role === 'patient') {
      query = `
        SELECT ar.*, a.appointment_date, a.appointment_time, d.name as doctor_name
        FROM appointment_reminders ar
        INNER JOIN appointments a ON ar.appointment_id = a.id
        INNER JOIN doctors d ON a.doctor_id = d.id
        WHERE a.patient_id = ?
        ORDER BY ar.scheduled_time DESC
        LIMIT 50
      `;
      params = [req.user.id];
    } else {
      query = `
        SELECT ar.*, a.appointment_date, a.appointment_time, p.name as patient_name
        FROM appointment_reminders ar
        INNER JOIN appointments a ON ar.appointment_id = a.id
        INNER JOIN patients p ON a.patient_id = p.id
        WHERE a.doctor_id = ?
        ORDER BY ar.scheduled_time DESC
        LIMIT 50
      `;
      params = [req.user.id];
    }

    const [reminders] = await db.execute(query, params);

    res.json({
      success: true,
      data: {
        reminders,
        total: reminders.length
      }
    });
  } catch (error) {
    console.error('Get reminders error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
};