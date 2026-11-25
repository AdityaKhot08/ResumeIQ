/**
 * utils/password.js
 * Password hashing and comparison with bcryptjs (cost factor 12).
 */
const bcrypt = require('bcryptjs');

const SALT_ROUNDS = 12;

async function hashPassword(plain) {
  return bcrypt.hash(String(plain), SALT_ROUNDS);
}

async function comparePassword(plain, hash) {
  if (typeof plain !== 'string' || typeof hash !== 'string' || !hash) return false;
  try {
    return await bcrypt.compare(plain, hash);
  } catch (_error) {
    return false;
  }
}

module.exports = { hashPassword, comparePassword, SALT_ROUNDS };
