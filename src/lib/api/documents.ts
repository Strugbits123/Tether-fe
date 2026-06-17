import { api } from './client'
import type { Assignment } from '@/lib/utils/assignments'

export type { Assignment }

export interface Document {
  id: string
  title: string
  category: string
  note: string | null
  original_filename: string
  storage_path: string
  file_type: string
  file_size_bytes: number
  created_at: string
  signedUrl: string | null
}

export interface DocumentStats {
  categories: Record<string, number>
  fileTypes: {
    total: number
    documents: number
    audio: number
    video: number
    images: number
    other: number
  }
}

export interface DocumentDetail extends Document {
  assignments: {
    assignment_scope: string
    group_value: string | null
    recipient_id: string | null
  }[]
}

export const requestDocUploadUrls = (
  token: string,
  files: { fileName: string; fileType: string; fileSizeBytes: number }[],
) =>
  api.post<
    { signedUploadUrl: string; token: string; storagePath: string; fileIndex: number }[]
  >('/documents/upload-urls', { files }, token)

export const createDocumentsBatch = (
  token: string,
  body: {
    documents: {
      storagePath: string
      originalFilename: string
      fileType: string
      fileSizeBytes: number
      mimeType?: string
      title?: string
      category?: string
    }[]
    note?: string
    assignments: Assignment[]
  },
) =>
  api.post<{ count: number; documents: Document[] }>('/documents/batch', body, token)

export const getDocuments = (token: string, category?: string, fileType?: string) => {
  const params = new URLSearchParams()
  if (category) params.set('category', category)
  if (fileType) params.set('file_type', fileType)
  const query = params.toString() ? `?${params.toString()}` : ''
  return api.get<(Document & { assignmentCount: number })[]>(`/documents${query}`, token)
}

export const getDocumentStats = (token: string) =>
  api.get<DocumentStats>('/documents/stats', token)

export const getDocument = (token: string, id: string) =>
  api.get<DocumentDetail>(`/documents/${id}`, token)

export const updateDocument = (
  token: string,
  id: string,
  body: {
    title?: string
    note?: string
    category?: string
    assignments?: Assignment[]
  },
) => api.patch<Document>(`/documents/${id}`, body, token)

export const getDocDownloadUrl = (token: string, id: string) =>
  api.get<{ downloadUrl: string; expiresIn: number; filename: string }>(
    `/documents/${id}/download-url`,
    token,
  )

export const deleteDocument = (token: string, id: string) =>
  api.delete<{ message: string }>(`/documents/${id}`, token)
