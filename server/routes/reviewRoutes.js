const express = require('express');
const router = express.Router();
const {
  createReview,
  getEquipmentReviews,
  getUserReviews,
} = require('../controllers/reviewController');
const { protect } = require('../middleware/authMiddleware');
const { reviewValidation } = require('../middleware/validators');

// Create review (protected)
router.post('/', protect, reviewValidation, createReview);

// Public review lookups
router.get('/equipment/:id', getEquipmentReviews);
router.get('/user/:id', getUserReviews);

module.exports = router;
