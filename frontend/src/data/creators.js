// Service category options shown in the filter bar and the "Become a
// Creator" form. Creator/service data itself now comes from the live
// backend (see src/api/creators.js) — this file only holds the static
// category list, which the UI needs before any data has loaded.

export const SERVICE_CATEGORIES = [
  { id: 'consultation', label: 'Consultation Call' },
  { id: 'resume', label: 'Resume Review' },
  { id: 'portfolio', label: 'Portfolio Review' },
  { id: 'mock-interview', label: 'Mock Interview' },
  { id: 'mentorship', label: 'Mentorship' },
  { id: 'referral', label: 'Verified Referral' },
]
