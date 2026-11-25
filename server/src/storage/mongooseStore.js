/**
 * storage/mongooseStore.js
 * Mongoose User + Analysis models. Documents are mapped back to the exact same
 * plain-object API exposed by fileStore (string `id`, ISO `createdAt`).
 */
const mongoose = require('mongoose');

function transform(_doc, ret) {
  ret.id = String(ret._id);
  delete ret._id;
  delete ret.__v;
  return ret;
}

function mapDoc(doc) {
  if (!doc) return null;
  const obj = typeof doc.toObject === 'function' ? doc.toObject() : { ...doc };
  const result = transform(doc, obj);
  if (result.createdAt instanceof Date) result.createdAt = result.createdAt.toISOString();
  if (result.updatedAt instanceof Date) result.updatedAt = result.updatedAt.toISOString();
  delete result.updatedAt;
  return result;
}

const userSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true, maxlength: 80 },
    email: { type: String, required: true, unique: true, lowercase: true, trim: true },
    password: { type: String, required: true }
  },
  { timestamps: true, versionKey: false, toJSON: { transform }, toObject: { transform } }
);

const analysisSchema = new mongoose.Schema(
  {
    userId: { type: String, required: true, index: true },
    jobTitle: { type: String, default: '', maxlength: 120 },
    company: { type: String, default: '', maxlength: 120 },
    resumeFileName: { type: String, default: 'resume.pdf' },
    score: { type: Number, default: 0 },
    grade: { type: String, default: 'F' },
    verdict: { type: String, default: '' },
    skills: {
      type: mongoose.Schema.Types.Mixed,
      default: () => ({ matched: [], missing: [], extra: [], coverage: 0 })
    },
    breakdown: {
      type: mongoose.Schema.Types.Mixed,
      default: () => ({
        skillMatch: 0,
        keywordMatch: 0,
        sectionCompleteness: 0,
        formatting: 0,
        experience: 0
      })
    },
    keywords: { type: mongoose.Schema.Types.Mixed, default: () => ({ matched: [], missing: [] }) },
    sections: { type: [mongoose.Schema.Types.Mixed], default: () => [] },
    suggestions: { type: [mongoose.Schema.Types.Mixed], default: () => [] },
    summary: { type: String, default: '' },
    resumeStats: {
      type: mongoose.Schema.Types.Mixed,
      default: () => ({ wordCount: 0, characterCount: 0, pages: 1 })
    },
    extractedSkillCount: { type: Number, default: 0 }
  },
  { timestamps: true, versionKey: false, toJSON: { transform }, toObject: { transform } }
);

analysisSchema.index({ userId: 1, createdAt: -1 });

const User = mongoose.models.User || mongoose.model('User', userSchema);
const Analysis = mongoose.models.Analysis || mongoose.model('Analysis', analysisSchema);

function validId(id) {
  return mongoose.isValidObjectId(String(id || ''));
}

function escapeRegex(value) {
  return String(value).replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

async function createUser({ name, email, password }) {
  const user = await User.create({ name, email: String(email || '').toLowerCase(), password });
  return mapDoc(user);
}

async function findUserByEmail(email) {
  if (typeof email !== 'string') return null;
  const user = await User.findOne({ email: email.toLowerCase() });
  return mapDoc(user);
}

async function findUserById(id) {
  if (!validId(id)) return null;
  const user = await User.findById(id);
  return mapDoc(user);
}

async function updateUser(id, patch) {
  if (!validId(id)) return null;
  const updates = {};
  if (patch && typeof patch.name === 'string') updates.name = patch.name;
  if (patch && typeof patch.email === 'string') updates.email = patch.email.toLowerCase();
  if (patch && typeof patch.password === 'string') updates.password = patch.password;
  const user = await User.findByIdAndUpdate(id, { $set: updates }, { new: true, runValidators: true });
  return mapDoc(user);
}

async function createAnalysis(doc) {
  const allowed = {
    userId: String(doc.userId),
    jobTitle: doc.jobTitle || '',
    company: doc.company || '',
    resumeFileName: doc.resumeFileName || 'resume.pdf',
    score: doc.score,
    grade: doc.grade,
    verdict: doc.verdict,
    skills: doc.skills,
    breakdown: doc.breakdown,
    keywords: doc.keywords,
    sections: doc.sections,
    suggestions: doc.suggestions,
    summary: doc.summary,
    resumeStats: doc.resumeStats,
    extractedSkillCount: doc.extractedSkillCount || 0
  };
  const analysis = await Analysis.create(allowed);
  return mapDoc(analysis);
}

async function findAnalyses({ userId, page = 1, limit = 10, search = '' } = {}) {
  const query = { userId: String(userId) };
  if (typeof search === 'string' && search.trim()) {
    const escaped = escapeRegex(search.trim());
    query.$or = [
      { jobTitle: { $regex: escaped, $options: 'i' } },
      { company: { $regex: escaped, $options: 'i' } },
      { resumeFileName: { $regex: escaped, $options: 'i' } }
    ];
  }
  const offset = (page - 1) * limit;
  const [docs, total] = await Promise.all([
    Analysis.find(query).sort({ createdAt: -1 }).skip(offset).limit(limit).lean(),
    Analysis.countDocuments(query)
  ]);
  return { items: docs.map((doc) => mapDoc(doc)), total };
}

async function findAnalysisById(id, userId) {
  if (!validId(id)) return null;
  const analysis = await Analysis.findOne({ _id: id, userId: String(userId) });
  return mapDoc(analysis);
}

async function deleteAnalysis(id, userId) {
  if (!validId(id)) return false;
  const result = await Analysis.deleteOne({ _id: id, userId: String(userId) });
  return result.deletedCount > 0;
}

async function getAllAnalysesForUser(userId) {
  const docs = await Analysis.find({ userId: String(userId) }).sort({ createdAt: 1 }).lean();
  return docs.map((doc) => mapDoc(doc));
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
  User,
  Analysis
};
