# Daniel AI Studio

An AI-powered website/app builder: describe what you want in plain English,
get back a complete project (files, live preview, an editable code editor),
and keep shaping it with follow-up prompts.

```
daniel-ai-studio/
├── backend/     Express API — the only thing that talks to Groq
├── frontend/    React + Vite + TS + Tailwind PWA
├── firestore.rules
└── storage.rules
```

## How it fits together

- **Frontend** never calls Groq directly. It calls the backend
  (`/api/ai/generate`, `/edit`, `/fix`, `/redesign`) with a Firebase ID
  token; the backend verifies that token, then calls Groq with the server-
  side `GROQ_API_KEY`. The key never reaches the browser.
- **Projects** are stored per-user in Firestore at
  `users/{uid}/projects/{projectId}`, protected by `firestore.rules` so
  users can only read/write their own projects.
- **Live preview** runs entirely in the browser (sandboxed iframe) — no
  server round-trip. HTML/CSS/JS projects get full support. React gets a
  best-effort single-component preview via Babel standalone. Next.js and
  multi-file Vue projects need a real dev server, so the preview says so
  plainly instead of faking it — download the ZIP and run `npm run dev`.

## What's fully implemented

- Email/password + Google auth, password reset, protected routes
- Project generation, chat-driven edits, "Fix Project", "Improve design"
- Monaco editor: tabs, split view, file create/rename/delete, autosave
- File explorer, live preview, ZIP export, project duplicate/rename/delete
- 11 starter templates
- Admin panel (list/suspend users, list/delete projects, basic stats),
  gated by a Firebase custom claim
- Rate limiting, input validation (zod), and a central error handler on
  the backend

## What's intentionally stubbed (and how to finish it)

- **One-click deploy** (`backend/routes/deploy.js`): returns a clear
  "not connected" response. Wiring up real Vercel/Firebase Hosting
  deploys needs OAuth so each user can connect their own account — the
  API calls are sketched in comments in that file.
- **Billing**: `/billing` is a placeholder page. Plug in Stripe or
  Paystack, then use the existing per-user rate limiter as your usage
  meter.
- **GitHub/Figma import, AI image/logo generation, team collaboration,
  version history, plugin marketplace, APK export**: not built. These
  are large features in their own right; the architecture (backend
  routes + Firestore project docs) is set up to add them incrementally.

## Setup

### 1. Firebase project

1. Create a project at console.firebase.google.com.
2. Enable **Authentication** → Email/Password and Google sign-in.
3. Enable **Firestore** and **Storage**.
4. Deploy the security rules:
   ```bash
   firebase deploy --only firestore:rules,storage:rules
   ```
5. Get your web app config (Project settings → General → Your apps) and
   put it in `frontend/.env` (copy from `.env.example`).
6. Generate a service account key (Project settings → Service accounts →
   Generate new private key) and put the JSON (as one line) in
   `backend/.env` as `FIREBASE_SERVICE_ACCOUNT_JSON`.

### 2. Groq API key

Get a key at console.groq.com and put it in `backend/.env` as
`GROQ_API_KEY`. Never put this in the frontend `.env`.

### 3. Run locally

```bash
# Backend
cd backend
cp .env.example .env   # fill in the values above
npm install
npm run dev             # http://localhost:8080

# Frontend (separate terminal)
cd frontend
cp .env.example .env    # fill in Firebase config + VITE_API_BASE_URL
npm install
npm run dev              # http://localhost:5173
```

### 4. Make yourself an admin

```bash
cd backend
node scripts/setAdmin.js you@example.com
```
Sign out and back in — the "Admin" link appears in the sidebar.

### 5. Deploy

- **Backend**: Render, Railway, or Fly.io all work well for a plain
  Express app — set the same env vars from `backend/.env` in their
  dashboard. Point `CLIENT_ORIGIN` at your deployed frontend URL.
- **Frontend**: Vercel or Firebase Hosting. Set `VITE_API_BASE_URL` to
  your deployed backend URL, and the `VITE_FIREBASE_*` values.

## Security notes

- The Groq key lives only on the backend; every AI route requires a
  verified Firebase ID token and is rate-limited per user/IP.
- Admin routes require a Firebase custom claim (`admin: true`), set only
  via the server-side script — never a frontend action.
- Firestore rules scope every project read/write to its owner.
