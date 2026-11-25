import { AlertCircle, AlertTriangle, CheckCircle2, Info, XCircle } from 'lucide-react';

const TYPES = {
  info: { Icon: Info, icon: 'text-brand-500', box: 'border-brand-200 bg-brand-50/70', text: 'text-brand-900' },
  success: { Icon: CheckCircle2, icon: 'text-emerald-600', box: 'border-emerald-200 bg-emerald-50', text: 'text-emerald-900' },
  warning: { Icon: AlertTriangle, icon: 'text-amber-600', box: 'border-amber-200 bg-amber-50', text: 'text-amber-900' },
  error: { Icon: XCircle, icon: 'text-rose-600', box: 'border-rose-200 bg-rose-50', text: 'text-rose-900' },
};

/** Inline contextual message. */
export default function Alert({ type = 'info', title, children, className = '' }) {
  const config = TYPES[type] || TYPES.info;
  const Icon = config.Icon;

  return (
    <div
      role={type === 'error' ? 'alert' : 'status'}
      className={`flex gap-3 rounded-xl border p-4 ${config.box} ${className}`}
    >
      <Icon className={`mt-0.5 h-5 w-5 flex-none ${config.icon}`} aria-hidden="true" />
      <div className="min-w-0 text-sm">
        {title && <p className={`font-semibold ${config.text}`}>{title}</p>}
        {children && <div className={`${title ? 'mt-1' : ''} leading-relaxed text-slate-600`}>{children}</div>}
      </div>
    </div>
  );
}

export { AlertCircle };
