export const CATEGORY_META = {
  consultation: { label: 'Consultation Call', color: '#1d4e82' },
  resume: { label: 'Resume Review', color: '#0f6e68' },
  portfolio: { label: 'Portfolio Review', color: '#6a4c93' },
  'mock-interview': { label: 'Mock Interview', color: '#b3412f' },
  mentorship: { label: 'Mentorship', color: '#b9822c' },
  referral: { label: 'Verified Referral', color: '#0f2c4c' },
}

export function getCategoryMeta(categoryId) {
  return CATEGORY_META[categoryId] ?? { label: categoryId, color: '#46566a' }
}

// Convert a hex color to an rgba() string at the given alpha, used for the
// light tinted backgrounds/borders behind category tags and service stubs.
export function withAlpha(hex, alpha) {
  const clean = hex.replace('#', '')
  const r = parseInt(clean.substring(0, 2), 16)
  const g = parseInt(clean.substring(2, 4), 16)
  const b = parseInt(clean.substring(4, 6), 16)
  return `rgba(${r}, ${g}, ${b}, ${alpha})`
}
