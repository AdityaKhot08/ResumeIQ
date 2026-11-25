import {
  LayoutDashboard,
  FileSearch,
  History,
  UserRound,
} from 'lucide-react';

/** Navigation shown in the dashboard sidebar. */
export const NAV_ITEMS = [
  {
    label: 'Dashboard',
    to: '/dashboard',
    icon: LayoutDashboard,
    description: 'Overview of your analysis activity',
    title: 'Dashboard',
    subtitle: 'A snapshot of your resume journey.',
  },
  {
    label: 'Analyze Resume',
    to: '/analyze',
    icon: FileSearch,
    description: 'Compare a resume with a job description',
    title: 'Analyze Resume',
    subtitle: 'Upload your resume and a job description to get started.',
  },
  {
    label: 'Analysis History',
    to: '/history',
    icon: History,
    description: 'Browse all of your past analyses',
    title: 'Analysis History',
    subtitle: 'Revisit and compare every analysis you have run.',
  },
  {
    label: 'Profile',
    to: '/profile',
    icon: UserRound,
    description: 'Manage your account details',
    title: 'Profile',
    subtitle: 'Manage your account and personal information.',
  },
];

/** Skill categories used to colour skill chips. */
export const SKILL_CATEGORIES = [
  'technical',
  'soft',
  'language',
  'tool',
  'framework',
  'database',
  'cloud',
  'other',
];

/** Map of importance -> presentation used by missing skills. */
export const IMPORTANCE_STYLES = {
  high: {
    label: 'High priority',
    chip: 'bg-rose-50 text-rose-700 ring-rose-200',
    dot: 'bg-rose-500',
  },
  medium: {
    label: 'Medium priority',
    chip: 'bg-amber-50 text-amber-700 ring-amber-200',
    dot: 'bg-amber-500',
  },
  low: {
    label: 'Nice to have',
    chip: 'bg-slate-100 text-slate-600 ring-slate-200',
    dot: 'bg-slate-400',
  },
};

/** Priority labels for improvement suggestions. */
export const PRIORITY_LABELS = {
  high: 'High impact',
  medium: 'Recommended',
  low: 'Optional',
};

export const PRIORITY_STYLES = {
  high: 'bg-rose-100 text-rose-700 ring-rose-200',
  medium: 'bg-amber-100 text-amber-700 ring-amber-200',
  low: 'bg-slate-100 text-slate-600 ring-slate-200',
};

/** Friendly labels for each breakdown metric key returned by the API. */
export const BREAKDOWN_LABELS = {
  skillMatch: 'Skill match',
  keywordMatch: 'Keyword match',
  sectionCompleteness: 'Section completeness',
  formatting: 'Formatting',
  experience: 'Experience',
};

/** Sample job description used by AnalyzePage's "Try an example" button. */
export const SAMPLE_JOB_DESCRIPTION = `Senior Frontend Engineer

We are looking for a Senior Frontend Engineer to join our product team. You will build and maintain responsive web applications, collaborate with designers, and help shape our design system.

Requirements:
- 5+ years of experience with JavaScript, React, and TypeScript
- Strong knowledge of HTML5, CSS3, Tailwind CSS, and modern web accessibility
- Experience with REST APIs, Git, and CI/CD pipelines
- Familiarity with testing frameworks such as Jest or Vitest
- Understanding of state management, component architecture, and performance optimisation
- Excellent communication and problem-solving skills

Nice to have:
- Experience with Next.js and Node.js
- Knowledge of GraphQL and Docker
- Exposure to Figma and design systems`;

/** Feature cards shown on the landing page. */
export const LANDING_FEATURES = [
  {
    title: 'Smart Skill Matching',
    description:
      'See exactly which skills from the job description appear in your resume — and which ones are missing.',
    icon: 'Sparkles',
    accent: 'from-indigo-500 to-violet-500',
  },
  {
    title: 'Compatibility Score',
    description:
      'Get a clear, easy-to-read score and grade that sums up how well your resume fits the role.',
    icon: 'Gauge',
    accent: 'from-sky-500 to-indigo-500',
  },
  {
    title: 'Actionable Suggestions',
    description:
      'Prioritised, specific recommendations you can apply right away to strengthen your application.',
    icon: 'Lightbulb',
    accent: 'from-amber-500 to-orange-500',
  },
  {
    title: 'Keyword Analysis',
    description:
      'Find the important keywords recruiters look for that may be missing from your resume.',
    icon: 'ScanText',
    accent: 'from-emerald-500 to-teal-500',
  },
  {
    title: 'Analysis History',
    description:
      'Keep every analysis in one place so you can track progress across multiple applications.',
    icon: 'History',
    accent: 'from-violet-500 to-fuchsia-500',
  },
  {
    title: 'Secure & Private',
    description:
      'Your documents and results are tied to your account and never shared with other users.',
    icon: 'ShieldCheck',
    accent: 'from-slate-600 to-slate-800',
  },
];

/** The three steps in the landing page "How it works" section. */
export const HOW_IT_WORKS = [
  {
    step: '01',
    title: 'Upload your resume',
    description: 'Drop in a PDF of your current resume. Nothing else to prepare.',
  },
  {
    step: '02',
    title: 'Paste the job description',
    description: 'Add the role and company so we know what to compare against.',
  },
  {
    step: '03',
    title: 'Get your insights',
    description: 'Review your score, matched skills, gaps and next steps instantly.',
  },
];
