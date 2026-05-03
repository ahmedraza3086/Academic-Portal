const Student = require('../models/Student');
const Faculty = require('../models/Faculty');
const Course = require('../models/Course');
const Enrollment = require('../models/Enrollment');
const db = require('../config/db');
const bcrypt = require('bcryptjs');

const isMissing = (value) => value === undefined || value === null || value === '';

const ensureRequired = (body, fields) => {
  const missing = fields.filter((field) => isMissing(body[field]));
  return missing;
};

// ---------- Student Management ----------
const getAllStudents = async (req, res) => {
  try {
    const students = await Student.findAll();
    res.json({ students });
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
};

const createStudent = async (req, res) => {
  try {
    const { first_name, last_name, email, phone, date_of_birth, enrollment_year, major, password } = req.body;
    const missing = ensureRequired(req.body, ['first_name', 'last_name', 'email', 'password']);
    if (missing.length > 0) {
      return res.status(400).json({ message: `Missing required fields: ${missing.join(', ')}` });
    }

    if (String(password).length < 6) {
      return res.status(400).json({ message: 'Password must be at least 6 characters long.' });
    }
    
    const hashedPassword = await bcrypt.hash(password, 10);
    const studentId = await Student.create({
      first_name, last_name, email, phone, date_of_birth, enrollment_year, major,
      password_hash: hashedPassword
    });
    res.status(201).json({ message: 'Student created', studentId });
  } catch (error) {
    if (error.code === 'ER_DUP_ENTRY') {
      return res.status(400).json({ message: 'Email already exists' });
    }
    res.status(500).json({ message: 'Server error' });
  }
};

const updateStudent = async (req, res) => {
  try {
    const { id } = req.params;
    const updates = req.body;

    const existingStudent = await Student.findById(id);
    if (!existingStudent) {
      return res.status(404).json({ message: 'Student not found' });
    }

    if (updates.password) {
      if (String(updates.password).length < 6) {
        return res.status(400).json({ message: 'Password must be at least 6 characters long.' });
      }
      updates.password_hash = await bcrypt.hash(updates.password, 10);
      delete updates.password;
    }

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
    const hasUpdatableField = allowedFields.some((field) => updates[field] !== undefined);
    if (!hasUpdatableField) {
      return res.status(400).json({ message: 'No valid fields provided for update.' });
    }

    const success = await Student.update(id, updates);
    if (!success) return res.status(400).json({ message: 'No valid fields provided for update.' });
    res.json({ message: 'Student updated' });
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
};

const deleteStudent = async (req, res) => {
  try {
    const { id } = req.params;
    const success = await Student.delete(id);
    if (!success) return res.status(404).json({ message: 'Student not found' });
    res.json({ message: 'Student deleted' });
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
};

// ---------- Faculty Management ----------
const getAllFaculty = async (req, res) => {
  try {
    const faculty = await Faculty.findAll();
    res.json({ faculty });
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
};

const createFaculty = async (req, res) => {
  try {
    const { first_name, last_name, email, phone, department, hire_date, password } = req.body;
    const missing = ensureRequired(req.body, ['first_name', 'last_name', 'email', 'password']);
    if (missing.length > 0) {
      return res.status(400).json({ message: `Missing required fields: ${missing.join(', ')}` });
    }

    if (String(password).length < 6) {
      return res.status(400).json({ message: 'Password must be at least 6 characters long.' });
    }
    
    const hashedPassword = await bcrypt.hash(password, 10);
    const facultyId = await Faculty.create({
      first_name, last_name, email, phone, department, hire_date,
      password_hash: hashedPassword
    });
    res.status(201).json({ message: 'Faculty created', facultyId });
  } catch (error) {
    if (error.code === 'ER_DUP_ENTRY') {
      return res.status(400).json({ message: 'Email already exists' });
    }
    res.status(500).json({ message: 'Server error' });
  }
};

const updateFaculty = async (req, res) => {
  try {
    const { id } = req.params;
    const updates = req.body;

    const existingFaculty = await Faculty.findById(id);
    if (!existingFaculty) {
      return res.status(404).json({ message: 'Faculty not found' });
    }

    if (updates.password) {
      if (String(updates.password).length < 6) {
        return res.status(400).json({ message: 'Password must be at least 6 characters long.' });
      }
      updates.password_hash = await bcrypt.hash(updates.password, 10);
      delete updates.password;
    }

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
    const hasUpdatableField = allowedFields.some((field) => updates[field] !== undefined);
    if (!hasUpdatableField) {
      return res.status(400).json({ message: 'No valid fields provided for update.' });
    }

    const success = await Faculty.update(id, updates);
    if (!success) return res.status(400).json({ message: 'No valid fields provided for update.' });
    res.json({ message: 'Faculty updated' });
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
};

const deleteFaculty = async (req, res) => {
  try {
    const { id } = req.params;
    const success = await Faculty.delete(id);
    if (!success) return res.status(404).json({ message: 'Faculty not found' });
    res.json({ message: 'Faculty deleted' });
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
};

// ---------- Course Assignment ----------
const getAllCourses = async (req, res) => {
  try {
    const courses = await Course.findAll();
    res.json({ courses });
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
};

const createCourse = async (req, res) => {
  try {
    const { course_code, course_name, credits, faculty_id, semester, description } = req.body;
    const missing = ensureRequired(req.body, ['course_code', 'course_name', 'credits', 'faculty_id']);
    if (missing.length > 0) {
      return res.status(400).json({ message: `Missing required fields: ${missing.join(', ')}` });
    }

    if (Number(credits) <= 0) {
      return res.status(400).json({ message: 'credits must be greater than 0.' });
    }

    const faculty = await Faculty.findById(faculty_id);
    if (!faculty) {
      return res.status(404).json({ message: 'Faculty not found.' });
    }

    const courseId = await Course.create({ course_code, course_name, credits, faculty_id, semester, description });
    return res.status(201).json({ message: 'Course created', courseId });
  } catch (error) {
    if (error.code === 'ER_DUP_ENTRY') {
      return res.status(400).json({ message: 'Course code already exists' });
    }
    return res.status(500).json({ message: 'Server error' });
  }
};

const updateCourse = async (req, res) => {
  try {
    const { id } = req.params;
    const updates = req.body;

    const existingCourse = await Course.findById(id);
    if (!existingCourse) {
      return res.status(404).json({ message: 'Course not found' });
    }

    if (updates.credits !== undefined && Number(updates.credits) <= 0) {
      return res.status(400).json({ message: 'credits must be greater than 0.' });
    }

    if (updates.faculty_id !== undefined) {
      const faculty = await Faculty.findById(updates.faculty_id);
      if (!faculty) {
        return res.status(404).json({ message: 'Faculty not found.' });
      }
    }

    const allowedFields = ['course_code', 'course_name', 'credits', 'faculty_id', 'semester', 'description'];
    const hasUpdatableField = allowedFields.some((field) => updates[field] !== undefined);
    if (!hasUpdatableField) {
      return res.status(400).json({ message: 'No valid fields provided for update.' });
    }

    const success = await Course.update(id, updates);
    if (!success) {
      return res.status(400).json({ message: 'No valid fields provided for update.' });
    }

    return res.json({ message: 'Course updated' });
  } catch (error) {
    if (error.code === 'ER_DUP_ENTRY') {
      return res.status(400).json({ message: 'Course code already exists' });
    }
    return res.status(500).json({ message: 'Server error' });
  }
};

const deleteCourse = async (req, res) => {
  try {
    const { id } = req.params;
    const success = await Course.delete(id);
    if (!success) {
      return res.status(404).json({ message: 'Course not found' });
    }
    return res.json({ message: 'Course deleted' });
  } catch (error) {
    return res.status(500).json({ message: 'Server error' });
  }
};

const assignCourseToFaculty = async (req, res) => {
  try {
    const { courseId, facultyId } = req.body;

    if (!courseId || !facultyId) {
      return res.status(400).json({ message: 'courseId and facultyId are required.' });
    }

    const faculty = await Faculty.findById(facultyId);
    if (!faculty) {
      return res.status(404).json({ message: 'Faculty not found.' });
    }

    const [result] = await db.query(
      `UPDATE course SET faculty_id = ? WHERE course_id = ?`,
      [facultyId, courseId]
    );
    if (result.affectedRows === 0) {
      return res.status(404).json({ message: 'Course not found' });
    }
    res.json({ message: 'Course assigned successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
};

// ---------- Enrollment Management ----------
const getAllEnrollments = async (req, res) => {
  try {
    const enrollments = await Enrollment.findAll();
    res.json({ enrollments });
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
};

const createEnrollment = async (req, res) => {
  try {
    const { student_id, course_id, enrollment_date, status } = req.body;
    const missing = ensureRequired(req.body, ['student_id', 'course_id', 'enrollment_date']);
    if (missing.length > 0) {
      return res.status(400).json({ message: `Missing required fields: ${missing.join(', ')}` });
    }

    const student = await Student.findById(student_id);
    if (!student) {
      return res.status(404).json({ message: 'Student not found.' });
    }

    const course = await Course.findById(course_id);
    if (!course) {
      return res.status(404).json({ message: 'Course not found.' });
    }

    const enrollmentId = await Enrollment.create({ student_id, course_id, enrollment_date, status });
    return res.status(201).json({ message: 'Enrollment created', enrollmentId });
  } catch (error) {
    if (error.code === 'ER_DUP_ENTRY') {
      return res.status(400).json({ message: 'Student is already enrolled in this course.' });
    }
    return res.status(500).json({ message: 'Server error' });
  }
};

const updateEnrollment = async (req, res) => {
  try {
    const { id } = req.params;
    const { status, grade } = req.body;

    const existingEnrollment = await Enrollment.findById(id);
    if (!existingEnrollment) {
      return res.status(404).json({ message: 'Enrollment not found' });
    }

    if (status === undefined && grade === undefined) {
      return res.status(400).json({ message: 'Provide at least one field to update: status or grade.' });
    }

    const success = await Enrollment.update(id, { status, grade });
    if (!success) {
      return res.status(400).json({ message: 'No valid fields provided for update.' });
    }

    return res.json({ message: 'Enrollment updated' });
  } catch (error) {
    return res.status(500).json({ message: 'Server error' });
  }
};

const deleteEnrollment = async (req, res) => {
  try {
    const { id } = req.params;
    const success = await Enrollment.delete(id);
    if (!success) {
      return res.status(404).json({ message: 'Enrollment not found' });
    }
    return res.json({ message: 'Enrollment deleted' });
  } catch (error) {
    return res.status(500).json({ message: 'Server error' });
  }
};

module.exports = {
  getAllStudents, createStudent, updateStudent, deleteStudent,
  getAllFaculty, createFaculty, updateFaculty, deleteFaculty,
  getAllCourses, createCourse, updateCourse, deleteCourse,
  assignCourseToFaculty,
  getAllEnrollments, createEnrollment, updateEnrollment, deleteEnrollment
};