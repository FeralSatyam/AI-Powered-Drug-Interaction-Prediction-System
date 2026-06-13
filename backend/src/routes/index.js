'use strict';

const express = require('express');
const drugsController = require('../controllers/drugsController');
const predictController = require('../controllers/predictController');
const authController = require('../controllers/authController');
const patientsController = require('../controllers/patientsController');
const drugCatalog = require('../services/drugCatalog');
const { sequelize } = require('../models');
const { requireAuth } = require('../middleware/auth');

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

// --- Authentication ---
router.post('/auth/register', authController.register);
router.post('/auth/login', authController.login);
router.post('/auth/logout', authController.logout);
router.get('/auth/me', requireAuth, authController.me);

// --- Patients (all scoped to the signed-in doctor) ---
router.get('/patients', requireAuth, patientsController.list);
router.post('/patients', requireAuth, patientsController.create);
router.patch('/patients/:id', requireAuth, patientsController.update);
router.delete('/patients/:id', requireAuth, patientsController.remove);
router.get('/patients/:id/history', requireAuth, patientsController.listHistory);
router.post('/patients/:id/history', requireAuth, patientsController.addHistory);
router.delete('/patients/:id/history', requireAuth, patientsController.clearHistory);

// --- Core API ---
router.get('/drugs', drugsController.listDrugs);
router.post('/predict', predictController.predict);
router.get('/history', predictController.history);

module.exports = router;
