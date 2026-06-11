import { api } from './client'

export interface UserProfile {
  id: string
  first_name: string | null
  last_name: string | null
  email: string
  avatar_url: string | null
  zip_code: string | null
  state: string | null
  age_group: string | null
  gender: string | null
  relationship_status: string | null
  phone_number: string | null
  onboarding: Record<string, boolean>
}

export const getMe = (token: string) => api.get<UserProfile>('/users/me', token)

export const updateProfile = (
  token: string,
  body: {
    first_name?: string
    last_name?: string
    zip_code?: string
    state?: string
    age_group?: string
    gender?: string
    relationship_status?: string
    phone_number?: string
    avatar_url?: string
  },
) => api.patch<UserProfile>('/users/profile', body, token)

export const getAvatarUploadUrl = (token: string, fileType: string) =>
  api.post<{
    signedUploadUrl: string
    storagePath: string
    publicUrl: string
  }>('/users/avatar-upload-url', { fileType }, token)
