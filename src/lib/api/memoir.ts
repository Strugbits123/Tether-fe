import { api } from './client'
import type { ChapterTheme, ChapterType } from './chapters'

/* ─── Types ──────────────────────────────────────────────────────────────── */

export interface MemoirStats {
  total_chapters: number
  completed_chapters: number
  in_progress_chapters: number
  draft_chapters: number
  total_words: number
  recipients_assigned: number
  chapters_with_audio: number
}

export interface Memoir {
  id: string
  title: string
  dedication: string | null
  created_at: string
  updated_at: string
  stats: MemoirStats
}

export type TtsStatus = 'none' | 'pending' | 'processing' | 'ready' | 'failed'

export interface TtsAudio {
  id?: string
  chapter_id?: string
  status: TtsStatus
  playback_url?: string | null
  duration_seconds?: number | null
  file_size_bytes?: number
  voice_model?: string
  created_at?: string
}

export interface PreviewExhibit {
  id: string
  file_name: string
  file_type: string
  signed_url: string | null
}

export interface PreviewChapter {
  chapter_number: number
  id: string
  title: string
  date_label: string | null
  theme: ChapterTheme | null
  type: ChapterType
  body: string | null
  word_count: number
  exhibits: PreviewExhibit[]
  tts_audio: {
    status: TtsStatus
    playback_url: string | null
    duration_seconds: number | null
  } | null
}

export interface MemoirPreview {
  title: string
  dedication: string | null
  chapters: PreviewChapter[]
  total_words: number
  total_chapters: number
  has_tts_audio: boolean
}

/* ─── Memoir ─────────────────────────────────────────────────────────────── */

export const getMemoir = (token: string) => api.get<Memoir>('/memoir', token)

export const updateMemoir = (
  token: string,
  data: { title?: string; dedication?: string },
) =>
  api.patch<{
    id: string
    title: string
    dedication: string | null
    updated_at: string
  }>('/memoir', data, token)

export const deleteMemoir = (token: string, confirm: string) =>
  api.delete<{ message: string }>('/memoir', token, { confirm })

export const getMemoirPreview = (token: string) =>
  api.get<MemoirPreview>('/memoir/preview', token)

/* ─── Downloads (binary — raw fetch, bypasses the JSON envelope client) ────── */

const API_URL = process.env.NEXT_PUBLIC_API_URL

async function downloadBlob(
  token: string,
  path: string,
  fileName: string,
): Promise<void> {
  const response = await fetch(`${API_URL}${path}`, {
    headers: { Authorization: `Bearer ${token}` },
  })
  if (!response.ok) {
    throw new Error('Download failed. Please try again.')
  }
  const blob = await response.blob()
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = fileName
  document.body.appendChild(a)
  a.click()
  a.remove()
  URL.revokeObjectURL(url)
}

export const downloadMemoirPdf = (token: string, fileName = 'My Story.pdf') =>
  downloadBlob(token, '/memoir/download/pdf', fileName)

export const downloadMemoirText = (token: string, fileName = 'My Story.txt') =>
  downloadBlob(token, '/memoir/download/text', fileName)

/* ─── TTS ────────────────────────────────────────────────────────────────── */

export const generateTts = (
  token: string,
  chapterId: string,
  voice_model?: string,
) =>
  api.post<TtsAudio>(
    `/memoir/chapters/${chapterId}/tts`,
    { voice_model },
    token,
  )

export const getTtsStatus = (token: string, chapterId: string) =>
  api.get<TtsAudio>(`/memoir/chapters/${chapterId}/tts`, token)

export const deleteTts = (token: string, chapterId: string) =>
  api.delete<{ message: string }>(`/memoir/chapters/${chapterId}/tts`, token)

export const getAllTtsStatus = (token: string) =>
  api.get<{
    chapters: {
      chapter_id: string
      title: string
      status: TtsStatus
      duration_seconds: number | null
    }[]
    all_ready: boolean
    ready_count: number
    total_chapters: number
  }>('/memoir/tts/status', token)
