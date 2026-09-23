const Equipment = require('../models/Equipment');
const Booking = require('../models/Booking');
const Review = require('../models/Review');

// @desc    Create new equipment listing
// @route   POST /api/equipment
// @access  Private (role: owner)
const createEquipment = async (req, res) => {
  try {
    const {
      name,
      type,
      description,
      pricePerDay,
      locationName,
      latitude,
      longitude,
    } = req.body;

    if (!name || !type || pricePerDay === undefined || pricePerDay === '') {
      return res.status(400).json({
        success: false,
        message: 'Please provide equipment name, type, and price per day',
      });
    }

    if (Number(pricePerDay) <= 0 || isNaN(Number(pricePerDay))) {
      return res.status(400).json({
        success: false,
        message: 'Price per day must be a positive number greater than zero',
      });
    }

    // Process uploaded images
    let imageUrls = [];
    if (req.files && req.files.length > 0) {
      imageUrls = req.files.map((file) => `/uploads/${file.filename}`);
    }

    // Build coordinates [lng, lat]
    const parsedLng = parseFloat(longitude);
    const parsedLat = parseFloat(latitude);
    const coordinates =
      !isNaN(parsedLng) && !isNaN(parsedLat)
        ? [parsedLng, parsedLat]
        : [0, 0];

    const equipment = await Equipment.create({
      ownerId: req.user._id,
      name: name.trim(),
      type: type.toLowerCase().trim(),
      description: description ? description.trim() : '',
      pricePerDay: Number(pricePerDay),
      images: imageUrls,
      location: {
        type: 'Point',
        coordinates,
      },
      locationName: locationName ? locationName.trim() : '',
      status: 'approved',
      isAvailable: true,
    });

    return res.status(201).json({
      success: true,
      data: equipment,
    });
  } catch (error) {
    console.error('Create equipment error:', error);
    return res.status(500).json({
      success: false,
      message: error.message || 'Server error creating equipment',
    });
  }
};

// @desc    Get all approved and available equipment with filters
// @route   GET /api/equipment
// @access  Public
const getEquipment = async (req, res) => {
  try {
    const { type, minPrice, maxPrice, search, lat, lng, maxDistance } = req.query;

    // Base filter: only approved and available equipment for public browsing
    const query = {
      status: 'approved',
      isAvailable: true,
    };

    // Filter by type (supports texting/searching by type, snake_case or human-readable)
    if (type && type.toLowerCase() !== 'all' && type.trim() !== '') {
      const normalized = type
        .toLowerCase()
        .trim()
        .replace(/agricultural\s*/i, '')
        .replace(/[\s_-]+/g, '[\\s_-]*');
      query.type = new RegExp(normalized, 'i');
    }

    // Filter by price range
    if (minPrice || maxPrice) {
      query.pricePerDay = {};
      if (minPrice) query.pricePerDay.$gte = Number(minPrice);
      if (maxPrice) query.pricePerDay.$lte = Number(maxPrice);
    }

    // Search by name or description
    if (search && search.trim() !== '') {
      const searchRegex = new RegExp(search.trim(), 'i');
      query.$or = [{ name: searchRegex }, { description: searchRegex }, { locationName: searchRegex }];
    }

    let isNearQuery = false;

    // Geospatial proximity query
    if (lat && lng) {
      const parsedLat = parseFloat(lat);
      const parsedLng = parseFloat(lng);
      if (!isNaN(parsedLat) && !isNaN(parsedLng)) {
        isNearQuery = true;
        const distanceInMeters = (parseFloat(maxDistance) || 50) * 1000;
        query.location = {
          $near: {
            $geometry: {
              type: 'Point',
              coordinates: [parsedLng, parsedLat],
            },
            $maxDistance: distanceInMeters,
          },
        };
      }
    }

    let queryBuilder = Equipment.find(query).populate('ownerId', 'name phone email');

    // If not using $near, sort by newest first (MongoDB does not allow .sort() with $near)
    if (!isNearQuery) {
      queryBuilder = queryBuilder.sort({ createdAt: -1 });
    }

    const equipment = await queryBuilder;

    // Aggregate average rating and review count for retrieved listings
    const equipmentIds = equipment.map((e) => e._id);
    const ratingStats = await Review.aggregate([
      { $match: { equipmentId: { $in: equipmentIds } } },
      {
        $group: {
          _id: '$equipmentId',
          averageRating: { $avg: '$rating' },
          reviewCount: { $sum: 1 },
        },
      },
    ]);

    const ratingMap = {};
    ratingStats.forEach((stat) => {
      ratingMap[stat._id.toString()] = {
        averageRating: Math.round(stat.averageRating * 10) / 10,
        reviewCount: stat.reviewCount,
      };
    });

    const dataWithRatings = equipment.map((item) => {
      const obj = item.toObject ? item.toObject() : { ...item };
      const stat = ratingMap[item._id.toString()];
      obj.averageRating = stat ? stat.averageRating : 0;
      obj.reviewCount = stat ? stat.reviewCount : 0;
      return obj;
    });

    return res.status(200).json({
      success: true,
      count: dataWithRatings.length,
      data: dataWithRatings,
    });
  } catch (error) {
    console.error('Get equipment error:', error);
    return res.status(500).json({
      success: false,
      message: error.message || 'Server error fetching equipment',
    });
  }
};

// @desc    Get equipment listings of the logged-in owner
// @route   GET /api/equipment/my
// @access  Private (role: owner)
const getMyEquipment = async (req, res) => {
  try {
    const equipment = await Equipment.find({ ownerId: req.user._id }).sort({
      createdAt: -1,
    });

    // Aggregate average rating and review count for owner's listings
    const equipmentIds = equipment.map((e) => e._id);
    const ratingStats = await Review.aggregate([
      { $match: { equipmentId: { $in: equipmentIds } } },
      {
        $group: {
          _id: '$equipmentId',
          averageRating: { $avg: '$rating' },
          reviewCount: { $sum: 1 },
        },
      },
    ]);

    const ratingMap = {};
    ratingStats.forEach((stat) => {
      ratingMap[stat._id.toString()] = {
        averageRating: Math.round(stat.averageRating * 10) / 10,
        reviewCount: stat.reviewCount,
      };
    });

    const dataWithRatings = equipment.map((item) => {
      const obj = item.toObject ? item.toObject() : { ...item };
      const stat = ratingMap[item._id.toString()];
      obj.averageRating = stat ? stat.averageRating : 0;
      obj.reviewCount = stat ? stat.reviewCount : 0;
      return obj;
    });

    return res.status(200).json({
      success: true,
      count: dataWithRatings.length,
      data: dataWithRatings,
    });
  } catch (error) {
    console.error('Get my equipment error:', error);
    return res.status(500).json({
      success: false,
      message: error.message || 'Server error fetching your equipment',
    });
  }
};

// @desc    Get single equipment details
// @route   GET /api/equipment/:id
// @access  Public
const getEquipmentById = async (req, res) => {
  try {
    const equipment = await Equipment.findById(req.params.id).populate(
      'ownerId',
      'name phone email'
    );

    if (!equipment) {
      return res.status(404).json({
        success: false,
        message: 'Equipment not found',
      });
    }

    const reviews = await Review.find({ equipmentId: req.params.id });
    const reviewCount = reviews.length;
    const averageRating =
      reviewCount > 0
        ? Math.round((reviews.reduce((acc, r) => acc + r.rating, 0) / reviewCount) * 10) / 10
        : 0;

    const equipObj = equipment.toObject ? equipment.toObject() : { ...equipment };
    equipObj.averageRating = averageRating;
    equipObj.reviewCount = reviewCount;

    return res.status(200).json({
      success: true,
      data: equipObj,
    });
  } catch (error) {
    console.error('Get equipment by ID error:', error);
    if (error.kind === 'ObjectId') {
      return res.status(404).json({
        success: false,
        message: 'Equipment not found with this ID',
      });
    }
    return res.status(500).json({
      success: false,
      message: error.message || 'Server error fetching equipment details',
    });
  }
};

// @desc    Update equipment listing
// @route   PATCH /api/equipment/:id
// @access  Private (role: owner of the equipment)
const updateEquipment = async (req, res) => {
  try {
    let equipment = await Equipment.findById(req.params.id);

    if (!equipment) {
      return res.status(404).json({
        success: false,
        message: 'Equipment not found',
      });
    }

    // Verify ownership
    if (equipment.ownerId.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to edit this equipment listing',
      });
    }

    const {
      name,
      type,
      description,
      pricePerDay,
      locationName,
      latitude,
      longitude,
      isAvailable,
      existingImages,
    } = req.body;

    const updateFields = {};

    if (name) updateFields.name = name.trim();
    if (type) updateFields.type = type.toLowerCase().trim();
    if (description !== undefined) updateFields.description = description.trim();
    if (pricePerDay !== undefined && pricePerDay !== '') {
      const parsedPrice = Number(pricePerDay);
      if (isNaN(parsedPrice) || parsedPrice <= 0) {
        return res.status(400).json({
          success: false,
          message: 'Price per day must be a positive number greater than zero',
        });
      }
      updateFields.pricePerDay = parsedPrice;
    }
    if (locationName !== undefined) updateFields.locationName = locationName.trim();
    if (isAvailable !== undefined) {
      updateFields.isAvailable = isAvailable === 'true' || isAvailable === true;
    }

    // Handle coordinates update
    if (latitude !== undefined || longitude !== undefined) {
      const currentCoords = equipment.location.coordinates || [0, 0];
      const parsedLng = longitude !== undefined ? parseFloat(longitude) : currentCoords[0];
      const parsedLat = latitude !== undefined ? parseFloat(latitude) : currentCoords[1];
      updateFields.location = {
        type: 'Point',
        coordinates: [
          !isNaN(parsedLng) ? parsedLng : currentCoords[0],
          !isNaN(parsedLat) ? parsedLat : currentCoords[1],
        ],
      };
    }

    // Handle images: preserve existing images and append newly uploaded ones
    let retainedImages = [];
    if (existingImages) {
      retainedImages = Array.isArray(existingImages)
        ? existingImages
        : [existingImages];
    } else if (req.body.preserveImages === 'true') {
      retainedImages = equipment.images;
    }

    if (req.files && req.files.length > 0) {
      const newImages = req.files.map((file) => `/uploads/${file.filename}`);
      updateFields.images = [...retainedImages, ...newImages].slice(0, 5);
    } else if (existingImages !== undefined) {
      updateFields.images = retainedImages.slice(0, 5);
    }

    // Crucial requirement: Owners CANNOT change the status directly
    delete updateFields.status;

    equipment = await Equipment.findByIdAndUpdate(
      req.params.id,
      { $set: updateFields },
      { new: true, runValidators: true }
    ).populate('ownerId', 'name phone email');

    return res.status(200).json({
      success: true,
      data: equipment,
    });
  } catch (error) {
    console.error('Update equipment error:', error);
    return res.status(500).json({
      success: false,
      message: error.message || 'Server error updating equipment',
    });
  }
};

// @desc    Delete equipment listing
// @route   DELETE /api/equipment/:id
// @access  Private (role: owner of the equipment or admin)
const deleteEquipment = async (req, res) => {
  try {
    const equipment = await Equipment.findById(req.params.id);

    if (!equipment) {
      return res.status(404).json({
        success: false,
        message: 'Equipment not found',
      });
    }

    // Verify ownership or admin role
    if (
      equipment.ownerId.toString() !== req.user._id.toString() &&
      req.user.role !== 'admin'
    ) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to delete this equipment listing',
      });
    }

    await Equipment.findByIdAndDelete(req.params.id);

    return res.status(200).json({
      success: true,
      message: 'Equipment deleted successfully',
    });
  } catch (error) {
    console.error('Delete equipment error:', error);
    return res.status(500).json({
      success: false,
      message: error.message || 'Server error deleting equipment',
    });
  }
};

// @desc    Get confirmed booking dates for an equipment (for calendar availability)
// @route   GET /api/equipment/:id/availability
// @access  Public
const getEquipmentAvailability = async (req, res) => {
  try {
    const bookings = await Booking.find({
      equipmentId: req.params.id,
      status: { $in: ['confirmed', 'awaiting_payment'] },
    }).select('startDate endDate');

    const availability = bookings.map((b) => ({
      startDate: b.startDate,
      endDate: b.endDate,
    }));

    return res.status(200).json({
      success: true,
      data: availability,
    });
  } catch (error) {
    console.error('Get equipment availability error:', error);
    return res.status(500).json({
      success: false,
      message: error.message || 'Server error fetching availability',
    });
  }
};

module.exports = {
  createEquipment,
  getEquipment,
  getMyEquipment,
  getEquipmentById,
  updateEquipment,
  deleteEquipment,
  getEquipmentAvailability,
};
