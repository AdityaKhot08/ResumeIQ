/**
 * controllers/analysisController.js
 * Handles PDF analysis creation, saved-analysis history, individual reports,
 * deletion and dashboard statistics.
 */
const asyncHandler = require('../utils/asyncHandler');
const AppError = require('../utils/AppError');
const store = require('../storage/store');
const { extractTextFromPdf } = require('../services/pdfService');
const { analyzeResume } = require('../services/analysisService');
const { normalizeString } = require('../utils/sanitize');

function asArray(value) {
  return Array.isArray(value) ? value : [];
}

/** Guarantee the exact public analysis shape, even for older stored records. */
function toAnalysisResponse(record) {
  if (!record) return null;
  const skills = record.skills || {};
  const breakdown = record.breakdown || {};
  const keywords = record.keywords || {};
  const stats = record.resumeStats || {};
  return {
    id: String(record.id),
    userId: String(record.userId || ''),
    jobTitle: record.jobTitle || '',
    company: record.company || '',
    resumeFileName: record.resumeFileName || 'resume.pdf',
    score: Number(record.score) || 0,
    grade: record.grade || 'F',
    verdict: record.verdict || '',
    skills: {
      matched: asArray(skills.matched),
      missing: asArray(skills.missing),
      extra: asArray(skills.extra),
      coverage: Number(skills.coverage) || 0
    },
    breakdown: {
      skillMatch: Number(breakdown.skillMatch) || 0,
      keywordMatch: Number(breakdown.keywordMatch) || 0,
      sectionCompleteness: Number(breakdown.sectionCompleteness) || 0,
      formatting: Number(breakdown.formatting) || 0,
      experience: Number(breakdown.experience) || 0
    },
    keywords: {
      matched: asArray(keywords.matched),
      missing: asArray(keywords.missing)
    },
    sections: asArray(record.sections),
    suggestions: asArray(record.suggestions),
    summary: record.summary || '',
    resumeStats: {
      wordCount: Number(stats.wordCount) || 0,
      characterCount: Number(stats.characterCount) || 0,
      pages: Number(stats.pages) || 1
    },
    extractedSkillCount: Number(record.extractedSkillCount) || 0,
    createdAt: record.createdAt || new Date(0).toISOString()
  };
}

function toListItem(record) {
  return {
    id: String(record.id),
    jobTitle: record.jobTitle || '',
    company: record.company || '',
    score: Number(record.score) || 0,
    grade: record.grade || 'F',
    matchedCount: asArray(record.skills && record.skills.matched).length,
    missingCount: asArray(record.skills && record.skills.missing).length,
    createdAt: record.createdAt || new Date(0).toISOString(),
    resumeFileName: record.resumeFileName || 'resume.pdf'
  };
}

const createAnalysis = asyncHandler(async (req, res) => {
  if (!req.file || !Buffer.isBuffer(req.file.buffer)) {
    throw new AppError('Please upload a PDF resume in the "resume" field.', 400);
  }

  const { text, pages } = await extractTextFromPdf(req.file.buffer);
  const body = req.body || {};
  const result = analyzeResume({
    resumeText: text,
    jobDescription: normalizeString(body.jobDescription, 20000),
    jobTitle: normalizeString(body.jobTitle, 120),
    company: normalizeString(body.company, 120),
    pages
  });

  const saved = await store.createAnalysis({
    userId: req.user.id,
    jobTitle: normalizeString(body.jobTitle, 120),
    company: normalizeString(body.company, 120),
    resumeFileName: normalizeString(req.file.originalname, 200) || 'resume.pdf',
    ...result,
    createdAt: new Date().toISOString()
  });

  res.status(201).json({ success: true, analysis: toAnalysisResponse(saved) });
});

const listAnalyses = asyncHandler(async (req, res) => {
  const requestedPage = Number(req.query.page);
  const requestedLimit = Number(req.query.limit);
  const page = Number.isInteger(requestedPage) && requestedPage > 0 ? requestedPage : 1;
  const limit = Number.isInteger(requestedLimit) && requestedLimit > 0
    ? Math.min(50, requestedLimit)
    : 10;
  const search = normalizeString(req.query.search, 120);

  const { items, total } = await store.findAnalyses({
    userId: req.user.id,
    page,
    limit,
    search
  });

  res.status(200).json({
    success: true,
    analyses: items.map(toListItem),
    pagination: {
      page,
      pages: Math.max(1, Math.ceil(total / limit)),
      total,
      limit
    }
  });
});

const getAnalysis = asyncHandler(async (req, res) => {
  const analysis = await store.findAnalysisById(req.params.id, req.user.id);
  if (!analysis) throw new AppError('Analysis not found.', 404);
  res.status(200).json({ success: true, analysis: toAnalysisResponse(analysis) });
});

const deleteAnalysis = asyncHandler(async (req, res) => {
  const removed = await store.deleteAnalysis(req.params.id, req.user.id);
  if (!removed) throw new AppError('Analysis not found.', 404);
  res.status(200).json({ success: true, message: 'Analysis deleted successfully.' });
});

const getStats = asyncHandler(async (req, res) => {
  const all = await store.getAllAnalysesForUser(req.user.id);
  const sorted = all.slice().sort((a, b) => String(a.createdAt || '').localeCompare(String(b.createdAt || '')));
  const scores = sorted.map((item) => Number(item.score) || 0);
  const totalAnalyses = sorted.length;
  const cutoff = Date.now() - 30 * 24 * 60 * 60 * 1000;
  const recentCount = sorted.filter((item) => {
    const time = Date.parse(item.createdAt);
    return Number.isFinite(time) && time >= cutoff;
  }).length;

  const trend = sorted.slice(-8).map((item) => ({
    date: item.createdAt || new Date(0).toISOString(),
    score: Number(item.score) || 0,
    jobTitle: item.jobTitle || ''
  }));

  const scoreDelta = scores.length < 2
    ? 0
    : scores[scores.length - 1] - scores[scores.length - 2];

  res.status(200).json({
    success: true,
    stats: {
      totalAnalyses,
      averageScore: totalAnalyses ? Math.round(scores.reduce((sum, score) => sum + score, 0) / totalAnalyses) : 0,
      highestScore: totalAnalyses ? Math.max(...scores) : 0,
      recentCount,
      trend,
      scoreDelta
    }
  });
});

module.exports = { createAnalysis, listAnalyses, getAnalysis, deleteAnalysis, getStats };
