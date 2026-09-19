const express = require('express');
const router = express.Router();
const {
  getPendingListings,
  approveListing,
  rejectListing,
  getAllListings,
  getAllUsers,
  banUser,
  unbanUser,
  getStats,
} = require('../controllers/adminController');
const { protect, authorizeRoles } = require('../middleware/authMiddleware');

// Apply protect and authorizeRoles('admin') to all admin routes
router.use(protect, authorizeRoles('admin'));

// Listings Moderation
router.get('/listings/pending', getPendingListings);
router.patch('/listings/:id/approve', approveListing);
router.patch('/listings/:id/reject', rejectListing);
router.get('/listings', getAllListings);

// User Management
router.get('/users', getAllUsers);
router.patch('/users/:id/ban', banUser);
router.patch('/users/:id/unban', unbanUser);

// Platform Stats
router.get('/stats', getStats);

module.exports = router;
