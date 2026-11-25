import { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { ArrowRight, CheckCircle2, Eye, EyeOff, LockKeyhole, Mail, ShieldCheck, Sparkles, TrendingUp } from 'lucide-react';
import Input from '../components/ui/Input.jsx';
import Button from '../components/ui/Button.jsx';
import Alert from '../components/ui/Alert.jsx';
import { useAuth } from '../context/AuthContext.jsx';
import { useToast } from '../context/ToastContext.jsx';

const HIGHLIGHTS = [
  { Icon: Sparkles, text: 'Instant skill and keyword matching' },
  { Icon: TrendingUp, text: 'Clear scores and progress tracking' },
  { Icon: ShieldCheck, text: 'Your resumes stay private to you' },
];

export default function LoginPage() {
  const { login } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();
  const location = useLocation();

  const [values, setValues] = useState({ email: '', password: '' });
  const [errors, setErrors] = useState({});
  const [showPassword, setShowPassword] = useState(false);
  const [formError, setFormError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const from = location.state?.from
    ? `${location.state.from.pathname || '/dashboard'}${location.state.from.search || ''}`
    : '/dashboard';

  const setField = (field) => (event) => {
    setValues((current) => ({ ...current, [field]: event.target.value }));
    setErrors((current) => ({ ...current, [field]: undefined }));
    setFormError('');
  };

  const validate = () => {
    const next = {};
    if (!values.email.trim()) next.email = 'Email is required.';
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(values.email.trim())) {
      next.email = 'Enter a valid email address.';
    }
    if (!values.password) next.password = 'Password is required.';
    setErrors(next);
    return Object.keys(next).length === 0;
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    if (!validate()) return;

    setSubmitting(true);
    setFormError('');
    try {
      const data = await login({
        email: values.email.trim(),
        password: values.password,
      });
      toast.success(`Welcome back${data?.user?.name ? `, ${data.user.name.split(' ')[0]}` : ''}!`);
      navigate(from, { replace: true });
    } catch (error) {
      setFormError(error.message || 'Unable to sign in. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="mx-auto grid min-h-[calc(100vh-72px)] max-w-7xl lg:grid-cols-2">
      {/* Form */}
      <div className="flex items-center justify-center px-4 py-12 sm:px-6">
        <div className="w-full max-w-md animate-slide-up">
          <div className="mb-8">
            <span className="flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br from-brand-500 to-violet-600 shadow-glow">
              <LockKeyhole className="h-5 w-5 text-white" />
            </span>
            <h1 className="mt-5 text-3xl font-bold tracking-tight text-slate-900">Welcome back</h1>
            <p className="mt-2 text-sm text-slate-600">
              Sign in to pick up where you left off. Your analyses are waiting.
            </p>
          </div>

          <div className="card p-6 sm:p-8">
            {formError && (
              <Alert type="error" title="Sign in failed" className="mb-5">
                {formError}
              </Alert>
            )}

            <form onSubmit={handleSubmit} noValidate className="space-y-5">
              <Input
                label="Email address"
                type="email"
                name="email"
                autoComplete="email"
                placeholder="you@example.com"
                icon={Mail}
                value={values.email}
                onChange={setField('email')}
                error={errors.email}
                required
              />

              <Input
                label="Password"
                type={showPassword ? 'text' : 'password'}
                name="password"
                autoComplete="current-password"
                placeholder="Enter your password"
                icon={LockKeyhole}
                value={values.password}
                onChange={setField('password')}
                error={errors.password}
                rightSlot={
                  <button
                    type="button"
                    onClick={() => setShowPassword((visible) => !visible)}
                    className="rounded-lg p-1.5 text-slate-400 transition hover:bg-slate-100 hover:text-slate-600"
                    aria-label={showPassword ? 'Hide password' : 'Show password'}
                  >
                    {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                }
                required
              />

              <Button type="submit" loading={submitting} className="w-full" rightIcon={ArrowRight}>
                {submitting ? 'Signing in…' : 'Sign in'}
              </Button>
            </form>

            <p className="mt-6 text-center text-xs leading-relaxed text-slate-500">
              Demo friendly — create an account in seconds, no credit card required.
            </p>
          </div>

          <p className="mt-6 text-center text-sm text-slate-600">
            New to ResumeIQ?{' '}
            <Link to="/register" state={location.state} className="font-semibold text-brand-600 transition hover:text-brand-700">
              Create an account
            </Link>
          </p>
        </div>
      </div>

      <BrandPanel />
    </div>
  );
}

/** Branded gradient panel shown alongside the form on large screens. */
export function BrandPanel() {
  return (
    <div className="relative hidden overflow-hidden bg-gradient-to-br from-slate-900 via-brand-900 to-violet-900 lg:flex lg:flex-col lg:justify-center lg:px-14 xl:px-20">
      <div className="pointer-events-none absolute inset-0 grid-pattern opacity-20" />
      <div className="pointer-events-none absolute -right-32 -top-32 h-96 w-96 rounded-full bg-brand-500/30 blur-3xl" />
      <div className="pointer-events-none absolute -bottom-32 -left-24 h-96 w-96 rounded-full bg-violet-500/25 blur-3xl" />

      <div className="relative max-w-md">
        <span className="chip border-white/15 bg-white/10 text-brand-100 ring-white/15">
          <Sparkles className="h-3.5 w-3.5" /> Resume intelligence
        </span>
        <h2 className="mt-6 text-balance text-4xl font-bold leading-tight tracking-tight text-white">
          Make every application count.
        </h2>
        <p className="mt-4 text-sm leading-relaxed text-brand-100/80">
          See exactly where you stand, close the gaps, and walk into your next application with
          confidence.
        </p>

        <ul className="mt-10 space-y-4">
          {HIGHLIGHTS.map(({ Icon, text }) => (
            <li key={text} className="flex items-center gap-3 text-sm text-white">
              <span className="flex h-9 w-9 flex-none items-center justify-center rounded-xl bg-white/10 ring-1 ring-white/15">
                <Icon className="h-4 w-4 text-brand-200" />
              </span>
              {text}
            </li>
          ))}
        </ul>

        <div className="mt-12 rounded-2xl border border-white/10 bg-white/5 p-5 backdrop-blur">
          <div className="flex items-center gap-1 text-amber-300" aria-label="Five out of five stars">
            {Array.from({ length: 5 }).map((_, index) => (
              <CheckCircle2 key={index} className="h-4 w-4" />
            ))}
          </div>
          <p className="mt-3 text-sm italic leading-relaxed text-white/90">
            “I finally understood why my applications were not getting noticed. The skill-gap
            breakdown made it obvious what to fix.”
          </p>
          <p className="mt-3 text-xs font-medium text-brand-200">A ResumeIQ user</p>
        </div>
      </div>
    </div>
  );
}
