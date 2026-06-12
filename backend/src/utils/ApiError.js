'use strict';

// A small typed error so controllers can signal an HTTP status without coupling
// to Express. The central error handler reads `statusCode` and `details`.
class ApiError extends Error {
  constructor(statusCode, message, details = undefined) {
    super(message);
    this.name = 'ApiError';
    this.statusCode = statusCode;
    this.details = details;
  }
}

module.exports = ApiError;
