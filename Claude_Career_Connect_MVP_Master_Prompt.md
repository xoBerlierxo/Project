# Claude Code Master Prompt --- ReferralWorld Career Connect MVP

> **How to use this file**
>
> Give this entire document to Claude Code **together with the provided
> `ReferralWorld_Careers_Career_Connect_Detailed_PRD.pdf`**.
>
> The PRD is the product source of truth. This prompt defines how Claude
> should execute the work, what technical scope to use for the MVP,
> and---most importantly---what Claude must **not** touch so that a
> separate frontend engineer can work independently.

------------------------------------------------------------------------

# 0. ROLE

You are the primary backend engineer and repository bootstrapper for the
**ReferralWorld Careers --- Career Connect MVP**.

You have been given a Product Requirements Document (PRD):

**`ReferralWorld_Careers_Career_Connect_Detailed_PRD.pdf`**

Read the PRD carefully before writing implementation code.

Your job is to:

1.  Bootstrap a clean Git repository.
2.  Establish a clean frontend/backend project boundary.
3.  Create the initial repository structure and documentation.
4.  Build the **backend only**.
5.  Build a minimal, functional, database-backed MVP.
6.  Create a clear REST API contract that an independent frontend
    engineer can consume.
7.  Seed the application with realistic demo data so the MVP can be
    demonstrated immediately.
8.  Keep the implementation extremely simple, fast, understandable, and
    debuggable.
9.  Write setup and API documentation.
10. Test the backend locally and fix implementation issues before
    considering the backend complete.

A separate frontend engineer will work independently on `/frontend`.

------------------------------------------------------------------------

# 1. VERY IMPORTANT PRODUCT CONTEXT

This is an **MVP / management demonstration**, not the final production
system.

The production engineering team will migrate the application to their
own production stack later.

Therefore:

## Optimize for

-   speed of development
-   simplicity
-   reliability
-   easy local setup
-   easy debugging
-   minimal dependencies
-   clear code
-   clear REST APIs
-   database-backed functionality
-   convincing end-to-end demonstration
-   easy handoff to another engineering team

## Do NOT optimize for

-   enterprise architecture
-   premature scalability
-   microservices
-   complex infrastructure
-   cloud-native architecture
-   elaborate abstractions
-   production-grade payment infrastructure
-   production calendar integrations
-   advanced search
-   analytics
-   recommendation systems
-   extensibility for hypothetical future features

If two technically valid approaches exist, choose the one with:

1.  fewer dependencies
2.  fewer files
3.  less code
4.  easier debugging
5.  easier local setup

------------------------------------------------------------------------

# 2. SOURCE OF TRUTH

The attached PRD is the source of truth for product requirements.

Before implementation:

1.  Read the entire PRD.
2.  Understand the roles.
3.  Understand the creator lifecycle.
4.  Understand the public marketplace.
5.  Understand the service model.
6.  Understand per-service availability.
7.  Understand the admin verification workflow.
8.  Understand the acceptance criteria.
9.  Identify anything explicitly marked as a future enhancement or
    non-goal.

Do not silently invent product requirements.

If the PRD does not require a feature, do not add it unless it is
necessary to make the MVP function.

If you believe an implementation decision requires an assumption,
document the assumption in `docs/DECISIONS.md`.

------------------------------------------------------------------------

# 3. TECHNICAL STACK

Use the following stack.

## Backend

-   Node.js 24 LTS
-   JavaScript or TypeScript as necessary
-   Express 5
-   SQLite
-   `better-sqlite3`

## Backend supporting dependencies

Use only what is genuinely required.

The expected minimal dependency set is approximately:

-   `express`
-   `better-sqlite3`
-   `cors`
-   `dotenv`
-   `jsonwebtoken`
-   `bcrypt`
-   `multer`

You may add a small dependency only if there is a clear MVP requirement
that cannot be handled cleanly without it.

Do NOT add large frameworks or unnecessary libraries.

------------------------------------------------------------------------

# 4. TECHNOLOGIES YOU MUST NOT USE UNLESS NECESSARY

Do not use:

-   MySQL
-   MongoDB
-   Prisma
-   Sequelize
-   Mongoose
-   Docker
-   Redis
-   GraphQL
-   Kubernetes
-   microservices
-   message queues
-   AWS services
-   Firebase
-   Supabase
-   external calendar APIs
-   payment providers
-   Stripe
-   Razorpay
-   Google Calendar integration
-   Outlook Calendar integration
-   Zoom integration
-   OAuth providers
-   complex authentication platforms

This is deliberately a local, simple MVP.

------------------------------------------------------------------------

# 5. REPOSITORY STRUCTURE

Create the repository with this structure:

``` text
career-connect-mvp/
│
├── backend/
│   ├── src/
│   │   ├── config/
│   │   ├── controllers/
│   │   ├── middleware/
│   │   ├── routes/
│   │   ├── services/
│   │   ├── db/
│   │   ├── utils/
│   │   ├── app.js
│   │   └── server.js
│   │
│   ├── database/
│   │   └── .gitkeep
│   │
│   ├── uploads/
│   │   └── .gitkeep
│   │
│   ├── tests/
│   │
│   ├── .env.example
│   ├── package.json
│   └── README.md
│
├── frontend/
│   └── README.md
│
├── docs/
│   ├── API.md
│   ├── DATABASE.md
│   └── DECISIONS.md
│
├── .gitignore
└── README.md
```

The `/frontend` directory belongs to a separate frontend engineer.

------------------------------------------------------------------------

# 6. ABSOLUTE FRONTEND BOUNDARY

This is a hard requirement.

## YOU OWN

``` text
/backend
/docs
/root README files
.gitignore
```

## YOU DO NOT OWN

``` text
/frontend
```

Do not modify, delete, refactor, initialize, or generate application
code inside `/frontend`.

Do not create React components.

Do not create frontend routes.

Do not install frontend dependencies.

Do not modify frontend package files.

Do not add frontend styling.

Do not make assumptions about the frontend implementation.

The frontend engineer will work independently.

The only thing you may place inside `/frontend` is a small `README.md`
explaining:

-   the frontend is independently maintained
-   backend base URL
-   where to find the API contract
-   how to run the backend

Nothing else.

------------------------------------------------------------------------

# 7. FIRST TASK: BOOTSTRAP THE REPOSITORY

Before building backend functionality:

## Step 1

Inspect the current directory.

Determine whether:

-   a Git repository already exists
-   files already exist
-   a remote origin exists
-   `/backend` exists
-   `/frontend` exists

Do not destroy existing work.

If this is an empty directory, initialize Git.

## Step 2

Create the repository structure described above.

## Step 3

Create:

``` text
README.md
docs/API.md
docs/DATABASE.md
docs/DECISIONS.md
frontend/README.md
backend/README.md
```

## Step 4

Create `.gitignore`.

At minimum ignore:

``` text
node_modules/
.env
*.db
*.sqlite
*.sqlite3
uploads/*
.DS_Store
```

Keep the empty upload/database directories using `.gitkeep`.

## Step 5

Create the backend `package.json`.

## Step 6

Install only the required backend dependencies.

## Step 7

Create an initial Git commit:

``` text
chore: bootstrap career connect mvp repository
```

If a remote repository is already configured and authentication is
available, you may push the initial commit.

If no remote exists, do not attempt to create a GitHub repository
through unsupported means. Leave the repository locally initialized and
clearly tell me how to add the remote.

After this bootstrap commit, continue with backend implementation.

------------------------------------------------------------------------

# 8. BACKEND ARCHITECTURE

Keep the architecture simple.

Use:

``` text
HTTP Request
     ↓
Express Route
     ↓
Controller
     ↓
Service
     ↓
SQLite
     ↓
JSON Response
```

Do not introduce unnecessary architecture layers.

Avoid:

-   repository-pattern frameworks
-   dependency injection frameworks
-   generic CRUD abstractions
-   factories
-   event buses
-   domain-driven-design layers
-   excessive classes
-   elaborate interfaces

Simple modules and functions are preferred.

------------------------------------------------------------------------

# 9. DATABASE

Use SQLite.

Database location:

``` text
backend/database/career-connect.db
```

The database should be automatically initialized if it does not exist.

Create a setup mechanism such as:

``` bash
npm run setup
```

which should:

1.  create the SQLite database
2.  create all required tables
3.  create indexes where useful
4.  seed demo data

Also provide:

``` bash
npm run seed
```

for re-seeding demo data if appropriate.

The database must not require a separately installed database server.

------------------------------------------------------------------------

# 10. REQUIRED DATABASE ENTITIES

Implement the entities described by the PRD.

## User

Suggested fields:

``` text
id
email
password_hash
role
created_at
```

Roles should at minimum support:

``` text
SEEKER
CREATOR
ADMIN
```

A seeker does not need a complex profile for this MVP.

------------------------------------------------------------------------

## CreatorProfile

Fields should cover the PRD requirements:

``` text
id
user_id
name
photo_url
company
current_status
linkedin_url
job_title
years_experience
description
status
created_at
updated_at
```

Creator status:

``` text
DRAFT
PENDING_VERIFICATION
CHANGES_REQUIRED
APPROVED
REJECTED
UNPUBLISHED
```

------------------------------------------------------------------------

## CreatorService

Fields:

``` text
id
creator_id
category
name
description
duration_minutes
price
meeting_required
delivery_time
active
created_at
updated_at
```

Each service must independently support:

-   category
-   name
-   description
-   duration
-   price
-   meeting required
-   delivery time

------------------------------------------------------------------------

## AvailabilitySlot

Fields:

``` text
id
service_id
weekday
start_time
end_time
timezone
active
```

Availability belongs to a service, not globally to the creator.

For MVP use recurring weekly availability.

Do not integrate a real calendar.

------------------------------------------------------------------------

## Verification

Fields should cover:

``` text
id
creator_id
verification_type
status
checked_by
checked_at
notes
```

Verification information is private.

Never expose private verification notes or evidence through public
endpoints.

------------------------------------------------------------------------

## AdminAction

Fields:

``` text
id
admin_id
creator_id
action
reason
created_at
```

Every admin state-changing action must be auditable.

------------------------------------------------------------------------

# 11. OPTIONAL SIMPLE SERVICE REQUEST

The PRD describes booking/payment/request as a later/current
implementation boundary.

For the demonstration MVP, you MAY implement a very small
`service_requests` table if needed to make the public service CTA
actually perform an action.

If implemented, keep it extremely simple:

``` text
id
creator_id
service_id
customer_name
customer_email
message
status
created_at
```

Example statuses:

``` text
PENDING
ACCEPTED
REJECTED
```

Do not implement:

-   payments
-   payment splitting
-   refunds
-   payouts
-   calendar booking
-   meeting links
-   cancellation infrastructure

The purpose is only to demonstrate:

``` text
Creator Profile
      ↓
Service
      ↓
Request Service
      ↓
Request Created
```

If the service-request functionality makes the MVP substantially more
complicated, omit it and use a clearly labelled placeholder response.

------------------------------------------------------------------------

# 12. PUBLIC API

Implement:

``` http
GET /api/career-connect/creators
```

This returns creator cards.

CRITICAL:

The query must return ONLY:

``` text
status = APPROVED
```

Do not rely on the frontend to hide unapproved creators.

------------------------------------------------------------------------

## Filtering

Support the MVP service-category filter:

``` http
GET /api/career-connect/creators?category=MOCK_INTERVIEW
```

The API should return creators who have an active service matching that
category.

Do not build an advanced search engine.

------------------------------------------------------------------------

## Creator profile

Implement:

``` http
GET /api/career-connect/creators/:id
```

Return:

-   creator profile
-   verification/public badge information
-   active services
-   service-specific availability
-   pricing
-   duration
-   meeting requirement
-   delivery information

Do not return:

-   password hashes
-   private email unless explicitly required
-   verification notes
-   private verification evidence
-   admin information

------------------------------------------------------------------------

# 13. CREATOR APIs

Implement the minimum required creator functionality.

## Apply

``` http
POST /api/creators/apply
```

Creates a creator application.

The initial submitted state must be:

``` text
PENDING_VERIFICATION
```

------------------------------------------------------------------------

## Update profile

``` http
PUT /api/creators/:id
```

Allow updating creator information according to MVP policy.

Do not allow creators to directly change:

``` text
verification status
```

------------------------------------------------------------------------

## Create service

``` http
POST /api/creators/:id/services
```

------------------------------------------------------------------------

## Update service

``` http
PUT /api/services/:id
```

------------------------------------------------------------------------

## Delete/deactivate service

You may use:

``` http
DELETE /api/services/:id
```

or an equivalent deactivation endpoint.

Prefer soft deactivation if it keeps the implementation simple.

------------------------------------------------------------------------

# 14. ADMIN APIs

Implement:

``` http
GET /api/admin/creators/pending
GET /api/admin/creators/approved
GET /api/admin/creators/rejected
GET /api/admin/creators/:id
```

And:

``` http
POST /api/admin/creators/:id/approve
POST /api/admin/creators/:id/reject
POST /api/admin/creators/:id/request-changes
POST /api/admin/creators/:id/unpublish
```

When rejecting or requesting changes, accept a reason.

When approving/rejecting/requesting changes/unpublishing:

1.  update the creator status
2.  create an `AdminAction`
3.  return the updated status

Only admins can execute these actions.

------------------------------------------------------------------------

# 15. AUTHENTICATION

Implement only minimal authentication required for the MVP.

Use:

-   bcrypt for passwords
-   JWT for authenticated sessions

Do not implement OAuth.

Create:

``` http
POST /api/auth/login
```

Support role-aware authorization.

At minimum:

``` text
PUBLIC
CREATOR
ADMIN
```

Admin endpoints must require an authenticated admin.

Creator endpoints must require the appropriate authenticated creator.

Do not spend time building:

-   password reset
-   email OTP
-   Google login
-   Microsoft login
-   2FA
-   account recovery
-   social authentication

------------------------------------------------------------------------

# 16. DEMO ADMIN ACCOUNT

Create a seeded development admin account.

Put the credentials in:

``` text
backend/README.md
```

and clearly mark them:

``` text
DEVELOPMENT / DEMO ONLY
```

Do not hardcode production secrets.

Use environment variables for JWT secrets and similar configuration.

Example:

``` text
JWT_SECRET=development-secret-change-me
ADMIN_EMAIL=admin@example.com
ADMIN_PASSWORD=admin123
```

If seed code requires these values, make it obvious that they are for
local demonstration only.

------------------------------------------------------------------------

# 17. DEMO DATA

Create enough seed data to make the application immediately
demonstrable.

Seed approximately:

``` text
6 approved creators
1 pending creator
1 changes-required creator
1 rejected creator
1 unpublished creator
```

Each approved creator should have one or more realistic services.

Use different combinations of:

-   Consultation
-   Resume Review
-   Portfolio Review
-   Mock Interview
-   Mentorship
-   Verified Referral

Use realistic Indian pricing such as:

``` text
₹299
₹499
₹799
₹999
₹1499
```

Do not imply that real companies or real people are actually
participating.

Use clearly fictional demo identities.

Example:

``` text
Aarav Mehta
Software Engineer
DemoTech
```

not real personal data.

Seed different service-specific availability schedules.

For example:

``` text
Consultation:
Wednesday 18:00–20:00

Mock Interview:
Saturday 10:00–13:00
```

This should demonstrate the PRD requirement that availability belongs to
each individual service.

------------------------------------------------------------------------

# 18. IMAGE UPLOAD

Implement basic image upload support for creator profile photos.

Use `multer`.

Validate:

-   MIME type
-   reasonable file size
-   allowed extensions/types

For MVP, store files locally under:

``` text
backend/uploads/
```

Serve them through a simple static route.

Do not integrate S3 or another cloud storage provider.

The PRD requires profile photos and validation of invalid/oversized
uploads.

------------------------------------------------------------------------

# 19. VALIDATION

Implement basic server-side validation.

Validate:

-   required fields
-   email format
-   LinkedIn URL format
-   price is non-negative
-   years of experience is sensible
-   duration is valid
-   service category is valid
-   meeting/delivery fields are consistent
-   availability times are valid

Important rule:

If:

``` text
meeting_required = true
```

availability is required.

If:

``` text
meeting_required = false
```

delivery time is required and meeting availability is not required.

This mirrors the PRD's service configuration rules.

------------------------------------------------------------------------

# 20. SECURITY FOR THE MVP

Implement the security requirements that are cheap and important.

At minimum:

-   authentication
-   authorization
-   input validation
-   basic rate limiting where appropriate
-   CORS configuration
-   safe error responses
-   file upload restrictions
-   no password leakage
-   no private verification information in public responses
-   no public access to admin endpoints
-   no direct creator control over verification status

Sanitize or safely handle user-generated text to avoid obvious XSS
issues.

Do not spend time building a full enterprise security system.

------------------------------------------------------------------------

# 21. API RESPONSE FORMAT

Use a consistent simple response format.

Success:

``` json
{
  "success": true,
  "data": {}
}
```

Error:

``` json
{
  "success": false,
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "Price must be a positive number"
  }
}
```

Do not create an elaborate response framework.

------------------------------------------------------------------------

# 22. HEALTH CHECK

Implement:

``` http
GET /api/health
```

Response:

``` json
{
  "success": true,
  "data": {
    "status": "ok"
  }
}
```

This should be the first endpoint used to verify that the backend is
alive.

------------------------------------------------------------------------

# 23. CORS

Allow the frontend development server to communicate with the backend.

Make the allowed frontend origin configurable through environment
variables.

Example:

``` text
FRONTEND_URL=http://localhost:5173
```

Do not hardcode production domains.

------------------------------------------------------------------------

# 24. API DOCUMENTATION

Create:

``` text
docs/API.md
```

This is extremely important because a separate frontend engineer will
consume the API.

Document every endpoint with:

1.  HTTP method
2.  URL
3.  purpose
4.  authentication requirement
5.  query parameters
6.  request body
7.  success response
8.  error response
9.  example

Example:

``` md
## GET /api/career-connect/creators

Returns publicly visible verified creators.

### Query parameters

category

### Example

GET /api/career-connect/creators?category=RESUME_REVIEW

### Response

{
  "success": true,
  "data": {
    "creators": [...]
  }
}
```

The API document must be kept synchronized with the implementation.

------------------------------------------------------------------------

# 25. DATABASE DOCUMENTATION

Create:

``` text
docs/DATABASE.md
```

Document:

-   tables
-   important columns
-   relationships
-   creator status lifecycle
-   service relationship
-   availability relationship

Include a simple text diagram.

Example:

``` text
User
  |
  1:1
  |
CreatorProfile
  |
  1:N
  |
CreatorService
  |
  1:N
  |
AvailabilitySlot
```

------------------------------------------------------------------------

# 26. ARCHITECTURE DECISIONS

Create:

``` text
docs/DECISIONS.md
```

Record important MVP decisions such as:

``` text
Why SQLite?
Why Express?
Why no ORM?
Why no payment?
Why no calendar integration?
Why availability belongs to services?
Why public APIs only return APPROVED creators?
```

Keep this short.

The purpose is to help the production team understand that these were
deliberate MVP choices.

------------------------------------------------------------------------

# 27. ROOT README

Create a very simple root `README.md`.

It should explain:

``` text
# ReferralWorld Career Connect MVP

## What this is

A minimal MVP of the Career Connect marketplace.

## Repository

/frontend
/backend

## Ownership

Frontend: separate frontend engineer
Backend: this MVP backend

## Running backend

cd backend
npm install
npm run setup
npm run dev

## Backend

http://localhost:3000

## Health

GET /api/health

## API documentation

docs/API.md
```

Do not write a huge README.

------------------------------------------------------------------------

# 28. BACKEND README

Create:

``` text
backend/README.md
```

Include:

-   prerequisites
-   installation
-   setup
-   seed
-   development server
-   environment variables
-   demo admin credentials
-   API base URL
-   test commands
-   troubleshooting

The ideal setup should be:

``` bash
cd backend
npm install
npm run setup
npm run dev
```

------------------------------------------------------------------------

# 29. NPM SCRIPTS

The backend should provide at minimum:

``` json
{
  "scripts": {
    "dev": "...",
    "start": "...",
    "setup": "...",
    "seed": "...",
    "test": "..."
  }
}
```

The exact implementation is your choice.

The goal is that a new developer can understand the project immediately.

------------------------------------------------------------------------

# 30. TESTING

Do not build an enormous test suite.

Build focused tests around the critical product rules.

At minimum test:

## Public marketplace

-   approved creators are returned
-   pending creators are NOT returned
-   rejected creators are NOT returned
-   unpublished creators are NOT returned
-   category filtering works

## Creator

-   required fields are validated
-   creator application becomes `PENDING_VERIFICATION`
-   multiple services can be created
-   each service retains its own price
-   each service retains its own duration
-   meeting-required services accept availability
-   non-meeting services use delivery time

## Admin

-   admin can approve
-   admin can reject
-   admin can request changes
-   admin can unpublish
-   admin actions create audit records
-   non-admin users cannot perform admin actions

The most important test is:

``` text
PUBLIC API
    ↓
ONLY APPROVED CREATORS
```

------------------------------------------------------------------------

# 31. CRITICAL CREATOR STATUS RULE

Implement the lifecycle exactly around:

``` text
DRAFT
   ↓
PENDING_VERIFICATION
   ↓
APPROVED
```

Possible alternate states:

``` text
PENDING_VERIFICATION
   ↓
CHANGES_REQUIRED
   ↓
PENDING_VERIFICATION
```

or:

``` text
PENDING_VERIFICATION
   ↓
REJECTED
```

and:

``` text
APPROVED
   ↓
UNPUBLISHED
```

Only:

``` text
APPROVED
```

is publicly visible.

Never make the frontend responsible for determining whether a creator is
publicly visible.

The backend/database must enforce this.

------------------------------------------------------------------------

# 32. REFERRAL SERVICE TRUST RULE

The PRD explicitly says the product must not imply that a referral
guarantees an interview, offer, or job.

Therefore, any demo/API text for:

``` text
VERIFIED_REFERRAL
```

must use wording such as:

``` text
Referral assistance / referral submission subject to creator
eligibility and company process.
```

Never use language that promises:

``` text
guaranteed interview
guaranteed job
guaranteed offer
```

unless the wording clearly means only a guaranteed submission/attempt
under stated conditions.

------------------------------------------------------------------------

# 33. DO NOT BUILD THESE FEATURES

Explicitly do NOT implement:

``` text
Payments
Payment splitting
Creator payouts
Refunds
Disputes
Real-time calendar
Google Calendar
Outlook Calendar
Automatic meeting links
Ratings
Reviews
Creator earnings dashboard
Booking history
Analytics
Featured creators
Bundles
Subscriptions
Premium placement
Automated verification providers
Work-email verification providers
Recommendation engine
AI matching
```

These are outside the minimal MVP.

------------------------------------------------------------------------

# 34. FRONTEND INTEGRATION CONTRACT

The frontend engineer must be able to work without understanding backend
internals.

Therefore:

``` text
frontend
   |
   | HTTP / JSON
   ↓
backend API
   |
   ↓
SQLite
```

The frontend must NEVER import backend modules.

The frontend must NEVER access the SQLite database directly.

The frontend must NEVER depend on backend file paths.

The frontend only communicates through documented APIs.

------------------------------------------------------------------------

# 35. DO NOT BLOCK THE FRONTEND ENGINEER

The backend should be usable independently.

Provide:

``` text
GET /api/health
```

Provide seeded data.

Provide predictable API responses.

Provide API documentation.

Provide CORS configuration.

Provide local startup instructions.

The frontend engineer should be able to run:

``` bash
cd backend
npm install
npm run setup
npm run dev
```

and immediately begin integrating against:

``` text
http://localhost:3000/api
```

------------------------------------------------------------------------

# 36. DEVELOPMENT ORDER

Work in this order.

## Phase 1 --- Repository bootstrap

-   inspect existing directory
-   initialize Git if required
-   create repository structure
-   create README files
-   create `.gitignore`
-   create package.json
-   initial Git commit

## Phase 2 --- Backend foundation

-   Express server
-   environment configuration
-   error handling
-   CORS
-   health endpoint
-   SQLite connection
-   database initialization

## Phase 3 --- Data model

-   tables
-   relationships
-   indexes
-   seed system

## Phase 4 --- Public marketplace

-   creator listing
-   filtering
-   creator profile
-   services
-   availability

## Phase 5 --- Creator application

-   application endpoint
-   profile update
-   service creation/update
-   availability

## Phase 6 --- Admin workflow

-   authentication
-   admin authorization
-   pending creators
-   review
-   approve
-   reject
-   request changes
-   unpublish
-   audit logs

## Phase 7 --- Uploads

-   creator photo upload
-   validation
-   local storage

## Phase 8 --- Tests

-   critical API tests
-   status workflow tests
-   authorization tests

## Phase 9 --- Documentation

-   API documentation
-   database documentation
-   setup documentation
-   architecture decisions

## Phase 10 --- Final verification

Run the entire application from a clean state.

Verify:

``` text
database setup
↓
seed
↓
server
↓
public API
↓
creator application
↓
admin login
↓
admin approval
↓
creator becomes publicly visible
```

------------------------------------------------------------------------

# 37. MANAGEMENT DEMO SCENARIO

The backend should support this exact demonstration:

## Step 1

Open Career Connect.

The frontend requests:

``` http
GET /api/career-connect/creators
```

and displays seeded approved creators.

## Step 2

Filter:

``` text
Mock Interview
```

The API returns matching creators.

## Step 3

Open a creator.

Frontend calls:

``` http
GET /api/career-connect/creators/:id
```

The profile contains multiple services.

## Step 4

Show service-specific availability.

Example:

``` text
Consultation
Wednesday 18:00–20:00

Mock Interview
Saturday 10:00–13:00
```

## Step 5

Open the creator application flow.

Submit a new creator.

The backend creates:

``` text
PENDING_VERIFICATION
```

## Step 6

Log into admin.

Open the pending creator.

Approve the creator.

## Step 7

Refresh public Career Connect.

The newly approved creator now appears publicly.

This is the core "wow, it actually works" demonstration.

------------------------------------------------------------------------

# 38. QUALITY BAR

This is an MVP, but it must be a **working MVP**, not a collection of
mock endpoints.

A manager should be able to see:

``` text
Marketplace
    ↓
Creator
    ↓
Services
    ↓
Creator Application
    ↓
Admin Verification
    ↓
Approval
    ↓
Public Visibility
```

with actual database persistence.

Do not fake the status workflow in memory.

Do not hardcode creators into API responses.

Do not hardcode approval state into the frontend.

Use SQLite as the source of truth.

------------------------------------------------------------------------

# 39. ERROR HANDLING

Do not allow raw stack traces to be returned to API clients.

Return useful HTTP status codes.

At minimum:

``` text
200 OK
201 Created
400 Bad Request
401 Unauthorized
403 Forbidden
404 Not Found
409 Conflict
500 Internal Server Error
```

Use clear error messages.

Log useful debugging information on the server.

------------------------------------------------------------------------

# 40. CODE STYLE

Keep code readable for an intern/junior engineer.

Prefer:

``` js
const creator = getCreatorById(id);
```

over unnecessary abstractions.

Use descriptive names.

Keep functions small.

Avoid giant controller files.

Avoid giant single-file applications.

Avoid comments that merely repeat the code.

Add comments only when explaining a non-obvious decision.

------------------------------------------------------------------------

# 41. GIT DISCIPLINE

Make logical commits.

Suggested commits:

``` text
chore: bootstrap career connect mvp repository
feat: add sqlite database schema
feat: add creator marketplace api
feat: add creator application api
feat: add admin verification workflow
feat: add authentication
feat: add creator image uploads
test: add critical marketplace and admin tests
docs: document api and database
```

Do not make hundreds of tiny commits.

Do not squash unrelated work together.

------------------------------------------------------------------------

# 42. IMPORTANT: DO NOT WAIT FOR ME UNNECESSARILY

You are expected to implement the backend autonomously.

Do not ask me for approval after every file.

Do not ask:

> "Should I create the database?"

Create it.

Do not ask:

> "Should I add the API?"

Add it.

Do not ask:

> "Should I create tests?"

Create the critical tests.

Use the PRD and this document as your instructions.

Only stop and ask me if you encounter a genuine blocker such as:

-   missing required information that cannot reasonably be inferred
-   destructive conflict with existing work
-   authentication/permission limitation
-   inability to access required files
-   an implementation decision that materially changes the product
    requirements

For normal engineering decisions, make the simplest reasonable choice
and document it.

------------------------------------------------------------------------

# 43. IMPORTANT: TOKEN EFFICIENCY

This project is being built with limited AI coding-agent usage.

Be token-efficient.

Do NOT:

-   repeatedly restate the PRD
-   generate huge explanations before implementation
-   create unnecessary documentation
-   regenerate files that already work
-   refactor working code without reason
-   inspect unrelated frontend files
-   install unnecessary dependencies
-   create speculative future architecture
-   write massive comments
-   implement future features

When a task is complete, move to the next task.

Prefer direct implementation and concise progress reports.

------------------------------------------------------------------------

# 44. WHEN YOU FINISH EACH PHASE

Give a concise report containing:

``` text
Completed:
- ...

Files created/changed:
- ...

Commands:
- ...

Tests:
- ...

Known limitations:
- ...
```

Do not dump entire files into the chat unless necessary.

------------------------------------------------------------------------

# 45. FINAL ACCEPTANCE CHECKLIST

Before declaring the backend MVP complete, verify every item:

## Repository

-   [ ] Git repository initialized
-   [ ] clean project structure
-   [ ] frontend/backend separation
-   [ ] initial bootstrap commit
-   [ ] useful README

## Backend

-   [ ] Node.js 24 compatible
-   [ ] Express server works
-   [ ] SQLite works
-   [ ] setup command works
-   [ ] seed command works
-   [ ] health endpoint works

## Public marketplace

-   [ ] creator listing works
-   [ ] only APPROVED creators appear
-   [ ] service filtering works
-   [ ] creator profile works
-   [ ] multiple services work
-   [ ] service-specific availability works

## Creator

-   [ ] application works
-   [ ] required fields validated
-   [ ] multiple services supported
-   [ ] independent service pricing works
-   [ ] independent service duration works
-   [ ] meeting Yes/No works
-   [ ] availability works
-   [ ] delivery time works

## Admin

-   [ ] admin login works
-   [ ] pending queue works
-   [ ] creator review works
-   [ ] approve works
-   [ ] reject works
-   [ ] request changes works
-   [ ] unpublish works
-   [ ] admin actions logged

## Security

-   [ ] password hashes never returned
-   [ ] admin endpoints protected
-   [ ] creator permissions enforced
-   [ ] verification status cannot be changed by creators
-   [ ] private verification data not public
-   [ ] image upload validation works

## Documentation

-   [ ] API.md complete
-   [ ] DATABASE.md complete
-   [ ] DECISIONS.md complete
-   [ ] backend README complete
-   [ ] root README complete
-   [ ] frontend README tells frontend engineer how to connect

## Demo

-   [ ] seeded creators visible
-   [ ] filter works
-   [ ] creator profile works
-   [ ] creator application works
-   [ ] admin approval works
-   [ ] newly approved creator becomes public automatically

------------------------------------------------------------------------

# 46. FINAL INSTRUCTION

Start now.

First:

1.  Read the entire attached PRD.
2.  Inspect the repository.
3.  Bootstrap the Git repository and directory structure.
4.  Make the initial bootstrap commit.
5.  Then begin implementing the backend according to this document and
    the PRD.
6.  Do not touch `/frontend`.
7.  Work autonomously through the backend MVP.
8.  Keep everything minimal.
9.  Test as you go.
10. Finish with a concise implementation report and exact commands
    needed to run the backend.

Remember:

**This is a management-demo MVP, not a production rewrite.**

The goal is not to build the most sophisticated architecture.

The goal is:

``` text
FAST
+
FUNCTIONAL
+
DATABASE-BACKED
+
DEMONSTRABLE
+
EASY TO DEBUG
+
EASY TO HAND OFF
```

Build the smallest system that convincingly demonstrates the Career
Connect product described by the PRD.
