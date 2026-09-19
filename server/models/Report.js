const mongoose = require('mongoose');

const reportSchema = new mongoose.Schema({
  listingId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Equipment',
    required: [true, 'Report must be linked to an equipment listing'],
  },
  reporterId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: [true, 'Report must reference the reporting user'],
  },
  reason: {
    type: String,
    required: [true, 'Please specify a reason for this report'],
    trim: true,
  },
  status: {
    type: String,
    enum: {
      values: ['open', 'reviewed', 'dismissed'],
      message: '{VALUE} is not a valid report status',
    },
    default: 'open',
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

reportSchema.index({ status: 1 });
reportSchema.index({ listingId: 1 });

const Report = mongoose.model('Report', reportSchema);

module.exports = Report;
