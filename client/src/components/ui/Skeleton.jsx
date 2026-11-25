/** Shimmering placeholder block. */
export default function Skeleton({ className = '' }) {
  return <div className={`skeleton ${className}`} aria-hidden="true" />;
}

// Named export as well, so consumers can use either import style.
export { Skeleton };

/** Several stacked skeleton lines for text placeholders. */
export function SkeletonText({ lines = 3, className = '' }) {
  return (
    <div className={`space-y-2.5 ${className}`} aria-hidden="true">
      {Array.from({ length: lines }).map((_, index) => (
        <Skeleton
          key={index}
          className={`h-3 ${index === lines - 1 ? 'w-2/3' : index % 2 === 0 ? 'w-full' : 'w-5/6'}`}
        />
      ))}
    </div>
  );
}

/** Placeholder that looks like a dashboard/stat card. */
export function SkeletonCard({ className = '' }) {
  return (
    <div className={`card p-6 ${className}`} aria-hidden="true">
      <div className="flex items-start justify-between">
        <Skeleton className="h-3.5 w-28" />
        <Skeleton className="h-9 w-9 rounded-xl" />
      </div>
      <Skeleton className="mt-5 h-8 w-20" />
      <Skeleton className="mt-3 h-3 w-24" />
    </div>
  );
}

/** Placeholder rows for a data table or list. */
export function SkeletonRows({ rows = 5, className = '' }) {
  return (
    <div className={`divide-y divide-slate-100 ${className}`} aria-hidden="true">
      {Array.from({ length: rows }).map((_, index) => (
        <div key={index} className="flex items-center gap-4 py-4">
          <Skeleton className="h-10 w-10 rounded-xl" />
          <div className="flex-1 space-y-2">
            <Skeleton className="h-3.5 w-1/3" />
            <Skeleton className="h-3 w-1/4" />
          </div>
          <Skeleton className="hidden h-6 w-16 rounded-full sm:block" />
          <Skeleton className="h-8 w-16 rounded-lg" />
        </div>
      ))}
    </div>
  );
}
