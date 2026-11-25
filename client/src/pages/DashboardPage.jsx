import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  Area,
  AreaChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip as ChartTooltip,
  XAxis,
  YAxis,
} from 'recharts';
import {
  ArrowRight,
  Clock3,
  FileBarChart2,
  Lightbulb,
  Sparkles,
  TrendingUp,
  Trophy,
} from 'lucide-react';
import Button from '../components/ui/Button.jsx';
import Badge from '../components/ui/Badge.jsx';
import Alert from '../components/ui/Alert.jsx';
import EmptyState from '../components/ui/EmptyState.jsx';
import { Skeleton, SkeletonCard, SkeletonRows } from '../components/ui/Skeleton.jsx';
import { useAuth } from '../context/AuthContext.jsx';
import * as analysesApi from '../api/analyses.js';
import { formatDate, relativeTime, truncate } from '../utils/format.js';

const TIPS = [
  'Mirror the exact job title from the posting in your resume summary.',
  'Add measurable results — numbers make your impact concrete.',
  'Keep one version of your resume tailored to each role you apply for.',
];

function scoreClasses(score) {
  const value = Number(score);
  if (value >= 80) return 'bg-emerald-50 text-emerald-700 ring-emerald-200';
  if (value >= 60) return 'bg-amber-50 text-amber-700 ring-amber-200';
  if (value >= 40) return 'bg-orange-50 text-orange-700 ring-orange-200';
  return 'bg-rose-50 text-rose-700 ring-rose-200';
}

export default function DashboardPage() {
  const { user } = useAuth();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [reloadKey, setReloadKey] = useState(0);

  useEffect(() => {
    let active = true;

    async function load() {
      setLoading(true);
      setError('');
      try {
        const [statsResponse, listResponse] = await Promise.all([
          analysesApi.stats(),
          analysesApi.list({ page: 1, limit: 5 }),
        ]);
        if (!active) return;
        setData({
          stats: statsResponse.stats || {},
          analyses: listResponse.analyses || [],
        });
      } catch (loadError) {
        if (active) setError(loadError.message || 'Could not load your dashboard.');
      } finally {
        if (active) setLoading(false);
      }
    }

    load();
    return () => {
      active = false;
    };
  }, [reloadKey]);

  const firstName = user?.name?.trim().split(/\s+/)[0] || 'there';
  const today = formatDate(new Date(), { weekday: 'long', month: 'long', day: 'numeric' });
  const stats = data?.stats || {};
  const analyses = data?.analyses || [];
  const trend = Array.isArray(stats.trend) ? stats.trend : [];

  const statCards = [
    { label: 'Total analyses', value: stats.totalAnalyses ?? 0, Icon: FileBarChart2, accent: 'bg-brand-50 text-brand-600' },
    { label: 'Average score', value: stats.averageScore != null ? Math.round(stats.averageScore) : '—', Icon: TrendingUp, accent: 'bg-sky-50 text-sky-600' },
    { label: 'Best score', value: stats.highestScore != null ? Math.round(stats.highestScore) : '—', Icon: Trophy, accent: 'bg-amber-50 text-amber-600' },
    { label: 'Recent (30 days)', value: stats.recentCount ?? 0, Icon: Clock3, accent: 'bg-emerald-50 text-emerald-600' },
  ];

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Greeting */}
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="text-xs font-semibold uppercase tracking-wider text-brand-600">{today}</p>
          <h2 className="mt-1 text-2xl font-bold tracking-tight text-slate-900 sm:text-3xl">
            Good to see you, {firstName} <span className="inline-block animate-float">👋</span>
          </h2>
          <p className="mt-2 text-sm text-slate-600">
            Here is how your resume work is coming along.
          </p>
        </div>
        <Button as={Link} to="/analyze" leftIcon={Sparkles}>
          New analysis
        </Button>
      </div>

      {error && (
        <Alert type="error" title="Could not load your dashboard">
          {error}
          <button
            type="button"
            onClick={() => setReloadKey((key) => key + 1)}
            className="ml-2 font-semibold underline underline-offset-2"
          >
            Try again
          </button>
        </Alert>
      )}

      {/* Stat cards */}
      {loading ? (
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          {Array.from({ length: 4 }).map((_, index) => (
            <SkeletonCard key={index} />
          ))}
        </div>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          {statCards.map(({ label, value, Icon, accent }) => (
            <div key={label} className="card p-5 transition hover:border-brand-200 hover:shadow-card">
              <div className="flex items-start justify-between">
                <p className="text-sm font-medium text-slate-500">{label}</p>
                <span className={`flex h-9 w-9 items-center justify-center rounded-xl ${accent}`}>
                  <Icon className="h-[18px] w-[18px]" aria-hidden="true" />
                </span>
              </div>
              <p className="mt-4 text-3xl font-bold tabular-nums tracking-tight text-slate-900">{value}</p>
            </div>
          ))}
        </div>
      )}

      <div className="grid gap-6 xl:grid-cols-[1.6fr_1fr]">
        {/* Score trend */}
        <section className="card p-6" aria-labelledby="trend-title">
          <div className="flex flex-wrap items-start justify-between gap-3">
            <div>
              <h3 id="trend-title" className="text-base font-semibold text-slate-900">Score trend</h3>
              <p className="mt-1 text-xs text-slate-500">Your compatibility scores over recent analyses</p>
            </div>
            {stats.scoreDelta != null && (
              <Badge variant={Number(stats.scoreDelta) >= 0 ? 'success' : 'danger'} dot>
                {Number(stats.scoreDelta) >= 0 ? '+' : ''}{Math.round(stats.scoreDelta)} pts
              </Badge>
            )}
          </div>

          <div className="mt-6 h-64">
            {loading ? (
              <Skeleton className="h-full w-full rounded-xl" />
            ) : trend.length === 0 ? (
              <EmptyState
                className="h-full py-8"
                icon={TrendingUp}
                title="No trend data yet"
                description="Run a couple of analyses and your score history will appear here."
                action={
                  <Button as={Link} to="/analyze" size="sm" variant="secondary">
                    Analyze a resume
                  </Button>
                }
              />
            ) : (
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={trend} margin={{ top: 8, right: 8, left: -22, bottom: 0 }}>
                  <defs>
                    <linearGradient id="scoreFill" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="#6366f1" stopOpacity={0.35} />
                      <stop offset="100%" stopColor="#6366f1" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="4 4" vertical={false} stroke="#e2e8f0" />
                  <XAxis
                    dataKey="date"
                    tick={{ fill: '#94a3b8', fontSize: 11 }}
                    axisLine={false}
                    tickLine={false}
                    tickFormatter={(value) => {
                      const date = new Date(value);
                      return Number.isNaN(date.getTime())
                        ? String(value).slice(0, 5)
                        : new Intl.DateTimeFormat(undefined, { month: 'short', day: 'numeric' }).format(date);
                    }}
                  />
                  <YAxis
                    domain={[0, 100]}
                    tick={{ fill: '#94a3b8', fontSize: 11 }}
                    axisLine={false}
                    tickLine={false}
                  />
                  <ChartTooltip
                    contentStyle={{
                      borderRadius: 12,
                      border: '1px solid #e2e8f0',
                      boxShadow: '0 10px 30px -10px rgba(15,23,42,.2)',
                      fontSize: 12,
                    }}
                    formatter={(value) => [`${value} / 100`, 'Score']}
                  />
                  <Area
                    type="monotone"
                    dataKey="score"
                    stroke="#4f46e5"
                    strokeWidth={2.5}
                    fill="url(#scoreFill)"
                    dot={{ r: 3, fill: '#4f46e5', strokeWidth: 0 }}
                    activeDot={{ r: 5, fill: '#4f46e5' }}
                  />
                </AreaChart>
              </ResponsiveContainer>
            )}
          </div>
        </section>

        {/* Quick tips */}
        <section className="card p-6" aria-labelledby="tips-title">
          <div className="flex items-center gap-3">
            <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-amber-50 text-amber-600">
              <Lightbulb className="h-[18px] w-[18px]" aria-hidden="true" />
            </span>
            <div>
              <h3 id="tips-title" className="text-base font-semibold text-slate-900">Quick tips</h3>
              <p className="text-xs text-slate-500">Small changes, better matches</p>
            </div>
          </div>
          <ul className="mt-5 space-y-4">
            {TIPS.map((tip, index) => (
              <li key={tip} className="flex gap-3">
                <span className="flex h-6 w-6 flex-none items-center justify-center rounded-lg bg-brand-50 text-[11px] font-bold text-brand-600">
                  {index + 1}
                </span>
                <p className="text-sm leading-relaxed text-slate-600">{tip}</p>
              </li>
            ))}
          </ul>
          <div className="mt-6 rounded-xl bg-slate-50 p-4">
            <p className="text-xs font-medium text-slate-600">
              Tip {stats.totalAnalyses ? 'of the day' : 'to get started'}: tailor each resume to the exact role.
            </p>
          </div>
        </section>
      </div>

      {/* Recent analyses */}
      <section className="card overflow-hidden" aria-labelledby="recent-title">
        <div className="flex items-center justify-between gap-3 border-b border-slate-100 px-6 py-5">
          <div>
            <h3 id="recent-title" className="text-base font-semibold text-slate-900">Recent analyses</h3>
            <p className="mt-1 text-xs text-slate-500">Your latest resume and job matches</p>
          </div>
          {analyses.length > 0 && (
            <Link to="/history" className="inline-flex items-center gap-1 text-sm font-semibold text-brand-600 transition hover:text-brand-700">
              View all <ArrowRight className="h-4 w-4" />
            </Link>
          )}
        </div>

        {loading ? (
          <div className="px-6"><SkeletonRows rows={4} /></div>
        ) : analyses.length === 0 ? (
          <EmptyState
            icon={FileBarChart2}
            title="No analyses yet"
            description="Upload your resume with a job description to see your first insights here."
            action={
              <Button as={Link} to="/analyze" leftIcon={Sparkles}>
                Get started
              </Button>
            }
          />
        ) : (
          <ul className="divide-y divide-slate-100">
            {analyses.map((item) => (
              <li key={item.id} className="flex flex-wrap items-center gap-4 px-6 py-4 transition hover:bg-slate-50/70">
                <span className="flex h-10 w-10 flex-none items-center justify-center rounded-xl bg-brand-50 text-brand-600">
                  <FileBarChart2 className="h-[18px] w-[18px]" aria-hidden="true" />
                </span>
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-semibold text-slate-800">
                    {item.jobTitle || 'Untitled role'}
                  </p>
                  <p className="truncate text-xs text-slate-500">
                    {item.company || 'No company'} · {relativeTime(item.createdAt)}
                  </p>
                </div>
                <Badge className={scoreClasses(item.score)}>{item.score ?? '—'}</Badge>
                <span className="hidden text-xs text-slate-500 sm:block">
                  {item.matchedCount ?? 0} matched · {item.missingCount ?? 0} missing
                </span>
                <Link
                  to={`/results/${item.id}`}
                  className="inline-flex items-center gap-1 text-sm font-semibold text-brand-600 transition hover:text-brand-700"
                >
                  View <ArrowRight className="h-3.5 w-3.5" />
                </Link>
              </li>
            ))}
          </ul>
        )}
      </section>

      {!loading && analyses.length > 0 && (
        <p className="text-center text-xs text-slate-400">
          Showing {analyses.length} most recent {analyses.length === 1 ? 'analysis' : 'analyses'} ·{' '}
          {truncate('Open analysis history to browse everything', 80)}
        </p>
      )}
    </div>
  );
}
