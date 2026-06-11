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

export function formatFileSize(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`
}
