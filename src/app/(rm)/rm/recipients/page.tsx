'use client'

import { useCallback, useEffect, useState } from 'react'
import { ChevronDown, AlertTriangle } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import { useToast } from '@/lib/context/ToastContext'
import { ApiError } from '@/lib/api/client'
import {
  getRmRecipients,
  retryDeliveryEmail,
  type RmRecipient,
} from '@/lib/api/rm'
import { displayRelationship } from '@/lib/relationship'

async function getToken(): Promise<string | null> {
  const supabase = createClient()
  const {
    data: { session },
  } = await supabase.auth.getSession()
  return session?.access_token ?? null
}

type StatusKey = 'portal' | 'opened' | 'notified' | 'bounced'

const STATUS_STYLES: Record<StatusKey, { label: string; bg: string; color: string }> = {
  portal: { label: 'Portal accessed', bg: '#D1FAE5', color: '#065F46' },
  opened: { label: 'Email opened', bg: '#D1FAE5', color: '#065F46' },
  notified: { label: 'Notified', bg: '#EEF2FF', color: '#4F46E5' },
  bounced: { label: 'Email bounced', bg: '#FFE2E3', color: '#FF0000' },
}

const AVATAR_PALETTE: { bg: string; color: string }[] = [
  { bg: '#DBEAFE', color: '#1E40AF' },
  { bg: '#D1FAE5', color: '#065F46' },
  { bg: '#FEF3C7', color: '#92400E' },
  { bg: '#F3E8FF', color: '#6B21A8' },
  { bg: '#FFE4E6', color: '#9F1239' },
]

function avatarStyle(id: string): { bg: string; color: string } {
  let hash = 0
  for (let i = 0; i < id.length; i++) hash = (hash * 31 + id.charCodeAt(i)) | 0
  return AVATAR_PALETTE[Math.abs(hash) % AVATAR_PALETTE.length]
}

function initialsOf(name: string): string {
  const parts = name.trim().split(/\s+/)
  return ((parts[0]?.[0] ?? '') + (parts.length > 1 ? parts[parts.length - 1][0] : '')).toUpperCase()
}

function statusKey(recipient: RmRecipient): StatusKey | null {
  const d = recipient.delivery
  if (!d) return null
  if (d.email_status === 'bounced' || d.portal_status === 'bounced') return 'bounced'
  if (d.portal_status === 'accessed') return 'portal'
  if (d.email_status === 'delivered') return 'opened'
  return 'notified'
}

function itemsOf(recipient: RmRecipient): string[] {
  const c = recipient.content_count
  const items: string[] = []
  if (c.memoir_chapters > 0) items.push(`${c.memoir_chapters} memoir chapter${c.memoir_chapters === 1 ? '' : 's'}`)
  if (c.messages > 0) items.push(`${c.messages} message${c.messages === 1 ? '' : 's'}`)
  if (c.documents > 0) items.push(`${c.documents} document${c.documents === 1 ? '' : 's'}`)
  if (c.photos > 0) items.push(`${c.photos} photo${c.photos === 1 ? '' : 's'}`)
  return items
}

export default function RecipientsPage() {
  const { showToast } = useToast()
  const [recipients, setRecipients] = useState<RmRecipient[]>([])
  const [releasePlanActive, setReleasePlanActive] = useState(false)
  const [loading, setLoading] = useState(true)
  const [expanded, setExpanded] = useState<Record<string, boolean>>({})
  const [retryEmail, setRetryEmail] = useState<Record<string, string>>({})
  const [retrying, setRetrying] = useState<string | null>(null)

  const load = useCallback(async () => {
    setLoading(true)
    const token = await getToken()
    if (!token) {
      setLoading(false)
      return
    }
    try {
      const data = await getRmRecipients(token)
      setRecipients(data.recipients)
      setReleasePlanActive(data.release_plan_active)
      // Bounced rows start expanded so the delivery warning is visible up front.
      setExpanded((prev) => {
        const next = { ...prev }
        for (const r of data.recipients) {
          if (statusKey(r) === 'bounced' && !(r.id in next)) next[r.id] = true
        }
        return next
      })
    } catch (e) {
      showToast(e instanceof ApiError ? e.message : 'Failed to load recipients.', 'error')
    } finally {
      setLoading(false)
    }
  }, [showToast])

  useEffect(() => {
    // Fetch on mount: the setState calls run after an await inside the loader, not synchronously here.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    load()
  }, [load])

  const toggle = (id: string) => setExpanded((prev) => ({ ...prev, [id]: !prev[id] }))

  const handleRetry = async (recipient: RmRecipient) => {
    const email = (retryEmail[recipient.id] ?? '').trim()
    if (!email) return
    const token = await getToken()
    if (!token) return
    setRetrying(recipient.id)
    try {
      await retryDeliveryEmail(token, recipient.id, email)
      showToast(`Delivery email resent to ${email}.`, 'success')
      load()
    } catch (e) {
      showToast(e instanceof ApiError ? e.message : 'Failed to resend delivery email.', 'error')
    } finally {
      setRetrying(null)
    }
  }

  return (
    <div className="w-full max-w-[1200px] mx-auto flex flex-col gap-8 p-6 sm:p-8">
      {/* Header */}
      <div className="flex flex-col gap-4">
        <div className="flex items-center justify-between gap-3 flex-wrap">
          <h1
            style={{
              fontFamily: '"Instrument Serif", serif',
              fontWeight: 400,
              fontSize: 32,
              lineHeight: '48px',
              color: '#111827',
            }}
          >
            Recipients
          </h1>
        </div>

        <div className="flex items-center flex-wrap" style={{ gap: 12 }}>
          <span
            style={{
              fontFamily: 'Inter, sans-serif',
              fontWeight: 400,
              fontSize: 15,
              lineHeight: '22.5px',
              letterSpacing: '-0.23px',
              color: '#6B7280',
            }}
          >
            {recipients.length} designated
          </span>
          {releasePlanActive && (
            <>
              <span
                className="flex-shrink-0"
                style={{ width: 4, height: 4, borderRadius: 9999, background: '#D1D5DB' }}
              />
              <span
                className="flex items-center justify-center flex-shrink-0"
                style={{
                  height: 27.5,
                  padding: '0 14px',
                  borderRadius: 9999,
                  background: '#EEF2FF',
                  fontFamily: 'Inter, sans-serif',
                  fontWeight: 500,
                  fontSize: 13,
                  lineHeight: '19.5px',
                  letterSpacing: '-0.08px',
                  color: '#4F46E5',
                }}
              >
                Release Plan active
              </span>
            </>
          )}
        </div>
      </div>

      {/* Recipient list */}
      {loading ? (
        <div className="flex flex-col gap-3">
          {Array.from({ length: 3 }).map((_, i) => (
            <div
              key={i}
              className="animate-pulse"
              style={{ height: 96, borderRadius: 14, border: '1.25px solid #E5E7EB', background: '#FFFFFF' }}
            />
          ))}
        </div>
      ) : recipients.length === 0 ? (
        <div
          className="flex items-center justify-center text-center"
          style={{ borderRadius: 14, border: '1.25px dashed #E5E7EB', background: '#FFFFFF', padding: 48 }}
        >
          <span style={{ fontFamily: 'Inter, sans-serif', fontSize: 15, color: '#9CA3AF' }}>
            No recipients designated yet.
          </span>
        </div>
      ) : (
        <div
          style={{
            borderRadius: 14,
            border: '1.25px solid #E5E7EB',
            background: '#FFFFFF',
            overflow: 'hidden',
          }}
        >
          {recipients.map((r, i) => {
            const key = statusKey(r)
            const status = key ? STATUS_STYLES[key] : null
            const isOpen = !!expanded[r.id]
            const isLast = i === recipients.length - 1
            const avatar = avatarStyle(r.id)
            const items = itemsOf(r)
            return (
              <div
                key={r.id}
                style={{
                  borderBottom: isLast ? 'none' : '1.25px solid #E5E7EB',
                }}
              >
                {/* Main row */}
                <div className="flex items-center gap-4 flex-wrap" style={{ padding: '24px' }}>
                  <span
                    className="flex items-center justify-center flex-shrink-0"
                    style={{
                      width: 48,
                      height: 48,
                      borderRadius: 9999,
                      background: avatar.bg,
                      fontFamily: 'Inter, sans-serif',
                      fontWeight: 600,
                      fontSize: 15,
                      lineHeight: '22.5px',
                      letterSpacing: '-0.23px',
                      color: avatar.color,
                    }}
                  >
                    {initialsOf(r.name)}
                  </span>

                  <div className="flex-1 flex flex-col" style={{ gap: 4, minWidth: 140 }}>
                    <div className="flex items-center flex-wrap" style={{ gap: 8 }}>
                      <span
                        style={{
                          fontFamily: 'Inter, sans-serif',
                          fontWeight: 600,
                          fontSize: 15,
                          lineHeight: '22.5px',
                          letterSpacing: '-0.23px',
                          color: '#111827',
                        }}
                      >
                        {r.name}
                      </span>
                      <span
                        className="flex items-center justify-center flex-shrink-0"
                        style={{
                          padding: '2px 8px',
                          borderRadius: 4,
                          background: '#F9FAFB',
                          fontFamily: 'Inter, sans-serif',
                          fontWeight: 400,
                          fontSize: 13,
                          lineHeight: '19.5px',
                          letterSpacing: '-0.08px',
                          color: '#6B7280',
                        }}
                      >
                        {displayRelationship(r.relationship)}
                      </span>
                    </div>
                    <span
                      className="break-all"
                      style={{
                        fontFamily: 'Inter, sans-serif',
                        fontWeight: 400,
                        fontSize: 14,
                        lineHeight: '21px',
                        letterSpacing: '-0.15px',
                        color: '#6B7280',
                      }}
                    >
                      {r.email}
                    </span>
                  </div>

                  <div className="flex items-center flex-wrap" style={{ gap: 12 }}>
                    {status && (
                      <span
                        className="flex items-center justify-center flex-shrink-0"
                        style={{
                          height: 27.5,
                          padding: '0 12px',
                          borderRadius: 9999,
                          background: status.bg,
                          fontFamily: 'Inter, sans-serif',
                          fontWeight: 500,
                          fontSize: 13,
                          lineHeight: '19.5px',
                          letterSpacing: '-0.08px',
                          color: status.color,
                        }}
                      >
                        {status.label}
                      </span>
                    )}
                    <span
                      className="whitespace-nowrap"
                      style={{
                        fontFamily: 'Inter, sans-serif',
                        fontWeight: 400,
                        fontSize: 14,
                        lineHeight: '21px',
                        letterSpacing: '-0.15px',
                        color: '#6B7280',
                      }}
                    >
                      {items.length} items designated
                    </span>
                    <button
                      type="button"
                      onClick={() => toggle(r.id)}
                      className="flex items-center justify-center flex-shrink-0 cursor-pointer"
                      aria-label={isOpen ? 'Collapse' : 'Expand'}
                    >
                      <ChevronDown
                        className="transition-transform duration-200"
                        style={{
                          width: 20,
                          height: 20,
                          color: '#9CA3AF',
                          transform: isOpen ? 'rotate(180deg)' : 'none',
                        }}
                        strokeWidth={2}
                      />
                    </button>
                  </div>
                </div>

                {/* Expanded detail */}
                {isOpen && key === 'bounced' && (
                  <div style={{ padding: '0 24px 24px' }}>
                    <div
                      className="flex flex-col"
                      style={{
                        gap: 10,
                        borderRadius: 8,
                        borderTop: '0.5px solid #F59E0C',
                        borderRight: '0.5px solid #F59E0C',
                        borderBottom: '0.5px solid #F59E0C',
                        borderLeft: '4px solid #F59E0C',
                        background: '#FFFBF6',
                        padding: '12px 16px',
                      }}
                    >
                      <div className="flex items-start" style={{ gap: 8 }}>
                        <AlertTriangle
                          className="flex-shrink-0"
                          style={{ width: 20, height: 20, color: '#A96D00', marginTop: 1 }}
                          strokeWidth={2}
                        />
                        <div className="flex flex-col" style={{ gap: 3 }}>
                          <span
                            style={{
                              fontFamily: 'Inter, sans-serif',
                              fontWeight: 500,
                              fontSize: 14,
                              lineHeight: '21px',
                              letterSpacing: '-0.15px',
                              color: '#A96D00',
                            }}
                          >
                            Delivery email bounced for {r.name}
                          </span>
                          <span
                            style={{
                              fontFamily: 'Inter, sans-serif',
                              fontWeight: 400,
                              fontSize: 14,
                              lineHeight: '21px',
                              letterSpacing: '-0.15px',
                              color: '#A96D00',
                            }}
                          >
                            {r.email} did not receive the delivery notification.
                          </span>
                        </div>
                      </div>
                      <div className="flex items-center gap-2 flex-wrap" style={{ paddingLeft: 28 }}>
                        <input
                          type="email"
                          value={retryEmail[r.id] ?? ''}
                          onChange={(e) =>
                            setRetryEmail((prev) => ({ ...prev, [r.id]: e.target.value }))
                          }
                          placeholder="Updated email address"
                          className="focus:outline-none"
                          style={{
                            height: 34,
                            minWidth: 220,
                            borderRadius: 8,
                            border: '1px solid #F59E0C',
                            background: '#FFFFFF',
                            padding: '0 10px',
                            fontFamily: 'Inter, sans-serif',
                            fontSize: 13,
                            color: '#111827',
                          }}
                        />
                        <button
                          type="button"
                          onClick={() => handleRetry(r)}
                          disabled={retrying === r.id || !(retryEmail[r.id] ?? '').trim()}
                          className="cursor-pointer hover:opacity-90 disabled:opacity-50 disabled:cursor-not-allowed"
                          style={{
                            height: 34,
                            padding: '0 14px',
                            borderRadius: 8,
                            background: '#F59E0C',
                            fontFamily: 'Inter, sans-serif',
                            fontWeight: 500,
                            fontSize: 13,
                            color: '#FFFFFF',
                          }}
                        >
                          {retrying === r.id ? 'Sending…' : 'Update email'}
                        </button>
                      </div>
                    </div>
                  </div>
                )}

                {isOpen && key !== 'bounced' && (
                  <div style={{ background: '#F9FAFB', padding: '8px 24px 24px' }}>
                    {items.length === 0 ? (
                      <span
                        style={{
                          fontFamily: 'Inter, sans-serif',
                          fontSize: 13,
                          color: '#9CA3AF',
                        }}
                      >
                        No content assigned yet.
                      </span>
                    ) : (
                      <div className="flex flex-wrap" style={{ gap: 12 }}>
                        {items.map((item) => (
                          <span
                            key={item}
                            className="flex items-center justify-center"
                            style={{
                              height: 34,
                              padding: '0 16px',
                              borderRadius: 9999,
                              border: '1.25px solid #E5E7EB',
                              background: '#FFFFFF',
                              fontFamily: 'Inter, sans-serif',
                              fontWeight: 400,
                              fontSize: 13,
                              lineHeight: '19.5px',
                              letterSpacing: '-0.08px',
                              color: '#4F46E5',
                            }}
                          >
                            {item}
                          </span>
                        ))}
                      </div>
                    )}
                  </div>
                )}
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}
