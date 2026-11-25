import { FileText, KeyRound, Lightbulb, ListChecks, Sparkles } from 'lucide-react';
import Badge from '../ui/Badge.jsx';
import { PRIORITY_LABELS, PRIORITY_STYLES } from '../../utils/constants.js';
import { capitalize } from '../../utils/format.js';

const TYPE_ICONS = {
  skill: Sparkles,
  keyword: KeyRound,
  section: ListChecks,
  formatting: FileText,
  content: FileText,
  general: Lightbulb,
};

const PRIORITY_ORDER = { high: 0, medium: 1, low: 2 };

/** Prioritised, actionable improvement suggestions. */
export default function SuggestionsPanel({ suggestions = [] }) {
  const items = [...(suggestions || [])].sort(
    (a, b) =>
      (PRIORITY_ORDER[String(a.priority || 'low').toLowerCase()] ?? 3) -
      (PRIORITY_ORDER[String(b.priority || 'low').toLowerCase()] ?? 3),
  );

  return (
    <section className="card p-6 print-break-avoid" aria-labelledby="suggestions-title">
      <div className="flex items-center gap-3">
        <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-amber-50 text-amber-600">
          <Lightbulb className="h-[18px] w-[18px]" aria-hidden="true" />
        </span>
        <div>
          <h3 id="suggestions-title" className="text-base font-semibold text-slate-900">
            Improvement suggestions
          </h3>
          <p className="text-xs text-slate-500">Specific steps to strengthen your application</p>
        </div>
      </div>

      {items.length === 0 ? (
        <p className="mt-5 text-sm text-slate-500">
          No suggestions were generated for this analysis. Your resume looks solid on the checked criteria.
        </p>
      ) : (
        <ol className="mt-6 space-y-4">
          {items.map((suggestion, index) => {
            const priority = String(suggestion.priority || 'low').toLowerCase();
            const Icon = TYPE_ICONS[String(suggestion.type || '').toLowerCase()] || Lightbulb;
            return (
              <li
                key={suggestion.id ?? index}
                className="flex gap-4 rounded-2xl border border-slate-200/80 bg-slate-50/60 p-4 transition hover:border-brand-200 hover:bg-brand-50/30"
              >
                <span className="flex h-9 w-9 flex-none items-center justify-center rounded-xl bg-white text-brand-600 shadow-sm ring-1 ring-slate-200">
                  <Icon className="h-4 w-4" aria-hidden="true" />
                </span>
                <div className="min-w-0 flex-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="text-[11px] font-semibold tabular-nums text-slate-400">
                      #{String(index + 1).padStart(2, '0')}
                    </span>
                    <Badge
                      size="sm"
                      className={PRIORITY_STYLES[priority] || PRIORITY_STYLES.low}
                    >
                      {PRIORITY_LABELS[priority] || capitalize(priority)}
                    </Badge>
                  </div>
                  <h4 className="mt-2 text-sm font-semibold text-slate-900">{suggestion.title}</h4>
                  {suggestion.description && (
                    <p className="mt-1 text-sm leading-relaxed text-slate-600">
                      {suggestion.description}
                    </p>
                  )}
                </div>
              </li>
            );
          })}
        </ol>
      )}
    </section>
  );
}
