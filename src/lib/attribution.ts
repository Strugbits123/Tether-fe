/**
 * Acquisition-attribution capture + retrieval.
 *
 * UTMs live on the landing URL but are lost once the user navigates to the
 * register page. To survive that, we capture attribution ONCE on first page
 * load into sessionStorage (first-touch wins) and read it back at signup.
 *
 * The backend whitelists EXACTLY these keys and rejects anything else:
 *   acquisition_source, utm_source, utm_medium, utm_campaign, utm_term,
 *   utm_content, referrer
 *
 * `collectSignupAttribution` returns only keys that have a value, so callers
 * can spread the result directly into the signup request body. SSR-safe.
 */
export type SignupAttribution = {
  acquisition_source?: string
  utm_source?: string
  utm_medium?: string
  utm_campaign?: string
  utm_term?: string
  utm_content?: string
  referrer?: string
}

const STORAGE_KEY = 'tether_attribution'

// Reads attribution from the CURRENT page URL + referrer. Only meaningful on
// the first page a visitor lands on (later, referrer becomes an internal page).
function readFromUrl(): SignupAttribution {
  if (typeof window === 'undefined' || typeof document === 'undefined') {
    return {}
  }

  const params = new URLSearchParams(window.location.search)
  const utm = {
    utm_source: params.get('utm_source') || undefined,
    utm_medium: params.get('utm_medium') || undefined,
    utm_campaign: params.get('utm_campaign') || undefined,
    utm_term: params.get('utm_term') || undefined,
    utm_content: params.get('utm_content') || undefined,
  }

  const referrer = document.referrer || undefined

  let referrerHost: string | null = null
  if (referrer) {
    try {
      referrerHost = new URL(referrer).hostname
    } catch {
      referrerHost = null
    }
  }

  const acquisition_source = utm.utm_source || referrerHost || 'direct'

  const result: SignupAttribution = { acquisition_source }
  if (utm.utm_source) result.utm_source = utm.utm_source
  if (utm.utm_medium) result.utm_medium = utm.utm_medium
  if (utm.utm_campaign) result.utm_campaign = utm.utm_campaign
  if (utm.utm_term) result.utm_term = utm.utm_term
  if (utm.utm_content) result.utm_content = utm.utm_content
  if (referrer) result.referrer = referrer

  return result
}

/**
 * Persists first-touch attribution for the current browser session. Call once
 * as early as possible on app load (before the user can navigate away). Does
 * nothing if attribution was already captured this session — first touch wins.
 */
export function captureAttribution(): void {
  if (typeof window === 'undefined') return
  try {
    if (window.sessionStorage.getItem(STORAGE_KEY)) return
    window.sessionStorage.setItem(STORAGE_KEY, JSON.stringify(readFromUrl()))
  } catch {
    // sessionStorage unavailable (private mode / disabled) — no-op.
  }
}

/**
 * Returns the attribution to attach to the signup request: the persisted
 * first-touch value if present, otherwise whatever the current URL carries.
 */
export function collectSignupAttribution(): SignupAttribution {
  if (typeof window === 'undefined' || typeof document === 'undefined') {
    return {}
  }
  try {
    const stored = window.sessionStorage.getItem(STORAGE_KEY)
    if (stored) return JSON.parse(stored) as SignupAttribution
  } catch {
    // fall through to a live URL read
  }
  return readFromUrl()
}
