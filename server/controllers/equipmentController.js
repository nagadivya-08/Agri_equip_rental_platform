const Equipment = require('../models/Equipment');

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
      status: 'pending',
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

    // Filter by type
    if (type && type !== 'all') {
      query.type = type.toLowerCase().trim();
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

    return res.status(200).json({
      success: true,
      count: equipment.length,
      data: equipment,
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

    return res.status(200).json({
      success: true,
      count: equipment.length,
      data: equipment,
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

    return res.status(200).json({
      success: true,
      data: equipment,
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
      updateFields.pricePerDay = Number(pricePerDay);
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

module.exports = {
  createEquipment,
  getEquipment,
  getMyEquipment,
  getEquipmentById,
  updateEquipment,
  deleteEquipment,
};
