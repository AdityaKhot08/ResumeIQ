/**
 * controllers/authController.js
 * Registration, login, current-user lookup and profile updates.
 * Passwords are hashed before storage and never included in responses.
 */
const asyncHandler = require('../utils/asyncHandler');
const AppError = require('../utils/AppError');
const store = require('../storage/store');
const { signToken } = require('../utils/jwt');
const { hashPassword, comparePassword } = require('../utils/password');
const { normalizeString, toPublicUser } = require('../utils/sanitize');

function duplicateMessage(error, fallback) {
  if (error && error.code === 11000) {
    return new AppError('An account with this email already exists.', 409);
  }
  return error || new AppError(fallback, 500);
}

const register = asyncHandler(async (req, res) => {
  const body = req.body || {};
  const name = normalizeString(body.name, 80);
  const email = normalizeString(body.email, 254).toLowerCase();

  const existing = await store.findUserByEmail(email);
  if (existing) throw new AppError('An account with this email already exists.', 409);

  let user;
  try {
    user = await store.createUser({
      name,
      email,
      password: await hashPassword(body.password)
    });
  } catch (error) {
    throw duplicateMessage(error, 'Could not create the account.');
  }
  if (!user) throw new AppError('Could not create the account.', 500);

  res.status(201).json({
    success: true,
    token: signToken(user),
    user: toPublicUser(user)
  });
});

const login = asyncHandler(async (req, res) => {
  const body = req.body || {};
  const email = normalizeString(body.email, 254).toLowerCase();
  const password = typeof body.password === 'string' ? body.password : '';

  const user = await store.findUserByEmail(email);
  if (!user || !(await comparePassword(password, user.password))) {
    throw new AppError('Invalid email or password.', 401);
  }

  res.status(200).json({
    success: true,
    token: signToken(user),
    user: toPublicUser(user)
  });
});

const me = asyncHandler(async (req, res) => {
  res.status(200).json({ success: true, user: toPublicUser(req.user) });
});

const updateProfile = asyncHandler(async (req, res) => {
  const body = req.body || {};
  const patch = {};

  if (typeof body.name === 'string' && body.name.trim()) {
    patch.name = normalizeString(body.name, 80);
  }
  if (typeof body.email === 'string' && body.email.trim()) {
    patch.email = normalizeString(body.email, 254).toLowerCase();
    const existing = await store.findUserByEmail(patch.email);
    if (existing && String(existing.id) !== String(req.user.id)) {
      throw new AppError('An account with this email already exists.', 409);
    }
  }

  let updated = req.user;
  if (Object.keys(patch).length > 0) {
    try {
      updated = await store.updateUser(req.user.id, patch);
    } catch (error) {
      throw duplicateMessage(error, 'Could not update the profile.');
    }
    if (!updated) throw new AppError('User not found.', 404);
  }

  res.status(200).json({ success: true, user: toPublicUser(updated) });
});

module.exports = { register, login, me, updateProfile };
