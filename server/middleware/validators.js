const { body, validationResult } = require('express-validator');

/**
 * Middleware that inspects validation results from express-validator
 * and halts the request with HTTP 400 if validation fails.
 */
const validate = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({
      success: false,
      message: 'Validation failed. Please check your inputs.',
      errors: errors.array().map((err) => ({
        field: err.path,
        message: err.msg,
      })),
    });
  }
  next();
};

// ==========================================
// Authentication Validators
// ==========================================
const registerValidation = [
  body('name')
    .trim()
    .notEmpty()
    .withMessage('Full name is required')
    .isLength({ min: 2, max: 50 })
    .withMessage('Name must be between 2 and 50 characters'),
  body('email')
    .trim()
    .notEmpty()
    .withMessage('Email address is required')
    .isEmail()
    .withMessage('Please provide a valid email address')
    .normalizeEmail(),
  body('password')
    .notEmpty()
    .withMessage('Password is required')
    .isLength({ min: 6 })
    .withMessage('Password must be at least 6 characters long'),
  body('role')
    .optional()
    .isIn(['renter', 'owner', 'admin'])
    .withMessage('Role must be one of: renter, owner, admin'),
  body('phone')
    .optional()
    .trim(),
  validate,
];

const loginValidation = [
  body('email')
    .trim()
    .notEmpty()
    .withMessage('Email is required')
    .isEmail()
    .withMessage('Please provide a valid email address'),
  body('password')
    .notEmpty()
    .withMessage('Password is required'),
  validate,
];

// ==========================================
// Equipment Validators
// ==========================================
const equipmentValidation = [
  body('name')
    .trim()
    .notEmpty()
    .withMessage('Equipment name is required')
    .isLength({ min: 2, max: 100 })
    .withMessage('Name must be between 2 and 100 characters'),
  body('type')
    .trim()
    .notEmpty()
    .withMessage('Equipment type is required')
    .isIn(['tractor', 'harvester', 'sprayer', 'tiller', 'drone', 'other'])
    .withMessage('Unsupported equipment type'),
  body('pricePerDay')
    .notEmpty()
    .withMessage('Price per day is required')
    .isFloat({ min: 0 })
    .withMessage('Price per day must be a non-negative number'),
  body('locationName')
    .optional()
    .trim(),
  validate,
];

// ==========================================
// Booking Validators
// ==========================================
const bookingValidation = [
  body('equipmentId')
    .notEmpty()
    .withMessage('Equipment ID is required')
    .isMongoId()
    .withMessage('Invalid equipment ID format'),
  body('startDate')
    .notEmpty()
    .withMessage('Start date is required')
    .isISO8601()
    .withMessage('Start date must be a valid date'),
  body('endDate')
    .notEmpty()
    .withMessage('End date is required')
    .isISO8601()
    .withMessage('End date must be a valid date')
    .custom((endDateVal, { req }) => {
      if (new Date(endDateVal) < new Date(req.body.startDate)) {
        throw new Error('End date must be on or after start date');
      }
      return true;
    }),
  validate,
];

// ==========================================
// Review Validators
// ==========================================
const reviewValidation = [
  body('bookingId')
    .notEmpty()
    .withMessage('Booking ID is required')
    .isMongoId()
    .withMessage('Invalid booking ID format'),
  body('rating')
    .notEmpty()
    .withMessage('Rating score is required')
    .isInt({ min: 1, max: 5 })
    .withMessage('Rating must be an integer between 1 and 5'),
  body('comment')
    .optional()
    .trim()
    .isLength({ max: 500 })
    .withMessage('Comment cannot exceed 500 characters'),
  validate,
];

// ==========================================
// Report Validators
// ==========================================
const reportValidation = [
  body('listingId')
    .notEmpty()
    .withMessage('Listing ID is required')
    .isMongoId()
    .withMessage('Invalid listing ID format'),
  body('reason')
    .notEmpty()
    .withMessage('Report reason is required')
    .isIn(['inaccurate_info', 'damaged_equipment', 'unresponsive_owner', 'fraudulent', 'other'])
    .withMessage('Unsupported report reason category'),
  body('comment')
    .optional()
    .trim()
    .isLength({ max: 500 })
    .withMessage('Comment cannot exceed 500 characters'),
  validate,
];

module.exports = {
  validate,
  registerValidation,
  loginValidation,
  equipmentValidation,
  bookingValidation,
  reviewValidation,
  reportValidation,
};
