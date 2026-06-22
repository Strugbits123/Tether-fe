'use client'

import { Check } from 'lucide-react'
import { DELIVERED_AT, RECIPIENT_ACCESS } from './constants'

/** Step 5 — Delivered. Content delivered automatically; tracks recipient
 * portal access. This is the terminal state of the release flow. */
export default function Step5View() {
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
            Content delivered at {DELIVERED_AT}
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
          {RECIPIENT_ACCESS.map(({ party, status }) => (
            <div
              key={party.name}
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
                  background: party.bg,
                  fontFamily: 'Inter, sans-serif',
                  fontWeight: 600,
                  fontSize: 13,
                  lineHeight: '19.5px',
                  letterSpacing: '-0.08px',
                  color: party.color,
                }}
              >
                {party.initials}
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
                  {party.name}
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
                  Waiting for portal access...
                </span>
              </div>
              <AccessBadge status={status} />
            </div>
          ))}
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

      {/* Footer actions */}
      <div className="flex items-center justify-between gap-3 flex-wrap">
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
          View activity log
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
          Awaiting recipient portal access
        </span>
      </div>
    </>
  )
}

function AccessBadge({ status }: { status: 'accessed' | 'delivered' }) {
  const accessed = status === 'accessed'
  return (
    <span
      className="flex items-center justify-center flex-shrink-0"
      style={{
        height: 26,
        padding: '0 12px',
        borderRadius: 9999,
        background: accessed ? '#D1FAE5' : '#EEF2FF',
        fontFamily: 'Inter, sans-serif',
        fontWeight: 500,
        fontSize: 12,
        lineHeight: '18px',
        color: accessed ? '#065F46' : '#4F46E5',
      }}
    >
      {accessed ? 'Portal Accessed' : 'Delivered'}
    </span>
  )
}
