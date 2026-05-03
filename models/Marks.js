const db = require('../config/db');

class Marks {
  // Create a new marks record
  static async create(marksData) {
    const { student_id, course_id, assessment_type, obtained_marks, max_marks, assessment_date, remarks } = marksData;
    const sql = `
      INSERT INTO marks (student_id, course_id, assessment_type, obtained_marks, max_marks, assessment_date, remarks)
      VALUES (?, ?, ?, ?, ?, ?, ?)
    `;
    const [result] = await db.query(sql, [student_id, course_id, assessment_type, obtained_marks, max_marks, assessment_date, remarks]);
    return result.insertId;
  }

  // Find all marks records
  static async findAll() {
    const sql = `
      SELECT m.*,
             s.first_name AS student_first, s.last_name AS student_last,
             c.course_code, c.course_name
      FROM marks m
      JOIN student s ON m.student_id = s.student_id
      JOIN course c ON m.course_id = c.course_id
      ORDER BY m.assessment_date DESC
    `;
    const [rows] = await db.query(sql);
    return rows;
  }

  // Find marks by ID
  static async findById(marksId) {
    const sql = `
      SELECT m.*,
             s.first_name AS student_first, s.last_name AS student_last,
             c.course_code, c.course_name
      FROM marks m
      JOIN student s ON m.student_id = s.student_id
      JOIN course c ON m.course_id = c.course_id
      WHERE m.marks_id = ?
    `;
    const [rows] = await db.query(sql, [marksId]);
    return rows[0];
  }

  // Update marks record
  static async update(marksId, marksData) {
    const allowedFields = ['assessment_type', 'obtained_marks', 'max_marks', 'assessment_date', 'remarks'];
    const fieldsToUpdate = Object.entries(marksData).filter(
      ([key, value]) => allowedFields.includes(key) && value !== undefined
    );

    if (fieldsToUpdate.length === 0) {
      return false;
    }

    const setClause = fieldsToUpdate.map(([key]) => `${key} = ?`).join(', ');
    const values = fieldsToUpdate.map(([, value]) => value);

    const sql = `
      UPDATE marks
      SET ${setClause}
      WHERE marks_id = ?
    `;
    const [result] = await db.query(sql, [...values, marksId]);
    return result.affectedRows > 0;
  }

  // Delete marks record
  static async delete(marksId) {
    const sql = 'DELETE FROM marks WHERE marks_id = ?';
    const [result] = await db.query(sql, [marksId]);
    return result.affectedRows > 0;
  }

  // Find marks for a student in a course
  static async findByStudentAndCourse(studentId, courseId) {
    const sql = `
      SELECT * FROM marks
      WHERE student_id = ? AND course_id = ?
      ORDER BY assessment_date DESC
    `;
    const [rows] = await db.query(sql, [studentId, courseId]);
    return rows;
  }

  // Calculate total marks for a student in a course
  static async getTotalMarks(studentId, courseId) {
    const sql = `
      SELECT SUM(obtained_marks) AS total_obtained, SUM(max_marks) AS total_max
      FROM marks
      WHERE student_id = ? AND course_id = ?
    `;
    const [rows] = await db.query(sql, [studentId, courseId]);
    return rows[0];
  }
}

module.exports = Marks;