/**
 * utils/jwt.js
 * Thin wrapper around jsonwebtoken for signing and verifying auth tokens.
 */
const jwt = require('jsonwebtoken');
const env = require('../config/env');

function signToken(user) {
  return jwt.sign({ id: String(user.id || user._id) }, env.JWT_SECRET, {
    expiresIn: env.JWT_EXPIRES
  });
}

function verifyToken(token) {
  return jwt.verify(token, env.JWT_SECRET);
}

module.exports = { signToken, verifyToken };
