const db = require('../config/database');

class CancellationRequest {
  static async create(cancellationData) {
    const { appointment_id, requested_by, reason, refund_amount } = cancellationData;
    const [result] = await db.execute(
      `INSERT INTO cancellation_requests (appointment_id, requested_by, reason, refund_amount, status) 
       VALUES (?, ?, ?, ?, 'pending')`,
      [appointment_id, requested_by, reason, refund_amount]
    );
    return result;
  }

  static async findById(id) {
    const [rows] = await db.execute(
      `SELECT cr.*, a.doctor_id, a.patient_id, a.appointment_date, a.appointment_time,
              d.name as doctor_name, d.email as doctor_email,
              p.name as patient_name, p.email as patient_email,
              pay.amount as payment_amount, pay.transaction_id
       FROM cancellation_requests cr
       INNER JOIN appointments a ON cr.appointment_id = a.id
       INNER JOIN doctors d ON a.doctor_id = d.id
       INNER JOIN patients p ON a.patient_id = p.id
       LEFT JOIN payments pay ON a.id = pay.appointment_id
       WHERE cr.id = ?`,
      [id]
    );
    return rows[0];
  }

  static async findByAppointmentId(appointmentId) {
    const [rows] = await db.execute(
      'SELECT * FROM cancellation_requests WHERE appointment_id = ? ORDER BY requested_at DESC LIMIT 1',
      [appointmentId]
    );
    return rows[0];
  }

  static async getPendingRequests(doctorId) {
    const [rows] = await db.execute(
      `SELECT cr.*, a.doctor_id, a.patient_id, a.appointment_date, a.appointment_time,
              p.name as patient_name, p.email as patient_email, p.phone as patient_phone,
              pay.amount as payment_amount, pay.transaction_id
       FROM cancellation_requests cr
       INNER JOIN appointments a ON cr.appointment_id = a.id
       INNER JOIN patients p ON a.patient_id = p.id
       LEFT JOIN payments pay ON a.id = pay.appointment_id
       WHERE a.doctor_id = ? AND cr.status = 'pending'
       ORDER BY cr.requested_at DESC`,
      [doctorId]
    );
    return rows;
  }

  static async updateStatus(id, status, notes = null, refundTransactionId = null) {
    const [result] = await db.execute(
      `UPDATE cancellation_requests 
       SET status = ?, approved_at = CURRENT_TIMESTAMP, notes = ?, refund_transaction_id = ?
       WHERE id = ?`,
      [status, notes, refundTransactionId, id]
    );
    return result;
  }

  static async getRefundHistory(userType, userId) {
    let query = `
      SELECT cr.*, a.appointment_date, a.appointment_time,
             d.name as doctor_name, p.name as patient_name
      FROM cancellation_requests cr
      INNER JOIN appointments a ON cr.appointment_id = a.id
      INNER JOIN doctors d ON a.doctor_id = d.id
      INNER JOIN patients p ON a.patient_id = p.id
      WHERE cr.status IN ('approved', 'rejected')
    `;

    if (userType === 'patient') {
      query += ` AND a.patient_id = ?`;
    } else {
      query += ` AND a.doctor_id = ?`;
    }

    query += ` ORDER BY cr.approved_at DESC`;

    const [rows] = await db.execute(query, [userId]);
    return rows;
  }
}

module.exports = CancellationRequest;
