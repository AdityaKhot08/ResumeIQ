/**
 * services/pdfService.js
 * Extracts sanitized text from an uploaded PDF buffer using pdf-parse.
 * The dependency is required lazily so a broken/missing install produces a
 * clear API error instead of preventing the whole server from booting.
 */
const AppError = require('../utils/AppError');

function loadPdfParse() {
  try {
    // eslint-disable-next-line global-require
    const pdfParse = require('pdf-parse');
    if (typeof pdfParse !== 'function') {
      throw new Error('pdf-parse did not export a function');
    }
    return pdfParse;
  } catch (error) {
    throw new AppError(
      `PDF parsing is not available on the server (${error.message}). ` +
        'Make sure the pdf-parse dependency is installed.',
      500
    );
  }
}

function sanitizePdfText(raw) {
  return String(raw || '')
    .replace(/\r\n?/g, '\n')
    .replace(/[\u00A0\u200B-\u200D\uFEFF]/g, ' ')
    .replace(/[ \t]+/g, ' ')
    .replace(/ *\n */g, '\n')
    .replace(/\n{3,}/g, '\n\n')
    .trim();
}

function looksGarbled(text) {
  if (!text || text.length < 20) return true;
  const sample = text.slice(0, 5000);
  const letters = (sample.match(/[A-Za-z]/g) || []).length;
  if (letters < 10) return true;
  const printable = (sample.match(/[\t\n\r -~]/g) || []).length;
  return printable / sample.length < 0.7;
}

function fallbackPageCount(buffer) {
  const raw = buffer.toString('latin1');
  const count = (raw.match(/\/Type\s*\/Page(?![sS])/g) || []).length;
  return count > 0 ? count : 1;
}

async function extractTextFromPdf(buffer) {
  if (!Buffer.isBuffer(buffer) || buffer.length === 0) {
    throw new AppError('The uploaded resume file is empty.', 400);
  }

  // Basic signature check keeps non-PDF uploads from reaching the parser.
  if (!buffer.subarray(0, 1024).toString('latin1').includes('%PDF-')) {
    throw new AppError('The uploaded file does not appear to be a valid PDF.', 400);
  }

  const pdfParse = loadPdfParse();
  let parsed;
  try {
    parsed = await pdfParse(buffer, { max: 0 });
  } catch (error) {
    throw new AppError(`Unable to read the PDF: ${error.message || 'unknown parsing error'}`, 400);
  }

  const text = sanitizePdfText(parsed && parsed.text);
  if (looksGarbled(text)) {
    throw new AppError(
      'We could not extract readable text from this PDF. ' +
        'If it is a scanned image, please use a text-based PDF instead.',
      400
    );
  }

  const detectedPages = Number(parsed && parsed.numpages);
  const pages = Number.isFinite(detectedPages) && detectedPages > 0
    ? detectedPages
    : fallbackPageCount(buffer);

  return { text, pages };
}

module.exports = { extractTextFromPdf, sanitizePdfText, looksGarbled };
