const express = require('express');
const router = express.Router();
const {
  createReview,
  getEquipmentReviews,
  getUserReviews,
} = require('../controllers/reviewController');
const { protect } = require('../middleware/authMiddleware');

// Create review (protected)
router.post('/', protect, createReview);

// Public review lookups
router.get('/equipment/:id', getEquipmentReviews);
router.get('/user/:id', getUserReviews);

module.exports = router;
