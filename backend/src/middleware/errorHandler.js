'use strict';

const ApiError = require('../utils/ApiError');

// 404 handler for unmatched routes.
function notFound(req, res, next) {
  next(new ApiError(404, `Route not found: ${req.method} ${req.originalUrl}`));
}

// Central error handler. Every thrown ApiError (and anything else) lands here,
// so a microservice outage or a DB hiccup returns a clean JSON response instead
// of crashing the process.
// eslint-disable-next-line no-unused-vars
function errorHandler(err, req, res, next) {
  const statusCode = err.statusCode || 500;

  // Log full detail server-side; only surface a safe shape to the client.
  if (statusCode >= 500) {
    console.error('[error]', err.message, err.details || '');
  }

  res.status(statusCode).json({
    error: {
      message: err.message || 'Internal Server Error',
      status: statusCode,
      ...(err.details ? { details: err.details } : {}),
    },
  });
}

module.exports = { notFound, errorHandler };
