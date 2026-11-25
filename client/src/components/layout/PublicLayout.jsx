import { useEffect, useState } from 'react';
import { Link, Outlet } from 'react-router-dom';
import { ArrowRight } from 'lucide-react';
import Logo from './Logo.jsx';
import Button from '../ui/Button.jsx';

/** Shared header + footer for the landing and authentication pages. */
export default function PublicLayout() {
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 12);
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  return (
    <div className="flex min-h-screen flex-col bg-white">
      <header
        className={`sticky top-0 z-40 transition-all duration-300 ${
          scrolled
            ? 'border-b border-slate-200/80 bg-white/90 shadow-sm backdrop-blur-xl'
            : 'border-b border-transparent bg-white/60 backdrop-blur-sm'
        }`}
      >
        <div className="mx-auto flex h-[72px] max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
          <Logo to="/" />

          <nav className="hidden items-center gap-8 md:flex" aria-label="Primary">
            <a href="/#features" className="text-sm font-medium text-slate-600 transition hover:text-brand-600">
              Features
            </a>
            <a href="/#how-it-works" className="text-sm font-medium text-slate-600 transition hover:text-brand-600">
              How it works
            </a>
            <a href="/#cta" className="text-sm font-medium text-slate-600 transition hover:text-brand-600">
              Get started
            </a>
          </nav>

          <div className="flex items-center gap-2 sm:gap-3">
            <Button as={Link} to="/login" variant="ghost" size="sm" className="hidden sm:inline-flex">
              Sign in
            </Button>
            <Button as={Link} to="/register" size="sm" rightIcon={ArrowRight}>
              Get started
            </Button>
          </div>
        </div>
      </header>

      <main className="flex-1">
        <Outlet />
      </main>

      <footer className="border-t border-slate-200 bg-slate-50/70">
        <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
          <div className="grid gap-10 md:grid-cols-[2fr_1fr_1fr]">
            <div>
              <Logo to="/" />
              <p className="mt-4 max-w-sm text-sm leading-relaxed text-slate-500">
                ResumeIQ helps job seekers understand how their resume measures up to a role —
                and shows exactly what to improve next.
              </p>
              <p className="mt-4 text-xs text-slate-400">Rule-based analysis. Honest insights.</p>
            </div>
            <div>
              <h4 className="text-xs font-semibold uppercase tracking-wider text-slate-500">Product</h4>
              <ul className="mt-4 space-y-3 text-sm text-slate-600">
                <li><a href="/#features" className="transition hover:text-brand-600">Features</a></li>
                <li><a href="/#how-it-works" className="transition hover:text-brand-600">How it works</a></li>
                <li><Link to="/analyze" className="transition hover:text-brand-600">Analyze a resume</Link></li>
              </ul>
            </div>
            <div>
              <h4 className="text-xs font-semibold uppercase tracking-wider text-slate-500">Account</h4>
              <ul className="mt-4 space-y-3 text-sm text-slate-600">
                <li><Link to="/login" className="transition hover:text-brand-600">Sign in</Link></li>
                <li><Link to="/register" className="transition hover:text-brand-600">Create account</Link></li>
                <li><Link to="/dashboard" className="transition hover:text-brand-600">Dashboard</Link></li>
              </ul>
            </div>
          </div>
          <div className="mt-10 flex flex-col items-start justify-between gap-3 border-t border-slate-200 pt-6 text-xs text-slate-400 sm:flex-row sm:items-center">
            <p>© {new Date().getFullYear()} ResumeIQ. All rights reserved.</p>
            <p>Built for job seekers, with clarity in mind.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}
