const express = require('express');
const router = express.Router();
const marksController = require('../controllers/marksController');
const { verifyToken, checkRole } = require('../middleware/authMiddleware');

router.use(verifyToken);
router.use(checkRole('faculty')); // Only faculty can modify marks

router.post('/', marksController.addMarks);
router.put('/:id', marksController.updateMarks);
router.delete('/:id', marksController.deleteMarks);

module.exports = router;