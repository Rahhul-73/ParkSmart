/**
 * ══════════════════════════════════════════════════════════════
 *  Auth Routes (/api/auth)
 * ══════════════════════════════════════════════════════════════
 */

const router = require('express').Router();
const {
  register,
  login,
  refreshToken,
  logout,
  forgotPassword,
  verifyOtp,
  getMe,
} = require('../controllers/auth.controller');
const { verifyToken } = require('../middleware/authMiddleware');
const { authLimiter } = require('../middleware/rateLimiter');
const {
  validateRegister,
  validateLogin,
  validateForgotPassword,
  validateVerifyOtp,
} = require('../middleware/validate');

router.post('/register', authLimiter, validateRegister, register);
router.post('/login', authLimiter, validateLogin, login);
router.post('/refresh-token', refreshToken);
router.post('/refresh', refreshToken); // Alias for legacy support
router.post('/logout', verifyToken, logout);
router.post('/forgot-password', authLimiter, validateForgotPassword, forgotPassword);
router.post('/verify-otp', authLimiter, validateVerifyOtp, verifyOtp);
router.get('/me', verifyToken, getMe);

module.exports = router;
