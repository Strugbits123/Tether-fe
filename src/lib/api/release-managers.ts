import { api } from './client'

export interface ReleaseManager {
  id: string
  name: string
  email: string
  phone: string | null
  relationship: string
  note: string | null
  status: 'invited' | 'accepted' | 'declined' | 'bounced' | 'revoked'
  created_at: string
}

export const createReleaseManager = (
  token: string,
  body: {
    firstName: string
    lastName: string
    email: string
    phone?: string
    relationship: string
    note?: string
  },
) => api.post<ReleaseManager>('/release-managers', body, token)

export const getReleaseManager = (token: string) =>
  api.get<ReleaseManager | null>('/release-managers', token)
