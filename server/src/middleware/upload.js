/**
 * middleware/upload.js
 * Multer memory-storage configuration for a single PDF resume upload, with
 * friendly error messages for invalid file types and oversized files.
 */
const multer = require('multer');
const env = require('../config/env');
const AppError = require('../utils/AppError');

const storage = multer.memoryStorage();

function pdfOnly(_req, file, callback) {
  const nameLooksLikePdf = /\.pdf$/i.test(String(file.originalname || ''));
  const mimeLooksLikePdf = /^application\/(pdf|x-pdf)$/i.test(String(file.mimetype || ''));
  if (!nameLooksLikePdf && !mimeLooksLikePdf) {
    return callback(new AppError('Only PDF files are accepted. Please upload a PDF resume.', 400));
  }
  return callback(null, true);
}

const upload = multer({
  storage,
  fileFilter: pdfOnly,
  limits: {
    fileSize: env.MAX_FILE_SIZE_MB * 1024 * 1024,
    files: 1
  }
});

/** Middleware that accepts one field named `resume`. */
function uploadResume(req, res, next) {
  upload.single('resume')(req, res, (error) => {
    if (!error) return next();

    if (error instanceof multer.MulterError) {
      if (error.code === 'LIMIT_FILE_SIZE') {
        return next(
          new AppError(`The resume is too large. Maximum file size is ${env.MAX_FILE_SIZE_MB} MB.`, 413)
        );
      }
      if (error.code === 'LIMIT_UNEXPECTED_FILE') {
        return next(new AppError('Unexpected upload field. Use a single field named "resume".', 400));
      }
      return next(new AppError(`Upload failed: ${error.message}`, 400));
    }

    if (error instanceof AppError) return next(error);
    return next(new AppError(`Upload failed: ${error.message || 'unknown error'}`, 400));
  });
}

module.exports = { upload, uploadResume, pdfOnly };
