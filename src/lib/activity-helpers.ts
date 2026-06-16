import {
  FileText,
  Image as ImageIcon,
  Mic,
  UserCheck,
  UserPlus,
  Video,
  CheckCircle,
  type LucideIcon,
} from 'lucide-react'
import { formatFileSize } from '@/lib/utils/assignments'

type Meta = Record<string, unknown> | null

function str(v: unknown): string | undefined {
  return typeof v === 'string' ? v : undefined
}
function num(v: unknown): number | undefined {
  return typeof v === 'number' ? v : undefined
}
function capitalize(s: string): string {
  return s.charAt(0).toUpperCase() + s.slice(1)
}

export function getActivityIcon(eventType: string, metadata?: Meta): LucideIcon {
  if (eventType === 'message_created') {
    const type = str(metadata?.type)
    if (type === 'audio') return Mic
    if (type === 'video') return Video
    return FileText
  }
  switch (eventType) {
    case 'document_uploaded':
      return FileText
    case 'photos_uploaded':
      return ImageIcon
    case 'recipient_added':
      return UserPlus
    case 'release_manager_designated':
      return UserCheck
    case 'profile_completed':
      return CheckCircle
    default:
      return FileText
  }
}

export function getActivityIconStyle(eventType: string): { bg: string; color: string } {
  switch (eventType) {
    case 'document_uploaded':
    case 'message_created':
    case 'photos_uploaded':
      return { bg: '#EEF2FF', color: '#4F39F6' }
    case 'recipient_added':
      return { bg: '#FEF3C7', color: '#D97706' }
    case 'release_manager_designated':
    case 'profile_completed':
      return { bg: '#D1FAE5', color: '#059669' }
    default:
      return { bg: '#EEF2FF', color: '#4F39F6' }
  }
}

export function formatActivityTime(iso: string): string {
  const date = new Date(iso)
  if (Number.isNaN(date.getTime())) return ''
  const now = new Date()
  const diffMs = now.getTime() - date.getTime()
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24))
  const time = date.toLocaleTimeString(undefined, { hour: 'numeric', minute: '2-digit' })

  if (diffDays === 0) return `Today, ${time}`
  if (diffDays === 1) return `Yesterday, ${time}`
  if (diffDays < 7) {
    const day = date.toLocaleDateString(undefined, { weekday: 'long' })
    return `${day}, ${time}`
  }
  return date.toLocaleDateString(undefined, { month: 'short', day: 'numeric' })
}

export function getActivityMeta(eventType: string, metadata: Meta): string {
  if (!metadata) return ''
  switch (eventType) {
    case 'document_uploaded': {
      const size = num(metadata.fileSize)
      const type = str(metadata.fileType)
      return [size ? formatFileSize(size) : '', type ? type.toUpperCase() : '']
        .filter(Boolean)
        .join(' ')
    }
    case 'message_created': {
      const type = str(metadata.type)
      const typeLabel = type === 'video' ? 'Video' : type === 'audio' ? 'Audio' : 'Written'
      return `${typeLabel} message`
    }
    case 'photos_uploaded': {
      const count = num(metadata.count) ?? 1
      return `${count} photo${count > 1 ? 's' : ''}`
    }
    case 'recipient_added': {
      const rel = str(metadata.relationship)
      return rel ? capitalize(rel) : ''
    }
    case 'release_manager_designated':
      return 'Invitation sent'
    case 'profile_completed':
      return 'Account setup'
    default:
      return ''
  }
}

export function getActivityBadge(
  eventType: string,
  metadata: Meta,
): { label: string; bg: string; color: string } | null {
  if (eventType === 'document_uploaded') {
    const category = str(metadata?.category)
    if (category && category !== 'personal') {
      return { label: capitalize(category), bg: '#EEF2FF', color: '#4F39F6' }
    }
  }
  return null
}

/** Lightweight cross-component signal to re-fetch the activity feed after an action. */
export const ACTIVITY_REFRESH_EVENT = 'tether:activity-refresh'

export function notifyActivityChanged() {
  if (typeof window !== 'undefined') {
    window.dispatchEvent(new Event(ACTIVITY_REFRESH_EVENT))
  }
}
