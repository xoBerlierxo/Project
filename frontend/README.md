# Career Connect

A single-page React front end for **Career Connect**, the professional-services marketplace
module described in the ReferralWorld Careers PRD. Job seekers can browse verified creators,
filter by service type, open a profile, and see priced offerings (consultations, resume
reviews, mock interviews, mentorship, referrals). Creators can apply to be listed through a
multi-step application form.

This build talks to the real [Career Connect backend](../backend) over HTTP — there's no
mock data and no routing (see [Backend integration](#backend-integration) below).

## Tech stack

- **React 19** + **Vite** — plain JavaScript, no TypeScript
- **Tailwind CSS v4** via `@tailwindcss/vite` — no separate `postcss.config.js`, no
  `tailwind.config.js`; theme tokens live in `src/index.css`
- **oxlint** for linting

## Getting started

This app is a pure client that needs the backend running to show any data.

```bash
# 1. start the backend (in a separate terminal)
cd ../backend
npm install
npm run setup
npm run dev          # http://localhost:3000

# 2. start the frontend
cd frontend
npm install
cp .env.example .env  # VITE_API_BASE_URL — default matches the backend above
npm run dev            # http://localhost:5173
```

```bash
npm run build     # production build to dist/
npm run preview   # preview the production build locally
npm run lint       # run oxlint over src/
```

No backend running? The marketplace shows a "Couldn't load creators" state instead of
crashing — see `src/components/CreatorGrid.jsx`.

## Backend integration

All data comes from the API documented in [`../docs/API.md`](../docs/API.md). The API layer is
isolated in `src/api/` so components never talk to `fetch` directly:

| File | Responsibility |
|---|---|
| `src/api/client.js` | `apiRequest()` — wraps `fetch`, unwraps the backend's `{ success, data }` / `{ success: false, error }` envelope, throws `ApiError` on failure. Reads the base URL from `VITE_API_BASE_URL`. |
| `src/api/adapters.js` | Translates between the frontend's slug-based category ids / camelCase fields (`consultation`, `jobTitle`, `meetingRequired`, ...) and the backend's `UPPER_SNAKE_CASE` enums / snake_case fields (`CONSULTATION`, `job_title`, `meeting_required`, ...). This is the one place that mapping lives. |
| `src/api/creators.js` | The actual endpoint calls: `fetchApprovedCreators`, `fetchCreatorProfile`, `applyAsCreator`, `createCreatorService`, `requestService`. |
| `src/hooks/useCreators.js` | Fetches the public marketplace (re-fetching when the active category filter changes) and exposes `{ creators, status, error }` to `App.jsx`. |

**What's wired to the real backend:**
- The marketplace grid and filters — `GET /api/career-connect/creators[?category=]`.
- Opening a creator profile — `GET /api/career-connect/creators/:id`.
- The full "Become a Creator" flow — `POST /api/creators/apply` followed by
  `POST /api/creators/:id/services` for each service the applicant adds. A newly submitted
  creator sits in `PENDING_VERIFICATION` and only appears in the marketplace after an admin
  approves it through the backend's admin API (see
  [`../docs/RUNNING_WITHOUT_FRONTEND.md`](../docs/RUNNING_WITHOUT_FRONTEND.md) to do that
  without building an admin UI).

**What's still intentionally stubbed** (matches the PRD's non-goals for this MVP):
- **"Request this service"** shows a confirmation toast but doesn't call the backend's
  `POST /api/service-requests` yet — there's no payment or booking module, and the UI doesn't
  currently collect the requester's name/email needed for that call. Wiring it up is a small
  addition once that UI exists (`src/api/creators.js` already exports `requestService()`).
- **Admin panel** (pending/approved/rejected queues, verification checklist, audit log) is not
  included here — it's a separate, internal-facing surface and out of scope for this
  public-facing module. The backend's admin API is fully documented in `../docs/API.md`.

## Project structure

```
frontend/
├── index.html
├── vite.config.js          # Vite config with the Tailwind plugin registered
├── src/
│   ├── main.jsx             # React root
│   ├── App.jsx               # Page composition + state (search, filters, modals, live fetch)
│   ├── index.css             # Tailwind entry point + @theme color/font tokens
│   ├── api/
│   │   ├── client.js               fetch wrapper + response envelope + ApiError
│   │   ├── adapters.js             backend ⇄ frontend shape/category translation
│   │   └── creators.js             the actual endpoint calls
│   ├── hooks/
│   │   └── useCreators.js          live marketplace fetch (loading/ready/error)
│   ├── components/
│   │   ├── Navbar.jsx               Brand mark + "Become a Creator" entry point
│   │   ├── Hero.jsx                 Headline, search input, live creator count
│   │   ├── FilterBar.jsx            Service-category filter pills
│   │   ├── CreatorGrid.jsx          Grid of CreatorCards + loading/error/empty states
│   │   ├── CreatorCard.jsx          Marketplace card (photo, tags, starting price)
│   │   ├── CreatorProfileModal.jsx  Full profile with all of a creator's services
│   │   ├── ServiceCard.jsx          Ticket-style card for one service offering
│   │   ├── BecomeCreatorModal.jsx   Creator application: form → preview → real submit → confirmation
│   │   ├── ServiceEditorRow.jsx     One editable service (incl. weekday/time-range picker)
│   │   ├── VerifiedBadge.jsx        Reusable "Verified" badge
│   │   ├── Modal.jsx                Generic accessible modal shell (Esc + overlay close)
│   │   ├── Footer.jsx               Referral disclaimer + brand line
│   │   ├── Toast.jsx                Transient bottom toast for placeholder actions
│   │   ├── buttonClasses.js         Shared Tailwind class strings for button variants
│   │   └── formClasses.js           Shared Tailwind class strings for form fields
│   └── data/
│       └── categoryMeta.js          Per-category label/accent-color lookup
│       (creators.js now only holds the static SERVICE_CATEGORIES list — creator/service
│        data itself comes from the API via src/api/creators.js)
└── public/
    └── favicon.svg
```

## Design tokens

Colors, fonts, and radii are defined once as Tailwind theme tokens in `src/index.css`:

```css
@theme {
  --color-navy-900: #0b2038;   /* headers, primary text on dark */
  --color-navy-800: #0f2c4c;   /* primary brand color */
  --color-gold-500: #d9a441;   /* the single "Verified" trust signal + CTA accent */
  --color-teal-600: #0f6e68;   /* success / confirmation accent */
  --color-ink-900:  #14202e;   /* body text */
  ...
}
```

Because these are real Tailwind theme colors, they're used as ordinary utility classes
throughout the app (`bg-navy-900`, `text-gold-500`, `border-border`, etc.) rather than CSS
variables sprinkled through separate stylesheets. To re-theme the app, edit the `@theme` block
in `src/index.css` — everything else follows automatically.

Per-category accent colors (one per service type: consultation, resume review, mock interview,
etc.) live in `src/data/categoryMeta.js` instead of the Tailwind theme, since they're chosen
dynamically from data at render time and applied via inline `style` props.
