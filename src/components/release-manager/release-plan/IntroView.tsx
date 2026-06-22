'use client'

import { FIRST_NAME } from './constants'

/** Step 0 — the "Ready to begin?" landing before a release is initiated. */
export default function IntroView({
  onStart,
  onRequestGuardian,
}: {
  onStart: () => void
  onRequestGuardian: () => void
}) {
  return (
    <>
      {/* Trust banner */}
      <div
        style={{
          borderRadius: 14,
          border: '1.25px solid #C7D2FE',
          background: '#EEF2FF',
          padding: '24px 25px',
        }}
      >
        <p
          style={{
            fontFamily: 'Inter, sans-serif',
            fontWeight: 400,
            fontSize: 15,
            lineHeight: '24.38px',
            letterSpacing: '-0.23px',
            color: '#3730A3',
          }}
        >
          {FIRST_NAME} trusted you with this. When you are ready, start the
          release below.
        </p>
      </div>

      {/* Ready to begin card */}
      <div
        className="flex flex-col items-center text-center"
        style={{
          gap: 16,
          borderRadius: 14,
          border: '1.25px solid #E5E7EB',
          background: '#FFFFFF',
          padding: '36px 32px',
        }}
      >
        <h2
          style={{
            fontFamily: '"Instrument Serif", serif',
            fontWeight: 400,
            fontSize: 24,
            lineHeight: '36px',
            color: '#111827',
          }}
        >
          Ready to begin?
        </h2>
        <p
          className="max-w-[500px]"
          style={{
            fontFamily: 'Inter, sans-serif',
            fontWeight: 400,
            fontSize: 15,
            lineHeight: '24.38px',
            letterSpacing: '-0.23px',
            color: '#6B7280',
          }}
        >
          Content will be delivered in 5 days after initiation. All parties will
          be notified immediately. {FIRST_NAME}, if able, can cancel at any time
          during the waiting period if the release was initiated in error.
        </p>
        <div className="flex flex-wrap items-center justify-center gap-4 mt-2">
          <button
            type="button"
            onClick={onStart}
            className="flex items-center justify-center cursor-pointer hover:opacity-90 whitespace-nowrap"
            style={{
              height: 46,
              padding: '0 24px',
              borderRadius: 10,
              background: '#4F46E5',
              fontFamily: 'Inter, sans-serif',
              fontWeight: 600,
              fontSize: 15,
              lineHeight: '22.5px',
              letterSpacing: '-0.23px',
              color: '#FFFFFF',
            }}
          >
            Start Release Plan
          </button>
          <button
            type="button"
            onClick={onRequestGuardian}
            className="flex items-center justify-center cursor-pointer hover:opacity-90 whitespace-nowrap"
            style={{
              height: 46,
              padding: '0 24px',
              borderRadius: 10,
              background: '#4F46E5',
              fontFamily: 'Inter, sans-serif',
              fontWeight: 600,
              fontSize: 15,
              lineHeight: '22.5px',
              letterSpacing: '-0.23px',
              color: '#FFFFFF',
            }}
          >
            Request Guardian to Start Release
          </button>
        </div>
      </div>
    </>
  )
}
