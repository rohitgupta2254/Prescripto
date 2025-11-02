const nodemailer = require('nodemailer');
const db = require('../config/database');

// Create transporter
const createTransporter = () => {
  return nodemailer.createTransporter({
    service: 'gmail',
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS
    }
  });
};

class EmailService {
  static async sendAppointmentConfirmation(appointment, patient, doctor) {
    const subject = `Appointment Confirmation - Dr. ${doctor.name}`;
    const html = `
      <!DOCTYPE html>
      <html>
      <head>
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background: #3498db; color: white; padding: 20px; text-align: center; border-radius: 5px 5px 0 0; }
          .content { background: #f9f9f9; padding: 20px; border-radius: 0 0 5px 5px; }
          .details { background: white; padding: 15px; border-radius: 5px; margin: 15px 0; border-left: 4px solid #3498db; }
          .footer { text-align: center; margin-top: 20px; color: #666; font-size: 12px; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>Appointment Confirmed! 🎉</h1>
          </div>
          <div class="content">
            <p>Dear <strong>${patient.name}</strong>,</p>
            <p>Your appointment has been successfully booked with <strong>Dr. ${doctor.name}</strong>.</p>
            
            <div class="details">
              <h3>Appointment Details</h3>
              <p><strong>Date:</strong> ${new Date(appointment.appointment_date).toDateString()}</p>
              <p><strong>Time:</strong> ${appointment.appointment_time}</p>
              <p><strong>Doctor:</strong> Dr. ${doctor.name}</p>
              <p><strong>Specialization:</strong> ${doctor.specialization}</p>
              <p><strong>Consultation Fee:</strong> $${doctor.fees}</p>
              <p><strong>Address:</strong> ${doctor.address}</p>
              ${appointment.consultation_type === 'video' ? '<p><strong>Consultation Type:</strong> Video Call</p>' : ''}
            </div>
            
            <p><strong>Important Notes:</strong></p>
            <ul>
              <li>Please arrive 10-15 minutes before your scheduled time</li>
              <li>Carry your ID proof and any previous medical records</li>
              <li>In case of emergency, contact the clinic directly</li>
            </ul>
            
            <p>You can view and manage your appointments through your Prescripto dashboard.</p>
            
            <p>Best regards,<br><strong>Prescripto Team</strong></p>
          </div>
          <div class="footer">
            <p>This is an automated message. Please do not reply to this email.</p>
          </div>
        </div>
      </body>
      </html>
    `;

    await this.sendEmail(patient.email, subject, html, 'appointment_confirmation');
  }

  static async sendAppointmentReminder(appointment, patient, doctor) {
    const subject = `Appointment Reminder - Dr. ${doctor.name}`;
    const html = `
      <!DOCTYPE html>
      <html>
      <head>
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background: #f39c12; color: white; padding: 20px; text-align: center; border-radius: 5px 5px 0 0; }
          .content { background: #f9f9f9; padding: 20px; border-radius: 0 0 5px 5px; }
          .details { background: white; padding: 15px; border-radius: 5px; margin: 15px 0; border-left: 4px solid #f39c12; }
          .footer { text-align: center; margin-top: 20px; color: #666; font-size: 12px; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>Appointment Reminder ⏰</h1>
          </div>
          <div class="content">
            <p>Dear <strong>${patient.name}</strong>,</p>
            <p>This is a friendly reminder for your upcoming appointment with <strong>Dr. ${doctor.name}</strong>.</p>
            
            <div class="details">
              <h3>Appointment Details</h3>
              <p><strong>Date:</strong> ${new Date(appointment.appointment_date).toDateString()} (Tomorrow)</p>
              <p><strong>Time:</strong> ${appointment.appointment_time}</p>
              <p><strong>Doctor:</strong> Dr. ${doctor.name}</p>
              <p><strong>Specialization:</strong> ${doctor.specialization}</p>
              <p><strong>Address:</strong> ${doctor.address}</p>
            </div>
            
            <p><strong>Please remember:</strong></p>
            <ul>
              <li>Arrive 10-15 minutes early</li>
              <li>Bring your ID and insurance card if applicable</li>
              <li>Carry any relevant medical reports or medications</li>
            </ul>
            
            <p>If you need to reschedule or cancel, please do so at least 2 hours in advance.</p>
            
            <p>Best regards,<br><strong>Prescripto Team</strong></p>
          </div>
          <div class="footer">
            <p>This is an automated reminder. Please do not reply to this email.</p>
          </div>
        </div>
      </body>
      </html>
    `;

    await this.sendEmail(patient.email, subject, html, 'reminder');
  }

  static async sendPaymentReceipt(payment, appointment, patient, doctor) {
    const subject = `Payment Receipt - Appointment with Dr. ${doctor.name}`;
    const html = `
      <!DOCTYPE html>
      <html>
      <head>
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background: #27ae60; color: white; padding: 20px; text-align: center; border-radius: 5px 5px 0 0; }
          .content { background: #f9f9f9; padding: 20px; border-radius: 0 0 5px 5px; }
          .receipt { background: white; padding: 20px; border-radius: 5px; margin: 15px 0; border: 2px solid #27ae60; }
          .footer { text-align: center; margin-top: 20px; color: #666; font-size: 12px; }
          .amount { font-size: 24px; font-weight: bold; color: #27ae60; text-align: center; margin: 10px 0; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>Payment Receipt ✅</h1>
          </div>
          <div class="content">
            <p>Dear <strong>${patient.name}</strong>,</p>
            <p>Thank you for your payment. Here's your receipt for the appointment with <strong>Dr. ${doctor.name}</strong>.</p>
            
            <div class="receipt">
              <h3>Payment Details</h3>
              <div class="amount">$${payment.amount}</div>
              <p><strong>Transaction ID:</strong> ${payment.transaction_id}</p>
              <p><strong>Payment Date:</strong> ${new Date(payment.payment_date).toLocaleString()}</p>
              <p><strong>Payment Method:</strong> ${payment.payment_method}</p>
              <p><strong>Status:</strong> <span style="color: #27ae60; font-weight: bold;">Completed</span></p>
              
              <hr style="margin: 20px 0;">
              
              <h4>Appointment Information</h4>
              <p><strong>Date:</strong> ${new Date(appointment.appointment_date).toDateString()}</p>
              <p><strong>Time:</strong> ${appointment.appointment_time}</p>
              <p><strong>Doctor:</strong> Dr. ${doctor.name}</p>
              <p><strong>Specialization:</strong> ${doctor.specialization}</p>
            </div>
            
            <p>This receipt confirms your payment has been processed successfully.</p>
            <p>You can view this receipt anytime in your Prescripto dashboard.</p>
            
            <p>Best regards,<br><strong>Prescripto Team</strong></p>
          </div>
          <div class="footer">
            <p>This is an automated receipt. Please do not reply to this email.</p>
          </div>
        </div>
      </body>
      </html>
    `;

    await this.sendEmail(patient.email, subject, html, 'payment_receipt');
  }

  static async sendAppointmentCancellation(appointment, patient, doctor) {
    const subject = `Appointment Cancelled - Dr. ${doctor.name}`;
    const html = `
      <!DOCTYPE html>
      <html>
      <head>
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background: #e74c3c; color: white; padding: 20px; text-align: center; border-radius: 5px 5px 0 0; }
          .content { background: #f9f9f9; padding: 20px; border-radius: 0 0 5px 5px; }
          .details { background: white; padding: 15px; border-radius: 5px; margin: 15px 0; border-left: 4px solid #e74c3c; }
          .footer { text-align: center; margin-top: 20px; color: #666; font-size: 12px; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>Appointment Cancelled</h1>
          </div>
          <div class="content">
            <p>Dear <strong>${patient.name}</strong>,</p>
            <p>Your appointment with <strong>Dr. ${doctor.name}</strong> has been cancelled.</p>
            
            <div class="details">
              <h3>Cancelled Appointment Details</h3>
              <p><strong>Date:</strong> ${new Date(appointment.appointment_date).toDateString()}</p>
              <p><strong>Time:</strong> ${appointment.appointment_time}</p>
              <p><strong>Doctor:</strong> Dr. ${doctor.name}</p>
              <p><strong>Specialization:</strong> ${doctor.specialization}</p>
            </div>
            
            <p>If this was a mistake or you'd like to reschedule, please visit your Prescripto dashboard.</p>
            <p>If you have any questions, feel free to contact our support team.</p>
            
            <p>Best regards,<br><strong>Prescripto Team</strong></p>
          </div>
          <div class="footer">
            <p>This is an automated message. Please do not reply to this email.</p>
          </div>
        </div>
      </body>
      </html>
    `;

    await this.sendEmail(patient.email, subject, html, 'cancellation');
  }

  static async sendEmail(to, subject, html, type) {
    try {
      const transporter = createTransporter();

      const mailOptions = {
        from: `"Prescripto" <${process.env.EMAIL_USER}>`,
        to,
        subject,
        html
      };

      await transporter.sendMail(mailOptions);
      
      // Log email in database
      await db.execute(
        'INSERT INTO email_notifications (recipient_email, subject, content, type, status, sent_at) VALUES (?, ?, ?, ?, "sent", NOW())',
        [to, subject, html, type]
      );

      console.log(`✅ Email sent to ${to} (${type})`);
      return true;
    } catch (error) {
      console.error('❌ Error sending email:', error);
      
      // Log failed email
      await db.execute(
        'INSERT INTO email_notifications (recipient_email, subject, content, type, status) VALUES (?, ?, ?, ?, "failed")',
        [to, subject, html, type]
      );
      
      return false;
    }
  }
}

module.exports = EmailService;