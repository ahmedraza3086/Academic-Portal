const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');
const { verifyToken } = require('../middleware/authMiddleware');

// Public route: login
router.post('/login', authController.login);

// Protected route: get current user profile
router.get('/profile', verifyToken, authController.getProfile);

module.exports = router;