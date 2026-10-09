/**
 * ══════════════════════════════════════════════════════════════
 *  Express-Validator Schemas & Request Validation Middleware
 *  (PO5 — Modern Tool Usage: express-validator)
 * ══════════════════════════════════════════════════════════════
 */

const { body, query, param, validationResult } = require('express-validator');

/**
 * Middleware that inspects validation errors and returns 400 Bad Request
 */
const handleValidationErrors = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({
      success: false,
      message: 'Validation failed for request parameters',
      errors: errors.array().map((err) => ({
        field: err.path || err.param,
        message: err.msg,
      })),
    });
  }
  next();
};

// ─── AUTH SCHEMAS ───
const validateRegister = [
  body('name').trim().notEmpty().withMessage('Name is required').isLength({ min: 2, max: 50 }),
  body('email').trim().isEmail().withMessage('Valid email is required').normalizeEmail(),
  body('password')
    .isLength({ min: 6 })
    .withMessage('Password must be at least 6 characters long'),
  body('phone')
    .optional()
    .matches(/^\+?[\d\s-]{7,15}$/)
    .withMessage('Valid phone format required'),
  body('role')
    .optional()
    .isIn(['user', 'admin', 'operator'])
    .withMessage('Invalid role specified'),
  body('vehicleNumber')
    .optional()
    .trim()
    .toUpperCase(),
  handleValidationErrors,
];

const validateLogin = [
  body('email').trim().isEmail().withMessage('Valid email required').normalizeEmail(),
  body('password').notEmpty().withMessage('Password is required'),
  handleValidationErrors,
];

const validateForgotPassword = [
  body('email').trim().isEmail().withMessage('Valid registered email required').normalizeEmail(),
  handleValidationErrors,
];

const validateVerifyOtp = [
  body('email').trim().isEmail().withMessage('Valid email required').normalizeEmail(),
  body('otp').trim().isLength({ min: 6, max: 6 }).withMessage('OTP must be exactly 6 digits'),
  body('newPassword')
    .optional()
    .isLength({ min: 6 })
    .withMessage('New password must be at least 6 characters'),
  handleValidationErrors,
];

// ─── PARKING LOT SCHEMAS ───
const validateCreateLot = [
  body('name').trim().notEmpty().withMessage('Lot name is required'),
  body('address.city').trim().notEmpty().withMessage('City is required'),
  body('address.fullAddress').trim().notEmpty().withMessage('Full street address required'),
  body('coordinates.lat').isFloat({ min: -90, max: 90 }).withMessage('Valid latitude required'),
  body('coordinates.lng').isFloat({ min: -180, max: 180 }).withMessage('Valid longitude required'),
  body('totalSlots').isInt({ min: 1 }).withMessage('Total slots must be an integer >= 1'),
  body('pricePerHour').isFloat({ min: 0 }).withMessage('Price per hour must be >= 0'),
  handleValidationErrors,
];

// ─── SLOT SCHEMAS ───
const validateCreateSlot = [
  body('lotId').isMongoId().withMessage('Valid lotId ObjectId required'),
  body('slotNumber').trim().notEmpty().withMessage('Slot number required'),
  body('floor').isInt({ min: 0 }).withMessage('Floor must be non-negative integer'),
  body('type').isIn(['2-wheeler', '4-wheeler', 'EV', 'handicapped']).withMessage('Valid slot type required'),
  handleValidationErrors,
];

// ─── RESERVATION SCHEMAS ───
const validateCreateReservation = [
  body('slotId').isMongoId().withMessage('Valid slotId required'),
  body('lotId').isMongoId().withMessage('Valid lotId required'),
  body('startTime').isISO8601().withMessage('Valid ISO8601 start time required'),
  body('endTime').isISO8601().withMessage('Valid ISO8601 end time required'),
  body('vehicleNumber').trim().notEmpty().withMessage('Vehicle license number required'),
  handleValidationErrors,
];

// ─── PAYMENT SCHEMAS ───
const validateCreateOrder = [
  body('reservationId').isMongoId().withMessage('Valid reservationId required'),
  body('amount').isFloat({ min: 1 }).withMessage('Amount must be positive'),
  handleValidationErrors,
];

const validateWalletTopup = [
  body('amount').isFloat({ min: 10, max: 50000 }).withMessage('Topup amount must be between 10 and 50000'),
  handleValidationErrors,
];

module.exports = {
  handleValidationErrors,
  validateRegister,
  validateLogin,
  validateForgotPassword,
  validateVerifyOtp,
  validateCreateLot,
  validateCreateSlot,
  validateCreateReservation,
  validateCreateOrder,
  validateWalletTopup,
};
