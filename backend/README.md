# Career Connect Backend

Express + SQLite backend for the Career Connect marketplace MVP.

## Prerequisites

- Node.js 22+ (developed against Node 22 LTS; Node 24 also fine)
- npm

## Installation

```bash
npm install
cp .env.example .env   # adjust if needed; defaults work for local dev
```

## Setup (creates DB, tables, and demo seed data)

```bash
npm run setup
```

Re-run any time to reset back to the seeded demo state (safe to run
repeatedly — it clears and re-inserts all data).

To reseed without recreating the schema:

```bash
npm run seed
```

## Development server

```bash
npm run dev
```

Runs on **http://localhost:3000** with `node --watch` (auto-restarts on file changes).

Production-style start (no watch):

```bash
npm start
```

## Environment variables

| Variable | Default | Purpose |
|---|---|---|
| `PORT` | `3000` | Server port |
| `FRONTEND_URL` | `http://localhost:5173` | Allowed CORS origin |
| `JWT_SECRET` | `development-secret-change-me` | JWT signing secret — **change for anything beyond local demo** |
| `JWT_EXPIRES_IN` | `7d` | Token lifetime |
| `ADMIN_EMAIL` | `admin@example.com` | Seeded demo admin login |
| `ADMIN_PASSWORD` | `admin123` | Seeded demo admin login |

## Demo admin account

> **DEVELOPMENT / DEMO ONLY — do not reuse these credentials anywhere real.**

```
email:    admin@example.com
password: admin123
```

Login: `POST /api/auth/login` with `{ "email": ..., "password": ... }` returns
a bearer token to use on `/api/admin/*` routes.

## API base URL

`http://localhost:3000/api` — full contract in [`../docs/API.md`](../docs/API.md).

## Tests

```bash
npm test
```

Runs the Node built-in test runner (`node --test`) against an isolated,
throwaway SQLite file per test file — it never touches your dev database.
Covers: public marketplace visibility rules, creator application/service
validation, and the full admin verification workflow.

## Troubleshooting

- **`FOREIGN KEY constraint failed` during setup**: delete
  `database/career-connect.db*` and re-run `npm run setup`.
- **Port already in use**: another process is on 3000; change `PORT` in `.env`.
- **CORS errors from the frontend**: confirm `FRONTEND_URL` in `.env` matches
  your frontend dev server's origin exactly (including port).
- **Uploaded photos not showing**: they're served from `/uploads/<file>`
  (static route) — confirm the frontend is prefixing with the backend base URL.
