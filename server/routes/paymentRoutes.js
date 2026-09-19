const express = require('express');
const router = express.Router();
const {
  createOrder,
  verifyPayment,
} = require('../controllers/paymentController');
const { protect, authorizeRoles } = require('../middleware/authMiddleware');

// Renter payment routes
router.post('/create-order', protect, authorizeRoles('renter'), createOrder);
router.post('/verify', protect, authorizeRoles('renter'), verifyPayment);

module.exports = router;
