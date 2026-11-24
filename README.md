# ResumeIQ — Resume Analyzer & Job Matcher

## Overview

ResumeIQ is a full-stack web application designed to help job seekers evaluate and improve their resumes according to specific job requirements.

The platform allows users to upload their resumes in PDF format and compare them with a given job description. It analyses the resume content, extracts relevant skills and keywords, identifies missing skills, and generates a compatibility score to indicate how closely the candidate's profile matches the selected job role.

ResumeIQ aims to make the resume evaluation process more structured and accessible by providing useful insights and actionable recommendations.

## Problem Statement

Many job seekers struggle to understand whether their resumes properly match the requirements of a particular job role. They may have relevant skills and experience but fail to highlight them effectively in their resumes.

Manually comparing a resume with a job description can be time-consuming and difficult, especially when candidates are applying to multiple positions.

ResumeIQ addresses this problem by automating resume analysis and providing a structured comparison between candidate profiles and job requirements.

## Key Features

### 1. User Authentication
- User registration and login.
- Secure password hashing.
- JWT-based authentication.
- Protected routes for authenticated users.

### 2. Resume Upload and Parsing
- Upload resumes in PDF format.
- Extract textual content from uploaded resumes.
- Identify important information such as skills, education, experience, and relevant keywords.

### 3. Job Description Analysis
- Allow users to paste or enter a job description.
- Extract important skills and keywords required for the role.
- Identify technical requirements and relevant qualifications.

### 4. Resume Matching Score
- Compare resume skills and keywords with job requirements.
- Calculate a compatibility score.
- Display matching and missing skills.
- Highlight areas where the resume could better align with the job description.

### 5. Resume Improvement Suggestions
- Recommend skills and keywords that are missing.
- Highlight sections that may need improvement.
- Provide actionable suggestions to make the resume more relevant to the target job.

### 6. User Dashboard
- View previous resume analyses.
- Access saved analysis reports.
- Track different job description comparisons.

## Technology Stack

**Frontend**
- React.js
- Tailwind CSS
- JavaScript
- Axios

**Backend**
- Node.js
- Express.js
- REST APIs
- JWT Authentication
- bcrypt

**Database**
- MongoDB
- Mongoose

**Additional Tools and Libraries**
- PDF parsing library
- Multer for file uploads
- Git and GitHub
- Postman for API testing

## How It Works

1. The user creates an account or logs in.
2. The user uploads a resume in PDF format.
3. ResumeIQ extracts and processes the resume text.
4. The user enters a job description.
5. The backend analyses both documents and compares their skills and keywords.
6. The application generates a compatibility score and identifies missing skills.
7. The results are displayed through an interactive dashboard with improvement suggestions.

## Project Objective

The primary objective of ResumeIQ is to build a practical full-stack application that demonstrates frontend development, backend API design, database management, authentication, file handling, and text-processing capabilities using the MERN stack.

The project will also explore rule-based resume evaluation and job matching techniques that can later be extended with more advanced NLP or AI-based analysis.

## Future Enhancements
- AI-powered resume feedback.
- Multiple resume template support.
- Resume section-wise scoring.
- Job recommendations based on candidate skills.
- Downloadable analysis reports.
- Integration with external job platforms.

## Project Status

Planned / In Development.
