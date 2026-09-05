# Career Connect

A single-page React front end for **Career Connect**, the professional-services marketplace
module described in the ReferralWorld Careers PRD. Job seekers can browse verified creators,
filter by service type, open a profile, and see priced offerings (consultations, resume
reviews, mock interviews, mentorship, referrals). Creators can apply to be listed through a
multi-step application form.

This is a standalone frontend build meant to be dropped into the main ReferralWorld Careers
portal later — there's no routing, and no backend yet (see [Scope](#scope--whats-mocked)).

## Tech stack

- **React 19** + **Vite** — plain JavaScript, no TypeScript
- **Tailwind CSS v4** via `@tailwindcss/vite` — no separate `postcss.config.js`, no
  `tailwind.config.js`; theme tokens live in `src/index.css`
- **oxlint** for linting

## Getting started

```bash
npm install
npm run dev       # start the dev server
npm run build     # production build to dist/
npm run preview   # preview the production build locally
npm run lint       # run oxlint over src/
```

## Project structure

```
career-connect/
├── index.html
├── vite.config.js          # Vite config with the Tailwind plugin registered
├── src/
│   ├── main.jsx             # React root
│   ├── App.jsx               # Page composition + state (search, filters, modals)
│   ├── index.css             # Tailwind entry point + @theme color/font tokens
│   ├── components/
│   │   ├── Navbar.jsx               Brand mark + "Become a Creator" entry point
│   │   ├── Hero.jsx                 Headline, search input, live creator count
│   │   ├── FilterBar.jsx            Service-category filter pills
│   │   ├── CreatorGrid.jsx          Grid of CreatorCards + empty state
│   │   ├── CreatorCard.jsx          Marketplace card (photo, tags, starting price)
│   │   ├── CreatorProfileModal.jsx  Full profile with all of a creator's services
│   │   ├── ServiceCard.jsx          Ticket-style card for one service offering
│   │   ├── BecomeCreatorModal.jsx   Creator application: form → preview → confirmation
│   │   ├── ServiceEditorRow.jsx     One editable service inside the application form
│   │   ├── VerifiedBadge.jsx        Reusable "Verified" badge
│   │   ├── Modal.jsx                Generic accessible modal shell (Esc + overlay close)
│   │   ├── Footer.jsx               Referral disclaimer + brand line
│   │   ├── Toast.jsx                Transient bottom toast for placeholder actions
│   │   ├── buttonClasses.js         Shared Tailwind class strings for button variants
│   │   └── formClasses.js           Shared Tailwind class strings for form fields
│   └── data/
│       ├── creators.js              Mock creators + services (matches the PRD data model)
│       └── categoryMeta.js          Per-category label/accent-color lookup
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

## Scope — what's mocked

This build focuses on the **public marketplace + creator application** flow from the PRD. A
few things are intentionally stubbed since there's no backend yet:

- **Creator data** comes from `src/data/creators.js`, not an API. Only creators with
  `status: 'APPROVED'` are ever rendered, mirroring the PRD's rule that the public query must
  return only approved/live creators.
- **"Request this service"** and **"Submit for verification"** show a confirmation toast /
  screen but don't hit a real backend — there's no payment or booking module yet, and no admin
  verification queue in this build.
- **Admin panel** (pending/approved/rejected queues, verification checklist, audit log) is not
  included here — it's a separate, internal-facing surface and out of scope for this
  public-facing module.

To wire this up to a real backend, replace the import in `src/data/creators.js` with a fetch to
`/api/career-connect/creators` (or similar) and pass the result into `App.jsx` the same way the
mock array is used today — no other component needs to change.
