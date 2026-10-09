/**
 * ══════════════════════════════════════════════════════════════
 *  Auth Middleware (JWT Verification & Refresh Token Rotation)
 *  (PO5 — Modern Tool Usage, PO6 — Security & Privacy)
 * ══════════════════════════════════════════════════════════════
 */

const jwt = require('jsonwebtoken');
const { User } = require('../models');

/**
 * Protect routes: Validates Bearer access token and attaches authenticated user
 */
const verifyToken = async (req, res, next) => {
  try {
    let token;

    if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
      token = req.headers.authorization.split(' ')[1];
    }

    if (!token) {
      return res.status(401).json({
        success: false,
        message: 'Access denied: Authentication token required',
      });
    }

    // Verify token signature
    const decoded = jwt.verify(token, process.env.JWT_ACCESS_SECRET);

    // Retrieve active user
    const user = await User.findById(decoded.id);
    if (!user || !user.isActive) {
      return res.status(401).json({
        success: false,
        message: 'User no longer exists or account has been deactivated',
      });
    }

    req.user = user;
    next();
  } catch (error) {
    if (error.name === 'TokenExpiredError') {
      return res.status(401).json({
        success: false,
        code: 'TOKEN_EXPIRED',
        message: 'Access token expired. Please refresh your session.',
      });
    }
    return res.status(401).json({
      success: false,
      message: 'Invalid access token signature',
    });
  }
};

/**
 * Optional authentication: Attaches user if valid token present, otherwise proceeds
 */
const optionalAuth = async (req, res, next) => {
  try {
    let token;
    if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
      token = req.headers.authorization.split(' ')[1];
    }
    if (token) {
      const decoded = jwt.verify(token, process.env.JWT_ACCESS_SECRET);
      req.user = await User.findById(decoded.id);
    }
  } catch (err) {
    // Proceed as unauthenticated guest
    req.user = null;
  }
  next();
};

module.exports = {
  verifyToken,
  optionalAuth,
};
