/**
 * middleware/auth.js
 * Bearer-token authentication. Verifies the JWT, loads the current user from
 * storage and attaches it to req.user for downstream controllers.
 */
const asyncHandler = require('../utils/asyncHandler');
const AppError = require('../utils/AppError');
const { verifyToken } = require('../utils/jwt');
const store = require('../storage/store');

const protect = asyncHandler(async (req, _res, next) => {
  const header = req.headers.authorization || req.headers.Authorization;
  if (typeof header !== 'string' || !/^Bearer\s+/i.test(header)) {
    throw new AppError('Not authorized — no access token was provided.', 401);
  }

  const token = header.replace(/^Bearer\s+/i, '').trim();
  if (!token) throw new AppError('Not authorized — no access token was provided.', 401);

  let payload;
  try {
    payload = verifyToken(token);
  } catch (_error) {
    throw new AppError('Invalid or expired access token. Please log in again.', 401);
  }

  if (!payload || !payload.id) {
    throw new AppError('Invalid access token.', 401);
  }

  const user = await store.findUserById(String(payload.id));
  if (!user) {
    throw new AppError('The user belonging to this token no longer exists.', 401);
  }

  req.user = user;
  next();
});

module.exports = { protect };
