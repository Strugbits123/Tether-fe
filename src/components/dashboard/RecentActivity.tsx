'use client'

import { useCallback, useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useToast } from '@/lib/context/ToastContext'
import { getRecentActivity, type ActivityItem } from '@/lib/api/activity'
import {
  ACTIVITY_REFRESH_EVENT,
  formatActivityTime,
  getActivityBadge,
  getActivityIcon,
  getActivityIconStyle,
  getActivityMeta,
} from '@/lib/activity-helpers'

export default function RecentActivity() {
  const { showToast } = useToast()
  const [activities, setActivities] = useState<ActivityItem[]>([])
  const [loading, setLoading] = useState(true)

  const loadActivity = useCallback(async () => {
    const supabase = createClient()
    const {
      data: { session },
    } = await supabase.auth.getSession()
    const token = session?.access_token
    if (!token) {
      setLoading(false)
      return
    }
    try {
      const data = await getRecentActivity(token, 5)
      setActivities(data)
    } catch {
      // Non-critical — silently ignore.
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    loadActivity()
    const onRefresh = () => loadActivity()
    window.addEventListener(ACTIVITY_REFRESH_EVENT, onRefresh)
    return () => window.removeEventListener(ACTIVITY_REFRESH_EVENT, onRefresh)
  }, [loadActivity])

  return (
    <div className="flex flex-col gap-4">
      {/* Section header */}
      <div className="flex items-center justify-between">
        <h3
          className="text-[10.9px] font-semibold uppercase text-[#6A7282] leading-4"
          style={{ fontFamily: 'Inter, sans-serif', letterSpacing: '0.3px' }}
        >
          Recent Activity
        </h3>
        <button
          type="button"
          onClick={() => showToast('Full activity view coming soon', 'info')}
          className="text-[13.6px] font-semibold leading-5 transition-opacity hover:opacity-80 cursor-pointer"
          style={{ fontFamily: 'Inter, sans-serif', color: '#4F39F6' }}
        >
          View all →
        </button>
      </div>

      {/* List card */}
      <div
        className="rounded-[14px] bg-white overflow-hidden"
        style={{ border: '1px solid rgba(0,0,0,0.1)' }}
      >
        {loading ? (
          [0, 1, 2].map((i) => (
            <div
              key={i}
              className="flex items-center gap-3 p-4 animate-pulse"
              style={{
                borderBottom: i === 2 ? 'none' : '0.8px solid rgba(0,0,0,0.1)',
              }}
            >
              <div className="w-10 h-10 rounded-lg flex-shrink-0 bg-gray-100" />
              <div className="flex-1 flex flex-col gap-2">
                <div className="h-3 bg-gray-200 rounded w-2/3" />
                <div className="h-2.5 bg-gray-100 rounded w-1/3" />
              </div>
            </div>
          ))
        ) : activities.length === 0 ? (
          <div className="flex flex-col items-center justify-center text-center px-6 py-10 gap-1">
            <p
              className="text-[13.2px] font-semibold text-[#101828] leading-5"
              style={{ fontFamily: 'Inter, sans-serif' }}
            >
              No activity yet
            </p>
            <p
              className="text-[12px] text-[#6A7282] leading-4"
              style={{ fontFamily: 'Inter, sans-serif' }}
            >
              Start by completing your profile!
            </p>
          </div>
        ) : (
          activities.map((item, idx) => {
            const Icon = getActivityIcon(item.event_type, item.metadata)
            const iconStyle = getActivityIconStyle(item.event_type)
            const badge = getActivityBadge(item.event_type, item.metadata)
            const time = formatActivityTime(item.created_at)
            const meta = getActivityMeta(item.event_type, item.metadata)
            const isLast = idx === activities.length - 1
            return (
              <div
                key={item.id}
                className="flex items-center gap-3 p-4"
                style={{
                  borderBottom: isLast ? 'none' : '0.8px solid rgba(0,0,0,0.1)',
                }}
              >
                {/* Icon */}
                <div
                  className="w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0"
                  style={{ background: iconStyle.bg }}
                >
                  <Icon className="w-5 h-5" strokeWidth={2} color={iconStyle.color} />
                </div>

                {/* Text */}
                <div className="flex-1 min-w-0 flex flex-col gap-1">
                  <div className="flex flex-wrap items-center gap-x-3 gap-y-1">
                    <p
                      className="text-[13.2px] font-semibold text-[#101828] leading-5 break-words"
                      style={{ fontFamily: 'Inter, sans-serif' }}
                    >
                      {item.event_label}
                    </p>
                    {badge && (
                      <span
                        className="flex-shrink-0 px-2 py-[2px] rounded text-[11.8px] font-medium leading-4"
                        style={{
                          background: badge.bg,
                          color: badge.color,
                          fontFamily: 'Inter, sans-serif',
                        }}
                      >
                        {badge.label}
                      </span>
                    )}
                  </div>
                  <p
                    className="text-[10.9px] text-[#4A5565] leading-4"
                    style={{ fontFamily: 'Inter, sans-serif' }}
                  >
                    {time}
                    {meta && ` · ${meta}`}
                  </p>
                </div>
              </div>
            )
          })
        )}
      </div>
    </div>
  )
}
