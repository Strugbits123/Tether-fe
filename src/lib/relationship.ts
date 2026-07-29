// The relationship dropdowns use friendly title-case labels, but the backend
// expects lowercase enum values. These maps translate the UI labels into the
// values each endpoint accepts.

// The labels both relationship dropdowns offer. Shared so the Release Manager
// and Recipient modals can't silently drift apart — every label here must have
// an entry in both value maps below.
export const RELATIONSHIP_OPTIONS: string[] = ['Family', 'Friend', 'Other']

// Release Manager enum: family | friend | partner | attorney | colleague | other.
// The dropdown now only offers Family/Friend/Other, but legacy labels are still
// mapped defensively so no caller can submit an out-of-enum value.
const RELEASE_MANAGER_VALUES: Record<string, string> = {
  Family: 'family',
  Spouse: 'partner',
  Child: 'family',
  Parent: 'family',
  Sibling: 'family',
  Friend: 'friend',
  Colleague: 'colleague',
  Lawyer: 'attorney',
  Other: 'other',
}

// Recipient enum is standardized to family | friend | other. The dropdown now
// only offers those three, but legacy/other labels are still mapped defensively
// so no caller can submit an out-of-enum value.
const RECIPIENT_VALUES: Record<string, string> = {
  Family: 'family',
  Spouse: 'family',
  Child: 'family',
  Parent: 'family',
  Sibling: 'family',
  Friend: 'friend',
  Colleague: 'other',
  Lawyer: 'other',
  Partner: 'other',
  Other: 'other',
}

export function toReleaseManagerRelationship(label: string): string {
  return RELEASE_MANAGER_VALUES[label] ?? 'other'
}

export function toRecipientRelationship(label: string): string {
  return RECIPIENT_VALUES[label] ?? 'other'
}

/** Capitalises a backend relationship value for display (e.g. "family" → "Family"). */
export function displayRelationship(value: string): string {
  if (!value) return value
  return value.charAt(0).toUpperCase() + value.slice(1)
}
