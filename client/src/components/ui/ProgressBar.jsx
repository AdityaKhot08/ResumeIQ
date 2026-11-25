const COLORS = {
  brand: 'from-brand-500 to-brand-600',
  emerald: 'from-emerald-400 to-emerald-600',
  amber: 'from-amber-400 to-amber-600',
  rose: 'from-rose-400 to-rose-600',
  sky: 'from-sky-400 to-sky-600',
  violet: 'from-violet-400 to-violet-600',
};

const HEIGHTS = { sm: 'h-1.5', md: 'h-2', lg: 'h-2.5' };

/** Gradient progress bar with an optional label and numeric value. */
export default function ProgressBar({
  value = 0,
  color = 'brand',
  label,
  showValue = false,
  size = 'md',
  className = '',
}) {
  const clamped = Math.max(0, Math.min(100, Number(value) || 0));
  const gradient = COLORS[color] || COLORS.brand;

  return (
    <div className={`w-full ${className}`}>
      {(label || showValue) && (
        <div className="mb-1.5 flex items-baseline justify-between gap-3">
          {label && <span className="text-sm font-medium text-slate-700">{label}</span>}
          {showValue && (
            <span className="text-xs font-semibold tabular-nums text-slate-500">{Math.round(clamped)}%</span>
          )}
        </div>
      )}
      <div
        className={`w-full overflow-hidden rounded-full bg-slate-100 ${HEIGHTS[size] || HEIGHTS.md}`}
        role="progressbar"
        aria-valuenow={Math.round(clamped)}
        aria-valuemin={0}
        aria-valuemax={100}
        aria-label={label}
      >
        <div
          className={`h-full rounded-full bg-gradient-to-r ${gradient} transition-[width] duration-700 ease-out`}
          style={{ width: `${clamped}%` }}
        />
      </div>
    </div>
  );
}
