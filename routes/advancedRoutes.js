const express = require('express');
const router  = express.Router();
const ctrl    = require('../controllers/advancedController');
const { verifyToken, checkRole } = require('../middleware/authMiddleware');

// All advanced routes require authentication
router.use(verifyToken);

// ── Reports (Views) — Admin & Faculty ──────────────────────────────────────
// GET /api/advanced/reports/:type
// :type = low-attendance | top-performers | faculty-workload | unenrolled | popularity
router.get('/reports/:type', checkRole('admin', 'faculty'), ctrl.getReports);

// ── Student Transcript — Admin, Faculty, and the Student themselves ─────────
// GET /api/advanced/transcript/:studentId
router.get('/transcript/:studentId', checkRole('admin', 'faculty', 'student'), ctrl.getStudentTranscript);

// ── GPA Calculator — Admin, Faculty, and the Student themselves ─────────────
// GET /api/advanced/gpa/:studentId
router.get('/gpa/:studentId', checkRole('admin', 'faculty', 'student'), ctrl.calculateGPA);

// ── Course Statistics — Admin & Faculty ────────────────────────────────────
// GET /api/advanced/course-stats/:courseId
router.get('/course-stats/:courseId', checkRole('admin', 'faculty'), ctrl.getCourseStatistics);

// ── Enroll Student via Transaction — Admin only ────────────────────────────
// POST /api/advanced/enroll  { studentId, courseId }
router.post('/enroll', checkRole('admin'), ctrl.enrollStudent);

// ── Transfer Student via Transaction — Admin only ──────────────────────────
// POST /api/advanced/transfer  { studentId, oldCourseId, newCourseId }
router.post('/transfer', checkRole('admin'), ctrl.transferStudent);

module.exports = router;
