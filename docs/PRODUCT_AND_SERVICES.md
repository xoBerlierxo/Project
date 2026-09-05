# Product & Services — What Career Connect Does, Per the PRD

This document walks through every feature described in the
[Career Connect PRD](PRD.md) and explains what it means, how it's
implemented, and where to find the code. If you've never read the PRD,
this doubles as a self-contained explanation of the product.

---

## What Career Connect is

A marketplace inside ReferralWorld Careers where **verified professionals**
("creators") list paid career-help services — consultation calls, resume
reviews, mock interviews, mentorship, and referral assistance — and job
seekers browse, filter, and view priced offerings. A creator only becomes
publicly visible after an admin manually verifies their application.

**Core principle (PRD §1):** a visitor should be able to enter Career
Connect, understand available services immediately, discover creators,
filter by service type, open a profile, and see everything they'd need to
make a request — all without guessing.

---

## Roles and permissions

| Role | Can do | Implementation |
|---|---|---|
| **Visitor / Seeker** | Browse, filter, search, open profiles, view services and prices | No login required — `GET /api/career-connect/creators[/:id]` are public endpoints |
| **Creator Applicant** | Submit an application with profile + services, edit their own profile/services before approval | `POST /api/creators/apply` returns a bearer token immediately, so the same session can add services right after (`src/services/authService.js`, `creatorController.js`) |
| **Verified Creator** | Same as applicant, plus: publicly visible once approved | `status = APPROVED` in `creator_profiles` (`src/db/schema.js`) |
| **Admin** | Review applications, approve/reject/request changes, unpublish, view audit log | `src/routes/admin.js` — every route requires `authenticate` + `requireRole('ADMIN')` |

The PRD's roles map onto three backend `users.role` values: `SEEKER`,
`CREATOR`, `ADMIN`. Seekers never need an account in this MVP — browsing is
fully anonymous.

---

## The six service categories

Every service a creator lists belongs to exactly one category. These are
enforced as a `CHECK` constraint in `creator_services.category`
(`src/db/schema.js`) and validated server-side (`src/utils/validators.js`).

| PRD category | Backend enum | What it is | Typically... |
|---|---|---|---|
| Consultation Call | `CONSULTATION` | 30- or 60-minute career discussion | requires a meeting |
| Resume Review | `RESUME_REVIEW` | Written feedback on a resume | async, no meeting |
| Portfolio Review | `PORTFOLIO_REVIEW` | Feedback on a portfolio/project/site | async, no meeting |
| Mock Interview | `MOCK_INTERVIEW` | Technical, HR, behavioral, or role-specific practice interview | requires a meeting |
| Mentorship | `MENTORSHIP` | Structured, often recurring career guidance | requires a meeting |
| Verified Referral | `VERIFIED_REFERRAL` | Creator submits the candidate for an open role they have visibility into | async, no meeting |

A creator can offer any combination of these — the demo seed data
deliberately spreads them across 6 approved creators so every category has
at least one live example (`backend/src/db/seed.js`).

### Verified Referral

This is the one category with a specific wording rule. The PRD is
explicit: **the platform must never imply that a referral guarantees an
interview, offer, or job.** If a creator markets a "guaranteed referral,"
that can only mean a guaranteed *submission attempt*, subject to the
creator's stated eligibility and the company's own process — never a
guaranteed hiring outcome.

This shows up in three places:
- The seed data's referral service descriptions use exactly this wording
  (`REFERRAL_DISCLAIMER` constant in `seed.js`).
- The frontend's footer carries a permanent disclaimer
  (`frontend/src/components/Footer.jsx`).
- The creator profile modal repeats it directly under the service list
  (`frontend/src/components/CreatorProfileModal.jsx`).

No backend validation enforces this wording on creator-submitted text (that
would require content moderation, out of scope for an MVP) — it's an admin
review responsibility during verification, and a UI-level constant
everywhere the platform's own copy appears.

---

## Per-service configuration — the PRD's central data-model rule

> *"Do not use one global availability schedule if creators can offer
> different schedules for different services."* — PRD §8

Every service a creator lists is independently configured:

| Field | Independent per service? | Where |
|---|---|---|
| Category | Yes | `creator_services.category` |
| Name & description | Yes | `creator_services.name`, `.description` |
| Price | Yes | `creator_services.price` |
| Duration | Yes (when it has a meeting) | `creator_services.duration_minutes` |
| Meeting required? | Yes | `creator_services.meeting_required` |
| Availability **or** delivery time | Yes, and mutually exclusive | `availability_slots` (per-service FK) **or** `creator_services.delivery_time` |

**The meeting/delivery consistency rule**, enforced server-side before any
write (`src/utils/validators.js#validateService`):

- `meeting_required = true` → the service **must** have at least one
  weekday + start/end time slot (`availability_slots`).
- `meeting_required = false` → the service **must** have a `delivery_time`
  string instead (e.g. "Delivered within 48 hours"), and availability is
  ignored.

This is why `availability_slots` has a foreign key to `creator_services`,
not to `creator_profiles` — a single creator can have Consultation Wednesday
evenings and Mock Interviews Saturday mornings, each independently
scheduled. See [ARCHITECTURE.md § Data model](ARCHITECTURE.md#6-data-model).

---

## The public marketplace (PRD §5–6)

| PRD requirement | Implementation |
|---|---|
| Navbar entry: "Career Connect" | `frontend/src/components/Navbar.jsx` |
| "Become a Creator" CTA, prominent | Navbar button, opens `BecomeCreatorModal` |
| Filters by service category | `FilterBar.jsx` → re-fetches `GET /career-connect/creators?category=...` per click |
| Creator cards: photo, name, current company/status, services, starting price, Verified badge | `CreatorCard.jsx`; starting price computed client-side as `min(services.price)` |
| Search by name/company/role/service keyword | Client-side filter over the currently-loaded (already category-filtered) creator list, `App.jsx` |
| Empty state with reset action | `CreatorGrid.jsx` |
| Creator profile: identity, status, experience, LinkedIn, description, every active service as its own card | `CreatorProfileModal.jsx` + `ServiceCard.jsx` |
| "From ₹X" starting price | `CreatorCard.jsx` |
| Verified badge only after admin approval | The public API only ever returns `status = APPROVED` creators, so every creator the frontend can render is, by construction, verified — `VerifiedBadge.jsx` renders unconditionally on cards/profiles for exactly this reason |

**The one rule everything above depends on:** the public API's SQL query
filters `WHERE status = 'APPROVED'` (`src/services/creatorService.js`).
This is enforced in the database query, not by the frontend choosing to
hide anything — see PRD §10's "critical implementation rule" and the
matching test in `backend/tests/marketplace.test.js`.

---

## Become a Creator (PRD §7–8)

The application form collects exactly the fields the PRD specifies:

| PRD field | Required? | Frontend | Backend |
|---|---|---|---|
| Name | Yes | text input | `name` |
| Photo | Yes (PRD) / optional in this MVP | *(upload endpoint exists, not wired into the form yet — see below)* | `POST /api/creators/:id/photo` |
| Company | Conditional (if working) | shown only when "Currently working" is toggled | `company` |
| Email | Yes | email input | `email` — also becomes the login for that creator's session token |
| LinkedIn | Yes | url input | `linkedin_url`, validated as a `linkedin.com` URL |
| Job title | Conditional | shown only when working | `job_title` |
| Years of experience | Yes | number input | `years_experience`, validated 0–60 |
| Short description | Yes | textarea | `description` |
| One or more services | Yes | `ServiceEditorRow` × N, "Add another service" | `POST /creators/:id/services` per service |
| Preview before submission | Yes | dedicated preview step | — |
| Agreement checkbox | Yes | required checkbox before submit is enabled | — |
| Confirmation screen explaining admin review | Yes | "You're in the queue for verification" | — |

**Photo upload is implemented on the backend** (`multer`, JPEG/PNG/WEBP,
2MB cap, `src/middleware/upload.js`) but the current frontend form doesn't
yet include a file input — a creator applies without a photo today, and
`photo_url` stays `null` (cards fall back to initials). Wiring the upload
button into `BecomeCreatorModal` is a small, self-contained addition against
an endpoint that already works.

### What happens on submit

1. `POST /api/creators/apply` — creates (or reuses) a `CREATOR` user for
   that email, creates the `creator_profiles` row with
   `status = PENDING_VERIFICATION`, creates a matching `verifications` row
   (`status = PENDING`), and returns a bearer token.
2. One `POST /api/creators/:id/services` call per service, using that
   token.
3. The applicant sees the confirmation screen. **The profile is not public**
   — confirmed by the `marketplace.test.js` suite and directly observable
   by requesting `GET /career-connect/creators/:id` right after applying
   (404).

---

## Admin verification

*(PRD §9–10.)*

> The PRD calls the admin panel a distinct surface from the public
> marketplace; this MVP's frontend intentionally doesn't include one
> (documented in `frontend/README.md`). The backend's admin API is fully
> built, tested, and is what a future internal admin UI — or you, via curl —
> drives.

| PRD requirement | Implementation |
|---|---|
| Pending / Approved / Rejected queues | `GET /api/admin/creators/{pending,approved,rejected}` |
| Full application review (profile + all services + pricing/duration + availability) | `GET /api/admin/creators/:id` — includes the private email and verification record, which public endpoints never return |
| Approve / Reject / Request Changes / Unpublish | `POST /api/admin/creators/:id/{approve,reject,request-changes,unpublish}` |
| Reject/request-changes require a reason | `{ reason }` in the request body, stored on the `verifications` row |
| Audit log of every admin action | `admin_actions` table — one row per state change, with `admin_id`, `action`, `reason`, `created_at` |
| Verification is admin-controlled, never automatic | Creators cannot set their own `status` — the field isn't in `creatorService.js`'s `UPDATABLE_PROFILE_FIELDS`, even if a client sends it |

### Publishing status lifecycle

```text
DRAFT → PENDING_VERIFICATION → APPROVED → UNPUBLISHED
                 │        ▲
                 ▼        │
         CHANGES_REQUIRED─┘
                 │
                 ▼
             REJECTED
```

Only `APPROVED` is ever publicly visible — see
[ARCHITECTURE.md § Backend architecture](ARCHITECTURE.md#2-backend-architecture)
for how that's enforced, and
[docs/DATABASE.md](DATABASE.md#creator-status-lifecycle) for the full state
table.

---

## What's a stub, and why (PRD non-goals)

The PRD explicitly scopes these **out** of the MVP (§2 "Non-goals"), and the
build follows that:

| Feature | PRD says | Status |
|---|---|---|
| Payments / payment splitting | "Do not build a complex payment-split system unless required for initial launch" | Not implemented. `service_requests` records interest only — no money moves. |
| Full calendar ecosystem | "Do not build a full automated calendar ecosystem if manual confirmation is sufficient" | `availability_slots` is simple recurring weekly slots (weekday + start/end time), no calendar sync |
| Guaranteed hiring outcomes | Explicitly forbidden wording | Enforced via copy/disclaimer, not a technical constraint (see [Verified Referral](#verified-referral) above) |
| Exposing private verification evidence | "Do not expose private verification documents publicly" | The `verifications` table's notes/evidence are only ever returned by the admin-only `GET /api/admin/creators/:id` |
| Admin panel UI | Listed as a separate internal surface in the frontend's own scope notes | Backend API complete and tested; no frontend built for it in this MVP — see [RUNNING_THE_MVP.md § 4c](RUNNING_THE_MVP.md#4c-approve-it-as-an-admin) |
| "Request this service" actually booking something | Booking/payment flow marked as future/current-implementation boundary (PRD §6, "Booking/Request (future/current implementation)") | Frontend shows a placeholder toast; the backend endpoint (`POST /api/service-requests`) is implemented and tested, just not called from the UI yet |
| Ratings, reviews, analytics, bundles, subscriptions, calendar integrations, automated verification | Listed explicitly under "Future Enhancements" (PRD §17) | Not implemented |

Full rationale for each deliberate MVP choice: [docs/DECISIONS.md](DECISIONS.md).

---

## Trust, validation, and security (PRD §13)

| PRD requirement | Implementation |
|---|---|
| Validate email / LinkedIn URL format | `src/utils/validators.js` |
| Auth + authorization on creator/admin actions | JWT (`src/middleware/auth.js`) + per-resource ownership checks (`assertCreatorOwnership` in `creatorService.js`) |
| Never expose verification notes/evidence publicly | Only the admin-only creator-detail endpoint returns the `verifications` record |
| Only admins change verification status | Enforced by role middleware + the field simply isn't creator-updatable |
| Sanitize user text against XSS | `src/utils/sanitize.js` strips HTML/script tags from every free-text field before storage |
| Rate-limit sensitive endpoints | `POST /api/creators/apply` (10/hr/IP), `POST /api/auth/login` (20/15min/IP) — `src/middleware/rateLimit.js` |
| Restrict image upload types/sizes | `multer` config: JPEG/PNG/WEBP only, 2MB cap |
| Audit trail for admin decisions | `admin_actions` table |
| Don't expose personal email unless the creator chooses to | Public endpoints never include `email`; it's admin-only |

---

## Everything, one more time, as a single reference table

| # | PRD feature | Endpoint(s) | Frontend surface |
|---|---|---|---|
| 1 | Browse marketplace | `GET /career-connect/creators` | `Hero`, `CreatorGrid`, `CreatorCard` |
| 2 | Filter by category | `GET /career-connect/creators?category=` | `FilterBar` |
| 3 | Search | *(client-side over fetched results)* | `Hero` search input |
| 4 | Creator profile | `GET /career-connect/creators/:id` | `CreatorProfileModal`, `ServiceCard` |
| 5 | Become a creator | `POST /creators/apply` | `BecomeCreatorModal` (form step) |
| 6 | Add services | `POST /creators/:id/services` | `BecomeCreatorModal` (services step), `ServiceEditorRow` |
| 7 | Update profile/service | `PUT /creators/:id`, `PUT /services/:id` | *(not exposed in this MVP's UI — creators can't self-edit post-submission yet)* |
| 8 | Deactivate a service | `DELETE /services/:id` | *(not exposed in UI)* |
| 9 | Request a service | `POST /service-requests` | Stubbed — toast only (see above) |
| 10 | Admin login | `POST /auth/login` | None — curl/Postman only |
| 11 | Admin review queues | `GET /admin/creators/{pending,approved,rejected}` | None |
| 12 | Admin approve/reject/request changes/unpublish | `POST /admin/creators/:id/{approve,reject,request-changes,unpublish}` | None |
| 13 | Photo upload | `POST /creators/:id/photo` | Not yet wired into the application form |
| 14 | Health check | `GET /health` | — |

Full request/response shapes for every endpoint above:
[docs/API.md](API.md).
