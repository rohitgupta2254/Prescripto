const db = require('../config/database');

class Patient {
  static async create(patientData) {
    const { name, email, password, phone, date_of_birth, address } = patientData;
    const [result] = await db.execute(
      `INSERT INTO patients (name, email, password, phone, date_of_birth, address) 
       VALUES (?, ?, ?, ?, ?, ?)`,
      [name, email, password, phone, date_of_birth, address]
    );
    return result;
  }

  static async findByEmail(email) {
    const [rows] = await db.execute('SELECT * FROM patients WHERE email = ?', [email]);
    return rows[0];
  }

  static async findById(id) {
    const [rows] = await db.execute(
      `SELECT id, name, email, phone, date_of_birth, address, created_at 
       FROM patients WHERE id = ?`,
      [id]
    );
    return rows[0];
  }

  static async updateProfile(id, updateData) {
    const { name, phone, date_of_birth, address } = updateData;
    
    const [result] = await db.execute(
      'UPDATE patients SET name = ?, phone = ?, date_of_birth = ?, address = ? WHERE id = ?',
      [name, phone, date_of_birth, address, id]
    );
    return result;
  }
}

module.exports = Patient;