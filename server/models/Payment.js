const db = require('../config/database');

class Payment {
  static async create(paymentData) {
    const { appointment_id, amount, payment_method, transaction_id, status } = paymentData;
    const [result] = await db.execute(
      'INSERT INTO payments (appointment_id, amount, payment_method, transaction_id, status) VALUES (?, ?, ?, ?, ?)',
      [appointment_id, amount, payment_method, transaction_id, status]
    );
    return result;
  }

  static async findByAppointmentId(appointmentId) {
    const [rows] = await db.execute(
      'SELECT id, appointment_id, amount, payment_method, transaction_id, status, payment_date FROM payments WHERE appointment_id = ?',
      [appointmentId]
    );
    return rows[0] || null;
  }

  static async updateStatus(transactionId, status) {
    const [result] = await db.execute(
      'UPDATE payments SET status = ? WHERE transaction_id = ?',
      [status, transactionId]
    );
    return result;
  }

  static async findByUserId(userId, userType) {
    let query = `
      SELECT p.*, a.appointment_date, a.appointment_time, 
             doc.name as doctor_name, pat.name as patient_name
      FROM payments p
      INNER JOIN appointments a ON p.appointment_id = a.id
    `;

    if (userType === 'patient') {
      query += ' INNER JOIN doctors doc ON a.doctor_id = doc.id WHERE a.patient_id = ?';
    } else {
      query += ' INNER JOIN patients pat ON a.patient_id = pat.id WHERE a.doctor_id = ?';
    }

    query += ' ORDER BY p.payment_date DESC';

    const [rows] = await db.execute(query, [userId]);
    return rows;
  }
}

module.exports = Payment;