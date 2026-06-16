import { api } from './client'

export interface Recipient {
  id: string
  name: string
  email: string
  phone: string | null
  relationship: string
  note: string | null
  invitation_status: 'pending' | 'sent' | 'bounced'
  created_at: string
}

export const createRecipient = (
  token: string,
  body: {
    firstName: string
    lastName: string
    email: string
    phone?: string
    relationship: string
    note?: string
  },
) => api.post<Recipient>('/recipients', body, token)

export const getRecipients = (token: string) =>
  api.get<Recipient[]>('/recipients', token)
