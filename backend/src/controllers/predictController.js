'use strict';

const interactionService = require('../services/interactionService');
const ApiError = require('../utils/ApiError');

// POST /api/predict
// Body: { "drugs": ["Aspirin", "Warfarin", ...] }
async function predict(req, res, next) {
  try {
    const { drugs } = req.body || {};

    // --- Input validation ---
    if (!Array.isArray(drugs)) {
      throw new ApiError(400, 'Request body must include a "drugs" array.');
    }
    if (drugs.length < 2) {
      throw new ApiError(400, 'Provide at least two drug names to evaluate an interaction.');
    }
    if (!drugs.every((d) => typeof d === 'string' && d.trim().length > 0)) {
      throw new ApiError(400, 'Every entry in "drugs" must be a non-empty string.');
    }

    const { cacheHit, hash, drugs: normalized, result } =
      await interactionService.getPrediction(drugs);

    res.json({ cacheHit, hash, drugs: normalized, result });
  } catch (err) {
    next(err);
  }
}

// GET /api/history — recent submitted requests (search history/logs).
async function history(req, res, next) {
  try {
    const limit = parseInt(req.query.limit, 10) || 50;
    const logs = await interactionService.getHistory(limit);
    res.json({ count: logs.length, logs });
  } catch (err) {
    next(err);
  }
}

module.exports = { predict, history };
