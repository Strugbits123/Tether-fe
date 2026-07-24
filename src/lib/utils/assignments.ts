export interface Assignment {
  scope: 'all' | 'group' | 'release_manager' | 'assign_later' | 'individual'
  groupValue?: string
  recipientId?: string
}

export const GROUP_ASSIGNMENT_MAP: Record<string, Assignment> = {
  'Assign Later': { scope: 'assign_later' },
  'All Recipients': { scope: 'all' },
  'All Family': { scope: 'group', groupValue: 'family' },
  'All Friends': { scope: 'group', groupValue: 'friends' },
  'All Others': { scope: 'group', groupValue: 'others' },
  'Release Manager': { scope: 'release_manager' },
}

/* ─── Standardized taxonomy ───────────────────────────────────────────────
 * Recipient relationships are Family / Friend / Other (partner & colleague were
 * merged into Other). Group assignment values stay plural (family/friends/
 * others) for storage compatibility; this maps a group value to the
 * relationship it selects. */
export type Relationship = 'family' | 'friend' | 'other'

export const GROUP_VALUE_TO_RELATIONSHIP: Record<string, Relationship> = {
  family: 'family',
  friends: 'friend',
  others: 'other',
}

/** The group chip label for each relationship, for group↔individual syncing. */
export const RELATIONSHIP_TO_GROUP_LABEL: Record<Relationship, string> = {
  family: 'All Family',
  friend: 'All Friends',
  other: 'All Others',
}

/** Normalizes any stored/legacy relationship string to the 3 canonical values.
 *  partner/colleague and any unknown value collapse to 'other'. */
export function normalizeRelationship(value: string | null | undefined): Relationship {
  if (value === 'family') return 'family'
  if (value === 'friend' || value === 'friends') return 'friend'
  return 'other'
}

interface RecipientLite {
  id: string
  relationship: string
}

interface AssignmentRow {
  assignment_scope: string
  group_value: string | null
  recipient_id: string | null
}

/** Recipient ids that belong to a group label (e.g. "All Family"). */
export function recipientIdsForGroupLabel(
  label: string,
  recipients: RecipientLite[],
): string[] {
  if (label === 'All Recipients') return recipients.map((r) => r.id)
  const rel = (Object.keys(RELATIONSHIP_TO_GROUP_LABEL) as Relationship[]).find(
    (r) => RELATIONSHIP_TO_GROUP_LABEL[r] === label,
  )
  if (!rel) return []
  return recipients
    .filter((r) => normalizeRelationship(r.relationship) === rel)
    .map((r) => r.id)
}

/**
 * Distinct number of people a content item reaches, given its stored assignment
 * rows and the account's recipients. Groups expand to their real members, the
 * union is de-duplicated, and the Release Manager (a separate person) adds 1
 * when assigned. `assign_later` contributes nothing.
 */
export function countRecipients(
  assignments: AssignmentRow[] = [],
  recipients: RecipientLite[] = [],
): number {
  const ids = new Set<string>()
  let includesReleaseManager = false

  for (const a of assignments) {
    switch (a.assignment_scope) {
      case 'all':
        recipients.forEach((r) => ids.add(r.id))
        break
      case 'group': {
        const rel = a.group_value
          ? GROUP_VALUE_TO_RELATIONSHIP[a.group_value] ??
            normalizeRelationship(a.group_value)
          : undefined
        if (rel) {
          recipients
            .filter((r) => normalizeRelationship(r.relationship) === rel)
            .forEach((r) => ids.add(r.id))
        }
        break
      }
      case 'individual':
        if (a.recipient_id) ids.add(a.recipient_id)
        break
      case 'release_manager':
        includesReleaseManager = true
        break
    }
  }

  return ids.size + (includesReleaseManager ? 1 : 0)
}

export interface Selection {
  groups: string[]
  individuals: string[]
}

/**
 * Distinct people a group-label + individual-id selection reaches (+RM), the
 * selection-side counterpart to countRecipients (which works on stored rows).
 * Used by pickers and read views that hold the UI selection.
 */
export function countFromSelection(
  groups: string[],
  individualIds: string[],
  recipients: RecipientLite[],
): number {
  if (groups.some((g) => g.toLowerCase() === 'assign later')) return 0
  const ids = new Set<string>()
  let includesReleaseManager = false
  for (const g of groups) {
    if (g === 'Release Manager') includesReleaseManager = true
    else recipientIdsForGroupLabel(g, recipients).forEach((id) => ids.add(id))
  }
  individualIds.forEach((id) => ids.add(id))
  return ids.size + (includesReleaseManager ? 1 : 0)
}

/**
 * Centralized selection interaction, shared by every assignment picker so the
 * behavior is identical across messages, docs, photos, chapters, memoir and
 * folders:
 *
 *  - Picking "All Recipients" selects everyone (and marks every group active).
 *  - Picking a relationship group ("All Family" etc.) sets the individual
 *    selection to exactly that group's members.
 *  - Toggling an individual switches to a custom selection: the group chips are
 *    cleared but the chosen individuals are kept.
 *
 * "Assign Later" is handled by the caller (it's a standalone mode).
 */
const RM = 'Release Manager'

export function selectGroup(
  label: string,
  current: Selection,
  recipients: RecipientLite[],
): Selection {
  const hasRM = current.groups.includes(RM)
  const withRM = (groups: string[]) => (hasRM ? [...groups, RM] : groups)

  // Release Manager is its own delivery target, not a relationship group — it
  // toggles independently and never clears the individual selection.
  if (label === RM) {
    return {
      groups: hasRM
        ? current.groups.filter((g) => g !== RM)
        : [...current.groups, RM],
      individuals: current.individuals,
    }
  }

  if (label === 'All Recipients') {
    const active = current.groups.includes('All Recipients')
    return active
      ? { groups: withRM([]), individuals: [] }
      : {
          groups: withRM([
            'All Recipients',
            'All Family',
            'All Friends',
            'All Others',
          ]),
          individuals: recipients.map((r) => r.id),
        }
  }

  // Toggling the currently-active relationship group off clears it (RM stays).
  const activeRelationship = current.groups.filter((g) => g !== RM)
  if (activeRelationship.length === 1 && activeRelationship[0] === label) {
    return { groups: withRM([]), individuals: [] }
  }
  // Picking a relationship group replaces the selection with that group's
  // members (RM preserved).
  return {
    groups: withRM([label]),
    individuals: recipientIdsForGroupLabel(label, recipients),
  }
}

export function toggleIndividual(id: string, current: Selection): Selection {
  const hasRM = current.groups.includes(RM)
  const has = current.individuals.includes(id)
  return {
    // A manual individual change breaks any active group link (RM excepted) but
    // keeps the individual picks.
    groups: hasRM ? [RM] : [],
    individuals: has
      ? current.individuals.filter((x) => x !== id)
      : [...current.individuals, id],
  }
}

export function buildAssignments(
  checkedGroups: string[],
  checkedIndividualIds: string[],
): Assignment[] {
  // "Assign Later" takes precedence — send only that.
  if (checkedGroups.includes('Assign Later')) {
    return [{ scope: 'assign_later' }]
  }

  // "All Recipients" already covers every recipient — send only that (plus RM
  // if the release manager was included).
  if (checkedGroups.includes('All Recipients')) {
    const out: Assignment[] = [{ scope: 'all' }]
    if (checkedGroups.includes('Release Manager')) {
      out.push({ scope: 'release_manager' })
    }
    return out
  }

  const assignments: Assignment[] = []

  // A relationship group ("All Family" etc.) is the source of truth for its
  // members, so send the group scope and NOT the mirrored individuals — that
  // avoids writing duplicate rows. Individuals are only sent when no relationship
  // group is active (a custom selection). Release Manager can coexist with either.
  const relationshipGroups = checkedGroups.filter(
    (g) => g === 'All Family' || g === 'All Friends' || g === 'All Others',
  )
  for (const g of [...relationshipGroups, 'Release Manager'].filter((g) =>
    checkedGroups.includes(g),
  )) {
    const mapped = GROUP_ASSIGNMENT_MAP[g]
    if (mapped) assignments.push(mapped)
  }

  if (relationshipGroups.length === 0) {
    for (const id of checkedIndividualIds) {
      assignments.push({ scope: 'individual', recipientId: id })
    }
  }

  // Default to assign_later if nothing was selected.
  if (assignments.length === 0) {
    return [{ scope: 'assign_later' }]
  }

  return assignments
}

/** Reverse of buildAssignments: maps stored assignment rows back to the modal's
 *  checkbox selection (group labels + individual recipient ids). */
export function assignmentsToSelection(
  assignments: {
    assignment_scope: string
    group_value: string | null
    recipient_id: string | null
  }[] = [],
): { groups: string[]; individuals: string[] } {
  const groups: string[] = []
  const individuals: string[] = []
  for (const a of assignments) {
    switch (a.assignment_scope) {
      case 'all':
        groups.push('All Recipients')
        break
      case 'release_manager':
        groups.push('Release Manager')
        break
      case 'assign_later':
        groups.push('Assign Later')
        break
      case 'group':
        // Accept both the current singular values and legacy plural data.
        if (a.group_value === 'family') groups.push('All Family')
        else if (a.group_value === 'friend' || a.group_value === 'friends') groups.push('All Friends')
        else if (a.group_value === 'other' || a.group_value === 'others') groups.push('All Others')
        break
      case 'individual':
        if (a.recipient_id) individuals.push(a.recipient_id)
        break
    }
  }
  // A relationship group (or "All Recipients") is the source of truth for its
  // members, so ignore any individual rows stored alongside it (legacy data
  // saved the group AND its mirrored members). Otherwise both the group and
  // those individuals would show checked on first load in edit mode.
  const hasCoveringGroup = groups.some(
    (g) =>
      g === 'All Recipients' ||
      g === 'All Family' ||
      g === 'All Friends' ||
      g === 'All Others',
  )
  return { groups, individuals: hasCoveringGroup ? [] : individuals }
}

export function formatFileSize(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`
}
