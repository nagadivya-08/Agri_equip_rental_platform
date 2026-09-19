const Booking = require('../models/Booking');
const Equipment = require('../models/Equipment');
const User = require('../models/User');
const { sendEmailNotification } = require('../utils/sendEmail');

// Helper to calculate difference in calendar days inclusive of both start and end dates
const calculateInclusiveDays = (startDate, endDate) => {
  const start = new Date(startDate);
  const end = new Date(endDate);
  const startUTC = Date.UTC(start.getFullYear(), start.getMonth(), start.getDate());
  const endUTC = Date.UTC(end.getFullYear(), end.getMonth(), end.getDate());
  return Math.round((endUTC - startUTC) / (1000 * 60 * 60 * 24)) + 1;
};

// @desc    Create a new booking reservation
// @route   POST /api/bookings
// @access  Private (role: renter)
const createBooking = async (req, res) => {
  try {
    const { equipmentId, startDate, endDate } = req.body;

    if (!equipmentId || !startDate || !endDate) {
      return res.status(400).json({
        success: false,
        message: 'Please provide equipmentId, startDate, and endDate',
      });
    }

    const requestedStart = new Date(startDate);
    const requestedEnd = new Date(endDate);

    if (isNaN(requestedStart.getTime()) || isNaN(requestedEnd.getTime())) {
      return res.status(400).json({
        success: false,
        message: 'Invalid date format provided',
      });
    }

    if (requestedEnd < requestedStart) {
      return res.status(400).json({
        success: false,
        message: 'End date must be on or after start date',
      });
    }

    // Step a: Fetch equipment and confirm it exists, is approved, and isAvailable is true
    const equipment = await Equipment.findById(equipmentId);
    if (!equipment) {
      return res.status(400).json({
        success: false,
        message: 'Equipment not found',
      });
    }

    if (equipment.status !== 'approved' || !equipment.isAvailable) {
      return res.status(400).json({
        success: false,
        message: 'Equipment is currently unavailable or not approved for rent',
      });
    }

    // Prevent owner from booking their own equipment
    if (equipment.ownerId.toString() === req.user._id.toString()) {
      return res.status(400).json({
        success: false,
        message: 'You cannot book your own equipment listing',
      });
    }

    // Step b: Check for date conflicts (pending or confirmed overlap)
    // Overlap logic: (existingStart <= requestedEnd) AND (existingEnd >= requestedStart)
    const existingConflict = await Booking.findOne({
      equipmentId,
      status: { $in: ['pending', 'awaiting_payment', 'confirmed'] },
      startDate: { $lte: requestedEnd },
      endDate: { $gte: requestedStart },
    });

    if (existingConflict) {
      return res.status(409).json({
        success: false,
        message:
          'This equipment already has a confirmed reservation or pending booking for the selected dates.',
      });
    }

    // Step c: Calculate totalPrice = pricePerDay * number of days (inclusive)
    const numDays = calculateInclusiveDays(requestedStart, requestedEnd);
    if (numDays <= 0) {
      return res.status(400).json({
        success: false,
        message: 'Invalid rental duration',
      });
    }

    const totalPrice = equipment.pricePerDay * numDays;

    // Step d: Create booking with status "pending" and ownerId copied from equipment
    const booking = await Booking.create({
      equipmentId,
      renterId: req.user._id,
      ownerId: equipment.ownerId,
      startDate: requestedStart,
      endDate: requestedEnd,
      totalPrice,
      status: 'pending',
    });

    const populatedBooking = await Booking.findById(booking._id)
      .populate('equipmentId', 'name type images pricePerDay locationName')
      .populate('renterId', 'name email phone');

    // Trigger notification email to equipment owner (fire-and-forget)
    User.findById(equipment.ownerId).then((owner) => {
      if (owner && owner.email) {
        sendEmailNotification({
          to: owner.email,
          subject: `🚜 New Booking Request for "${equipment.name}"`,
          text: `Hello ${owner.name},\n\nYou have received a new booking request for "${equipment.name}" from ${req.user.name || 'a renter'}.\nDates: ${requestedStart.toDateString()} to ${requestedEnd.toDateString()}\nTotal: ₹${totalPrice}\n\nPlease log in to AgriRent to accept or decline.`,
          html: `<h3>New Booking Request</h3><p>Hello <strong>${owner.name}</strong>,</p><p>You have received a new booking request for <strong>${equipment.name}</strong> from <strong>${req.user.name || 'a renter'}</strong>.</p><ul><li><strong>Dates:</strong> ${requestedStart.toDateString()} to ${requestedEnd.toDateString()}</li><li><strong>Total:</strong> ₹${totalPrice}</li></ul><p>Please log in to your AgriRent account to review the request.</p>`,
        });
      }
    }).catch((err) => console.error('Error fetching owner for email:', err.message));

    return res.status(201).json({
      success: true,
      message: 'Booking request created successfully',
      data: populatedBooking,
    });
  } catch (error) {
    console.error('Create booking error:', error);
    return res.status(500).json({
      success: false,
      message: error.message || 'Server error creating booking',
    });
  }
};

// @desc    Get all bookings made by logged-in renter
// @route   GET /api/bookings/my
// @access  Private (role: renter)
const getMyBookings = async (req, res) => {
  try {
    const bookings = await Booking.find({ renterId: req.user._id })
      .populate('equipmentId', 'name type images pricePerDay locationName')
      .populate('ownerId', 'name email phone')
      .sort({ createdAt: -1 });

    return res.status(200).json({
      success: true,
      count: bookings.length,
      data: bookings,
    });
  } catch (error) {
    console.error('Get my bookings error:', error);
    return res.status(500).json({
      success: false,
      message: error.message || 'Server error fetching your bookings',
    });
  }
};

// @desc    Get all bookings for equipment owned by logged-in owner
// @route   GET /api/bookings/owner
// @access  Private (role: owner)
const getOwnerBookings = async (req, res) => {
  try {
    const bookings = await Booking.find({ ownerId: req.user._id })
      .populate('renterId', 'name email phone')
      .populate('equipmentId', 'name type images pricePerDay locationName')
      .sort({ createdAt: -1 });

    return res.status(200).json({
      success: true,
      count: bookings.length,
      data: bookings,
    });
  } catch (error) {
    console.error('Get owner bookings error:', error);
    return res.status(500).json({
      success: false,
      message: error.message || 'Server error fetching owner bookings',
    });
  }
};

// @desc    Owner confirms a pending booking & auto-rejects overlapping pending requests
// @route   PATCH /api/bookings/:id/confirm
// @access  Private (role: owner)
const confirmBooking = async (req, res) => {
  try {
    const booking = await Booking.findById(req.params.id);

    if (!booking) {
      return res.status(404).json({
        success: false,
        message: 'Booking not found',
      });
    }

    // Verify ownership
    if (booking.ownerId.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Only the equipment owner can confirm this booking',
      });
    }

    if (booking.status !== 'pending') {
      return res.status(400).json({
        success: false,
        message: `Cannot confirm booking with status '${booking.status}'`,
      });
    }

    // Auto-reject any OTHER "pending" bookings for the same equipment with overlapping dates
    const autoRejectResult = await Booking.updateMany(
      {
        _id: { $ne: booking._id },
        equipmentId: booking.equipmentId,
        status: 'pending',
        startDate: { $lte: booking.endDate },
        endDate: { $gte: booking.startDate },
      },
      {
        $set: { status: 'rejected' },
      }
    );

    booking.status = 'awaiting_payment';
    await booking.save();

    const populatedBooking = await Booking.findById(booking._id)
      .populate('equipmentId', 'name type images pricePerDay')
      .populate('renterId', 'name email phone');

    // Send email to renter asking them to complete payment (fire-and-forget)
    const renter = populatedBooking.renterId;
    const equipName = populatedBooking.equipmentId?.name || 'Equipment';
    if (renter && renter.email) {
      sendEmailNotification({
        to: renter.email,
        subject: `🎉 Booking Approved! Please Complete Payment for "${equipName}"`,
        text: `Hello ${renter.name},\n\nGreat news! Your booking request for "${equipName}" has been approved by the owner.\nTotal Amount: ₹${populatedBooking.totalPrice}\n\nPlease log in to your AgriRent dashboard and complete payment to confirm your reservation.`,
        html: `<h3>Booking Approved!</h3><p>Hello <strong>${renter.name}</strong>,</p><p>Great news! Your booking request for <strong>${equipName}</strong> has been approved by the owner.</p><p><strong>Total Amount:</strong> ₹${populatedBooking.totalPrice}</p><p>Please log in to your AgriRent dashboard and click <strong>Pay Now</strong> to confirm your reservation.</p>`,
      });
    }

    return res.status(200).json({
      success: true,
      message: `Booking approved by owner. Status is now awaiting payment from renter. ${autoRejectResult.modifiedCount} overlapping pending booking(s) were automatically rejected.`,
      autoRejectedCount: autoRejectResult.modifiedCount,
      data: populatedBooking,
    });
  } catch (error) {
    console.error('Confirm booking error:', error);
    return res.status(500).json({
      success: false,
      message: error.message || 'Server error confirming booking',
    });
  }
};

// @desc    Owner rejects a pending booking
// @route   PATCH /api/bookings/:id/reject
// @access  Private (role: owner)
const rejectBooking = async (req, res) => {
  try {
    const booking = await Booking.findById(req.params.id);

    if (!booking) {
      return res.status(404).json({
        success: false,
        message: 'Booking not found',
      });
    }

    if (booking.ownerId.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Only the equipment owner can reject this booking',
      });
    }

    if (['completed', 'cancelled'].includes(booking.status)) {
      return res.status(400).json({
        success: false,
        message: `Cannot reject booking with status '${booking.status}'`,
      });
    }

    booking.status = 'rejected';
    await booking.save();

    // Fire-and-forget rejection email to renter
    Booking.findById(booking._id).populate('renterId').populate('equipmentId').then((pop) => {
      if (pop?.renterId?.email) {
        const equipTitle = pop.equipmentId?.name || 'Equipment';
        sendEmailNotification({
          to: pop.renterId.email,
          subject: `Booking Request Declined for "${equipTitle}"`,
          text: `Hello ${pop.renterId.name},\n\nYour booking request for "${equipTitle}" was declined by the equipment owner. You can browse other available equipment on AgriRent.`,
          html: `<h3>Booking Request Declined</h3><p>Hello <strong>${pop.renterId.name}</strong>,</p><p>Your booking request for <strong>${equipTitle}</strong> was declined by the equipment owner. You can browse other available equipment on AgriRent.</p>`,
        });
      }
    }).catch((e) => console.error(e.message));

    return res.status(200).json({
      success: true,
      message: 'Booking rejected successfully',
      data: booking,
    });
  } catch (error) {
    console.error('Reject booking error:', error);
    return res.status(500).json({
      success: false,
      message: error.message || 'Server error rejecting booking',
    });
  }
};

// @desc    Cancel booking (renter who created it OR equipment owner)
// @route   PATCH /api/bookings/:id/cancel
// @access  Private (role: renter or owner)
const cancelBooking = async (req, res) => {
  try {
    const booking = await Booking.findById(req.params.id);

    if (!booking) {
      return res.status(404).json({
        success: false,
        message: 'Booking not found',
      });
    }

    const isRenter = booking.renterId.toString() === req.user._id.toString();
    const isOwner = booking.ownerId.toString() === req.user._id.toString();

    if (!isRenter && !isOwner && req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to cancel this booking',
      });
    }

    if (!['pending', 'awaiting_payment', 'confirmed'].includes(booking.status)) {
      return res.status(400).json({
        success: false,
        message: `Cannot cancel a booking that is already '${booking.status}'`,
      });
    }

    booking.status = 'cancelled';
    await booking.save();

    // Fire-and-forget cancellation email to the other party
    Booking.findById(booking._id).populate('renterId').populate('ownerId').populate('equipmentId').then((pop) => {
      if (!pop) return;
      const equipTitle = pop.equipmentId?.name || 'Equipment';
      if (isRenter && pop.ownerId?.email) {
        sendEmailNotification({
          to: pop.ownerId.email,
          subject: `Booking Cancelled for "${equipTitle}"`,
          text: `Hello ${pop.ownerId.name},\n\nThe renter (${pop.renterId?.name || 'Renter'}) has cancelled their reservation for "${equipTitle}".`,
          html: `<p>Hello <strong>${pop.ownerId.name}</strong>,</p><p>The renter (<strong>${pop.renterId?.name || 'Renter'}</strong>) has cancelled their reservation for <strong>${equipTitle}</strong>.</p>`,
        });
      } else if (isOwner && pop.renterId?.email) {
        sendEmailNotification({
          to: pop.renterId.email,
          subject: `Booking Cancelled for "${equipTitle}"`,
          text: `Hello ${pop.renterId.name},\n\nThe equipment owner has cancelled your reservation for "${equipTitle}".`,
          html: `<p>Hello <strong>${pop.renterId.name}</strong>,</p><p>The equipment owner has cancelled your reservation for <strong>${equipTitle}</strong>.</p>`,
        });
      }
    }).catch((e) => console.error(e.message));

    return res.status(200).json({
      success: true,
      message: 'Booking cancelled successfully',
      data: booking,
    });
  } catch (error) {
    console.error('Cancel booking error:', error);
    return res.status(500).json({
      success: false,
      message: error.message || 'Server error cancelling booking',
    });
  }
};

// @desc    Owner marks confirmed booking as completed after rental period ends
// @route   PATCH /api/bookings/:id/complete
// @access  Private (role: owner)
const completeBooking = async (req, res) => {
  try {
    const booking = await Booking.findById(req.params.id);

    if (!booking) {
      return res.status(404).json({
        success: false,
        message: 'Booking not found',
      });
    }

    if (booking.ownerId.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Only the equipment owner can complete this booking',
      });
    }

    if (booking.status !== 'confirmed') {
      return res.status(400).json({
        success: false,
        message: 'Only confirmed bookings can be marked as completed',
      });
    }

    // Check that endDate has passed
    const now = new Date();
    if (new Date(booking.endDate) > now) {
      return res.status(400).json({
        success: false,
        message: 'Cannot mark booking as completed before the rental end date has passed',
      });
    }

    booking.status = 'completed';
    await booking.save();

    // Ensure equipment's isAvailable is set back to true
    await Equipment.findByIdAndUpdate(booking.equipmentId, { isAvailable: true });

    return res.status(200).json({
      success: true,
      message: 'Booking marked as completed successfully',
      data: booking,
    });
  } catch (error) {
    console.error('Complete booking error:', error);
    return res.status(500).json({
      success: false,
      message: error.message || 'Server error completing booking',
    });
  }
};

module.exports = {
  createBooking,
  getMyBookings,
  getOwnerBookings,
  confirmBooking,
  rejectBooking,
  cancelBooking,
  completeBooking,
};
