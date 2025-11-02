const twilio = require('twilio');

class SMSService {
  static async sendAppointmentReminder(appointment) {
    if (!process.env.TWILIO_ACCOUNT_SID || !process.env.TWILIO_AUTH_TOKEN) {
      console.log('Twilio credentials not configured, skipping SMS');
      return;
    }

    try {
      const client = twilio(process.env.TWILIO_ACCOUNT_SID, process.env.TWILIO_AUTH_TOKEN);

      const message = await client.messages.create({
        body: `Prescripto Reminder: You have an appointment with Dr. ${appointment.doctor_name} tomorrow at ${appointment.appointment_time}. Please arrive 10 minutes early.`,
        from: process.env.TWILIO_PHONE_NUMBER,
        to: appointment.patient_phone
      });

      console.log(`✅ SMS sent: ${message.sid}`);
      return true;
    } catch (error) {
      console.error('❌ SMS sending failed:', error.message);
      return false;
    }
  }

  static async sendAppointmentConfirmation(appointment) {
    if (!process.env.TWILIO_ACCOUNT_SID || !process.env.TWILIO_AUTH_TOKEN) {
      console.log('Twilio credentials not configured, skipping SMS');
      return;
    }

    try {
      const client = twilio(process.env.TWILIO_ACCOUNT_SID, process.env.TWILIO_AUTH_TOKEN);

      const message = await client.messages.create({
        body: `Prescripto Confirmation: Your appointment with Dr. ${appointment.doctor_name} on ${appointment.appointment_date} at ${appointment.appointment_time} is confirmed.`,
        from: process.env.TWILIO_PHONE_NUMBER,
        to: appointment.patient_phone
      });

      console.log(`✅ Confirmation SMS sent: ${message.sid}`);
      return true;
    } catch (error) {
      console.error('❌ Confirmation SMS failed:', error.message);
      return false;
    }
  }
}

module.exports = SMSService;