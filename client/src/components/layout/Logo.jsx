import { Link } from 'react-router-dom';
import { Sparkles } from 'lucide-react';

/** ResumeIQ brand mark + wordmark. */
export default function Logo({ to = '/', light = false, compact = false, className = '' }) {
  const content = (
    <>
      <span className="flex h-9 w-9 flex-none items-center justify-center rounded-xl bg-gradient-to-br from-brand-500 via-brand-600 to-violet-600 shadow-glow">
        <Sparkles className="h-[18px] w-[18px] text-white" strokeWidth={2.2} aria-hidden="true" />
      </span>
      {!compact && (
        <span
          className={`text-[19px] font-extrabold tracking-tight ${
            light ? 'text-white' : 'text-slate-900'
          }`}
        >
          Resume<span className={light ? 'text-brand-300' : 'gradient-text'}>IQ</span>
        </span>
      )}
    </>
  );

  const classes = `inline-flex items-center gap-2.5 ${className}`;

  return to ? (
    <Link to={to} className={classes} aria-label="ResumeIQ home">
      {content}
    </Link>
  ) : (
    <span className={classes}>{content}</span>
  );
}
