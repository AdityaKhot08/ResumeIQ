/** Lightweight CSS-only tooltip shown on hover and keyboard focus. */
export default function Tooltip({ content, children, position = 'top', className = '' }) {
  const positions = {
    top: 'bottom-full left-1/2 -translate-x-1/2 mb-2',
    bottom: 'top-full left-1/2 -translate-x-1/2 mt-2',
    left: 'right-full top-1/2 -translate-y-1/2 mr-2',
    right: 'left-full top-1/2 -translate-y-1/2 ml-2',
  };

  return (
    <span className={`group relative inline-flex ${className}`} tabIndex={0}>
      {children}
      <span
        role="tooltip"
        className={`pointer-events-none absolute z-50 w-max max-w-xs rounded-lg bg-slate-900 px-2.5 py-1.5 text-xs font-medium text-white opacity-0 shadow-lg transition-opacity duration-150 group-hover:opacity-100 group-focus:opacity-100 ${positions[position] || positions.top}`}
      >
        {content}
      </span>
    </span>
  );
}
