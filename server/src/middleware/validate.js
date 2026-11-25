/**
 * middleware/validate.js
 * express-validator chains for every request with a body/query, plus a single
 * middleware that converts validation failures into the API error format.
 */
const { body, query, validationResult } = require('express-validator');
const AppError = require('../utils/AppError');

/** Reject arrays/objects where a plain string is expected (NoSQL injection). */
function stringOnly(label) {
  return (value) => {
    if (value === undefined || value === null || value === '') return true;
    if (typeof value !== 'string') throw new Error(`${label} must be a string.`);
    return true;
  };
}

const register = [
  body('name')
    .custom(stringOnly('Name'))
    .trim()
    .notEmpty().withMessage('Name is required.')
    .isLength({ min: 2, max: 80 }).withMessage('Name must be between 2 and 80 characters.'),
  body('email')
    .custom(stringOnly('Email'))
    .trim()
    .notEmpty().withMessage('Email is required.')
    .isEmail().withMessage('Please provide a valid email address.')
    .isLength({ max: 254 }).withMessage('Email is too long.'),
  body('password')
    .custom(stringOnly('Password'))
    .notEmpty().withMessage('Password is required.')
    .isLength({ min: 8, max: 128 }).withMessage('Password must be between 8 and 128 characters.')
];

const login = [
  body('email')
    .custom(stringOnly('Email'))
    .trim()
    .notEmpty().withMessage('Email is required.')
    .isEmail().withMessage('Please provide a valid email address.'),
  body('password')
    .custom(stringOnly('Password'))
    .notEmpty().withMessage('Password is required.')
    .isLength({ max: 128 }).withMessage('Password is too long.')
];

const profile = [
  body('name')
    .optional({ nullable: true })
    .custom(stringOnly('Name'))
    .trim()
    .isLength({ min: 2, max: 80 }).withMessage('Name must be between 2 and 80 characters.'),
  body('email')
    .optional({ nullable: true })
    .custom(stringOnly('Email'))
    .trim()
    .isEmail().withMessage('Please provide a valid email address.')
    .isLength({ max: 254 }).withMessage('Email is too long.')
];

const analyze = [
  body('jobDescription')
    .custom(stringOnly('Job description'))
    .trim()
    .notEmpty().withMessage('Job description is required.')
    .isLength({ min: 50, max: 20000 })
    .withMessage('Job description must be between 50 and 20000 characters.'),
  body('jobTitle')
    .optional({ nullable: true })
    .custom(stringOnly('Job title'))
    .trim()
    .isLength({ max: 120 }).withMessage('Job title must be at most 120 characters.'),
  body('company')
    .optional({ nullable: true })
    .custom(stringOnly('Company'))
    .trim()
    .isLength({ max: 120 }).withMessage('Company must be at most 120 characters.')
];

const listAnalyses = [
  query('page')
    .optional({ nullable: true })
    .isInt({ min: 1 }).withMessage('page must be a positive integer.')
    .toInt(),
  query('limit')
    .optional({ nullable: true })
    .isInt({ min: 1, max: 50 }).withMessage('limit must be between 1 and 50.')
    .toInt(),
  query('search')
    .optional({ nullable: true })
    .custom(stringOnly('Search'))
    .trim()
    .isLength({ max: 120 }).withMessage('Search must be at most 120 characters.')
];

function handleValidation(req, _res, next) {
  const result = validationResult(req);
  if (result.isEmpty()) return next();

  const errors = result.array().map((issue) => ({
    field: issue.path || issue.param || 'body',
    message: typeof issue.msg === 'string' ? issue.msg : 'Invalid value.'
  }));
  return next(new AppError(errors[0].message, 400, errors));
}

module.exports = {
  register,
  login,
  profile,
  analyze,
  listAnalyses,
  handleValidation
};
