/**
 * middleware/rateLimit.js
 * Brute-force protection for authentication endpoints.
 */
const rateLimit = require('express-rate-limit');

const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: 20,
  standardHeaders: 'draft-7',
  legacyHeaders: false,
  skipSuccessfulRequests: false,
  message: {
    success: false,
    message: 'Too many authentication attempts. Please try again in 15 minutes.'
  }
});

module.exports = { authLimiter };
