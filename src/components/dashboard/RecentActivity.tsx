'use client'

import { FileText, Check, Video, UserPlus, LucideIcon } from 'lucide-react'

type Activity = {
  icon: LucideIcon
  iconBg: string
  iconColor: string
  title: string
  meta: string
  badge?: { label: string; bg: string; color: string }
}

const activities: Activity[] = [
  {
    icon: FileText,
    iconBg: '#E0E7FF',
    iconColor: '#4F39F6',
    title: 'Life Insurance Policy uploaded',
    meta: 'Today, 9:14 AM · 2.3 MB PDF',
    badge: { label: 'Insurance', bg: '#DCFCE7', color: '#016630' },
  },
  {
    icon: Check,
    iconBg: '#DCFCE7',
    iconColor: '#00A63E',
    title: 'Release Manager confirmed — Marcus W.',
    meta: 'Yesterday, 4:32 PM · Invitation accepted',
  },
  {
    icon: Video,
    iconBg: '#DCFCE7',
    iconColor: '#00A63E',
    title: 'Video message recorded for Sarah',
    meta: 'Dec 27 · 3 min 42 sec · Saved',
  },
  {
    icon: UserPlus,
    iconBg: '#FEF9C2',
    iconColor: '#D08700',
    title: 'James added as recipient',
    meta: 'Dec 25 · 4 messages assigned',
    badge: { label: 'New', bg: '#DBEAFE', color: '#1447E6' },
  },
]

export default function RecentActivity() {
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
          className="text-[13.6px] font-semibold leading-5 transition-opacity hover:opacity-80"
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
        {activities.map((item, idx) => {
          const Icon = item.icon
          const isLast = idx === activities.length - 1
          return (
            <div
              key={idx}
              className="flex items-center gap-3 p-4"
              style={{
                borderBottom: isLast ? 'none' : '0.8px solid rgba(0,0,0,0.1)',
              }}
            >
              {/* Icon */}
              <div
                className="w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0"
                style={{ background: item.iconBg }}
              >
                <Icon
                  className="w-5 h-5"
                  strokeWidth={2}
                  color={item.iconColor}
                />
              </div>

              {/* Text */}
              <div className="flex-1 min-w-0 flex flex-col gap-1">
                <div className="flex flex-wrap items-center gap-x-3 gap-y-1">
                  <p
                    className="text-[13.2px] font-semibold text-[#101828] leading-5 break-words"
                    style={{ fontFamily: 'Inter, sans-serif' }}
                  >
                    {item.title}
                  </p>
                  {item.badge && (
                    <span
                      className="flex-shrink-0 px-2 py-[2px] rounded text-[11.8px] font-medium leading-4"
                      style={{
                        background: item.badge.bg,
                        color: item.badge.color,
                        fontFamily: 'Inter, sans-serif',
                      }}
                    >
                      {item.badge.label}
                    </span>
                  )}
                </div>
                <p
                  className="text-[10.9px] text-[#4A5565] leading-4"
                  style={{ fontFamily: 'Inter, sans-serif' }}
                >
                  {item.meta}
                </p>
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}
