import { api, buildAuthHeaders } from './client'

/* ─── Overview ───────────────────────────────────────────────────────────── */

export interface RmOverview {
  account_owner: { id: string; name: string; avatar_url: string | null }
  content_stats: {
    video_messages: number
    audio_messages: number
    documents: number
    photos: number
    memoir_chapters: number
    recipients: number
  }
  recent_activity: {
    id: string
    event_type: string
    event_label: string
    created_at: string
    time_ago: string
  }[]
  has_active_release: boolean
}

export const getRmOverview = (token: string) => api.get<RmOverview>('/rm/overview', token)

/* ─── Release Plan ───────────────────────────────────────────────────────── */

export type ReleaseReason =
  | 'death'
  | 'incapacitated'
  | 'early_release'
  | 'terminal_diagnosis'
  | 'legal_authority'
  | 'rm_unreachable'
  | 'other'

export interface ReleasePlanNoneState {
  status: 'none'
  can_initiate: boolean
  has_guardians: boolean
  guardian_count: number
  account_owner_name: string
}

export interface ReleasePlanParty {
  name: string
  role: string
  channel: string
  status: string
}

export interface ReleasePlanActiveState {
  id: string
  plan_id: string
  status: 'active' | 'cancelled' | 'delivered' | string
  current_step: 1 | 2 | 3 | 4 | 5
  initiated_at: string
  delivery_scheduled_at: string | null
  delivered_at: string | null
  account_owner_name: string
  step_2_notifications: { all_sent: boolean; parties: ReleasePlanParty[] } | null
  step_3_waiting: {
    window_opened: string
    delivery_scheduled: string
    days_elapsed: number
    days_total: number
    cancellations_received: number
    is_complete: boolean
    can_continue: boolean
  } | null
  step_4_delivery: unknown
  step_5_complete: unknown
}

export type ReleasePlanState = ReleasePlanNoneState | ReleasePlanActiveState

export const getReleasePlan = (token: string) =>
  api.get<ReleasePlanState>('/rm/release-plan', token)

export const initiateRelease = (
  token: string,
  data: { reason: ReleaseReason; explanation: string; confirmation_checked: boolean },
) =>
  api.post<{ id: string; plan_id: string; status: string; delivery_scheduled_at: string }>(
    '/rm/release-plan/initiate',
    data,
    token,
  )

export const cancelRelease = (token: string, data: { reason: string }) =>
  api.post<{ id: string; status: string; cancelled_at: string }>(
    '/rm/release-plan/cancel',
    data,
    token,
  )

export interface NotificationStatus {
  all_sent: boolean
  parties: ReleasePlanParty[]
}

export const getNotificationStatus = (token: string) =>
  api.get<NotificationStatus>('/rm/release-plan/notification-status', token)

export const continueDelivery = (token: string) =>
  api.post<{ status: string; delivered_at: string; recipients_notified: number }>(
    '/rm/release-plan/continue-delivery',
    {},
    token,
  )

export interface DeliveryStatusRecipient {
  id: string
  name: string
  email_status: 'delivered' | 'sent' | 'bounced' | string
  portal_status: 'accessed' | 'delivered' | 'bounced' | string
  portal_first_accessed_at: string | null
  retry_email: string | null
}

export interface DeliveryStatus {
  recipients: DeliveryStatusRecipient[]
  all_accessed: boolean
  accessed_count: number
  bounced_count: number
  total: number
}

export const getDeliveryStatus = (token: string) =>
  api.get<DeliveryStatus>('/rm/release-plan/delivery-status', token)

export interface ReleasePlanActivityEvent {
  event_type: string
  event_label: string
  actor_name: string
  created_at: string
}

export const getReleasePlanActivityLog = (token: string) =>
  api.get<{ events: ReleasePlanActivityEvent[] }>('/rm/release-plan/activity-log', token)

export const requestGuardian = (token: string, data: { explanation: string }) =>
  api.post<{ guardian_notified: string; guardian_order: number; message: string }>(
    '/rm/release-plan/guardian-request',
    data,
    token,
  )

/* ─── Recipients ─────────────────────────────────────────────────────────── */

export interface RmRecipientContentCount {
  photos: number
  memoir_chapters: number
  documents: number
  messages: number
  total: number
}

export interface RmRecipient {
  id: string
  name: string
  email: string
  phone: string | null
  relationship: string
  content_count: RmRecipientContentCount
  delivery: {
    email_status: 'delivered' | 'sent' | 'bounced' | string
    portal_status: 'accessed' | 'delivered' | 'bounced' | string
    portal_first_accessed_at: string | null
  } | null
}

export const getRmRecipients = (token: string) =>
  api.get<{ recipients: RmRecipient[]; total: number; release_plan_active: boolean }>(
    '/rm/recipients',
    token,
  )

export const getRmRecipient = (token: string, id: string) =>
  api.get<RmRecipient>(`/rm/recipients/${id}`, token)

export const retryDeliveryEmail = (token: string, id: string, email: string) =>
  api.patch<{ message: string; email_status: string }>(
    `/rm/recipients/${id}/retry-email`,
    { email },
    token,
  )

/* ─── Notifications ──────────────────────────────────────────────────────── */

export interface RmNotification {
  id: string
  source: string
  category: string | null
  title: string
  message: string
  is_read: boolean
  created_at: string
  time_ago: string
}

export const getRmNotifications = (token: string) =>
  api.get<{ notifications: RmNotification[]; unread_count: number; total: number }>(
    '/rm/notifications',
    token,
  )

export const markNotificationRead = (token: string, id: string) =>
  api.patch<{ id: string; is_read: boolean }>(`/rm/notifications/${id}/read`, {}, token)

export const markNotificationUnread = (token: string, id: string) =>
  api.patch<{ id: string; is_read: boolean }>(`/rm/notifications/${id}/unread`, {}, token)

export const getUnreadCount = (token: string) =>
  api.get<{ unread_count: number }>('/rm/notifications/unread-count', token)

/* ─── Downloads (binary — raw fetch, bypasses the JSON envelope client) ─────── */

const API_URL = process.env.NEXT_PUBLIC_API_URL

async function downloadBlob(response: Response, filename: string): Promise<void> {
  if (!response.ok) {
    throw new Error('Download failed. Please try again.')
  }
  const blob = await response.blob()
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = filename
  document.body.appendChild(a)
  a.click()
  a.remove()
  URL.revokeObjectURL(url)
}

export async function downloadActivityReport(token: string): Promise<void> {
  const response = await fetch(`${API_URL}/rm/release-plan/activity-report`, {
    headers: buildAuthHeaders(token),
  })
  await downloadBlob(response, 'Release-Plan-Activity-Report.pdf')
}

/* ─── Downloads (content package) ────────────────────────────────────────── */

export interface DownloadCategorySummary {
  count: number
}

export interface DownloadSummary {
  audio_messages: DownloadCategorySummary
  documents: DownloadCategorySummary
  photos: DownloadCategorySummary
  transcripts: DownloadCategorySummary
  life_story: DownloadCategorySummary
}

export const getDownloadSummary = (token: string) =>
  api.get<DownloadSummary>('/rm/downloads/summary', token)

export interface PrepareDownloadSelection {
  audio?: boolean
  documents?: boolean
  photos?: boolean
  transcripts?: boolean
  life_story?: boolean
}

export async function prepareDownload(
  token: string,
  selection: PrepareDownloadSelection,
): Promise<void> {
  const response = await fetch(`${API_URL}/rm/downloads/prepare`, {
    method: 'POST',
    headers: { ...buildAuthHeaders(token), 'Content-Type': 'application/json' },
    body: JSON.stringify(selection),
  })
  if (!response.ok) {
    let message = 'Download failed. Please try again.'
    try {
      const body = await response.json()
      if (typeof body?.message === 'string') message = body.message
    } catch {
      // non-JSON error body — keep the generic message
    }
    throw new Error(message)
  }
  await downloadBlob(response, 'Tether-Content.zip')
}
