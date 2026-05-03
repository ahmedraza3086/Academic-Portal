const express = require('express');
const router = express.Router();
const studentController = require('../controllers/studentController');
const { verifyToken, checkRole } = require('../middleware/authMiddleware');

// All routes require authentication as student
router.use(verifyToken);
router.use(checkRole('student'));

router.get('/profile', studentController.getOwnProfile);
router.get('/attendance', studentController.getOwnAttendance);
router.get('/marks', studentController.getOwnMarks);

module.exports = router;