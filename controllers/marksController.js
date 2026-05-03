const Marks = require('../models/Marks');
const db = require('../config/db');

// Add marks
const addMarks = async (req, res) => {
  try {
    const facultyId = req.user.id;
    const { student_id, course_id, assessment_type, obtained_marks, max_marks, assessment_date, remarks } = req.body;

    if (
      !student_id ||
      !course_id ||
      !assessment_type ||
      obtained_marks === undefined ||
      max_marks === undefined
    ) {
      return res.status(400).json({
        message: 'student_id, course_id, assessment_type, obtained_marks and max_marks are required.'
      });
    }

    if (Number(max_marks) <= 0 || Number(obtained_marks) < 0 || Number(obtained_marks) > Number(max_marks)) {
      return res.status(400).json({ message: 'Marks must satisfy 0 <= obtained_marks <= max_marks and max_marks > 0.' });
    }

    // Verify course belongs to faculty
    const [course] = await db.query(
      `SELECT * FROM course WHERE course_id = ? AND faculty_id = ?`,
      [course_id, facultyId]
    );
    if (course.length === 0) {
      return res.status(403).json({ message: 'You are not assigned to this course' });
    }

    const marksId = await Marks.create({
      student_id, course_id, assessment_type, obtained_marks, max_marks, assessment_date, remarks
    });
    res.status(201).json({ message: 'Marks recorded', marksId });
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
};

// Update marks
const updateMarks = async (req, res) => {
  try {
    const facultyId = req.user.id;
    const { id } = req.params;
    const updates = req.body;

    if (Object.keys(updates).length === 0) {
      return res.status(400).json({ message: 'Provide at least one field to update.' });
    }

    if (updates.max_marks !== undefined && Number(updates.max_marks) <= 0) {
      return res.status(400).json({ message: 'max_marks must be greater than 0.' });
    }

    if (
      updates.obtained_marks !== undefined &&
      updates.max_marks !== undefined &&
      Number(updates.obtained_marks) > Number(updates.max_marks)
    ) {
      return res.status(400).json({ message: 'obtained_marks cannot exceed max_marks.' });
    }

    // Verify marks belong to faculty's course
    const [marks] = await db.query(
      `SELECT m.* FROM marks m
       JOIN course c ON m.course_id = c.course_id
       WHERE m.marks_id = ? AND c.faculty_id = ?`,
      [id, facultyId]
    );
    if (marks.length === 0) {
      return res.status(403).json({ message: 'Access denied or marks not found' });
    }

    const success = await Marks.update(id, updates);
    if (!success) {
      return res.status(400).json({ message: 'No valid fields provided for update.' });
    }
    res.json({ message: 'Marks updated' });
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
};

// Delete marks
const deleteMarks = async (req, res) => {
  try {
    const facultyId = req.user.id;
    const { id } = req.params;

    const [marks] = await db.query(
      `SELECT m.* FROM marks m
       JOIN course c ON m.course_id = c.course_id
       WHERE m.marks_id = ? AND c.faculty_id = ?`,
      [id, facultyId]
    );
    if (marks.length === 0) {
      return res.status(403).json({ message: 'Access denied or marks not found' });
    }

    await Marks.delete(id);
    res.json({ message: 'Marks deleted' });
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
};

module.exports = { addMarks, updateMarks, deleteMarks };