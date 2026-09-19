const mongoose = require('mongoose');

const bookingSchema = new mongoose.Schema({
  equipmentId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Equipment',
    required: [true, 'Booking must be associated with equipment'],
  },
  renterId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: [true, 'Booking must specify a renter'],
  },
  ownerId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: [true, 'Booking must specify an owner'],
  },
  startDate: {
    type: Date,
    required: [true, 'Please provide rental start date'],
  },
  endDate: {
    type: Date,
    required: [true, 'Please provide rental end date'],
    validate: {
      validator: function (value) {
        if (!this.startDate || !value) return true;
        return new Date(value) >= new Date(this.startDate);
      },
      message: 'End date must be on or after start date',
    },
  },
  totalPrice: {
    type: Number,
    required: [true, 'Total price is required'],
    min: [0, 'Total price cannot be negative'],
  },
  status: {
    type: String,
    enum: {
      values: [
        'pending',
        'awaiting_payment',
        'confirmed',
        'rejected',
        'cancelled',
        'completed',
      ],
      message: '{VALUE} is not a valid booking status',
    },
    default: 'pending',
  },
  paymentStatus: {
    type: String,
    enum: {
      values: ['unpaid', 'paid', 'refunded'],
      message: '{VALUE} is not a valid payment status',
    },
    default: 'unpaid',
  },
  razorpayOrderId: {
    type: String,
    default: null,
  },
  razorpayPaymentId: {
    type: String,
    default: null,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

const Booking = mongoose.model('Booking', bookingSchema);

module.exports = Booking;
