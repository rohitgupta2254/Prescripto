const cron = require('node-cron');
const db = require('../config/database');
const EmailService = require('../services/emailService');
const SMSService = require('../services/smsService');

console.log('⏰ Appointment reminder jobs starting...');

// Run every day at 8 AM - Send reminders for tomorrow's appointments
cron.schedule('0 8 * * *', async () => {
  console.log('🔔 Running appointment reminder job...');
  
  try {
    // Get appointments for tomorrow
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    const tomorrowDate = tomorrow.toISOString().split('T')[0];

    const [appointments] = await db.execute(`
      SELECT a.*, p.name as patient_name, p.email as patient_email, p.phone as patient_phone,
             d.name as doctor_name, d.email as doctor_email, d.specialization, d.fees, d.address
      FROM appointments a
      INNER JOIN patients p ON a.patient_id = p.id
      INNER JOIN doctors d ON a.doctor_id = d.id
      WHERE a.appointment_date = ? AND a.status = 'scheduled'
    `, [tomorrowDate]);

    console.log(`📅 Found ${appointments.length} appointments for reminder`);

    for (const appointment of appointments) {
      try {
        // Send email reminder
        await EmailService.sendAppointmentReminder(
          appointment,
          { name: appointment.patient_name, email: appointment.patient_email },
          { name: appointment.doctor_name, address: appointment.address }
        );

        // Send SMS reminder if phone number exists
        if (appointment.patient_phone) {
          await SMSService.sendAppointmentReminder(appointment);
        }

        // Log reminder in database
        await db.execute(
          'INSERT INTO appointment_reminders (appointment_id, reminder_type, scheduled_time, status, sent_at) VALUES (?, "email", NOW(), "sent", NOW())',
          [appointment.id]
        );

        if (appointment.patient_phone) {
          await db.execute(
            'INSERT INTO appointment_reminders (appointment_id, reminder_type, scheduled_time, status, sent_at) VALUES (?, "sms", NOW(), "sent", NOW())',
            [appointment.id]
          );
        }

        console.log(`✅ Reminders sent for appointment ${appointment.id}`);
      } catch (error) {
        console.error(`❌ Failed to send reminder for appointment ${appointment.id}:`, error);
        
        // Log failed reminder
        await db.execute(
          'INSERT INTO appointment_reminders (appointment_id, reminder_type, scheduled_time, status) VALUES (?, "email", NOW(), "failed")',
          [appointment.id]
        );
      }
    }

    console.log(`🎉 Reminder job completed. Processed ${appointments.length} appointments.`);
  } catch (error) {
    console.error('💥 Error in reminder job:', error);
  }
});

// Run every hour - Check for upcoming appointments in the next 2 hours
cron.schedule('0 * * * *', async () => {
  console.log('⏳ Checking for upcoming appointments...');
  
  try {
    const now = new Date();
    const twoHoursLater = new Date(now.getTime() + 2 * 60 * 60 * 1000);
    
    const [upcomingAppointments] = await db.execute(`
      SELECT a.*, p.name as patient_name, p.email as patient_email, p.phone as patient_phone,
             d.name as doctor_name, d.address
      FROM appointments a
      INNER JOIN patients p ON a.patient_id = p.id
      INNER JOIN doctors d ON a.doctor_id = d.id
      WHERE a.appointment_date = ? 
      AND a.appointment_time BETWEEN ? AND ?
      AND a.status = 'scheduled'
      AND a.id NOT IN (
        SELECT appointment_id FROM appointment_reminders 
        WHERE reminder_type = 'upcoming' AND DATE(scheduled_time) = CURDATE()
      )
    `, [
      now.toISOString().split('T')[0],
      now.toTimeString().slice(0, 5),
      twoHoursLater.toTimeString().slice(0, 5)
    ]);

    for (const appointment of upcomingAppointments) {
      try {
        // Send upcoming appointment notification
        await EmailService.sendEmail(
          appointment.patient_email,
          'Upcoming Appointment - Starting Soon',
          `
          <h2>Upcoming Appointment</h2>
          <p>Your appointment with Dr. ${appointment.doctor_name} is coming up in the next 2 hours.</p>
          <p><strong>Time:</strong> ${appointment.appointment_time}</p>
          <p>Please be prepared for your consultation.</p>
          `,
          'reminder'
        );

        // Log upcoming reminder
        await db.execute(
          'INSERT INTO appointment_reminders (appointment_id, reminder_type, scheduled_time, status, sent_at) VALUES (?, "upcoming", NOW(), "sent", NOW())',
          [appointment.id]
        );

        console.log(`✅ Upcoming reminder sent for appointment ${appointment.id}`);
      } catch (error) {
        console.error(`❌ Failed to send upcoming reminder for appointment ${appointment.id}:`, error);
      }
    }
  } catch (error) {
    console.error('💥 Error in upcoming appointments job:', error);
  }
});

// Run every day at 11 PM - Clean up old notifications and reminders
cron.schedule('0 23 * * *', async () => {
  console.log('🧹 Running cleanup job...');
  
  try {
    // Delete notifications older than 30 days
    await db.execute(
      'DELETE FROM email_notifications WHERE created_at < DATE_SUB(NOW(), INTERVAL 30 DAY)'
    );

    // Delete reminders older than 30 days
    await db.execute(
      'DELETE FROM appointment_reminders WHERE scheduled_time < DATE_SUB(NOW(), INTERVAL 30 DAY)'
    );

    console.log('✅ Cleanup job completed');
  } catch (error) {
    console.error('❌ Cleanup job failed:', error);
  }
});

console.log('✅ All reminder jobs scheduled successfully');