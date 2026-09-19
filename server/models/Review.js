const mongoose = require('mongoose');

const reviewSchema = new mongoose.Schema({
  bookingId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Booking',
    required: [true, 'Review must be associated with a booking'],
  },
  reviewerId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: [true, 'Review must have a reviewer'],
  },
  revieweeId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: [true, 'Review must have a reviewee'],
  },
  equipmentId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Equipment',
    required: [true, 'Review must reference the equipment'],
  },
  rating: {
    type: Number,
    required: [true, 'Please provide a rating between 1 and 5'],
    min: [1, 'Rating must be at least 1 star'],
    max: [5, 'Rating cannot exceed 5 stars'],
  },
  comment: {
    type: String,
    default: '',
    trim: true,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

// Ensure a user can review a specific booking only once
reviewSchema.index({ bookingId: 1, reviewerId: 1 }, { unique: true });
// Index for fast equipment and user review lookups
reviewSchema.index({ equipmentId: 1 });
reviewSchema.index({ revieweeId: 1 });

const Review = mongoose.model('Review', reviewSchema);

module.exports = Review;
