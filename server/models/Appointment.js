const db = require('../config/database');

class Appointment {
  static async create(appointmentData) {
    const { doctor_id, patient_id, appointment_date, appointment_time, consultation_type, symptoms } = appointmentData;
    const [result] = await db.execute(
      `INSERT INTO appointments (doctor_id, patient_id, appointment_date, appointment_time, consultation_type, symptoms) 
       VALUES (?, ?, ?, ?, ?, ?)`,
      [doctor_id, patient_id, appointment_date, appointment_time, consultation_type, symptoms]
    );
    return result;
  }

  static async findById(id) {
    const [rows] = await db.execute(
      `SELECT a.*, d.name as doctor_name, d.specialization, d.fees, d.address as doctor_address,
              p.name as patient_name, p.email as patient_email, p.phone as patient_phone
       FROM appointments a
       INNER JOIN doctors d ON a.doctor_id = d.id
       INNER JOIN patients p ON a.patient_id = p.id
       WHERE a.id = ?`,
      [id]
    );
    return rows[0];
  }

  static async findByDoctorId(doctorId, status = null) {
    let query = `
      SELECT a.*, p.name as patient_name, p.phone as patient_phone, p.email as patient_email
      FROM appointments a
      INNER JOIN patients p ON a.patient_id = p.id
      WHERE a.doctor_id = ?
    `;
    const params = [doctorId];

    if (status) {
      query += ' AND a.status = ?';
      params.push(status);
    }

    query += ' ORDER BY a.appointment_date DESC, a.appointment_time DESC';

    const [rows] = await db.execute(query, params);
    return rows;
  }

  static async findByPatientId(patientId, status = null) {
    let query = `
      SELECT a.*, d.name as doctor_name, d.specialization, d.fees, d.address as doctor_address,
             d.phone as doctor_phone, d.profile_picture as doctor_photo
      FROM appointments a
      INNER JOIN doctors d ON a.doctor_id = d.id
      WHERE a.patient_id = ?
    `;
    const params = [patientId];

    if (status) {
      query += ' AND a.status = ?';
      params.push(status);
    }

    query += ' ORDER BY a.appointment_date DESC, a.appointment_time DESC';

    const [rows] = await db.execute(query, params);
    return rows;
  }

  static async updateStatus(appointmentId, status) {
    const [result] = await db.execute(
      'UPDATE appointments SET status = ? WHERE id = ?',
      [status, appointmentId]
    );
    return result;
  }

  static async getAvailableSlots(doctorId, date) {
    // Get doctor's timings for the specific day
    const dayNames = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
    const targetDate = new Date(date);
    const dayOfWeek = dayNames[targetDate.getDay()];

    const [timings] = await db.execute(
      'SELECT * FROM doctor_timings WHERE doctor_id = ? AND day_of_week = ?',
      [doctorId, dayOfWeek]
    );

    if (timings.length === 0) {
      return { slots: [], timing: null, bookedTimes: [] };
    }

    const timing = timings[0];
    const slotDuration = timing.slot_duration || 30; // minutes

    // Get booked appointments for that date
    const [bookedAppointments] = await db.execute(
      'SELECT appointment_time FROM appointments WHERE doctor_id = ? AND appointment_date = ? AND status IN ("scheduled", "completed")',
      [doctorId, date]
    );

    // Normalize booked times to "HH:MM" so they match generated timeString format
    const bookedTimes = bookedAppointments.map(apt => {
      // appointment_time may be stored as "HH:MM:SS" or "HH:MM"
      if (!apt.appointment_time) return '';
      return apt.appointment_time.slice(0,5);
    });

    // Generate available slots
    const availableSlots = [];
    const startTime = new Date(`${date}T${timing.start_time}`);
    const endTime = new Date(`${date}T${timing.end_time}`);

    let currentTime = new Date(startTime);

    while (currentTime < endTime) {
      const timeString = currentTime.toTimeString().slice(0, 5);
      
      if (!bookedTimes.includes(timeString)) {
        availableSlots.push(timeString);
      }

      currentTime.setMinutes(currentTime.getMinutes() + slotDuration);
    }

    return { slots: availableSlots, timing: { start_time: timing.start_time, end_time: timing.end_time, slot_duration: slotDuration }, bookedTimes };
  }

  static async checkSlotAvailability(doctorId, date, time) {
    const [existing] = await db.execute(
      'SELECT id FROM appointments WHERE doctor_id = ? AND appointment_date = ? AND appointment_time = ? AND status IN ("scheduled", "completed")',
      [doctorId, date, time]
    );
    return existing.length === 0;
  }
}

module.exports = Appointment;