/**
 * utils/asyncHandler.js
 * Wraps async route handlers so rejected promises are forwarded to Express's
 * error middleware instead of causing an unhandled rejection.
 */
function asyncHandler(handler) {
  return function wrapped(req, res, next) {
    Promise.resolve(handler(req, res, next)).catch(next);
  };
}

module.exports = asyncHandler;
