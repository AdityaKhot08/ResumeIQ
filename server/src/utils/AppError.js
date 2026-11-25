/**
 * utils/AppError.js
 * Application-level error class carrying an HTTP status code and optional
 * field-level validation details for the centralized error middleware.
 */
class AppError extends Error {
  constructor(message, statusCode = 500, errors) {
    super(message || 'Unexpected error');
    this.name = 'AppError';
    this.statusCode = Number(statusCode) || 500;
    this.isOperational = true;
    if (Array.isArray(errors)) this.errors = errors;
    if (Error.captureStackTrace) Error.captureStackTrace(this, AppError);
  }

  static badRequest(message, errors) {
    return new AppError(message, 400, errors);
  }

  static unauthorized(message = 'Not authorized. Please log in.') {
    return new AppError(message, 401);
  }

  static forbidden(message = 'You do not have access to this resource.') {
    return new AppError(message, 403);
  }

  static notFound(message = 'Resource not found.') {
    return new AppError(message, 404);
  }

  static conflict(message = 'The resource already exists.') {
    return new AppError(message, 409);
  }

  static payloadTooLarge(message = 'The uploaded file is too large.') {
    return new AppError(message, 413);
  }
}

module.exports = AppError;
