import { useEffect, useRef, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import {
  ArrowRight,
  CheckCircle2,
  FileText,
  LockKeyhole,
  Sparkles,
  Trash2,
  UploadCloud,
} from 'lucide-react';
import Button from '../components/ui/Button.jsx';
import Input from '../components/ui/Input.jsx';
import Textarea from '../components/ui/Textarea.jsx';
import Alert from '../components/ui/Alert.jsx';
import ProgressBar from '../components/ui/ProgressBar.jsx';
import { useToast } from '../context/ToastContext.jsx';
import * as analysesApi from '../api/analyses.js';
import { formatBytes } from '../utils/format.js';
import { SAMPLE_JOB_DESCRIPTION } from '../utils/constants.js';

const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10 MB
const MIN_JD_LENGTH = 50;

const INITIAL_VALUES = { jobTitle: '', company: '', jobDescription: '' };

export default function AnalyzePage() {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [searchParams] = useSearchParams();
  const fileInputRef = useRef(null);

  const [file, setFile] = useState(null);
  const [dragging, setDragging] = useState(false);
  const [values, setValues] = useState(INITIAL_VALUES);
  const [errors, setErrors] = useState({});
  const [fileError, setFileError] = useState('');
  const [formError, setFormError] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [progress, setProgress] = useState(0);

  // Prefill the description when the landing page CTA supplies one.
  // Depend on the string value so the effect never re-runs after a user edit.
  const prefilledJd = searchParams.get('jd');
  useEffect(() => {
    if (prefilledJd) {
      setValues((current) => ({ ...current, jobDescription: prefilledJd }));
    }
  }, [prefilledJd]);

  const setField = (field) => (event) => {
    setValues((current) => ({ ...current, [field]: event.target.value }));
    setErrors((current) => ({ ...current, [field]: undefined }));
    setFormError('');
  };

  const validateFile = (candidate) => {
    setFileError('');
    if (!candidate) return;
    const isPdf =
      candidate.type === 'application/pdf' ||
      candidate.name?.toLowerCase().endsWith('.pdf');
    if (!isPdf) {
      setFileError('Only PDF files are supported. Please choose a .pdf resume.');
      return;
    }
    if (candidate.size > MAX_FILE_SIZE) {
      setFileError('That file is too large. Please upload a PDF under 10 MB.');
      return;
    }
    setFile(candidate);
  };

  const handleDrop = (event) => {
    event.preventDefault();
    setDragging(false);
    const dropped = event.dataTransfer?.files?.[0];
    if (dropped) validateFile(dropped);
  };

  const handleFileChange = (event) => {
    const selected = event.target.files?.[0];
    if (selected) validateFile(selected);
    // Reset so re-selecting the same file still fires a change event.
    event.target.value = '';
  };

  const removeFile = () => {
    setFile(null);
    setFileError('');
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setFileError('');
    setFormError('');

    let valid = true;
    const next = {};
    if (!file) {
      setFileError('Please choose a PDF resume to analyse.');
      valid = false;
    }
    if (!values.jobTitle.trim()) {
      next.jobTitle = 'Add the target job title.';
      valid = false;
    }
    if (!values.jobDescription.trim()) {
      next.jobDescription = 'Paste the job description to compare against.';
      valid = false;
    } else if (values.jobDescription.trim().length < MIN_JD_LENGTH) {
      next.jobDescription = `Add a little more detail (at least ${MIN_JD_LENGTH} characters).`;
      valid = false;
    }
    setErrors(next);
    if (!valid) return;

    setSubmitting(true);
    setProgress(0);
    try {
      const data = await analysesApi.analyze(
        file,
        {
          jobTitle: values.jobTitle.trim(),
          company: values.company.trim(),
          jobDescription: values.jobDescription.trim(),
        },
        setProgress,
      );
      toast.success('Analysis complete — here are your results!');
      navigate(`/results/${data.analysis?.id}`);
    } catch (error) {
      setFormError(error.message || 'Analysis failed. Please try again.');
    } finally {
      setSubmitting(false);
      setProgress(0);
    }
  };

  const fillExample = () => {
    setValues((current) => ({
      ...current,
      jobTitle: current.jobTitle || 'Senior Frontend Engineer',
      company: current.company || 'Example Co.',
      jobDescription: SAMPLE_JOB_DESCRIPTION,
    }));
    setErrors((current) => ({ ...current, jobDescription: undefined }));
    toast.info('Example job description added. Feel free to edit it.');
  };

  return (
    <form onSubmit={handleSubmit} className="animate-fade-in" noValidate>
      <div className="mb-6">
        <h2 className="text-2xl font-bold tracking-tight text-slate-900">Analyze a resume</h2>
        <p className="mt-2 text-sm text-slate-600">
          Upload a PDF resume and tell us about the role you are targeting.
        </p>
      </div>

      <div className="grid items-start gap-6 lg:grid-cols-2">
        {/* ---------------------------------------------------------- Upload */}
        <section className="card p-6" aria-labelledby="upload-title">
          <div className="flex items-center gap-3">
            <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-brand-50 text-brand-600">
              <UploadCloud className="h-[18px] w-[18px]" aria-hidden="true" />
            </span>
            <div>
              <h3 id="upload-title" className="text-base font-semibold text-slate-900">Your resume</h3>
              <p className="text-xs text-slate-500">PDF format, up to 10 MB</p>
            </div>
          </div>

          <input
            ref={fileInputRef}
            type="file"
            accept="application/pdf,.pdf"
            onChange={handleFileChange}
            className="sr-only"
            aria-label="Choose a PDF resume"
          />

          {!file ? (
            <div
              onDragOver={(event) => event.preventDefault()}
              onDragEnter={(event) => {
                event.preventDefault();
                setDragging(true);
              }}
              onDragLeave={(event) => {
                event.preventDefault();
                setDragging(false);
              }}
              onDrop={handleDrop}
              className={`mt-6 flex cursor-pointer flex-col items-center justify-center rounded-2xl border-2 border-dashed px-6 py-12 text-center transition ${
                dragging
                  ? 'border-brand-500 bg-brand-50/70'
                  : 'border-slate-300 bg-slate-50/60 hover:border-brand-400 hover:bg-brand-50/30'
              }`}
              onClick={() => fileInputRef.current?.click()}
              role="button"
              tabIndex={0}
              onKeyDown={(event) => {
                if (event.key === 'Enter' || event.key === ' ') {
                  event.preventDefault();
                  fileInputRef.current?.click();
                }
              }}
            >
              <span className="flex h-14 w-14 items-center justify-center rounded-2xl bg-white shadow-sm ring-1 ring-slate-200">
                <UploadCloud className={`h-6 w-6 ${dragging ? 'text-brand-600' : 'text-slate-400'}`} />
              </span>
              <p className="mt-4 text-sm font-semibold text-slate-800">
                Drag and drop your resume here
              </p>
              <p className="mt-1 text-xs text-slate-500">or click to browse your files</p>
              <span className="mt-4 rounded-lg bg-white px-3 py-1.5 text-[11px] font-medium text-slate-500 ring-1 ring-slate-200">
                PDF only · max 10 MB
              </span>
            </div>
          ) : (
            <div className="mt-6 flex items-center gap-4 rounded-2xl border border-emerald-200 bg-emerald-50/60 p-4">
              <span className="flex h-11 w-11 flex-none items-center justify-center rounded-xl bg-white text-rose-500 shadow-sm ring-1 ring-emerald-100">
                <FileText className="h-5 w-5" aria-hidden="true" />
              </span>
              <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-semibold text-slate-800">{file.name}</p>
                <p className="mt-0.5 text-xs text-slate-500">
                  {formatBytes(file.size)} · PDF document
                </p>
              </div>
              <CheckCircle2 className="h-5 w-5 flex-none text-emerald-500" />
              <button
                type="button"
                onClick={removeFile}
                className="rounded-lg p-2 text-slate-400 transition hover:bg-white hover:text-rose-600"
                aria-label="Remove selected file"
                title="Remove file"
              >
                <Trash2 className="h-4 w-4" />
              </button>
            </div>
          )}

          {fileError && (
            <p className="mt-3 text-xs font-medium text-rose-600" role="alert">{fileError}</p>
          )}

          <Alert type="info" className="mt-6" title="Your privacy matters">
            Your resume and analysis are stored securely and are only visible to your account.
            We do not sell or share your data.
          </Alert>
        </section>

        {/* ------------------------------------------------------- Job details */}
        <section className="card p-6" aria-labelledby="job-title-heading">
          <div className="flex items-center gap-3">
            <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-violet-50 text-violet-600">
              <FileText className="h-[18px] w-[18px]" aria-hidden="true" />
            </span>
            <div>
              <h3 id="job-title-heading" className="text-base font-semibold text-slate-900">Job details</h3>
              <p className="text-xs text-slate-500">The role you want to match against</p>
            </div>
          </div>

          <div className="mt-6 space-y-5">
            <div className="grid gap-5 sm:grid-cols-2">
              <Input
                label="Job title"
                placeholder="e.g. Frontend Engineer"
                value={values.jobTitle}
                onChange={setField('jobTitle')}
                error={errors.jobTitle}
                required
              />
              <Input
                label="Company"
                placeholder="e.g. Acme Inc. (optional)"
                value={values.company}
                onChange={setField('company')}
              />
            </div>

            <div>
              <Textarea
                label="Job description"
                placeholder="Paste the full job description here…"
                rows={10}
                value={values.jobDescription}
                onChange={setField('jobDescription')}
                error={errors.jobDescription}
                hint={`Include responsibilities and requirements for better insights · minimum ${MIN_JD_LENGTH} characters`}
                showCount
                required
              />
              <button
                type="button"
                onClick={fillExample}
                className="mt-3 inline-flex items-center gap-1.5 text-xs font-semibold text-brand-600 transition hover:text-brand-700"
              >
                <Sparkles className="h-3.5 w-3.5" /> Try an example
              </button>
            </div>
          </div>
        </section>
      </div>

      {/* ------------------------------------------------------------- Submit */}
      <div className="sticky bottom-4 z-20 mt-6 rounded-2xl border border-slate-200 bg-white/95 p-4 shadow-card backdrop-blur">
        {formError && (
          <div className="mb-3">
            <Alert type="error" title="Analysis could not be completed">
              {formError}
            </Alert>
          </div>
        )}

        {submitting && (
          <div className="mb-4">
            <ProgressBar
              label={progress >= 100 ? 'Analysing document…' : 'Uploading resume…'}
              value={progress}
              color="brand"
              showValue
              size="sm"
            />
          </div>
        )}

        <div className="flex flex-wrap items-center justify-between gap-3">
          <p className="flex items-center gap-2 text-xs text-slate-500">
            <LockKeyhole className="h-3.5 w-3.5 text-slate-400" />
            Private and secure · results saved to your account
          </p>
          <Button type="submit" loading={submitting} rightIcon={submitting ? undefined : ArrowRight}>
            {submitting ? 'Analyzing your resume…' : 'Analyze resume'}
          </Button>
        </div>
      </div>

      <div className="mt-6 flex items-center justify-center gap-2 text-xs text-slate-400">
        <Sparkles className="h-3.5 w-3.5" />
        Rule-based insights, designed to be genuinely useful.
      </div>
    </form>
  );
}
