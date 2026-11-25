import { Link } from 'react-router-dom';
import {
  ArrowRight,
  Check,
  CheckCircle2,
  FileSearch,
  Gauge,
  History,
  Lightbulb,
  LockKeyhole,
  Sparkles,
  UploadCloud,
} from 'lucide-react';
import Button from '../components/ui/Button.jsx';
import Badge from '../components/ui/Badge.jsx';
import ScoreRing from '../components/ui/ScoreRing.jsx';
import ProgressBar from '../components/ui/ProgressBar.jsx';
import {
  HOW_IT_WORKS,
  LANDING_FEATURES,
  SAMPLE_JOB_DESCRIPTION,
} from '../utils/constants.js';

const FEATURE_ICONS = {
  Sparkles,
  Gauge,
  Lightbulb,
  ScanText: FileSearch,
  History,
  ShieldCheck: LockKeyhole,
};

export default function LandingPage() {
  const analyzeHref = `/analyze?jd=${encodeURIComponent(SAMPLE_JOB_DESCRIPTION)}`;

  return (
    <div>
      {/* ---------------------------------------------------------------- Hero */}
      <section className="relative overflow-hidden bg-white">
        <div className="pointer-events-none absolute inset-0 grid-pattern opacity-70" />
        <div className="pointer-events-none absolute -top-48 left-1/2 h-[560px] w-[900px] -translate-x-1/2 rounded-full bg-brand-200/40 blur-3xl" />
        <div className="pointer-events-none absolute -right-32 top-40 h-80 w-80 rounded-full bg-violet-200/40 blur-3xl" />
        <div className="pointer-events-none absolute -left-32 bottom-0 h-72 w-72 rounded-full bg-sky-200/30 blur-3xl" />

        <div className="relative mx-auto max-w-7xl px-4 pb-20 pt-16 sm:px-6 sm:pt-24 lg:px-8">
          <div className="mx-auto max-w-3xl text-center">
            <span className="chip animate-fade-in border-brand-100 bg-white/80 px-4 py-1.5 text-brand-700 shadow-sm ring-brand-200 backdrop-blur">
              <Sparkles className="h-3.5 w-3.5" />
              Resume analysis, made simple
            </span>

            <h1 className="mt-7 text-balance text-4xl font-extrabold leading-[1.12] tracking-tight text-slate-900 sm:text-5xl lg:text-6xl">
              Know exactly how your resume{' '}
              <span className="gradient-text">stacks up</span>
            </h1>

            <p className="mx-auto mt-6 max-w-2xl text-balance text-base leading-relaxed text-slate-600 sm:text-lg">
              Upload your resume, drop in a job description, and get a clear compatibility score,
              a skill-gap breakdown, and specific suggestions you can act on right away.
            </p>

            <div className="mt-9 flex flex-wrap items-center justify-center gap-3 sm:gap-4">
              <Button as={Link} to={analyzeHref} size="lg" rightIcon={ArrowRight} className="px-7">
                Analyze my resume
              </Button>
              <Button as="a" href="/#how-it-works" variant="secondary" size="lg">
                See how it works
              </Button>
            </div>

            <div className="mt-7 flex flex-wrap items-center justify-center gap-x-6 gap-y-2 text-xs font-medium text-slate-500">
              <span className="flex items-center gap-1.5"><CheckCircle2 className="h-3.5 w-3.5 text-emerald-500" /> No credit card</span>
              <span className="flex items-center gap-1.5"><CheckCircle2 className="h-3.5 w-3.5 text-emerald-500" /> Free to start</span>
              <span className="flex items-center gap-1.5"><CheckCircle2 className="h-3.5 w-3.5 text-emerald-500" /> PDF in, insights out</span>
            </div>
          </div>

          <DashboardPreview />

          <p className="mt-8 text-center text-xs text-slate-400">
            Honest, rule-based analysis — no guesswork, no black box.
          </p>
        </div>
      </section>

      {/* ------------------------------------------------------------ Features */}
      <section id="features" className="relative scroll-mt-24 bg-slate-50 py-20 sm:py-24">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="mx-auto max-w-2xl text-center">
            <Badge variant="brand" dot>Everything you need</Badge>
            <h2 className="mt-4 text-3xl font-bold tracking-tight text-slate-900 sm:text-4xl">
              A clearer path to your next role
            </h2>
            <p className="mt-4 text-base leading-relaxed text-slate-600">
              ResumeIQ turns a manual, guess-filled task into a structured review you can actually
              use.
            </p>
          </div>

          <div className="mt-12 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {LANDING_FEATURES.map((feature) => {
              const Icon = FEATURE_ICONS[feature.icon] || Sparkles;
              return (
                <article
                  key={feature.title}
                  className="card group p-6 transition duration-300 hover:-translate-y-1 hover:border-brand-200 hover:shadow-card"
                >
                  <div className={`inline-flex h-11 w-11 items-center justify-center rounded-xl bg-gradient-to-br ${feature.accent} text-white shadow-sm`}>
                    <Icon className="h-5 w-5" aria-hidden="true" />
                  </div>
                  <h3 className="mt-5 text-base font-semibold text-slate-900">{feature.title}</h3>
                  <p className="mt-2 text-sm leading-relaxed text-slate-600">{feature.description}</p>
                </article>
              );
            })}
          </div>
        </div>
      </section>

      {/* -------------------------------------------------------- How it works */}
      <section id="how-it-works" className="scroll-mt-24 bg-white py-20 sm:py-24">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="mx-auto max-w-2xl text-center">
            <Badge variant="violet" dot>Three simple steps</Badge>
            <h2 className="mt-4 text-3xl font-bold tracking-tight text-slate-900 sm:text-4xl">
              From resume to insight in minutes
            </h2>
          </div>

          <div className="relative mt-14 grid gap-8 md:grid-cols-3">
            <div className="absolute left-[16%] right-[16%] top-8 hidden h-px bg-gradient-to-r from-transparent via-brand-200 to-transparent md:block" />
            {HOW_IT_WORKS.map((item, index) => {
              const icons = [UploadCloud, FileSearch, Lightbulb];
              const Icon = icons[index] || Sparkles;
              return (
                <div key={item.step} className="relative text-center">
                  <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl border border-brand-100 bg-white shadow-soft ring-4 ring-brand-50">
                    <Icon className="h-6 w-6 text-brand-600" aria-hidden="true" />
                  </div>
                  <p className="mt-5 text-[11px] font-bold uppercase tracking-[0.2em] text-brand-500">
                    Step {item.step}
                  </p>
                  <h3 className="mt-2 text-lg font-semibold text-slate-900">{item.title}</h3>
                  <p className="mx-auto mt-2 max-w-xs text-sm leading-relaxed text-slate-600">
                    {item.description}
                  </p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* --------------------------------------------------------------- CTA */}
      <section id="cta" className="scroll-mt-24 bg-white pb-20 sm:pb-24">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-brand-700 via-brand-600 to-violet-700 px-6 py-14 text-center shadow-lg sm:px-12 sm:py-16">
            <div className="pointer-events-none absolute inset-0 grid-pattern opacity-20" />
            <div className="pointer-events-none absolute -left-20 -top-24 h-72 w-72 rounded-full bg-white/10 blur-2xl" />
            <div className="pointer-events-none absolute -bottom-24 -right-16 h-72 w-72 rounded-full bg-violet-300/20 blur-2xl" />
            <div className="relative">
              <h2 className="text-balance text-3xl font-bold tracking-tight text-white sm:text-4xl">
                Ready to see where you stand?
              </h2>
              <p className="mx-auto mt-4 max-w-xl text-sm leading-relaxed text-brand-100 sm:text-base">
                Create a free account and run your first analysis in less than a minute.
              </p>
              <div className="mt-8 flex flex-wrap justify-center gap-3">
                <Button
                  as={Link}
                  to={analyzeHref}
                  size="lg"
                  rightIcon={ArrowRight}
                  className="bg-white text-brand-700 shadow-lg hover:bg-brand-50 hover:text-brand-800"
                >
                  Start analyzing
                </Button>
                <Button
                  as={Link}
                  to="/register"
                  size="lg"
                  variant="ghost"
                  className="text-white hover:bg-white/10 hover:text-white"
                >
                  Create an account
                </Button>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}

/** Decorative product preview composed from the real UI components. */
function DashboardPreview() {
  return (
    <div className="relative mx-auto mt-16 max-w-4xl animate-slide-up">
      <div className="pointer-events-none absolute -inset-5 rounded-[2.5rem] bg-gradient-to-r from-brand-300/30 via-violet-300/30 to-sky-300/30 blur-3xl" />

      {/* floating accent cards */}
      <div className="absolute -left-8 top-16 hidden animate-float rounded-2xl border border-slate-200 bg-white/95 px-4 py-3 shadow-card backdrop-blur lg:block">
        <p className="text-[11px] font-medium text-slate-500">Skills matched</p>
        <p className="mt-0.5 text-lg font-bold text-slate-900">18 <span className="text-xs font-medium text-emerald-600">+4</span></p>
      </div>
      <div className="absolute -right-8 bottom-16 hidden animate-float rounded-2xl border border-slate-200 bg-white/95 px-4 py-3 shadow-card backdrop-blur [animation-delay:1.5s] lg:block">
        <p className="text-[11px] font-medium text-slate-500">Grade</p>
        <p className="mt-0.5 text-lg font-bold text-emerald-600">A</p>
      </div>

      <div className="relative overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-lg">
        {/* browser bar */}
        <div className="flex items-center gap-2 border-b border-slate-100 bg-slate-50/80 px-5 py-3">
          <span className="h-2.5 w-2.5 rounded-full bg-rose-300" />
          <span className="h-2.5 w-2.5 rounded-full bg-amber-300" />
          <span className="h-2.5 w-2.5 rounded-full bg-emerald-300" />
          <span className="mx-auto rounded-md bg-white px-3 py-1 text-[11px] text-slate-400 ring-1 ring-slate-200">
            resumiq.app / results
          </span>
        </div>

        <div className="grid gap-6 p-6 sm:grid-cols-[auto_1fr] sm:p-8">
          <div className="flex justify-center sm:justify-start">
            <ScoreRing score={87} grade="A" size={156} stroke={14} label="Match" />
          </div>

          <div className="min-w-0">
            <div className="flex flex-wrap gap-2">
              <Badge variant="success" dot>Strong match</Badge>
              <Badge variant="brand">Senior Frontend Engineer</Badge>
            </div>
            <p className="mt-4 text-sm leading-relaxed text-slate-600">
              Your resume aligns well with this role. A few high-impact skills are missing — add
              them and you will be in great shape.
            </p>

            <div className="mt-5 flex flex-wrap gap-2">
              {['React', 'JavaScript', 'TypeScript', 'CSS', '+14'].map((skill) => (
                <span key={skill} className="chip bg-emerald-50 text-emerald-700 ring-emerald-200">
                  <Check className="h-3 w-3" /> {skill}
                </span>
              ))}
            </div>

            <div className="mt-6 space-y-4">
              <ProgressBar label="Skill match" value={92} color="emerald" showValue size="sm" />
              <ProgressBar label="Keyword match" value={84} color="brand" showValue size="sm" />
              <ProgressBar label="Section completeness" value={78} color="violet" showValue size="sm" />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
