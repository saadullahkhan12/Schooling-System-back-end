const express = require('express');
const router = express.Router();
const authMiddleware = require('../middleware/auth');
const {
  createHomework,
  getAllHomeworks,
  getHomeworkById,
  updateHomework,
  deleteHomework,
  submitHomework,
  gradeHomework,
  getHomeworkStats
} = require('../controllers/homeworkController');

// All routes require authentication
router.use(authMiddleware());

// Get homework statistics (Admin/Teacher only)
router.get('/stats', authMiddleware(['admin']), getHomeworkStats);

// Get all homeworks with filters
router.get('/', getAllHomeworks);

// Get homework by ID
router.get('/:id', getHomeworkById);

// Create new homework (Admin/Teacher only)
router.post('/', authMiddleware(['admin']), createHomework);

// Update homework (Admin/Teacher only)
router.put('/:id', authMiddleware(['admin']), updateHomework);

// Delete homework (Admin/Teacher only)
router.delete('/:id', authMiddleware(['admin']), deleteHomework);

// Submit homework (Student only)
router.post('/:id/submit', authMiddleware(['student', 'admin']), submitHomework);

// Grade homework (Admin/Teacher only)
router.put('/:id/submissions/:submissionId/grade', authMiddleware(['admin']), gradeHomework);

module.exports = router;
