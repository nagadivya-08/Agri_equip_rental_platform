const express = require('express');
const router = express.Router();
const {
  register,
  login,
  getMe,
  adminTest,
} = require('../controllers/authController');
const { protect, authorizeRoles } = require('../middleware/authMiddleware');

// Public routes
router.post('/register', register);
router.post('/login', login);

// Protected routes
router.get('/me', protect, getMe);

// Admin-only test route
router.get('/admin-test', protect, authorizeRoles('admin'), adminTest);

module.exports = router;
