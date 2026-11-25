/**
 * services/analysisService.js
 * Deterministic, rule-based resume ↔ job-description matching engine.
 * Produces the score, breakdown, skills, keywords, sections, suggestions and
 * summary consumed by the API and stored with each analysis.
 */
const {
  CATEGORIES,
  CORE_CATEGORIES,
  REGEX_MAP,
  CATEGORY_BY_NAME,
  buildVocabulary
} = require('./skillsData');
const { slugify } = require('../utils/sanitize');

const STOPWORDS = new Set([
  'ability', 'able', 'about', 'above', 'across', 'after', 'again', 'against', 'all', 'also',
  'although', 'always', 'among', 'and', 'another', 'any', 'anyone', 'anything', 'are', 'around',
  'been', 'being', 'below', 'best', 'better', 'between', 'both', 'bring', 'build', 'candidate',
  'career', 'comfortable', 'complete', 'could', 'customer', 'days', 'deployed', 'desired', 'details',
  'did', 'does', 'doing', 'done', 'during', 'excellent', 'facing', 'full', 'hiring', 'ideal',
  'each', 'else', 'etc', 'even', 'every', 'first', 'following', 'for', 'from', 'further', 'great',
  'had', 'has', 'have', 'having', 'here', 'high', 'how', 'however', 'include', 'included',
  'including', 'into', 'its', 'itself', 'job', 'just', 'knowledge', 'level', 'like', 'likely',
  'look', 'looking', 'made', 'make', 'many', 'may', 'more', 'most', 'much', 'must', 'need',
  'needed', 'new', 'not', 'now', 'office', 'once', 'only', 'onto', 'or', 'other', 'others',
  'our', 'out', 'over', 'part', 'people', 'perfect', 'place', 'please', 'plus', 'position',
  'possible', 'preferred', 'previous', 'required', 'requirements', 'responsibilities', 'role',
  'satisfy', 'scale', 'should', 'since', 'skill', 'skills', 'some', 'someone', 'strong', 'such', 'team',
  'than', 'that', 'the', 'their', 'them', 'then', 'there', 'these', 'they', 'this', 'those',
  'through', 'time', 'together', 'too', 'under', 'until', 'up', 'us', 'use', 'used', 'using',
  'usually', 'very', 'want', 'was', 'way', 'we', 'well', 'were', 'what', 'when', 'where',
  'which', 'while', 'who', 'will', 'with', 'within', 'without', 'work', 'working', 'would',
  'year', 'years', 'you', 'your'
]);

const ACTION_VERBS = [
  'achieved', 'built', 'created', 'delivered', 'designed', 'developed', 'drove', 'improved',
  'increased', 'led', 'managed', 'launched', 'optimized', 'reduced', 'implemented',
  'maintained', 'collaborated', 'automated', 'migrated', 'introduced', 'spearheaded',
  'generated', 'expanded', 'streamlined', 'resolved', 'trained', 'mentored', 'coordinated',
  'produced', 'saved'
];

const PRIORITY_RANK = { high: 0, medium: 1, low: 2 };
const SKILL_VOCABULARY = buildVocabulary();

const SECTION_DEFS = [
  {
    name: 'Contact Information',
    patterns: [
      /^\s*(?:contact(?:\s+(?:information|details))?|personal\s+(?:information|details))\s*:?\s*$/im,
      /\b[\w.+-]+@[\w-]+\.[a-z]{2,}\b/i,
      /\+?\d[\d\s().-]{7,}\d/
    ],
    tip: 'Add a dedicated contact section with your email, phone number, city and LinkedIn URL.'
  },
  {
    name: 'Professional Summary',
    patterns: [
      /^\s*(?:professional\s+summary|career\s+summary|executive\s+summary|summary|profile|about\s+me|objective)\s*:?\s*$/im
    ],
    tip: 'Add a 2-3 line Professional Summary that mirrors the target job title and your top strengths.'
  },
  {
    name: 'Work Experience',
    patterns: [
      /^\s*(?:work\s+experience|professional\s+experience|employment\s+history|career\s+history|professional\s+background|experience)\s*:?\s*$/im,
      /\b(?:responsibilities|accomplishments)\b/i
    ],
    tip: 'Include a Work Experience section with job titles, dates and 3-5 impact-focused bullets.'
  },
  {
    name: 'Education',
    patterns: [
      /^\s*(?:education|academic\s+background|academic\s+qualifications|qualifications)\s*:?\s*$/im,
      /\b(?:bachelor|master|doctorate|ph\.?d|degree|university|college)\b/i
    ],
    tip: 'Add your degree, institution and graduation year in an Education section.'
  },
  {
    name: 'Technical Skills',
    patterns: [
      /^\s*(?:technical\s+skills|core\s+competenc(?:y|ies)|technologies|tech\s+stack|tools\s*(?:&|and)\s+technologies|skills)\s*:?\s*$/im
    ],
    tip: 'Group your Technical Skills by category (languages, frameworks, tools) for quick scanning.'
  },
  {
    name: 'Projects',
    patterns: [
      /^\s*(?:projects|personal\s+projects|selected\s+projects|portfolio)\s*:?\s*$/im,
      /\b(?:github\.com|gitlab\.com|portfolio)\b/i
    ],
    tip: 'Add a Projects section with links and a one-line description of the impact of each project.'
  },
  {
    name: 'Certifications',
    patterns: [
      /^\s*(?:certifications?|licenses?\s*(?:&|and)\s*certifications?|credentials)\s*:?\s*$/im,
      /\b(?:certified|certification)\b/i
    ],
    tip: 'List relevant certifications with the issuing organization and year earned.'
  },
  {
    name: 'Achievements',
    patterns: [
      /^\s*(?:achievements?|awards?\s*(?:&|and)\s*achievements?|accomplishments?|honors?)\s*:?\s*$/im,
      /\b(?:awarded|won|ranked|top\s+\d+)\b/i
    ],
    tip: 'Add an Achievements section highlighting awards, rankings or standout results.'
  }
];

function cleanText(value) {
  return String(value == null ? '' : value)
    .replace(/[\u0000-\u0008\u000B\u000C\u000E-\u001F]/g, ' ')
    .trim();
}

function countOccurrences(text, regex) {
  const global = new RegExp(regex.source, regex.flags.includes('g') ? regex.flags : `${regex.flags}g`);
  let count = 0;
  for (const _match of text.matchAll(global)) {
    count += 1;
    if (count >= 50) break;
  }
  return count;
}

function extractSkillCounts(text) {
  const lower = String(text || '').toLowerCase();
  const counts = new Map();
  for (const [name, regex] of REGEX_MAP) {
    const count = countOccurrences(lower, regex);
    if (count > 0) counts.set(name, count);
  }
  return counts;
}

function tokenize(text) {
  return String(text || '')
    .toLowerCase()
    .replace(/[^a-z0-9+#.]+/g, ' ')
    .split(/\s+/)
    .filter(Boolean)
    // Keep internal dots (node.js) but drop sentence-ending punctuation.
    .map((token) => token.replace(/^[.+#]+|[.+#]+$/g, ''))
    .filter(Boolean);
}

function importanceFor(name, count) {
  const category = CATEGORY_BY_NAME.get(name) || CATEGORIES.OTHER;
  if (count >= 2 || CORE_CATEGORIES.has(category)) return 'high';
  if (
    category === CATEGORIES.CLOUD ||
    category === CATEGORIES.DATA ||
    category === CATEGORIES.TESTING ||
    category === CATEGORIES.SECURITY
  ) {
    return 'medium';
  }
  return 'low';
}

function computeKeywords(jobDescription, resumeTokens) {
  const frequency = new Map();
  for (const token of tokenize(jobDescription)) {
    if (
      token.length < 4 ||
      STOPWORDS.has(token) ||
      /^\d+$/.test(token) ||
      SKILL_VOCABULARY.has(token)
    ) {
      continue;
    }
    frequency.set(token, (frequency.get(token) || 0) + 1);
  }

  const candidates = Array.from(frequency.entries())
    .sort((a, b) => b[1] - a[1] || a[0].localeCompare(b[0]))
    .slice(0, 25)
    .map(([word]) => word);

  const matchedAll = candidates.filter((word) => resumeTokens.has(word));
  const missingAll = candidates.filter((word) => !resumeTokens.has(word));
  const keywordMatch = candidates.length
    ? Math.round((100 * matchedAll.length) / candidates.length)
    : 100;

  return {
    keywords: { matched: matchedAll.slice(0, 8), missing: missingAll.slice(0, 8) },
    keywordMatch,
    missingAll
  };
}

function computeSections(resumeText, skillCount) {
  const sections = SECTION_DEFS.map((definition) => {
    const present = definition.patterns.some((pattern) => pattern.test(resumeText)) ||
      (definition.name === 'Technical Skills' && skillCount >= 3);
    return { name: definition.name, present, tip: present ? '' : definition.tip };
  });
  return sections;
}

function maxYears(text) {
  const regex = /(\d{1,2})\s*\+?\s*(?:years?|yrs?)\b/gi;
  let max = 0;
  let match;
  while ((match = regex.exec(text)) !== null) {
    const value = Number(match[1]);
    if (value >= 1 && value <= 50) max = Math.max(max, value);
  }
  return max || null;
}

function computeExperience(resumeText, jobDescription) {
  const resumeYears = maxYears(resumeText);
  const requiredYears = maxYears(jobDescription);

  if (requiredYears && resumeYears) {
    const ratio = resumeYears / requiredYears;
    if (ratio >= 1) return 100;
    if (ratio >= 0.75) return 85;
    if (ratio >= 0.5) return 65;
    return 40;
  }
  if (requiredYears && !resumeYears) return 45;
  if (!requiredYears && resumeYears) return 85;
  // No explicit experience signal in either text — neutral, not a penalty.
  return 60;
}

function computeFormatting(resumeText, sections) {
  const wordCount = resumeText.split(/\s+/).filter(Boolean).length;
  const hasEmail = /\b[\w.+-]+@[\w-]+\.[a-z]{2,}\b/i.test(resumeText);
  const hasPhone = /\+?\d[\d\s().-]{7,}\d/.test(resumeText);
  const hasQuantified = /\d+\s*%|\$\s?\d|\b\d{2,}\b/.test(resumeText);
  const actionVerbRegex = new RegExp(`\\b(?:${ACTION_VERBS.join('|')})\\b`, 'i');
  const hasActionVerbs = actionVerbRegex.test(resumeText);
  const headerHits = sections.filter((section) => section.present).length;

  let formatting = 0;
  if (wordCount >= 250 && wordCount <= 1200) formatting += 25;
  else if (wordCount >= 120 && wordCount <= 1800) formatting += 15;
  else formatting += 5;

  if (hasEmail) formatting += 15;
  if (hasPhone) formatting += 15;
  if (hasQuantified) formatting += 20;
  if (hasActionVerbs) formatting += 10;
  formatting += Math.round((15 * headerHits) / SECTION_DEFS.length);

  return {
    formatting: Math.max(0, Math.min(100, formatting)),
    signals: { wordCount, hasEmail, hasPhone, hasQuantified, hasActionVerbs }
  };
}

function buildSuggestions(context) {
  const {
    score,
    jobTitle,
    missing,
    absentSections,
    wordCount,
    hasEmail,
    hasPhone,
    hasQuantified,
    missingKeywords
  } = context;
  const suggestions = [];
  const usedIds = new Set();

  function add(id, type, priority, title, description) {
    const base = slugify(id);
    let unique = base;
    let suffix = 2;
    while (usedIds.has(unique)) unique = `${base}-${suffix++}`;
    usedIds.add(unique);
    suggestions.push({ id: unique, type, priority, title, description });
  }

  // Strong matches only need a short polish checklist.
  if (score >= 85) {
    add(
      'polish-action-verbs',
      'format',
      'low',
      'Sharpen your bullet points',
      'Lead with action verbs and focus each bullet on an outcome rather than a duty.'
    );
    add(
      'polish-proofread',
      'format',
      'low',
      'Proofread for consistency',
      'Check verb tense, punctuation and spacing so the document reads cleanly.'
    );
    add(
      'polish-length',
      'format',
      'low',
      'Keep the resume focused',
      'Trim older or less relevant details to hold the reader at one to two pages.'
    );
    if (missing.length) {
      const top = missing[0];
      add(
        `polish-${top.name}`,
        'skill',
        'medium',
        `Mention ${top.name} if relevant`,
        `If you have hands-on experience with ${top.name}, add it to your skills and support it with a short example.`
      );
    }
    return suggestions.slice(0, 4);
  }

  for (const skill of missing.filter((item) => item.importance !== 'low').slice(0, 3)) {
    add(
      `skill-${skill.name}`,
      'skill',
      skill.importance === 'high' ? 'high' : 'medium',
      `Add ${skill.name} to your resume`,
      `The job description calls for ${skill.name}. If you have used it, list it under Technical Skills and describe a concrete result.`
    );
  }

  for (const section of absentSections.slice(0, 3)) {
    const critical = ['Contact Information', 'Work Experience', 'Education'].includes(section);
    add(
      `section-${section}`,
      'section',
      critical ? 'high' : 'medium',
      `Add a ${section} section`,
      section === 'Work Experience'
        ? 'Include job titles, dates and 3-5 bullets that show measurable impact.'
        : section === 'Contact Information'
          ? 'Put your email, phone number and LinkedIn profile at the top of the resume.'
          : `Recruiters look for ${section.toLowerCase()} when scanning resumes. Add a short, clearly labelled section.`
    );
  }

  if (!hasQuantified) {
    add(
      'format-quantify',
      'format',
      'high',
      'Quantify your achievements',
      'Add numbers, percentages or dollar figures to show the scale of your impact (for example, "reduced load time by 30%").'
    );
  }
  if (wordCount < 250) {
    add(
      'format-length',
      'format',
      'medium',
      'Add more detail to your resume',
      'Your resume is quite short. Expand each role with 3-5 specific bullets and a short summary.'
    );
  } else if (wordCount > 1200) {
    add(
      'format-length',
      'format',
      'medium',
      'Tighten your resume',
      'Keep the strongest, most recent details and aim for a focused one to two page document.'
    );
  }
  if (!hasEmail || !hasPhone) {
    add(
      'format-contact',
      'format',
      'high',
      'Make contact details easy to find',
      'Place a valid email address and phone number in a clearly labelled header at the top.'
    );
  }
  const hasLinks = /\b(?:github\.com|linkedin\.com|gitlab\.com|portfolio|behance|dribbble)\b/i.test(
    context.resumeText || ''
  );
  if (!hasLinks && !usedIds.has('format-contact')) {
    add(
      'format-links',
      'format',
      'medium',
      'Include a portfolio or GitHub link',
      'Add links to your GitHub, LinkedIn or portfolio so recruiters can verify your work.'
    );
  }
  if (missingKeywords.length) {
    add(
      'keyword-mirror',
      'keyword',
      'medium',
      'Mirror important keywords',
      `Work these terms into your summary and experience where truthful: ${missingKeywords.slice(0, 4).join(', ')}.`
    );
  }
  if (jobTitle) {
    add(
      'tailor-summary',
      'format',
      'medium',
      `Tailor your summary to ${jobTitle}`,
      `Open with a brief summary that names the ${jobTitle} role and your two or three strongest relevant skills.`
    );
  }

  // Guarantee at least five actionable items for weaker matches.
  const fallbackPool = [
    ['experience-examples', 'experience', 'medium', 'Add specific project examples', 'For each key skill, describe one project where you applied it and the result you achieved.'],
    ['format-consistency', 'format', 'low', 'Use consistent formatting', 'Align dates, headings and bullet styles so the resume is easy to scan.'],
    ['keyword-ats', 'keyword', 'low', 'Optimize for applicant tracking systems', 'Use standard section headings and spell out important terms before their abbreviations.'],
    ['section-skills', 'section', 'medium', 'Group your technical skills', 'Organize skills into languages, frameworks, tools and databases to improve readability.']
  ];
  for (const entry of fallbackPool) {
    if (suggestions.length >= 5) break;
    add(...entry);
  }

  return suggestions
    .slice()
    .sort((a, b) => PRIORITY_RANK[a.priority] - PRIORITY_RANK[b.priority])
    .slice(0, 10);
}

function buildSummary({ score, grade, jobTitle, matched, missing, sections }) {
  const role = jobTitle ? ` for the ${jobTitle} role` : '';
  const top = matched.slice(0, 3).map((item) => item.name);
  let gaps = missing.filter((item) => item.importance === 'high').slice(0, 3).map((item) => item.name);
  if (!gaps.length) {
    gaps = missing.filter((item) => item.importance === 'medium').slice(0, 3).map((item) => item.name);
  }
  const missingSections = sections.filter((section) => !section.present).map((section) => section.name);

  let summary = `Your resume scores ${score}/100 (${grade}) against this job description${role}. `;
  if (top.length) {
    summary += `It clearly highlights ${top.join(', ')}, which align well with the role. `;
  } else {
    summary += 'Few directly matching skills were detected in the resume text. ';
  }
  const sectionNote = missingSections.length
    ? `; also consider adding a ${missingSections.slice(0, 2).join(' or ')} section`
    : '';
  if (gaps.length) {
    summary += `The biggest gaps are ${gaps.join(', ')}; adding concrete examples of these would strengthen your application${sectionNote}.`;
  } else {
    summary += `No major skill gaps were found, so focus on sharpening the presentation of your results${sectionNote}.`;
  }
  return summary.trim();
}

/**
 * Main entry point: analyze a resume against a job description.
 * Never throws on short/empty input — it always returns a well-formed result.
 */
function analyzeResume({
  resumeText = '',
  jobDescription = '',
  jobTitle = '',
  company = '',
  pages = 1
} = {}) {
  const resume = cleanText(resumeText);
  const jd = cleanText(jobDescription);
  const lowerResume = resume.toLowerCase();
  const lowerJd = jd.toLowerCase();

  const resumeSkillCounts = extractSkillCounts(lowerResume);
  const jdSkillCounts = extractSkillCounts(lowerJd);
  const requiredNames = Array.from(jdSkillCounts.keys());
  const matchedNames = requiredNames.filter((name) => resumeSkillCounts.has(name));
  const missingNames = requiredNames.filter((name) => !resumeSkillCounts.has(name));

  const matched = matchedNames
    .map((name) => ({ name, category: CATEGORY_BY_NAME.get(name) || CATEGORIES.OTHER }))
    .sort((a, b) => jdSkillCounts.get(b.name) - jdSkillCounts.get(a.name));

  const missing = missingNames
    .map((name) => ({
      name,
      category: CATEGORY_BY_NAME.get(name) || CATEGORIES.OTHER,
      importance: importanceFor(name, jdSkillCounts.get(name))
    }))
    .sort(
      (a, b) =>
        PRIORITY_RANK[a.importance] - PRIORITY_RANK[b.importance] ||
        jdSkillCounts.get(b.name) - jdSkillCounts.get(a.name) ||
        a.name.localeCompare(b.name)
    );

  const extra = Array.from(resumeSkillCounts.keys())
    .filter((name) => !jdSkillCounts.has(name))
    .sort((a, b) => resumeSkillCounts.get(b) - resumeSkillCounts.get(a))
    .slice(0, 12)
    .map((name) => ({ name, category: CATEGORY_BY_NAME.get(name) || CATEGORIES.OTHER }));

  let skillMatch;
  if (requiredNames.length === 0) {
    skillMatch = resumeSkillCounts.size === 0 ? 50 : 100;
  } else {
    skillMatch = Math.round((100 * matchedNames.length) / requiredNames.length);
  }
  skillMatch = Math.max(0, Math.min(100, skillMatch));

  const resumeTokens = new Set(tokenize(resume));
  const { keywords, keywordMatch, missingAll } = computeKeywords(jd, resumeTokens);
  const sections = computeSections(resume, resumeSkillCounts.size);
  const { formatting, signals } = computeFormatting(resume, sections);
  const sectionCompleteness = Math.round(
    (100 * sections.filter((section) => section.present).length) / sections.length
  );
  const experience = computeExperience(resume, jd);

  const breakdown = { skillMatch, keywordMatch, sectionCompleteness, formatting, experience };
  const rawScore =
    0.45 * skillMatch +
    0.18 * keywordMatch +
    0.14 * sectionCompleteness +
    0.13 * formatting +
    0.1 * experience;
  const score = Math.max(0, Math.min(100, Math.round(rawScore)));

  let grade;
  let verdict;
  if (score >= 90) {
    grade = 'A';
    verdict = 'Excellent match';
  } else if (score >= 80) {
    grade = 'B';
    verdict = 'Strong match';
  } else if (score >= 65) {
    grade = 'C';
    verdict = 'Good match with room to improve';
  } else if (score >= 50) {
    grade = 'D';
    verdict = 'Moderate match';
  } else {
    grade = 'F';
    verdict = 'Low match';
  }

  const suggestions = buildSuggestions({
    score,
    jobTitle,
    resumeText: resume,
    missing,
    absentSections: sections.filter((section) => !section.present).map((section) => section.name),
    wordCount: signals.wordCount,
    hasEmail: signals.hasEmail,
    hasPhone: signals.hasPhone,
    hasQuantified: signals.hasQuantified,
    missingKeywords: missingAll
  });

  const summary = buildSummary({ score, grade, jobTitle, matched, missing, sections });

  const parsedPages = Number(pages);
  return {
    score,
    grade,
    verdict,
    skills: {
      matched,
      missing,
      extra,
      coverage: skillMatch
    },
    breakdown,
    keywords,
    sections,
    suggestions,
    summary,
    resumeStats: {
      wordCount: signals.wordCount,
      characterCount: resume.length,
      pages: Number.isFinite(parsedPages) && parsedPages > 0 ? Math.round(parsedPages) : 1
    },
    extractedSkillCount: resumeSkillCounts.size
  };
}

module.exports = { analyzeResume, SECTION_DEFS, STOPWORDS, ACTION_VERBS };
