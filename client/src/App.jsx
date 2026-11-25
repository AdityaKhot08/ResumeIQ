import { Navigate, Route, Routes, useLocation } from 'react-router-dom';
import { useAuth } from './context/AuthContext.jsx';
import PublicLayout from './components/layout/PublicLayout.jsx';
import DashboardLayout from './components/layout/DashboardLayout.jsx';
import Spinner from './components/ui/Spinner.jsx';
import LandingPage from './pages/LandingPage.jsx';
import LoginPage from './pages/LoginPage.jsx';
import RegisterPage from './pages/RegisterPage.jsx';
import DashboardPage from './pages/DashboardPage.jsx';
import AnalyzePage from './pages/AnalyzePage.jsx';
import ResultsPage from './pages/ResultsPage.jsx';
import HistoryPage from './pages/HistoryPage.jsx';
import ProfilePage from './pages/ProfilePage.jsx';
import NotFoundPage from './pages/NotFoundPage.jsx';

/** Full-screen splash shown while we validate a persisted session. */
function Splash() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center gap-4 bg-slate-50">
      <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br from-brand-500 to-violet-600 shadow-glow">
        <Spinner size="lg" className="!text-white" label="Loading your workspace" />
      </div>
      <p className="text-sm font-medium text-slate-500">Loading your workspace…</p>
    </div>
  );
}

/** Route guard: waits for auth validation, then redirects unauthenticated users. */
function RequireAuth({ children }) {
  const { isAuthenticated, loading } = useAuth();
  const location = useLocation();

  if (loading) return <Splash />;
  // Remember the intended destination so auth pages can return the user there.
  if (!isAuthenticated) return <Navigate to="/login" replace state={{ from: location }} />;

  return children;
}

export default function App() {
  const { loading } = useAuth();

  // Full-screen splash while a persisted token is validated on startup.
  if (loading) return <Splash />;

  return (
    <Routes>
      {/* Public routes */}
      <Route element={<PublicLayout />}>
        <Route path="/" element={<LandingPage />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />
        <Route path="*" element={<NotFoundPage />} />
      </Route>

      {/* Convenience redirect */}
      <Route path="/app" element={<Navigate to="/dashboard" replace />} />

      {/* Protected routes */}
      <Route
        element={
          <RequireAuth>
            <DashboardLayout />
          </RequireAuth>
        }
      >
        <Route path="/dashboard" element={<DashboardPage />} />
        <Route path="/analyze" element={<AnalyzePage />} />
        <Route path="/results/:id" element={<ResultsPage />} />
        <Route path="/history" element={<HistoryPage />} />
        <Route path="/profile" element={<ProfilePage />} />
      </Route>
    </Routes>
  );
}
