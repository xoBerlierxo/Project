# CAREER CONNECT — Detailed Product Requirements Document (PRD)

> Transcribed from `ReferralWorld_Careers_Career_Connect_Detailed_PRD.pdf`
> (MVP v1.0) so the source of truth lives in the repo alongside the code
> that implements it. This is the original product spec, unedited in
> substance — for how the current build maps onto it, see
> [PRODUCT_AND_SERVICES.md](PRODUCT_AND_SERVICES.md).

**Product:** ReferralWorld Careers
**Module:** Career Connect Marketplace
**Audience:** Software Engineering Interns / Product & Admin Team
**Document version:** MVP v1.0

**Purpose:** Build a marketplace where verified professionals can offer
career services such as consultation calls, resume reviews, portfolio
reviews, mock interviews, mentorship, and verified referral assistance. Job
seekers can discover creators, filter services, open profiles, and select
an offering.

---

## 1. Product Overview

Career Connect is the professional-services marketplace inside
ReferralWorld Careers. It is not limited to referrals. A verified creator
can choose one or more services and set an individual price, duration,
meeting requirement, availability, and delivery method.

### Core marketplace principle

A visitor should be able to enter Career Connect, understand the available
services immediately, discover creators, filter by service type, open a
creator profile, review all offerings, and choose the service that fits
their need.

### Primary service categories for MVP

- **Consultation Call** — 30-minute or 60-minute career discussion.
- **Resume Review** — creator reviews a candidate's resume and provides feedback.
- **Portfolio Review** — creator reviews a portfolio/project/portfolio website.
- **Mock Interview** — technical, HR, behavioral, or role-specific interview.
- **Mentorship** — structured career guidance session(s).
- **Verified Referral** — creator offers referral assistance where they are
  genuinely able and willing to submit a candidate.

### Important product wording

The platform must never imply that a referral guarantees an interview,
offer, or job. If the product uses the term "guaranteed referral," it must
mean a guaranteed submission or referral attempt subject to the creator's
stated eligibility and company process — not a guaranteed hiring outcome.

## 2. Goals and Non-Goals

### Goals

- Create a simple, mobile-friendly marketplace for career services.
- Allow creators to control which services they offer and set separate
  pricing for each service.
- Require admin verification before a creator becomes publicly visible.
- Give candidates enough information to make an informed purchase/request.
- Make the MVP simple enough for interns to build and deploy.

### Non-goals for MVP

- Do not build a complex payment-split system unless required for the
  initial launch.
- Do not build a full automated calendar ecosystem if manual confirmation
  is sufficient.
- Do not guarantee interviews, jobs, or hiring outcomes.
- Do not expose private verification documents publicly.

## 3. Roles and Permissions

| Role | Permissions |
|---|---|
| Visitor / Seeker | Browse public creators, use filters, open creator profiles, view services and prices. |
| Creator Applicant | Submit creator application, provide profile details, create service offerings, submit for verification. |
| Verified Creator | Public profile becomes visible after admin approval; can maintain allowed profile/service information. |
| Admin | Review applications, verify evidence, approve/reject, request changes, publish/unpublish creators, manage services and moderation. |

## 4. End-to-End User Journeys

### A. Job seeker / customer journey

- User sees Career Connect in the main website navbar.
- User taps Career Connect.
- Career Connect main page opens with Become a Creator button on the right/top area.
- User sees creator cards and service filters.
- User selects a filter such as Consultation, Resume Review, Portfolio
  Review, Mock Interview, Interview, or Verified Referral.
- User opens a creator profile.
- Profile displays creator identity, current company/status, role,
  experience, services, price, duration, meeting requirement, and
  availability where applicable.
- User chooses an offering and proceeds to the booking/payment/request flow
  when that module is enabled.

### B. Creator journey

- Creator clicks Become a Creator.
- Completes profile information: name, photo, company/current status,
  email, LinkedIn, job title, years of experience.
- Selects one or more services.
- For each service, enters service name, duration, price, whether a
  meeting is required, and availability.
- Submits application.
- Application enters Admin → Pending Verification.
- Admin verifies the creator and approves or rejects the application.
- Only after approval does the creator appear on the live Career Connect page.

## 5. Career Connect Main Page

### Navbar entry

Add a short navbar item: Career Connect. This is preferable to a long
label such as "Career Services Marketplace".

### Main page layout

| Section | Requirement |
|---|---|
| Header | Title such as "Career Connect" + one-line explanation of finding verified professionals for career help. |
| CTA | Become a Creator button placed prominently on the right/top of the page. |
| Filters | Consultation Calls, Resume Review, Portfolio Review, Mock Interview, Interview, Mentorship, Verified Referral. |
| Creator grid | Cards showing image, name, short current-role/company descriptor, selected services, starting price if desired, and Verified badge. |
| Search | Optional MVP search by creator name, company, role, or service keyword. |
| Empty state | If a filter has no creators, explain that no verified creators are currently available and provide a clear reset-filter action. |

### Creator card fields

- Profile photo.
- Creator name.
- Current company OR "Not currently working".
- Current job title if working.
- Short one-line description.
- Verified badge only after admin approval.
- Service tags.
- Optional "From ₹X" starting price.
- View Profile button.

## 6. Creator Profile Page

The profile is the key conversion page. It must show what the creator
actually offers without requiring the user to guess.

### Profile structure

- Header: photo, creator name, verified badge.
- Professional status: current company and job title, or "Not currently working".
- Experience: years of experience.
- LinkedIn: creator's LinkedIn link may be displayed according to the
  product's final trust/marketplace policy.
- About: one concise creator description.
- Offerings: every service offered by that creator as a separate card.
- Service card: service name, description, duration, price, meeting
  requirement, availability/delivery information.
- CTA: Book / Request / Continue button depending on whether
  booking/payment is enabled.

### Example service cards

| Service | Duration | Meeting? | Price | Availability / delivery |
|---|---|---|---|---|
| 30-min Career Consultation | 30 min | Yes | ₹499 | Mon/Wed 7–9 PM |
| Resume Review | — | No | ₹299 | Delivered within 48 hours |
| Mock Interview | 60 min | Yes | ₹999 | Sat 10 AM–1 PM |
| Verified Referral | — | Optional | Creator-defined | Based on creator availability / stated process |

## 7. Become a Creator

### Entry point

The Become a Creator button on Career Connect opens a dedicated
application form.

### Creator information fields

| Field | Required? | Notes |
|---|---|---|
| Name | Yes | Full display name. |
| Photo | Yes | Professional profile image; validate file type/size. |
| Company | Conditional | Current company if working; otherwise allow "Not currently working". |
| Email | Yes | Used for account/contact and verification. |
| LinkedIn | Yes | Profile URL; validate URL format. |
| Job title | Conditional | Current role if working. |
| Years of experience | Yes | Numeric/select value. |
| Short description | Yes | Concise description of what the creator helps with. |

### Service offering section

A creator can add multiple services. Each service is an independent
configuration.

- Service name.
- Service category.
- Service description.
- Duration (e.g., 30 min, 60 min, or non-call delivery).
- Price — each service has its own price.
- Requires meeting? — Yes / No.
- If Yes: available days.
- If Yes: available time slots for that specific service.
- If No: expected delivery time (e.g., 24 hours / 48 hours / 3 days).
- Optional service-specific notes or requirements.
- Add another service button.

### Important: availability must be stored per service

Do not use one global availability schedule if creators can offer
different schedules for different services. For example, a creator may
offer consultation only on Wednesday evenings but mock interviews on
Saturday mornings.

### Application submission

- Show a preview before submission.
- Require agreement to marketplace rules and truthful-information policy.
- Submit button changes application status to Pending Verification.
- Creator sees a confirmation screen explaining that the profile will
  appear only after admin approval.

## 8. Service Creation and Availability

### Recommended UI

- Service category dropdown.
- Service name input.
- Description textarea.
- Duration selector.
- Price input.
- Meeting required toggle.
- If meeting = Yes → show days and time-slot controls.
- If meeting = No → hide calendar controls and show delivery-time selector.
- Save service button.
- Edit/delete service controls before submission or subject to admin policy.

### Time-slot model

For MVP, store simple recurring availability rather than building a
complete calendar integration. Example: Monday 18:00–20:00; Wednesday
18:00–21:00. Later, real-time calendar availability can be added.

## 9. Admin Panel and Verification

### Admin dashboard

| Admin area | Purpose |
|---|---|
| Pending Creators | List all submitted creator applications awaiting verification. |
| Approved Creators | List creators currently live on Career Connect. |
| Rejected / Changes Required | Store rejected applications and reason/status for follow-up. |
| Services | View service offerings and moderate/remove prohibited or misleading offerings. |
| Audit Log | Record who approved, rejected, unpublished, or changed a creator. |

### Admin review screen

When an admin opens a creator application, show:

- Profile photo.
- Name.
- Company/current status.
- Email.
- LinkedIn URL.
- Job title.
- Years of experience.
- Short description.
- All services, including individual prices and durations.
- Meeting requirement and service-specific availability.
- Verification status.
- Verification evidence/status.
- Application submitted date.
- Approve, Reject, Request Changes, Unpublish actions.

### Verification flow

1. Creator submits application.
2. System sets status = Pending Verification.
3. Admin checks creator's identity/professional association using the
   submitted information and approved verification method.
4. Admin may mark email as verified and/or record other verification evidence.
5. Admin approves the creator.
6. System sets profile status = Approved / Live.
7. Creator automatically becomes visible on the public Career Connect page.
8. If rejected, profile remains hidden and admin records a reason.

### Verification principle

Verification is an admin-controlled trust signal. A verified badge should
never be added merely because a user filled out a form. The admin must
complete the required verification checklist before approval.

## 10. Publishing Workflow

| Status | Visible publicly? | Meaning |
|---|---|---|
| Draft | No | Creator is editing. |
| Pending Verification | No | Submitted and awaiting admin review. |
| Changes Required | No | Admin needs corrections/evidence. |
| Approved / Live | Yes | Creator appears in Career Connect. |
| Rejected | No | Application is not approved. |
| Unpublished | No | Previously approved creator has been temporarily removed. |

### Critical implementation rule

The public Career Connect query must return only creators with status =
Approved / Live. This prevents unverified profiles from accidentally
appearing.

## 11. Data Model

### Suggested entities

| Entity | Key fields |
|---|---|
| User | id, email, auth provider, role, created_at |
| CreatorProfile | id, user_id, name, photo_url, company, current_status, linkedin_url, job_title, years_experience, description, status, created_at, updated_at |
| CreatorService | id, creator_id, category, name, description, duration_minutes, price, meeting_required, delivery_time, active |
| AvailabilitySlot | id, service_id, weekday, start_time, end_time, timezone, active |
| Verification | id, creator_id, verification_type, status, checked_by, checked_at, notes |
| AdminAction | id, admin_id, creator_id, action, reason, created_at |

### Suggested status enums

`creator_status = DRAFT | PENDING_VERIFICATION | CHANGES_REQUIRED | APPROVED | REJECTED | UNPUBLISHED`

## 12. Suggested API / Backend Contracts

These are implementation suggestions; adapt them to the existing
ReferralWorld Careers stack.

| Method | Endpoint | Purpose |
|---|---|---|
| GET | `/api/career-connect/creators` | Return approved/live creator cards with optional filters. |
| GET | `/api/career-connect/creators/:id` | Return one public creator profile and active services. |
| POST | `/api/creators/apply` | Create creator application. |
| PUT | `/api/creators/:id` | Update creator profile before/after approval according to policy. |
| POST | `/api/creators/:id/services` | Create a service. |
| PUT | `/api/services/:id` | Update a service. |
| POST | `/api/admin/creators/:id/approve` | Approve and publish creator. |
| POST | `/api/admin/creators/:id/reject` | Reject with reason. |
| POST | `/api/admin/creators/:id/unpublish` | Remove creator from public marketplace. |

### Filter parameters

Example: `?category=mock-interview&company=Microsoft&min_price=200&max_price=1500`

## 13. Validation, Security and Trust

- Validate email and LinkedIn URL format.
- Use authentication and authorization for creator/admin actions.
- Never expose private verification notes or documents to public users.
- Only admins can change verification status.
- Sanitize user-generated descriptions to prevent XSS.
- Rate-limit creator applications and admin endpoints.
- Restrict image upload types and sizes.
- Keep an audit trail for approval/rejection/unpublish decisions.
- Do not publicly expose personal email addresses unless the creator
  explicitly chooses to.
- Do not claim that any creator can guarantee an interview or job.
- For referral services, display clear language that hiring decisions
  remain with the company.

## 14. UX / UI Requirements

### Design principles

- Mobile-first because a large portion of the target audience will browse
  from phones.
- Use cards with clear hierarchy: person → credibility → service → price → action.
- Keep the number of form fields understandable by grouping them into
  Profile, Services, Availability, and Review.
- Use clear labels instead of ambiguous terms.
- Show a visible Verified badge only for approved profiles.
- Do not overwhelm the creator page with long work histories if the
  product intentionally uses only current company/status, role, and years
  of experience.
- Show one clear CTA per service.

### Recommended page hierarchy

Navbar → Career Connect → Filters + Creator Cards → Creator Profile →
Service Selection → Booking/Request (future/current implementation) →
Confirmation

## 15. MVP Acceptance Criteria

### Definition of Done

- Career Connect appears in the main navbar.
- Career Connect page loads creator cards.
- Become a Creator button is visible and functional.
- Filters work for the defined service categories.
- Creator cards show photo, name, current company/status, and what they offer.
- Creator profile shows all active offerings for that creator.
- Creator can add multiple services.
- Each service supports an independent price.
- Each service supports its own duration.
- Each service supports meeting Yes/No.
- If meeting = Yes, service-specific availability can be entered.
- If meeting = No, delivery time can be entered.
- Creator application enters Pending Verification.
- Admin can review the complete profile and services.
- Admin can approve/reject/request changes.
- Only approved creators appear on the live Career Connect page.
- Approval automatically makes the profile public without requiring a
  developer/database edit.
- Rejected/unpublished creators are not shown publicly.
- Admin actions are logged.
- Public pages are responsive on desktop and mobile.

## 16. Testing Checklist

### Creator-side tests

- Submit with missing required fields → validation shown.
- Upload invalid/oversized photo → blocked.
- Add one service → saved correctly.
- Add multiple services → each keeps separate price and duration.
- Meeting = Yes → availability fields appear.
- Meeting = No → availability fields disappear and delivery time appears.
- Submit application → status becomes Pending Verification.

### Admin-side tests

- Pending application appears in admin queue.
- Admin can open all creator details.
- Admin can approve → creator becomes public.
- Admin can reject → creator remains hidden.
- Admin can request changes → creator remains hidden.
- Admin can unpublish an approved creator → creator disappears from public listing.

### Public marketplace tests

- Only APPROVED creators are returned by the public API.
- Every service card displays the correct creator-specific price.
- Filters return only matching creators/services.
- Creator profile shows the complete approved service list.
- Mobile layout is usable.

## 17. Future Enhancements

- Integrated payments and automated platform commission.
- Automated creator payouts.
- Real-time calendar synchronization.
- Google Calendar / Outlook integration.
- Automated meeting links.
- Ratings and written reviews.
- Creator earnings dashboard.
- Booking history and cancellation policies.
- Refund/dispute management.
- Creator analytics: profile views, service clicks, conversion.
- Search by company, role, experience, price, and rating.
- Featured creators.
- Bundles such as Resume + Mock Interview + Referral.
- Creator subscriptions or premium placement.
- Automated verification providers and work-email verification.

## Implementation Note for Interns

Build the MVP so the admin workflow is the source of truth: creators
submit applications, admins verify them, and only approved records are
published. Keep the public marketplace read-only with respect to creator
verification status. Avoid hardcoding creator data into the frontend. The
final result should be deployable and should include a working admin
flow, responsive UI, database-backed creator/service records, and clear
setup instructions.

*End of PRD*
