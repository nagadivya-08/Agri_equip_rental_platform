const mongoose = require('mongoose');

const equipmentSchema = new mongoose.Schema({
  ownerId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: [true, 'Equipment must belong to an owner'],
  },
  name: {
    type: String,
    required: [true, 'Please provide equipment name'],
    trim: true,
  },
  type: {
    type: String,
    required: [true, 'Please specify equipment type'],
    enum: {
      values: [
        'tractor',
        'power_tiller',
        'tiller',
        'rotavator',
        'plough',
        'cultivator',
        'disc_harrow',
        'land_leveler',
        'seed_drill',
        'planter',
        'transplanter',
        'water_pump',
        'sprinkler_system',
        'combine_harvester',
        'harvester',
        'reaper',
        'thresher',
        'chaff_cutter',
        'rice_mill',
        'grain_dryer',
        'trailer',
        'power_sprayer',
        'sprayer',
        'drone_sprayer',
        'drone',
        'baler',
        'weeder',
        'other',
      ],
      message: '{VALUE} is not a supported equipment type',
    },
    lowercase: true,
  },
  description: {
    type: String,
    default: '',
    trim: true,
  },
  images: {
    type: [String],
    default: [],
  },
  pricePerDay: {
    type: Number,
    required: [true, 'Please specify price per day'],
    min: [0, 'Price per day cannot be negative'],
  },
  location: {
    type: {
      type: String,
      enum: ['Point'],
      default: 'Point',
    },
    coordinates: {
      type: [Number], // [longitude, latitude]
      default: [0, 0],
    },
  },
  locationName: {
    type: String,
    default: '',
    trim: true,
  },
  status: {
    type: String,
    enum: ['pending', 'approved', 'rejected'],
    default: 'approved',
  },
  rejectionReason: {
    type: String,
    default: '',
    trim: true,
  },
  isAvailable: {
    type: Boolean,
    default: true,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

// Create 2dsphere index for geospatial queries
equipmentSchema.index({ location: '2dsphere' });

const Equipment = mongoose.model('Equipment', equipmentSchema);

module.exports = Equipment;
