# Running the Complete MVP

This is the single guide for running Career Connect **end to end** — backend
+ frontend together, browsing the real marketplace in a browser, and
demonstrating the full "apply → admin approves → goes live" flow.

Looking for something else?
- Backend only, driven entirely via curl (no UI at all): [RUNNING_WITHOUT_FRONTEND.md](RUNNING_WITHOUT_FRONTEND.md)
- What each piece is and why: [ARCHITECTURE.md](ARCHITECTURE.md)
- What every feature does per the PRD: [PRODUCT_AND_SERVICES.md](PRODUCT_AND_SERVICES.md)

---

## 1. Prerequisites

- Node.js 22+ (Node 24 also fine)
- npm
- No database server, Docker, or account signups needed — SQLite is a file,
  and the demo admin account is seeded automatically.

## 2. Start the backend

```bash
cd backend
npm install
cp .env.example .env      # defaults work for local dev, no edits needed
npm run setup               # creates the SQLite db + seeds 10 demo creators
npm run dev                  # http://localhost:3000
```

Confirm it's alive:

```bash
curl http://localhost:3000/api/health
# {"success":true,"data":{"status":"ok"}}
```

Leave this running in its own terminal.

## 3. Start the frontend

In a **second terminal**:

```bash
cd frontend
npm install
cp .env.example .env      # VITE_API_BASE_URL, defaults match the backend above
npm run dev                  # http://localhost:5173
```

Open **http://localhost:5173** in a browser. You should see the Career
Connect marketplace with 6 verified demo creators, real prices, and working
category filters — all fetched live from the backend you just started.

> If you see "Couldn't load creators" instead: the backend isn't running,
> or `FRONTEND_URL` in `backend/.env` doesn't match the URL Vite printed
> (both default to `5173`, so this only happens if you changed one).

## 4. The demo script

This is the walkthrough that shows the whole product working, end to end.

### 4a. Browse as a job seeker

1. On the homepage, use the search box or the category filter pills
   (Consultation, Resume Review, Mock Interview, etc.) — the grid re-fetches
   from the backend on every category change.
2. Click **View profile** on any creator card. The modal shows every active
   service that creator offers, each with its own price, duration, and
   either a meeting time or a delivery time — never a single shared
   schedule for the whole creator.
3. Click **Request this service** — this shows a confirmation toast. It's an
   intentional stub (see [PRODUCT_AND_SERVICES.md](PRODUCT_AND_SERVICES.md#verified-referral)
   for why booking/payment isn't in this MVP); the backend endpoint it would
   call already exists and works (`POST /api/service-requests`).

### 4b. Apply as a creator

1. Click **Become a Creator** (top right).
2. Fill in the profile step — name, email, LinkedIn URL, current
   company/title (or "Not currently working"), years of experience, and a
   short description.
3. Add one or more services. For a service that requires a meeting, pick a
   weekday and a start/end time. For one that doesn't, give an expected
   delivery time instead (e.g. "Delivered within 48 hours") — the form only
   shows the field that applies.
4. Click **Preview application**, review it, tick the agreement checkbox,
   and click **Submit for verification**.

This is a real submission: it calls `POST /api/creators/apply` and then
`POST /api/creators/:id/services` for each service you added. The new
creator now exists in the database with `status = PENDING_VERIFICATION` —
**it will not appear on the marketplace yet.** Refresh the page and confirm
it isn't there.

### 4c. Approve it as an admin

There's no admin UI for this step, on purpose. The admin panel is
explicitly out of scope for this MVP's frontend (see
[PRODUCT_AND_SERVICES.md](PRODUCT_AND_SERVICES.md#admin-verification)). To
finish the demo, act as the admin directly against the API:

```bash
# Log in as the seeded demo admin
ADMIN_TOKEN=$(curl -s -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@example.com","password":"admin123"}' \
  | node -e "let d='';process.stdin.on('data',c=>d+=c);process.stdin.on('end',()=>console.log(JSON.parse(d).data.token))")

# Find the pending application you just submitted
curl -s http://localhost:3000/api/admin/creators/pending \
  -H "Authorization: Bearer $ADMIN_TOKEN"

# Approve it (replace <id> with the id from the response above)
curl -s -X POST http://localhost:3000/api/admin/creators/<id>/approve \
  -H "Authorization: Bearer $ADMIN_TOKEN"
```

Full copy-pasteable walkthrough of every admin action (reject, request
changes, unpublish) is in [RUNNING_WITHOUT_FRONTEND.md](RUNNING_WITHOUT_FRONTEND.md).

### 4d. Watch it go live

Go back to the browser tab and refresh Career Connect. The creator you just
applied as is now visible on the public marketplace — no code change, no
restart, no manual database edit. This is the PRD's core acceptance
criterion: *"Approval automatically makes the profile public."*

---

## 5. Resetting to a clean demo state

Everything above mutates the database. To reset back to the original 10
seeded demo creators at any point:

```bash
cd backend
npm run setup
```

Safe to run repeatedly — it wipes and re-seeds every table. The frontend
doesn't need a restart; its next fetch will just see the reset data.

## 6. Automated tests (backend)

```bash
cd backend
npm test
```

Runs against isolated throwaway databases — never touches the data you're
using for a live demo. See [backend/README.md § Tests](../backend/README.md#tests)
for what's covered.

There is no frontend test suite in this MVP; `npm run build` (in
`frontend/`) and `npm run lint` are the frontend's correctness checks —
both are part of CI-equivalent verification before any merge.

## 7. Troubleshooting

| Symptom | Fix |
|---|---|
| Frontend shows "Couldn't load creators" | Backend isn't running, or crashed — check its terminal. Confirm `curl http://localhost:3000/api/health` works. |
| Browser console shows a CORS error | `FRONTEND_URL` in `backend/.env` doesn't match the frontend's actual origin (check the URL Vite printed). |
| `FOREIGN KEY constraint failed` from `npm run setup` | Delete `backend/database/career-connect.db*` and re-run `npm run setup`. |
| Newly applied creator never shows up after approval | Confirm you approved the right id (`GET /api/admin/creators/pending` to check), and that you refreshed the frontend — it doesn't auto-poll. |
| Port 3000 or 5173 already in use | Change `PORT` in `backend/.env`, or stop whatever else is using the port. |
| "Submit for verification" fails with an error message | The error banner shows the backend's actual validation message (e.g. a duplicate email, or a missing required field) — the form only performs client-side `required` checks, so this is expected if you reused an email from an earlier run. |
