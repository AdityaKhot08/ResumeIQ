import { forwardRef, useId } from 'react';

/**
 * Labelled text input with optional leading icon, trailing slot (e.g. a
 * show/hide password toggle), inline error and helper text.
 */
const Input = forwardRef(function Input(
  {
    label,
    icon: Icon,
    rightSlot,
    error,
    hint,
    className = '',
    wrapperClassName = '',
    id,
    required,
    ...props
  },
  ref,
) {
  const generatedId = useId();
  const inputId = id || generatedId;
  const describedBy = error ? `${inputId}-error` : hint ? `${inputId}-hint` : undefined;

  return (
    <div className={wrapperClassName}>
      {label && (
        <label htmlFor={inputId} className="label">
          {label}
          {required && <span className="ml-0.5 text-rose-500">*</span>}
        </label>
      )}
      <div className="relative">
        {Icon && (
          <Icon
            className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400"
            aria-hidden="true"
          />
        )}
        <input
          ref={ref}
          id={inputId}
          className={`input ${Icon ? 'pl-10' : ''} ${rightSlot ? 'pr-11' : ''} ${error ? 'input-error' : ''} ${className}`}
          aria-invalid={Boolean(error)}
          aria-describedby={describedBy}
          {...props}
        />
        {rightSlot && (
          <div className="absolute right-2 top-1/2 -translate-y-1/2">{rightSlot}</div>
        )}
      </div>
      {error ? (
        <p id={`${inputId}-error`} className="mt-1.5 text-xs font-medium text-rose-600">
          {error}
        </p>
      ) : hint ? (
        <p id={`${inputId}-hint`} className="mt-1.5 text-xs text-slate-500">
          {hint}
        </p>
      ) : null}
    </div>
  );
});

export default Input;
