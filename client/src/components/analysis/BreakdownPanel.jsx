import { BarChart3 } from 'lucide-react';
import ProgressBar from '../ui/ProgressBar.jsx';
import { BREAKDOWN_LABELS } from '../../utils/constants.js';

const COLOR_FOR_VALUE = (value) => {
  if (value >= 80) return 'emerald';
  if (value >= 60) return 'brand';
  if (value >= 40) return 'amber';
  return 'rose';
};

/** Five score dimensions returned by the analysis engine. */
export default function BreakdownPanel({ breakdown = {} }) {
  const entries = Object.keys(BREAKDOWN_LABELS)
    .map((key) => ({ key, label: BREAKDOWN_LABELS[key], value: Number(breakdown?.[key]) || 0 }))
    .filter((entry) => breakdown?.[entry.key] !== undefined && breakdown?.[entry.key] !== null);

  if (entries.length === 0) {
    return (
      <div className="card p-6">
        <PanelHeading />
        <p className="mt-4 text-sm text-slate-500">No breakdown data is available for this analysis.</p>
      </div>
    );
  }

  return (
    <section className="card p-6 print-break-avoid" aria-labelledby="breakdown-title">
      <PanelHeading />
      <div className="mt-6 space-y-5">
        {entries.map(({ key, label, value }) => (
          <ProgressBar
            key={key}
            label={label}
            value={value}
            color={COLOR_FOR_VALUE(value)}
            showValue
            size="md"
          />
        ))}
      </div>
    </section>
  );
}

function PanelHeading() {
  return (
    <div className="flex items-center gap-3">
      <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-violet-50 text-violet-600">
        <BarChart3 className="h-[18px] w-[18px]" aria-hidden="true" />
      </span>
      <div>
        <h3 id="breakdown-title" className="text-base font-semibold text-slate-900">
          Score breakdown
        </h3>
        <p className="text-xs text-slate-500">How each part of your resume was evaluated</p>
      </div>
    </div>
  );
}
