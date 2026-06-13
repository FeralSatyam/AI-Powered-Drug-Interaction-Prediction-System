'use strict';

// Loads .env once and exposes a single, validated config object so the rest of
// the app never reads process.env directly.
require('dotenv').config();

function toInt(value, fallback) {
  const n = parseInt(value, 10);
  return Number.isFinite(n) ? n : fallback;
}

function toList(value, fallback) {
  if (!value) return fallback;
  return value
    .split(',')
    .map((s) => s.trim())
    .filter(Boolean);
}

const config = {
  port: toInt(process.env.PORT, 5000),

  // Origins allowed to talk to this server from a browser.
  clientOrigins: toList(process.env.CLIENT_ORIGIN, [
    'http://localhost:3000',
    'http://localhost:5173',
  ]),

  ml: {
    baseUrl: (process.env.ML_SERVICE_URL || 'http://localhost:8000').replace(/\/+$/, ''),
    timeout: toInt(process.env.ML_SERVICE_TIMEOUT, 30000),
  },

  auth: {
    // Signing secret for session tokens. The fallback keeps local dev working,
    // but production must set a strong JWT_SECRET.
    jwtSecret: process.env.JWT_SECRET || 'dev-insecure-secret-change-me',
    jwtExpiresIn: process.env.JWT_EXPIRES_IN || '7d',
    cookieName: process.env.AUTH_COOKIE_NAME || 'mia_token',
    // Only send the cookie over HTTPS when explicitly enabled (production).
    cookieSecure: String(process.env.COOKIE_SECURE).toLowerCase() === 'true',
    // Lifetime of the session cookie in milliseconds (kept in step with 7d).
    cookieMaxAgeMs: toInt(process.env.AUTH_COOKIE_MAX_AGE_MS, 7 * 24 * 60 * 60 * 1000),
  },

  db: {
    url: process.env.DATABASE_URL || '',
    host: process.env.PGHOST || 'localhost',
    port: toInt(process.env.PGPORT, 5432),
    user: process.env.PGUSER || 'postgres',
    password: process.env.PGPASSWORD || 'postgres',
    name: process.env.PGDATABASE || 'drug_interactions',
    logging: String(process.env.DB_LOGGING).toLowerCase() === 'true',
    // Supabase (and most hosted Postgres) require SSL. Defaults to true unless
    // explicitly disabled, e.g. DB_SSL=false for a plain local Postgres.
    ssl: String(process.env.DB_SSL ?? 'true').toLowerCase() === 'true',
  },
};

module.exports = config;
