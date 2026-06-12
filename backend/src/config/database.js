'use strict';

const { Sequelize } = require('sequelize');
const config = require('./env');

// A single shared Sequelize instance for the whole app. Prefer a full
// connection string (DATABASE_URL) when present, otherwise assemble from parts.
const sequelize = config.db.url
  ? new Sequelize(config.db.url, {
      dialect: 'postgres',
      logging: config.db.logging ? console.log : false,
    })
  : new Sequelize(config.db.name, config.db.user, config.db.password, {
      host: config.db.host,
      port: config.db.port,
      dialect: 'postgres',
      logging: config.db.logging ? console.log : false,
    });

module.exports = sequelize;
