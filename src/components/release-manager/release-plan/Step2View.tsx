'use client'

import { useEffect } from 'react'
import { Check, Loader2 } from 'lucide-react'
import {
  DELIVERY_AT,
  NOTIFY_DURATION_MS,
  PARTIES,
  RELEASE_ID,
} from './constants'

/** Step 2 — Notifying all parties (active release). Auto-advances to Step 3. */
export default function Step2View({
  onCancel,
  onComplete,
}: {
  onCancel: () => void
  onComplete: () => void
}) {
  // Show the "notifying" state briefly, then move on to the waiting period.
  useEffect(() => {
    const t = setTimeout(onComplete, NOTIFY_DURATION_MS)
    return () => clearTimeout(t)
  }, [onComplete])

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
            Release Plan initiated — {RELEASE_ID}
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
            All parties notified. Delivery scheduled for {DELIVERY_AT}.
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
          <Loader2
            className="w-5 h-5 flex-shrink-0 animate-spin"
            style={{ color: '#4F46E5' }}
            strokeWidth={2}
          />
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
            Sending notifications to all parties now — this takes less than 60
            seconds.
          </span>
        </div>

        {/* Party rows */}
        <div className="flex flex-col">
          {PARTIES.map((p, i) => (
            <div
              key={p.name}
              className="flex items-center gap-3"
              style={{
                padding: '12px',
                borderBottom:
                  i < PARTIES.length - 1 ? '1px solid #E5E7EB' : 'none',
              }}
            >
              <span
                className="flex items-center justify-center flex-shrink-0"
                style={{
                  width: 40,
                  height: 40,
                  borderRadius: 9999,
                  background: p.bg,
                  fontFamily: 'Inter, sans-serif',
                  fontWeight: 600,
                  fontSize: 13,
                  lineHeight: '19.5px',
                  letterSpacing: '-0.08px',
                  color: p.color,
                }}
              >
                {p.initials}
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
                  {p.role && (
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
                      {p.role}
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
                  {p.note}
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
                Sending...
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* Footer actions */}
      <div className="flex items-center justify-between gap-3 flex-wrap">
        <button
          type="button"
          onClick={onCancel}
          className="flex items-center justify-center cursor-pointer hover:bg-red-50 whitespace-nowrap"
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
          Cancel release
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
          Notifications sending — no action needed
        </span>
      </div>
    </>
  )
}
