import { Loader2 } from 'lucide-react';

const SIZES = {
  xs: 'h-3.5 w-3.5',
  sm: 'h-4 w-4',
  md: 'h-5 w-5',
  lg: 'h-8 w-8',
  xl: 'h-12 w-12',
};

/** Animated loading spinner. */
export default function Spinner({ size = 'md', className = '', label = 'Loading' }) {
  return (
    <Loader2
      className={`animate-spin ${SIZES[size] || SIZES.md} ${className}`}
      role="status"
      aria-label={label}
    />
  );
}
