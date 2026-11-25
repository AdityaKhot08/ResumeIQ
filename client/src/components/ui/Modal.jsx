import { useEffect } from 'react';
import { createPortal } from 'react-dom';
import { X } from 'lucide-react';

const SIZES = {
  sm: 'max-w-sm',
  md: 'max-w-md',
  lg: 'max-w-lg',
  xl: 'max-w-xl',
};

/**
 * Accessible modal dialog rendered in a portal. Closes on Escape and
 * backdrop click, and locks background scrolling while open.
 */
export default function Modal({
  open,
  onClose,
  title,
  description,
  children,
  footer,
  size = 'md',
  closeOnBackdrop = true,
}) {
  useEffect(() => {
    if (!open) return undefined;

    const handleKey = (event) => {
      if (event.key === 'Escape') onClose?.();
    };
    document.addEventListener('keydown', handleKey);

    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';

    return () => {
      document.removeEventListener('keydown', handleKey);
      document.body.style.overflow = previousOverflow;
    };
  }, [open, onClose]);

  if (!open || typeof document === 'undefined') return null;

  return createPortal(
    <div className="fixed inset-0 z-[90] flex items-center justify-center p-4" role="presentation">
      <div
        className="absolute inset-0 bg-slate-950/50 backdrop-blur-sm animate-fade-in"
        onClick={closeOnBackdrop ? onClose : undefined}
        aria-hidden="true"
      />
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby={title ? 'modal-title' : undefined}
        className={`relative z-10 w-full ${SIZES[size] || SIZES.md} animate-scale-in rounded-2xl bg-white p-6 shadow-lg`}
      >
        <button
          type="button"
          onClick={onClose}
          className="absolute right-4 top-4 rounded-lg p-1.5 text-slate-400 transition hover:bg-slate-100 hover:text-slate-700"
          aria-label="Close dialog"
        >
          <X className="h-5 w-5" />
        </button>

        {title && (
          <h2 id="modal-title" className="pr-8 text-lg font-semibold text-slate-900">
            {title}
          </h2>
        )}
        {description && <p className="mt-1.5 pr-8 text-sm text-slate-500">{description}</p>}

        {children && <div className={title || description ? 'mt-5' : ''}>{children}</div>}

        {footer && <div className="mt-6 flex flex-wrap justify-end gap-3">{footer}</div>}
      </div>
    </div>,
    document.body,
  );
}
