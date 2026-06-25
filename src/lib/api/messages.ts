import { api } from './client'

// Types
export interface Message {
  id: string
  type: 'text' | 'video' | 'audio'
  title: string
  body?: string
  notes?: string
  processing_status: 'uploading' | 'processing' | 'ready' | 'failed'
  transcription_status: 'pending' | 'processing' | 'completed' | 'failed'
  transcript?: string
  duration_seconds?: number
  file_size_bytes?: number
  mux_playback_id?: string
  display_order: number
  created_at: string
  assignments?: MessageAssignment[]
}

export interface Assignment {
  scope: 'all' | 'group' | 'release_manager' | 'assign_later' | 'individual'
  groupValue?: string
  recipientId?: string
}

/** Assignment as returned by GET /messages/:id (snake_case, with id). */
export interface MessageAssignment {
  id: string
  assignment_scope: 'all' | 'group' | 'release_manager' | 'assign_later' | 'individual'
  group_value: string | null
  recipient_id: string | null
}

/**
 * Maps the backend's assignment rows back to the CreateMessageModal audience
 * chips (and a single selected individual, which is all that UI supports).
 */
export function assignmentsToAudience(assignments: MessageAssignment[] = []): {
  audience: string[]
  selectedIndividualIds: string[]
} {
  const audience: string[] = []
  const selectedIndividualIds: string[] = []
  for (const a of assignments) {
    switch (a.assignment_scope) {
      case 'all':
        audience.push('All recipients')
        break
      case 'group':
        if (a.group_value === 'family') audience.push('All family')
        else if (a.group_value === 'friends') audience.push('All friends')
        else if (a.group_value === 'others') audience.push('All Others')
        break
      case 'release_manager':
        audience.push('Release Manager')
        break
      case 'individual':
        if (!audience.includes('Choose individuals')) audience.push('Choose individuals')
        if (a.recipient_id && !selectedIndividualIds.includes(a.recipient_id)) {
          selectedIndividualIds.push(a.recipient_id)
        }
        break
      case 'assign_later':
        if (!audience.includes('Assign later')) audience.push('Assign later')
        break
    }
  }
  return { audience, selectedIndividualIds }
}

// Text message
export const createTextMessage = (
  token: string,
  body: {
    title: string
    body: string
    notes?: string
    assignments: Assignment[]
  },
) => api.post<Message>('/messages', body, token)

// Poll processing status
export const getMessageStatus = (token: string, messageId: string) =>
  api.get<{
    processingStatus: string
    transcriptionStatus: string
    transcript?: string
  }>(`/messages/${messageId}/status`, token)

// List all messages
export const getMessages = (token: string) =>
  api.get<Message[]>('/messages', token)

// Single message
export const getMessage = (token: string, id: string) =>
  api.get<Message>(`/messages/${id}`, token)

// Video playback token
export const getPlaybackToken = (token: string, messageId: string) =>
  api.post<{ token: string; playbackId: string }>(
    `/messages/${messageId}/playback-token`,
    {},
    token,
  )

// Audio playback URL
export const getAudioUrl = (token: string, messageId: string) =>
  api.post<{ signedUrl: string; expiresIn: number }>(
    `/messages/${messageId}/audio-url`,
    {},
    token,
  )

// Update
export const updateMessage = (
  token: string,
  id: string,
  body: {
    title?: string
    body?: string
    notes?: string
    assignments?: Assignment[]
  },
) => api.patch<Message>(`/messages/${id}`, body, token)

// Reorder
export const reorderMessages = (
  token: string,
  order: { messageId: string; displayOrder: number }[],
) => api.patch<{ message: string }>('/messages/reorder', { order }, token)

// Delete
export const deleteMessage = (token: string, id: string) =>
  api.delete<{ message: string }>(`/messages/${id}`, token)
