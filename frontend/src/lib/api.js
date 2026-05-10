// Resolve API base URL with sane defaults.
// - In dev (no VITE_API_URL), use the relative `/api` path so Vite's proxy hits localhost:5000.
// - In production, VITE_API_URL must point at the backend (e.g. https://fanvora-api.onrender.com/api).
const RAW = import.meta.env.VITE_API_URL?.trim()
export const API_URL = RAW && RAW.length > 0 ? RAW.replace(/\/$/, '') : '/api'

// Parse a fetch Response, tolerating servers that return HTML (e.g. when the
// SPA fallback catches a misrouted /api request) instead of JSON.
export async function parseResponse(res) {
  const contentType = res.headers.get('content-type') || ''

  if (contentType.includes('application/json')) {
    return res.json()
  }

  const text = await res.text()
  if (text.trimStart().startsWith('<')) {
    throw new Error(
      `The server returned an HTML page instead of JSON (status ${res.status}). ` +
      `Check that VITE_API_URL points at the running backend.`
    )
  }
  if (!text) return {}

  try {
    return JSON.parse(text)
  } catch {
    throw new Error(`Unexpected response from server (status ${res.status}).`)
  }
}

// Wrapper around fetch that always returns parsed JSON-or-throws.
export async function apiFetch(path, options = {}) {
  let res
  try {
    res = await fetch(`${API_URL}${path}`, options)
  } catch (err) {
    throw new Error(
      err?.message?.includes('Failed to fetch')
        ? 'Cannot reach the server. Please check your connection and try again.'
        : err?.message || 'Network error'
    )
  }

  const data = await parseResponse(res)
  if (!res.ok) {
    throw new Error(data?.message || `Request failed (${res.status})`)
  }
  return data
}
