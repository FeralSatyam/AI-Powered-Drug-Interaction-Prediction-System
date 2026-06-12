'use strict';

const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

// An append-only audit trail of every /api/predict request that comes through,
// including whether it was served from cache and how it ultimately resolved.
const SearchLog = sequelize.define(
  'SearchLog',
  {
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
    },
    // Exactly what the client submitted (before normalization).
    requestedDrugs: {
      type: DataTypes.JSONB,
      allowNull: false,
    },
    // The hash this request mapped to (links a log row to a cache row).
    hash: {
      type: DataTypes.STRING(32),
      allowNull: false,
    },
    // 'HIT' if served from cache, 'MISS' if it required a microservice call.
    cacheStatus: {
      type: DataTypes.ENUM('HIT', 'MISS'),
      allowNull: false,
    },
    // 'success' | 'error' — the final outcome returned to the client.
    outcome: {
      type: DataTypes.STRING(16),
      allowNull: false,
      defaultValue: 'success',
    },
    // Populated when outcome === 'error'.
    errorMessage: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
  },
  {
    tableName: 'search_logs',
    indexes: [{ fields: ['hash'] }, { fields: ['createdAt'] }],
  }
);

module.exports = SearchLog;
