/**
 * config/env.js
 * Loads environment variables from both the repository root and server/.env,
 * then exposes validated values with sensible development defaults.
 */
const path = require('path');
const dotenv = require('dotenv');

// Load server/.env first so it wins over a root-level .env, then fall back to
// whichever .env lives in the current working directory.
dotenv.config({ path: path.resolve(__dirname, '..', '..', '.env') });
dotenv.config();

function read(name, fallback) {
  const value = process.env[name];
  return value === undefined || value === '' ? fallback : value;
}

function positiveInt(value, fallback, min, max) {
  const parsed = Number.parseInt(String(value), 10);
  if (!Number.isFinite(parsed)) return fallback;
  return Math.min(max, Math.max(min, parsed));
}

const NODE_ENV = read('NODE_ENV', 'development');
const PORT = positiveInt(read('PORT', '5000'), 5000, 1, 65535);
const JWT_SECRET = read('JWT_SECRET', 'resumeiq-development-secret-change-me');
const JWT_EXPIRES = read('JWT_EXPIRES', '7d');
const CLIENT_URL = read('CLIENT_URL', 'http://localhost:5173');
const MONGODB_URI = read('MONGODB_URI', '').trim();
const MAX_FILE_SIZE_MB = positiveInt(read('MAX_FILE_SIZE_MB', '10'), 10, 1, 100);

module.exports = Object.freeze({
  NODE_ENV,
  PORT,
  JWT_SECRET,
  JWT_EXPIRES,
  CLIENT_URL,
  MONGODB_URI,
  MAX_FILE_SIZE_MB,
  isProduction: NODE_ENV === 'production',
  isTest: NODE_ENV === 'test'
});
