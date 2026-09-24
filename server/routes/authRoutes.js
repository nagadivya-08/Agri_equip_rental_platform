const express = require('express');
const router = express.Router();
const {
  register,
  login,
  getMe,
  adminTest,
  forgotPassword,
  resetPassword,
  updateProfile,
  changePassword,
} = require('../controllers/authController');
const { protect, authorizeRoles } = require('../middleware/authMiddleware');

const { registerValidation, loginValidation } = require('../middleware/validators');

// Public routes
router.post('/register', registerValidation, register);
router.post('/login', loginValidation, login);
router.post('/forgot-password', forgotPassword);
router.post('/reset-password/:token', resetPassword);

// Protected routes
router.get('/me', protect, getMe);
router.patch('/profile', protect, updateProfile);
router.post('/change-password', protect, changePassword);

// Admin-only test route
router.get('/admin-test', protect, authorizeRoles('admin'), adminTest);

module.exports = router;
