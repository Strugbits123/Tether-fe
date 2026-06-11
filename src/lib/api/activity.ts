import { api } from './client'

export interface ActivityItem {
  id: string
  event_type: string
  event_label: string
  metadata: Record<string, unknown> | null
  created_at: string
}

export const getRecentActivity = (token: string, limit: number = 10) =>
  api.get<ActivityItem[]>(`/activity?limit=${limit}`, token)
