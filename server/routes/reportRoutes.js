const express = require('express');
const router = express.Router();
const {
  createReport,
  getReports,
  dismissReport,
  resolveReport,
} = require('../controllers/reportController');
const { protect, authorizeRoles } = require('../middleware/authMiddleware');

// Public/authenticated user submit report
router.post('/', protect, createReport);

// Admin moderation endpoints
router.get('/', protect, authorizeRoles('admin'), getReports);
router.patch('/:id/dismiss', protect, authorizeRoles('admin'), dismissReport);
router.patch('/:id/resolve', protect, authorizeRoles('admin'), resolveReport);

module.exports = router;
