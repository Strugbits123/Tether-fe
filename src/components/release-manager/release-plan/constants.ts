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

// ─── Release-module date/time formatting contract ───────────────────────────
//
// Every timestamp in the release module renders through the helpers below. Two
// things are pinned deliberately, and both matter for correctness rather than
// polish:
//
//  1. Locale is 'en-US', never `undefined`. The default follows the viewer's
//     locale, so one Release Manager would read 3/10/2026 where another reads
//     10/03/2026 for the same instant. On a release timeline — where the
//     delivery date decides whether someone still has time to cancel — an
//     ambiguous day/month is a real hazard.
//
//  2. Time zone is fixed (below), never the viewer's. Left local, the same
//     delivery instant lands on different calendar days for RMs in different
//     zones, so two people co-managing one release would disagree about the
//     deadline.
//
// UTC specifically, because the deadline is *derived* in UTC: the server
// computes the waiting period with local-time date arithmetic
// (addBusinessDays in rm-portal.util.ts) and runs with TZ=UTC, so the
// business-day boundaries the delivery date comes from are UTC days.
// Rendering in UTC keeps what we display in agreement with what was computed.
//
// Where a time is shown the zone is labelled, so nobody mistakes it for their
// own clock. Date-only output stays bare (`3/10/2026`) to keep it scannable.
export const RELEASE_DISPLAY_TIME_ZONE = 'UTC'

/** `3/10/2026` — fixed zone, so every viewer sees the same calendar day. */
export function formatReleaseDate(iso: string | null): string {
  if (!iso) return ''
  const d = new Date(iso)
  if (Number.isNaN(d.getTime())) return ''
  return d.toLocaleDateString('en-US', {
    month: 'numeric',
    day: 'numeric',
    year: 'numeric',
    timeZone: RELEASE_DISPLAY_TIME_ZONE,
  })
}

/** `1:45 PM UTC` — zone labelled so it isn't read as the viewer's local time. */
function formatReleaseTime(d: Date): string {
  return d.toLocaleTimeString('en-US', {
    hour: 'numeric',
    minute: '2-digit',
    timeZone: RELEASE_DISPLAY_TIME_ZONE,
    timeZoneName: 'short',
  })
}

/** `3/10/2026 at 1:45 PM UTC` */
function formatDateTime(iso: string | null): string {
  if (!iso) return ''
  const d = new Date(iso)
  if (Number.isNaN(d.getTime())) return ''
  return `${formatReleaseDate(iso)} at ${formatReleaseTime(d)}`
}

/** `3/10/2026 · 1:45 PM UTC` */
export function formatDateTimeDot(iso: string | null): string {
  if (!iso) return ''
  const d = new Date(iso)
  if (Number.isNaN(d.getTime())) return ''
  return `${formatReleaseDate(iso)} · ${formatReleaseTime(d)}`
}

export { formatDateTime }
