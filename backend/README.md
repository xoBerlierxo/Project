# Career Connect Backend

Express + SQLite backend for the Career Connect marketplace MVP (see the
[product PRD](../Claude_Career_Connect_MVP_Master_Prompt.md) for full
requirements). This document covers setup, environment configuration, and a
complete walkthrough of how the backend is put together.

For running the whole thing end-to-end without a frontend at all — via curl,
Postman, or a browser — see **[RUNNING_WITHOUT_FRONTEND.md](../docs/RUNNING_WITHOUT_FRONTEND.md)**.

For the full REST contract, see **[docs/API.md](../docs/API.md)**.

---

## Table of contents

1. [Quick start](#quick-start)
2. [Prerequisites](#prerequisites)
3. [Environment variables](#environment-variables)
4. [Demo admin account](#demo-admin-account)
5. [NPM scripts](#npm-scripts)
6. [Architecture overview](#architecture-overview)
7. [Request lifecycle](#request-lifecycle)
8. [Folder-by-folder guide](#folder-by-folder-guide)
9. [Data model](#data-model)
10. [Authentication & authorization model](#authentication--authorization-model)
11. [Creator status lifecycle](#creator-status-lifecycle)
12. [Validation rules](#validation-rules)
13. [Security measures](#security-measures)
14. [Tests](#tests)
15. [Troubleshooting](#troubleshooting)

---

## Quick start

```bash
cd backend
npm install
cp .env.example .env   # defaults work for local dev, no edits needed
npm run setup           # creates the SQLite db, tables, and demo data
npm run dev              # starts the API on http://localhost:3000
```

Verify it's alive:

```bash
curl http://localhost:3000/api/health
```

## Prerequisites

- Node.js 22+ (developed against Node 22 LTS; Node 24 also fine)
- npm
- No database server, Docker, or external service required — SQLite is a
  single file on disk.

## Environment variables

Copied from `.env.example` into `.env` (gitignored — never commit real
secrets):

| Variable | Default | Purpose |
|---|---|---|
| `PORT` | `3000` | Server port |
| `FRONTEND_URL` | `http://localhost:5173` | Allowed CORS origin |
| `JWT_SECRET` | `development-secret-change-me` | JWT signing secret — **change for anything beyond local demo** |
| `JWT_EXPIRES_IN` | `7d` | Token lifetime |
| `ADMIN_EMAIL` | `admin@example.com` | Seeded demo admin login |
| `ADMIN_PASSWORD` | `admin123` | Seeded demo admin login |

`src/config/env.js` is the single place these are read — nothing else in the
codebase touches `process.env` directly.

## Demo admin account

> **DEVELOPMENT / DEMO ONLY — do not reuse these credentials anywhere real.**

```
email:    admin@example.com
password: admin123
```

Created by `npm run seed` (and thus `npm run setup`) from `ADMIN_EMAIL` /
`ADMIN_PASSWORD`. Login via `POST /api/auth/login` to get a bearer token for
`/api/admin/*` routes.

## NPM scripts

| Script | What it does |
|---|---|
| `npm run setup` | Creates all tables (if missing) and **replaces** all data with the demo seed set. Safe to re-run any time to reset the demo to a known state. |
| `npm run seed` | Same seeding step on its own, without re-running schema creation. |
| `npm run dev` | Starts the server with `node --watch` (auto-restart on file changes). |
| `npm start` | Starts the server without watch mode. |
| `npm test` | Runs the automated test suite (`node --test`) against isolated throwaway databases. |

---

## Architecture overview

The backend follows one simple, linear flow for every request — no
repository-pattern frameworks, dependency injection, or generic CRUD
abstractions:

```text
HTTP Request
     │
     ▼
Express Router          (src/routes/*.js)       — maps method+path to a controller,
     │                                             attaches auth/rate-limit middleware
     ▼
Controller               (src/controllers/*.js)  — reads req, calls one service
     │                                             function, shapes the response
     ▼
Service                  (src/services/*.js)     — the actual business logic and
     │                                             SQL queries (via better-sqlite3)
     ▼
SQLite                   (database/career-connect.db)
     │
     ▼
JSON Response             { success, data } or { success: false, error }
```

Everything is synchronous — `better-sqlite3` executes queries
synchronously, so there's no async/await noise in the data layer, and no
race conditions to reason about within a single request.

### Design principles actually followed in this codebase

- **One table = one concern.** No JSON blobs standing in for relational data;
  services and availability slots are real rows with real foreign keys.
- **The database is the source of truth for visibility.** Whether a creator
  is public is decided by a `WHERE status = 'APPROVED'` clause in SQL, not by
  a flag the frontend chooses to check.
- **Services own their business rules.** Controllers never touch `db`
  directly — only `src/services/*.js` and `src/db/*.js` do.
- **Validation happens before any query runs**, in `src/utils/validators.js`,
  and throws a typed `ApiError` that the error-handling middleware turns into
  a consistent JSON error response.

---

## Request lifecycle

Walking through one real example — a job seeker filtering the marketplace:

```text
GET /api/career-connect/creators?category=MOCK_INTERVIEW
```

1. `src/app.js` — Express matches `/api` → `src/routes/public.js`.
2. `src/routes/public.js` — maps `GET /career-connect/creators` to
   `publicController.listCreators`. No auth middleware (public route).
3. `src/controllers/publicController.js` — reads `req.query.category`, calls
   `creatorService.listPublicCreators({ category })`.
4. `src/services/creatorService.js` —
   - Queries `creator_profiles WHERE status = 'APPROVED'`.
   - For each row, loads its active services (`creator_services WHERE
     active = 1`) and each service's availability slots.
   - Formats each row into a public "creator card" shape (no email, no
     internal ids beyond the public creator id).
   - If a `category` was given, filters the formatted list down to creators
     who have at least one active service in that category.
5. Controller wraps the result in `{ success: true, data: { creators } }`
   via `src/utils/response.js` and sends it.
6. If anything threw (e.g. a malformed request further down the chain), it
   would propagate to `src/middleware/errorHandler.js`, which turns known
   `ApiError`s into their proper status code and hides raw stack traces from
   the client.

A **protected** example — an admin approving a creator:

```text
POST /api/admin/creators/11/approve
Authorization: Bearer <admin JWT>
```

1. `src/routes/admin.js` applies `authenticate` then `requireRole('ADMIN')`
   to every route in the router via `router.use(...)` — so every admin
   endpoint is protected in one place, not repeated per-route.
2. `authenticate` (`src/middleware/auth.js`) verifies the JWT and attaches
   `req.user = { id, email, role }`.
3. `requireRole('ADMIN')` rejects with `403 FORBIDDEN` if `req.user.role !==
   'ADMIN'`.
4. `adminController.approve` calls `adminService.approve(creatorId, req.user.id)`.
5. `adminService.js`:
   - Sets `creator_profiles.status = 'APPROVED'`.
   - Marks the creator's `verifications` row `VERIFIED`, stamping
     `checked_by` / `checked_at`.
   - Inserts an `admin_actions` audit row (`action = 'APPROVE'`).
   - Returns the full creator record.
6. From this point on, `GET /api/career-connect/creators/11` returns this
   creator publicly — no separate "publish" step, no frontend flag to flip.

---

## Folder-by-folder guide

```text
backend/
├── src/
│   ├── app.js                 Express app assembly: middleware, routes, error handler
│   ├── server.js              Starts the HTTP listener (the only file that calls .listen)
│   │
│   ├── config/
│   │   └── env.js              Reads process.env once; everything else imports this
│   │
│   ├── db/
│   │   ├── connection.js       Opens the better-sqlite3 connection (WAL mode, FKs on)
│   │   ├── schema.js           CREATE TABLE / CREATE INDEX statements
│   │   ├── setup.js            npm run setup — schema + seed in one step
│   │   └── seed.js             npm run seed — demo data (creators, services, admin)
│   │
│   ├── routes/                 Express routers: URL + HTTP method → controller function.
│   │   ├── health.js            Also where auth/rate-limit middleware gets attached.
│   │   ├── public.js
│   │   ├── creators.js
│   │   ├── admin.js
│   │   └── auth.js
│   │
│   ├── controllers/            Thin request/response glue — no SQL, no business rules.
│   │   ├── publicController.js
│   │   ├── creatorController.js
│   │   ├── adminController.js
│   │   ├── authController.js
│   │   └── serviceRequestController.js
│   │
│   ├── services/               All business logic and SQL queries live here.
│   │   ├── creatorService.js    Public marketplace reads + creator-owned writes
│   │   ├── adminService.js      Status transitions + audit logging
│   │   ├── adminFormat.js       Shared row-formatting helpers for admin views
│   │   ├── authService.js       Login + creator-user provisioning on apply
│   │   └── serviceRequestService.js
│   │
│   ├── middleware/
│   │   ├── auth.js              JWT verification + role gate
│   │   ├── errorHandler.js      Central error → JSON response translation
│   │   ├── rateLimit.js         In-memory per-IP fixed-window limiter
│   │   └── upload.js            multer config for creator photo uploads
│   │
│   └── utils/
│       ├── response.js          ok()/fail() helpers + the ApiError class
│       ├── validators.js        Field-level validation, thrown as ApiError
│       ├── sanitize.js          Strips HTML/script tags from free-text input
│       └── auth.js              JWT sign/verify helpers
│
├── database/                   career-connect.db lives here (gitignored)
├── uploads/                    Uploaded creator photos (gitignored)
├── tests/                      node:test suite (see Tests section below)
├── .env.example
└── package.json
```

**Rule of thumb for where new code goes:** if it talks to the database, it
belongs in `src/services/`. If it just reads `req` and shapes a response, it
belongs in `src/controllers/`. Routers never contain logic beyond wiring
middleware to a controller.

---

## Data model

Full column-by-column reference: [docs/DATABASE.md](../docs/DATABASE.md).

```text
users ──1:1──▶ creator_profiles ──1:N──▶ creator_services ──1:N──▶ availability_slots
                       │                         │
                       ├──1:1──▶ verifications    └──1:N──▶ service_requests
                       │
                       └──1:N──▶ admin_actions
```

Key tables:

- **`users`** — `SEEKER` / `CREATOR` / `ADMIN` roles, bcrypt password hashes.
- **`creator_profiles`** — one row per creator application; `status` drives
  public visibility.
- **`creator_services`** — a creator can list any number of services, each
  with its **own** price, duration, category, and meeting/delivery mode.
- **`availability_slots`** — belongs to a *service*, not a creator, because
  the PRD requires per-service schedules (e.g. Consultation on Wednesday
  evenings, Mock Interviews on Saturday mornings).
- **`verifications`** — the admin's private review record; notes here are
  never returned by any public endpoint.
- **`admin_actions`** — an append-only audit log of every approve / reject /
  request-changes / unpublish action.
- **`service_requests`** — a minimal "I'm interested" record created when a
  seeker hits the public service CTA; no payment or booking logic.

---

## Authentication & authorization model

- Passwords are hashed with **bcrypt**; sessions are stateless **JWTs**
  signed with `JWT_SECRET`.
- Three roles: `SEEKER`, `CREATOR`, `ADMIN`. Seekers never need an account
  for MVP browsing — only creators and admins authenticate.
- **Creators get a token automatically on `POST /api/creators/apply`.**
  There's no separate signup step: applying finds-or-creates a `CREATOR`
  user for that email and returns a bearer token in the same response, so
  the frontend can immediately add services to the just-created profile.
- **Admin login** is the only endpoint that requires a password:
  `POST /api/auth/login`.
- `src/middleware/auth.js` exposes two pieces:
  - `authenticate` — verifies the `Authorization: Bearer <token>` header and
    attaches `req.user`.
  - `requireRole('ADMIN')` — used on the whole `/api/admin` router via
    `router.use(...)`, so no individual admin route can accidentally be left
    unprotected.
- **Ownership, not just role, is checked for creator writes.**
  `creatorService.assertCreatorOwnership(creatorId, userId)` runs before any
  profile or service mutation — a creator can never edit another creator's
  profile even though both are role `CREATOR`. Covered by
  `tests/creator.test.js`.
- **Creators cannot set their own verification status.** The `status` field
  is simply not in `UPDATABLE_PROFILE_FIELDS` in `creatorService.js` — even
  if a client sends `status: "APPROVED"` in a `PUT /api/creators/:id` body,
  it's silently ignored.

---

## Creator status lifecycle

```text
DRAFT ──▶ PENDING_VERIFICATION ──▶ APPROVED ──▶ UNPUBLISHED
                  │        ▲
                  ▼        │
          CHANGES_REQUIRED─┘
                  │
                  ▼
              REJECTED
```

Only `APPROVED` is ever returned by `GET /api/career-connect/creators` or
`GET /api/career-connect/creators/:id` — enforced by a `WHERE status =
'APPROVED'` clause in `creatorService.js`, not by anything the frontend has
to remember to check. Every transition out of `PENDING_VERIFICATION` is
admin-only and writes an `admin_actions` row.

---

## Validation rules

Enforced server-side in `src/utils/validators.js` before any database write:

- Email format, LinkedIn URL format (must look like a `linkedin.com` link).
- `years_experience` between 0–60.
- If `current_status = WORKING`, `company` and `job_title` are required.
- `price` must be a non-negative number; `duration_minutes` (when present)
  must be positive.
- `category` must be one of the six PRD categories.
- **The meeting/delivery consistency rule**, straight from the PRD:
  - `meeting_required = true` → `availability` (array of weekday/start/end)
    is required.
  - `meeting_required = false` → `delivery_time` is required instead, and
    availability is ignored.

Free-text fields (`name`, `company`, `job_title`, `description`, service
`name`/`description`/`delivery_time`) are passed through
`src/utils/sanitize.js`, which strips `<script>` tags and any HTML markup
before it's stored — defense in depth on top of the frontend's own escaping.

---

## Security measures

- **Passwords never leave the server** — API responses never include
  `password_hash`.
- **Verification notes/evidence are private** — only `GET
  /api/admin/creators/:id` (admin-only) returns the `verification` object;
  public endpoints never include it.
- **Admin endpoints require both a valid token and the `ADMIN` role.**
- **Creators can only modify their own profile/services** (ownership check,
  not just authentication).
- **File uploads are restricted**: `multer` only accepts
  `image/jpeg|png|webp`, capped at 2MB (`src/middleware/upload.js`); invalid
  uploads return `400 VALIDATION_ERROR`, not a raw multer stack trace.
- **Rate limiting** on the two endpoints most likely to be abused:
  `POST /api/creators/apply` (10/hour/IP) and `POST /api/auth/login`
  (20/15min/IP) — see `src/middleware/rateLimit.js`.
- **CORS is locked to `FRONTEND_URL`**, not `*`.
- **No stack traces reach the client.** `src/middleware/errorHandler.js`
  catches everything; unexpected errors are logged server-side and returned
  as a generic `500 INTERNAL_ERROR`.

---

## Tests

```bash
npm test
```

Runs Node's built-in test runner (`node --test tests/*.test.js`). Each test
file gets its own throwaway SQLite file (via `DB_PATH` override in
`tests/helpers.js`) and its own in-process Express server on a random port —
**your dev database (`database/career-connect.db`) is never touched.**

| File | Covers |
|---|---|
| `tests/marketplace.test.js` | Only `APPROVED` creators are public; pending/rejected/unpublished are hidden; category filtering; 404 on unknown/non-public creator id. |
| `tests/creator.test.js` | Required-field validation; application → `PENDING_VERIFICATION`; multiple services keep independent price/duration; the meeting↔availability/delivery consistency rule; a creator cannot edit another creator's profile. |
| `tests/admin.test.js` | Non-admins are rejected from `/api/admin/*`; approve/reject/request-changes/unpublish each produce the correct status and public-visibility effect; admin actions are auditable via `GET /api/admin/creators/:id`. |

---

## Troubleshooting

- **`FOREIGN KEY constraint failed` during setup**: delete
  `database/career-connect.db*` and re-run `npm run setup`.
- **Port already in use**: another process is on 3000; change `PORT` in `.env`.
- **CORS errors from the frontend**: confirm `FRONTEND_URL` in `.env` matches
  your frontend dev server's origin exactly (including port).
- **Uploaded photos not showing**: they're served from `/uploads/<file>`
  (static route) — confirm the frontend is prefixing with the backend base URL.
- **Want to poke at the API before any frontend exists?** See
  [docs/RUNNING_WITHOUT_FRONTEND.md](../docs/RUNNING_WITHOUT_FRONTEND.md).
