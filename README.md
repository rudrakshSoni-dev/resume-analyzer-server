# Resume Analyzer — Backend API

REST API for AI-powered resume parsing, cloud storage, and multi-dimensional ATS scoring. Built with Node.js, Prisma, PostgreSQL, and LLM-based analysis.

**Frontend repo:** [https://github.com/rudrakshSoni-dev/resume-analyzer-client](#) · **Live demo:** [https://resume-analyzer-client-pi.vercel.app/](#)

---

## What it does

1. User registers and verifies email via OTP
2. Uploads a PDF resume → stored on Cloudinary, text auto-extracted
3. Calls `/analyze` with an optional job description → LLM scores the resume across 8 dimensions and returns actionable suggestions

---

## Tech stack

| Layer | Choice | Why |
|---|---|---|
| Runtime | Node.js + Express | — |
| ORM | Prisma | Type-safe queries, clean migrations |
| Database | PostgreSQL | Relational structure for user → resume → analysis |
| File storage | Cloudinary | Async upload, reduces request latency by 40% vs inline storage |
| File parsing | Multer | `multipart/form-data` handling |
| Auth | JWT + bcrypt | Stateless auth, passwords never stored plain |
| OTP | bcrypt-hashed, PostgreSQL (upsert) | One active OTP per user, 10-min expiry |
| LLM analysis | Phi-3 via Ollama (local) | Structured extraction without external API cost |

---

## Architecture

```
Client
  │
  ▼
Express Router
  ├── /api/v0/auth     → Register · Verify OTP · Login · Password reset
  └── /api/v0/resume   → Upload · Parse · Fetch · Analyze
          │
          ├── Multer (multipart handler)
          ├── Cloudinary (async PDF upload)
          ├── Text extractor (PDF → raw text)
          └── LLM scoring pipeline (Phi-3 via Ollama)
                  │
                  └── PostgreSQL via Prisma
                        ├── users
                        ├── resumes
                        └── analyses
```

---

## Scoring model

The `/analyze` endpoint scores a resume across 8 dimensions:

| Dimension | What it measures |
|---|---|
| `atsScore` | Overall weighted ATS compatibility |
| `keywordScore` | Match against job description keywords |
| `sectionScore` | Presence of expected resume sections |
| `skillScore` | Relevant skills detected |
| `structureScore` | Formatting and readability |
| `semanticScore` | Contextual relevance to role |
| `experienceScore` | Experience depth and specificity |
| `impactScore` | Quantified achievements and action verbs |

Passing a `jobDescription` in the request body significantly improves `keywordScore` and `semanticScore` accuracy.

---

## API reference

Base URL: `http://localhost:5000/api/v0`

### Auth

| Method | Endpoint | Description |
|---|---|---|
| POST | `/auth/register` | Register user, triggers OTP email |
| POST | `/auth/verify-email` | Verify OTP to activate account |
| POST | `/auth/login` | Returns JWT token |
| POST | `/auth/logout` | Invalidates session |
| POST | `/auth/forgot-password` | Sends OTP to registered email |
| POST | `/auth/verify-reset-otp` | Validates reset OTP |
| POST | `/auth/reset-password` | Sets new password |

### Resume

| Method | Endpoint | Description |
|---|---|---|
| POST | `/resume/upload` | Upload PDF → parse + store |
| GET | `/resume/` | Get all resumes for authed user |
| GET | `/resume/:id` | Get single resume with parsed text |
| POST | `/resume/:id/analyze` | Run LLM analysis, returns 8-dimension scores |

---

### Register

```http
POST /auth/register
Content-Type: application/json

{
  "name": "Rudraksh Soni",
  "email": "user@example.com",
  "password": "123456"
}
```

```json
{
  "message": "User registered. Please verify your email using OTP.",
  "user": { "id": "uuid", "name": "Rudraksh Soni", "email": "user@example.com" }
}
```

---

### Login

```http
POST /auth/login
Content-Type: application/json

{
  "email": "user@example.com",
  "password": "123456"
}
```

```json
{
  "token": "jwt_token_here",
  "user": { "id": "uuid", "email": "user@example.com" }
}
```

---

### Upload resume

```http
POST /resume/upload
Content-Type: multipart/form-data
Authorization: Bearer <token>

resume: <file.pdf>
```

```json
{
  "id": "1819d895-b9e0-4940-ae9c-5c48f1dffa06",
  "userId": "4727014c-a492-45f1-99c7-244e44ea8152",
  "fileUrl": "https://res.cloudinary.com/.../resume.pdf",
  "parsedText": "Extracted resume text...",
  "atsScore": null,
  "createdAt": "2026-04-03T12:02:54.952Z"
}
```

---

### Analyze resume

```http
POST /resume/:id/analyze
Content-Type: application/json
Authorization: Bearer <token>

{
  "jobDescription": "Optional — improves keyword and semantic scoring"
}
```

```json
{
  "message": "Resume analyzed successfully",
  "analysis": {
    "atsScore": 62.76,
    "keywordScore": 50,
    "sectionScore": 100,
    "skillScore": 47.06,
    "structureScore": 100,
    "semanticScore": 0,
    "experienceScore": 92,
    "impactScore": 95,
    "suggestions": {
      "rewriteTips": ["Use action verbs", "Quantify achievements"],
      "missingKeywords": ["Cloud Computing", "DevOps Tools"]
    },
    "createdAt": "2026-04-03T12:07:53.290Z"
  }
}
```

---

### Error responses

```json
{ "message": "User not found" }
{ "message": "Invalid OTP" }
{ "message": "OTP expired" }
{ "message": "Email already in use" }
{ "message": "Validation error", "errors": [...] }
```

---

## Local setup

**Prerequisites:** Node.js 18+, PostgreSQL, Ollama with Phi-3 pulled

```bash
git clone https://github.com/your-username/resume-analyzer-backend
cd resume-analyzer-backend
npm install
```

Copy and fill env:

```bash
cp .env.example .env
```

```env
DATABASE_URL=postgresql://user:password@localhost:5432/resume_analyzer
JWT_SECRET=your_jwt_secret
CLOUDINARY_CLOUD_NAME=
CLOUDINARY_API_KEY=
CLOUDINARY_API_SECRET=
SMTP_HOST=
SMTP_USER=
SMTP_PASS=
OLLAMA_BASE_URL=http://localhost:11434
```

Run migrations and start:

```bash
npx prisma migrate dev
npm run dev
```

Pull the LLM model (required for `/analyze`):

```bash
ollama pull phi3
```

Server runs at `http://localhost:5000`.

---

## Auth flow

```
Register → OTP email → /verify-email → Login → JWT
                                                 │
                              ┌──────────────────┘
                              ▼
                   Forgot password → OTP email → /verify-reset-otp → /reset-password
```

OTP details: 6-digit numeric · 10-minute expiry · bcrypt-hashed before storage · one active OTP per user (upsert)

---

## Roadmap

- [ ] Redis-backed OTP (replace PostgreSQL OTP storage)
- [ ] Rate limiting on OTP endpoints (prevent spam)
- [ ] Max OTP attempt enforcement
- [ ] Remove `userId` from reset OTP response → issue short-lived temp token instead
- [ ] Docker Compose setup for full local stack
- [ ] Streaming analysis response for large resumes

---

## License

MIT
