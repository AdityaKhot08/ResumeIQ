import { createContext, useCallback, useContext, useMemo, useRef, useState } from 'react';
import { AlertTriangle, CheckCircle2, Info, X, XCircle } from 'lucide-react';

const ToastContext = createContext(null);

const VARIANTS = {
  success: {
    Icon: CheckCircle2,
    iconClass: 'text-emerald-500',
    ring: 'ring-emerald-100',
    bar: 'bg-emerald-500',
  },
  error: {
    Icon: XCircle,
    iconClass: 'text-rose-500',
    ring: 'ring-rose-100',
    bar: 'bg-rose-500',
  },
  info: {
    Icon: Info,
    iconClass: 'text-brand-500',
    ring: 'ring-brand-100',
    bar: 'bg-brand-500',
  },
  warning: {
    Icon: AlertTriangle,
    iconClass: 'text-amber-500',
    ring: 'ring-amber-100',
    bar: 'bg-amber-500',
  },
};

const DEFAULT_DURATION = 4500;

export function ToastProvider({ children }) {
  const [toasts, setToasts] = useState([]);
  const idRef = useRef(0);

  const dismiss = useCallback((id) => {
    setToasts((current) => current.filter((toast) => toast.id !== id));
  }, []);

  const push = useCallback(
    (type, message, options = {}) => {
      const id = ++idRef.current;
      const duration = options.duration ?? DEFAULT_DURATION;
      setToasts((current) => [...current, { id, type, message }]);
      if (duration > 0) {
        // Capture id so each toast dismisses itself, not the latest one.
        setTimeout(() => dismiss(id), duration);
      }
      return id;
    },
    [dismiss],
  );

  const toast = useMemo(
    () => ({
      success: (message, options) => push('success', message, options),
      error: (message, options) => push('error', message, options),
      info: (message, options) => push('info', message, options),
      warning: (message, options) => push('warning', message, options),
      dismiss,
    }),
    [push, dismiss],
  );

  return (
    <ToastContext.Provider value={{ toast }}>
      {children}
      <div
        className="pointer-events-none fixed inset-x-4 top-4 z-[100] flex flex-col items-center gap-3 sm:inset-x-auto sm:right-6 sm:items-end"
        aria-live="polite"
        aria-atomic="false"
      >
        {toasts.map((item) => {
          const variant = VARIANTS[item.type] || VARIANTS.info;
          const Icon = variant.Icon;
          return (
            <div
              key={item.id}
              role="status"
              className={`pointer-events-auto relative flex w-full max-w-sm animate-slide-up items-start gap-3 overflow-hidden rounded-2xl border border-slate-200 bg-white p-4 shadow-lg ring-1 ${variant.ring}`}
            >
              <Icon className={`mt-0.5 h-5 w-5 flex-none ${variant.iconClass}`} aria-hidden="true" />
              <p className="flex-1 text-sm font-medium leading-6 text-slate-700">{item.message}</p>
              <button
                type="button"
                onClick={() => dismiss(item.id)}
                className="-mr-1 -mt-1 rounded-lg p-1 text-slate-400 transition hover:bg-slate-100 hover:text-slate-600"
                aria-label="Dismiss notification"
              >
                <X className="h-4 w-4" />
              </button>
              <span
                className={`absolute bottom-0 left-0 h-0.5 ${variant.bar}`}
                style={{ width: '100%', transformOrigin: 'left' }}
              />
            </div>
          );
        })}
      </div>
    </ToastContext.Provider>
  );
}

/** Access the toast API. Must be used inside <ToastProvider>. */
export function useToast() {
  const context = useContext(ToastContext);
  if (!context) {
    throw new Error('useToast must be used within a ToastProvider');
  }
  return context;
}

export default ToastContext;
