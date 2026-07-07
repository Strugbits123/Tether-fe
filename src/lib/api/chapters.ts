import { api } from './client'

/* ─── Types ──────────────────────────────────────────────────────────────── */

export type ChapterType = 'text' | 'voice'
export type ChapterStatus = 'draft' | 'in_progress' | 'complete'
export type TranscriptionStatus = 'pending' | 'processing' | 'completed' | 'failed'

export type ChapterTheme =
  | 'childhood'
  | 'family'
  | 'career'
  | 'love'
  | 'hardship'
  | 'adventure'
  | 'faith'
  | 'friendship'
  | 'loss'
  | 'milestone'

/** An assignment row as returned by the chapter endpoints. */
export interface ChapterAssignment {
  id?: string
  assignment_scope:
    | 'individual'
    | 'all'
    | 'group'
    | 'release_manager'
    | 'assign_later'
  group_value?: 'family' | 'friends' | 'others' | null
  recipient_id?: string | null
  recipient_name?: string | null
  relationship?: string | null
}

/** The shape POSTed when replacing a chapter's assignments. */
export interface ChapterAssignmentInput {
  assignment_scope:
    | 'individual'
    | 'all'
    | 'group'
    | 'release_manager'
    | 'assign_later'
  group_value?: 'family' | 'friends' | 'others'
  recipient_id?: string
}

export interface ChapterExhibit {
  id: string
  file_name: string
  file_type: string
  file_size_bytes: number
  signed_url: string | null
  display_order: number
  created_at?: string
}

/** List item shape (GET /chapters) — no body. */
export interface ChapterListItem {
  id: string
  title: string
  date_label: string | null
  theme: ChapterTheme | null
  type: ChapterType
  status: ChapterStatus
  word_count: number
  display_order: number
  exhibit_count: number
  created_at: string
  updated_at: string
  assignments: ChapterAssignment[]
}

export interface ChapterStats {
  total_chapters: number
  completed_chapters: number
  total_words: number
  recipients_assigned: number
}

export interface ChaptersListResponse {
  chapters: ChapterListItem[]
  stats: ChapterStats
}

/** Full detail (GET /chapters/:id) — includes body, exhibits, audio fields. */
export interface ChapterDetail {
  id: string
  title: string
  date_label: string | null
  theme: ChapterTheme | null
  type: ChapterType
  body: string | null
  status: ChapterStatus
  word_count: number
  display_order: number
  audio_storage_path: string | null
  audio_playback_url: string | null
  audio_duration_seconds: number | null
  audio_mime_type: string | null
  transcription_status: TranscriptionStatus | null
  recipient_note: string | null
  created_at: string
  updated_at: string
  exhibits: ChapterExhibit[]
  assignments: ChapterAssignment[]
  assignment_count: number
}

/* ─── Chapter CRUD ───────────────────────────────────────────────────────── */

export const createChapter = (
  token: string,
  data: { title: string; date_label?: string; theme?: string },
) => api.post<ChapterListItem>('/chapters', data, token)

export const listChapters = (token: string) =>
  api.get<ChaptersListResponse>('/chapters', token)

export const getChapter = (token: string, id: string) =>
  api.get<ChapterDetail>(`/chapters/${id}`, token)

export const updateChapter = (
  token: string,
  id: string,
  data: {
    title?: string
    date_label?: string
    theme?: string
    body?: string
    word_count?: number
    status?: ChapterStatus
  },
) => api.patch<ChapterListItem>(`/chapters/${id}`, data, token)

export const autosaveChapter = (
  token: string,
  id: string,
  data: { body: string; word_count: number },
) =>
  api.patch<{ updated_at: string; status: ChapterStatus }>(
    `/chapters/${id}/autosave`,
    data,
    token,
  )

export const deleteChapter = (token: string, id: string) =>
  api.delete<{ message: string }>(`/chapters/${id}`, token)

export const reorderChapters = (
  token: string,
  order: { id: string; display_order: number }[],
) => api.patch<{ message: string }>('/chapters/reorder', { order }, token)

/* ─── Voice Chapters ─────────────────────────────────────────────────────── */

export const getVoiceUploadUrl = (
  token: string,
  data: {
    title: string
    date_label?: string
    theme?: string
    file_name: string
    file_type: string
    file_size_bytes: number
  },
) =>
  api.post<{ upload_url: string; storage_path: string }>(
    '/chapters/voice/upload-url',
    data,
    token,
  )

export const createVoiceChapter = (
  token: string,
  data: {
    title: string
    date_label?: string
    theme?: string
    storage_path: string
    file_type: string
    file_size_bytes: number
    duration_seconds?: number
  },
) => api.post<ChapterDetail>('/chapters/voice', data, token)

export const getTranscriptionStatus = (token: string, id: string) =>
  api.get<{
    transcription_status: TranscriptionStatus
    word_count: number
    status: ChapterStatus
  }>(`/chapters/${id}/transcription`, token)

/* ─── Exhibits ───────────────────────────────────────────────────────────── */

export const getExhibitUploadUrl = (
  token: string,
  chapterId: string,
  data: { file_name: string; file_type: string; file_size_bytes: number },
) =>
  api.post<{ upload_url: string; storage_path: string }>(
    `/chapters/${chapterId}/exhibits/upload-url`,
    data,
    token,
  )

export const createExhibit = (
  token: string,
  chapterId: string,
  data: {
    file_name: string
    storage_path: string
    file_type: string
    file_size_bytes: number
    width?: number
    height?: number
  },
) => api.post<ChapterExhibit>(`/chapters/${chapterId}/exhibits`, data, token)

export const listExhibits = (token: string, chapterId: string) =>
  api.get<{ exhibits: ChapterExhibit[]; count: number }>(
    `/chapters/${chapterId}/exhibits`,
    token,
  )

export const deleteExhibit = (
  token: string,
  chapterId: string,
  exhibitId: string,
) =>
  api.delete<{ message: string }>(
    `/chapters/${chapterId}/exhibits/${exhibitId}`,
    token,
  )

/* ─── Assignments ────────────────────────────────────────────────────────── */

export const getChapterAssignments = (token: string, chapterId: string) =>
  api.get<{ assignments: ChapterAssignment[]; count: number }>(
    `/chapters/${chapterId}/assignments`,
    token,
  )

export const setChapterAssignments = (
  token: string,
  chapterId: string,
  assignments: ChapterAssignmentInput[],
  // Per-chapter message shown to recipients before they read the chapter,
  // persisted to `chapters.recipient_note`. Semantics:
  //   note === undefined → key omitted → existing note left unchanged
  //   note === ''         → sent as ''  → note cleared (null) on the backend
  //   note === 'text'     → sent        → note saved
  note?: string,
) =>
  api.post<{ assignments: ChapterAssignment[]; count: number; note?: string | null }>(
    `/chapters/${chapterId}/assignments`,
    { assignments, ...(note !== undefined ? { note: note.trim() } : {}) },
    token,
  )

/* ─── Assignment selection helpers ───────────────────────────────────────── */

/**
 * Converts the assignment modal's selection (group labels + individual
 * recipient ids) into the payload the chapter assignment endpoint expects.
 * Group values here are plural (`friends`/`others`) per the chapters API.
 */
export function buildChapterAssignments(
  checkedGroups: string[],
  checkedIndividualIds: string[],
): ChapterAssignmentInput[] {
  if (checkedGroups.includes('Assign Later')) {
    return [{ assignment_scope: 'assign_later' }]
  }

  const out: ChapterAssignmentInput[] = []
  for (const group of checkedGroups) {
    switch (group) {
      case 'All Recipients':
        out.push({ assignment_scope: 'all' })
        break
      case 'All Family':
        out.push({ assignment_scope: 'group', group_value: 'family' })
        break
      case 'All Friends':
        out.push({ assignment_scope: 'group', group_value: 'friends' })
        break
      case 'All Others':
        out.push({ assignment_scope: 'group', group_value: 'others' })
        break
      case 'Release Manager':
        out.push({ assignment_scope: 'release_manager' })
        break
    }
  }
  for (const id of checkedIndividualIds) {
    out.push({ assignment_scope: 'individual', recipient_id: id })
  }

  if (out.length === 0) return [{ assignment_scope: 'assign_later' }]
  return out
}
