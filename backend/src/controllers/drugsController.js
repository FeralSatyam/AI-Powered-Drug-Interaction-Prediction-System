'use strict';

const drugCatalog = require('../services/drugCatalog');

// GET /api/drugs — serve the (in-memory cached) global drug list.
// Pass ?refresh=true to force a re-fetch from the microservice.
async function listDrugs(req, res, next) {
  try {
    const force = String(req.query.refresh).toLowerCase() === 'true';
    const drugs = await drugCatalog.getDrugs({ force });
    res.json({ source: 'cache+microservice', drugs });
  } catch (err) {
    next(err);
  }
}

module.exports = { listDrugs };
