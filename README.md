# AI Study Assistant

AI Study Assistant is a full-stack web app that helps students learn from lecture slides.

Students can:
- upload PDF lecture slides,
- ask AI questions about those slides,
- highlight slide text and ask focused questions,
- generate study materials (summary, cheat sheet, quiz).

## What This Project Does

1. **Upload PDFs** using a web UI.
2. **Extract text** from each PDF page.
3. **Chunk and store** extracted text for retrieval.
4. **Answer questions** using retrieved slide content with citations.
5. **Use highlighted text** as high-priority context for targeted Q&A.
6. **Generate study resources** from selected documents.

## Tech Stack

- **Framework:** Next.js (App Router) + TypeScript
- **Frontend + Backend:** same project (single codebase)
- **PDF Parsing:** `pdf-parse`
- **AI Provider:** OpenAI (`chat.completions`)
- **Validation:** `zod`
- **Auth:** Custom email/password auth + DB sessions
- **Database:** PostgreSQL (RDS-ready) + Prisma ORM
- **File Storage:** private AWS S3 objects (scoped per uploading user)
- **API Base URL:** frontend routes through configurable `NEXT_PUBLIC_API_BASE_URL` for easy backend extraction

## Project Structure

```text
src/
  app/
    api/
      auth/signup/route.ts      # Create account
      auth/signin/route.ts      # Email/password sign in
      auth/signout/route.ts     # Clear session
      auth/me/route.ts          # Current user
      upload/route.ts          # Upload PDF, extract + persist parsed content
      documents/route.ts       # List uploaded docs (+ optional parsed pages)
      ask/route.ts             # Slide-based Q&A
      ask-highlight/route.ts   # Highlight-based Q&A
      resources/route.ts       # Summary + cheat sheet + quiz generation
    layout.tsx
    page.tsx
    globals.css
    signin/page.tsx
    signup/page.tsx
  components/
    dashboard/                 # Multi-step dashboard workflow UI
  types/
    index.ts                   # Shared DTOs/types
backend/
  src/
    auth/
      index.ts                 # Session helpers + current user helper
    db/
      prisma.ts                # Prisma singleton client
    repositories/
      documentRepository.ts    # DB + file persistence abstraction
    services/
      aiService.ts             # OpenAI orchestration
      pdfService.ts            # PDF extraction + chunking
      retrievalService.ts      # Retrieval scoring (MVP lexical)
      resourceService.ts       # Corpus/id helpers
prisma/
  schema.prisma               # Auth + app data models
```

## Quick Start

### 1) Install dependencies

```bash
npm install
```

### 2) Configure environment

Create `.env.local`:

```bash
cp .env.example .env.local
```

Set required values:

```env
OPENAI_API_KEY=your_openai_api_key
OPENAI_MODEL=gpt-4o-mini
DATABASE_URL=postgresql://USER:PASSWORD@HOST:5432/DB
APP_BASE_URL=http://localhost:3000
NEXT_PUBLIC_API_BASE_URL=http://localhost:3000
DB_HOST=ai-assistant-db.cf0qi480o6ux.ap-southeast-1.rds.amazonaws.com
DB_PORT=5432
DB_NAME=postgres
DB_USER=waiyanminmin
DB_PASSWORD=...
DB_SSL_CA_PATH=/certs/global-bundle.pem
AWS_REGION=ap-southeast-1
S3_BUCKET_NAME=your-private-bucket-name
# Optional if not using IAM role credentials
AWS_ACCESS_KEY_ID=...
AWS_SECRET_ACCESS_KEY=...
```

You can verify RDS connectivity with the direct `pg` client:

```bash
npm run db:check
```

### 3) Prepare database schema

```bash
npx prisma generate
npx prisma migrate dev -n init
```

### 4) Run the app

```bash
npm run dev
```

Open `http://localhost:3000`.

## How to Use

1. Sign up with full name, email, password, and confirm password.
2. Sign in with email and password.
3. Upload one or more lecture PDFs.
4. Select the uploaded documents.
5. Ask a question in the Q&A section.
6. Highlight text directly in PDF viewer and ask a focused question.
7. Generate summary, cheat sheet, and quiz.

## API Endpoints

- `POST /api/auth/signup`
  - `{ fullName, email, password, confirmPassword }`
- `POST /api/auth/signin`
  - `{ email, password }`
- `POST /api/auth/signout`
  - clears session cookie
- `GET /api/auth/me`
  - returns current signed-in user
- `POST /api/upload`
  - multipart form data with `file` (PDF)
- `GET /api/documents`
  - list document metadata
- `GET /api/documents?includePages=true`
  - include parsed page text for highlight mode
- `POST /api/ask`
  - `{ question, documentIds }`
- `POST /api/ask-highlight`
  - `{ question, highlightText, documentIds }`
- `POST /api/resources`
  - `{ documentIds }`

## Data Storage

- Uploaded files are stored in private S3 (`s3://bucket/users/{userId}/documents/{docId}/...`)
- Metadata is stored in PostgreSQL via Prisma:
  - users, sessions
  - documents, pages, chunks

## File Access Security

- Every document is linked to its owner via `userId`.
- File access (`GET /api/documents/:id/file`) checks the signed-in user and only serves files the user owns.
- Even with S3 storage, the bucket remains private and files are served through authorized backend routes.

## Current Limitations (MVP)

- Retrieval uses lexical overlap scoring (not embeddings yet).
- Highlight capture uses selected PDF text, not coordinate-level annotations yet.

## Next Improvements

- Add embedding-based retrieval (pgvector/Pinecone/Weaviate).
- Add real PDF viewer annotations with coordinates.
- Add authentication and per-user document isolation.
- Persist generated study resources in DB.
