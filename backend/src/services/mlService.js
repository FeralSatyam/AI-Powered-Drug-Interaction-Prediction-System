'use strict';

const axios = require('axios');
const config = require('../config/env');
const ApiError = require('../utils/ApiError');

// Dedicated axios client for the Python FastAPI microservice. Centralizing it
// keeps the base URL / timeout in one place and makes error handling uniform.
const client = axios.create({
  baseURL: config.ml.baseUrl,
  timeout: config.ml.timeout,
  headers: { 'Content-Type': 'application/json' },
});

// Translates any axios failure into a clean ApiError so the rest of the app
// never has to crash on or inspect raw axios internals. This is the core of the
// "microservice is down" graceful-degradation requirement.
function wrapError(err, action) {
  if (err.response) {
    // The microservice responded with a non-2xx status.
    return new ApiError(
      502,
      `ML microservice returned an error while ${action}.`,
      { upstreamStatus: err.response.status, upstreamBody: err.response.data }
    );
  }
  if (err.request) {
    // No response — connection refused, DNS failure, or timeout.
    const isTimeout = err.code === 'ECONNABORTED';
    return new ApiError(
      503,
      isTimeout
        ? `ML microservice timed out while ${action}.`
        : `ML microservice is unreachable while ${action}. Is it running at ${config.ml.baseUrl}?`,
      { code: err.code }
    );
  }
  return new ApiError(500, `Unexpected error while ${action}: ${err.message}`);
}

// GET /drugs — the full list of searchable drugs.
async function fetchDrugs() {
  try {
    const { data } = await client.get('/drugs');
    return data;
  } catch (err) {
    throw wrapError(err, 'fetching the drug list');
  }
}

// POST /predict — runs the interaction model over a list of drug names.
async function predictInteractions(drugs) {
  try {
    const { data } = await client.post('/predict', { drugs });
    return data;
  } catch (err) {
    throw wrapError(err, 'requesting an interaction prediction');
  }
}

module.exports = { fetchDrugs, predictInteractions };
