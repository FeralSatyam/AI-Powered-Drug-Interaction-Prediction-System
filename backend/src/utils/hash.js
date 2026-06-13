'use strict';

const crypto = require('crypto');

// Normalizes a drug name so that "Aspirin ", "aspirin", and "ASPIRIN" collapse
// to a single canonical token. This keeps the cache key stable regardless of
// how the client typed or ordered the names.
function normalizeDrug(name) {
  return String(name).trim().toLowerCase();
}

// Produces the canonical, alphabetically sorted, de-duplicated drug list.
function normalizeDrugList(drugs) {
  const cleaned = drugs
    .map(normalizeDrug)
    .filter((d) => d.length > 0);

  // De-duplicate, then sort alphabetically so order never affects the hash.
  return Array.from(new Set(cleaned)).sort((a, b) => a.localeCompare(b));
}

// Hashes an array of drug names: alphabetize -> join -> MD5.
// Returns both the hash and the normalized list it was computed from.
function hashDrugList(drugs) {
  const normalized = normalizeDrugList(drugs);
  const hash = crypto
    .createHash('md5')
    .update(normalized.join('|'))
    .digest('hex');

  return { hash, normalized };
}

module.exports = { normalizeDrug, normalizeDrugList, hashDrugList };
