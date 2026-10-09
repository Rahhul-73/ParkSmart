/**
 * ══════════════════════════════════════════════════════════════
 *  Centralized Error Handling Middleware
 *  (PO3 — Design/Development: Uniform JSON error contracts)
 * ══════════════════════════════════════════════════════════════
 */

class ApiError extends Error {
  constructor(statusCode, message) {
    super(message);
    this.statusCode = statusCode;
    this.name = 'ApiError';
  }
}

const errorHandler = (err, req, res, _next) => {
  let statusCode = err.statusCode || 500;
  let message = err.message || 'Internal Server Error';

  // CastError: invalid MongoDB ObjectId
  if (err.name === 'CastError') {
    statusCode = 400;
    message = `Resource not found with specified identifier format: '${err.value}'`;
  }

  // Duplicate key (E11000)
  if (err.code === 11000) {
    statusCode = 409;
    const field = Object.keys(err.keyValue || {})[0] || 'field';
    message = `Duplicate record: A document with this '${field}' already exists.`;
  }

  // Mongoose Validation error
  if (err.name === 'ValidationError') {
    statusCode = 400;
    const errors = Object.values(err.errors).map((el) => el.message);
    message = errors.join('. ');
  }

  // JWT errors
  if (err.name === 'JsonWebTokenError') {
    statusCode = 401;
    message = 'Invalid authentication token signature';
  }
  if (err.name === 'TokenExpiredError') {
    statusCode = 401;
    message = 'Authentication token expired. Please refresh session.';
  }

  // Express validator or custom payload
  if (err.errors && Array.isArray(err.errors)) {
    statusCode = 400;
    message = err.errors.map((e) => e.msg).join(', ');
  }

  res.status(statusCode).json({
    success: false,
    message,
    ...(process.env.NODE_ENV === 'development' && {
      stack: err.stack,
      rawError: err.message,
    }),
  });
};

module.exports = errorHandler;
module.exports.ApiError = ApiError;
