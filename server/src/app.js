/**
 * app.js
 * Express application: security middleware, JSON parsing, API routes, a JSON
 * 404 handler and a centralized error handler for every error class.
 */
const express = require('express');
const helmet = require('helmet');
const cors = require('cors');
const compression = require('compression');
const morgan = require('morgan');

const env = require('./config/env');
const routes = require('./routes');
const AppError = require('./utils/AppError');

const app = express();

app.disable('x-powered-by');
app.set('trust proxy', 1);

app.use(helmet());

const allowedOrigins = [
  env.CLIENT_URL,
  'http://localhost:5173',
  'http://localhost:3000',
  'http://127.0.0.1:5173',
  'http://127.0.0.1:3000'
].filter(Boolean);

app.use(
  cors({
    origin(origin, callback) {
      // Non-browser clients (curl, server-to-server) have no Origin header.
      if (!origin || allowedOrigins.includes(origin)) return callback(null, true);
      if (/^https?:\/\/(localhost|127\.0\.0\.1):\d+$/i.test(origin)) return callback(null, true);
      return callback(new AppError('Origin not allowed by CORS.', 403));
    },
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization']
  })
);

app.use(compression());
app.use(
  morgan(env.isProduction ? 'combined' : 'dev', {
    skip: () => env.isTest
  })
);

app.use(express.json({ limit: '1mb' }));
app.use(express.urlencoded({ extended: true, limit: '1mb' }));

app.use('/api', routes);

app.use((req, _res, next) => {
  next(new AppError(`Route ${req.originalUrl} was not found.`, 404));
});

// Centralized error handler — the only place that writes error responses.
app.use((error, _req, res, next) => {
  if (res.headersSent) return next(error);

  let status = error.statusCode || error.status || 500;
  let message = error.message || 'Something went wrong. Please try again.';
  let errors = Array.isArray(error.errors) ? error.errors : undefined;

  if (error instanceof SyntaxError && error.type === 'entity.parse.failed') {
    status = 400;
    message = 'Malformed JSON body. Please check your request.';
  } else if (error.code === 11000) {
    status = 409;
    message = 'This value is already in use. Please choose another.';
  } else if (error.name === 'ValidationError' && error.errors && typeof error.errors === 'object') {
    status = 400;
    errors = Object.keys(error.errors).map((field) => ({
      field,
      message: String(error.errors[field].message || 'Invalid value.')
    }));
    message = errors[0]?.message || 'Validation failed.';
  } else if (error.name === 'MulterError') {
    status = error.code === 'LIMIT_FILE_SIZE' ? 413 : 400;
    message = error.code === 'LIMIT_FILE_SIZE'
      ? `The resume is too large. Maximum file size is ${env.MAX_FILE_SIZE_MB} MB.`
      : `Upload failed: ${error.message}`;
  } else if (
    error.name === 'JsonWebTokenError' ||
    error.name === 'TokenExpiredError' ||
    error.name === 'NotBeforeError'
  ) {
    status = 401;
    message = 'Invalid or expired access token. Please log in again.';
  } else if (error.name === 'CastError') {
    status = 400;
    message = 'Invalid identifier in the request.';
  }

  if (status >= 500 && !error.isOperational) {
    console.error('[Unhandled error]', error);
  }

  const body = { success: false, message };
  if (errors) body.errors = errors;
  return res.status(status).json(body);
});

module.exports = app;
