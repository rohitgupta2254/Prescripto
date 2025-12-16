const db = require('../config/database');

class ConsultationDetail {
  static async create(data) {
    const {
      appointmentId,
      doctorId,
      patientId,
      medicines,
      notes,
      followUpDays,
      followUpReason
    } = data;

    // Calculate follow-up date
    const followUpDate = followUpDays ? 
      new Date(Date.now() + followUpDays * 24 * 60 * 60 * 1000).toISOString().split('T')[0] : 
      null;

    const query = `
      INSERT INTO consultation_details 
      (appointment_id, doctor_id, patient_id, medicines, notes, follow_up_days, follow_up_date, follow_up_reason)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?)
    `;

    const [result] = await db.execute(query, [
      appointmentId,
      doctorId,
      patientId,
      medicines,
      notes,
      followUpDays || null,
      followUpDate,
      followUpReason || null
    ]);

    return { id: result.insertId, ...data, followUpDate };
  }

  static async findByAppointmentId(appointmentId) {
    const query = `
      SELECT * FROM consultation_details 
      WHERE appointment_id = ?
    `;

    const [rows] = await db.execute(query, [appointmentId]);
    return rows.length > 0 ? rows[0] : null;
  }

  static async findByDoctorId(doctorId) {
    const query = `
      SELECT cd.*, a.appointment_date, a.appointment_time, p.name as patient_name
      FROM consultation_details cd
      JOIN appointments a ON cd.appointment_id = a.id
      JOIN patients p ON cd.patient_id = p.id
      WHERE cd.doctor_id = ?
      ORDER BY a.appointment_date DESC, a.appointment_time DESC
    `;

    const [rows] = await db.execute(query, [doctorId]);
    return rows;
  }

  static async findByPatientId(patientId) {
    const query = `
      SELECT cd.*, a.appointment_date, a.appointment_time, d.name as doctor_name
      FROM consultation_details cd
      JOIN appointments a ON cd.appointment_id = a.id
      JOIN doctors d ON cd.doctor_id = d.id
      WHERE cd.patient_id = ?
      ORDER BY a.appointment_date DESC, a.appointment_time DESC
    `;

    const [rows] = await db.execute(query, [patientId]);
    return rows;
  }

  static async update(appointmentId, data) {
    const {
      medicines,
      notes,
      followUpDays,
      followUpReason
    } = data;

    const followUpDate = followUpDays ? 
      new Date(Date.now() + followUpDays * 24 * 60 * 60 * 1000).toISOString().split('T')[0] : 
      null;

    const query = `
      UPDATE consultation_details 
      SET medicines = ?, notes = ?, follow_up_days = ?, follow_up_date = ?, follow_up_reason = ?
      WHERE appointment_id = ?
    `;

    await db.execute(query, [
      medicines,
      notes,
      followUpDays || null,
      followUpDate,
      followUpReason || null,
      appointmentId
    ]);

    return this.findByAppointmentId(appointmentId);
  }
}

module.exports = ConsultationDetail;
