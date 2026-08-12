'use client'

import { useCallback, useEffect, useState } from 'react'
import { ChevronRight, Mail, MailOpen } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import { useToast } from '@/lib/context/ToastContext'
import { ApiError } from '@/lib/api/client'
import {
  getRmNotifications,
  markNotificationRead,
  markNotificationUnread,
  type RmNotification,
} from '@/lib/api/rm'

async function getToken(): Promise<string | null> {
  const supabase = createClient()
  const {
    data: { session },
  } = await supabase.auth.getSession()
  return session?.access_token ?? null
}

export default function NotificationsPage() {
  const { showToast } = useToast()
  const [items, setItems] = useState<RmNotification[]>([])
  const [unreadCount, setUnreadCount] = useState(0)
  const [selectedId, setSelectedId] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)

  const load = useCallback(async () => {
    setLoading(true)
    const token = await getToken()
    if (!token) {
      setLoading(false)
      return
    }
    try {
      const data = await getRmNotifications(token)
      setItems(data.notifications)
      setUnreadCount(data.unread_count)
    } catch (e) {
      showToast(e instanceof ApiError ? e.message : 'Failed to load notifications.', 'error')
    } finally {
      setLoading(false)
    }
  }, [showToast])

  useEffect(() => {
    // Fetch on mount. load() does set loading/error synchronously before its
    // first await, but on mount those already hold their initial values, so React
    // bails out without an extra render. The resets matter on later refetches.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    load()
  }, [load])

  const selected = items.find((n) => n.id === selectedId) ?? null

  const handleSelect = (n: RmNotification) => {
    setSelectedId(n.id)
  }

  const toggleRead = async (n: RmNotification) => {
    const token = await getToken()
    if (!token) return
    const nextIsRead = !n.is_read
    setItems((prev) => prev.map((it) => (it.id === n.id ? { ...it, is_read: nextIsRead } : it)))
    setUnreadCount((c) => Math.max(0, c + (nextIsRead ? -1 : 1)))
    try {
      await (nextIsRead ? markNotificationRead(token, n.id) : markNotificationUnread(token, n.id))
    } catch (e) {
      showToast(e instanceof ApiError ? e.message : 'Failed to update notification.', 'error')
      load()
    }
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

      {/* Content: list + detail panel */}
      <div className="flex flex-col lg:flex-row" style={{ gap: 27 }}>
        {/* Notification list */}
        <div className="flex-1 min-w-0 flex flex-col" style={{ gap: 9 }}>
          {loading ? (
            Array.from({ length: 3 }).map((_, i) => (
              <div
                key={i}
                className="animate-pulse"
                style={{ height: 90, borderRadius: 11.25, border: '1.41px solid #E5E7EB', background: '#FFFFFF' }}
              />
            ))
          ) : items.length === 0 ? (
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
              No notifications yet
            </div>
          ) : (
            items.map((n) => {
              const isSelected = n.id === selectedId
              return (
                <button
                  key={n.id}
                  type="button"
                  onClick={() => handleSelect(n)}
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
                        {n.title}
                      </span>
                      {!n.is_read && (
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
                      {n.time_ago}
                    </span>
                  </div>

                  <div className="flex items-center flex-shrink-0" style={{ gap: 4.48 }}>
                    <span
                      role="button"
                      tabIndex={0}
                      aria-label={n.is_read ? 'Mark as unread' : 'Mark as read'}
                      title={n.is_read ? 'Mark as unread' : 'Mark as read'}
                      onClick={(e) => {
                        e.stopPropagation()
                        toggleRead(n)
                      }}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter' || e.key === ' ') {
                          e.preventDefault()
                          e.stopPropagation()
                          toggleRead(n)
                        }
                      }}
                      className="flex items-center justify-center cursor-pointer rounded-[9px] hover:bg-gray-100 transition-colors"
                      style={{ width: 36, height: 36 }}
                    >
                      {n.is_read ? (
                        <MailOpen style={{ width: 18, height: 18, color: '#99A1AF' }} strokeWidth={2} />
                      ) : (
                        <Mail style={{ width: 18, height: 18, color: '#155DFC' }} strokeWidth={2} />
                      )}
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
                    {selected.title}
                  </span>
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
                  {selected.time_ago}
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
