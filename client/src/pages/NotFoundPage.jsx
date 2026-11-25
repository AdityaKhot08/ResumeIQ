import { Link } from 'react-router-dom';
import { ArrowLeft, Compass, FileQuestion } from 'lucide-react';
import Button from '../components/ui/Button.jsx';

/** Friendly 404 shown for unknown routes. */
export default function NotFoundPage() {
  return (
    <div className="relative flex min-h-[70vh] flex-col items-center justify-center overflow-hidden px-4 py-20 text-center">
      <div className="pointer-events-none absolute left-1/2 top-1/2 h-80 w-80 -translate-x-1/2 -translate-y-1/2 rounded-full bg-brand-100/50 blur-3xl" />

      <div className="relative animate-slide-up">
        <div className="mx-auto flex h-24 w-24 items-center justify-center rounded-3xl bg-gradient-to-br from-brand-500 to-violet-600 shadow-glow">
          <FileQuestion className="h-11 w-11 text-white" strokeWidth={1.8} />
        </div>
        <p className="mt-8 text-sm font-bold uppercase tracking-[0.2em] text-brand-600">404 · Page not found</p>
        <h1 className="mt-3 text-3xl font-bold tracking-tight text-slate-900 sm:text-4xl">
          This page took a wrong turn
        </h1>
        <p className="mx-auto mt-4 max-w-md text-sm leading-relaxed text-slate-600">
          The page you are looking for does not exist or may have moved. Let us get you back to
          something useful.
        </p>
        <div className="mt-8 flex flex-wrap justify-center gap-3">
          <Button as={Link} to="/" leftIcon={ArrowLeft}>
            Go home
          </Button>
          <Button as={Link} to="/dashboard" variant="secondary" leftIcon={Compass}>
            Go to dashboard
          </Button>
        </div>
      </div>
    </div>
  );
}
