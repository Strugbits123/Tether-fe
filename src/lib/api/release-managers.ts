import { api, ApiError } from './client'

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

export const getReleaseManager = async (token: string): Promise<ReleaseManager | null> => {
  try {
    return await api.get<ReleaseManager>('/release-managers', token)
  } catch (e) {
    if (e instanceof ApiError && (e.statusCode === 404 || e.statusCode === 204)) return null
    throw e
  }
}
