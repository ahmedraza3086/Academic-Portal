const Student = require('../models/Student');
const Attendance = require('../models/Attendance');
const Marks = require('../models/Marks');
const db = require('../config/db');

// Get own profile (student)
const getOwnProfile = async (req, res) => {
  try {
    const studentId = req.user.id; // from JWT
    const student = await Student.findById(studentId);
    if (!student) {
      return res.status(404).json({ message: 'Student not found' });
    }
    // Remove sensitive data
    delete student.password_hash;
    res.json({ student });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
};

// View own attendance
const getOwnAttendance = async (req, res) => {
  try {
    const studentId = req.user.id;
    const { courseId } = req.query;
    
    let attendance;
    if (courseId) {
      attendance = await Attendance.findByStudentAndCourse(studentId, courseId);
    } else {
      // Get all attendance records for student across courses
      const [rows] = await db.query(
        `SELECT a.*, c.course_code, c.course_name 
         FROM attendance a 
         JOIN course c ON a.course_id = c.course_id 
         WHERE a.student_id = ? 
         ORDER BY a.attendance_date DESC`,
        [studentId]
      );
      attendance = rows;
    }
    res.json({ attendance });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
};

// View own marks
const getOwnMarks = async (req, res) => {
  try {
    const studentId = req.user.id;
    const { courseId } = req.query;
    
    let marks;
    if (courseId) {
      marks = await Marks.findByStudentAndCourse(studentId, courseId);
    } else {
      const [rows] = await db.query(
        `SELECT m.*, c.course_code, c.course_name 
         FROM marks m 
         JOIN course c ON m.course_id = c.course_id 
         WHERE m.student_id = ? 
         ORDER BY m.assessment_date DESC`,
        [studentId]
      );
      marks = rows;
    }
    res.json({ marks });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
};


module.exports = { getOwnProfile, getOwnAttendance, getOwnMarks };