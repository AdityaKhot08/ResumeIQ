const VARIANTS = {
  default: 'bg-slate-100 text-slate-700 ring-slate-200',
  brand: 'bg-brand-50 text-brand-700 ring-brand-200',
  success: 'bg-emerald-50 text-emerald-700 ring-emerald-200',
  warning: 'bg-amber-50 text-amber-700 ring-amber-200',
  danger: 'bg-rose-50 text-rose-700 ring-rose-200',
  info: 'bg-sky-50 text-sky-700 ring-sky-200',
  violet: 'bg-violet-50 text-violet-700 ring-violet-200',
  outline: 'bg-white text-slate-600 ring-slate-200',
};

const SIZES = {
  sm: 'px-2 py-0.5 text-[11px]',
  md: 'px-2.5 py-1 text-xs',
  lg: 'px-3 py-1.5 text-sm',
};

/** Small status pill with an optional coloured dot. */
export default function Badge({
  variant = 'default',
  size = 'md',
  dot = false,
  dotClassName = '',
  className = '',
  children,
  ...props
}) {
  return (
    <span
      className={`chip ${VARIANTS[variant] || VARIANTS.default} ${SIZES[size] || SIZES.md} ${className}`}
      {...props}
    >
      {dot && <span className={`h-1.5 w-1.5 rounded-full bg-current ${dotClassName}`} />}
      {children}
    </span>
  );
}
