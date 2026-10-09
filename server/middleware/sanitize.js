/**
 * ══════════════════════════════════════════════════════════════
 *  Sanitization Middleware (NoSQL Injection & XSS Cleansing)
 *  (PO6 — Security: Sanitization of incoming payload data)
 * ══════════════════════════════════════════════════════════════
 */

const mongoSanitize = require('express-mongo-sanitize');
const xss = require('xss-clean');

/**
 * Composite sanitization middleware function
 */
const sanitizeMiddleware = [
  // 1. Data sanitization against NoSQL query injection (strips '$' and '.')
  mongoSanitize({
    replaceWith: '_',
    onSanitize: ({ req, key }) => {
      if (process.env.NODE_ENV === 'development') {
        console.warn(`[Security] Sanitized key in request: ${key}`);
      }
    },
  }),

  // 2. Data sanitization against Cross-Site Scripting (XSS)
  xss(),
];

module.exports = sanitizeMiddleware;
