/**
 * routes/authRoutes.js
 * Public registration/login routes (rate limited) and protected profile routes.
 */
const express = require('express');
const authController = require('../controllers/authController');
const { protect } = require('../middleware/auth');
const { authLimiter } = require('../middleware/rateLimit');
const validate = require('../middleware/validate');

const router = express.Router();

router.post('/register', authLimiter, validate.register, validate.handleValidation, authController.register);
router.post('/login', authLimiter, validate.login, validate.handleValidation, authController.login);
router.get('/me', protect, authController.me);
router.put('/profile', protect, validate.profile, validate.handleValidation, authController.updateProfile);

module.exports = router;
