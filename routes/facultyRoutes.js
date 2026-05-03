const express = require('express');
const router = express.Router();
const facultyController = require('../controllers/facultyController');
const { verifyToken, checkRole } = require('../middleware/authMiddleware');

router.use(verifyToken);
router.use(checkRole('faculty'));

router.get('/courses', facultyController.getMyCourses);
router.get('/courses/:courseId/students', facultyController.getCourseStudents);
router.get('/courses/:courseId/attendance', facultyController.getCourseAttendance);
router.get('/courses/:courseId/marks', facultyController.getCourseMarks);
router.get('/students/:studentId/performance', facultyController.viewStudentPerformance);

// Attendance and marks routes are handled separately (but faculty can access)
module.exports = router;