'use client'

import { useEffect } from 'react'
import { Check } from 'lucide-react'
import {
  DELIVER_DURATION_MS,
  WAIT_DELIVERY_SCHEDULED,
  WAIT_WINDOW_OPENED,
} from './constants'

/** Step 4 — Deliver. Waiting period elapsed with no cancellation; delivery
 * triggered. Shows briefly, then auto-advances to Step 5 (delivered). */
export default function Step4View({ onComplete }: { onComplete: () => void }) {
  useEffect(() => {
    const t = setTimeout(onComplete, DELIVER_DURATION_MS)
    return () => clearTimeout(t)
  }, [onComplete])

  return (
    <>
      {/* Waiting-period-complete banner */}
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
            5-day waiting period complete — no cancellation received
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
            5 days elapsed
          </span>
        </div>
      </div>

      {/* Step 3 summary card */}
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
          Step 3 Complete — Waiting Period Elapsed
        </h2>

        {/* Stat columns */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <StatColumn label="Opened" value={WAIT_WINDOW_OPENED} />
          <StatColumn label="Closed" value={WAIT_DELIVERY_SCHEDULED} />
          <StatColumn
            label="Cancellations"
            value="None received"
            valueColor="#10B981"
          />
        </div>
      </div>
    </>
  )
}

function StatColumn({
  label,
  value,
  valueColor = '#111827',
}: {
  label: string
  value: string
  valueColor?: string
}) {
  return (
    <div className="flex flex-col gap-1">
      <span
        style={{
          fontFamily: 'Inter, sans-serif',
          fontWeight: 400,
          fontSize: 11,
          lineHeight: '16.5px',
          letterSpacing: '0.61px',
          textTransform: 'uppercase',
          color: '#6B7280',
        }}
      >
        {label}
      </span>
      <span
        style={{
          fontFamily: 'Inter, sans-serif',
          fontWeight: 600,
          fontSize: 15,
          lineHeight: '22.5px',
          letterSpacing: '-0.23px',
          color: valueColor,
        }}
      >
        {value}
      </span>
    </div>
  )
}
