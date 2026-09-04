const { ApiError } = require('./response');

const SERVICE_CATEGORIES = [
  'CONSULTATION',
  'RESUME_REVIEW',
  'PORTFOLIO_REVIEW',
  'MOCK_INTERVIEW',
  'MENTORSHIP',
  'VERIFIED_REFERRAL',
];

const WEEKDAYS = ['MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT', 'SUN'];

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const URL_RE = /^https?:\/\/.+/i;

function isEmail(value) {
  return typeof value === 'string' && EMAIL_RE.test(value);
}

function isLinkedInUrl(value) {
  return typeof value === 'string' && URL_RE.test(value) && value.toLowerCase().includes('linkedin.com');
}

function requireFields(body, fields) {
  const missing = fields.filter((f) => body[f] === undefined || body[f] === null || body[f] === '');
  if (missing.length > 0) {
    throw new ApiError(400, 'VALIDATION_ERROR', `Missing required fields: ${missing.join(', ')}`);
  }
}

function validateCreatorApplication(body) {
  requireFields(body, ['name', 'email', 'linkedin_url', 'years_experience', 'description']);

  if (!isEmail(body.email)) {
    throw new ApiError(400, 'VALIDATION_ERROR', 'Invalid email format');
  }
  if (!isLinkedInUrl(body.linkedin_url)) {
    throw new ApiError(400, 'VALIDATION_ERROR', 'Invalid LinkedIn URL format');
  }
  const years = Number(body.years_experience);
  if (!Number.isFinite(years) || years < 0 || years > 60) {
    throw new ApiError(400, 'VALIDATION_ERROR', 'years_experience must be a sensible number');
  }
  const currentStatus = body.current_status || 'WORKING';
  if (!['WORKING', 'NOT_WORKING'].includes(currentStatus)) {
    throw new ApiError(400, 'VALIDATION_ERROR', 'current_status must be WORKING or NOT_WORKING');
  }
  if (currentStatus === 'WORKING' && (!body.company || !body.job_title)) {
    throw new ApiError(400, 'VALIDATION_ERROR', 'company and job_title are required when current_status is WORKING');
  }
}

function validateService(body) {
  requireFields(body, ['category', 'name', 'description', 'price']);

  if (!SERVICE_CATEGORIES.includes(body.category)) {
    throw new ApiError(400, 'VALIDATION_ERROR', `category must be one of: ${SERVICE_CATEGORIES.join(', ')}`);
  }

  const price = Number(body.price);
  if (!Number.isFinite(price) || price < 0) {
    throw new ApiError(400, 'VALIDATION_ERROR', 'price must be a non-negative number');
  }

  if (body.duration_minutes !== undefined && body.duration_minutes !== null) {
    const duration = Number(body.duration_minutes);
    if (!Number.isFinite(duration) || duration <= 0) {
      throw new ApiError(400, 'VALIDATION_ERROR', 'duration_minutes must be a positive number');
    }
  }

  const meetingRequired = Boolean(body.meeting_required);

  if (meetingRequired) {
    if (!Array.isArray(body.availability) || body.availability.length === 0) {
      throw new ApiError(400, 'VALIDATION_ERROR', 'availability is required when meeting_required is true');
    }
    for (const slot of body.availability) {
      if (!WEEKDAYS.includes(slot.weekday)) {
        throw new ApiError(400, 'VALIDATION_ERROR', `availability.weekday must be one of: ${WEEKDAYS.join(', ')}`);
      }
      if (!/^\d{2}:\d{2}$/.test(slot.start_time) || !/^\d{2}:\d{2}$/.test(slot.end_time)) {
        throw new ApiError(400, 'VALIDATION_ERROR', 'availability start_time/end_time must be HH:MM');
      }
      if (slot.start_time >= slot.end_time) {
        throw new ApiError(400, 'VALIDATION_ERROR', 'availability start_time must be before end_time');
      }
    }
  } else {
    if (!body.delivery_time) {
      throw new ApiError(400, 'VALIDATION_ERROR', 'delivery_time is required when meeting_required is false');
    }
  }
}

module.exports = {
  SERVICE_CATEGORIES,
  WEEKDAYS,
  isEmail,
  isLinkedInUrl,
  requireFields,
  validateCreatorApplication,
  validateService,
};
