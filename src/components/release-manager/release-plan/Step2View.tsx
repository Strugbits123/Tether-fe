'use client'

import { Check, Loader2 } from 'lucide-react'
import type { ReleasePlanParty } from '@/lib/api/rm'

const AVATAR_PALETTE: { bg: string; color: string }[] = [
  { bg: '#FEE2E2', color: '#991B1B' },
  { bg: '#DBEAFE', color: '#1E40AF' },
  { bg: '#D1FAE5', color: '#065F46' },
  { bg: '#FEF3C7', color: '#92400E' },
]

function avatarStyle(name: string): { bg: string; color: string } {
  let hash = 0
  for (let i = 0; i < name.length; i++) hash = (hash * 31 + name.charCodeAt(i)) | 0
  return AVATAR_PALETTE[Math.abs(hash) % AVATAR_PALETTE.length]
}

function initialsOf(name: string): string {
  const parts = name.trim().split(/\s+/)
  return ((parts[0]?.[0] ?? '') + (parts.length > 1 ? parts[parts.length - 1][0] : '')).toUpperCase()
}

function channelLabel(channel: string): string {
  const parts = channel.split('+').map((c) => c.trim().toLowerCase())
  return parts.map((c) => (c === 'sms' ? 'text message' : c === 'email' ? 'email' : c)).join(' + ')
}

function roleSuffix(role: string): string | null {
  return role === 'account_owner' ? '(account owner)' : null
}

function statusLabel(status: string): string {
  if (status === 'sent' || status === 'delivered') return 'Sent'
  if (status === 'failed' || status === 'bounced') return 'Failed'
  return 'Sending...'
}

/** Step 2 — Notifying all parties (active release). Parent polls
 *  notification-status and advances to Step 3 once `allSent` is true. */
export default function Step2View({
  planId,
  deliveryScheduledAt,
  parties,
  allSent,
  onCancel,
  cancelling,
}: {
  planId: string
  deliveryScheduledAt: string
  parties: ReleasePlanParty[]
  allSent: boolean
  onCancel: () => void
  cancelling: boolean
}) {
  return (
    <>
      {/* Success banner */}
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
          style={{ width: 24, height: 24, borderRadius: 9999, background: '#10B981' }}
        >
          <Check className="w-4 h-4 text-white" strokeWidth={2.5} />
        </span>
        <div className="flex flex-col" style={{ gap: 4 }}>
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
            Release Plan initiated — {planId}
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
            All parties notified. Delivery scheduled for {deliveryScheduledAt}.
          </span>
        </div>
      </div>

      {/* Notifying card */}
      <div
        className="flex flex-col gap-4"
        style={{
          borderRadius: 14,
          border: '1.25px solid #E5E7EB',
          background: '#FFFFFF',
          padding: '24px',
        }}
      >
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
          Step 2 — Notifying all parties
        </h2>

        {/* Sending status */}
        <div
          className="flex items-center gap-3"
          style={{ borderRadius: 10, background: '#EEF2FF', padding: '16px' }}
        >
          {!allSent && (
            <Loader2
              className="w-5 h-5 flex-shrink-0 animate-spin"
              style={{ color: '#4F46E5' }}
              strokeWidth={2}
            />
          )}
          <span
            style={{
              fontFamily: 'Inter, sans-serif',
              fontWeight: 400,
              fontSize: 14,
              lineHeight: '21px',
              letterSpacing: '-0.15px',
              color: '#4F46E5',
            }}
          >
            {allSent
              ? 'All parties have been notified.'
              : 'Sending notifications to all parties now — this takes less than 60 seconds.'}
          </span>
        </div>

        {/* Party rows */}
        <div className="flex flex-col">
          {parties.map((p, i) => {
            const avatar = avatarStyle(p.name)
            const suffix = roleSuffix(p.role)
            return (
              <div
                key={p.name}
                className="flex items-center gap-3"
                style={{
                  padding: '12px',
                  borderBottom: i < parties.length - 1 ? '1px solid #E5E7EB' : 'none',
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
                  {initialsOf(p.name)}
                </span>
                <div className="flex-1 min-w-0 flex flex-col">
                  <span className="truncate">
                    <span
                      style={{
                        fontFamily: 'Inter, sans-serif',
                        fontWeight: 500,
                        fontSize: 14,
                        lineHeight: '21px',
                        letterSpacing: '-0.15px',
                        color: '#111827',
                      }}
                    >
                      {p.name}
                    </span>
                    {suffix && (
                      <span
                        style={{
                          fontFamily: 'Inter, sans-serif',
                          fontWeight: 500,
                          fontSize: 14,
                          lineHeight: '21px',
                          letterSpacing: '-0.15px',
                          color: '#9CA3AF',
                        }}
                      >
                        {' '}
                        {suffix}
                      </span>
                    )}
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
                    {channelLabel(p.channel)}
                  </span>
                </div>
                <span
                  className="flex items-center justify-center flex-shrink-0"
                  style={{
                    height: 28.5,
                    padding: '0 12px',
                    borderRadius: 9999,
                    border: '1.25px solid #E5E7EB',
                    background: '#FFFFFF',
                    fontFamily: 'Inter, sans-serif',
                    fontWeight: 400,
                    fontSize: 12,
                    lineHeight: '18px',
                    color: '#9CA3AF',
                  }}
                >
                  {statusLabel(p.status)}
                </span>
              </div>
            )
          })}
        </div>
      </div>

      {/* Footer actions */}
      <div className="flex items-center justify-between gap-3 flex-wrap">
        <button
          type="button"
          onClick={onCancel}
          disabled={cancelling}
          className="flex items-center justify-center cursor-pointer hover:bg-red-50 whitespace-nowrap disabled:opacity-50"
          style={{
            height: 39.5,
            padding: '0 16px',
            borderRadius: 10,
            border: '1.25px solid #EF4444',
            background: '#FFFFFF',
            fontFamily: 'Inter, sans-serif',
            fontWeight: 500,
            fontSize: 14,
            lineHeight: '21px',
            letterSpacing: '-0.15px',
            color: '#EF4444',
          }}
        >
          {cancelling ? 'Cancelling…' : 'Cancel release'}
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
          {allSent ? 'Advancing to the waiting period…' : 'Notifications sending — no action needed'}
        </span>
      </div>
    </>
  )
}
