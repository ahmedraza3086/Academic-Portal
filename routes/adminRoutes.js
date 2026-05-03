const express = require('express');
const router = express.Router();
const adminController = require('../controllers/adminController');
const { verifyToken, checkRole } = require('../middleware/authMiddleware');

router.use(verifyToken);
router.use(checkRole('admin'));

// Student management
router.get('/students', adminController.getAllStudents);
router.post('/students', adminController.createStudent);
router.put('/students/:id', adminController.updateStudent);
router.delete('/students/:id', adminController.deleteStudent);

// Faculty management
router.get('/faculty', adminController.getAllFaculty);
router.post('/faculty', adminController.createFaculty);
router.put('/faculty/:id', adminController.updateFaculty);
router.delete('/faculty/:id', adminController.deleteFaculty);

// Course management
router.get('/courses', adminController.getAllCourses);
router.post('/courses', adminController.createCourse);
router.put('/courses/:id', adminController.updateCourse);
router.delete('/courses/:id', adminController.deleteCourse);

// Course assignment
router.post('/courses/assign', adminController.assignCourseToFaculty);

// Enrollment management
router.get('/enrollments', adminController.getAllEnrollments);
router.post('/enrollments', adminController.createEnrollment);
router.put('/enrollments/:id', adminController.updateEnrollment);
router.delete('/enrollments/:id', adminController.deleteEnrollment);

module.exports = router;