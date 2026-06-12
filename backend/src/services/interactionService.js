'use strict';

const { InteractionCache, SearchLog } = require('../models');
const mlService = require('./mlService');
const { hashDrugList } = require('../utils/hash');

// Orchestrates a single prediction request:
//   1. Normalize + alphabetize + hash the drug list.
//   2. Look the hash up in PostgreSQL. On a hit, serve the stored JSON.
//   3. On a miss, call the Python microservice, persist the result, and return it.
// Every request is recorded in search_logs regardless of outcome.
async function getPrediction(requestedDrugs) {
  const { hash, normalized } = hashDrugList(requestedDrugs);

  // --- Cache lookup ---
  const cached = await InteractionCache.findOne({ where: { hash } });

  if (cached) {
    // Track usage; failure to bump the counter must not break serving.
    cached.increment('hitCount').catch(() => {});
    await logSearch({ requestedDrugs, hash, cacheStatus: 'HIT', outcome: 'success' });

    return { cacheHit: true, hash, drugs: normalized, result: cached.result };
  }

  // --- Cache miss: ask the microservice ---
  let result;
  try {
    // Send the normalized, sorted list so the ML service sees a canonical input.
    result = await mlService.predictInteractions(normalized);
  } catch (err) {
    await logSearch({
      requestedDrugs,
      hash,
      cacheStatus: 'MISS',
      outcome: 'error',
      errorMessage: err.message,
    });
    throw err; // bubble up to the central error handler
  }

  // Persist for next time. Guard against a race where a concurrent request
  // inserted the same hash first (unique constraint) — fall back to a read.
  let stored;
  try {
    stored = await InteractionCache.create({ hash, drugs: normalized, result });
  } catch (err) {
    if (err.name === 'SequelizeUniqueConstraintError') {
      stored = await InteractionCache.findOne({ where: { hash } });
    } else {
      throw err;
    }
  }

  await logSearch({ requestedDrugs, hash, cacheStatus: 'MISS', outcome: 'success' });

  return { cacheHit: false, hash, drugs: normalized, result: stored.result };
}

// Writes an audit row. Logging is best-effort: a logging failure should never
// take down an otherwise-successful prediction.
async function logSearch(entry) {
  try {
    await SearchLog.create(entry);
  } catch (err) {
    console.error('[searchLog] failed to record request:', err.message);
  }
}

// Returns recent search-history rows (most recent first).
async function getHistory(limit = 50) {
  return SearchLog.findAll({
    order: [['createdAt', 'DESC']],
    limit: Math.min(Math.max(limit, 1), 200),
  });
}

module.exports = { getPrediction, getHistory };
