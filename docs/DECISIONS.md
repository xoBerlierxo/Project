# Architecture Decisions

Short record of deliberate MVP choices for the production team.

**Why SQLite?**
Single file, zero external services, works identically on any dev machine.
Fine for demo-scale traffic; a production migration to Postgres is
straightforward since the schema is plain SQL with no ORM-specific quirks.

**Why Express?**
Minimal, well-understood, no framework magic to explain to interns.

**Why no ORM (Prisma/Sequelize/etc.)?**
Raw SQL via `better-sqlite3` is synchronous, fast, and the whole schema fits
in one file (`src/db/schema.js`). An ORM would add a layer of abstraction
with no real benefit at this scale.

**Why no payments?**
Explicitly out of scope for the MVP (PRD non-goal). `service_requests` is a
placeholder "interest" record, not a transaction.

**Why no calendar integration?**
Availability is stored as simple recurring weekly slots
(`availability_slots`: weekday + start/end time). Real-time calendar sync is
listed as a future enhancement in the PRD.

**Why availability belongs to services, not creators?**
The PRD explicitly calls this out: a creator can offer Consultation on
Wednesday evenings and Mock Interviews on Saturday mornings. A single
creator-level schedule couldn't represent that.

**Why do public APIs only return APPROVED creators?**
Enforced at the SQL layer (`WHERE status = 'APPROVED'`) rather than trusted to
the frontend, so an unverified profile can never leak into the public
marketplace by a frontend bug.

**Why does `/api/creators/apply` return a JWT immediately?**
The PRD's creator journey submits a profile and then adds services in the
same session, before any admin has looked at the application. Rather than
build a separate signup/login step, applying creates (or reuses) a `CREATOR`
user and returns a token the frontend can use right away for profile/service
calls, while `status` stays `PENDING_VERIFICATION` until an admin acts.

**Why an in-memory rate limiter instead of a package?**
Only needs to survive a single demo process; a fixed-window per-IP counter in
a `Map` is a few lines and avoids adding Redis or another dependency.
