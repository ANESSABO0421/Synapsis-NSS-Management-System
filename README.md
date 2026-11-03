# Synapsis — NSS Management System

A web platform for running a college **National Service Scheme (NSS)** unit: events, volunteer attendance and hours, grace marks, certificates, real-time event chat, alumni mentorship and donations.

- **Frontend:** Next.js 16 (App Router), React 19, Tailwind CSS 4, MUI
- **Backend:** Node 20, Express 5, MongoDB (Mongoose 8), Socket.IO
- **Integrations:** Cloudinary (uploads), Stripe (donations), Groq (AI insights), Google OAuth, Nodemailer (OTP)

## NSS features

- **Progress toward the NSS certificate.** Each volunteer sees their hours toward 240 in total and 120 per academic year (June to May), plus whether the special camp is done. Coordinators see every volunteer marked *Completed*, *On track* or *Behind*. The rules live in [backend/configs/nss.js](backend/configs/nss.js).
- **QR check-in and check-out.** Staff show a QR code that changes every 30 seconds and expires after 45. Volunteers scan it on arrival and again when leaving, and are credited for the time they were actually present. Volunteers marked present by hand get the full event duration.
- **Certificates anyone can verify.** Participation certificates go only to volunteers marked present. Completion certificates require meeting the NSS rules. Every PDF has a QR code and a code linking to the public page `/verify/<code>`. Admins and coordinators can revoke a certificate.
- **Annual report.** Totals for an institution and academic year, an events table and top volunteers, downloadable as PDF or CSV (opens in Excel), with an optional AI-written overview.

## Roles

| Role | What they do |
|---|---|
| **Superadmin / Admin** | Create institutions, approve coordinators, teachers, students and alumni, view platform stats |
| **Coordinator** | Create and run events, assign teachers and volunteers, recommend grace marks, generate reports, manage donations |
| **Teacher** | Mark attendance, assign and approve grace marks, upload event photos, export attendance PDFs |
| **Volunteer / Student** | Join events, track hours and levels (Bronze to Platinum), download certificates, chat, request mentorship |
| **Alumni** | Mentor students, donate to events, post testimonials |

## Quick start

### Try it in one minute (no database needed)

```bash
cd backend && npm install && npm run demo      # API on :3000 with an in-memory DB + demo data
cd client  && npm install && npm run dev       # in another terminal, http://localhost:5173
```

Log in with any demo account below. Data is thrown away when the demo stops.

### Full setup

Requirements: Node 20+ and a MongoDB database (local or Atlas).

```bash
# 1. Backend
cd backend
cp .env.example .env        # set MONGODB_URL and JWT_SECRET at minimum
npm install
npm run seed                # optional: demo institution + a user for every role
npm run dev                 # http://localhost:3000

# 2. Frontend (new terminal)
cd client
cp .env.example .env.local  # NEXT_PUBLIC_API_URL=http://localhost:3000
npm install
npm run dev                 # http://localhost:5173
```

### Demo accounts (after `npm run seed`)

All use the password **`Demo@1234`**:

| Email | Role |
|---|---|
| `superadmin@demo.synapsis.test` | Superadmin |
| `admin@demo.synapsis.test` | Admin |
| `coordinator@demo.synapsis.test` | Coordinator |
| `teacher@demo.synapsis.test` | Teacher |
| `volunteer1@demo.synapsis.test` | Volunteer |
| `alumni@demo.synapsis.test` | Alumni |

The seed only creates or replaces records with `@demo.synapsis.test` emails, and it refuses to run when `NODE_ENV=production`.

## Environment variables

Only `MONGODB_URL` and `JWT_SECRET` are required. Set `FRONTEND_URL` in production so QR codes and certificate links point to your live site. The server exits at startup if either is missing. Optional integrations turn off the matching feature when their keys are absent, and the server still starts. The full list is in [backend/.env.example](backend/.env.example) and [client/.env.example](client/.env.example).

## Testing & quality

```bash
cd backend && npm run check     # ESLint + type-check + ~100 integration tests
cd e2e && npm install && npx playwright install chromium && npx playwright test
```

**Backend:** 
integration tests (Node's built-in `node:test`, Supertest and an in-memory MongoDB). No database or API keys are needed. They cover:

- authentication and role checks on every sensitive route
- event ownership: coordinators and teachers can only manage their own events
- donation integrity: amounts come from Stripe, and replayed payments are ignored
- grace-mark rules: approvals count once, rejections never count
- hours and NSS eligibility rules, the QR check-in flow, certificate issuing, verification and revocation, and the annual report
- chat and mentorship socket permissions
- NoSQL-injection and input validation

**End-to-end:** Playwright starts the demo backend and a production build of the frontend. It checks that every page of every role (64) renders without crashes or console errors, and runs the main journeys: the login form, redirect when logged out, QR check-in on a phone-sized screen, and downloading and publicly verifying a certificate.

**Type-checking:** core modules opt in with `// @ts-check` (see [backend/tsconfig.json](backend/tsconfig.json)), the incremental path to TypeScript. To bring an older module under checking, add the header and fix what `npm run typecheck` reports.

GitHub Actions ([.github/workflows/ci.yml](.github/workflows/ci.yml)) runs all of this (lint, types, unit tests, frontend build, E2E) on every push and pull request.

## Observability

- **Logs:** JSON in production (`pino`), readable in development. Each request gets an `X-Request-Id` that also appears in its log line, and credentials are redacted.
- **Errors:** set `SENTRY_DSN` to report server errors (5xx) and socket failures to Sentry.
- **Health:** `GET /health` returns `200` when the database is connected and `503` when it isn't.

## Project structure

```
backend/
  app.js               Express app: middleware, routes, error handling
  server.js            Startup: database connection, Socket.IO, graceful shutdown
  configs/             env validation, DB, Google OAuth
  controllers/         Route handlers; large areas split into coordinator/, teacher/, student/
  middleware/          auth (protect/authorize), validation, sanitization, rate limits, uploads
  models/              Mongoose schemas
  routes/              Express routers, one per role or area
  sockets/             Event chat + mentorship chat (authenticated, membership-checked)
  utils/               eventAccess (ownership rules), Stripe, Cloudinary, AI client
  scripts/seed.js      Demo data
  tests/               Integration tests
  scripts/demo.js      Zero-setup demo / E2E backend
e2e/                   Playwright end-to-end tests
client/src/
  app/                 Next.js routes (one folder per role dashboard)
  features/            Page-level components grouped by role
  components/          Shared UI (sidebars, navbar, ApiSetup)
  context/             SocketProvider + namespace socket hook
  hooks/               useAuthGuard
  utils/               api client (token + session-expiry handling), auth helpers, config
```

## Security model

- JWT bearer tokens. `protect` loads the user and `authorize(...roles)` restricts routes by role. Accounts that are rejected or inactive are blocked even if their token is still valid.
- `requireEventAccess` limits event changes to admins, the event's coordinator, and (where allowed) its assigned teachers.
- Every request is sanitized against MongoDB operator injection. Login and OTP bodies are validated with Zod.
- Login is rate-limited per account and per IP, so students sharing a campus network don't lock each other out. The AI endpoint has its own rate limit.
- Passwords and OTPs are never included in API responses. Uploads are limited to images (and PDFs for verification documents) of at most 5 MB.

## Stripe webhook (optional)

Donations are recorded when the browser confirms the payment. A webhook also records them in case the browser closes before that happens:

```bash
stripe listen --forward-to localhost:3000/api/donations/webhook
# put the printed whsec_... into STRIPE_WEBHOOK_SECRET
```
