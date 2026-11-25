import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  ArrowLeft,
  ArrowRight,
  CalendarDays,
  Eye,
  FileBarChart2,
  Search,
  Sparkles,
  Trash2,
  X,
} from 'lucide-react';
import Button from '../components/ui/Button.jsx';
import Badge from '../components/ui/Badge.jsx';
import Input from '../components/ui/Input.jsx';
import Alert from '../components/ui/Alert.jsx';
import Modal from '../components/ui/Modal.jsx';
import EmptyState from '../components/ui/EmptyState.jsx';
import { SkeletonRows } from '../components/ui/Skeleton.jsx';
import { useToast } from '../context/ToastContext.jsx';
import * as analysesApi from '../api/analyses.js';
import { formatDate, truncate } from '../utils/format.js';

function scoreClasses(score) {
  const value = Number(score);
  if (value >= 80) return 'bg-emerald-50 text-emerald-700 ring-emerald-200';
  if (value >= 60) return 'bg-amber-50 text-amber-700 ring-amber-200';
  if (value >= 40) return 'bg-orange-50 text-orange-700 ring-orange-200';
  return 'bg-rose-50 text-rose-700 ring-rose-200';
}

export default function HistoryPage() {
  const { toast } = useToast();

  const [search, setSearch] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');
  const [page, setPage] = useState(1);
  const [result, setResult] = useState({ analyses: [], pagination: {} });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [reloadKey, setReloadKey] = useState(0);
  const [pendingDelete, setPendingDelete] = useState(null);
  const [deleting, setDeleting] = useState(false);

  // Debounce typing and reset to the first page for each new query.
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(search.trim());
      setPage(1);
    }, 350);
    return () => clearTimeout(timer);
  }, [search]);

  useEffect(() => {
    let active = true;
    async function load() {
      setLoading(true);
      setError('');
      try {
        const data = await analysesApi.list({ page, limit: 10, search: debouncedSearch });
        if (active) {
          setResult({
            analyses: data.analyses || [],
            pagination: data.pagination || {},
          });
        }
      } catch (loadError) {
        if (active) setError(loadError.message || 'Could not load your analysis history.');
      } finally {
        if (active) setLoading(false);
      }
    }

    load();
    return () => {
      active = false;
    };
  }, [page, debouncedSearch, reloadKey]);

  const confirmDelete = async () => {
    if (!pendingDelete) return;
    setDeleting(true);
    try {
      await analysesApi.remove(pendingDelete.id);
      toast.success('Analysis deleted.');
      setPendingDelete(null);
      setReloadKey((key) => key + 1);
    } catch (deleteError) {
      toast.error(deleteError.message || 'Could not delete the analysis.');
    } finally {
      setDeleting(false);
    }
  };

  const { analyses, pagination } = result;
  const total = pagination.total ?? analyses.length;
  const pages = Math.max(1, pagination.pages || 1);
  const currentPage = pagination.page || page;

  const pageNumbers = Array.from({ length: Math.min(pages, 5) }, (_, index) => {
    let candidate = index + 1;
    if (pages > 5) {
      if (currentPage > 3) candidate = currentPage - 2 + index;
      if (currentPage > pages - 2) candidate = pages - 4 + index;
    }
    return candidate;
  }).filter((value) => value >= 1 && value <= pages);

  return (
    <div className="animate-fade-in">
      <div className="mb-6 flex flex-wrap items-end justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold tracking-tight text-slate-900 sm:text-3xl">Analysis history</h2>
          <p className="mt-2 text-sm text-slate-600">
            Browse, revisit and manage every analysis you have run.
          </p>
        </div>
        <Button as={Link} to="/analyze" leftIcon={Sparkles}>
          New analysis
        </Button>
      </div>

      <div className="card overflow-hidden">
        {/* Toolbar */}
        <div className="flex flex-wrap items-center justify-between gap-4 border-b border-slate-100 px-5 py-4 sm:px-6">
          <div className="relative w-full max-w-sm">
            <Input
              type="search"
              placeholder="Search by role or company…"
              icon={Search}
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              aria-label="Search analyses"
              rightSlot={
                search ? (
                  <button
                    type="button"
                    onClick={() => setSearch('')}
                    className="rounded-lg p-1.5 text-slate-400 transition hover:bg-slate-100 hover:text-slate-600"
                    aria-label="Clear search"
                  >
                    <X className="h-4 w-4" />
                  </button>
                ) : null
              }
            />
          </div>
          <div className="flex items-center gap-2 text-sm text-slate-500">
            <Badge variant="brand">{total} {total === 1 ? 'result' : 'results'}</Badge>
            {search && debouncedSearch && (
              <span className="hidden text-xs sm:inline">for “{truncate(debouncedSearch, 30)}”</span>
            )}
          </div>
        </div>

        {error && (
          <div className="p-5">
            <Alert type="error" title="Could not load history">
              {error}
              <button
                type="button"
                onClick={() => setReloadKey((key) => key + 1)}
                className="ml-2 font-semibold underline underline-offset-2"
              >
                Try again
              </button>
            </Alert>
          </div>
        )}

        {loading ? (
          <div className="px-5 sm:px-6"><SkeletonRows rows={6} /></div>
        ) : !error && analyses.length === 0 ? (
          <EmptyState
            icon={FileBarChart2}
            title={debouncedSearch ? 'No matching analyses' : 'No analyses yet'}
            description={
              debouncedSearch
                ? 'Try a different search term, or clear the search to see everything.'
                : 'Run your first analysis to start building your history.'
            }
            action={
              debouncedSearch ? (
                <Button variant="secondary" onClick={() => setSearch('')} leftIcon={X}>
                  Clear search
                </Button>
              ) : (
                <Button as={Link} to="/analyze" leftIcon={Sparkles}>Analyze a resume</Button>
              )
            }
          />
        ) : !error ? (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[680px] text-left text-sm">
              <thead>
                <tr className="border-b border-slate-100 bg-slate-50/70 text-[11px] font-semibold uppercase tracking-wider text-slate-500">
                  <th className="px-6 py-3">Role</th>
                  <th className="px-4 py-3">Company</th>
                  <th className="px-4 py-3">Score</th>
                  <th className="px-4 py-3">Skills</th>
                  <th className="px-4 py-3">
                    <span className="inline-flex items-center gap-1"><CalendarDays className="h-3 w-3" /> Date</span>
                  </th>
                  <th className="px-6 py-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {analyses.map((item) => (
                  <tr key={item.id} className="transition hover:bg-slate-50/70">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <span className="flex h-9 w-9 flex-none items-center justify-center rounded-xl bg-brand-50 text-brand-600">
                          <FileBarChart2 className="h-4 w-4" />
                        </span>
                        <div className="min-w-0">
                          <p className="truncate font-semibold text-slate-800">{item.jobTitle || 'Untitled role'}</p>
                          <p className="truncate text-xs text-slate-400">
                            {truncate(item.resumeFileName || '', 28)}
                          </p>
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-4 text-slate-600">{item.company || '—'}</td>
                    <td className="px-4 py-4">
                      <Badge className={scoreClasses(item.score)}>{item.score ?? '—'}</Badge>
                    </td>
                    <td className="px-4 py-4">
                      <div className="flex items-center gap-1.5 text-xs">
                        <span className="rounded-md bg-emerald-50 px-1.5 py-0.5 font-semibold text-emerald-700">
                          {item.matchedCount ?? 0} matched
                        </span>
                        <span className="rounded-md bg-amber-50 px-1.5 py-0.5 font-semibold text-amber-700">
                          {item.missingCount ?? 0} missing
                        </span>
                      </div>
                    </td>
                    <td className="whitespace-nowrap px-4 py-4 text-xs text-slate-500">
                      {formatDate(item.createdAt)}
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center justify-end gap-1">
                        <Link
                          to={`/results/${item.id}`}
                          className="inline-flex items-center gap-1.5 rounded-lg px-2.5 py-1.5 text-xs font-semibold text-brand-600 transition hover:bg-brand-50"
                        >
                          <Eye className="h-3.5 w-3.5" /> View
                        </Link>
                        <button
                          type="button"
                          onClick={() => setPendingDelete(item)}
                          className="inline-flex items-center gap-1.5 rounded-lg px-2.5 py-1.5 text-xs font-semibold text-slate-500 transition hover:bg-rose-50 hover:text-rose-600"
                          aria-label={`Delete analysis for ${item.jobTitle || 'untitled role'}`}
                        >
                          <Trash2 className="h-3.5 w-3.5" /> Delete
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : null}

        {/* Pagination */}
        {!loading && !error && pages > 1 && (
          <div className="flex flex-wrap items-center justify-between gap-3 border-t border-slate-100 px-5 py-4 sm:px-6">
            <p className="text-xs text-slate-500">
              Page <span className="font-semibold text-slate-700">{currentPage}</span> of{' '}
              <span className="font-semibold text-slate-700">{pages}</span>
            </p>
            <div className="flex items-center gap-1">
              <button
                type="button"
                onClick={() => setPage((current) => Math.max(1, current - 1))}
                disabled={currentPage <= 1}
                className="inline-flex items-center gap-1 rounded-lg px-2.5 py-1.5 text-xs font-semibold text-slate-600 transition hover:bg-slate-100 disabled:cursor-not-allowed disabled:opacity-40"
              >
                <ArrowLeft className="h-3.5 w-3.5" /> Prev
              </button>
              {pageNumbers.map((number) => (
                <button
                  key={number}
                  type="button"
                  onClick={() => setPage(number)}
                  className={`h-8 w-8 rounded-lg text-xs font-semibold transition ${
                    number === currentPage
                      ? 'bg-brand-600 text-white shadow-sm'
                      : 'text-slate-600 hover:bg-slate-100'
                  }`}
                  aria-current={number === currentPage ? 'page' : undefined}
                >
                  {number}
                </button>
              ))}
              <button
                type="button"
                onClick={() => setPage((current) => Math.min(pages, current + 1))}
                disabled={currentPage >= pages}
                className="inline-flex items-center gap-1 rounded-lg px-2.5 py-1.5 text-xs font-semibold text-slate-600 transition hover:bg-slate-100 disabled:cursor-not-allowed disabled:opacity-40"
              >
                Next <ArrowRight className="h-3.5 w-3.5" />
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Delete confirmation */}
      <Modal
        open={Boolean(pendingDelete)}
        onClose={() => (deleting ? null : setPendingDelete(null))}
        title="Delete this analysis?"
        description="This action cannot be undone. The report will be permanently removed from your history."
        footer={
          <>
            <Button variant="secondary" onClick={() => setPendingDelete(null)} disabled={deleting}>
              Cancel
            </Button>
            <Button variant="danger" onClick={confirmDelete} loading={deleting}>
              Delete analysis
            </Button>
          </>
        }
      >
        {pendingDelete && (
          <div className="rounded-xl bg-slate-50 p-4">
            <p className="text-sm font-semibold text-slate-800">
              {pendingDelete.jobTitle || 'Untitled role'}
            </p>
            <p className="mt-0.5 text-xs text-slate-500">
              {pendingDelete.company || 'No company'} · {formatDate(pendingDelete.createdAt)}
            </p>
          </div>
        )}
      </Modal>
    </div>
  );
}
