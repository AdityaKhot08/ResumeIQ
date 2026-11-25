/** Composable card primitives built on the shared `.card` class. */

export function Card({ as: Component = 'div', className = '', children, ...props }) {
  return (
    <Component className={`card ${className}`} {...props}>
      {children}
    </Component>
  );
}

export function CardHeader({ className = '', children, ...props }) {
  return (
    <div className={`border-b border-slate-100 px-6 py-5 ${className}`} {...props}>
      {children}
    </div>
  );
}

export function CardTitle({ as: Component = 'h3', className = '', children, ...props }) {
  return (
    <Component className={`text-base font-semibold text-slate-900 ${className}`} {...props}>
      {children}
    </Component>
  );
}

export function CardDescription({ className = '', children, ...props }) {
  return (
    <p className={`mt-1 text-sm text-slate-500 ${className}`} {...props}>
      {children}
    </p>
  );
}

export function CardContent({ className = '', children, ...props }) {
  return (
    <div className={`px-6 py-5 ${className}`} {...props}>
      {children}
    </div>
  );
}

export function CardFooter({ className = '', children, ...props }) {
  return (
    <div className={`border-t border-slate-100 px-6 py-4 ${className}`} {...props}>
      {children}
    </div>
  );
}

export default Card;
