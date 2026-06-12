'use strict';

// Central place to register models and sync the schema. Importing the models
// here registers them on the shared sequelize instance.
const sequelize = require('../config/database');
const InteractionCache = require('./InteractionCache');
const SearchLog = require('./SearchLog');

// Verifies connectivity and creates/updates tables to match the models.
// Uses { alter: true } so the local schema stays in step during development.
async function initDatabase() {
  await sequelize.authenticate();
  await sequelize.sync({ alter: true });
}

module.exports = {
  sequelize,
  initDatabase,
  InteractionCache,
  SearchLog,
};
