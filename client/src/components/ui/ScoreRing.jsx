import { useId } from 'react';

const COLOR_SETS = {
  excellent: { from: '#34d399', to: '#059669', text: '#059669' },
  good: { from: '#fbbf24', to: '#d97706', text: '#d97706' },
  fair: { from: '#fb923c', to: '#ea580c', text: '#ea580c' },
  poor: { from: '#fb7185', to: '#e11d48', text: '#e11d48' },
};

function paletteFor(score) {
  if (score >= 80) return COLOR_SETS.excellent;
  if (score >= 60) return COLOR_SETS.good;
  if (score >= 40) return COLOR_SETS.fair;
  return COLOR_SETS.poor;
}

/**
 * SVG circular progress ring. The gradient id is unique per instance so
 * multiple rings on one page never collide.
 */
export default function ScoreRing({
  score = 0,
  size = 180,
  stroke = 14,
  label = 'Score',
  grade,
  className = '',
}) {
  const rawId = useId();
  const gradientId = `ring-gradient-${rawId.replace(/[^a-zA-Z0-9-]/g, '')}`;

  const value = Math.max(0, Math.min(100, Number(score) || 0));
  const palette = paletteFor(value);
  const radius = (size - stroke) / 2;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference * (1 - value / 100);

  return (
    <div
      className={`relative inline-flex flex-none items-center justify-center ${className}`}
      style={{ width: size, height: size }}
      role="img"
      aria-label={`${label}: ${value} out of 100${grade ? `, grade ${grade}` : ''}`}
    >
      <svg width={size} height={size} className="-rotate-90" aria-hidden="true">
        <defs>
          <linearGradient id={gradientId} x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor={palette.from} />
            <stop offset="100%" stopColor={palette.to} />
          </linearGradient>
        </defs>
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke="#e2e8f0"
          strokeWidth={stroke}
        />
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke={`url(#${gradientId})`}
          strokeWidth={stroke}
          strokeLinecap="round"
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          style={{ transition: 'stroke-dashoffset 1s cubic-bezier(0.4, 0, 0.2, 1)' }}
        />
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
        <span
          className="text-4xl font-extrabold leading-none tracking-tight tabular-nums"
          style={{ color: palette.text }}
        >
          {Math.round(value)}
        </span>
        <span className="mt-1 text-xs font-medium uppercase tracking-widest text-slate-400">
          {label}
        </span>
        {grade && (
          <span className="mt-2 rounded-full bg-slate-100 px-2.5 py-0.5 text-[11px] font-bold text-slate-600">
            Grade {grade}
          </span>
        )}
      </div>
    </div>
  );
}
