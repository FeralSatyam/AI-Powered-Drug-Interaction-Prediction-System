'use strict';

const express = require('express');
const cors = require('cors');
const morgan = require('morgan');
const cookieParser = require('cookie-parser');

const config = require('./config/env');
const apiRoutes = require('./routes');
const { notFound, errorHandler } = require('./middleware/errorHandler');

const app = express();

// --- CORS: allow the local React client(s) to talk to this server ---
app.use(
  cors({
    origin(origin, callback) {
      // Allow non-browser tools (curl/Postman) that send no Origin header.
      if (!origin || config.clientOrigins.includes(origin)) {
        return callback(null, true);
      }
      return callback(new Error(`Origin ${origin} not allowed by CORS`));
    },
    methods: ['GET', 'POST', 'PATCH', 'DELETE', 'OPTIONS'],
    credentials: true,
  })
);

// --- Body parsing, cookies, and request logging ---
app.use(express.json({ limit: '1mb' }));
app.use(cookieParser());
app.use(morgan('dev'));

// --- Routes ---
app.get('/', (req, res) => {
  res.json({ service: 'drug-interaction-orchestrator', status: 'running' });
});
app.use('/api', apiRoutes);

// --- 404 + central error handling (keep last) ---
app.use(notFound);
app.use(errorHandler);

module.exports = app;
