import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  CalendarDays,
  FileBarChart2,
  KeyRound,
  LockKeyhole,
  Mail,
  Save,
  ShieldCheck,
  TrendingUp,
  UserRound,
} from 'lucide-react';
import Button from '../components/ui/Button.jsx';
import Input from '../components/ui/Input.jsx';
import Alert from '../components/ui/Alert.jsx';
import { useAuth } from '../context/AuthContext.jsx';
import { useToast } from '../context/ToastContext.jsx';
import * as analysesApi from '../api/analyses.js';
import { formatDate, initials } from '../utils/format.js';

export default function ProfilePage() {
  const { user, updateProfile } = useAuth();
  const { toast } = useToast();

  const [values, setValues] = useState({ name: user?.name || '', email: user?.email || '' });
  const [errors, setErrors] = useState({});
  const [saving, setSaving] = useState(false);
  const [formError, setFormError] = useState('');
  const [stats, setStats] = useState(null);

  useEffect(() => {
    setValues({ name: user?.name || '', email: user?.email || '' });
  }, [user?.name, user?.email]);

  useEffect(() => {
    let active = true;
    analysesApi
      .stats()
      .then((data) => {
        if (active) setStats(data.stats || {});
      })
      .catch(() => {
        // Stats are supplementary — failure should not break the profile page.
      });
    return () => {
      active = false;
    };
  }, []);

  const setField = (field) => (event) => {
    setValues((current) => ({ ...current, [field]: event.target.value }));
    setErrors((current) => ({ ...current, [field]: undefined }));
    setFormError('');
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    const next = {};
    if (!values.name.trim()) next.name = 'Name is required.';
    else if (values.name.trim().length < 2) next.name = 'Name must be at least 2 characters.';
    if (!values.email.trim()) next.email = 'Email is required.';
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(values.email.trim())) {
      next.email = 'Enter a valid email address.';
    }
    setErrors(next);
    if (Object.keys(next).length > 0) return;

    setSaving(true);
    setFormError('');
    try {
      await updateProfile({
        name: values.name.trim(),
        email: values.email.trim(),
      });
      toast.success('Profile updated successfully.');
    } catch (error) {
      setFormError(error.message || 'Could not save your profile.');
    } finally {
      setSaving(false);
    }
  };

  const accountStats = [
    { label: 'Total analyses', value: stats?.totalAnalyses ?? '—', Icon: FileBarChart2, accent: 'bg-brand-50 text-brand-600' },
    { label: 'Average score', value: stats?.averageScore != null ? Math.round(stats.averageScore) : '—', Icon: TrendingUp, accent: 'bg-sky-50 text-sky-600' },
  ];

  return (
    <div className="space-y-6 animate-fade-in">
      <div>
        <h2 className="text-2xl font-bold tracking-tight text-slate-900 sm:text-3xl">Your profile</h2>
        <p className="mt-2 text-sm text-slate-600">Manage your account details and preferences.</p>
      </div>

      <div className="grid items-start gap-6 lg:grid-cols-[1fr_1.5fr]">
        {/* Identity card */}
        <div className="space-y-6">
          <section className="card overflow-hidden" aria-labelledby="account-title">
            <div className="relative h-24 bg-gradient-to-r from-brand-600 via-brand-500 to-violet-600">
              <div className="pointer-events-none absolute inset-0 grid-pattern opacity-20" />
            </div>
            <div className="px-6 pb-6">
              <div className="-mt-10 flex h-20 w-20 items-center justify-center rounded-2xl border-4 border-white bg-gradient-to-br from-brand-500 to-violet-600 text-2xl font-bold text-white shadow-soft">
                {initials(user?.name)}
              </div>
              <h3 id="account-title" className="mt-4 text-xl font-bold text-slate-900">
                {user?.name || 'Your account'}
              </h3>
              <p className="mt-1 flex items-center gap-1.5 text-sm text-slate-500">
                <Mail className="h-3.5 w-3.5" /> {user?.email || '—'}
              </p>
              {user?.createdAt && (
                <p className="mt-2 flex items-center gap-1.5 text-xs text-slate-400">
                  <CalendarDays className="h-3.5 w-3.5" />
                  Member since {formatDate(user.createdAt)}
                </p>
              )}
            </div>
          </section>

          <section className="card p-6" aria-labelledby="account-stats-title">
            <h3 id="account-stats-title" className="text-base font-semibold text-slate-900">Account at a glance</h3>
            <div className="mt-4 grid grid-cols-2 gap-3">
              {accountStats.map(({ label, value, Icon, accent }) => (
                <div key={label} className="rounded-xl bg-slate-50 p-4">
                  <span className={`flex h-8 w-8 items-center justify-center rounded-lg ${accent}`}>
                    <Icon className="h-4 w-4" />
                  </span>
                  <p className="mt-3 text-2xl font-bold tabular-nums text-slate-900">{value}</p>
                  <p className="text-xs text-slate-500">{label}</p>
                </div>
              ))}
            </div>
            <Button as={Link} to="/history" variant="secondary" className="mt-5 w-full">
              View analysis history
            </Button>
          </section>
        </div>

        {/* Edit form */}
        <div className="space-y-6">
          <section className="card p-6" aria-labelledby="edit-title">
            <div className="flex items-center gap-3">
              <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-brand-50 text-brand-600">
                <UserRound className="h-[18px] w-[18px]" aria-hidden="true" />
              </span>
              <div>
                <h3 id="edit-title" className="text-base font-semibold text-slate-900">Account information</h3>
                <p className="text-xs text-slate-500">Update how you appear in ResumeIQ</p>
              </div>
            </div>

            {formError && (
              <Alert type="error" title="Could not save changes" className="mt-5">
                {formError}
              </Alert>
            )}

            <form onSubmit={handleSubmit} noValidate className="mt-6 space-y-5">
              <Input
                label="Full name"
                icon={UserRound}
                value={values.name}
                onChange={setField('name')}
                error={errors.name}
                autoComplete="name"
                required
              />
              <Input
                label="Email address"
                type="email"
                icon={Mail}
                value={values.email}
                onChange={setField('email')}
                error={errors.email}
                autoComplete="email"
                required
              />
              <div className="flex flex-wrap items-center justify-between gap-3 border-t border-slate-100 pt-5">
                <p className="text-xs text-slate-500">Changes are saved to your account instantly.</p>
                <Button type="submit" loading={saving} leftIcon={Save}>
                  {saving ? 'Saving…' : 'Save changes'}
                </Button>
              </div>
            </form>
          </section>

          <section className="card p-6" aria-labelledby="password-title">
            <div className="flex items-center gap-3">
              <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-slate-100 text-slate-600">
                <KeyRound className="h-[18px] w-[18px]" aria-hidden="true" />
              </span>
              <div>
                <h3 id="password-title" className="text-base font-semibold text-slate-900">Password</h3>
                <p className="text-xs text-slate-500">Keeping your account secure</p>
              </div>
            </div>
            <Alert type="info" className="mt-5" title="Password resets">
              For security, password changes are handled by support. Please contact support if you
              need to reset your password.
            </Alert>
          </section>

          <section className="card p-6" aria-labelledby="privacy-title">
            <div className="flex items-center gap-3">
              <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-emerald-50 text-emerald-600">
                <ShieldCheck className="h-[18px] w-[18px]" aria-hidden="true" />
              </span>
              <div>
                <h3 id="privacy-title" className="text-base font-semibold text-slate-900">Storage & privacy</h3>
                <p className="text-xs text-slate-500">How your data is handled</p>
              </div>
            </div>
            <p className="mt-4 text-sm leading-relaxed text-slate-600">
              Your uploaded resumes and analysis reports are stored securely and linked only to
              your account. They are never shared with other users. You can revisit them any time
              from your analysis history.
            </p>
            <p className="mt-3 flex items-center gap-1.5 text-xs font-medium text-slate-400">
              <LockKeyhole className="h-3.5 w-3.5" /> Private by design.
            </p>
          </section>
        </div>
      </div>
    </div>
  );
}
