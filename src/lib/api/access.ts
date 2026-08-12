import { api } from './client'

export interface ContentSummary {
  photos: number
  memoir_chapters: number
  documents: number
  messages: number
  total: number
}

export interface AccessRecipient {
  id: string
  name: string
  email: string
  phone: string | null
  relationship: string
  content_summary: ContentSummary
  is_guardian: boolean
  guardian_order: number | null
}

export interface AccessGuardian {
  id: string
  name: string
  email: string
  relationship: string
  priority_order: number
}

export interface AccessReleaseManager {
  name: string
  email: string
  phone: string | null
  relationship: string
  note: string | null
  status: 'invited' | 'accepted' | 'declined' | 'bounced' | 'revoked'
}

export interface AccessOverview {
  release_manager: AccessReleaseManager | null
  guardians: AccessGuardian[]
  recipients: {
    family: { members: AccessRecipient[] }
    friends_and_others: { members: AccessRecipient[] }
  }
  stats: {
    total_recipients: number
    total_guardians: number
    max_guardians: number
    has_release_manager: boolean
  }
}

export const getAccessOverview = (token: string) =>
  api.get<AccessOverview>('/access/overview', token)

export const addRecipient = (
  token: string,
  body: {
    first_name: string
    last_name: string
    email: string
    phone?: string
    relationship: string
    designate_as_guardian?: boolean
    note?: string
  },
) => api.post<AccessRecipient>('/access/recipients', body, token)

export const updateRecipient = (
  token: string,
  id: string,
  body: { name?: string; email?: string; phone?: string; relationship?: string },
) => api.patch<AccessRecipient>(`/access/recipients/${id}`, body, token)

export const removeRecipient = (token: string, id: string) =>
  api.delete<null>(`/access/recipients/${id}`, token)

export const designateGuardian = (
  token: string,
  recipientId: string,
  body: { priority_order?: number; legal_acknowledged: boolean },
) => api.post<AccessGuardian>(`/access/recipients/${recipientId}/guardian`, body, token)

export const removeGuardian = (token: string, recipientId: string) =>
  api.delete<null>(`/access/recipients/${recipientId}/guardian`, token)

export const setReleaseManager = (
  token: string,
  body: {
    name: string
    email: string
    phone?: string
    relationship: string
    note?: string
    legal_acknowledged: boolean
  },
) => api.post<AccessReleaseManager>('/access/release-manager', body, token)

export const sendRmReminder = (token: string) =>
  api.post<null>('/access/release-manager/remind', {}, token)

export const getRecipientContent = (token: string, id: string) =>
  api.get<ContentSummary>(`/access/recipients/${id}/content`, token)
