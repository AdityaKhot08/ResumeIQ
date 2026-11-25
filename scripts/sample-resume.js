/**
 * Generates a realistic sample resume PDF used by the smoke test and demos.
 * Run directly with: node scripts/sample-resume.js [output-path]
 */
const fs = require('fs');
const path = require('path');
const { PDFDocument, StandardFonts, rgb } = require('pdf-lib');

const RESUME_TEXT = `JANE DOE
Senior Software Engineer
jane.doe@example.com | (415) 555-0198 | San Francisco, CA
linkedin.com/in/janedoe | github.com/janedoe

PROFESSIONAL SUMMARY
Software engineer with 8 years of experience building scalable web applications with JavaScript, TypeScript, React and Node.js. Strong background in cloud infrastructure, AWS, Docker and CI/CD. Passionate about clean code, mentoring and delivering measurable business impact.

TECHNICAL SKILLS
Languages: JavaScript, TypeScript, Python, Java, SQL, HTML, CSS
Frameworks: React, Node.js, Express, Next.js, Django, Tailwind CSS
Databases: MongoDB, PostgreSQL, Redis
Cloud & DevOps: AWS, Docker, Kubernetes, Git, CI/CD, Terraform
Testing: Jest, Cypress, Unit Testing
Tools: Agile, Scrum, Jira, Figma

PROFESSIONAL EXPERIENCE
Senior Software Engineer | Acme Technologies | 2020 - Present
- Led a team of 5 engineers building React and Node.js services used by 2M+ customers.
- Migrated monolith to microservices on AWS with Docker and Kubernetes, reducing deploy time by 65%.
- Improved API performance by 40% through query optimization and Redis caching.
- Implemented CI/CD pipelines with GitHub Actions and increased test coverage to 85%.

Software Engineer | Bright Labs | 2017 - 2020
- Developed responsive web applications using JavaScript, React and Django.
- Designed REST APIs with PostgreSQL and MongoDB supporting 100k daily active users.
- Collaborated with product managers in an Agile/Scrum environment and shipped 12 releases.
- Built data dashboards with Python and Tableau for executive reporting.

EDUCATION
B.S. Computer Science | University of California, Berkeley | 2013 - 2017
Relevant coursework: Data Structures, Algorithms, Database Systems, Software Engineering

CERTIFICATIONS
AWS Certified Solutions Architect - Associate
Certified Kubernetes Application Developer

PROJECTS
Open-source component library with 3k GitHub stars using TypeScript and React.
Internal analytics platform processing 10M events per day with Python and PostgreSQL.

ACHIEVEMENTS
Employee of the Year 2022. Speaker at regional JavaScript conference. Published 4 technical articles.`;

async function generateResumePdf(outputPath) {
  const pdf = await PDFDocument.create();
  const font = await pdf.embedFont(StandardFonts.Helvetica);
  const bold = await pdf.embedFont(StandardFonts.HelveticaBold);
  const pageWidth = 612;
  const pageHeight = 792;
  const margin = 48;
  let page = pdf.addPage([pageWidth, pageHeight]);
  let y = pageHeight - margin;

  for (const rawLine of RESUME_TEXT.split('\n')) {
    const line = rawLine.trimEnd();
    if (y < margin + 20) {
      page = pdf.addPage([pageWidth, pageHeight]);
      y = pageHeight - margin;
    }
    const isHeading = /^[A-Z][A-Z &/-]{4,}$/.test(line) && line === line.toUpperCase();
    const size = isHeading ? 10.5 : 9.5;
    const textFont = isHeading ? bold : font;
    const text = line.length > 110 ? `${line.slice(0, 107)}...` : line;
    page.drawText(text, {
      x: margin,
      y,
      size,
      font: textFont,
      color: rgb(0.12, 0.14, 0.18),
    });
    y -= size + (isHeading ? 6 : 3.2);
  }

  const bytes = await pdf.save();
  if (outputPath) {
    fs.mkdirSync(path.dirname(path.resolve(outputPath)), { recursive: true });
    fs.writeFileSync(outputPath, bytes);
  }
  return Buffer.from(bytes);
}

module.exports = { generateResumePdf, RESUME_TEXT };

if (require.main === module) {
  const out = process.argv[2] || path.join(__dirname, 'sample-resume.pdf');
  generateResumePdf(out)
    .then(() => console.log(`Wrote sample resume to ${out}`))
    .catch((err) => {
      console.error(err);
      process.exit(1);
    });
}
