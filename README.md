# Synapsis — NSS Management System

A web platform for running a college **National Service Scheme (NSS)** unit: events, volunteer attendance and hours, grace marks, certificates, real-time event chat, alumni mentorship and donations.

- **Frontend:** Next.js 16 (App Router), React 19, Tailwind CSS 4, MUI
- **Backend:** Node 20, Express 5, MongoDB (Mongoose 8), Socket.IO
- **Integrations:** Cloudinary (uploads), Stripe (donations), Groq (AI insights), Google OAuth, Nodemailer (OTP)

## Roles

| Role | What they do |
|---|---|
| **Superadmin / Admin** | Create institutions, approve coordinators, teachers, students and alumni, view platform stats |
| **Coordinator** | Create and run events, assign teachers and volunteers, recommend grace marks, generate reports, manage donations |
| **Teacher** | Mark attendance, assign and approve grace marks, upload event photos, export attendance PDFs |
| **Volunteer / Student** | Join events, track hours and levels (Bronze to Platinum), download certificates, chat, request mentorship |
| **Alumni** | Mentor students, donate to events, post testimonials |

## Quick start

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

Only `MONGODB_URL` and `JWT_SECRET` are required. The server exits at startup if either is missing. Optional integrations turn off the matching feature when their keys are absent, and the server still starts. The full list is in [backend/.env.example](backend/.env.example) and [client/.env.example](client/.env.example).

## Testing

```bash
cd backend
npm test
```

These are integration tests (Node's built-in `node:test`, Supertest and an in-memory MongoDB). No database or API keys are needed. They cover:

- authentication and role checks on every sensitive route
- event ownership: coordinators and teachers can only manage their own events
- donation integrity: amounts come from Stripe, and replayed payments are ignored
- grace-mark rules: approvals count once, rejections never count
- chat and mentorship socket permissions
- NoSQL-injection and input validation

GitHub Actions ([.github/workflows/ci.yml](.github/workflows/ci.yml)) runs the tests and a production frontend build on every push and pull request.

## Project structure

```
backend/
  app.js               Express app: middleware, routes, error handling
  server.js            Startup: database connection, Socket.IO, graceful shutdown
  configs/             env validation, DB, Google OAuth
  controllers/         Route handlers
  middleware/          auth (protect/authorize), validation, sanitization, rate limits, uploads
  models/              Mongoose schemas
  routes/              Express routers, one per role or area
  sockets/             Event chat + mentorship chat (authenticated, membership-checked)
  utils/               eventAccess (ownership rules), Stripe, Cloudinary, AI client
  scripts/seed.js      Demo data
  tests/               Integration tests
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
