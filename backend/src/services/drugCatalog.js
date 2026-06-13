'use strict';

const mlService = require('./mlService');

// In-memory cache for the global drug list so we don't hit the Python service
// on every GET /api/drugs. Refreshed on startup and lazily on demand.
const state = {
  data: null, // last successful payload from the microservice
  loadedAt: null, // epoch ms of the last successful load
};

// Fetches the list from the microservice and replaces the cache. Throws (via
// mlService's ApiError) if the microservice is unavailable.
async function refresh() {
  const data = await mlService.fetchDrugs();
  state.data = data;
  state.loadedAt = Date.now();
  return data;
}

// Returns the cached list, fetching it the first time (or after a forced
// refresh). `force` re-fetches even when a cached copy exists.
async function getDrugs({ force = false } = {}) {
  if (force || state.data === null) {
    return refresh();
  }
  return state.data;
}

// Best-effort warm-up used at server startup. Never throws — a microservice
// that's down at boot must not stop the orchestrator from starting; the list
// will be fetched on the first request instead.
async function warmUp() {
  try {
    await refresh();
    return { ok: true };
  } catch (err) {
    return { ok: false, error: err.message };
  }
}

function isLoaded() {
  return state.data !== null;
}

module.exports = { getDrugs, refresh, warmUp, isLoaded };
