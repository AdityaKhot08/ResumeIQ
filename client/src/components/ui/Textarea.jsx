import { forwardRef, useId } from 'react';

/** Labelled textarea with optional error, hint and live character counter. */
const Textarea = forwardRef(function Textarea(
  {
    label,
    error,
    hint,
    showCount = false,
    maxLength,
    rows = 6,
    className = '',
    wrapperClassName = '',
    id,
    required,
    value = '',
    ...props
  },
  ref,
) {
  const generatedId = useId();
  const textareaId = id || generatedId;
  const describedBy = error ? `${textareaId}-error` : hint ? `${textareaId}-hint` : undefined;
  const count = String(value ?? '').length;

  return (
    <div className={wrapperClassName}>
      {label && (
        <div className="flex items-baseline justify-between gap-3">
          <label htmlFor={textareaId} className="label">
            {label}
            {required && <span className="ml-0.5 text-rose-500">*</span>}
          </label>
          {showCount && (
            <span className="mb-1.5 text-xs tabular-nums text-slate-400">
              {maxLength ? `${count} / ${maxLength}` : `${count} characters`}
            </span>
          )}
        </div>
      )}
      <textarea
        ref={ref}
        id={textareaId}
        rows={rows}
        value={value}
        maxLength={maxLength}
        className={`input resize-y leading-relaxed ${error ? 'input-error' : ''} ${className}`}
        aria-invalid={Boolean(error)}
        aria-describedby={describedBy}
        {...props}
      />
      {error ? (
        <p id={`${textareaId}-error`} className="mt-1.5 text-xs font-medium text-rose-600">
          {error}
        </p>
      ) : hint ? (
        <p id={`${textareaId}-hint`} className="mt-1.5 text-xs text-slate-500">
          {hint}
        </p>
      ) : null}
    </div>
  );
});

export default Textarea;
