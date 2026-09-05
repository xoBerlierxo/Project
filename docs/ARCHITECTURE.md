# Career Connect — System Architecture

One diagram-first document covering how the frontend, backend, and database
fit together, and how data flows through the two core scenarios: browsing
the marketplace, and a creator going from application to public visibility.

For deeper detail on any one layer, see:
[docs/API.md](API.md) (endpoint contract) ·
[docs/DATABASE.md](DATABASE.md) (schema) ·
[backend/README.md](../backend/README.md) (backend internals) ·
[frontend/README.md](../frontend/README.md) (frontend internals)

---

## 1. System context

Three kinds of people use the product; all of them go through the same
frontend, which talks to one backend, which is the only thing that touches
the database.

```mermaid
flowchart TB
    Seeker["Job Seeker / Visitor\n(browses, filters, opens profiles)"]
    CreatorUser["Creator Applicant\n(applies, lists services)"]
    Admin["Admin\n(verifies creators via curl/Postman —\nno admin UI in this MVP)"]

    Frontend["Career Connect Frontend\nReact 19 + Vite + Tailwind\nlocalhost:5173"]
    Backend["Career Connect Backend\nExpress 5 REST API\nlocalhost:3000"]
    DB[("SQLite\nbackend/database/career-connect.db")]

    Seeker -->|browses| Frontend
    CreatorUser -->|applies via\nBecome a Creator| Frontend
    Admin -->|"curl / Postman\n(see RUNNING_WITHOUT_FRONTEND.md)"| Backend

    Frontend -->|"HTTP / JSON\n/api/*"| Backend
    Backend -->|synchronous SQL\nbetter-sqlite3| DB
```

**Why the admin has no UI:** the PRD scopes the public marketplace and
creator application as the frontend's job; the admin panel is called out as
"a separate, internal-facing surface" (see [PRODUCT_AND_SERVICES.md](PRODUCT_AND_SERVICES.md#admin-verification)).
The backend's admin API is fully built and tested — it's just driven directly
for this MVP rather than through a second UI. `docs/RUNNING_WITHOUT_FRONTEND.md`
is the operator's manual for that.

---

## 2. Backend architecture

Every request follows the same one-directional pipeline — no framework
magic, no hidden layers:

```mermaid
flowchart LR
    Req["HTTP Request"] --> Router["Express Router\nsrc/routes/*.js"]
    Router --> MW["Middleware\nauth · rate-limit · upload"]
    MW --> Ctrl["Controller\nsrc/controllers/*.js"]
    Ctrl --> Svc["Service\nsrc/services/*.js"]
    Svc --> DB[("SQLite\nbetter-sqlite3, synchronous")]
    DB --> Svc
    Svc --> Ctrl
    Ctrl --> Res["JSON Response\n{ success, data } or { success:false, error }"]
```

| Layer | Owns | Never does |
|---|---|---|
| **Routes** (`src/routes/`) | URL + HTTP method → controller, wiring middleware (auth/rate-limit) | Business logic, SQL |
| **Controllers** (`src/controllers/`) | Reads `req`, calls one service function, shapes the response | Talks to the database directly |
| **Services** (`src/services/`) | All business logic and SQL, via `better-sqlite3` | Knows about `req`/`res` |
| **Middleware** (`src/middleware/`) | JWT auth, role checks, rate limiting, file upload validation, error → JSON translation | — |
| **db** (`src/db/`) | Connection, schema, setup/seed scripts | — |

Full breakdown of every file: [backend/README.md § Folder-by-folder guide](../backend/README.md#folder-by-folder-guide).

---

## 3. Frontend architecture

```mermaid
flowchart LR
    App["App.jsx\nsearch/filter state, modals"]
    Hook["useCreators hook\nsrc/hooks/useCreators.js"]
    ApiLayer["API layer\nsrc/api/{client,adapters,creators}.js"]
    Components["Presentational components\nCreatorGrid, CreatorCard,\nCreatorProfileModal, BecomeCreatorModal, ..."]
    Backend["Backend REST API"]

    App --> Hook
    Hook --> ApiLayer
    App --> Components
    Components -->|onSubmitApplication,\nonRequestService callbacks| App
    BecomeCreatorModal["BecomeCreatorModal.jsx"] --> ApiLayer
    ApiLayer -->|fetch, JSON| Backend
```

The frontend never talks to `fetch` outside of `src/api/`:

| File | Responsibility |
|---|---|
| `src/api/client.js` | `apiRequest()` — wraps `fetch`, unwraps the backend's response envelope, throws a typed `ApiError` |
| `src/api/adapters.js` | Translates backend `UPPER_SNAKE_CASE` enums / snake_case fields ↔ the frontend's slug-based category ids / camelCase fields — the **one** place that mapping lives |
| `src/api/creators.js` | The actual endpoint calls: list/profile fetch, apply, create service, service request |
| `src/hooks/useCreators.js` | Fetches the public marketplace (re-fetching on category change), exposes `{ creators, status, error }` |

Because the API layer returns data already shaped like the original mock
data, almost none of the presentational components (`CreatorCard`,
`ServiceCard`, `CreatorProfileModal`, etc.) needed to change when the mock
data was replaced with live fetches. Full file-by-file breakdown:
[frontend/README.md § Project structure](../frontend/README.md#project-structure).

---

## 4. Scenario: browsing the marketplace

```mermaid
sequenceDiagram
    actor U as User
    participant FE as Frontend (App.jsx)
    participant Hook as useCreators
    participant API as Backend API
    participant DB as SQLite

    U->>FE: opens Career Connect
    FE->>Hook: activeCategory = 'all'
    Hook->>API: GET /api/career-connect/creators
    API->>DB: SELECT * FROM creator_profiles WHERE status = 'APPROVED'
    DB-->>API: approved creators + their active services + availability
    API-->>Hook: { creators: [...] }
    Hook-->>FE: status = 'ready', creators
    FE-->>U: renders creator grid, "6 verified creators..."

    U->>FE: clicks "Mock Interview" filter
    FE->>Hook: activeCategory = 'mock-interview'
    Hook->>API: GET /api/career-connect/creators?category=MOCK_INTERVIEW
    API-->>Hook: filtered creators
    Hook-->>FE: re-renders grid

    U->>FE: clicks "View profile"
    FE->>API: GET /api/career-connect/creators/:id
    API->>DB: SELECT ... WHERE id = ? AND status = 'APPROVED'
    API-->>FE: full profile + all active services + availability
    FE-->>U: opens CreatorProfileModal
```

The `WHERE status = 'APPROVED'` clause is the load-bearing line in this
whole diagram — it's enforced in SQL, not by anything the frontend has to
remember to check.

---

## 5. Scenario: creator application → admin approval → public visibility

This is the flow the PRD calls "the core 'wow, it actually works'
demonstration." It spans both the frontend (application) and the backend's
admin API (verification, driven manually per `RUNNING_WITHOUT_FRONTEND.md`
since there's no admin UI in this MVP).

```mermaid
sequenceDiagram
    actor C as Creator applicant
    participant FE as Frontend (BecomeCreatorModal)
    participant API as Backend API
    participant DB as SQLite
    actor A as Admin (curl/Postman)

    C->>FE: fills profile + adds services, clicks Submit
    FE->>API: POST /api/creators/apply
    API->>DB: INSERT creator_profiles (status = PENDING_VERIFICATION)
    API->>DB: INSERT verifications (status = PENDING)
    API-->>FE: { creator, token }
    loop for each service added
        FE->>API: POST /api/creators/:id/services  (Bearer token)
        API->>DB: INSERT creator_services [+ availability_slots]
    end
    FE-->>C: "You're in the queue for verification"

    Note over C,FE: Creator is NOT public yet —<br/>GET /career-connect/creators/:id returns 404

    A->>API: POST /api/auth/login (admin credentials)
    API-->>A: admin token
    A->>API: GET /api/admin/creators/pending  (Bearer admin token)
    API-->>A: [ ...pending creators, including this one ]
    A->>API: POST /api/admin/creators/:id/approve
    API->>DB: UPDATE creator_profiles SET status = 'APPROVED'
    API->>DB: UPDATE verifications SET status = 'VERIFIED'
    API->>DB: INSERT admin_actions (action = 'APPROVE')
    API-->>A: { creator: { status: 'APPROVED' } }

    Note over FE,API: No code change, no restart —<br/>the next fetch just sees it

    C->>FE: refreshes Career Connect
    FE->>API: GET /api/career-connect/creators
    API->>DB: SELECT ... WHERE status = 'APPROVED'
    API-->>FE: now includes the new creator
    FE-->>C: creator is live on the marketplace
```

---

## 6. Data model

```mermaid
erDiagram
    users ||--o| creator_profiles : "owns"
    creator_profiles ||--o{ creator_services : "offers"
    creator_services ||--o{ availability_slots : "scheduled via"
    creator_profiles ||--|| verifications : "reviewed via"
    creator_profiles ||--o{ admin_actions : "audited via"
    creator_services ||--o{ service_requests : "requested via"

    users {
        int id PK
        string email
        string password_hash
        string role "SEEKER | CREATOR | ADMIN"
    }
    creator_profiles {
        int id PK
        int user_id FK
        string name
        string status "DRAFT | PENDING_VERIFICATION | CHANGES_REQUIRED | APPROVED | REJECTED | UNPUBLISHED"
    }
    creator_services {
        int id PK
        int creator_id FK
        string category
        int price
        bool meeting_required
        string delivery_time
    }
    availability_slots {
        int id PK
        int service_id FK
        string weekday
        string start_time
        string end_time
    }
    verifications {
        int id PK
        int creator_id FK
        string status "PENDING | VERIFIED | FAILED"
    }
    admin_actions {
        int id PK
        int admin_id FK
        int creator_id FK
        string action
    }
    service_requests {
        int id PK
        int creator_id FK
        int service_id FK
        string status "PENDING | ACCEPTED | REJECTED"
    }
```

Column-by-column reference: [docs/DATABASE.md](DATABASE.md).

**Note the direction of the two FKs from `availability_slots` and
`creator_services`:** availability belongs to a *service*, not to a
creator — a single creator can offer Consultation on Wednesday evenings and
Mock Interviews on Saturday mornings, each with its own independent
schedule. This is a PRD requirement, not an implementation shortcut.

---

## 7. Deployment shape (local MVP)

There is no cloud infrastructure in this MVP — it's two local processes and
one file:

```mermaid
flowchart LR
    subgraph "Your machine"
        FE["Vite dev server\nlocalhost:5173"]
        BE["Node/Express\nlocalhost:3000"]
        FS[("career-connect.db\n(single SQLite file)")]
        Up[("uploads/\n(creator photos)")]
    end

    Browser["Browser"] --> FE
    FE -->|CORS-allowed fetch| BE
    BE --> FS
    BE --> Up
```

- No Docker, no external database server, no cloud services — see
  [docs/DECISIONS.md](DECISIONS.md) for why.
- CORS is locked to `FRONTEND_URL` (backend `.env`), which must match the
  Vite dev server's actual origin.
- Full setup instructions for running both halves together: **[docs/RUNNING_THE_MVP.md](RUNNING_THE_MVP.md)**.
