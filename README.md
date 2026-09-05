# Career Connect

The Career Connect marketplace MVP for ReferralWorld Careers — a
full-stack, database-backed build of the product described in the
[PRD](docs/PRD.md): verified professionals list paid career-help services
(consultation calls, resume reviews, mock interviews, mentorship, referral
assistance), job seekers browse and filter them, and an admin verifies
every creator before they go public.

**New here? Read in this order:**

1. **[docs/RUNNING_THE_MVP.md](docs/RUNNING_THE_MVP.md)** — get it running and see the whole thing work, in under 10 minutes.
2. **[docs/ARCHITECTURE.md](docs/ARCHITECTURE.md)** — diagrams of how the pieces fit together and how data flows.
3. **[docs/PRODUCT_AND_SERVICES.md](docs/PRODUCT_AND_SERVICES.md)** — every PRD feature, explained and mapped to the code that implements it.

---

## Repository layout

```text
career-connect/
├── frontend/    React 19 + Vite + Tailwind — the marketplace UI
├── backend/     Express 5 + SQLite — the REST API and database
└── docs/        PRD, architecture, API contract, database schema, product mapping
```

Each half has its own README with implementation detail:
[backend/README.md](backend/README.md) ·
[frontend/README.md](frontend/README.md)

## Quick start

Two terminals — the frontend is a pure client and needs the backend running
to show any data.

```bash
# terminal 1 — backend
cd backend
npm install
npm run setup     # creates the SQLite db and seeds 10 demo creators
npm run dev         # http://localhost:3000

# terminal 2 — frontend
cd frontend
npm install
npm run dev          # http://localhost:5173
```

Open **http://localhost:5173**. Full walkthrough, including how to approve a
new creator application (there's no admin UI in this MVP — that step uses
curl), is in [docs/RUNNING_THE_MVP.md](docs/RUNNING_THE_MVP.md).

## Documentation index

| Doc | What's in it |
|---|---|
| [docs/PRD.md](docs/PRD.md) | The original product requirements document this build follows |
| [docs/RUNNING_THE_MVP.md](docs/RUNNING_THE_MVP.md) | Full-stack setup + a scripted demo of the entire product, browser and all |
| [docs/RUNNING_WITHOUT_FRONTEND.md](docs/RUNNING_WITHOUT_FRONTEND.md) | Exercise the backend entirely via curl — no UI needed |
| [docs/ARCHITECTURE.md](docs/ARCHITECTURE.md) | System diagram, backend/frontend layer breakdown, sequence diagrams for both core flows, ER diagram |
| [docs/PRODUCT_AND_SERVICES.md](docs/PRODUCT_AND_SERVICES.md) | Every PRD requirement — roles, service categories, per-service rules, admin workflow, what's stubbed and why — mapped to actual endpoints and components |
| [docs/API.md](docs/API.md) | Full REST contract: every endpoint, auth requirement, request/response shape |
| [docs/DATABASE.md](docs/DATABASE.md) | Schema, relationships, status lifecycle |
| [docs/DECISIONS.md](docs/DECISIONS.md) | Why SQLite, why no ORM, why no payments, and other deliberate MVP calls |
| [backend/README.md](backend/README.md) | Backend setup, env vars, folder-by-folder guide, security measures, test coverage |
| [frontend/README.md](frontend/README.md) | Frontend setup, the API integration layer, design tokens, project structure |

## Current status

- Public marketplace (browse/filter/search/profile) — **wired to the live backend**
- Creator application (profile + services) — **wired to the live backend**
- Admin verification — **backend complete and tested; no frontend UI** (drive it via `docs/RUNNING_WITHOUT_FRONTEND.md`)
- "Request this service" — backend endpoint exists; frontend shows a placeholder toast (matches the PRD's no-payments/no-booking-system non-goal)

See [docs/PRODUCT_AND_SERVICES.md § What's a stub, and why](docs/PRODUCT_AND_SERVICES.md#whats-a-stub-and-why-prd-non-goals)
for the complete list.
