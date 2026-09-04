# Career Connect API

Base URL (local dev): `http://localhost:3000/api`

All responses use this envelope:

```json
// success
{ "success": true, "data": { ... } }

// error
{ "success": false, "error": { "code": "VALIDATION_ERROR", "message": "..." } }
```

Auth: send `Authorization: Bearer <token>` for any endpoint marked "Auth required".
Tokens are returned by `POST /api/creators/apply` (creator) and `POST /api/auth/login` (admin).

Service categories: `CONSULTATION`, `RESUME_REVIEW`, `PORTFOLIO_REVIEW`, `MOCK_INTERVIEW`, `MENTORSHIP`, `VERIFIED_REFERRAL`

Creator statuses: `DRAFT`, `PENDING_VERIFICATION`, `CHANGES_REQUIRED`, `APPROVED`, `REJECTED`, `UNPUBLISHED`
(only `APPROVED` is publicly visible)

---

## GET /api/health

Health check. No auth.

**Response**
```json
{ "success": true, "data": { "status": "ok" } }
```

---

## GET /api/career-connect/creators

Public creator listing. Only returns creators with `status = APPROVED`. No auth.

**Query parameters**
- `category` (optional) — filter to creators with at least one active service in this category.

**Example**

`GET /api/career-connect/creators?category=MOCK_INTERVIEW`

**Response**
```json
{
  "success": true,
  "data": {
    "creators": [
      {
        "id": 1,
        "name": "Aarav Mehta",
        "photo_url": null,
        "company": "DemoTech",
        "current_status": "WORKING",
        "job_title": "Software Engineer",
        "description": "I help engineers prep for backend and system design interviews.",
        "verified": true,
        "service_categories": ["CONSULTATION", "MOCK_INTERVIEW"],
        "starting_price": 499
      }
    ]
  }
}
```

---

## GET /api/career-connect/creators/:id

Public creator profile with all active services and availability. Only returns
`APPROVED` creators (404 otherwise). No auth.

**Response**
```json
{
  "success": true,
  "data": {
    "creator": {
      "id": 1,
      "name": "Aarav Mehta",
      "photo_url": null,
      "company": "DemoTech",
      "current_status": "WORKING",
      "job_title": "Software Engineer",
      "years_experience": 4,
      "linkedin_url": "https://linkedin.com/in/aarav-mehta-demo",
      "description": "...",
      "verified": true,
      "services": [
        {
          "id": 1,
          "category": "CONSULTATION",
          "name": "30-min Career Consultation",
          "description": "...",
          "duration_minutes": 30,
          "price": 499,
          "meeting_required": true,
          "delivery_time": null,
          "availability": [
            { "weekday": "WED", "start_time": "18:00", "end_time": "20:00", "timezone": "Asia/Kolkata" }
          ]
        }
      ]
    }
  }
}
```

**Errors**: `404 NOT_FOUND` if the creator doesn't exist or isn't approved.

---

## POST /api/creators/apply

Submit a new creator application. No auth required to call; creates a `CREATOR`
user (or reuses one with the same email) and returns a bearer token for
subsequent creator-owned requests (profile updates, service creation).

Sets `status = PENDING_VERIFICATION`. Rate-limited to 10 requests/hour/IP.

**Request body**
```json
{
  "name": "Aarav Mehta",
  "email": "aarav@example.com",
  "linkedin_url": "https://linkedin.com/in/aarav",
  "current_status": "WORKING",
  "company": "DemoTech",
  "job_title": "Software Engineer",
  "years_experience": 4,
  "description": "I help engineers prep for interviews.",
  "photo_url": null
}
```

`current_status` is `WORKING` or `NOT_WORKING` (defaults to `WORKING`). When
`WORKING`, `company` and `job_title` are required.

**Response** `201`
```json
{ "success": true, "data": { "creator": { "id": 12, "status": "PENDING_VERIFICATION", ... }, "token": "<jwt>" } }
```

**Errors**: `400 VALIDATION_ERROR` for missing/invalid fields.

---

## PUT /api/creators/:id

Update a creator's own profile fields. Auth required (must own the profile).
Cannot change `status` (verification status is admin-controlled).

**Request body** (any subset of)
```json
{ "name": "...", "photo_url": "...", "company": "...", "current_status": "WORKING",
  "linkedin_url": "...", "job_title": "...", "years_experience": 5, "description": "..." }
```

**Response**
```json
{ "success": true, "data": { "creator": { ... } } }
```

**Errors**: `403 FORBIDDEN` if not the profile owner, `400 VALIDATION_ERROR` if no updatable fields given.

---

## POST /api/creators/:id/photo

Upload a creator profile photo. Auth required (must own the profile).
Multipart form with a single `photo` field. Accepts JPEG/PNG/WEBP up to 2MB.

**Response**
```json
{ "success": true, "data": { "creator": { "photo_url": "/uploads/<file>.jpg", ... } } }
```

**Errors**: `400 VALIDATION_ERROR` for invalid type/oversized file.

---

## POST /api/creators/:id/services

Create a service under a creator. Auth required (must own the profile).

**Request body**
```json
{
  "category": "MOCK_INTERVIEW",
  "name": "Backend Mock Interview",
  "description": "Full mock interview with system design and coding rounds.",
  "duration_minutes": 60,
  "price": 999,
  "meeting_required": true,
  "availability": [
    { "weekday": "SAT", "start_time": "10:00", "end_time": "13:00", "timezone": "Asia/Kolkata" }
  ]
}
```

If `meeting_required` is `false`, omit `availability`/`duration_minutes` and
provide `delivery_time` (e.g. `"Delivered within 48 hours"`) instead.

**Response** `201`
```json
{ "success": true, "data": { "service": { "id": 5, ... } } }
```

**Errors**: `400 VALIDATION_ERROR` (bad category/price/duration, or missing
availability/delivery_time for the given `meeting_required` value).

---

## PUT /api/services/:id

Update a service (any subset of fields, including `availability` to replace
the current slots). Auth required (must own the parent creator profile).

**Response**
```json
{ "success": true, "data": { "service": { ... } } }
```

---

## DELETE /api/services/:id

Deactivates a service (soft delete — `active = false`, no longer shown
publicly). Auth required (must own the parent creator profile).

**Response**
```json
{ "success": true, "data": { "deactivated": true } }
```

---

## POST /api/service-requests

Simple placeholder "request this service" action for the public service CTA.
No booking/payment — just records interest. No auth.

**Request body**
```json
{ "service_id": 5, "customer_name": "Jane Doe", "customer_email": "jane@example.com", "message": "optional note" }
```

**Response** `201`
```json
{ "success": true, "data": { "request": { "id": 1, "status": "PENDING", ... } } }
```

**Errors**: `400 VALIDATION_ERROR`, `404 NOT_FOUND` if the service isn't active/public.

---

## POST /api/auth/login

Admin (or any user) login. Rate-limited to 20 requests/15min/IP.

**Request body**
```json
{ "email": "admin@example.com", "password": "admin123" }
```

**Response**
```json
{ "success": true, "data": { "token": "<jwt>", "user": { "id": 1, "email": "...", "role": "ADMIN" } } }
```

**Errors**: `401 INVALID_CREDENTIALS`.

---

## Admin endpoints

All require `Authorization: Bearer <admin token>`.

### GET /api/admin/creators/pending
### GET /api/admin/creators/approved
### GET /api/admin/creators/rejected

List creators by status.

**Response**
```json
{ "success": true, "data": { "creators": [ { "id": 1, "status": "PENDING_VERIFICATION", ... } ] } }
```

### GET /api/admin/creators/:id

Full creator detail including all services (active or not), private email,
and verification record (notes are never exposed on public endpoints).

### POST /api/admin/creators/:id/approve

Sets `status = APPROVED`, marks verification `VERIFIED`, logs an `AdminAction`.

### POST /api/admin/creators/:id/reject

Body: `{ "reason": "..." }` (optional). Sets `status = REJECTED`.

### POST /api/admin/creators/:id/request-changes

Body: `{ "reason": "..." }` (optional). Sets `status = CHANGES_REQUIRED`.

### POST /api/admin/creators/:id/unpublish

Body: `{ "reason": "..." }` (optional). Sets `status = UNPUBLISHED` (removes an
approved creator from the public marketplace).

All four return:
```json
{ "success": true, "data": { "creator": { "id": 1, "status": "APPROVED", ... } } }
```

**Errors**: `401 UNAUTHORIZED` (no/invalid token), `403 FORBIDDEN` (non-admin), `404 NOT_FOUND`.

---

## Error codes

| Code | HTTP status | Meaning |
|---|---|---|
| VALIDATION_ERROR | 400 | Missing/invalid request data |
| UNAUTHORIZED | 401 | Missing/invalid bearer token |
| INVALID_CREDENTIALS | 401 | Bad login email/password |
| FORBIDDEN | 403 | Authenticated but not allowed to do this |
| NOT_FOUND | 404 | Resource doesn't exist or isn't public |
| RATE_LIMITED | 429 | Too many requests |
| INTERNAL_ERROR | 500 | Unexpected server error |
