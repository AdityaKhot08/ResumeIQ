/**
 * services/skillsData.js
 * Curated, deterministic skill dictionary used by the matching engine. Each
 * skill has a canonical name, a category and common aliases. Helper functions
 * build case-insensitive, word-boundary-aware lookup maps from this data.
 */

const CATEGORIES = Object.freeze({
  LANGUAGES: 'Programming Languages',
  FRAMEWORKS: 'Frameworks & Libraries',
  DATABASES: 'Databases',
  CLOUD: 'Cloud & DevOps',
  DATA: 'Data & Analytics',
  DESIGN: 'Design',
  TESTING: 'Testing',
  SOFT: 'Soft Skills',
  BUSINESS: 'Business',
  SECURITY: 'Security',
  MOBILE: 'Mobile',
  OTHER: 'Other'
});

/** Categories treated as "core" technical requirements for importance ranking. */
const CORE_CATEGORIES = new Set([
  CATEGORIES.LANGUAGES,
  CATEGORIES.FRAMEWORKS,
  CATEGORIES.DATABASES
]);

const SKILLS = [
  // ---------------------------------------------------------------- Languages
  { name: 'JavaScript', category: CATEGORIES.LANGUAGES, aliases: ['ecmascript', 'es6'] },
  { name: 'TypeScript', category: CATEGORIES.LANGUAGES, aliases: [] },
  { name: 'Python', category: CATEGORIES.LANGUAGES, aliases: [] },
  { name: 'Java', category: CATEGORIES.LANGUAGES, aliases: ['java se', 'java ee'] },
  { name: 'C++', category: CATEGORIES.LANGUAGES, aliases: ['cpp', 'c plus plus'] },
  { name: 'C#', category: CATEGORIES.LANGUAGES, aliases: ['csharp', 'c sharp'] },
  { name: 'C', category: CATEGORIES.LANGUAGES, aliases: ['c language', 'c programming'] },
  { name: 'Ruby', category: CATEGORIES.LANGUAGES, aliases: [] },
  { name: 'PHP', category: CATEGORIES.LANGUAGES, aliases: [] },
  { name: 'Go', category: CATEGORIES.LANGUAGES, aliases: ['golang', 'go language'] },
  { name: 'Rust', category: CATEGORIES.LANGUAGES, aliases: [] },
  { name: 'Swift', category: CATEGORIES.LANGUAGES, aliases: [] },
  { name: 'Kotlin', category: CATEGORIES.LANGUAGES, aliases: [] },
  { name: 'Scala', category: CATEGORIES.LANGUAGES, aliases: [] },
  { name: 'R', category: CATEGORIES.LANGUAGES, aliases: ['r language', 'r programming'] },
  { name: 'MATLAB', category: CATEGORIES.LANGUAGES, aliases: [] },
  { name: 'SQL', category: CATEGORIES.LANGUAGES, aliases: ['structured query language'] },
  { name: 'Bash', category: CATEGORIES.LANGUAGES, aliases: ['bash shell', 'shell scripting', 'shell script'] },

  // -------------------------------------------------------- Frameworks / libs
  { name: 'React', category: CATEGORIES.FRAMEWORKS, aliases: ['react.js', 'reactjs', 'react js'] },
  { name: 'Angular', category: CATEGORIES.FRAMEWORKS, aliases: ['angularjs', 'angular 2'] },
  { name: 'Vue.js', category: CATEGORIES.FRAMEWORKS, aliases: ['vue', 'vuejs'] },
  { name: 'Next.js', category: CATEGORIES.FRAMEWORKS, aliases: ['nextjs', 'next js'] },
  { name: 'Node.js', category: CATEGORIES.FRAMEWORKS, aliases: ['node', 'nodejs', 'node js'] },
  { name: 'Express.js', category: CATEGORIES.FRAMEWORKS, aliases: ['express', 'expressjs', 'express js'] },
  { name: 'Django', category: CATEGORIES.FRAMEWORKS, aliases: [] },
  { name: 'Flask', category: CATEGORIES.FRAMEWORKS, aliases: [] },
  { name: 'FastAPI', category: CATEGORIES.FRAMEWORKS, aliases: ['fast api'] },
  { name: 'Spring Boot', category: CATEGORIES.FRAMEWORKS, aliases: ['spring', 'spring framework'] },
  { name: 'Hibernate', category: CATEGORIES.FRAMEWORKS, aliases: [] },
  { name: 'Laravel', category: CATEGORIES.FRAMEWORKS, aliases: [] },
  { name: 'Ruby on Rails', category: CATEGORIES.FRAMEWORKS, aliases: ['rails'] },
  { name: 'ASP.NET', category: CATEGORIES.FRAMEWORKS, aliases: ['asp.net core', 'dotnet', '.net'] },
  { name: 'jQuery', category: CATEGORIES.FRAMEWORKS, aliases: [] },
  { name: 'Bootstrap', category: CATEGORIES.FRAMEWORKS, aliases: [] },
  { name: 'Tailwind CSS', category: CATEGORIES.FRAMEWORKS, aliases: ['tailwind'] },
  { name: 'Redux', category: CATEGORIES.FRAMEWORKS, aliases: [] },
  { name: 'GraphQL', category: CATEGORIES.FRAMEWORKS, aliases: [] },
  { name: 'NestJS', category: CATEGORIES.FRAMEWORKS, aliases: ['nest js'] },
  { name: 'Electron', category: CATEGORIES.FRAMEWORKS, aliases: [] },
  { name: 'Svelte', category: CATEGORIES.FRAMEWORKS, aliases: [] },
  { name: 'Three.js', category: CATEGORIES.FRAMEWORKS, aliases: ['threejs', 'three js'] },

  // --------------------------------------------------------------- Databases
  { name: 'MongoDB', category: CATEGORIES.DATABASES, aliases: ['mongo'] },
  { name: 'MySQL', category: CATEGORIES.DATABASES, aliases: [] },
  { name: 'PostgreSQL', category: CATEGORIES.DATABASES, aliases: ['postgres'] },
  { name: 'SQLite', category: CATEGORIES.DATABASES, aliases: [] },
  { name: 'Oracle', category: CATEGORIES.DATABASES, aliases: ['oracle db', 'oracle database'] },
  { name: 'SQL Server', category: CATEGORIES.DATABASES, aliases: ['mssql', 'microsoft sql server'] },
  { name: 'Redis', category: CATEGORIES.DATABASES, aliases: [] },
  { name: 'Cassandra', category: CATEGORIES.DATABASES, aliases: ['apache cassandra'] },
  { name: 'DynamoDB', category: CATEGORIES.DATABASES, aliases: ['dynamo db'] },
  { name: 'Firebase', category: CATEGORIES.DATABASES, aliases: [] },
  { name: 'Elasticsearch', category: CATEGORIES.DATABASES, aliases: ['elastic search'] },
  { name: 'CouchDB', category: CATEGORIES.DATABASES, aliases: [] },
  { name: 'Neo4j', category: CATEGORIES.DATABASES, aliases: [] },
  { name: 'Snowflake', category: CATEGORIES.DATABASES, aliases: [] },
  { name: 'BigQuery', category: CATEGORIES.DATABASES, aliases: ['big query'] },

  // ------------------------------------------------------------ Cloud / DevOps
  { name: 'AWS', category: CATEGORIES.CLOUD, aliases: ['amazon web services'] },
  { name: 'Azure', category: CATEGORIES.CLOUD, aliases: ['microsoft azure'] },
  { name: 'GCP', category: CATEGORIES.CLOUD, aliases: ['google cloud', 'google cloud platform'] },
  { name: 'Docker', category: CATEGORIES.CLOUD, aliases: [] },
  { name: 'Kubernetes', category: CATEGORIES.CLOUD, aliases: ['k8s'] },
  { name: 'Terraform', category: CATEGORIES.CLOUD, aliases: [] },
  { name: 'Ansible', category: CATEGORIES.CLOUD, aliases: [] },
  { name: 'Jenkins', category: CATEGORIES.CLOUD, aliases: [] },
  { name: 'GitHub Actions', category: CATEGORIES.CLOUD, aliases: ['github actions'] },
  { name: 'GitLab CI', category: CATEGORIES.CLOUD, aliases: ['gitlab ci/cd'] },
  { name: 'CI/CD', category: CATEGORIES.CLOUD, aliases: ['ci cd', 'continuous integration', 'continuous delivery'] },
  { name: 'Linux', category: CATEGORIES.CLOUD, aliases: [] },
  { name: 'Nginx', category: CATEGORIES.CLOUD, aliases: [] },
  { name: 'Apache', category: CATEGORIES.CLOUD, aliases: ['apache server'] },
  { name: 'Heroku', category: CATEGORIES.CLOUD, aliases: [] },
  { name: 'Netlify', category: CATEGORIES.CLOUD, aliases: [] },
  { name: 'Vercel', category: CATEGORIES.CLOUD, aliases: [] },
  { name: 'AWS Lambda', category: CATEGORIES.CLOUD, aliases: ['lambda'] },
  { name: 'S3', category: CATEGORIES.CLOUD, aliases: ['amazon s3'] },
  { name: 'EC2', category: CATEGORIES.CLOUD, aliases: ['amazon ec2'] },
  { name: 'Git', category: CATEGORIES.CLOUD, aliases: ['github', 'version control'] },
  { name: 'Microservices', category: CATEGORIES.CLOUD, aliases: ['micro service architecture'] },

  // --------------------------------------------------------- Data & analytics
  { name: 'Pandas', category: CATEGORIES.DATA, aliases: [] },
  { name: 'NumPy', category: CATEGORIES.DATA, aliases: ['numpy'] },
  { name: 'TensorFlow', category: CATEGORIES.DATA, aliases: [] },
  { name: 'PyTorch', category: CATEGORIES.DATA, aliases: [] },
  { name: 'Keras', category: CATEGORIES.DATA, aliases: [] },
  { name: 'Scikit-learn', category: CATEGORIES.DATA, aliases: ['sklearn', 'scikit learn'] },
  { name: 'Matplotlib', category: CATEGORIES.DATA, aliases: [] },
  { name: 'Seaborn', category: CATEGORIES.DATA, aliases: [] },
  { name: 'Tableau', category: CATEGORIES.DATA, aliases: [] },
  { name: 'Power BI', category: CATEGORIES.DATA, aliases: ['powerbi', 'power bi desktop'] },
  { name: 'Excel', category: CATEGORIES.DATA, aliases: ['microsoft excel', 'ms excel', 'ms excel'] },
  { name: 'Spark', category: CATEGORIES.DATA, aliases: ['apache spark', 'pyspark'] },
  { name: 'Hadoop', category: CATEGORIES.DATA, aliases: ['apache hadoop'] },
  { name: 'Kafka', category: CATEGORIES.DATA, aliases: ['apache kafka'] },
  { name: 'Airflow', category: CATEGORIES.DATA, aliases: ['apache airflow'] },
  { name: 'Machine Learning', category: CATEGORIES.DATA, aliases: [] },
  { name: 'NLP', category: CATEGORIES.DATA, aliases: ['natural language processing'] },
  { name: 'Deep Learning', category: CATEGORIES.DATA, aliases: [] },

  // ------------------------------------------------------------------ Design
  { name: 'Figma', category: CATEGORIES.DESIGN, aliases: [] },
  { name: 'Photoshop', category: CATEGORIES.DESIGN, aliases: ['adobe photoshop'] },
  { name: 'Illustrator', category: CATEGORIES.DESIGN, aliases: ['adobe illustrator'] },
  { name: 'Sketch', category: CATEGORIES.DESIGN, aliases: ['sketch app'] },
  { name: 'Adobe XD', category: CATEGORIES.DESIGN, aliases: ['xd'] },
  { name: 'UI/UX Design', category: CATEGORIES.DESIGN, aliases: ['ui design', 'ux design', 'user experience design'] },
  { name: 'Wireframing', category: CATEGORIES.DESIGN, aliases: ['wireframe'] },
  { name: 'Prototyping', category: CATEGORIES.DESIGN, aliases: ['prototype'] },
  { name: 'CSS', category: CATEGORIES.DESIGN, aliases: ['css3'] },
  { name: 'HTML', category: CATEGORIES.DESIGN, aliases: ['html5'] },
  { name: 'Sass', category: CATEGORIES.DESIGN, aliases: ['scss'] },
  { name: 'Responsive Design', category: CATEGORIES.DESIGN, aliases: ['responsive web design'] },

  // ----------------------------------------------------------------- Testing
  { name: 'Jest', category: CATEGORIES.TESTING, aliases: [] },
  { name: 'Mocha', category: CATEGORIES.TESTING, aliases: [] },
  { name: 'Chai', category: CATEGORIES.TESTING, aliases: [] },
  { name: 'Cypress', category: CATEGORIES.TESTING, aliases: [] },
  { name: 'Selenium', category: CATEGORIES.TESTING, aliases: [] },
  { name: 'Playwright', category: CATEGORIES.TESTING, aliases: [] },
  { name: 'JUnit', category: CATEGORIES.TESTING, aliases: [] },
  { name: 'PyTest', category: CATEGORIES.TESTING, aliases: ['pytest'] },
  { name: 'Postman', category: CATEGORIES.TESTING, aliases: [] },
  { name: 'TDD', category: CATEGORIES.TESTING, aliases: ['test driven development'] },
  { name: 'JMeter', category: CATEGORIES.TESTING, aliases: ['apache jmeter'] },

  // -------------------------------------------------------------- Soft skills
  { name: 'Communication', category: CATEGORIES.SOFT, aliases: ['communication skills'] },
  { name: 'Teamwork', category: CATEGORIES.SOFT, aliases: ['collaboration', 'team player'] },
  { name: 'Leadership', category: CATEGORIES.SOFT, aliases: ['leading teams'] },
  { name: 'Problem Solving', category: CATEGORIES.SOFT, aliases: ['problem-solving'] },
  { name: 'Critical Thinking', category: CATEGORIES.SOFT, aliases: [] },
  { name: 'Time Management', category: CATEGORIES.SOFT, aliases: [] },
  { name: 'Adaptability', category: CATEGORIES.SOFT, aliases: ['adaptable'] },
  { name: 'Creativity', category: CATEGORIES.SOFT, aliases: ['creative thinking'] },
  { name: 'Mentoring', category: CATEGORIES.SOFT, aliases: ['mentoring junior engineers', 'coaching'] },
  { name: 'Presentation', category: CATEGORIES.SOFT, aliases: ['presentation skills'] },
  { name: 'Interpersonal Skills', category: CATEGORIES.SOFT, aliases: ['interpersonal'] },
  { name: 'Attention to Detail', category: CATEGORIES.SOFT, aliases: ['detail oriented'] },
  { name: 'Emotional Intelligence', category: CATEGORIES.SOFT, aliases: [] },
  { name: 'Conflict Resolution', category: CATEGORIES.SOFT, aliases: [] },
  { name: 'Decision Making', category: CATEGORIES.SOFT, aliases: [] },
  { name: 'Negotiation', category: CATEGORIES.SOFT, aliases: [] },
  { name: 'Public Speaking', category: CATEGORIES.SOFT, aliases: [] },

  // ----------------------------------------------------------------- Business
  { name: 'Agile', category: CATEGORIES.BUSINESS, aliases: ['agile methodology'] },
  { name: 'Scrum', category: CATEGORIES.BUSINESS, aliases: ['scrum master'] },
  { name: 'Kanban', category: CATEGORIES.BUSINESS, aliases: [] },
  { name: 'Product Management', category: CATEGORIES.BUSINESS, aliases: ['product manager'] },
  { name: 'Project Management', category: CATEGORIES.BUSINESS, aliases: ['project manager'] },
  { name: 'Business Analysis', category: CATEGORIES.BUSINESS, aliases: ['business analyst'] },
  { name: 'Requirements Gathering', category: CATEGORIES.BUSINESS, aliases: ['requirements analysis'] },
  { name: 'Market Research', category: CATEGORIES.BUSINESS, aliases: [] },
  { name: 'SEO', category: CATEGORIES.BUSINESS, aliases: ['search engine optimization'] },
  { name: 'Digital Marketing', category: CATEGORIES.BUSINESS, aliases: [] },
  { name: 'CRM', category: CATEGORIES.BUSINESS, aliases: ['customer relationship management', 'salesforce crm'] },
  { name: 'Stakeholder Management', category: CATEGORIES.BUSINESS, aliases: ['stakeholder engagement'] },

  // ----------------------------------------------------------------- Security
  { name: 'Cybersecurity', category: CATEGORIES.SECURITY, aliases: ['cyber security', 'information security'] },
  { name: 'OAuth', category: CATEGORIES.SECURITY, aliases: ['oauth2', 'oauth 2.0'] },
  { name: 'JWT', category: CATEGORIES.SECURITY, aliases: ['json web token', 'json web tokens'] },
  { name: 'SSL/TLS', category: CATEGORIES.SECURITY, aliases: ['ssl', 'tls', 'https'] },
  { name: 'Penetration Testing', category: CATEGORIES.SECURITY, aliases: ['pen testing'] },
  { name: 'Encryption', category: CATEGORIES.SECURITY, aliases: ['cryptography'] },
  { name: 'Network Security', category: CATEGORIES.SECURITY, aliases: [] },
  { name: 'IAM', category: CATEGORIES.SECURITY, aliases: ['identity and access management'] },
  { name: 'OWASP', category: CATEGORIES.SECURITY, aliases: ['owasp top 10'] },
  { name: 'GDPR', category: CATEGORIES.SECURITY, aliases: [] },

  // ------------------------------------------------------------------- Mobile
  { name: 'iOS', category: CATEGORIES.MOBILE, aliases: ['ios development', 'iphone'] },
  { name: 'Android', category: CATEGORIES.MOBILE, aliases: ['android development'] },
  { name: 'React Native', category: CATEGORIES.MOBILE, aliases: ['react-native'] },
  { name: 'Flutter', category: CATEGORIES.MOBILE, aliases: [] },
  { name: 'SwiftUI', category: CATEGORIES.MOBILE, aliases: ['swift ui'] },
  { name: 'Expo', category: CATEGORIES.MOBILE, aliases: ['expo js'] },
  { name: 'Xamarin', category: CATEGORIES.MOBILE, aliases: [] },
  { name: 'Cordova', category: CATEGORIES.MOBILE, aliases: ['apache cordova'] },
  { name: 'Mobile Development', category: CATEGORIES.MOBILE, aliases: ['mobile app development'] },

  // -------------------------------------------------------------------- Other
  { name: 'REST APIs', category: CATEGORIES.OTHER, aliases: ['rest api', 'restful api', 'restful services', 'rest api'] },
  { name: 'Webpack', category: CATEGORIES.OTHER, aliases: [] },
  { name: 'Vite', category: CATEGORIES.OTHER, aliases: ['vitejs'] },
  { name: 'Babel', category: CATEGORIES.OTHER, aliases: [] },
  { name: 'npm', category: CATEGORIES.OTHER, aliases: ['node package manager'] },
  { name: 'WordPress', category: CATEGORIES.OTHER, aliases: [] },
  { name: 'Salesforce', category: CATEGORIES.OTHER, aliases: [] },
  { name: 'Blockchain', category: CATEGORIES.OTHER, aliases: ['web3'] },
  { name: 'IoT', category: CATEGORIES.OTHER, aliases: ['internet of things'] },
  { name: 'Type Safety', category: CATEGORIES.OTHER, aliases: ['type safe'] }
];

/** Escape characters that have special meaning in a regular expression. */
function escapeRegex(text) {
  return String(text).replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

/** Map canonical skill name -> array of lowercase aliases (including name). */
function buildAliasMap(skills = SKILLS) {
  const map = new Map();
  for (const skill of skills) {
    const aliases = Array.from(
      new Set(
        [skill.name, ...(Array.isArray(skill.aliases) ? skill.aliases : [])]
          .map((value) => String(value).trim().toLowerCase())
          .filter(Boolean)
      )
    );
    map.set(skill.name, aliases);
  }
  return map;
}

/**
 * Map canonical skill name -> global RegExp matching any alias with unicode
 * word boundaries (so "java" does not match "javascript").
 */
function buildRegexMap(skills = SKILLS) {
  const map = new Map();
  for (const skill of skills) {
    const aliases = buildAliasMap([skill]).get(skill.name) || [];
    // Longest first: prefer the most specific alias when alternatives overlap.
    aliases.sort((a, b) => b.length - a.length);
    const alternatives = aliases
      .map((alias) => escapeRegex(alias).replace(/\s+/g, '\\s+'))
      .join('|');
    map.set(
      skill.name,
      new RegExp(`(?<![\\p{L}\\p{N}])(?:${alternatives})(?![\\p{L}\\p{N}])`, 'giu')
    );
  }
  return map;
}

const REGEX_MAP = buildRegexMap();
const CATEGORY_BY_NAME = new Map(SKILLS.map((skill) => [skill.name, skill.category]));

/** All canonical names and aliases, lowercased — handy for keyword filtering. */
function buildVocabulary(skills = SKILLS) {
  const words = new Set();
  for (const aliases of buildAliasMap(skills).values()) {
    for (const alias of aliases) {
      for (const token of alias.toLowerCase().split(/[^a-z0-9+#.]+/)) {
        if (token) words.add(token);
      }
    }
  }
  return words;
}

module.exports = {
  SKILLS,
  CATEGORIES,
  CORE_CATEGORIES,
  escapeRegex,
  buildAliasMap,
  buildRegexMap,
  buildVocabulary,
  REGEX_MAP,
  CATEGORY_BY_NAME
};
