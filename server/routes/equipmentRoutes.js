const express = require('express');
const router = express.Router();
const {
  createEquipment,
  getEquipment,
  getMyEquipment,
  getEquipmentById,
  updateEquipment,
  deleteEquipment,
} = require('../controllers/equipmentController');
const { protect, authorizeRoles } = require('../middleware/authMiddleware');
const upload = require('../middleware/uploadMiddleware');

// Public routes
router.get('/', getEquipment);

// Owner protected routes
router.post(
  '/',
  protect,
  authorizeRoles('owner'),
  upload.array('images', 5),
  createEquipment
);

// Get listings of the current owner (MUST be before /:id)
router.get('/my', protect, authorizeRoles('owner'), getMyEquipment);

// Single equipment details
router.get('/:id', getEquipmentById);

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
