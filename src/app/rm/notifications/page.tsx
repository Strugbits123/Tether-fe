'use client'

import { useMemo, useState } from 'react'
import { ChevronRight, X } from 'lucide-react'

// Release Manager portal — Notifications. Static placeholder data for now;
// wires to real notification endpoints once they exist.

type Category = 'Recommendation' | 'Feature' | 'Security Alert' | 'System Update'

interface Notification {
  id: number
  sender: string
  category?: Category
  message: string
  date: string
  unread?: boolean
}

const CATEGORY_STYLES: Record<Category, { bg: string; color: string }> = {
  Recommendation: { bg: '#DBEAFE', color: '#1447E6' },
  Feature: { bg: '#D0FAE5', color: '#007A55' },
  'Security Alert': { bg: '#FFE2E2', color: '#C10007' },
  'System Update': { bg: '#F3E8FF', color: '#8200DB' },
}

const CATEGORIES: Category[] = [
  'Recommendation',
  'Feature',
  'Security Alert',
  'System Update',
]

const NOTIFICATIONS: Notification[] = [
  {
    id: 1,
    sender: 'Tether',
    category: 'Recommendation',
    message: 'We recommend adding your medical power of attorney to your vault',
    date: '21/5/2026',
  },
  {
    id: 2,
    sender: 'Tether',
    category: 'Feature',
    message: 'New feature: Voice messages now support transcription',
    date: '21/5/2026',
    unread: true,
  },
  {
    id: 3,
    sender: 'Tether',
    category: 'Security Alert',
    message: 'Security update: Two-factor authentication is now available',
    date: '21/5/2026',
  },
  {
    id: 4,
    sender: 'Michael Chen',
    message:
      'Thank you so much for adding me as a trusted contact. I want you to know...',
    date: '5 hours ago',
  },
  {
    id: 5,
    sender: 'Tether',
    category: 'System Update',
    message: 'System maintenance scheduled for March 30th',
    date: '21/5/2026',
  },
  {
    id: 6,
    sender: 'Tether',
    category: 'Recommendation',
    message: 'Reminder: Complete your legacy planning checklist',
    date: '21/5/2026',
  },
]

export default function NotificationsPage() {
  const [items, setItems] = useState<Notification[]>(NOTIFICATIONS)
  const [filter, setFilter] = useState<'All' | Category>('All')
  const [selectedId, setSelectedId] = useState<number | null>(null)

  const visible = useMemo(
    () =>
      filter === 'All'
        ? items
        : items.filter((n) => n.category === filter),
    [items, filter],
  )

  const unreadCount = items.filter((n) => n.unread).length
  const selected = items.find((n) => n.id === selectedId) ?? null

  const dismiss = (id: number) => {
    setItems((prev) => prev.filter((n) => n.id !== id))
    setSelectedId((prev) => (prev === id ? null : prev))
  }

  return (
    <div className="w-full max-w-[1200px] mx-auto flex flex-col gap-7 p-6 sm:p-8">
      {/* Header */}
      <div className="flex flex-col" style={{ gap: 9 }}>
        <div className="flex items-center flex-wrap" style={{ gap: 12 }}>
          <h1
            style={{
              fontFamily: '"Instrument Serif", serif',
              fontWeight: 400,
              fontSize: 40,
              lineHeight: '48px',
              color: '#101828',
            }}
          >
            Notifications
          </h1>
          {unreadCount > 0 && (
            <span
              className="flex items-center flex-shrink-0"
              style={{
                gap: 9,
                padding: '4.5px 13.5px',
                borderRadius: 11.25,
                background: '#DBEAFE',
              }}
            >
              <span
                style={{
                  fontFamily: 'Inter, sans-serif',
                  fontWeight: 600,
                  fontSize: 18,
                  lineHeight: '27px',
                  letterSpacing: '-0.35px',
                  color: '#1447E6',
                }}
              >
                {unreadCount}
              </span>
              <span
                style={{
                  fontFamily: 'Inter, sans-serif',
                  fontWeight: 400,
                  fontSize: 15.76,
                  lineHeight: '22.5px',
                  letterSpacing: '-0.17px',
                  color: '#1447E6',
                }}
              >
                New Message
              </span>
            </span>
          )}
        </div>
        <p
          style={{
            fontFamily: 'Inter, sans-serif',
            fontWeight: 400,
            fontSize: 18,
            lineHeight: '27px',
            letterSpacing: '-0.35px',
            color: '#4A5565',
          }}
        >
          Stay updated with messages from your trusted contacts and Tether
        </p>
      </div>

      {/* Filter row */}
      <div className="flex items-center flex-wrap" style={{ gap: 13.5 }}>
        <span
          className="flex-shrink-0"
          style={{
            fontFamily: 'Inter, sans-serif',
            fontWeight: 500,
            fontSize: 15.76,
            lineHeight: '22.5px',
            letterSpacing: '-0.17px',
            color: '#364153',
          }}
        >
          Filter by category:
        </span>
        <div className="flex items-center flex-wrap" style={{ gap: 9 }}>
          <FilterChip
            label="All"
            active={filter === 'All'}
            onClick={() => setFilter('All')}
          />
          {CATEGORIES.map((c) => (
            <FilterChip
              key={c}
              label={c}
              category={c}
              active={filter === c}
              onClick={() => setFilter(c)}
            />
          ))}
        </div>
      </div>

      {/* Content: list + detail panel */}
      <div className="flex flex-col lg:flex-row" style={{ gap: 27 }}>
        {/* Notification list */}
        <div className="flex-1 min-w-0 flex flex-col" style={{ gap: 9 }}>
          {visible.length === 0 ? (
            <div
              className="flex items-center justify-center"
              style={{
                borderRadius: 11.25,
                border: '1.41px solid #E5E7EB',
                background: '#FFFFFF',
                padding: '40px',
                fontFamily: 'Inter, sans-serif',
                fontSize: 15.76,
                color: '#99A1AF',
              }}
            >
              No notifications in this category
            </div>
          ) : (
            visible.map((n) => {
              const isSelected = n.id === selectedId
              return (
                <button
                  key={n.id}
                  type="button"
                  onClick={() => setSelectedId(n.id)}
                  className="flex items-start text-left cursor-pointer transition-colors hover:bg-gray-50"
                  style={{
                    gap: 13.5,
                    borderRadius: 11.25,
                    border: `1.41px solid ${isSelected ? '#155DFC' : '#E5E7EB'}`,
                    background: '#FFFFFF',
                    padding: '19.41px',
                  }}
                >
                  <div className="flex-1 min-w-0 flex flex-col" style={{ gap: 4.48 }}>
                    <div className="flex items-center flex-wrap" style={{ gap: 9 }}>
                      <span
                        style={{
                          fontFamily: 'Inter, sans-serif',
                          fontWeight: 600,
                          fontSize: 18,
                          lineHeight: '27px',
                          letterSpacing: '-0.35px',
                          color: '#101828',
                        }}
                      >
                        {n.sender}
                      </span>
                      {n.category && (
                        <span
                          className="flex items-center justify-center flex-shrink-0"
                          style={{
                            padding: '2px 9px',
                            borderRadius: 4.5,
                            background: CATEGORY_STYLES[n.category].bg,
                            fontFamily: 'Inter, sans-serif',
                            fontWeight: 600,
                            fontSize: 13.5,
                            lineHeight: '18px',
                            color: CATEGORY_STYLES[n.category].color,
                          }}
                        >
                          {n.category}
                        </span>
                      )}
                      {n.unread && (
                        <span
                          className="flex-shrink-0"
                          style={{
                            width: 9,
                            height: 9,
                            borderRadius: 9999,
                            background: '#155DFC',
                          }}
                        />
                      )}
                    </div>
                    <span
                      style={{
                        fontFamily: 'Inter, sans-serif',
                        fontWeight: 400,
                        fontSize: 15.76,
                        lineHeight: '22.5px',
                        letterSpacing: '-0.17px',
                        color: '#364153',
                      }}
                    >
                      {n.message}
                    </span>
                    <span
                      style={{
                        fontFamily: 'Inter, sans-serif',
                        fontWeight: 400,
                        fontSize: 13.5,
                        lineHeight: '18px',
                        color: '#6A7282',
                      }}
                    >
                      {n.date}
                    </span>
                  </div>

                  <div className="flex items-center flex-shrink-0" style={{ gap: 4.48 }}>
                    <span
                      role="button"
                      tabIndex={0}
                      aria-label="Dismiss notification"
                      onClick={(e) => {
                        e.stopPropagation()
                        dismiss(n.id)
                      }}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter' || e.key === ' ') {
                          e.preventDefault()
                          e.stopPropagation()
                          dismiss(n.id)
                        }
                      }}
                      className="flex items-center justify-center cursor-pointer rounded-[9px] hover:bg-gray-100 transition-colors"
                      style={{ width: 36, height: 36 }}
                    >
                      <X style={{ width: 18, height: 18, color: '#99A1AF' }} strokeWidth={2} />
                    </span>
                    <ChevronRight
                      className="flex-shrink-0"
                      style={{ width: 18, height: 18, color: '#99A1AF' }}
                      strokeWidth={2}
                    />
                  </div>
                </button>
              )
            })
          )}
        </div>

        {/* Detail panel */}
        <div className="w-full lg:w-[366px] flex-shrink-0">
          <div
            className="lg:sticky lg:top-8"
            style={{
              borderRadius: 11.25,
              border: '1.41px solid #E5E7EB',
              background: '#FFFFFF',
            }}
          >
            {selected ? (
              <div className="flex flex-col" style={{ gap: 12, padding: '24px' }}>
                <div className="flex items-center flex-wrap" style={{ gap: 9 }}>
                  <span
                    style={{
                      fontFamily: 'Inter, sans-serif',
                      fontWeight: 600,
                      fontSize: 18,
                      lineHeight: '27px',
                      letterSpacing: '-0.35px',
                      color: '#101828',
                    }}
                  >
                    {selected.sender}
                  </span>
                  {selected.category && (
                    <span
                      className="flex items-center justify-center flex-shrink-0"
                      style={{
                        padding: '2px 9px',
                        borderRadius: 4.5,
                        background: CATEGORY_STYLES[selected.category].bg,
                        fontFamily: 'Inter, sans-serif',
                        fontWeight: 600,
                        fontSize: 13.5,
                        lineHeight: '18px',
                        color: CATEGORY_STYLES[selected.category].color,
                      }}
                    >
                      {selected.category}
                    </span>
                  )}
                </div>
                <p
                  style={{
                    fontFamily: 'Inter, sans-serif',
                    fontWeight: 400,
                    fontSize: 15.76,
                    lineHeight: '22.5px',
                    letterSpacing: '-0.17px',
                    color: '#364153',
                  }}
                >
                  {selected.message}
                </p>
                <span
                  style={{
                    fontFamily: 'Inter, sans-serif',
                    fontWeight: 400,
                    fontSize: 13.5,
                    lineHeight: '18px',
                    color: '#6A7282',
                  }}
                >
                  {selected.date}
                </span>
              </div>
            ) : (
              <div
                className="flex items-center justify-center text-center"
                style={{ padding: '55.41px', minHeight: 133 }}
              >
                <span
                  style={{
                    fontFamily: 'Inter, sans-serif',
                    fontWeight: 400,
                    fontSize: 15.76,
                    lineHeight: '22.5px',
                    letterSpacing: '-0.17px',
                    color: '#99A1AF',
                  }}
                >
                  Select a notification to view details
                </span>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

function FilterChip({
  label,
  category,
  active,
  onClick,
}: {
  label: string
  category?: Category
  active: boolean
  onClick: () => void
}) {
  // "All" is dark; category chips use their own palette. The active chip keeps
  // its colored background; inactive category chips are slightly muted.
  const base =
    category && CATEGORY_STYLES[category]
      ? CATEGORY_STYLES[category]
      : { bg: '#101828', color: '#FFFFFF' }

  return (
    <button
      type="button"
      onClick={onClick}
      className="flex items-center justify-center cursor-pointer transition-opacity"
      style={{
        height: 41,
        padding: '0 16.88px',
        borderRadius: 11.25,
        background: base.bg,
        opacity: active ? 1 : 0.55,
        outline: active && category ? `2px solid ${base.color}` : 'none',
        outlineOffset: -2,
        fontFamily: 'Inter, sans-serif',
        fontWeight: 500,
        fontSize: 15.76,
        lineHeight: '22.5px',
        letterSpacing: '-0.17px',
        color: base.color,
      }}
    >
      {label}
    </button>
  )
}
