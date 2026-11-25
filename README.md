<div align="center">

# ResumeIQ

**Resume analysis and job matching, made simple.**

Upload a PDF resume, paste a job description, and get a clear compatibility score with matched skills, missing skills, keyword gaps, and actionable improvement suggestions — all in one clean dashboard.

[![Node.js](https://img.shields.io/badge/Node.js-22-339933?logo=node.js&logoColor=white)](https://nodejs.org)
[![React](https://img.shields.io/badge/React-18-61DAFB?logo=react&logoColor=white)](https://react.dev)
[![Express](https://img.shields.io/badge/Express-4-000000?logo=express&logoColor=white)](https://expressjs.com)
[![MongoDB](https://img.shields.io/badge/MongoDB-8-47A248?logo=mongodb&logoColor=white)](https://mongodb.com)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind-3-06B6D4?logo=tailwindcss&logoColor=white)](https://tailwindcss.com)

</div>

---

## Table of contents

- [Overview](#overview)
- [Features](#features)
- [Tech stack](#tech-stack)
- [Quick start](#quick-start)
- [Configuration](#configuration)
- [Project structure](#project-structure)
- [API reference](#api-reference)
- [How the analysis works](#how-the-analysis-works)
- [Verification](#verification)
- [Roadmap](#roadmap)

---

## Overview

Job seekers often have the right experience but fail to present it in a way that matches a specific role. Manually comparing a resume against every job description is slow and subjective.

ResumeIQ automates that comparison. It extracts text from an uploaded resume, identifies skills and keywords in both documents, computes a transparent compatibility score, and turns the gaps into a prioritized action list. Every analysis is saved to the user's dashboard so progress can be tracked over time.

The project is a complete full-stack application with JWT authentication, role-safe data access, PDF handling, persistent analysis history, and a polished, responsive interface.

> **Zero-config development:** MongoDB is optional. If no `MONGODB_URI` is provided, the API automatically persists data to a local JSON file (`server/.data/db.json`), so the whole app works immediately after `npm install`.

## Features

### Authentication
- Registration and login with bcrypt password hashing and JWT tokens
- Protected API routes and client-side route guards
- Profile management and session restoration on page reload

### Resume & job description analysis
- PDF upload with drag-and-drop, strict file-type and size validation
- Text extraction using `pdf-parse`
- Skill detection across 11 categories with alias-aware matching
- Job-description keyword extraction with stopword filtering
- Weighted compatibility score (0–100) with letter grade and verdict
- Five-metric breakdown: skill match, keyword match, section completeness, formatting, and experience
- Matched, missing, and extra skills with importance ranking
- Section-by-section checklist with tailored tips
- 5–10 prioritized, actionable improvement suggestions
- Save, revisit, search, and delete past analyses
- Dashboard statistics and a score trend chart

### Experience
- Marketing landing page, split-screen auth flows, and a full application shell
- Responsive sidebar layout with mobile drawer
- Loading skeletons, empty states, confirm modals, and toast notifications
- Print-friendly results view for saving reports as PDF

## Tech stack

| Layer | Technologies |
| --- | --- |
| Frontend | React 18, Vite 6, React Router 6, Tailwind CSS 3, Axios, Lucide icons, Recharts |
| Backend | Node.js, Express 4, REST APIs, JWT, bcryptjs, Multer, pdf-parse, express-validator |
| Database | MongoDB 8 + Mongoose (primary), local JSON file store (fallback) |
| Tooling | concurrently, Nodemon, npm |

## Quick start

**Prerequisites:** Node.js 20+ (22 recommended) and npm 9+.

```bash
# 1. Install everything (root tooling, API, and web client)
npm run install:all

# 2. Start the API and the web app together
npm run dev
```

- Web app: <http://localhost:5173>
- API: <http://localhost:5000/api>
- Health check: <http://localhost:5000/api/health>

Create an account at `/register`, then go to **Analyze Resume**, upload a PDF, and paste a job description. Results are saved automatically and appear in **Analysis History**.

To use MongoDB instead of the local file store, set `MONGODB_URI` in `server/.env` before starting the API — no other changes are needed.

### Production-style run

```bash
npm run build          # builds client/dist
npm start              # serves the API (set NODE_ENV=production and configure a static host for the client)
```

## Configuration

Root scripts:

| Script | Description |
| --- | --- |
| `npm run install:all` | Install root, server, and client dependencies |
| `npm run dev` | Run API and client concurrently with hot reload |
| `npm run dev:api` / `npm run dev:web` | Run one side only |
| `npm run build` | Production build of the client |
| `npm start` | Start the API in production mode |
| `npm run smoke` | End-to-end API smoke test (server must be running) |

Environment variables (`server/.env`, see `server/.env.example`):

| Variable | Default | Purpose |
| --- | --- | --- |
| `PORT` | `5000` | API port |
| `JWT_SECRET` | development fallback | Token signing secret — **set a strong value in production** |
| `JWT_EXPIRES` | `7d` | Token lifetime |
| `CLIENT_URL` | `http://localhost:5173` | Allowed CORS origin |
| `MONGODB_URI` | _(unset)_ | MongoDB connection string; unset selects the file store |
| `MAX_FILE_SIZE_MB` | `10` | Upload size limit |

Client environment (`client/.env`, see `client/.env.example`):

| Variable | Default | Purpose |
| --- | --- | --- |
| `VITE_API_URL` | `http://localhost:5000/api` | API base URL |

## Project structure

```
ResumeIQ/
├── client/                     # Vite + React + Tailwind SPA
│   └── src/
│       ├── api/                 # Axios instance and endpoint helpers
│       ├── context/             # Auth and toast providers
│       ├── components/
│       │   ├── ui/              # Buttons, inputs, cards, score ring, etc.
│       │   ├── layout/          # Public and dashboard shells
│       │   └── analysis/        # Results panels
│       └── pages/               # Landing, auth, dashboard, analyze, results, history, profile
├── server/                     # Express REST API
│   └── src/
│       ├── config/              # Environment and database setup
│       ├── storage/             # Mongoose + JSON-file adapters behind one API
│       ├── middleware/          # Auth, upload, validation, rate limiting
│       ├── controllers/         # Request handlers
│       ├── routes/              # Route definitions
│       ├── services/            # PDF extraction and the matching engine
│       └── utils/               # Errors, JWT, password helpers
├── scripts/                    # Smoke test and sample PDF generator
└── package.json                # Root scripts for the whole workspace
```

## API reference

All endpoints are prefixed with `/api`. Authenticated endpoints expect `Authorization: Bearer <token>`.

| Method | Endpoint | Auth | Description |
| --- | --- | --- | --- |
| `GET` | `/health` | No | Service status and active storage mode |
| `POST` | `/auth/register` | No | Create an account, returns token + user |
| `POST` | `/auth/login` | No | Log in, returns token + user |
| `GET` | `/auth/me` | Yes | Current user |
| `PUT` | `/auth/profile` | Yes | Update name / email |
| `POST` | `/analyze` | Yes | Upload resume PDF + job description, run analysis |
| `GET` | `/analyses` | Yes | Paginated history with optional `search`, `page`, `limit` |
| `GET` | `/analyses/:id` | Yes | Full analysis (owner-only) |
| `DELETE` | `/analyses/:id` | Yes | Delete an analysis (owner-only) |
| `GET` | `/stats` | Yes | Aggregate stats and score trend |

Responses follow a consistent shape: `{ "success": true, ...data }` or `{ "success": false, "message": "..." }`. Validation failures include an `errors` array of `{ field, message }` objects.

`POST /analyze` is `multipart/form-data`:

| Field | Type | Notes |
| --- | --- | --- |
| `resume` | File | PDF only, max 10 MB by default |
| `jobDescription` | Text | Required, 50–20,000 characters |
| `jobTitle` | Text | Optional |
| `company` | Text | Optional |

## How the analysis works

ResumeIQ uses a transparent, rule-based engine so results are reproducible and explainable:

1. **Extract** — `pdf-parse` reads the PDF into plain text, which is normalized and checked for usable content.
2. **Detect skills** — both texts are scanned against a dictionary of ~150 skills and their aliases using word-boundary-aware matching.
3. **Extract keywords** — frequent, meaningful non-skill terms are pulled from the job description and checked against the resume.
4. **Check structure** — eight common resume sections are detected, along with contact details, quantified achievements, and action verbs.
5. **Score** — a weighted blend produces the overall score:

   `0.45 × skillMatch + 0.18 × keywordMatch + 0.14 × sectionCompleteness + 0.13 × formatting + 0.10 × experience`

6. **Recommend** — missing skills, absent sections, weak formatting, and keyword gaps become a prioritized suggestion list.

Raw resume text is never stored; only file metadata, detected skills, and computed results are saved.

## Verification

With the API running, run the smoke test to exercise registration, login, analysis upload, history, detail, stats, authorization, and deletion:

```bash
npm run smoke
```

The test generates a realistic sample resume PDF automatically using `pdf-lib`, so no manual fixture is needed.

## Roadmap

- AI-powered, context-aware resume feedback
- Section-by-section scoring with inline highlights
- Multiple resume templates and parsing improvements
- Job recommendations based on candidate skills
- Downloadable, branded PDF reports
- Integration with external job platforms

---

Built with the MERN stack as a practical demonstration of full-stack architecture, REST API design, authentication, file handling, and deterministic text analysis.
