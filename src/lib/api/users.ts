import { api } from './client'

/**
 * Onboarding progress as returned inside the user record and by
 * `GET /users/onboarding/state`. Step flags are booleans; `completed_at` is an
 * ISO timestamp once the whole flow is finished (or `null`).
 */
export interface OnboardingState {
  finish_account: boolean
  add_recipients: boolean
  add_release_manager: boolean
  create_message: boolean
  add_photos: boolean
  completed_at: string | null
}

/**
 * The canonical shape of the user record returned by `GET /users/me` and
 * `PATCH /users/profile` (sensitive billing fields stripped). This is the
 * single source of truth — `AuthContext` imports it rather than redefining it.
 */
export interface UserProfile {
  id: string
  email: string
  first_name: string | null
  last_name: string | null
  full_name: string | null
  date_of_birth: string | null
  gender: string | null
  phone_number: string | null
  sms_opted_in: boolean
  auth_provider: string
  account_status: string
  role: string
  avatar_url: string | null
  zip_code: string | null
  state: string | null
  age_group: string | null
  relationship_status: string | null
  onboarding: OnboardingState | null
  // Tolerate additional fields the API may add without breaking consumers.
  [key: string]: unknown
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
