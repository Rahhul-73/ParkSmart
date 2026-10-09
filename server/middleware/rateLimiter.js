/**
 * ══════════════════════════════════════════════════════════════
 *  Rate Limiting Security Middleware
 *  (PO6 — Security: DoS prevention & Brute-force protection)
 * ══════════════════════════════════════════════════════════════
 */

const rateLimit = require('express-rate-limit');

/**
 * General API Rate Limiter: 100 requests per 15 minutes per IP
 */
const generalLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // 100 requests per window
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    success: false,
    message: 'Too many requests from this IP address. Please try again after 15 minutes.',
  },
});

/**
 * Strict Auth Rate Limiter: 5 requests per 15 minutes per IP (Brute-force protection)
 */
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 5, // Strict limit for sensitive login/otp/reset endpoints
  standardHeaders: true,
  legacyHeaders: false,
  skipSuccessfulRequests: false,
  message: {
    success: false,
    message: 'Too many authentication attempts. Account access throttled for 15 minutes.',
  },
});

/**
 * Reservation write limiter (prevent reservation floods/bots)
 */
const reservationLimiter = rateLimit({
  windowMs: 1 * 60 * 1000, // 1 minute
  max: 10,
  message: {
    success: false,
    message: 'High reservation frequency detected. Please slow down your requests.',
  },
});

module.exports = {
  generalLimiter,
  authLimiter,
  reservationLimiter,
};
