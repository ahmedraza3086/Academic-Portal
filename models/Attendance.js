const db = require('../config/db');

class Attendance {
  // Create a new attendance record
  static async create(attendanceData) {
    const { student_id, course_id, attendance_date, status, remarks } = attendanceData;
    const sql = `
      INSERT INTO attendance (student_id, course_id, attendance_date, status, remarks)
      VALUES (?, ?, ?, ?, ?)
      ON DUPLICATE KEY UPDATE status = VALUES(status), remarks = VALUES(remarks)
    `;
    const [result] = await db.query(sql, [student_id, course_id, attendance_date, status, remarks]);
    return result.insertId;
  }

  // Find all attendance records
  static async findAll() {
    const sql = `
      SELECT a.*,
             s.first_name AS student_first, s.last_name AS student_last,
             c.course_code, c.course_name
      FROM attendance a
      JOIN student s ON a.student_id = s.student_id
      JOIN course c ON a.course_id = c.course_id
      ORDER BY a.attendance_date DESC
    `;
    const [rows] = await db.query(sql);
    return rows;
  }

  // Find attendance by ID
  static async findById(attendanceId) {
    const sql = `
      SELECT a.*,
             s.first_name AS student_first, s.last_name AS student_last,
             c.course_code, c.course_name
      FROM attendance a
      JOIN student s ON a.student_id = s.student_id
      JOIN course c ON a.course_id = c.course_id
      WHERE a.attendance_id = ?
    `;
    const [rows] = await db.query(sql, [attendanceId]);
    return rows[0];
  }

  // Update attendance record
  static async update(attendanceId, attendanceData) {
    const allowedFields = ['attendance_date', 'status', 'remarks'];
    const fieldsToUpdate = Object.entries(attendanceData).filter(
      ([key, value]) => allowedFields.includes(key) && value !== undefined
    );

    if (fieldsToUpdate.length === 0) {
      return false;
    }

    const setClause = fieldsToUpdate.map(([key]) => `${key} = ?`).join(', ');
    const values = fieldsToUpdate.map(([, value]) => value);

    const sql = `
      UPDATE attendance
      SET ${setClause}
      WHERE attendance_id = ?
    `;
    const [result] = await db.query(sql, [...values, attendanceId]);
    return result.affectedRows > 0;
  }

  // Delete attendance record
  static async delete(attendanceId) {
    const sql = 'DELETE FROM attendance WHERE attendance_id = ?';
    const [result] = await db.query(sql, [attendanceId]);
    return result.affectedRows > 0;
  }

  // Find attendance for a student in a course
  static async findByStudentAndCourse(studentId, courseId) {
    const sql = `
      SELECT * FROM attendance
      WHERE student_id = ? AND course_id = ?
      ORDER BY attendance_date DESC
    `;
    const [rows] = await db.query(sql, [studentId, courseId]);
    return rows;
  }

  // Find attendance by course and date
  static async findByCourseAndDate(courseId, date) {
    const sql = `
      SELECT a.*, s.first_name, s.last_name
      FROM attendance a
      JOIN student s ON a.student_id = s.student_id
      WHERE a.course_id = ? AND a.attendance_date = ?
    `;
    const [rows] = await db.query(sql, [courseId, date]);
    return rows;
  }
}

module.exports = Attendance;