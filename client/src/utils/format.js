/**
 * Shared formatting helpers used across the app.
 * All dates are rendered with Intl.DateTimeFormat in the browser's locale.
 */

const defaultLocale =
  typeof navigator !== 'undefined' && navigator.language
    ? navigator.language
    : 'en-US';

/** Format a date as e.g. "Jan 5, 2026". */
export function formatDate(value, options = {}) {
  if (!value) return '—';
  const date = value instanceof Date ? value : new Date(value);
  if (Number.isNaN(date.getTime())) return '—';

  return new Intl.DateTimeFormat(defaultLocale, {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
    ...options,
  }).format(date);
}

/** Format a date as e.g. "Jan 5, 2026, 2:30 PM". */
export function formatDateTime(value) {
  return formatDate(value, {
    hour: 'numeric',
    minute: '2-digit',
  });
}

/** Human friendly relative time, e.g. "3 days ago", "just now". */
export function relativeTime(value) {
  if (!value) return '—';
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return '—';

  const diffMs = Date.now() - date.getTime();
  const future = diffMs < 0;
  const seconds = Math.abs(Math.floor(diffMs / 1000));

  if (seconds < 45) return future ? 'in a moment' : 'just now';

  const units = [
    ['year', 31536000],
    ['month', 2592000],
    ['week', 604800],
    ['day', 86400],
    ['hour', 3600],
    ['minute', 60],
  ];

  for (const [unit, size] of units) {
    const amount = Math.floor(seconds / size);
    if (amount >= 1) {
      const label = `${amount} ${unit}${amount === 1 ? '' : 's'}`;
      return future ? `in ${label}` : `${label} ago`;
    }
  }
  return 'just now';
}

/** Tailwind text colour class for a numeric score. */
export function scoreColor(score) {
  const value = Number(score);
  if (!Number.isFinite(value)) return 'text-slate-500';
  if (value >= 80) return 'text-emerald-600';
  if (value >= 60) return 'text-amber-500';
  if (value >= 40) return 'text-orange-500';
  return 'text-rose-500';
}

/** Tailwind background colour class for a numeric score. */
export function scoreBgColor(score) {
  const value = Number(score);
  if (!Number.isFinite(value)) return 'bg-slate-100';
  if (value >= 80) return 'bg-emerald-50';
  if (value >= 60) return 'bg-amber-50';
  if (value >= 40) return 'bg-orange-50';
  return 'bg-rose-50';
}

/** Tailwind classes for a letter grade badge. */
export function gradeColor(grade) {
  const g = String(grade || '').toUpperCase();
  if (g.startsWith('A')) return 'bg-emerald-100 text-emerald-700 ring-emerald-200';
  if (g.startsWith('B')) return 'bg-sky-100 text-sky-700 ring-sky-200';
  if (g.startsWith('C')) return 'bg-amber-100 text-amber-700 ring-amber-200';
  if (g.startsWith('D')) return 'bg-orange-100 text-orange-700 ring-orange-200';
  if (g.startsWith('F')) return 'bg-rose-100 text-rose-700 ring-rose-200';
  return 'bg-slate-100 text-slate-600 ring-slate-200';
}

/** Shorten a string to a maximum length with an ellipsis. */
export function truncate(value, max = 60) {
  if (value == null) return '';
  const text = String(value);
  return text.length > max ? `${text.slice(0, Math.max(0, max - 1)).trimEnd()}…` : text;
}

/** Two-letter avatar initials from a full name. */
export function initials(name) {
  if (!name || typeof name !== 'string') return '?';
  const parts = name.trim().split(/\s+/).filter(Boolean);
  if (parts.length === 0) return '?';
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
  return `${parts[0][0]}${parts[parts.length - 1][0]}`.toUpperCase();
}

/** Human readable file size, e.g. "2.4 MB". */
export function formatBytes(bytes) {
  if (!bytes || bytes <= 0) return '0 B';
  const units = ['B', 'KB', 'MB', 'GB'];
  const index = Math.min(Math.floor(Math.log(bytes) / Math.log(1024)), units.length - 1);
  const value = bytes / Math.pow(1024, index);
  return `${value.toFixed(index === 0 ? 0 : 1)} ${units[index]}`;
}

/** Capitalise the first letter of a string (e.g. "full stack" -> "Full stack"). */
export function capitalize(value) {
  if (!value) return '';
  const text = String(value);
  return text.charAt(0).toUpperCase() + text.slice(1);
}
