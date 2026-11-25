import api from './client.js';

/**
 * Upload a resume + job description and run an analysis.
 * `onProgress` receives a 0–100 number driven by axios upload progress.
 * Returns { success, analysis }.
 */
export function analyze(file, data, onProgress) {
  const formData = new FormData();
  formData.append('resume', file);
  formData.append('jobDescription', data.jobDescription || '');
  formData.append('jobTitle', data.jobTitle || '');
  formData.append('company', data.company || '');

  return api
    .post('/analyze', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
      onUploadProgress: (event) => {
        if (typeof onProgress === 'function' && event.total) {
          onProgress(Math.min(100, Math.round((event.loaded * 100) / event.total)));
        }
      },
    })
    .then((res) => res.data);
}

/** Paginated, searchable analysis list. Returns { success, analyses, pagination }. */
export function list({ page = 1, limit = 10, search = '' } = {}) {
  return api
    .get('/analyses', { params: { page, limit, search } })
    .then((res) => res.data);
}

/** Full detail for one analysis. Returns { success, analysis }. */
export function get(id) {
  return api.get(`/analyses/${encodeURIComponent(id)}`).then((res) => res.data);
}

/** Delete an analysis. Returns { success, message }. */
export function remove(id) {
  return api.delete(`/analyses/${encodeURIComponent(id)}`).then((res) => res.data);
}

/** Dashboard statistics. Returns { success, stats }. */
export function stats() {
  return api.get('/stats').then((res) => res.data);
}
