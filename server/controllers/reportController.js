const Report = require('../models/Report');
const Equipment = require('../models/Equipment');

// @desc    Submit a report for an equipment listing
// @route   POST /api/reports
// @access  Private (any authenticated user)
const createReport = async (req, res) => {
  try {
    const { listingId, reason } = req.body;

    if (!listingId || !reason || reason.trim() === '') {
      return res.status(400).json({
        success: false,
        message: 'Please provide listingId and a reason for reporting',
      });
    }

    const equipment = await Equipment.findById(listingId);
    if (!equipment) {
      return res.status(404).json({
        success: false,
        message: 'Equipment listing not found',
      });
    }

    const report = await Report.create({
      listingId,
      reporterId: req.user._id,
      reason: reason.trim(),
      status: 'open',
    });

    const populatedReport = await Report.findById(report._id)
      .populate('listingId', 'name type images status')
      .populate('reporterId', 'name email');

    return res.status(201).json({
      success: true,
      message: 'Report submitted successfully. Our team will review this listing.',
      data: populatedReport,
    });
  } catch (error) {
    console.error('Create report error:', error);
    return res.status(500).json({
      success: false,
      message: error.message || 'Server error creating report',
    });
  }
};

// @desc    Get all reports (Admin)
// @route   GET /api/reports or GET /api/admin/reports
// @access  Private (Admin only)
const getReports = async (req, res) => {
  try {
    const { status } = req.query;

    const query = {};
    if (status && status !== 'all') {
      query.status = status.toLowerCase().trim();
    } else if (!status) {
      // Default to open reports
      query.status = 'open';
    }

    const reports = await Report.find(query)
      .populate('listingId', 'name type images pricePerDay locationName status')
      .populate('reporterId', 'name email phone')
      .sort({ createdAt: -1 });

    return res.status(200).json({
      success: true,
      count: reports.length,
      data: reports,
    });
  } catch (error) {
    console.error('Get reports error:', error);
    return res.status(500).json({
      success: false,
      message: error.message || 'Server error fetching reports',
    });
  }
};

// @desc    Dismiss a report (Admin)
// @route   PATCH /api/reports/:id/dismiss or PATCH /api/admin/reports/:id/dismiss
// @access  Private (Admin only)
const dismissReport = async (req, res) => {
  try {
    const report = await Report.findById(req.params.id);

    if (!report) {
      return res.status(404).json({
        success: false,
        message: 'Report not found',
      });
    }

    report.status = 'dismissed';
    await report.save();

    const populatedReport = await Report.findById(report._id)
      .populate('listingId', 'name type images status')
      .populate('reporterId', 'name email');

    return res.status(200).json({
      success: true,
      message: 'Report dismissed successfully',
      data: populatedReport,
    });
  } catch (error) {
    console.error('Dismiss report error:', error);
    return res.status(500).json({
      success: false,
      message: error.message || 'Server error dismissing report',
    });
  }
};

// @desc    Resolve a report and optionally remove/reject the listing (Admin)
// @route   PATCH /api/reports/:id/resolve or PATCH /api/admin/reports/:id/resolve
// @access  Private (Admin only)
const resolveReport = async (req, res) => {
  try {
    const { action } = req.body;
    const report = await Report.findById(req.params.id);

    if (!report) {
      return res.status(404).json({
        success: false,
        message: 'Report not found',
      });
    }

    report.status = 'reviewed';
    await report.save();

    let listingActionTaken = false;
    if (action === 'remove_listing') {
      await Equipment.findByIdAndUpdate(report.listingId, {
        status: 'rejected',
        rejectionReason: 'Removed due to community report violation',
        isAvailable: false,
      });
      listingActionTaken = true;
    }

    const populatedReport = await Report.findById(report._id)
      .populate('listingId', 'name type images status rejectionReason')
      .populate('reporterId', 'name email');

    return res.status(200).json({
      success: true,
      message: listingActionTaken
        ? 'Report marked as reviewed and equipment listing was removed from the marketplace.'
        : 'Report marked as reviewed.',
      listingActionTaken,
      data: populatedReport,
    });
  } catch (error) {
    console.error('Resolve report error:', error);
    return res.status(500).json({
      success: false,
      message: error.message || 'Server error resolving report',
    });
  }
};

module.exports = {
  createReport,
  getReports,
  dismissReport,
  resolveReport,
};
