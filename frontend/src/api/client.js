// Thin wrapper around fetch for the Career Connect backend's
// { success, data } / { success: false, error } response envelope.
// See ../../../docs/API.md for the full contract.

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000/api'

export class ApiError extends Error {
  constructor(status, code, message) {
    super(message)
    this.status = status
    this.code = code
  }
}

export async function apiRequest(path, { method = 'GET', body, token } = {}) {
  const headers = { 'Content-Type': 'application/json' }
  if (token) headers.Authorization = `Bearer ${token}`

  let response
  try {
    response = await fetch(`${API_BASE_URL}${path}`, {
      method,
      headers,
      body: body ? JSON.stringify(body) : undefined,
    })
  } catch {
    throw new ApiError(0, 'NETWORK_ERROR', 'Could not reach the Career Connect backend. Is it running?')
  }

  const payload = await response.json().catch(() => null)

  if (!response.ok || !payload?.success) {
    const { code, message } = payload?.error ?? {}
    throw new ApiError(response.status, code ?? 'UNKNOWN_ERROR', message ?? 'Something went wrong.')
  }

  return payload.data
}
