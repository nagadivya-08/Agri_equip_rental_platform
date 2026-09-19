const express = require('express');
const router = express.Router();
const {
  createBooking,
  getMyBookings,
  getOwnerBookings,
  confirmBooking,
  rejectBooking,
  cancelBooking,
  completeBooking,
} = require('../controllers/bookingController');
const { protect, authorizeRoles } = require('../middleware/authMiddleware');
const { bookingValidation } = require('../middleware/validators');

// Renter routes
router.post('/', protect, authorizeRoles('renter'), bookingValidation, createBooking);
router.get('/my', protect, authorizeRoles('renter'), getMyBookings);

// Owner routes
router.get('/owner', protect, authorizeRoles('owner'), getOwnerBookings);
router.patch('/:id/confirm', protect, authorizeRoles('owner'), confirmBooking);
router.patch('/:id/reject', protect, authorizeRoles('owner'), rejectBooking);
router.patch('/:id/complete', protect, authorizeRoles('owner'), completeBooking);

// Shared cancel route (renter who booked or owner)
router.patch('/:id/cancel', protect, cancelBooking);

module.exports = router;
