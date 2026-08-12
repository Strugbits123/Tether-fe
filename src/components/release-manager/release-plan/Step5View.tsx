'use client'

import { useState } from 'react'
import { Check, Loader2 } from 'lucide-react'
import type { DeliveryStatusRecipient, ReleasePlanActivityEvent } from '@/lib/api/rm'
import { formatDateTimeDot, formatReleaseDate } from './constants'

const AVATAR_PALETTE: { bg: string; color: string }[] = [
  { bg: '#DBEAFE', color: '#1E40AF' },
  { bg: '#D1FAE5', color: '#065F46' },
  { bg: '#FEF3C7', color: '#92400E' },
  { bg: '#F3E8FF', color: '#6B21A8' },
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

/** Step 5 — Delivered. Content delivered automatically; tracks recipient
 * portal access via polling in the parent page. */
export default function Step5View({
  deliveredAt,
  recipients,
  fetchActivityLog,
}: {
  deliveredAt: string
  recipients: DeliveryStatusRecipient[]
  fetchActivityLog: () => Promise<ReleasePlanActivityEvent[]>
}) {
  const awaitingCount = recipients.filter((r) => r.portal_status !== 'accessed').length
  const [logOpen, setLogOpen] = useState(false)
  const [logLoading, setLogLoading] = useState(false)
  const [log, setLog] = useState<ReleasePlanActivityEvent[] | null>(null)

  const handleToggleLog = async () => {
    if (logOpen) {
      setLogOpen(false)
      return
    }
    setLogOpen(true)
    if (log) return
    setLogLoading(true)
    try {
      setLog(await fetchActivityLog())
    } finally {
      setLogLoading(false)
    }
  }

  return (
    <>
      {/* Delivered banner */}
      <div
        className="flex items-start gap-3"
        style={{
          borderRadius: 14,
          border: '1.25px solid #10B981',
          background: '#D1FAE5',
          padding: '24px',
        }}
      >
        <span
          className="flex items-center justify-center flex-shrink-0"
          style={{
            width: 24,
            height: 24,
            borderRadius: 9999,
            background: '#10B981',
            marginTop: 1,
          }}
        >
          <Check className="w-4 h-4 text-white" strokeWidth={2.5} />
        </span>
        <div className="flex flex-col" style={{ gap: 2 }}>
          <span
            style={{
              fontFamily: 'Inter, sans-serif',
              fontWeight: 600,
              fontSize: 15,
              lineHeight: '22.5px',
              letterSpacing: '-0.23px',
              color: '#065F46',
            }}
          >
            Content delivered at {deliveredAt}
          </span>
          <span
            style={{
              fontFamily: 'Inter, sans-serif',
              fontWeight: 400,
              fontSize: 14,
              lineHeight: '21px',
              letterSpacing: '-0.15px',
              color: '#065F46',
            }}
          >
            Delivery was fully automatic — no action was required from you.
          </span>
        </div>
      </div>

      {/* Recipient portal-access tracking card */}
      <div
        className="flex flex-col gap-4"
        style={{
          borderRadius: 14,
          border: '1.25px solid #E5E7EB',
          background: '#FFFFFF',
          padding: '24px',
        }}
      >
        <div className="flex flex-col gap-2">
          <h2
            style={{
              fontFamily: 'Inter, sans-serif',
              fontWeight: 600,
              fontSize: 13,
              lineHeight: '19.5px',
              letterSpacing: '0.57px',
              textTransform: 'uppercase',
              color: '#6B7280',
            }}
          >
            Step 4 — Tracking Recipient Portal Access
          </h2>
          <p
            style={{
              fontFamily: 'Inter, sans-serif',
              fontWeight: 400,
              fontSize: 14,
              lineHeight: '21px',
              letterSpacing: '-0.15px',
              color: '#6B7280',
            }}
          >
            Each recipient received a unique portal link via email and text.
            Track their access below.
          </p>
        </div>

        {/* Recipient rows */}
        <div className="flex flex-col gap-3">
          {recipients.map((r) => {
            const avatar = avatarStyle(r.id)
            const bounced = r.email_status === 'bounced' || r.portal_status === 'bounced'
            return (
              <div
                key={r.id}
                className="flex items-center gap-3"
                style={{
                  borderRadius: 10,
                  border: '1.25px solid #E5E7EB',
                  padding: '12px',
                }}
              >
                <span
                  className="flex items-center justify-center flex-shrink-0"
                  style={{
                    width: 40,
                    height: 40,
                    borderRadius: 9999,
                    background: avatar.bg,
                    fontFamily: 'Inter, sans-serif',
                    fontWeight: 600,
                    fontSize: 13,
                    lineHeight: '19.5px',
                    letterSpacing: '-0.08px',
                    color: avatar.color,
                  }}
                >
                  {initialsOf(r.name)}
                </span>
                <div className="flex-1 min-w-0 flex flex-col">
                  <span
                    className="truncate"
                    style={{
                      fontFamily: 'Inter, sans-serif',
                      fontWeight: 500,
                      fontSize: 14,
                      lineHeight: '21px',
                      letterSpacing: '-0.15px',
                      color: '#111827',
                    }}
                  >
                    {r.name}
                  </span>
                  <span
                    className="truncate"
                    style={{
                      fontFamily: 'Inter, sans-serif',
                      fontWeight: 400,
                      fontSize: 12,
                      lineHeight: '18px',
                      color: '#6B7280',
                    }}
                  >
                    {r.portal_status === 'accessed'
                      ? `Accessed ${formatReleaseDate(r.portal_first_accessed_at ?? null)}`
                      : bounced
                        ? 'Delivery email bounced'
                        : 'Waiting for portal access...'}
                  </span>
                </div>
                <AccessBadge status={r.portal_status} bounced={bounced} />
              </div>
            )
          })}
        </div>

        <p
          style={{
            fontFamily: 'Inter, sans-serif',
            fontWeight: 400,
            fontSize: 12,
            lineHeight: '18px',
            color: '#9CA3AF',
          }}
        >
          You will receive a notification when each recipient opens their portal
          for the first time.
        </p>
      </div>

      {/* Activity log (fetched on demand) */}
      {logOpen && (
        <div
          className="flex flex-col gap-3"
          style={{ borderRadius: 14, border: '1.25px solid #E5E7EB', background: '#FFFFFF', padding: '24px' }}
        >
          {logLoading ? (
            <span className="flex items-center gap-2" style={{ fontFamily: 'Inter, sans-serif', fontSize: 13, color: '#6B7280' }}>
              <Loader2 className="w-4 h-4 animate-spin" /> Loading activity…
            </span>
          ) : !log || log.length === 0 ? (
            <span style={{ fontFamily: 'Inter, sans-serif', fontSize: 13, color: '#9CA3AF' }}>
              No activity recorded yet.
            </span>
          ) : (
            log.map((event, i) => (
              <div key={`${event.event_type}-${i}`} className="flex items-start justify-between gap-3">
                <div className="flex flex-col">
                  <span style={{ fontFamily: 'Inter, sans-serif', fontWeight: 500, fontSize: 14, color: '#111827' }}>
                    {event.event_label}
                  </span>
                  <span style={{ fontFamily: 'Inter, sans-serif', fontSize: 12, color: '#6B7280' }}>
                    {event.actor_name}
                  </span>
                </div>
                <span
                  className="flex-shrink-0 whitespace-nowrap"
                  style={{ fontFamily: 'Inter, sans-serif', fontSize: 12, color: '#9CA3AF' }}
                >
                  {formatDateTimeDot(event.created_at)}
                </span>
              </div>
            ))
          )}
        </div>
      )}

      {/* Footer actions */}
      <div className="flex items-center justify-between gap-3 flex-wrap">
        <button
          type="button"
          onClick={handleToggleLog}
          className="cursor-pointer hover:opacity-80 whitespace-nowrap"
          style={{
            fontFamily: 'Inter, sans-serif',
            fontWeight: 500,
            fontSize: 14,
            lineHeight: '21px',
            letterSpacing: '-0.15px',
            color: '#4F46E5',
          }}
        >
          {logOpen ? 'Hide activity log' : 'View activity log'}
        </button>
        <span
          style={{
            fontFamily: 'Inter, sans-serif',
            fontWeight: 400,
            fontSize: 13,
            lineHeight: '19.5px',
            letterSpacing: '-0.08px',
            color: '#6B7280',
          }}
        >
          {awaitingCount > 0 ? 'Awaiting recipient portal access' : 'All recipients have accessed their portal'}
        </span>
      </div>
    </>
  )
}

function AccessBadge({ status, bounced }: { status: string; bounced: boolean }) {
  const accessed = status === 'accessed'
  return (
    <span
      className="flex items-center justify-center flex-shrink-0"
      style={{
        height: 26,
        padding: '0 12px',
        borderRadius: 9999,
        background: bounced ? '#FFE2E3' : accessed ? '#D1FAE5' : '#EEF2FF',
        fontFamily: 'Inter, sans-serif',
        fontWeight: 500,
        fontSize: 12,
        lineHeight: '18px',
        color: bounced ? '#FF0000' : accessed ? '#065F46' : '#4F46E5',
      }}
    >
      {bounced ? 'Bounced' : accessed ? 'Portal Accessed' : 'Delivered'}
    </span>
  )
}
