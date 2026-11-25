import { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { ArrowRight, Eye, EyeOff, LockKeyhole, Mail, UserRound } from 'lucide-react';
import Input from '../components/ui/Input.jsx';
import Button from '../components/ui/Button.jsx';
import Alert from '../components/ui/Alert.jsx';
import { useAuth } from '../context/AuthContext.jsx';
import { useToast } from '../context/ToastContext.jsx';
import { BrandPanel } from './LoginPage.jsx';

const INITIAL = { name: '', email: '', password: '', confirm: '' };

export default function RegisterPage() {
  const { register } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();
  const location = useLocation();

  const from = location.state?.from
    ? `${location.state.from.pathname || '/dashboard'}${location.state.from.search || ''}`
    : '/dashboard';

  const [values, setValues] = useState(INITIAL);
  const [errors, setErrors] = useState({});
  const [showPassword, setShowPassword] = useState(false);
  const [formError, setFormError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const setField = (field) => (event) => {
    setValues((current) => ({ ...current, [field]: event.target.value }));
    setErrors((current) => ({ ...current, [field]: undefined }));
    setFormError('');
  };

  const validate = () => {
    const next = {};
    if (!values.name.trim()) next.name = 'Name is required.';
    else if (values.name.trim().length < 2) next.name = 'Name must be at least 2 characters.';

    if (!values.email.trim()) next.email = 'Email is required.';
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(values.email.trim())) {
      next.email = 'Enter a valid email address.';
    }

    if (!values.password) next.password = 'Password is required.';
    else if (values.password.length < 8) next.password = 'Use at least 8 characters.';

    if (!values.confirm) next.confirm = 'Please confirm your password.';
    else if (values.confirm !== values.password) next.confirm = 'Passwords do not match.';

    setErrors(next);
    return Object.keys(next).length === 0;
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    if (!validate()) return;

    setSubmitting(true);
    setFormError('');
    try {
      const data = await register({
        name: values.name.trim(),
        email: values.email.trim(),
        password: values.password,
      });
      toast.success(`Welcome to ResumeIQ${data?.user?.name ? `, ${data.user.name.split(' ')[0]}` : ''}!`);
      navigate(from, { replace: true });
    } catch (error) {
      // Surface field-level validation errors from the API when provided.
      if (Array.isArray(error.errors) && error.errors.length > 0) {
        const fieldErrors = {};
        error.errors.forEach(({ field, message }) => {
          if (field) fieldErrors[field] = message;
        });
        if (Object.keys(fieldErrors).length > 0) setErrors(fieldErrors);
      }
      setFormError(error.message || 'Unable to create your account. Please try again.');
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
              <UserRound className="h-5 w-5 text-white" />
            </span>
            <h1 className="mt-5 text-3xl font-bold tracking-tight text-slate-900">Create your account</h1>
            <p className="mt-2 text-sm text-slate-600">
              Start analysing resumes in less than a minute — no credit card needed.
            </p>
          </div>

          <div className="card p-6 sm:p-8">
            {formError && (
              <Alert type="error" title="Registration failed" className="mb-5">
                {formError}
              </Alert>
            )}

            <form onSubmit={handleSubmit} noValidate className="space-y-4">
              <Input
                label="Full name"
                type="text"
                name="name"
                autoComplete="name"
                placeholder="Ada Lovelace"
                icon={UserRound}
                value={values.name}
                onChange={setField('name')}
                error={errors.name}
                required
              />

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
                autoComplete="new-password"
                placeholder="At least 8 characters"
                icon={LockKeyhole}
                value={values.password}
                onChange={setField('password')}
                error={errors.password}
                hint="Use 8 or more characters."
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

              <Input
                label="Confirm password"
                type={showPassword ? 'text' : 'password'}
                name="confirm"
                autoComplete="new-password"
                placeholder="Re-enter your password"
                icon={LockKeyhole}
                value={values.confirm}
                onChange={setField('confirm')}
                error={errors.confirm}
                required
              />

              <Button type="submit" loading={submitting} className="w-full" rightIcon={ArrowRight}>
                {submitting ? 'Creating account…' : 'Create account'}
              </Button>
            </form>

            <p className="mt-6 text-center text-xs leading-relaxed text-slate-500">
              Your data stays private to your account. No spam, no credit card.
            </p>
          </div>

          <p className="mt-6 text-center text-sm text-slate-600">
            Already have an account?{' '}
            <Link to="/login" state={location.state} className="font-semibold text-brand-600 transition hover:text-brand-700">
              Sign in
            </Link>
          </p>
        </div>
      </div>

      <BrandPanel />
    </div>
  );
}
