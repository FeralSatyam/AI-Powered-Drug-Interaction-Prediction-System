'use strict';

const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

// Stores the result of a heavy ML evaluation keyed by a deterministic hash of
// the alphabetized drug list. A cache hit lets us skip the microservice call.
const InteractionCache = sequelize.define(
  'InteractionCache',
  {
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
    },
    // MD5 of the alphabetized, normalized drug list. Unique => one row per combo.
    hash: {
      type: DataTypes.STRING(32),
      allowNull: false,
      unique: true,
    },
    // The normalized + sorted drug list that produced this hash (for inspection).
    drugs: {
      type: DataTypes.JSONB,
      allowNull: false,
    },
    // The raw JSON the microservice returned for this combination.
    result: {
      type: DataTypes.JSONB,
      allowNull: false,
    },
    // How many times this cached entry has been served.
    hitCount: {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: 0,
    },
  },
  {
    tableName: 'interaction_cache',
    indexes: [{ unique: true, fields: ['hash'] }],
  }
);

module.exports = InteractionCache;
