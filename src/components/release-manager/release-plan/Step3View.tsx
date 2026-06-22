'use client'

import { Clock } from 'lucide-react'
import {
  DELIVERY_AT,
  DELIVERY_DISPLAY,
  FIRST_NAME,
  WAIT_DELIVERY_SCHEDULED,
  WAIT_WINDOW_OPENED,
} from './constants'

/** Step 3 — 5-day waiting period before automatic delivery. */
export default function Step3View({
  onCancel,
  onContinue,
}: {
  onCancel: () => void
  onContinue: () => void
}) {
  return (
    <>
      {/* Delivery countdown banner */}
      <div
        className="flex items-start gap-3"
        style={{
          borderRadius: 14,
          border: '1.25px solid #F59E0B',
          background: '#FEF3C7',
          padding: '24px',
        }}
      >
        <Clock
          className="flex-shrink-0"
          style={{ width: 24, height: 24, color: '#F59E0B', marginTop: 2 }}
          strokeWidth={2}
        />
        <div className="flex flex-col" style={{ gap: 2 }}>
          <span
            style={{
              fontFamily: 'Inter, sans-serif',
              fontWeight: 600,
              fontSize: 15,
              lineHeight: '22.5px',
              letterSpacing: '-0.23px',
              color: '#92400E',
            }}
          >
            Delivery scheduled for
          </span>
          <span
            style={{
              fontFamily: '"Instrument Serif", serif',
              fontWeight: 400,
              fontSize: 24,
              lineHeight: '36px',
              color: '#92400E',
            }}
          >
            {DELIVERY_DISPLAY}
          </span>
          <span
            style={{
              fontFamily: 'Inter, sans-serif',
              fontWeight: 400,
              fontSize: 13,
              lineHeight: '19.5px',
              letterSpacing: '-0.08px',
              color: '#92400E',
            }}
          >
            5 days from initiation
          </span>
        </div>
      </div>

      {/* Waiting period detail card */}
      <div
        className="flex flex-col gap-6"
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
          Step 3 — 5-Day Waiting Period
        </h2>

        {/* Stat columns */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <StatColumn label="Window opened" value={WAIT_WINDOW_OPENED} />
          <StatColumn label="Delivery scheduled" value={WAIT_DELIVERY_SCHEDULED} />
          <StatColumn
            label="Cancellations received"
            value="None so far"
            valueColor="#10B981"
          />
        </div>

        {/* Explanation */}
        <div
          className="flex flex-col gap-2"
          style={{ borderRadius: 10, background: '#F9FAFB', padding: '16px' }}
        >
          <span
            style={{
              fontFamily: 'Inter, sans-serif',
              fontWeight: 600,
              fontSize: 13,
              lineHeight: '19.5px',
              letterSpacing: '-0.08px',
              color: '#374151',
            }}
          >
            What happens during this period
          </span>
          <p
            style={{
              fontFamily: 'Inter, sans-serif',
              fontWeight: 400,
              fontSize: 13,
              lineHeight: '21.13px',
              letterSpacing: '-0.08px',
              color: '#6B7280',
            }}
          >
            If sent in error, {FIRST_NAME} can cancel the release at any time by
            clicking the link in her notification email. You can also cancel
            below. If no cancellation is received by {DELIVERY_AT}, content will
            be delivered automatically — no action is needed from you.
          </p>
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
        <button
          type="button"
          onClick={onContinue}
          className="flex items-center justify-center cursor-pointer hover:opacity-90 whitespace-nowrap"
          style={{
            height: 37,
            padding: '0 16px',
            borderRadius: 10,
            background: '#4F46E5',
            fontFamily: 'Inter, sans-serif',
            fontWeight: 600,
            fontSize: 14,
            lineHeight: '21px',
            letterSpacing: '-0.15px',
            color: '#FFFFFF',
          }}
        >
          Continue to delivery →
        </button>
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
