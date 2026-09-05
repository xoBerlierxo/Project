// Translates between the frontend's slug-based category ids / camelCase field
// names (used throughout src/components) and the backend's UPPER_SNAKE_CASE
// enums / snake_case fields (see ../../../docs/API.md). Keeping the mapping
// in one place means components never need to know the backend's shape.

export const CATEGORY_TO_BACKEND = {
  consultation: 'CONSULTATION',
  resume: 'RESUME_REVIEW',
  portfolio: 'PORTFOLIO_REVIEW',
  'mock-interview': 'MOCK_INTERVIEW',
  mentorship: 'MENTORSHIP',
  referral: 'VERIFIED_REFERRAL',
}

const BACKEND_TO_CATEGORY = Object.fromEntries(
  Object.entries(CATEGORY_TO_BACKEND).map(([slug, backendValue]) => [backendValue, slug]),
)

export function toBackendCategory(categoryId) {
  return CATEGORY_TO_BACKEND[categoryId] ?? categoryId
}

export function fromBackendCategory(backendCategory) {
  return BACKEND_TO_CATEGORY[backendCategory] ?? backendCategory
}

const WEEKDAY_LABEL = { MON: 'Mon', TUE: 'Tue', WED: 'Wed', THU: 'Thu', FRI: 'Fri', SAT: 'Sat', SUN: 'Sun' }

export function initialsFromName(name = '') {
  return name
    .split(' ')
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase())
    .join('')
}

// [{ weekday: 'WED', start_time: '18:00', end_time: '20:00' }, ...] ->
// "Wed 18:00–20:00" (joined with '; ' when a service has more than one slot)
export function formatAvailability(slots = []) {
  if (slots.length === 0) return ''
  return slots
    .map((slot) => `${WEEKDAY_LABEL[slot.weekday] ?? slot.weekday} ${slot.start_time}–${slot.end_time}`)
    .join('; ')
}

function adaptService(service) {
  return {
    id: service.id,
    category: fromBackendCategory(service.category),
    name: service.name,
    description: service.description,
    durationMinutes: service.duration_minutes,
    price: service.price,
    meetingRequired: service.meeting_required,
    availability: formatAvailability(service.availability),
    deliveryTime: service.delivery_time,
  }
}

// Shared by both the creator-card list and the full profile response —
// the public API returns the same profile fields for each.
export function adaptCreator(apiCreator) {
  return {
    id: apiCreator.id,
    name: apiCreator.name,
    photoInitials: initialsFromName(apiCreator.name),
    photoUrl: apiCreator.photo_url,
    company: apiCreator.company,
    jobTitle: apiCreator.job_title,
    isWorking: apiCreator.current_status === 'WORKING',
    yearsExperience: apiCreator.years_experience,
    linkedinUrl: apiCreator.linkedin_url,
    description: apiCreator.description,
    // The public API only ever returns approved creators, but components
    // still read `status` (kept from the original mock data shape).
    status: 'APPROVED',
    services: (apiCreator.services ?? []).map(adaptService),
  }
}
