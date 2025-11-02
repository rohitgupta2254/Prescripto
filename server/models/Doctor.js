const db = require('../config/database');

class Doctor {
  static async create(doctorData) {
    const { name, email, password, specialization, fees, address, phone, experience_years, qualifications } = doctorData;
    const [result] = await db.execute(
      `INSERT INTO doctors (name, email, password, specialization, fees, address, phone, experience_years, qualifications) 
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [name, email, password, specialization, fees, address, phone, experience_years, qualifications]
    );
    return result;
  }

  static async findByEmail(email) {
    const [rows] = await db.execute('SELECT * FROM doctors WHERE email = ?', [email]);
    return rows[0];
  }

  static async findById(id) {
    const [rows] = await db.execute(
      `SELECT id, name, email, specialization, fees, address, phone, experience_years, qualifications, profile_picture, created_at 
       FROM doctors WHERE id = ?`,
      [id]
    );
    return rows[0];
  }

  static async updateProfile(id, updateData) {
    const { name, specialization, fees, address, phone, experience_years, qualifications, profile_picture } = updateData;
    
    const fields = [];
    const values = [];

    if (name) { fields.push('name = ?'); values.push(name); }
    if (specialization) { fields.push('specialization = ?'); values.push(specialization); }
    if (fees) { fields.push('fees = ?'); values.push(fees); }
    if (address) { fields.push('address = ?'); values.push(address); }
    if (phone) { fields.push('phone = ?'); values.push(phone); }
    if (experience_years) { fields.push('experience_years = ?'); values.push(experience_years); }
    if (qualifications) { fields.push('qualifications = ?'); values.push(qualifications); }
    if (profile_picture) { fields.push('profile_picture = ?'); values.push(profile_picture); }

    if (fields.length === 0) {
      throw new Error('No fields to update');
    }

    values.push(id);
    const query = `UPDATE doctors SET ${fields.join(', ')} WHERE id = ?`;
    
    const [result] = await db.execute(query, values);
    return result;
  }

  static async getDoctorsByFilters(filters) {
    let query = `
      SELECT d.*, 
             AVG(r.rating) as average_rating,
             COUNT(r.id) as total_reviews
      FROM doctors d
      LEFT JOIN reviews r ON d.id = r.doctor_id
      WHERE 1=1
    `;
    let params = [];

    if (filters.specialization) {
      query += ' AND d.specialization LIKE ?';
      params.push(`%${filters.specialization}%`);
    }

    if (filters.location) {
      query += ' AND d.address LIKE ?';
      params.push(`%${filters.location}%`);
    }

    if (filters.minRating) {
      query += ' AND (SELECT AVG(rating) FROM reviews WHERE doctor_id = d.id) >= ?';
      params.push(parseFloat(filters.minRating));
    }

    if (filters.maxFees) {
      query += ' AND d.fees <= ?';
      params.push(parseFloat(filters.maxFees));
    }

    query += ' GROUP BY d.id ORDER BY average_rating DESC ';
    // query += ' GROUP BY d.id ORDER BY average_rating DESC NULLS LAST'   tempory change;

    const [rows] = await db.execute(query, params);
    return rows;
  }

  static async addTiming(doctorId, timingData) {
    const { day_of_week, start_time, end_time, slot_duration } = timingData;
    const [result] = await db.execute(
      'INSERT INTO doctor_timings (doctor_id, day_of_week, start_time, end_time, slot_duration) VALUES (?, ?, ?, ?, ?)',
      [doctorId, day_of_week, start_time, end_time, slot_duration || 30]
    );
    return result;
  }

  static async getTimings(doctorId) {
    const [rows] = await db.execute(
      'SELECT * FROM doctor_timings WHERE doctor_id = ? ORDER BY day_of_week, start_time',
      [doctorId]
    );
    return rows;
  }

  static async deleteTiming(timingId, doctorId) {
    const [result] = await db.execute(
      'DELETE FROM doctor_timings WHERE id = ? AND doctor_id = ?',
      [timingId, doctorId]
    );
    return result;
  }
}

module.exports = Doctor;