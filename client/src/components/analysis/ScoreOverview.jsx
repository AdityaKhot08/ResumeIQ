import { BadgeCheck, FileText, Sparkles, Target } from 'lucide-react';
import ScoreRing from '../ui/ScoreRing.jsx';
import Badge from '../ui/Badge.jsx';
import { gradeColor } from '../../utils/format.js';

/** Hero panel for a result: score ring, verdict and plain-English summary. */
export default function ScoreOverview({ analysis }) {
  if (!analysis) return null;

  const {
    score = 0,
    grade,
    verdict,
    summary,
    extractedSkillCount,
  } = analysis;
  const skills = analysis.skills || {};
  const resumeStats = analysis.resumeStats || {};

  const matchedCount = skills.matched?.length ?? 0;
  const missingCount = skills.missing?.length ?? 0;
  const skillCount = extractedSkillCount ?? matchedCount + (skills.extra?.length ?? 0);

  const facts = [
    { Icon: Target, label: 'Skills matched', value: matchedCount },
    { Icon: Sparkles, label: 'Skills found', value: skillCount },
    { Icon: FileText, label: 'Resume words', value: resumeStats.wordCount ?? '—' },
  ];

  return (
    <section className="card overflow-hidden print-full-width" aria-labelledby="score-overview-title">
      <div className="relative overflow-hidden border-b border-slate-100 bg-gradient-to-br from-brand-50/80 via-white to-violet-50/70 px-6 py-8 sm:px-8">
        <div className="pointer-events-none absolute -right-16 -top-24 h-56 w-56 rounded-full bg-brand-200/30 blur-3xl" />
        <div className="pointer-events-none absolute -bottom-20 left-1/3 h-40 w-40 rounded-full bg-violet-200/30 blur-3xl" />

        <div className="relative flex flex-col items-center gap-8 text-center sm:flex-row sm:text-left">
          <div className="flex-none">
            <ScoreRing score={score} grade={grade} size={188} stroke={15} label="Compatibility" />
          </div>

          <div className="min-w-0 flex-1">
            <div className="flex flex-wrap items-center justify-center gap-2 sm:justify-start">
              <Badge variant="brand" dot>
                Analysis complete
              </Badge>
              {grade && (
                <span className={`chip text-xs font-bold ${gradeColor(grade)}`}>
                  <BadgeCheck className="h-3.5 w-3.5" /> Grade {grade}
                </span>
              )}
            </div>

            <h2 id="score-overview-title" className="mt-4 text-2xl font-bold tracking-tight text-slate-900 sm:text-3xl">
              {verdict || (score >= 70 ? 'Strong match' : 'Room to improve')}
            </h2>

            <p className="mx-auto mt-3 max-w-2xl text-sm leading-relaxed text-slate-600 sm:mx-0">
              {summary ||
                'Here is how your resume compares with the role. Review the sections below for specific, actionable next steps.'}
            </p>

            {missingCount > 0 && (
              <p className="mt-4 text-xs font-medium text-amber-700">
                {missingCount} key {missingCount === 1 ? 'skill is' : 'skills are'} missing from your resume.
              </p>
            )}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 divide-y divide-slate-100 sm:grid-cols-3 sm:divide-x sm:divide-y-0">
        {facts.map(({ Icon, label, value }) => (
          <div key={label} className="flex items-center gap-3 px-6 py-5 print-break-avoid">
            <span className="flex h-10 w-10 flex-none items-center justify-center rounded-xl bg-brand-50 text-brand-600">
              <Icon className="h-5 w-5" aria-hidden="true" />
            </span>
            <div>
              <p className="text-lg font-bold tabular-nums text-slate-900">{value}</p>
              <p className="text-xs text-slate-500">{label}</p>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
