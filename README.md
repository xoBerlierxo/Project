# ReferralWorld Career Connect MVP

## What this is

A minimal, database-backed MVP of the Career Connect marketplace: verified
professionals list career services (consultation, resume review, mock
interviews, mentorship, referral assistance), job seekers browse/filter and
open profiles, and admins verify creators before they go public.

## Repository

```
/frontend   - owned by the frontend engineer (backend README + API docs only)
/backend    - Express + SQLite backend (this MVP)
/docs       - API, database, and decisions documentation
```

## Ownership

- Frontend: separate frontend engineer (do not touch `/frontend` app code)
- Backend: this MVP backend

## Running the backend

```bash
cd backend
npm install
npm run setup
npm run dev
```

Backend runs at: http://localhost:3000

Health check: `GET /api/health`

## Documentation

- [backend/README.md](backend/README.md) — full backend architecture, setup, and troubleshooting
- [docs/API.md](docs/API.md) — full REST contract
- [docs/DATABASE.md](docs/DATABASE.md) — schema and entity relationships
- [docs/DECISIONS.md](docs/DECISIONS.md) — deliberate MVP design choices
- [docs/RUNNING_WITHOUT_FRONTEND.md](docs/RUNNING_WITHOUT_FRONTEND.md) — exercise the entire backend end-to-end with curl, no frontend needed
