/**
 * routes/analysisRoutes.js
 * Exposes three routers mounted at /analyze, /analyses and /stats.
 */
const express = require('express');
const analysisController = require('../controllers/analysisController');
const { protect } = require('../middleware/auth');
const { uploadResume } = require('../middleware/upload');
const validate = require('../middleware/validate');

const analyzeRouter = express.Router();
analyzeRouter.post(
  '/',
  protect,
  uploadResume,
  validate.analyze,
  validate.handleValidation,
  analysisController.createAnalysis
);

const historyRouter = express.Router();
historyRouter.use(protect);
historyRouter.get('/', validate.listAnalyses, validate.handleValidation, analysisController.listAnalyses);
historyRouter.get('/:id', analysisController.getAnalysis);
historyRouter.delete('/:id', analysisController.deleteAnalysis);

const statsRouter = express.Router();
statsRouter.use(protect);
statsRouter.get('/', analysisController.getStats);

module.exports = { analyzeRouter, historyRouter, statsRouter };
