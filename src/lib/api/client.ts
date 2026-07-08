const API_URL = process.env.NEXT_PUBLIC_API_URL

/**
 * The single error type every API failure surfaces as. `message` is always a
 * ready-to-render string and `statusCode` mirrors the HTTP status (0 for a
 * network/connection failure that never reached the server).
 */
export class ApiError extends Error {
  statusCode: number

  constructor(statusCode: number, message: string | string[]) {
    super(Array.isArray(message) ? message.join('; ') : message)
    this.name = 'ApiError'
    this.statusCode = statusCode
  }
}

/**
 * A human-readable fallback for when the server's body can't be parsed (HTML
 * error page, empty proxy 502/504, etc.) so the user never sees a raw
 * "Unexpected token <" or a blank failure.
 */
function fallbackMessage(status: number): string {
  if (status === 0)
    return 'Could not reach the server. Please check your connection and try again.'
  if (status === 401) return 'Your session has expired. Please sign in again.'
  if (status === 404) return 'The requested resource could not be found.'
  if (status === 429) return 'Too many requests. Please slow down and try again.'
  if (status >= 500) return 'The server ran into a problem. Please try again in a moment.'
  return 'Something went wrong. Please try again.'
}

/**
 * The one place that decides success vs. failure for the whole app.
 *
 * Resolves with the unwrapped `data` payload ONLY when the response is a 2xx
 * carrying the documented success envelope (`{ success: true, data }`). Every
 * other outcome throws an `ApiError`:
 *   1. non-2xx — even with a missing/empty/non-JSON body (HTML 500, 502/504…)
 *   2. a body with `success === false`
 *   3. a 2xx whose body isn't the success envelope (no silent `undefined`)
 *   4. a network/`fetch` rejection (offline, DNS, CORS, aborted)
 *
 * A successful response with no body (e.g. 204) resolves with `null`.
 */
async function request<T>(
  endpoint: string,
  options: RequestInit & { token?: string } = {},
): Promise<T> {
  const { token, ...fetchOptions } = options

  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...(fetchOptions.headers as Record<string, string>),
  }

  if (token) {
    headers['Authorization'] = `Bearer ${token}`
  }

  // (4) Network / DNS / CORS / abort — fetch itself rejects before any response.
  let response: Response
  try {
    response = await fetch(`${API_URL}${endpoint}`, { ...fetchOptions, headers })
  } catch {
    throw new ApiError(0, fallbackMessage(0))
  }

  // Read the body once as text so an empty or non-JSON body can't throw on us.
  const rawBody = await response.text()
  let body: unknown
  if (rawBody) {
    try {
      body = JSON.parse(rawBody)
    } catch {
      body = undefined // non-JSON (HTML error page, plain-text proxy error, …)
    }
  }

  const envelope = (body ?? null) as
    | { success?: unknown; statusCode?: unknown; message?: unknown; data?: unknown }
    | null

  // (1) Any non-2xx is a failure. Prefer the enveloped statusCode/message,
  // otherwise fall back to the HTTP status and a sensible message.
  if (!response.ok) {
    const statusCode =
      envelope && typeof envelope.statusCode === 'number'
        ? envelope.statusCode
        : response.status
    const message =
      envelope && typeof envelope.message === 'string' && envelope.message
        ? envelope.message
        : fallbackMessage(response.status)
    throw new ApiError(statusCode, message)
  }

  // (2) Explicit error envelope returned with a 2xx — still a failure.
  if (envelope && envelope.success === false) {
    const statusCode =
      typeof envelope.statusCode === 'number' ? envelope.statusCode : response.status
    const message =
      typeof envelope.message === 'string' && envelope.message
        ? envelope.message
        : fallbackMessage(response.status)
    throw new ApiError(statusCode, message)
  }

  // Empty/204 success — nothing to unwrap.
  if (envelope === null) {
    return null as T
  }

  // (3) A 2xx that isn't the documented success envelope is NOT a silent success.
  if (envelope.success !== true) {
    throw new ApiError(response.status, 'Received an unexpected response from the server.')
  }

  return envelope.data as T
}

export const api = {
  get: <T>(endpoint: string, token?: string) =>
    request<T>(endpoint, { method: 'GET', token }),

  post: <T>(endpoint: string, body: unknown, token?: string) =>
    request<T>(endpoint, {
      method: 'POST',
      body: JSON.stringify(body),
      token,
    }),

  patch: <T>(endpoint: string, body: unknown, token?: string) =>
    request<T>(endpoint, {
      method: 'PATCH',
      body: JSON.stringify(body),
      token,
    }),

  delete: <T>(endpoint: string, token?: string, body?: unknown) =>
    request<T>(endpoint, {
      method: 'DELETE',
      token,
      ...(body !== undefined ? { body: JSON.stringify(body) } : {}),
    }),
}
