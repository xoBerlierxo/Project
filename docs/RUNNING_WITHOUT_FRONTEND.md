# Running & Testing the Backend Without a Frontend

The frontend engineer may not have started yet, or you just want to verify
the backend works end-to-end on its own. Everything below uses `curl` and
plain HTTP — no frontend, Postman, or extra tooling required (though a
[Postman](https://www.postman.com/)/[Insomnia](https://insomnia.rest/)
collection would work identically if you prefer a GUI: just mirror the
requests below).

All commands assume the server is running locally (see [Start the server](#1-start-the-server)).

---

## 1. Start the server

```bash
cd backend
npm install
cp .env.example .env
npm run setup     # creates the db + seeds 10 demo creators (6 approved)
npm run dev        # http://localhost:3000
```

Confirm it's up:

```bash
curl http://localhost:3000/api/health
```

```json
{"success":true,"data":{"status":"ok"}}
```

---

## 2. Browse the public marketplace (no auth needed)

**List all approved creators:**

```bash
curl http://localhost:3000/api/career-connect/creators
```

You should see 6 approved creators with their services, prices, and starting
price. This is exactly what the frontend's Career Connect landing page would
render.

**Filter by service category:**

```bash
curl "http://localhost:3000/api/career-connect/creators?category=MOCK_INTERVIEW"
```

Valid categories: `CONSULTATION`, `RESUME_REVIEW`, `PORTFOLIO_REVIEW`,
`MOCK_INTERVIEW`, `MENTORSHIP`, `VERIFIED_REFERRAL`.

**Open one creator's full profile** (grab an `id` from the list above, e.g. `1`):

```bash
curl http://localhost:3000/api/career-connect/creators/1
```

Notice each service carries its own `price`, `duration_minutes`,
`meeting_required`, and (if `meeting_required` is true) its own
`availability` — independent per service, per the PRD.

**Confirm hidden creators stay hidden.** Creator id `7` (Vikram Singh) is
seeded as `PENDING_VERIFICATION` — this must 404 publicly:

```bash
curl -i http://localhost:3000/api/career-connect/creators/7
# HTTP/1.1 404 Not Found
```

---

## 3. Submit a service request (the public "Book" CTA)

```bash
curl -X POST http://localhost:3000/api/service-requests \
  -H "Content-Type: application/json" \
  -d '{
    "service_id": 1,
    "customer_name": "Jane Doe",
    "customer_email": "jane@example.com",
    "message": "Would love to book this slot."
  }'
```

This is the placeholder for the "Request Service" flow — no payment, just a
stored lead a creator/admin could later act on.

---

## 4. Walk through the creator application flow

**Apply as a new creator.** This is the "Become a Creator" form submission —
it returns both the created profile *and* a bearer token, so you can
immediately add services in the same session:

```bash
curl -X POST http://localhost:3000/api/creators/apply \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Demo Creator",
    "email": "demo.creator@example.com",
    "linkedin_url": "https://linkedin.com/in/demo-creator",
    "current_status": "WORKING",
    "company": "TestCorp",
    "job_title": "Engineer",
    "years_experience": 3,
    "description": "Applying to test the verification flow."
  }'
```

Save the `data.creator.id` and `data.token` from the response — you'll need
both below. On Windows PowerShell or a POSIX shell with `jq`, you can capture
them directly:

```bash
RESPONSE=$(curl -s -X POST http://localhost:3000/api/creators/apply \
  -H "Content-Type: application/json" \
  -d '{"name":"Demo Creator","email":"demo.creator@example.com","linkedin_url":"https://linkedin.com/in/demo-creator","current_status":"WORKING","company":"TestCorp","job_title":"Engineer","years_experience":3,"description":"Applying to test the verification flow."}')
CREATOR_ID=$(echo "$RESPONSE" | node -e "let d='';process.stdin.on('data',c=>d+=c);process.stdin.on('end',()=>console.log(JSON.parse(d).data.creator.id))")
TOKEN=$(echo "$RESPONSE" | node -e "let d='';process.stdin.on('data',c=>d+=c);process.stdin.on('end',()=>console.log(JSON.parse(d).data.token))")
echo "Creator $CREATOR_ID, token saved"
```

The profile's `status` is `PENDING_VERIFICATION` — it will **not** appear in
the public listing yet:

```bash
curl http://localhost:3000/api/career-connect/creators/$CREATOR_ID
# 404 Not Found (not approved yet)
```

**Add a service** to the new profile using the token from `apply`:

```bash
curl -X POST http://localhost:3000/api/creators/$CREATOR_ID/services \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "category": "CONSULTATION",
    "name": "30-min Career Consultation",
    "description": "General career advice call.",
    "duration_minutes": 30,
    "price": 499,
    "meeting_required": true,
    "availability": [
      { "weekday": "WED", "start_time": "18:00", "end_time": "20:00" }
    ]
  }'
```

Try a non-meeting service (needs `delivery_time` instead of `availability`):

```bash
curl -X POST http://localhost:3000/api/creators/$CREATOR_ID/services \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "category": "RESUME_REVIEW",
    "name": "Resume Review",
    "description": "Written feedback on your resume.",
    "price": 299,
    "meeting_required": false,
    "delivery_time": "Delivered within 48 hours"
  }'
```

**Try the validation rule directly** — this should fail with `400
VALIDATION_ERROR` because `meeting_required: true` with no `availability`:

```bash
curl -i -X POST http://localhost:3000/api/creators/$CREATOR_ID/services \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"category":"MOCK_INTERVIEW","name":"Mock","description":"desc","price":500,"meeting_required":true}'
```

---

## 5. Log in as admin and verify the new creator

```bash
ADMIN_TOKEN=$(curl -s -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@example.com","password":"admin123"}' \
  | node -e "let d='';process.stdin.on('data',c=>d+=c);process.stdin.on('end',()=>console.log(JSON.parse(d).data.token))")
echo "Admin token saved"
```

> Demo admin credentials (`admin@example.com` / `admin123`) are for local
> development only — see `backend/README.md`.

**See the pending queue** (your new creator should be in here):

```bash
curl http://localhost:3000/api/admin/creators/pending \
  -H "Authorization: Bearer $ADMIN_TOKEN"
```

**Open the full application** (includes private email + verification record,
never exposed publicly):

```bash
curl http://localhost:3000/api/admin/creators/$CREATOR_ID \
  -H "Authorization: Bearer $ADMIN_TOKEN"
```

**Approve it:**

```bash
curl -X POST http://localhost:3000/api/admin/creators/$CREATOR_ID/approve \
  -H "Authorization: Bearer $ADMIN_TOKEN"
```

**Confirm it's now public** — this is the "wow, it actually works" moment:

```bash
curl http://localhost:3000/api/career-connect/creators/$CREATOR_ID
```

The creator and its services now appear with no code changes, no database
edits, no restart — just the state transition.

---

## 6. Exercise the rest of the admin workflow

**Reject an application** (create another one first, then):

```bash
curl -X POST http://localhost:3000/api/admin/creators/<id>/reject \
  -H "Authorization: Bearer $ADMIN_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"reason": "Could not verify LinkedIn profile against stated employer."}'
```

**Request changes:**

```bash
curl -X POST http://localhost:3000/api/admin/creators/<id>/request-changes \
  -H "Authorization: Bearer $ADMIN_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"reason": "Please add years of experience."}'
```

**Unpublish a previously-approved creator:**

```bash
curl -X POST http://localhost:3000/api/admin/creators/$CREATOR_ID/unpublish \
  -H "Authorization: Bearer $ADMIN_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"reason": "Temporarily paused at creator request."}'
```

Then confirm it disappears from the public listing again:

```bash
curl -i http://localhost:3000/api/career-connect/creators/$CREATOR_ID
# 404 Not Found
```

**Every one of these actions is logged.** You can see this indirectly via
`GET /api/admin/creators/:id` → the returned `verification` object reflects
the latest check, and the `admin_actions` table (not exposed via API, but
visible if you open the SQLite file directly) has one row per action.

---

## 7. Confirm access control is actually enforced

**No token at all:**

```bash
curl -i http://localhost:3000/api/admin/creators/pending
# 401 Unauthorized
```

**A creator token (not admin) hitting an admin route:**

```bash
curl -i http://localhost:3000/api/admin/creators/pending \
  -H "Authorization: Bearer $TOKEN"
# 403 Forbidden
```

**One creator trying to edit another creator's profile:**

Apply as a second creator, grab their token, then try to `PUT` the first
creator's profile with it — expect `403 Forbidden`.

---

## 8. Reset back to a clean demo state

Everything above mutates the database. To reset to the original seeded demo
data at any time:

```bash
npm run setup
```

This is safe to run repeatedly — it wipes and re-seeds every table.

---

## 9. Automated version of all of the above

Everything demonstrated manually above is also codified as automated tests,
run against isolated throwaway databases (your dev data is untouched):

```bash
npm test
```

See `backend/README.md#tests` for what each test file covers.
