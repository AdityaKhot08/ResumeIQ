import { Link, useLocation } from 'react-router-dom';
import { Menu, Plus } from 'lucide-react';
import Button from '../ui/Button.jsx';
import { NAV_ITEMS } from '../../utils/constants.js';
import { useAuth } from '../../context/AuthContext.jsx';
import { initials } from '../../utils/format.js';

function greeting() {
  const hour = new Date().getHours();
  if (hour < 12) return 'Good morning';
  if (hour < 18) return 'Good afternoon';
  return 'Good evening';
}

/** Sticky dashboard top bar with route-aware title and global CTA. */
export default function Topbar({ onMenuClick }) {
  const { user } = useAuth();
  const { pathname } = useLocation();

  const matched = NAV_ITEMS.find((item) => pathname.startsWith(item.to));
  let title = matched?.title || 'Dashboard';
  let subtitle = matched?.subtitle || 'A snapshot of your resume journey.';

  if (pathname.startsWith('/results')) {
    title = 'Analysis Results';
    subtitle = 'A detailed breakdown of your resume compatibility.';
  }

  const firstName = user?.name?.trim().split(/\s+/)[0] || 'there';

  return (
    <header className="sticky top-0 z-30 flex h-[76px] items-center justify-between gap-3 border-b border-slate-200/80 bg-white/85 px-4 backdrop-blur-xl sm:px-6 lg:px-8">
      <div className="flex min-w-0 items-center gap-3">
        <button
          type="button"
          onClick={onMenuClick}
          className="-ml-1 rounded-xl p-2 text-slate-600 transition hover:bg-slate-100 lg:hidden"
          aria-label="Open navigation"
        >
          <Menu className="h-5 w-5" />
        </button>
        <div className="min-w-0">
          <h1 className="truncate text-lg font-semibold tracking-tight text-slate-900 sm:text-xl">
            {title}
          </h1>
          <p className="hidden truncate text-xs text-slate-500 sm:block">{subtitle}</p>
        </div>
      </div>

      <div className="flex flex-none items-center gap-3 sm:gap-4">
        <div className="hidden text-right md:block">
          <p className="text-[11px] font-medium text-slate-400">{greeting()},</p>
          <p className="text-sm font-semibold text-slate-700">{firstName}</p>
        </div>
        <div className="hidden h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-brand-500 to-violet-600 text-xs font-bold text-white md:flex">
          {initials(user?.name)}
        </div>
        <Button as={Link} to="/analyze" size="sm" leftIcon={Plus} className="whitespace-nowrap">
          <span className="hidden sm:inline">Analyze Resume</span>
          <span className="sm:hidden">Analyze</span>
        </Button>
      </div>
    </header>
  );
}
