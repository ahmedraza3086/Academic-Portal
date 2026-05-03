const db = require('../config/db');

class Course {
  // Create a new course
  static async create(courseData) {
    const { course_code, course_name, credits, faculty_id, semester, description } = courseData;
    const sql = `
      INSERT INTO course (course_code, course_name, credits, faculty_id, semester, description)
      VALUES (?, ?, ?, ?, ?, ?)
    `;
    const [result] = await db.query(sql, [course_code, course_name, credits, faculty_id, semester, description]);
    return result.insertId;
  }

  // Find all courses (with faculty info)
  static async findAll() {
    const sql = `
      SELECT c.*, f.first_name AS faculty_first_name, f.last_name AS faculty_last_name
      FROM course c
      LEFT JOIN faculty f ON c.faculty_id = f.faculty_id
      ORDER BY c.course_id DESC
    `;
    const [rows] = await db.query(sql);
    return rows;
  }

  // Find a course by ID
  static async findById(courseId) {
    const sql = `
      SELECT c.*, f.first_name AS faculty_first_name, f.last_name AS faculty_last_name
      FROM course c
      LEFT JOIN faculty f ON c.faculty_id = f.faculty_id
      WHERE c.course_id = ?
    `;
    const [rows] = await db.query(sql, [courseId]);
    return rows[0];
  }

  // Update a course
  static async update(courseId, courseData) {
    const allowedFields = ['course_code', 'course_name', 'credits', 'faculty_id', 'semester', 'description'];
    const fieldsToUpdate = Object.entries(courseData).filter(
      ([key, value]) => allowedFields.includes(key) && value !== undefined
    );

    if (fieldsToUpdate.length === 0) {
      return false;
    }

    const setClause = fieldsToUpdate.map(([key]) => `${key} = ?`).join(', ');
    const values = fieldsToUpdate.map(([, value]) => value);

    const sql = `
      UPDATE course
      SET ${setClause}
      WHERE course_id = ?
    `;
    const [result] = await db.query(sql, [...values, courseId]);
    return result.affectedRows > 0;
  }

  // Delete a course
  static async delete(courseId) {
    const sql = 'DELETE FROM course WHERE course_id = ?';
    const [result] = await db.query(sql, [courseId]);
    return result.affectedRows > 0;
  }

  // Find courses by faculty ID
  static async findByFaculty(facultyId) {
    const sql = 'SELECT * FROM course WHERE faculty_id = ?';
    const [rows] = await db.query(sql, [facultyId]);
    return rows;
  }
}

module.exports = Course;