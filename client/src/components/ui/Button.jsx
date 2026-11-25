import Spinner from './Spinner.jsx';

const VARIANTS = {
  primary: 'btn-primary',
  secondary: 'btn-secondary',
  ghost: 'btn-ghost',
  danger: 'inline-flex items-center justify-center gap-2 rounded-xl bg-rose-600 px-5 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-rose-700 focus-visible:ring-2 focus-visible:ring-rose-500 focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-60',
};

const SIZES = {
  sm: 'px-3.5 py-2 text-xs',
  md: '',
  lg: 'px-6 py-3 text-base',
};

/**
 * Versatile button. Use `as={Link} to="..."` to render a router link with the
 * same styling, or `loading` to show a spinner and block interaction.
 */
export default function Button({
  as: Component = 'button',
  variant = 'primary',
  size = 'md',
  loading = false,
  disabled = false,
  leftIcon: LeftIcon,
  rightIcon: RightIcon,
  className = '',
  children,
  ...props
}) {
  const isDisabled = disabled || loading;

  return (
    <Component
      className={`${VARIANTS[variant] || VARIANTS.primary} ${SIZES[size] || ''} ${className}`}
      disabled={isDisabled}
      aria-busy={loading || undefined}
      {...props}
    >
      {loading ? (
        <Spinner size="sm" />
      ) : (
        LeftIcon && <LeftIcon className="h-4 w-4 flex-none" aria-hidden="true" />
      )}
      {children}
      {!loading && RightIcon && <RightIcon className="h-4 w-4 flex-none" aria-hidden="true" />}
    </Component>
  );
}
