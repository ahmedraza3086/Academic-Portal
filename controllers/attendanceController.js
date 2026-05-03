const Attendance = require('../models/Attendance');
const db = require('../config/db');

// Add attendance record (faculty only)
const addAttendance = async (req, res) => {
  try {
    const facultyId = req.user.id;
    const { student_id, course_id, attendance_date, status, remarks } = req.body;

    if (!student_id || !course_id || !attendance_date || !status) {
      return res.status(400).json({ message: 'student_id, course_id, attendance_date and status are required.' });
    }

    // Verify course belongs to faculty
    const [course] = await db.query(
      `SELECT * FROM course WHERE course_id = ? AND faculty_id = ?`,
      [course_id, facultyId]
    );
    if (course.length === 0) {
      return res.status(403).json({ message: 'You are not assigned to this course' });
    }

    const attendanceId = await Attendance.create({
      student_id, course_id, attendance_date, status, remarks
    });
    res.status(201).json({ message: 'Attendance recorded', attendanceId });
  } catch (error) {
    if (error.code === 'ER_DUP_ENTRY') {
      return res.status(400).json({ message: 'Attendance already exists for this date' });
    }
    res.status(500).json({ message: 'Server error' });
  }
};

// Update attendance
const updateAttendance = async (req, res) => {
  try {
    const facultyId = req.user.id;
    const { id } = req.params;
    const { status, remarks } = req.body;

    if (status === undefined && remarks === undefined) {
      return res.status(400).json({ message: 'Provide at least one field to update (status or remarks).' });
    }

    // Verify attendance belongs to faculty's course
    const [attendance] = await db.query(
      `SELECT a.* FROM attendance a
       JOIN course c ON a.course_id = c.course_id
       WHERE a.attendance_id = ? AND c.faculty_id = ?`,
      [id, facultyId]
    );
    if (attendance.length === 0) {
      return res.status(403).json({ message: 'Access denied or attendance not found' });
    }

    const success = await Attendance.update(id, { status, remarks });
    if (!success) {
      return res.status(400).json({ message: 'No valid fields provided for update.' });
    }
    res.json({ message: 'Attendance updated' });
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
};

// Delete attendance (optional)
const deleteAttendance = async (req, res) => {
  try {
    const facultyId = req.user.id;
    const { id } = req.params;

    const [attendance] = await db.query(
      `SELECT a.* FROM attendance a
       JOIN course c ON a.course_id = c.course_id
       WHERE a.attendance_id = ? AND c.faculty_id = ?`,
      [id, facultyId]
    );
    if (attendance.length === 0) {
      return res.status(403).json({ message: 'Access denied or attendance not found' });
    }

    await Attendance.delete(id);
    res.json({ message: 'Attendance deleted' });
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
};

module.exports = { addAttendance, updateAttendance, deleteAttendance };