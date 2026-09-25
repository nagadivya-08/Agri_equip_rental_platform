const express = require('express');
const router = express.Router();
const {
  createEquipment,
  getEquipment,
  getMyEquipment,
  getEquipmentById,
  updateEquipment,
  deleteEquipment,
  getEquipmentAvailability,
} = require('../controllers/equipmentController');
const { protect, authorizeRoles } = require('../middleware/authMiddleware');
const upload = require('../middleware/uploadMiddleware');
const { equipmentValidation } = require('../middleware/validators');

// Renter-only equipment browsing route
router.get('/', protect, authorizeRoles('renter'), getEquipment);

// Owner protected routes
router.post(
  '/',
  protect,
  authorizeRoles('owner'),
  upload.array('images', 5),
  equipmentValidation,
  createEquipment
);

// Get listings of the current owner (MUST be before /:id)
router.get('/my', protect, authorizeRoles('owner'), getMyEquipment);

// Single equipment details
router.get('/:id', getEquipmentById);

// Equipment confirmed booking availability (for calendar)
router.get('/:id/availability', getEquipmentAvailability);

// Equipment reviews
const { getEquipmentReviews } = require('../controllers/reviewController');
router.get('/:id/reviews', getEquipmentReviews);

// Update equipment
router.patch(
  '/:id',
  protect,
  authorizeRoles('owner'),
  upload.array('images', 5),
  updateEquipment
);

// Delete equipment (owner or admin)
router.delete('/:id', protect, deleteEquipment);

module.exports = router;
