const db = require('../config/database');

class Review {
  static async create(reviewData) {
    const { doctor_id, patient_id, appointment_id, rating, comment } = reviewData;
    const [result] = await db.execute(
      'INSERT INTO reviews (doctor_id, patient_id, appointment_id, rating, comment) VALUES (?, ?, ?, ?, ?)',
      [doctor_id, patient_id, appointment_id, rating, comment]
    );
    return result;
  }

  static async findByDoctorId(doctorId) {
    const [rows] = await db.execute(
      `SELECT r.*, p.name as patient_name, p.profile_picture as patient_photo,
             a.appointment_date
       FROM reviews r
       INNER JOIN patients p ON r.patient_id = p.id
       INNER JOIN appointments a ON r.appointment_id = a.id
       WHERE r.doctor_id = ?
       ORDER BY r.created_at DESC`,
      [doctorId]
    );
    return rows;
  }

  static async findByAppointmentId(appointmentId) {
    const [rows] = await db.execute(
      'SELECT * FROM reviews WHERE appointment_id = ?',
      [appointmentId]
    );
    return rows[0];
  }

  static async getRatingStats(doctorId) {
    const [rows] = await db.execute(
      `SELECT 
         AVG(rating) as average_rating,
         COUNT(*) as total_reviews,
         SUM(CASE WHEN rating = 5 THEN 1 ELSE 0 END) as five_star,
         SUM(CASE WHEN rating = 4 THEN 1 ELSE 0 END) as four_star,
         SUM(CASE WHEN rating = 3 THEN 1 ELSE 0 END) as three_star,
         SUM(CASE WHEN rating = 2 THEN 1 ELSE 0 END) as two_star,
         SUM(CASE WHEN rating = 1 THEN 1 ELSE 0 END) as one_star
       FROM reviews 
       WHERE doctor_id = ?`,
      [doctorId]
    );
    return rows[0];
  }

  static async findByPatientId(patientId) {
    const [rows] = await db.execute(
      `SELECT r.*, d.name as doctor_name, d.specialization, d.profile_picture as doctor_photo,
             a.appointment_date
       FROM reviews r
       INNER JOIN doctors d ON r.doctor_id = d.id
       INNER JOIN appointments a ON r.appointment_id = a.id
       WHERE r.patient_id = ?
       ORDER BY r.created_at DESC`,
      [patientId]
    );
    return rows;
  }
}

module.exports = Review;