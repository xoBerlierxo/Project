# Career Connect Database

SQLite file: `backend/database/career-connect.db` (created by `npm run setup`).

## Entity relationship

```text
users
  |
  | 1:1 (a creator user has exactly one profile)
  v
creator_profiles
  |
  | 1:N
  v
creator_services
  |
  | 1:N
  v
availability_slots

creator_profiles --1:1--> verifications
creator_profiles --1:N--> admin_actions
creator_services --1:N--> service_requests
```

## Tables

### users
| column | notes |
|---|---|
| id | PK |
| email | unique |
| password_hash | bcrypt |
| role | `SEEKER` \| `CREATOR` \| `ADMIN` |
| created_at | |

### creator_profiles
| column | notes |
|---|---|
| id | PK |
| user_id | FK -> users.id |
| name, photo_url, company, current_status, linkedin_url, job_title, years_experience, description | profile fields from the PRD |
| status | `DRAFT` \| `PENDING_VERIFICATION` \| `CHANGES_REQUIRED` \| `APPROVED` \| `REJECTED` \| `UNPUBLISHED` |
| created_at, updated_at | |

**Only `status = APPROVED` rows are ever returned by public endpoints.** This
is enforced in the SQL query (`WHERE status = 'APPROVED'`), not in application
code or the frontend.

### creator_services
| column | notes |
|---|---|
| id | PK |
| creator_id | FK -> creator_profiles.id |
| category | one of the 6 PRD service categories |
| name, description, price | independent per service |
| duration_minutes | set when `meeting_required = 1` |
| meeting_required | 0/1 |
| delivery_time | set when `meeting_required = 0` |
| active | soft-delete flag |

Availability is intentionally **per service, not per creator** — a creator can
offer Consultation on Wednesday evenings and Mock Interviews on Saturday
mornings, each with their own schedule.

### availability_slots
| column | notes |
|---|---|
| id | PK |
| service_id | FK -> creator_services.id |
| weekday | `MON`..`SUN` |
| start_time, end_time | `HH:MM`, recurring weekly (no calendar integration) |
| timezone | default `Asia/Kolkata` |
| active | soft-delete flag (updates replace slots by deactivating old ones) |

### verifications
| column | notes |
|---|---|
| id | PK |
| creator_id | FK -> creator_profiles.id |
| verification_type | `MANUAL_ADMIN_REVIEW` for MVP |
| status | `PENDING` \| `VERIFIED` \| `FAILED` |
| checked_by | FK -> users.id (admin) |
| checked_at, notes | private — never returned by public endpoints |

### admin_actions
| column | notes |
|---|---|
| id | PK |
| admin_id | FK -> users.id |
| creator_id | FK -> creator_profiles.id |
| action | `APPROVE` \| `REJECT` \| `REQUEST_CHANGES` \| `UNPUBLISH` |
| reason, created_at | audit trail for every state-changing admin action |

### service_requests

Minimal placeholder so the public "Book / Request" CTA does something real.
No payment, no calendar booking — just a stored lead.

| column | notes |
|---|---|
| id | PK |
| creator_id, service_id | FKs |
| customer_name, customer_email, message | |
| status | `PENDING` \| `ACCEPTED` \| `REJECTED` |

## Creator status lifecycle

```text
DRAFT -> PENDING_VERIFICATION -> APPROVED -> UNPUBLISHED
                |        ^
                v        |
        CHANGES_REQUIRED-+
                |
                v
            REJECTED
```
