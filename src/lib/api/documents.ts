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
      title?: string
      category?: string
    }[]
    note?: string
    assignments: Assignment[]
  },
) =>
  api.post<{ count: number; documents: Document[] }>('/documents/batch', body, token)

export const getDocuments = (token: string, category?: string) => {
  const query = category ? `?category=${category}` : ''
  return api.get<Document[]>(`/documents${query}`, token)
}

export const getDocDownloadUrl = (token: string, id: string) =>
  api.get<{ downloadUrl: string; expiresIn: number; filename: string }>(
    `/documents/${id}/download-url`,
    token,
  )

export const deleteDocument = (token: string, id: string) =>
  api.delete<{ message: string }>(`/documents/${id}`, token)
