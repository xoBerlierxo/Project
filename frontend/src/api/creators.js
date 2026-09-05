import { apiRequest } from './client'
import { adaptCreator, toBackendCategory } from './adapters'

export async function fetchApprovedCreators({ category } = {}) {
  const query = category && category !== 'all' ? `?category=${toBackendCategory(category)}` : ''
  const { creators } = await apiRequest(`/career-connect/creators${query}`)
  return creators.map(adaptCreator)
}

export async function fetchCreatorProfile(id) {
  const { creator } = await apiRequest(`/career-connect/creators/${id}`)
  return adaptCreator(creator)
}

// Submits the creator application itself. Returns the raw backend creator
// record (id, status, ...) plus a bearer token for the service-creation
// calls that follow in the same application flow.
export async function applyAsCreator(profile) {
  const body = {
    name: profile.name,
    email: profile.email,
    linkedin_url: profile.linkedinUrl,
    current_status: profile.isWorking ? 'WORKING' : 'NOT_WORKING',
    company: profile.isWorking ? profile.company : undefined,
    job_title: profile.isWorking ? profile.jobTitle : undefined,
    years_experience: Number(profile.yearsExperience),
    description: profile.description,
  }
  return apiRequest('/creators/apply', { method: 'POST', body })
}

export async function createCreatorService(creatorId, token, service) {
  const meetingRequired = Boolean(service.meetingRequired)
  const body = {
    category: toBackendCategory(service.category),
    name: service.name,
    description: service.description,
    price: Number(service.price),
    meeting_required: meetingRequired,
  }

  if (meetingRequired) {
    body.duration_minutes = parseDurationMinutes(service.duration)
    body.availability = [
      { weekday: service.weekday, start_time: service.startTime, end_time: service.endTime },
    ]
  } else {
    body.delivery_time = service.deliveryTime
  }

  return apiRequest(`/creators/${creatorId}/services`, { method: 'POST', body, token })
}

function parseDurationMinutes(durationText) {
  const match = String(durationText ?? '').match(/\d+/)
  return match ? Number(match[0]) : undefined
}

export async function requestService({ serviceId, customerName, customerEmail, message }) {
  const body = {
    service_id: serviceId,
    customer_name: customerName,
    customer_email: customerEmail,
    message,
  }
  const { request } = await apiRequest('/service-requests', { method: 'POST', body })
  return request
}
