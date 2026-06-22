// Shared data for the Release Manager Release Plan flow. Static placeholders
// for now; these wire to real release-orchestration endpoints once they exist.

export const STEPS: { n: number; label: string }[] = [
  { n: 1, label: 'Initiate' },
  { n: 2, label: 'Notify' },
  { n: 3, label: 'Wait' },
  { n: 4, label: 'Deliver' },
  { n: 5, label: 'Complete' },
]

export const OWNER_NAME = 'Sarah Holder'
export const FIRST_NAME = OWNER_NAME.split(' ')[0]

// Active-release placeholders (shown from Step 2 onward).
export const RELEASE_ID = 'RP-2026-0047'
export const INITIATED_AT = 'Nov 3, 2026 at 2:14 PM ET'
export const DELIVERY_AT = 'Nov 6, 2026 at 2:14 PM ET'

// Step 3 (waiting period) display strings. Dot-separated date format and the
// per-design values (delivery-scheduled column intentionally shows Nov 8).
export const DELIVERY_DISPLAY = 'Nov 6, 2026 · 2:14 PM ET'
export const WAIT_WINDOW_OPENED = 'Nov 3, 2026 · 2:14 PM ET'
export const WAIT_DELIVERY_SCHEDULED = 'Nov 8, 2026 · 2:14 PM ET'

// Step 4/5 (delivery) display strings.
export const DELIVERED_AT = 'Nov 6, 2026 at 2:14 PM ET'

// How long Step 2 (notifying) is shown before auto-advancing to Step 3.
export const NOTIFY_DURATION_MS = 5000

// How long Step 4 (delivery triggered) is shown before auto-advancing to Step 5.
export const DELIVER_DURATION_MS = 5000

export interface Party {
  initials: string
  name: string
  note: string
  role?: string
  bg: string
  color: string
}

export const PARTIES: Party[] = [
  {
    initials: 'SH',
    name: 'Sarah Holder',
    role: '(account owner)',
    note: 'Will receive email with cancel link in case of error',
    bg: '#FEE2E2',
    color: '#991B1B',
  },
  {
    initials: 'MH',
    name: 'Maya Holder',
    note: 'Email + text message',
    bg: '#DBEAFE',
    color: '#1E40AF',
  },
  {
    initials: 'DH',
    name: 'Daniel Holder',
    note: 'Email + text message',
    bg: '#D1FAE5',
    color: '#065F46',
  },
  {
    initials: 'JW',
    name: 'James Webb',
    note: 'Email + text message',
    bg: '#FEF3C7',
    color: '#92400E',
  },
]

export const REASONS = [
  'Death of the account owner',
  'Account owner has requested release upon incapacitation',
  'Account owner has requested early release',
  'Legal directive - court order, guardianship, or power of attorney',
  'Other - please explain below',
]

export const MIN_DESCRIPTION = 100

// Step 5 (delivered) — recipient portal-access tracking. The three recipients
// are the non-owner parties; status is "accessed" once they open their portal.
export interface RecipientAccess {
  party: Party
  status: 'accessed' | 'delivered'
}

export const RECIPIENT_ACCESS: RecipientAccess[] = [
  { party: PARTIES[1], status: 'accessed' },
  { party: PARTIES[2], status: 'delivered' },
  { party: PARTIES[3], status: 'delivered' },
]
