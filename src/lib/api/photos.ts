import { api } from './client'
import type { Assignment } from '@/lib/utils/assignments'

export type { Assignment }

export interface Photo {
  id: string
  storage_path: string
  file_type: string
  file_size_bytes: number
  title: string | null
  caption: string | null
  width: number | null
  height: number | null
  display_order: number
  created_at: string
  signedUrl: string | null
}

export const requestPhotoUploadUrls = (
  token: string,
  files: { fileName: string; fileType: string; fileSizeBytes: number }[],
) =>
  api.post<
    { signedUploadUrl: string; token: string; storagePath: string; fileIndex: number }[]
  >('/photos/upload-urls', { files }, token)

export const createPhotosBatch = (
  token: string,
  body: {
    photos: {
      storagePath: string
      fileType: string
      fileSizeBytes: number
      width?: number
      height?: number
    }[]
    caption?: string
    assignments: Assignment[]
  },
) => api.post<{ count: number; photos: Photo[] }>('/photos/batch', body, token)

export const getPhotos = (token: string) => api.get<Photo[]>('/photos', token)

export const deletePhoto = (token: string, id: string) =>
  api.delete<{ message: string }>(`/photos/${id}`, token)
