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

export function buildAssignments(
  checkedGroups: string[],
  checkedIndividualIds: string[],
): Assignment[] {
  // "Assign Later" takes precedence — send only that.
  if (checkedGroups.includes('Assign Later')) {
    return [{ scope: 'assign_later' }]
  }

  const assignments: Assignment[] = []

  for (const group of checkedGroups) {
    const mapped = GROUP_ASSIGNMENT_MAP[group]
    if (mapped) assignments.push(mapped)
  }

  for (const id of checkedIndividualIds) {
    assignments.push({ scope: 'individual', recipientId: id })
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
        if (a.group_value === 'family') groups.push('All Family')
        else if (a.group_value === 'friends') groups.push('All Friends')
        else if (a.group_value === 'others') groups.push('All Others')
        break
      case 'individual':
        if (a.recipient_id) individuals.push(a.recipient_id)
        break
    }
  }
  return { groups, individuals }
}

export function formatFileSize(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`
}
