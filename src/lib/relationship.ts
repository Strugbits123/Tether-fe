// The relationship dropdowns use friendly title-case labels, but the backend
// expects lowercase enum values. These maps translate the UI labels into the
// values each endpoint accepts.

// Release Manager enum: family | friend | partner | attorney | colleague | other
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

// Recipient enum: family | friend | partner | colleague | other (no attorney)
const RECIPIENT_VALUES: Record<string, string> = {
  Family: 'family',
  Spouse: 'partner',
  Child: 'family',
  Parent: 'family',
  Sibling: 'family',
  Friend: 'friend',
  Colleague: 'colleague',
  Lawyer: 'other',
  Other: 'other',
}

export function toReleaseManagerRelationship(label: string): string {
  return RELEASE_MANAGER_VALUES[label] ?? label.toLowerCase()
}

export function toRecipientRelationship(label: string): string {
  return RECIPIENT_VALUES[label] ?? label.toLowerCase()
}

/** Capitalises a backend relationship value for display (e.g. "family" → "Family"). */
export function displayRelationship(value: string): string {
  if (!value) return value
  return value.charAt(0).toUpperCase() + value.slice(1)
}
