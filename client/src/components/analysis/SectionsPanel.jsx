import { AlertCircle, ClipboardCheck, CheckCircle2 } from 'lucide-react';
import Badge from '../ui/Badge.jsx';

/** Checklist of resume sections detected by the analyser. */
export default function SectionsPanel({ sections = [] }) {
  const items = sections || [];
  const present = items.filter((section) => section.present).length;

  return (
    <section className="card p-6 print-break-avoid" aria-labelledby="sections-title">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div className="flex items-center gap-3">
          <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-sky-50 text-sky-600">
            <ClipboardCheck className="h-[18px] w-[18px]" aria-hidden="true" />
          </span>
          <div>
            <h3 id="sections-title" className="text-base font-semibold text-slate-900">
              Resume sections
            </h3>
            <p className="text-xs text-slate-500">Key sections found in your document</p>
          </div>
        </div>
        <Badge variant={present === items.length ? 'success' : 'warning'}>
          {present} / {items.length} present
        </Badge>
      </div>

      {items.length === 0 ? (
        <p className="mt-5 text-sm text-slate-500">No section information is available.</p>
      ) : (
        <ul className="mt-5 divide-y divide-slate-100">
          {items.map((section, index) => (
            <li key={`${section.name}-${index}`} className="flex items-start gap-3 py-3">
              {section.present ? (
                <CheckCircle2 className="mt-0.5 h-5 w-5 flex-none text-emerald-500" aria-hidden="true" />
              ) : (
                <AlertCircle className="mt-0.5 h-5 w-5 flex-none text-amber-500" aria-hidden="true" />
              )}
              <div className="min-w-0 flex-1">
                <p className={`text-sm font-medium ${section.present ? 'text-slate-800' : 'text-amber-800'}`}>
                  {section.name}
                </p>
                {!section.present && section.tip && (
                  <p className="mt-0.5 text-xs leading-relaxed text-slate-500">{section.tip}</p>
                )}
              </div>
              <span
                className={`chip flex-none ${
                  section.present
                    ? 'bg-emerald-50 text-emerald-700 ring-emerald-200'
                    : 'bg-amber-50 text-amber-700 ring-amber-200'
                }`}
              >
                {section.present ? 'Found' : 'Missing'}
              </span>
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}
