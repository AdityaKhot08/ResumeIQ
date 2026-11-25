/**
 * routes/healthRoutes.js
 * Liveness endpoint that also reports which storage backend is active.
 */
const express = require('express');
const database = require('../config/database');

const router = express.Router();

router.get('/', (_req, res) => {
  res.status(200).json({
    success: true,
    status: 'ok',
    timestamp: new Date().toISOString(),
    storage: database.storageMode
  });
});

module.exports = router;
