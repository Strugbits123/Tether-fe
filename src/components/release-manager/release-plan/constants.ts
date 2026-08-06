// Shared static data for the Release Manager Release Plan flow. Owner name,
// dates, parties, and recipient/delivery data are all real now (fetched via
// src/lib/api/rm.ts) and passed down as props instead of living here.

export const STEPS: { n: number; label: string }[] = [
  { n: 1, label: 'Initiate' },
  { n: 2, label: 'Notify' },
  { n: 3, label: 'Wait' },
  { n: 4, label: 'Deliver' },
  { n: 5, label: 'Complete' },
]

// How long Step 4 (delivery triggered) is shown before advancing to the
// recipient-tracking view — pure UI pacing, not a server-tracked phase.
export const DELIVER_DURATION_MS = 4000

export interface ReasonOption {
  label: string
  value:
    | 'death'
    | 'incapacitated'
    | 'early_release'
    | 'terminal_diagnosis'
    | 'legal_authority'
    | 'rm_unreachable'
    | 'other'
}

export const REASONS: ReasonOption[] = [
  { label: 'Death of the account owner', value: 'death' },
  { label: 'Account owner has requested release upon incapacitation', value: 'incapacitated' },
  { label: 'Account owner has requested early release', value: 'early_release' },
  {
    label: 'Legal directive - court order, guardianship, or power of attorney',
    value: 'legal_authority',
  },
  { label: 'Other - please explain below', value: 'other' },
]

export const MIN_DESCRIPTION = 100

// Every date in the release module renders as numeric M/D/YYYY — e.g. 3/10/2026.
// The locale is pinned to en-US rather than left as `undefined`: the default
// follows the viewer's locale, so the same timestamp would render 3/10/2026 for
// one RM and 10/03/2026 for another. On a release timeline — where the delivery
// date is the thing people act on — an ambiguous day/month is a real hazard.
export function formatReleaseDate(iso: string | null): string {
  if (!iso) return ''
  const d = new Date(iso)
  if (Number.isNaN(d.getTime())) return ''
  return d.toLocaleDateString('en-US', {
    month: 'numeric',
    day: 'numeric',
    year: 'numeric',
  })
}

function formatReleaseTime(d: Date): string {
  return d.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' })
}

/** `3/10/2026 at 1:45 PM` */
function formatDateTime(iso: string | null): string {
  if (!iso) return ''
  const d = new Date(iso)
  if (Number.isNaN(d.getTime())) return ''
  return `${formatReleaseDate(iso)} at ${formatReleaseTime(d)}`
}

/** `3/10/2026 · 1:45 PM` */
export function formatDateTimeDot(iso: string | null): string {
  if (!iso) return ''
  const d = new Date(iso)
  if (Number.isNaN(d.getTime())) return ''
  return `${formatReleaseDate(iso)} · ${formatReleaseTime(d)}`
}

export { formatDateTime }
