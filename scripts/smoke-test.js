/**
 * End-to-end API smoke test. Start the API first (npm run dev:api), then run:
 *   npm run smoke
 *
 * Exercises: health, auth (register/me/login), analysis upload, history,
 * detail, stats, authorization guard, validation and deletion.
 */
const { generateResumePdf } = require('./sample-resume');

const BASE = (process.env.API_URL || 'http://localhost:5000/api').replace(/\/$/, '');
const JOB_DESCRIPTION = `We are hiring a Senior Full Stack Engineer to build and scale our customer-facing platform.
You will work with JavaScript, TypeScript, React, Node.js and GraphQL, and design services deployed on AWS with Docker and Kubernetes.
The ideal candidate has 5+ years of experience, strong SQL and MongoDB skills, writes unit tests with Jest, and is comfortable with CI/CD pipelines and Agile delivery.
Experience with Python data pipelines, Redis caching, Terraform and system design is a strong plus. Excellent communication and mentoring skills are required.`;

let passed = 0;
let failed = 0;
let token = '';
let analysisId = '';

function check(name, condition, detail = '') {
  if (condition) {
    passed += 1;
    console.log(`  PASS  ${name}`);
  } else {
    failed += 1;
    console.error(`  FAIL  ${name}${detail ? ` — ${detail}` : ''}`);
  }
}

async function request(method, endpoint, { body, auth = true, form = false } = {}) {
  const headers = {};
  if (auth && token) headers.Authorization = `Bearer ${token}`;
  if (body && !form) headers['Content-Type'] = 'application/json';
  const res = await fetch(`${BASE}${endpoint}`, {
    method,
    headers,
    body: form ? body : body ? JSON.stringify(body) : undefined,
  });
  let data = null;
  try {
    data = await res.json();
  } catch {
    data = null;
  }
  return { status: res.status, data };
}

async function run() {
  console.log(`\nResumeIQ smoke test -> ${BASE}\n`);

  // Health
  const health = await request('GET', '/health', { auth: false });
  check('health endpoint is up', health.status === 200 && health.data?.success === true, JSON.stringify(health.data));
  check('health reports storage mode', ['mongodb', 'file'].includes(health.data?.storage), JSON.stringify(health.data));

  // Registration
  const email = `smoke_${Date.now()}@example.com`;
  const register = await request('POST', '/auth/register', {
    auth: false,
    body: { name: 'Smoke Tester', email, password: 'StrongPass123!' },
  });
  check('register returns 201', register.status === 201, JSON.stringify(register.data));
  check('register returns token and user', Boolean(register.data?.token && register.data?.user?.id), JSON.stringify(register.data));
  token = register.data?.token || '';

  // /me
  const me = await request('GET', '/auth/me');
  check('authenticated /me works', me.status === 200 && me.data?.user?.email === email, JSON.stringify(me.data));

  // Profile update
  const updatedEmail = `smoke_updated_${Date.now()}@example.com`;
  const profile = await request('PUT', '/auth/profile', {
    body: { name: 'Smoke Tester Updated', email: updatedEmail }
  });
  check(
    'profile update works',
    profile.status === 200 &&
      profile.data?.user?.email === updatedEmail &&
      profile.data?.user?.name === 'Smoke Tester Updated',
    JSON.stringify(profile.data)
  );

  // Duplicate registration
  const duplicate = await request('POST', '/auth/register', {
    auth: false,
    body: { name: 'Smoke Tester', email: updatedEmail, password: 'StrongPass123!' },
  });
  check('duplicate email is rejected', duplicate.status === 409, JSON.stringify(duplicate.data));

  // Validation
  const invalid = await request('POST', '/auth/register', {
    auth: false,
    body: { name: '', email: 'not-an-email', password: 'short' },
  });
  check('invalid registration is rejected', invalid.status === 400 && Array.isArray(invalid.data?.errors), JSON.stringify(invalid.data));

  // Login
  const login = await request('POST', '/auth/login', {
    auth: false,
    body: { email: updatedEmail, password: 'StrongPass123!' },
  });
  check('login returns token', login.status === 200 && Boolean(login.data?.token), JSON.stringify(login.data));
  const wrongPassword = await request('POST', '/auth/login', {
    auth: false,
    body: { email: updatedEmail, password: 'WrongPass123!' },
  });
  check('wrong password is rejected', wrongPassword.status === 401, JSON.stringify(wrongPassword.data));

  // Analyze
  const pdf = await generateResumePdf();
  const form = new FormData();
  form.append('resume', new Blob([pdf], { type: 'application/pdf' }), 'jane-doe-resume.pdf');
  form.append('jobDescription', JOB_DESCRIPTION);
  form.append('jobTitle', 'Senior Full Stack Engineer');
  form.append('company', 'Example Corp');
  const analyze = await request('POST', '/analyze', { body: form, form: true });
  check('analysis upload succeeds', analyze.status === 201 && analyze.data?.success === true, JSON.stringify(analyze.data));
  const a = analyze.data?.analysis;
  if (a) {
    analysisId = a.id;
    check('score is within 0-100', Number.isInteger(a.score) && a.score >= 0 && a.score <= 100, String(a.score));
    check('grade is valid', ['A', 'B', 'C', 'D', 'F'].includes(a.grade), String(a.grade));
    check('skill results are present', Array.isArray(a.skills?.matched) && Array.isArray(a.skills?.missing) && Array.isArray(a.skills?.extra), JSON.stringify(a.skills));
    check('matched skills detected', a.skills.matched.length > 0, JSON.stringify(a.skills.matched.slice(0, 5)));
    check('breakdown has five metrics', ['skillMatch', 'keywordMatch', 'sectionCompleteness', 'formatting', 'experience'].every((k) => typeof a.breakdown?.[k] === 'number'), JSON.stringify(a.breakdown));
    check('sections checklist present', Array.isArray(a.sections) && a.sections.length >= 6, String(a.sections?.length));
    check('suggestions present', Array.isArray(a.suggestions) && a.suggestions.length >= 3, String(a.suggestions?.length));
    check('summary present', typeof a.summary === 'string' && a.summary.length > 20, a.summary);
    check('resume stats present', typeof a.resumeStats?.wordCount === 'number' && a.resumeStats.wordCount > 50, JSON.stringify(a.resumeStats));
    check('raw resume text is not stored', !JSON.stringify(a).includes('jane.doe@example.com'));
  }

  // Non-PDF upload rejected
  const badFile = new FormData();
  badFile.append('resume', new Blob(['not a pdf'], { type: 'text/plain' }), 'resume.txt');
  badFile.append('jobDescription', JOB_DESCRIPTION);
  const badUpload = await request('POST', '/analyze', { body: badFile, form: true });
  check('non-PDF upload is rejected', badUpload.status === 400 || badUpload.status === 413, JSON.stringify(badUpload.data));

  // History
  const list = await request('GET', '/analyses?page=1&limit=10');
  check('history lists analyses', list.status === 200 && Array.isArray(list.data?.analyses) && list.data.analyses.length >= 1, JSON.stringify(list.data).slice(0, 300));
  check('pagination metadata present', typeof list.data?.pagination?.total === 'number', JSON.stringify(list.data?.pagination));
  const search = await request('GET', '/analyses?search=Full Stack');
  check('history search works', search.status === 200 && search.data.analyses.length >= 1, JSON.stringify(search.data).slice(0, 200));

  // Detail
  if (analysisId) {
    const detail = await request('GET', `/analyses/${analysisId}`);
    check('analysis detail works', detail.status === 200 && detail.data?.analysis?.id === analysisId, JSON.stringify(detail.data).slice(0, 200));
  }

  // Stats
  const stats = await request('GET', '/stats');
  check('stats endpoint works', stats.status === 200 && stats.data?.stats?.totalAnalyses >= 1, JSON.stringify(stats.data).slice(0, 300));
  check('stats trend is an array', Array.isArray(stats.data?.stats?.trend), JSON.stringify(stats.data?.stats?.trend));

  // Auth guard
  const savedToken = token;
  token = '';
  const guarded = await request('GET', '/analyses');
  check('protected route requires token', guarded.status === 401, JSON.stringify(guarded.data));
  token = savedToken;

  // Delete
  if (analysisId) {
    const del = await request('DELETE', `/analyses/${analysisId}`);
    check('delete analysis works', del.status === 200 && del.data?.success === true, JSON.stringify(del.data));
    const after = await request('GET', `/analyses/${analysisId}`);
    check('deleted analysis is gone', after.status === 404, JSON.stringify(after.data));
  }

  console.log(`\n${passed} passed, ${failed} failed\n`);
  if (failed > 0) process.exit(1);
}

run().catch((err) => {
  console.error('\nSmoke test crashed:', err);
  process.exit(1);
});
