import { KeyRound } from 'lucide-react';
import EmptyState from '../ui/EmptyState.jsx';

/** Normalise keyword entries which may be strings or objects from the API. */
function keywordLabel(item) {
  if (item == null) return '';
  if (typeof item === 'string') return item;
  return item.name || item.keyword || item.word || item.text || '';
}

function KeywordList({ items, tone, empty }) {
  const labels = (items || []).map(keywordLabel).filter(Boolean);
  if (labels.length === 0) {
    return <p className="py-3 text-sm text-slate-500">{empty}</p>;
  }
  return (
    <div className="flex flex-wrap gap-2">
      {labels.map((label, index) => (
        <span key={`${label}-${index}`} className={`chip ${tone}`}>
          {label}
        </span>
      ))}
    </div>
  );
}

/** Matched vs missing keyword chips. */
export default function KeywordsPanel({ keywords }) {
  const data = keywords || {};
  const matched = data.matched || [];
  const missing = data.missing || [];
  const total = (matched.length || 0) + (missing.length || 0);

  if (total === 0) {
    return (
      <section className="card p-6 print-break-avoid">
        <Heading />
        <EmptyState
          className="py-8"
          icon={KeyRound}
          title="No keyword data"
          description="The analysis did not return keyword details for this role."
        />
      </section>
    );
  }

  return (
    <section className="card p-6 print-break-avoid" aria-labelledby="keywords-title">
      <Heading />
      <div className="mt-6 grid gap-6 md:grid-cols-2">
        <div>
          <h4 className="mb-3 flex items-center gap-2 text-xs font-semibold uppercase tracking-wide text-emerald-700">
            <span className="h-2 w-2 rounded-full bg-emerald-500" />
            Found in your resume ({matched.length})
          </h4>
          <KeywordList
            items={matched}
            tone="bg-emerald-50 text-emerald-700 ring-emerald-200"
            empty="No matching keywords detected."
          />
        </div>
        <div>
          <h4 className="mb-3 flex items-center gap-2 text-xs font-semibold uppercase tracking-wide text-rose-700">
            <span className="h-2 w-2 rounded-full bg-rose-500" />
            Missing keywords ({missing.length})
          </h4>
          <KeywordList
            items={missing}
            tone="bg-rose-50 text-rose-700 ring-rose-200"
            empty="No important keywords are missing."
          />
        </div>
      </div>
    </section>
  );
}

function Heading() {
  return (
    <div className="flex items-center gap-3">
      <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-rose-50 text-rose-600">
        <KeyRound className="h-[18px] w-[18px]" aria-hidden="true" />
      </span>
      <div>
        <h3 id="keywords-title" className="text-base font-semibold text-slate-900">
          Keyword analysis
        </h3>
        <p className="text-xs text-slate-500">Terms recruiters and ATS systems look for</p>
      </div>
    </div>
  );
}
