/**
 * routes/index.js
 * Aggregates and mounts all API routers under their /api sub-paths.
 */
const express = require('express');
const authRoutes = require('./authRoutes');
const healthRoutes = require('./healthRoutes');
const { analyzeRouter, historyRouter, statsRouter } = require('./analysisRoutes');

const router = express.Router();

router.use('/auth', authRoutes);
router.use('/analyze', analyzeRouter);
router.use('/analyses', historyRouter);
router.use('/stats', statsRouter);
router.use('/health', healthRoutes);

module.exports = router;
