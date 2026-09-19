const express = require('express');
const router = express.Router();
const {
  register,
  login,
  getMe,
  adminTest,
} = require('../controllers/authController');
const { protect, authorizeRoles } = require('../middleware/authMiddleware');

const { registerValidation, loginValidation } = require('../middleware/validators');

// Public routes
router.post('/register', registerValidation, register);
router.post('/login', loginValidation, login);

// Protected routes
router.get('/me', protect, getMe);

// Admin-only test route
router.get('/admin-test', protect, authorizeRoles('admin'), adminTest);

module.exports = router;
