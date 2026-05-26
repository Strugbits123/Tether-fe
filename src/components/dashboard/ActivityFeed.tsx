'use client'

import { formatRelativeTime } from '@/lib/utils'
import type { ActivityItem } from '@/types'
import { Activity } from 'lucide-react'

const eventColors: Record<string, string> = {
  default: 'bg-[#64748B]',
  message: 'bg-[#4338CA]',
  document: 'bg-[#D97706]',
  photo: 'bg-[#16A34A]',
  recipient: 'bg-[#0D9488]',
}

function getEventColor(eventType: string): string {
  for (const key of Object.keys(eventColors)) {
    if (eventType.includes(key)) return eventColors[key]
  }
  return eventColors.default
}

interface ActivityFeedProps {
  items: ActivityItem[]
}

export default function ActivityFeed({ items }: ActivityFeedProps) {
  if (items.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-12 text-center">
        <div className="w-12 h-12 bg-[#F1F5F9] rounded-full flex items-center justify-center mb-4">
          <Activity className="w-6 h-6 text-[#94A3B8]" />
        </div>
        <p className="text-sm font-medium text-[#64748B]">No activity yet.</p>
        <p className="text-xs text-[#94A3B8] mt-1">Start by recording your first message.</p>
      </div>
    )
  }

  return (
    <ul className="divide-y divide-[#F1F5F9]">
      {items.map((item) => (
        <li key={item.id} className="flex items-center gap-3 py-3">
          <div className={`w-2 h-2 rounded-full flex-shrink-0 ${getEventColor(item.event_type)}`} />
          <span className="text-sm text-[#1E293B] flex-1">{item.event_label}</span>
          <span className="text-xs text-[#94A3B8] flex-shrink-0">{formatRelativeTime(item.created_at)}</span>
        </li>
      ))}
    </ul>
  )
}
