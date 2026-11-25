import { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { ArrowLeft, FileText, Printer, RotateCcw } from 'lucide-react';
import Button from '../components/ui/Button.jsx';
import Badge from '../components/ui/Badge.jsx';
import Alert from '../components/ui/Alert.jsx';
import EmptyState from '../components/ui/EmptyState.jsx';
import { Skeleton, SkeletonCard } from '../components/ui/Skeleton.jsx';
import ScoreOverview from '../components/analysis/ScoreOverview.jsx';
import BreakdownPanel from '../components/analysis/BreakdownPanel.jsx';
import SkillsPanel from '../components/analysis/SkillsPanel.jsx';
import SuggestionsPanel from '../components/analysis/SuggestionsPanel.jsx';
import SectionsPanel from '../components/analysis/SectionsPanel.jsx';
import KeywordsPanel from '../components/analysis/KeywordsPanel.jsx';
import * as analysesApi from '../api/analyses.js';
import { formatDateTime, truncate } from '../utils/format.js';

export default function ResultsPage() {
  const { id } = useParams();
  const [analysis, setAnalysis] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [reloadKey, setReloadKey] = useState(0);

  useEffect(() => {
    let active = true;

    async function load() {
      setLoading(true);
      setError('');
      try {
        const data = await analysesApi.get(id);
        if (active) setAnalysis(data.analysis || null);
      } catch (loadError) {
        if (active) setError(loadError.message || 'Could not load this analysis.');
      } finally {
        if (active) setLoading(false);
      }
    }

    load();
    return () => {
      active = false;
    };
  }, [id, reloadKey]);

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header / actions */}
      <div className="no-print flex flex-wrap items-start justify-between gap-4">
        <div className="min-w-0">
          <Link
            to="/dashboard"
            className="inline-flex items-center gap-1.5 text-sm font-medium text-slate-500 transition hover:text-brand-600"
          >
            <ArrowLeft className="h-4 w-4" /> Back to dashboard
          </Link>
          <h2 className="mt-3 truncate text-2xl font-bold tracking-tight text-slate-900 sm:text-3xl">
            {analysis?.jobTitle || (loading ? 'Loading analysis…' : 'Analysis results')}
          </h2>
          <div className="mt-2 flex flex-wrap items-center gap-x-3 gap-y-1 text-sm text-slate-500">
            {analysis?.company && <span>{analysis.company}</span>}
            {analysis?.company && <span className="text-slate-300">•</span>}
            {analysis?.createdAt && <span>{formatDateTime(analysis.createdAt)}</span>}
            {analysis?.resumeFileName && (
              <>
                <span className="text-slate-300">•</span>
                <span className="inline-flex items-center gap-1">
                  <FileText className="h-3.5 w-3.5" />
                  {truncate(analysis.resumeFileName, 32)}
                </span>
              </>
            )}
          </div>
        </div>

        {analysis && (
          <div className="flex flex-wrap gap-2">
            <Button as={Link} to="/analyze" variant="secondary" leftIcon={RotateCcw}>
              Analyze another
            </Button>
            <Button onClick={() => window.print()} leftIcon={Printer}>
              Print / Save PDF
            </Button>
          </div>
        )}
      </div>

      {loading ? (
        <div className="space-y-6">
          <SkeletonCard className="h-72" />
          <div className="grid gap-6 xl:grid-cols-2">
            <Skeleton className="h-64 rounded-2xl" />
            <Skeleton className="h-64 rounded-2xl" />
          </div>
          <Skeleton className="h-80 rounded-2xl" />
        </div>
      ) : error ? (
        <div className="card">
          <Alert type="error" title="We couldn't load this analysis">
            {error}
          </Alert>
          <div className="flex flex-wrap gap-3 p-6">
            <Button
              variant="secondary"
              onClick={() => setReloadKey((key) => key + 1)}
            >
              Try again
            </Button>
            <Button as={Link} to="/history">Back to history</Button>
          </div>
        </div>
      ) : !analysis ? (
        <div className="card">
          <EmptyState
            icon={FileText}
            title="Analysis not found"
            description="This analysis may have been removed or the link is incorrect."
            action={<Button as={Link} to="/history">Browse history</Button>}
          />
        </div>
      ) : (
        <div className="space-y-6">
          <ScoreOverview analysis={analysis} />

          <div className="grid items-start gap-6 xl:grid-cols-2">
            <BreakdownPanel breakdown={analysis.breakdown} />
            <KeywordsPanel keywords={analysis.keywords} />
          </div>

          <div className="grid items-start gap-6 xl:grid-cols-2">
            <SkillsPanel skills={analysis.skills} />
            <SectionsPanel sections={analysis.sections} />
          </div>

          <SuggestionsPanel suggestions={analysis.suggestions} />

          {/* Metadata footer */}
          <div className="flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-slate-200 bg-white px-5 py-4 text-xs text-slate-500">
            <span className="flex items-center gap-2">
              <FileText className="h-3.5 w-3.5" />
              Source: {analysis.resumeFileName || 'Resume PDF'}
            </span>
            <div className="flex flex-wrap items-center gap-3">
              {analysis.resumeStats?.pages != null && <span>{analysis.resumeStats.pages} pages</span>}
              {analysis.resumeStats?.wordCount != null && <span>{analysis.resumeStats.wordCount} words</span>}
              {analysis.extractedSkillCount != null && (
                <Badge variant="brand" size="sm">{analysis.extractedSkillCount} skills detected</Badge>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
