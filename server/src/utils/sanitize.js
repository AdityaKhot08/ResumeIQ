/**
 * utils/sanitize.js
 * Small string helpers: normalize user input, escape HTML, build slugs and
 * strip private fields before sending users to clients.
 */

/** Collapse control characters and whitespace, optionally truncate. */
function normalizeString(value, maxLength) {
  if (typeof value !== 'string') return '';
  let output = value
    .normalize('NFKC')
    .replace(/[\u0000-\u001F\u007F]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
  if (Number.isInteger(maxLength) && maxLength > 0 && output.length > maxLength) {
    output = output.slice(0, maxLength).trim();
  }
  return output;
}

/** Escape HTML-significant characters for safe rendering in a browser. */
function escapeHtml(value) {
  if (value === undefined || value === null) return '';
  return String(value)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

/** Lowercase, alphanumeric-and-dash identifier (used for suggestion ids). */
function slugify(value) {
  return String(value || '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 60) || 'item';
}

/** Never expose the password hash (or any unexpected internal fields). */
function toPublicUser(user) {
  if (!user) return null;
  return {
    id: String(user.id || user._id),
    name: user.name || '',
    email: user.email || '',
    createdAt: user.createdAt || new Date(0).toISOString()
  };
}

module.exports = { normalizeString, escapeHtml, slugify, toPublicUser };
