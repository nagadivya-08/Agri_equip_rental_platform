const Razorpay = require('razorpay');
const crypto = require('crypto');
const Booking = require('../models/Booking');
const { sendEmailNotification } = require('../utils/sendEmail');

// Initialize Razorpay client helper
const getRazorpayInstance = () => {
  const keyId = process.env.RAZORPAY_KEY_ID;
  const keySecret = process.env.RAZORPAY_KEY_SECRET;

  if (!keyId || !keySecret || keyId === 'rzp_test_placeholder') {
    console.warn(
      'Warning: RAZORPAY_KEY_ID and RAZORPAY_KEY_SECRET are set to placeholders. Please configure actual test keys in server/.env.'
    );
  }

  return new Razorpay({
    key_id: keyId || 'rzp_test_placeholder',
    key_secret: keySecret || 'rzp_secret_placeholder',
  });
};

// @desc    Create a Razorpay order for a booking awaiting payment
// @route   POST /api/payments/create-order
// @access  Private (role: renter)
const createOrder = async (req, res) => {
  try {
    const { bookingId } = req.body;

    if (!bookingId) {
      return res.status(400).json({
        success: false,
        message: 'Please provide a valid bookingId',
      });
    }

    const booking = await Booking.findById(bookingId).populate(
      'equipmentId',
      'name pricePerDay'
    );

    if (!booking) {
      return res.status(404).json({
        success: false,
        message: 'Booking not found',
      });
    }

    // Verify renter identity
    if (booking.renterId.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to pay for this booking',
      });
    }

    // Verify booking status
    if (booking.status !== 'awaiting_payment') {
      return res.status(400).json({
        success: false,
        message: `Cannot pay for booking with status '${booking.status}'. Booking must be 'awaiting_payment'.`,
      });
    }

    const razorpay = getRazorpayInstance();
    const amountInPaise = Math.round(booking.totalPrice * 100);

    const orderOptions = {
      amount: amountInPaise,
      currency: 'INR',
      receipt: `rcpt_${booking._id.toString().slice(-8)}`,
      notes: {
        bookingId: booking._id.toString(),
        renterId: req.user._id.toString(),
        equipmentName: booking.equipmentId?.name || 'Equipment',
      },
    };

    let order;
    try {
      order = await razorpay.orders.create(orderOptions);
    } catch (rzpErr) {
      console.error('Razorpay API error creating order:', rzpErr);
      return res.status(500).json({
        success: false,
        message:
          rzpErr.error?.description ||
          rzpErr.message ||
          'Failed to initialize Razorpay payment order. Please verify your Razorpay API keys in server/.env.',
      });
    }

    // Persist order ID on booking
    booking.razorpayOrderId = order.id;
    await booking.save();

    return res.status(200).json({
      success: true,
      orderId: order.id,
      amount: order.amount,
      currency: order.currency,
      keyId: process.env.RAZORPAY_KEY_ID || 'rzp_test_placeholder',
      booking: {
        id: booking._id,
        totalPrice: booking.totalPrice,
      },
    });
  } catch (error) {
    console.error('Create payment order error:', error);
    return res.status(500).json({
      success: false,
      message: error.message || 'Server error generating payment order',
    });
  }
};

// @desc    Verify Razorpay payment signature and confirm booking
// @route   POST /api/payments/verify
// @access  Private (role: renter)
const verifyPayment = async (req, res) => {
  try {
    const {
      bookingId,
      razorpay_order_id,
      razorpay_payment_id,
      razorpay_signature,
    } = req.body;

    if (
      !bookingId ||
      !razorpay_order_id ||
      !razorpay_payment_id ||
      !razorpay_signature
    ) {
      return res.status(400).json({
        success: false,
        message:
          'Please provide bookingId, razorpay_order_id, razorpay_payment_id, and razorpay_signature',
      });
    }

    const booking = await Booking.findById(bookingId);

    if (!booking) {
      return res.status(404).json({
        success: false,
        message: 'Booking not found',
      });
    }

    // Verify renter identity
    if (booking.renterId.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to verify payment for this booking',
      });
    }

    // Signature verification using HMAC SHA256
    const keySecret = process.env.RAZORPAY_KEY_SECRET || 'rzp_secret_placeholder';
    const hmac = crypto.createHmac('sha256', keySecret);
    hmac.update(`${razorpay_order_id}|${razorpay_payment_id}`);
    const generatedSignature = hmac.digest('hex');

    if (generatedSignature !== razorpay_signature) {
      return res.status(400).json({
        success: false,
        message: 'Payment verification failed: Invalid transaction signature.',
      });
    }

    // Payment is authentic -> mark as paid & confirmed
    booking.paymentStatus = 'paid';
    booking.razorpayPaymentId = razorpay_payment_id;
    booking.razorpayOrderId = razorpay_order_id;
    booking.status = 'confirmed';
    await booking.save();

    const populatedBooking = await Booking.findById(booking._id)
      .populate('equipmentId', 'name type images pricePerDay')
      .populate('renterId', 'name email phone')
      .populate('ownerId', 'name email phone');

    // Fire-and-forget emails to both parties
    const renter = populatedBooking.renterId;
    const owner = populatedBooking.ownerId;
    const equipTitle = populatedBooking.equipmentId?.name || 'Equipment';

    if (renter?.email) {
      sendEmailNotification({
        to: renter.email,
        subject: `✅ Payment Received & Booking Confirmed for "${equipTitle}"`,
        text: `Hello ${renter.name},\n\nYour payment of ₹${booking.totalPrice} has been processed successfully. Your booking for "${equipTitle}" is now officially CONFIRMED.\n\nTransaction ID: ${razorpay_payment_id}\n\nThank you for choosing AgriRent!`,
        html: `<h3>Payment Confirmed!</h3><p>Hello <strong>${renter.name}</strong>,</p><p>Your payment of <strong>₹${booking.totalPrice}</strong> has been received and verified. Your booking for <strong>${equipTitle}</strong> is now officially <strong>CONFIRMED</strong>.</p><p><strong>Transaction ID:</strong> <code>${razorpay_payment_id}</code></p><p>Thank you for using AgriRent!</p>`,
      });
    }

    if (owner?.email) {
      sendEmailNotification({
        to: owner.email,
        subject: `💰 Payment Received for "${equipTitle}" - Reservation Confirmed`,
        text: `Hello ${owner.name},\n\nGreat news! The renter (${renter?.name || 'Renter'}) has completed online payment of ₹${booking.totalPrice} for "${equipTitle}". The booking is now CONFIRMED.\n\nPlease prepare the equipment for handover on the scheduled start date.`,
        html: `<h3>Payment Received</h3><p>Hello <strong>${owner.name}</strong>,</p><p>The renter (<strong>${renter?.name || 'Renter'}</strong>) has completed online payment of <strong>₹${booking.totalPrice}</strong> for <strong>${equipTitle}</strong>. The reservation is now <strong>CONFIRMED</strong>.</p><p>Please prepare the equipment for handover on the scheduled date.</p>`,
      });
    }

    return res.status(200).json({
      success: true,
      message: 'Payment verified and booking confirmed successfully!',
      data: populatedBooking,
    });
  } catch (error) {
    console.error('Verify payment error:', error);
    return res.status(500).json({
      success: false,
      message: error.message || 'Server error verifying payment',
    });
  }
};

module.exports = {
  createOrder,
  verifyPayment,
};
