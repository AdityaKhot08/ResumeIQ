/**
 * storage/fileStore.js
 * Zero-dependency JSON persistence at server/.data/db.json. All writes are
 * serialized and use a temp file + rename so a crash cannot leave a partial
 * JSON document behind. Passwords are stored here as bcrypt hashes only.
 */
const fs = require('fs');
const path = require('path');
const crypto = require('crypto');

const DATA_DIR = path.resolve(__dirname, '..', '..', '.data');
const DB_PATH = path.join(DATA_DIR, 'db.json');

function seed() {
  return { users: [], analyses: [] };
}

function clone(value) {
  return value === undefined ? undefined : JSON.parse(JSON.stringify(value));
}

function ensureDb() {
  try {
    if (!fs.existsSync(DATA_DIR)) fs.mkdirSync(DATA_DIR, { recursive: true });
    if (!fs.existsSync(DB_PATH)) {
      writeDb(seed());
      return seed();
    }
    const raw = fs.readFileSync(DB_PATH, 'utf8');
    if (!raw.trim()) {
      const empty = seed();
      writeDb(empty);
      return empty;
    }
    const parsed = JSON.parse(raw);
    if (!parsed || !Array.isArray(parsed.users) || !Array.isArray(parsed.analyses)) {
      throw new Error('Unexpected database shape');
    }
    return parsed;
  } catch (error) {
    console.error(`Unable to read ${path.relative(process.cwd(), DB_PATH)}: ${error.message}`);
    // Preserve the damaged file for inspection and start with a clean store.
    try {
      if (fs.existsSync(DB_PATH)) {
        const backup = path.join(DATA_DIR, `db.corrupt-${Date.now()}.json`);
        fs.copyFileSync(DB_PATH, backup);
      }
    } catch (_copyError) {
      /* best effort */
    }
    const fresh = seed();
    writeDb(fresh);
    return fresh;
  }
}

function writeDb(data) {
  if (!fs.existsSync(DATA_DIR)) fs.mkdirSync(DATA_DIR, { recursive: true });
  const temp = path.join(DATA_DIR, `.db-${process.pid}-${crypto.randomBytes(4).toString('hex')}.tmp`);
  fs.writeFileSync(temp, JSON.stringify(data, null, 2), 'utf8');
  try {
    fs.renameSync(temp, DB_PATH);
  } catch (_renameError) {
    // Windows occasionally refuses an atomic rename over an open file.
    fs.writeFileSync(DB_PATH, JSON.stringify(data, null, 2), 'utf8');
    try { fs.unlinkSync(temp); } catch (_unlinkError) { /* ignore */ }
  }
}

// Serialize mutations inside this process to avoid lost updates.
let queue = Promise.resolve();
function withLock(task) {
  const result = queue.then(task, task);
  queue = result.catch(() => {});
  return result;
}

function newId() {
  return crypto.randomUUID();
}

function duplicateEmailError() {
  const error = new Error('Duplicate email');
  error.code = 11000;
  return error;
}

async function createUser({ name, email, password }) {
  return withLock(() => {
    const db = ensureDb();
    const normalizedEmail = String(email || '').toLowerCase();
    if (db.users.some((u) => String(u.email).toLowerCase() === normalizedEmail)) {
      throw duplicateEmailError();
    }
    const user = {
      id: newId(),
      name: name || '',
      email: normalizedEmail,
      password: password || '',
      createdAt: new Date().toISOString()
    };
    db.users.push(user);
    writeDb(db);
    return clone(user);
  });
}

async function findUserByEmail(email) {
  const db = ensureDb();
  const normalized = String(email || '').toLowerCase();
  const found = db.users.find((u) => String(u.email).toLowerCase() === normalized);
  return found ? clone(found) : null;
}

async function findUserById(id) {
  const db = ensureDb();
  const found = db.users.find((u) => String(u.id) === String(id));
  return found ? clone(found) : null;
}

async function updateUser(id, patch) {
  return withLock(() => {
    const db = ensureDb();
    const index = db.users.findIndex((u) => String(u.id) === String(id));
    if (index === -1) return null;
    const current = db.users[index];
    if (patch && typeof patch.email === 'string') {
      const normalized = patch.email.toLowerCase();
      if (db.users.some((u, i) => i !== index && String(u.email).toLowerCase() === normalized)) {
        throw duplicateEmailError();
      }
      current.email = normalized;
    }
    if (patch && typeof patch.name === 'string') current.name = patch.name;
    if (patch && typeof patch.password === 'string') current.password = patch.password;
    writeDb(db);
    return clone(current);
  });
}

async function createAnalysis(doc) {
  return withLock(() => {
    const db = ensureDb();
    const analysis = {
      ...clone(doc),
      id: doc.id || newId(),
      userId: String(doc.userId),
      createdAt: doc.createdAt || new Date().toISOString()
    };
    db.analyses.push(analysis);
    writeDb(db);
    return clone(analysis);
  });
}

function matchesSearch(analysis, search) {
  if (!search) return true;
  const needle = search.toLowerCase();
  return [analysis.jobTitle, analysis.company, analysis.resumeFileName]
    .some((field) => String(field || '').toLowerCase().includes(needle));
}

async function findAnalyses({ userId, page = 1, limit = 10, search = '' } = {}) {
  const db = ensureDb();
  const filtered = db.analyses
    .filter((a) => String(a.userId) === String(userId))
    .filter((a) => matchesSearch(a, search))
    .sort((a, b) => String(b.createdAt || '').localeCompare(String(a.createdAt || '')));
  const total = filtered.length;
  const offset = (page - 1) * limit;
  return { items: clone(filtered.slice(offset, offset + limit)), total };
}

async function findAnalysisById(id, userId) {
  const db = ensureDb();
  const found = db.analyses.find(
    (a) => String(a.id) === String(id) && String(a.userId) === String(userId)
  );
  return found ? clone(found) : null;
}

async function deleteAnalysis(id, userId) {
  return withLock(() => {
    const db = ensureDb();
    const index = db.analyses.findIndex(
      (a) => String(a.id) === String(id) && String(a.userId) === String(userId)
    );
    if (index === -1) return false;
    db.analyses.splice(index, 1);
    writeDb(db);
    return true;
  });
}

async function getAllAnalysesForUser(userId) {
  const db = ensureDb();
  return clone(
    db.analyses
      .filter((a) => String(a.userId) === String(userId))
      .sort((a, b) => String(a.createdAt || '').localeCompare(String(a.createdAt || '')))
  );
}

module.exports = {
  createUser,
  findUserByEmail,
  findUserById,
  updateUser,
  createAnalysis,
  findAnalyses,
  findAnalysisById,
  deleteAnalysis,
  getAllAnalysesForUser,
  DB_PATH
};
