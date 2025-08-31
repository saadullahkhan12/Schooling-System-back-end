const express = require('express');
const router = express.Router();
const authMiddleware = require('../middleware/auth');
const { studentDashboard, adminDashboard } = require('../controllers/protectedController');

router.get('/student', authMiddleware(['student', 'admin']), studentDashboard);
router.get('/admin', authMiddleware(['admin']), adminDashboard);

module.exports = router;