const db = require('../config/db');

class Faculty {
  // Create a new faculty member
  static async create(facultyData) {
    const {
      first_name,
      last_name,
      email,
      phone,
      department,
      hire_date,
      password_hash,
      role
    } = facultyData;
    const sql = `
      INSERT INTO faculty (first_name, last_name, email, phone, department, hire_date, password_hash, role)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?)
    `;
    const [result] = await db.query(sql, [
      first_name,
      last_name,
      email,
      phone,
      department,
      hire_date,
      password_hash || '',
      role || 'faculty'
    ]);
    return result.insertId;
  }

  // Find all faculty members
  static async findAll() {
    const sql = 'SELECT * FROM faculty ORDER BY faculty_id DESC';
    const [rows] = await db.query(sql);
    return rows;
  }

  // Find a faculty member by ID
  static async findById(facultyId) {
    const sql = 'SELECT * FROM faculty WHERE faculty_id = ?';
    const [rows] = await db.query(sql, [facultyId]);
    return rows[0];
  }

  // Update a faculty member
  static async update(facultyId, facultyData) {
    const allowedFields = [
      'first_name',
      'last_name',
      'email',
      'phone',
      'department',
      'hire_date',
      'password_hash',
      'role'
    ];

    const fieldsToUpdate = Object.entries(facultyData).filter(
      ([key, value]) => allowedFields.includes(key) && value !== undefined
    );

    if (fieldsToUpdate.length === 0) {
      return false;
    }

    const setClause = fieldsToUpdate.map(([key]) => `${key} = ?`).join(', ');
    const values = fieldsToUpdate.map(([, value]) => value);

    const sql = `
      UPDATE faculty
      SET ${setClause}
      WHERE faculty_id = ?
    `;
    const [result] = await db.query(sql, [...values, facultyId]);
    return result.affectedRows > 0;
  }

  // Delete a faculty member
  static async delete(facultyId) {
    const sql = 'DELETE FROM faculty WHERE faculty_id = ?';
    const [result] = await db.query(sql, [facultyId]);
    return result.affectedRows > 0;
  }
}

module.exports = Faculty;