import { useEffect, useState } from 'react';
import { NavLink, useLocation, useNavigate } from 'react-router-dom';
import { ArrowUpRight, LogOut, X } from 'lucide-react';
import { useAuth } from '../../context/AuthContext.jsx';
import { NAV_ITEMS } from '../../utils/constants.js';
import { initials } from '../../utils/format.js';
import Logo from './Logo.jsx';

/**
 * Desktop sidebar / mobile drawer. Dark slate-to-indigo gradient with route
 * navigation and a user card pinned to the bottom.
 */
export default function Sidebar({ open, onClose }) {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [busy, setBusy] = useState(false);

  // Close the mobile drawer whenever the route changes.
  useEffect(() => {
    onClose?.();
  }, [location.pathname]); // eslint-disable-line react-hooks/exhaustive-deps

  const handleLogout = () => {
    logout();
    navigate('/login', { replace: true });
  };

  return (
    <>
      {/* Mobile backdrop */}
      {open && (
        <div
          className="fixed inset-0 z-40 bg-slate-950/60 backdrop-blur-sm transition-opacity lg:hidden"
          onClick={onClose}
          aria-hidden="true"
        />
      )}

      <aside
        className={`fixed inset-y-0 left-0 z-50 flex w-[272px] flex-col border-r border-white/5 bg-gradient-to-b from-slate-900 via-slate-900 to-brand-950 px-4 py-6 text-white transition-transform duration-300 ease-in-out lg:translate-x-0 ${
          open ? 'translate-x-0 shadow-2xl' : '-translate-x-full'
        }`}
      >
        {/* Brand + mobile close */}
        <div className="flex items-center justify-between px-2">
          <Logo to="/dashboard" light />
          <button
            type="button"
            onClick={onClose}
            className="rounded-lg p-1.5 text-slate-400 transition hover:bg-white/10 hover:text-white lg:hidden"
            aria-label="Close navigation"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <p className="mt-2 px-2 text-[11px] font-medium uppercase tracking-[0.18em] text-slate-500">
          Workspace
        </p>

        {/* Navigation */}
        <nav className="mt-5 flex-1 space-y-1.5" aria-label="Main navigation">
          {NAV_ITEMS.map((item) => {
            const Icon = item.icon;
            return (
              <NavLink
                key={item.to}
                to={item.to}
                onClick={onClose}
                className={({ isActive }) =>
                  `group flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-all ${
                    isActive
                      ? 'bg-white/10 text-white shadow-sm ring-1 ring-inset ring-white/10'
                      : 'text-slate-400 hover:bg-white/5 hover:text-white'
                  }`
                }
              >
                {({ isActive }) => (
                  <>
                    <span
                      className={`flex h-8 w-8 flex-none items-center justify-center rounded-lg transition ${
                        isActive
                          ? 'bg-gradient-to-br from-brand-500 to-violet-600 text-white shadow-glow'
                          : 'bg-white/5 text-slate-400 group-hover:text-white'
                      }`}
                    >
                      <Icon className="h-4 w-4" aria-hidden="true" />
                    </span>
                    {item.label}
                    {isActive && (
                      <span className="ml-auto h-1.5 w-1.5 rounded-full bg-brand-400" />
                    )}
                  </>
                )}
              </NavLink>
            );
          })}
        </nav>

        {/* Upgrade / tip card */}
        <div className="mb-4 rounded-2xl border border-white/10 bg-white/5 p-4">
          <div className="flex items-center gap-2 text-xs font-semibold text-white">
            <ArrowUpRight className="h-4 w-4 text-brand-300" />
            Quick tip
          </div>
          <p className="mt-2 text-xs leading-relaxed text-slate-400">
            Tailor each analysis to a specific role for the most useful insights.
          </p>
        </div>

        {/* User card */}
        <div className="border-t border-white/10 pt-4">
          <div className="flex items-center gap-3 rounded-xl px-2 py-2">
            <div className="flex h-10 w-10 flex-none items-center justify-center rounded-xl bg-gradient-to-br from-brand-400 to-violet-500 text-sm font-bold text-white">
              {initials(user?.name)}
            </div>
            <div className="min-w-0 flex-1">
              <p className="truncate text-sm font-semibold text-white">{user?.name || 'Account'}</p>
              <p className="truncate text-xs text-slate-400">{user?.email || ''}</p>
            </div>
            <button
              type="button"
              onClick={handleLogout}
              disabled={busy}
              className="rounded-lg p-2 text-slate-400 transition hover:bg-white/10 hover:text-white disabled:opacity-50"
              title="Log out"
              aria-label="Log out"
            >
              <LogOut className="h-4 w-4" />
            </button>
          </div>
        </div>
      </aside>
    </>
  );
}
