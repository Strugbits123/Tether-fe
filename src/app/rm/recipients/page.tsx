'use client'

import { useState } from 'react'
import { ChevronDown, AlertTriangle } from 'lucide-react'

// Release Manager portal — Recipients. Static placeholder data for now; wires
// to real recipient/assignment endpoints once they exist.

type RecipientStatus = 'portal' | 'opened' | 'notified' | 'bounced'

interface Recipient {
  initials: string
  name: string
  relationship: string
  email: string
  avatarBg: string
  avatarColor: string
  status: RecipientStatus
  items: string[]
  bounceEmail?: string
}

const STATUS_STYLES: Record<
  RecipientStatus,
  { label: string; bg: string; color: string }
> = {
  portal: { label: 'Portal accessed', bg: '#D1FAE5', color: '#065F46' },
  opened: { label: 'Email opened', bg: '#D1FAE5', color: '#065F46' },
  notified: { label: 'Notified', bg: '#EEF2FF', color: '#4F46E5' },
  bounced: { label: 'Email bounced', bg: '#FFE2E3', color: '#FF0000' },
}

const RECIPIENTS: Recipient[] = [
  {
    initials: 'MH',
    name: 'Maya Holder',
    relationship: 'Family',
    email: 'maya.holder@email.com',
    avatarBg: '#DBEAFE',
    avatarColor: '#1E40AF',
    status: 'portal',
    items: ['2 memoir chapters', '1 message', '3 documents', '12 photos'],
  },
  {
    initials: 'DH',
    name: 'Daniel Holder',
    relationship: 'Other',
    email: 'daniel.holder@email.com',
    avatarBg: '#D1FAE5',
    avatarColor: '#065F46',
    status: 'opened',
    items: ['1 memoir chapter', '2 messages', '4 photos'],
  },
  {
    initials: 'JW',
    name: 'James Webb',
    relationship: 'Family',
    email: 'james.webb@email.com',
    avatarBg: '#FEF3C7',
    avatarColor: '#92400E',
    status: 'notified',
    items: ['1 message', '6 photos'],
  },
  {
    initials: 'DH',
    name: 'Daniel Holder',
    relationship: 'Other',
    email: 'daniel.webb@email.com',
    avatarBg: '#D1FAE5',
    avatarColor: '#065F46',
    status: 'bounced',
    items: ['1 message', '2 documents', '3 photos'],
    bounceEmail: 'daniel@oldmail.com',
  },
  {
    initials: 'JW',
    name: 'James Webb',
    relationship: 'Friend',
    email: 'james.webb@email.com',
    avatarBg: '#FEF3C7',
    avatarColor: '#92400E',
    status: 'notified',
    items: ['1 document', '2 photos'],
  },
]

export default function RecipientsPage() {
  // Bounced rows start expanded so the delivery warning is visible up front.
  const [expanded, setExpanded] = useState<Record<number, boolean>>(() =>
    RECIPIENTS.reduce<Record<number, boolean>>((acc, r, i) => {
      if (r.status === 'bounced') acc[i] = true
      return acc
    }, {}),
  )

  const toggle = (i: number) =>
    setExpanded((prev) => ({ ...prev, [i]: !prev[i] }))

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
          <button
            type="button"
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
            View content assignments →
          </button>
        </div>

        <div className="flex items-center" style={{ gap: 12 }}>
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
            {RECIPIENTS.length} designated
          </span>
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
        </div>
      </div>

      {/* Recipient list */}
      <div
        style={{
          borderRadius: 14,
          border: '1.25px solid #E5E7EB',
          background: '#FFFFFF',
          overflow: 'hidden',
        }}
      >
        {RECIPIENTS.map((r, i) => {
          const status = STATUS_STYLES[r.status]
          const isOpen = !!expanded[i]
          const isLast = i === RECIPIENTS.length - 1
          return (
            <div
              key={`${r.name}-${i}`}
              style={{
                borderBottom: isLast ? 'none' : '1.25px solid #E5E7EB',
              }}
            >
              {/* Main row */}
              <div
                className="flex items-center gap-4 flex-wrap"
                style={{ padding: '24px' }}
              >
                <span
                  className="flex items-center justify-center flex-shrink-0"
                  style={{
                    width: 48,
                    height: 48,
                    borderRadius: 9999,
                    background: r.avatarBg,
                    fontFamily: 'Inter, sans-serif',
                    fontWeight: 600,
                    fontSize: 15,
                    lineHeight: '22.5px',
                    letterSpacing: '-0.23px',
                    color: r.avatarColor,
                  }}
                >
                  {r.initials}
                </span>

                <div
                  className="flex-1 flex flex-col"
                  style={{ gap: 4, minWidth: 140 }}
                >
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
                      {r.relationship}
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

                <div
                  className="flex items-center flex-wrap"
                  style={{ gap: 12 }}
                >
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
                    {r.items.length} items designated
                  </span>
                  <button
                    type="button"
                    onClick={() => toggle(i)}
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
              {isOpen && r.status === 'bounced' && (
                <div style={{ padding: '0 24px 24px' }}>
                  <div
                    className="flex items-start"
                    style={{
                      gap: 8,
                      borderRadius: 8,
                      borderTop: '0.5px solid #F59E0C',
                      borderRight: '0.5px solid #F59E0C',
                      borderBottom: '0.5px solid #F59E0C',
                      borderLeft: '4px solid #F59E0C',
                      background: '#FFFBF6',
                      padding: '12px 16px',
                    }}
                  >
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
                        {r.bounceEmail} did not receive the delivery notification.
                      </span>
                    </div>
                  </div>
                </div>
              )}

              {isOpen && r.status !== 'bounced' && (
                <div style={{ background: '#F9FAFB', padding: '8px 24px 24px' }}>
                  <div className="flex flex-wrap" style={{ gap: 12 }}>
                    {r.items.map((item) => (
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
                </div>
              )}
            </div>
          )
        })}
      </div>
    </div>
  )
}
