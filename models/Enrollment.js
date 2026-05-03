const db = require('../config/db');

class Enrollment {
  // Create a new enrollment
  static async create(enrollmentData) {
    const { student_id, course_id, enrollment_date, status } = enrollmentData;
    const sql = `
      INSERT INTO enrollment (student_id, course_id, enrollment_date, status)
      VALUES (?, ?, ?, ?)
    `;
    const [result] = await db.query(sql, [student_id, course_id, enrollment_date, status || 'active']);
    return result.insertId;
  }

  // Find all enrollments (with student and course details)
  static async findAll() {
    const sql = `
      SELECT e.*,
             s.first_name AS student_first, s.last_name AS student_last,
             c.course_code, c.course_name
      FROM enrollment e
      JOIN student s ON e.student_id = s.student_id
      JOIN course c ON e.course_id = c.course_id
      ORDER BY e.enrollment_date DESC
    `;
    const [rows] = await db.query(sql);
    return rows;
  }

  // Find enrollment by ID
  static async findById(enrollmentId) {
    const sql = `
      SELECT e.*,
             s.first_name AS student_first, s.last_name AS student_last,
             c.course_code, c.course_name
      FROM enrollment e
      JOIN student s ON e.student_id = s.student_id
      JOIN course c ON e.course_id = c.course_id
      WHERE e.enrollment_id = ?
    `;
    const [rows] = await db.query(sql, [enrollmentId]);
    return rows[0];
  }

  // Update enrollment (status, grade)
  static async update(enrollmentId, enrollmentData) {
    const { status, grade } = enrollmentData;
    const sql = `
      UPDATE enrollment
      SET status = ?, grade = ?
      WHERE enrollment_id = ?
    `;
    const [result] = await db.query(sql, [status, grade, enrollmentId]);
    return result.affectedRows > 0;
  }

  // Delete an enrollment
  static async delete(enrollmentId) {
    const sql = 'DELETE FROM enrollment WHERE enrollment_id = ?';
    const [result] = await db.query(sql, [enrollmentId]);
    return result.affectedRows > 0;
  }

  // Find enrollments by student ID
  static async findByStudent(studentId) {
    const sql = `
      SELECT e.*, c.course_code, c.course_name
      FROM enrollment e
      JOIN course c ON e.course_id = c.course_id
      WHERE e.student_id = ?
    `;
    const [rows] = await db.query(sql, [studentId]);
    return rows;
  }

  // Find enrollments by course ID
  static async findByCourse(courseId) {
    const sql = `
      SELECT e.*, s.first_name AS student_first, s.last_name AS student_last
      FROM enrollment e
      JOIN student s ON e.student_id = s.student_id
      WHERE e.course_id = ?
    `;
    const [rows] = await db.query(sql, [courseId]);
    return rows;
  }
}

module.exports = Enrollment;