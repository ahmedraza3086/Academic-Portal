const db = require('../config/db');
const Attendance = require('../models/Attendance');
const Marks = require('../models/Marks');
const Enrollment = require('../models/Enrollment');

// Get courses taught by faculty
const getMyCourses = async (req, res) => {
  try {
    const facultyId = req.user.id;
    const [courses] = await db.query(
      `SELECT * FROM course WHERE faculty_id = ?`,
      [facultyId]
    );
    res.json({ courses });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
};

// Get students enrolled in a specific course (taught by faculty)
const getCourseStudents = async (req, res) => {
  try {
    const facultyId = req.user.id;
    const { courseId } = req.params;

    // Verify course belongs to faculty
    const [course] = await db.query(
      `SELECT * FROM course WHERE course_id = ? AND faculty_id = ?`,
      [courseId, facultyId]
    );
    if (course.length === 0) {
      return res.status(403).json({ message: 'Access denied or course not found' });
    }

    const [students] = await db.query(
      `SELECT s.student_id, s.first_name, s.last_name, s.email, e.enrollment_date, e.status
       FROM enrollment e
       JOIN student s ON e.student_id = s.student_id
       WHERE e.course_id = ?`,
      [courseId]
    );
    res.json({ students });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
};

// View a student's performance (across courses taught by faculty)
const viewStudentPerformance = async (req, res) => {
  try {
    const facultyId = req.user.id;
    const { studentId } = req.params;

    // Check if student is enrolled in any course taught by this faculty
    const [enrollments] = await db.query(
      `SELECT e.*, c.course_code, c.course_name
       FROM enrollment e
       JOIN course c ON e.course_id = c.course_id
       WHERE e.student_id = ? AND c.faculty_id = ?`,
      [studentId, facultyId]
    );

    if (enrollments.length === 0) {
      return res.status(403).json({ message: 'Student not enrolled in your courses' });
    }

    // Get attendance summary
    const [attendanceSummary] = await db.query(
      `SELECT c.course_code,
              COUNT(CASE WHEN a.status = 'present' THEN 1 END) AS present,
              COUNT(CASE WHEN a.status = 'absent' THEN 1 END) AS absent,
              COUNT(CASE WHEN a.status = 'excused' THEN 1 END) AS excused
       FROM attendance a
       JOIN course c ON a.course_id = c.course_id
       WHERE a.student_id = ? AND c.faculty_id = ?
       GROUP BY c.course_id`,
      [studentId, facultyId]
    );

    // Get marks summary
    const [marks] = await db.query(
      `SELECT m.*, c.course_code, c.course_name
       FROM marks m
       JOIN course c ON m.course_id = c.course_id
       WHERE m.student_id = ? AND c.faculty_id = ?`,
      [studentId, facultyId]
    );

    res.json({
      studentId,
      enrollments,
      attendanceSummary,
      marks
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
};

// View attendance records for a course taught by faculty
const getCourseAttendance = async (req, res) => {
  try {
    const facultyId = req.user.id;
    const { courseId } = req.params;
    const { date } = req.query;

    const [course] = await db.query(
      `SELECT * FROM course WHERE course_id = ? AND faculty_id = ?`,
      [courseId, facultyId]
    );

    if (course.length === 0) {
      return res.status(403).json({ message: 'Access denied or course not found' });
    }

    let attendance;
    if (date) {
      attendance = await Attendance.findByCourseAndDate(courseId, date);
    } else {
      const [rows] = await db.query(
        `SELECT a.*, s.first_name, s.last_name
         FROM attendance a
         JOIN student s ON a.student_id = s.student_id
         WHERE a.course_id = ?
         ORDER BY a.attendance_date DESC, a.attendance_id DESC`,
        [courseId]
      );
      attendance = rows;
    }

    return res.json({ attendance });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: 'Server error' });
  }
};

// View marks records for a course taught by faculty
const getCourseMarks = async (req, res) => {
  try {
    const facultyId = req.user.id;
    const { courseId } = req.params;

    const [course] = await db.query(
      `SELECT * FROM course WHERE course_id = ? AND faculty_id = ?`,
      [courseId, facultyId]
    );

    if (course.length === 0) {
      return res.status(403).json({ message: 'Access denied or course not found' });
    }

    const [marks] = await db.query(
      `SELECT m.*, s.first_name, s.last_name
       FROM marks m
       JOIN student s ON m.student_id = s.student_id
       WHERE m.course_id = ?
       ORDER BY m.assessment_date DESC, m.marks_id DESC`,
      [courseId]
    );

    return res.json({ marks });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: 'Server error' });
  }
};

module.exports = {
  getMyCourses,
  getCourseStudents,
  viewStudentPerformance,
  getCourseAttendance,
  getCourseMarks
};