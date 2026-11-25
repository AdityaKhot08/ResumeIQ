import { Inbox } from 'lucide-react';

/** Friendly empty state with an icon, copy and an optional call to action. */
export default function EmptyState({
  icon: Icon = Inbox,
  title = 'Nothing here yet',
  description,
  action,
  className = '',
}) {
  return (
    <div className={`flex flex-col items-center justify-center px-6 py-14 text-center ${className}`}>
      <div className="mb-5 flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br from-brand-50 to-violet-50 ring-1 ring-brand-100">
        <Icon className="h-7 w-7 text-brand-500" aria-hidden="true" />
      </div>
      <h3 className="text-base font-semibold text-slate-900">{title}</h3>
      {description && (
        <p className="mt-2 max-w-sm text-sm leading-relaxed text-slate-500">{description}</p>
      )}
      {action && <div className="mt-6">{action}</div>}
    </div>
  );
}
