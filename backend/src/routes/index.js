'use strict';

const express = require('express');
const drugsController = require('../controllers/drugsController');
const predictController = require('../controllers/predictController');
const drugCatalog = require('../services/drugCatalog');
const { sequelize } = require('../models');

const router = express.Router();

// Liveness/readiness probe — reports DB and drug-catalog status.
router.get('/health', async (req, res) => {
  let db = 'up';
  try {
    await sequelize.authenticate();
  } catch (_) {
    db = 'down';
  }
  res.json({
    status: 'ok',
    db,
    drugCatalogLoaded: drugCatalog.isLoaded(),
    uptimeSeconds: Math.round(process.uptime()),
  });
});

// --- Core API ---
router.get('/drugs', drugsController.listDrugs);
router.post('/predict', predictController.predict);
router.get('/history', predictController.history);

module.exports = router;
