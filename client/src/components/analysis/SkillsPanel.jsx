import { useState } from 'react';
import { AlertCircle, Check, Sparkles } from 'lucide-react';
import Badge from '../ui/Badge.jsx';
import ProgressBar from '../ui/ProgressBar.jsx';
import { IMPORTANCE_STYLES } from '../../utils/constants.js';

const CATEGORY_STYLES = {
  technical: 'bg-brand-50 text-brand-700 ring-brand-200',
  framework: 'bg-indigo-50 text-indigo-700 ring-indigo-200',
  language: 'bg-sky-50 text-sky-700 ring-sky-200',
  tool: 'bg-cyan-50 text-cyan-700 ring-cyan-200',
  database: 'bg-teal-50 text-teal-700 ring-teal-200',
  cloud: 'bg-violet-50 text-violet-700 ring-violet-200',
  soft: 'bg-fuchsia-50 text-fuchsia-700 ring-fuchsia-200',
  other: 'bg-slate-100 text-slate-600 ring-slate-200',
};

function SkillChip({ name, category, tone, dot }) {
  const style = CATEGORY_STYLES[String(category || 'other').toLowerCase()] || CATEGORY_STYLES.other;
  const custom = tone || style;
  return (
    <span className={`chip ${custom}`}>
      {dot && <span className={`h-1.5 w-1.5 rounded-full ${dot}`} />}
      {name}
    </span>
  );
}

/** Tabbed view of matched, missing and extra skills plus overall coverage. */
export default function SkillsPanel({ skills = {} }) {
  const [tab, setTab] = useState('matched');

  const data = skills || {};
  const matched = data.matched || [];
  const missing = data.missing || [];
  const extra = data.extra || [];
  const coverage = Number(data.coverage) || 0;

  const tabs = [
    { key: 'matched', label: 'Matched', count: matched.length },
    { key: 'missing', label: 'Missing', count: missing.length },
    { key: 'extra', label: 'Extra', count: extra.length },
  ];

  return (
    <section className="card p-6 print-break-avoid" aria-labelledby="skills-title">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div className="flex items-center gap-3">
          <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-emerald-50 text-emerald-600">
            <Sparkles className="h-[18px] w-[18px]" aria-hidden="true" />
          </span>
          <div>
            <h3 id="skills-title" className="text-base font-semibold text-slate-900">Skills analysis</h3>
            <p className="text-xs text-slate-500">Required skills compared with your resume</p>
          </div>
        </div>
        <Badge variant="brand">{Math.round(coverage)}% coverage</Badge>
      </div>

      <div className="mt-5">
        <ProgressBar value={coverage} color="brand" size="sm" />
      </div>

      {/* Tabs */}
      <div className="mt-6 flex gap-1 border-b border-slate-200" role="tablist" aria-label="Skill groups">
        {tabs.map((item) => (
          <button
            key={item.key}
            type="button"
            role="tab"
            aria-selected={tab === item.key}
            onClick={() => setTab(item.key)}
            className={`no-print relative flex items-center gap-2 px-3 pb-3 text-sm font-medium transition ${
              tab === item.key ? 'text-brand-700' : 'text-slate-500 hover:text-slate-800'
            }`}
          >
            {item.label}
            <span
              className={`rounded-full px-1.5 py-0.5 text-[11px] font-semibold ${
                tab === item.key ? 'bg-brand-100 text-brand-700' : 'bg-slate-100 text-slate-500'
              }`}
            >
              {item.count}
            </span>
            {tab === item.key && (
              <span className="absolute inset-x-0 -bottom-px h-0.5 rounded-full bg-brand-600" />
            )}
          </button>
        ))}
      </div>

      <div className="mt-5 min-h-[88px]" role="tabpanel">
        {tab === 'matched' && (
          <SkillGroup
            items={matched}
            empty="No matched skills were detected for this role."
            render={(skill, index) => (
              <SkillChip
                key={`${skill.name}-${index}`}
                name={skill.name}
                category={skill.category}
                tone="bg-emerald-50 text-emerald-700 ring-emerald-200"
                dot="bg-emerald-500"
              />
            )}
          />
        )}

        {tab === 'missing' && (
          <SkillGroup
            items={missing}
            empty="Great news — no key skills are missing."
            render={(skill, index) => {
              const importance = String(skill.importance || 'medium').toLowerCase();
              const style = IMPORTANCE_STYLES[importance] || IMPORTANCE_STYLES.medium;
              return (
                <span
                  key={`${skill.name}-${index}`}
                  className={`chip ${style.chip}`}
                  title={style.label}
                >
                  <span className={`h-1.5 w-1.5 rounded-full ${style.dot}`} />
                  {skill.name}
                  <span className="ml-0.5 text-[10px] font-semibold uppercase opacity-70">
                    {importance}
                  </span>
                </span>
              );
            }}
          />
        )}

        {tab === 'extra' && (
          <SkillGroup
            items={extra}
            empty="No additional skills were found beyond the job requirements."
            render={(skill, index) => (
              <SkillChip key={`${skill.name}-${index}`} name={skill.name} category={skill.category} />
            )}
          />
        )}
      </div>

      {/* Print-friendly full list (tabs are hidden in print) */}
      <div className="hidden print:block print:mt-4 print:space-y-3">
        <PrintGroup title="Matched" items={matched.map((s) => s.name)} Icon={Check} />
        <PrintGroup title="Missing" items={missing.map((s) => s.name)} Icon={AlertCircle} />
        <PrintGroup title="Extra" items={extra.map((s) => s.name)} Icon={Sparkles} />
      </div>
    </section>
  );
}

function SkillGroup({ items, empty, render }) {
  if (!items || items.length === 0) {
    return <p className="py-4 text-sm text-slate-500">{empty}</p>;
  }
  return <div className="flex flex-wrap gap-2">{items.map(render)}</div>;
}

function PrintGroup({ title, items, Icon }) {
  return (
    <div>
      <p className="flex items-center gap-1.5 text-xs font-semibold text-slate-700">
        <Icon className="h-3.5 w-3.5" /> {title}
      </p>
      <p className="mt-1 text-xs text-slate-600">{items.length ? items.join(', ') : 'None'}</p>
    </div>
  );
}
