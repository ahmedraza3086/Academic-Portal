const db = require('../config/db');

class Student {
  // Create a new student
  static async create(studentData) {
    const {
      first_name,
      last_name,
      email,
      phone,
      date_of_birth,
      enrollment_year,
      major,
      password_hash,
      role
    } = studentData;
    const sql = `
      INSERT INTO student (first_name, last_name, email, phone, date_of_birth, enrollment_year, major, password_hash, role)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
    `;
    const [result] = await db.query(sql, [
      first_name,
      last_name,
      email,
      phone,
      date_of_birth,
      enrollment_year,
      major,
      password_hash || '',
      role || 'student'
    ]);
    return result.insertId;
  }

  // Find all students
  static async findAll() {
    const sql = 'SELECT * FROM student ORDER BY student_id DESC';
    const [rows] = await db.query(sql);
    return rows;
  }

  // Find a student by ID
  static async findById(studentId) {
    const sql = 'SELECT * FROM student WHERE student_id = ?';
    const [rows] = await db.query(sql, [studentId]);
    return rows[0];
  }

  // Update a student
  static async update(studentId, studentData) {
    const allowedFields = [
      'first_name',
      'last_name',
      'email',
      'phone',
      'date_of_birth',
      'enrollment_year',
      'major',
      'password_hash',
      'role'
    ];

    const fieldsToUpdate = Object.entries(studentData).filter(
      ([key, value]) => allowedFields.includes(key) && value !== undefined
    );

    if (fieldsToUpdate.length === 0) {
      return false;
    }

    const setClause = fieldsToUpdate.map(([key]) => `${key} = ?`).join(', ');
    const values = fieldsToUpdate.map(([, value]) => value);

    const sql = `
      UPDATE student
      SET ${setClause}
      WHERE student_id = ?
    `;
    const [result] = await db.query(sql, [...values, studentId]);
    return result.affectedRows > 0;
  }

  // Delete a student
  static async delete(studentId) {
    const sql = 'DELETE FROM student WHERE student_id = ?';
    const [result] = await db.query(sql, [studentId]);
    return result.affectedRows > 0;
  }
}

module.exports = Student;