const Equipment = require('../models/Equipment');
const User = require('../models/User');
const Booking = require('../models/Booking');
const Report = require('../models/Report');
const { sendEmailNotification } = require('../utils/sendEmail');

// @desc    Get all pending equipment listings
// @route   GET /api/admin/listings/pending
// @access  Private (Admin)
const getPendingListings = async (req, res) => {
  try {
    const listings = await Equipment.find({ status: 'pending' })
      .populate('ownerId', 'name email phone location')
      .sort({ createdAt: -1 });

    return res.status(200).json({
      success: true,
      count: listings.length,
      data: listings,
    });
  } catch (error) {
    console.error('Error fetching pending listings:', error);
    return res.status(500).json({
      success: false,
      message: error.message || 'Server error fetching pending listings',
    });
  }
};

// @desc    Approve an equipment listing
// @route   PATCH /api/admin/listings/:id/approve
// @access  Private (Admin)
const approveListing = async (req, res) => {
  try {
    const equipment = await Equipment.findById(req.params.id);

    if (!equipment) {
      return res.status(404).json({
        success: false,
        message: 'Equipment listing not found',
      });
    }

    equipment.status = 'approved';
    equipment.rejectionReason = '';
    await equipment.save();

    const populated = await Equipment.findById(equipment._id).populate(
      'ownerId',
      'name email phone'
    );

    if (populated?.ownerId?.email) {
      sendEmailNotification({
        to: populated.ownerId.email,
        subject: `🎉 Your Equipment Listing "${equipment.name}" Has Been Approved!`,
        text: `Hello ${populated.ownerId.name},\n\nGreat news! Your equipment listing for "${equipment.name}" has been approved by the platform administrators and is now live for farmers and renters to book.`,
        html: `<h3>Listing Approved!</h3><p>Hello <strong>${populated.ownerId.name}</strong>,</p><p>Great news! Your equipment listing for <strong>${equipment.name}</strong> has been reviewed and approved by administrators. It is now live on the platform for renters to book.</p>`,
      });
    }

    return res.status(200).json({
      success: true,
      message: `Equipment "${equipment.name}" has been approved.`,
      data: populated,
    });
  } catch (error) {
    console.error('Error approving listing:', error);
    return res.status(500).json({
      success: false,
      message: error.message || 'Server error approving listing',
    });
  }
};

// @desc    Reject an equipment listing
// @route   PATCH /api/admin/listings/:id/reject
// @access  Private (Admin)
const rejectListing = async (req, res) => {
  try {
    const { reason, rejectionReason } = req.body;
    const finalReason =
      reason || rejectionReason || 'Listing does not meet quality or safety guidelines.';

    const equipment = await Equipment.findById(req.params.id);

    if (!equipment) {
      return res.status(404).json({
        success: false,
        message: 'Equipment listing not found',
      });
    }

    equipment.status = 'rejected';
    equipment.rejectionReason = finalReason.trim();
    await equipment.save();

    const populated = await Equipment.findById(equipment._id).populate(
      'ownerId',
      'name email phone'
    );

    if (populated?.ownerId?.email) {
      sendEmailNotification({
        to: populated.ownerId.email,
        subject: `Update on Your Equipment Listing "${equipment.name}"`,
        text: `Hello ${populated.ownerId.name},\n\nYour equipment listing for "${equipment.name}" was not approved.\nReason: ${finalReason.trim()}\n\nYou can edit and re-submit your listing from your dashboard.`,
        html: `<h3>Listing Review Update</h3><p>Hello <strong>${populated.ownerId.name}</strong>,</p><p>Your equipment listing for <strong>${equipment.name}</strong> was not approved.</p><p><strong>Reason provided:</strong> ${finalReason.trim()}</p><p>You can make the required adjustments and re-submit from your dashboard.</p>`,
      });
    }

    return res.status(200).json({
      success: true,
      message: `Equipment "${equipment.name}" has been rejected.`,
      data: populated,
    });
  } catch (error) {
    console.error('Error rejecting listing:', error);
    return res.status(500).json({
      success: false,
      message: error.message || 'Server error rejecting listing',
    });
  }
};

// @desc    Get all equipment listings across all statuses
// @route   GET /api/admin/listings
// @access  Private (Admin)
const getAllListings = async (req, res) => {
  try {
    const query = {};
    if (req.query.status && req.query.status !== 'all') {
      query.status = req.query.status.toLowerCase().trim();
    }

    const listings = await Equipment.find(query)
      .populate('ownerId', 'name email phone location')
      .sort({ createdAt: -1 });

    return res.status(200).json({
      success: true,
      count: listings.length,
      data: listings,
    });
  } catch (error) {
    console.error('Error fetching all listings:', error);
    return res.status(500).json({
      success: false,
      message: error.message || 'Server error fetching listings',
    });
  }
};

// @desc    Get all registered users
// @route   GET /api/admin/users
// @access  Private (Admin)
const getAllUsers = async (req, res) => {
  try {
    const users = await User.find()
      .select('-password')
      .sort({ createdAt: -1 });

    return res.status(200).json({
      success: true,
      count: users.length,
      data: users,
    });
  } catch (error) {
    console.error('Error fetching users:', error);
    return res.status(500).json({
      success: false,
      message: error.message || 'Server error fetching users',
    });
  }
};

// @desc    Ban a user
// @route   PATCH /api/admin/users/:id/ban
// @access  Private (Admin)
const banUser = async (req, res) => {
  try {
    const userToBan = await User.findById(req.params.id);

    if (!userToBan) {
      return res.status(404).json({
        success: false,
        message: 'User not found',
      });
    }

    // Safety: Prevent banning admins or oneself
    if (userToBan._id.toString() === req.user._id.toString()) {
      return res.status(400).json({
        success: false,
        message: 'You cannot ban your own account.',
      });
    }

    if (userToBan.role === 'admin') {
      return res.status(400).json({
        success: false,
        message: 'Admin accounts cannot be banned.',
      });
    }

    userToBan.banned = true;
    await userToBan.save();

    // Auto-cancel unfinalized bookings (pending or awaiting_payment) where user is renter or owner
    const cancelResult = await Booking.updateMany(
      {
        $or: [{ renterId: userToBan._id }, { ownerId: userToBan._id }],
        status: { $in: ['pending', 'awaiting_payment'] },
      },
      { $set: { status: 'cancelled' } }
    );

    const autoCancelledCount =
      cancelResult.modifiedCount !== undefined
        ? cancelResult.modifiedCount
        : cancelResult.nModified || 0;

    // Count untouched confirmed bookings (already paid) that need manual admin attention
    const confirmedCount = await Booking.countDocuments({
      $or: [{ renterId: userToBan._id }, { ownerId: userToBan._id }],
      status: 'confirmed',
    });

    return res.status(200).json({
      success: true,
      message: `User "${userToBan.name}" has been banned.`,
      data: {
        _id: userToBan._id,
        name: userToBan.name,
        email: userToBan.email,
        role: userToBan.role,
        banned: userToBan.banned,
      },
      autoCancelledCount,
      confirmedBookingsCount: confirmedCount,
    });
  } catch (error) {
    console.error('Error banning user:', error);
    return res.status(500).json({
      success: false,
      message: error.message || 'Server error banning user',
    });
  }
};

// @desc    Unban a user
// @route   PATCH /api/admin/users/:id/unban
// @access  Private (Admin)
const unbanUser = async (req, res) => {
  try {
    const userToUnban = await User.findById(req.params.id);

    if (!userToUnban) {
      return res.status(404).json({
        success: false,
        message: 'User not found',
      });
    }

    userToUnban.banned = false;
    await userToUnban.save();

    return res.status(200).json({
      success: true,
      message: `User "${userToUnban.name}" has been unbanned.`,
      data: {
        _id: userToUnban._id,
        name: userToUnban.name,
        email: userToUnban.email,
        role: userToUnban.role,
        banned: userToUnban.banned,
      },
    });
  } catch (error) {
    console.error('Error unbanning user:', error);
    return res.status(500).json({
      success: false,
      message: error.message || 'Server error unbanning user',
    });
  }
};

// @desc    Get moderation overview statistics
// @route   GET /api/admin/stats
// @access  Private (Admin)
const getStats = async (req, res) => {
  try {
    const [
      totalUsers,
      totalOwners,
      totalRenters,
      totalAdmins,
      bannedUsers,
      totalEquipment,
      pendingEquipment,
      approvedEquipment,
      rejectedEquipment,
      totalBookings,
      pendingBookings,
      confirmedBookings,
      completedBookings,
      cancelledBookings,
      openReports,
    ] = await Promise.all([
      User.countDocuments(),
      User.countDocuments({ role: 'owner' }),
      User.countDocuments({ role: 'renter' }),
      User.countDocuments({ role: 'admin' }),
      User.countDocuments({ banned: true }),
      Equipment.countDocuments(),
      Equipment.countDocuments({ status: 'pending' }),
      Equipment.countDocuments({ status: 'approved' }),
      Equipment.countDocuments({ status: 'rejected' }),
      Booking.countDocuments(),
      Booking.countDocuments({ status: 'pending' }),
      Booking.countDocuments({ status: 'confirmed' }),
      Booking.countDocuments({ status: 'completed' }),
      Booking.countDocuments({ status: 'cancelled' }),
      Report.countDocuments({ status: 'open' }),
    ]);

    return res.status(200).json({
      success: true,
      data: {
        users: {
          total: totalUsers,
          owners: totalOwners,
          renters: totalRenters,
          admins: totalAdmins,
          banned: bannedUsers,
        },
        equipment: {
          total: totalEquipment,
          pending: pendingEquipment,
          approved: approvedEquipment,
          rejected: rejectedEquipment,
        },
        bookings: {
          total: totalBookings,
          pending: pendingBookings,
          confirmed: confirmedBookings,
          completed: completedBookings,
          cancelled: cancelledBookings,
        },
        reports: {
          open: openReports,
        },
      },
    });
  } catch (error) {
    console.error('Error fetching admin stats:', error);
    return res.status(500).json({
      success: false,
      message: error.message || 'Server error fetching statistics',
    });
  }
};

module.exports = {
  getPendingListings,
  approveListing,
  rejectListing,
  getAllListings,
  getAllUsers,
  banUser,
  unbanUser,
  getStats,
};
