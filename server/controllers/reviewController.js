const Review = require('../models/Review');
const Booking = require('../models/Booking');
const Equipment = require('../models/Equipment');

// @desc    Submit a review for a completed booking
// @route   POST /api/reviews
// @access  Private
const createReview = async (req, res) => {
  try {
    const { bookingId, rating, comment } = req.body;

    if (!bookingId || rating === undefined || rating === '') {
      return res.status(400).json({
        success: false,
        message: 'Please provide bookingId and a rating between 1 and 5',
      });
    }

    const numericRating = Number(rating);
    if (isNaN(numericRating) || numericRating < 1 || numericRating > 5) {
      return res.status(400).json({
        success: false,
        message: 'Rating must be a number between 1 and 5',
      });
    }

    const booking = await Booking.findById(bookingId);

    if (!booking) {
      return res.status(404).json({
        success: false,
        message: 'Booking not found',
      });
    }

    // Must be a completed booking
    if (booking.status !== 'completed') {
      return res.status(400).json({
        success: false,
        message: `Cannot review booking with status '${booking.status}'. Booking must be 'completed'.`,
      });
    }

    // Must be either the renter or the owner on that booking
    const isRenter = booking.renterId.toString() === req.user._id.toString();
    const isOwner = booking.ownerId.toString() === req.user._id.toString();

    if (!isRenter && !isOwner) {
      return res.status(403).json({
        success: false,
        message: 'You are not authorized to review this booking',
      });
    }

    // Check if reviewer already reviewed this booking
    const existingReview = await Review.findOne({
      bookingId,
      reviewerId: req.user._id,
    });

    if (existingReview) {
      return res.status(400).json({
        success: false,
        message: 'You have already submitted a review for this booking.',
      });
    }

    // Auto-assign reviewee: if reviewer is renter -> owner; if owner -> renter
    const revieweeId = isRenter ? booking.ownerId : booking.renterId;

    const review = await Review.create({
      bookingId,
      reviewerId: req.user._id,
      revieweeId,
      equipmentId: booking.equipmentId,
      rating: numericRating,
      comment: comment ? comment.trim() : '',
    });

    const populatedReview = await Review.findById(review._id)
      .populate('reviewerId', 'name')
      .populate('revieweeId', 'name')
      .populate('equipmentId', 'name type');

    return res.status(201).json({
      success: true,
      message: 'Review submitted successfully!',
      data: populatedReview,
    });
  } catch (error) {
    console.error('Create review error:', error);
    if (error.code === 11000) {
      return res.status(400).json({
        success: false,
        message: 'You have already submitted a review for this booking.',
      });
    }
    return res.status(500).json({
      success: false,
      message: error.message || 'Server error submitting review',
    });
  }
};

// @desc    Get all reviews for an equipment
// @route   GET /api/equipment/:id/reviews or GET /api/reviews/equipment/:id
// @access  Public
const getEquipmentReviews = async (req, res) => {
  try {
    const equipmentId = req.params.id;

    const reviews = await Review.find({ equipmentId })
      .populate('reviewerId', 'name')
      .sort({ createdAt: -1 });

    const reviewCount = reviews.length;
    const averageRating =
      reviewCount > 0
        ? Math.round((reviews.reduce((acc, r) => acc + r.rating, 0) / reviewCount) * 10) / 10
        : 0;

    return res.status(200).json({
      success: true,
      count: reviewCount,
      averageRating,
      data: reviews,
    });
  } catch (error) {
    console.error('Get equipment reviews error:', error);
    return res.status(500).json({
      success: false,
      message: error.message || 'Server error fetching equipment reviews',
    });
  }
};

// @desc    Get all reviews received by a user (reputation)
// @route   GET /api/users/:id/reviews or GET /api/reviews/user/:id
// @access  Public
const getUserReviews = async (req, res) => {
  try {
    const userId = req.params.id;

    const reviews = await Review.find({ revieweeId: userId })
      .populate('reviewerId', 'name')
      .populate('equipmentId', 'name type')
      .sort({ createdAt: -1 });

    const reviewCount = reviews.length;
    const averageRating =
      reviewCount > 0
        ? Math.round((reviews.reduce((acc, r) => acc + r.rating, 0) / reviewCount) * 10) / 10
        : 0;

    return res.status(200).json({
      success: true,
      count: reviewCount,
      averageRating,
      data: reviews,
    });
  } catch (error) {
    console.error('Get user reviews error:', error);
    return res.status(500).json({
      success: false,
      message: error.message || 'Server error fetching user reviews',
    });
  }
};

module.exports = {
  createReview,
  getEquipmentReviews,
  getUserReviews,
};
