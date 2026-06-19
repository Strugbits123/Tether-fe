'use client'

import { Fragment } from 'react'

// Release Manager portal — Release Plan. Static placeholder content for now;
// wires to real release-orchestration endpoints once they exist.

const STEPS: { n: number; label: string }[] = [
  { n: 1, label: 'Initiate' },
  { n: 2, label: 'Notify' },
  { n: 3, label: 'Wait' },
  { n: 4, label: 'Deliver' },
  { n: 5, label: 'Complete' },
]

const ACTIVE_STEP = 1
const OWNER_NAME = 'Sarah Holder'

export default function ReleasePlanPage() {
  return (
    <div className="w-full max-w-[900px] mx-auto flex flex-col gap-8 p-6 sm:p-8">
      {/* Header + stepper */}
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
            Release Plan
          </h1>
          <span
            className="flex items-center justify-center flex-shrink-0"
            style={{
              height: 30,
              padding: '0 14px',
              borderRadius: 9999,
              border: '1.25px solid #E5E7EB',
              background: '#FFFFFF',
              fontFamily: 'Inter, sans-serif',
              fontWeight: 400,
              fontSize: 13,
              lineHeight: '19.5px',
              letterSpacing: '-0.08px',
              color: '#9CA3AF',
            }}
          >
            No active release
          </span>
        </div>

        <p
          style={{
            fontFamily: 'Inter, sans-serif',
            fontWeight: 400,
            fontSize: 15,
            lineHeight: '22.5px',
            letterSpacing: '-0.23px',
            color: '#6B7280',
          }}
        >
          Start and manage content delivery for {OWNER_NAME}
        </p>

        {/* Stepper */}
        <div className="overflow-x-auto">
          <div className="flex items-center w-full min-w-[600px]" style={{ gap: 8 }}>
            {STEPS.map((step, i) => {
              const isActive = step.n === ACTIVE_STEP
              return (
                <Fragment key={step.n}>
                  <div className="flex items-center flex-shrink-0" style={{ gap: 8 }}>
                    <span
                      className="flex items-center justify-center flex-shrink-0"
                      style={{
                        width: 32,
                        height: 32,
                        borderRadius: 9999,
                        background: isActive ? '#4F46E5' : '#E5E7EB',
                        fontFamily: 'Inter, sans-serif',
                        fontWeight: 600,
                        fontSize: 13,
                        lineHeight: '19.5px',
                        letterSpacing: '-0.08px',
                        color: isActive ? '#FFFFFF' : '#9CA3AF',
                      }}
                    >
                      {step.n}
                    </span>
                    <span
                      className="whitespace-nowrap"
                      style={{
                        fontFamily: 'Inter, sans-serif',
                        fontWeight: 400,
                        fontSize: 13,
                        lineHeight: '19.5px',
                        letterSpacing: '-0.08px',
                        color: isActive ? '#6B7280' : '#9CA3AF',
                      }}
                    >
                      {step.label}
                    </span>
                  </div>
                  {i < STEPS.length - 1 && (
                    <span
                      className="flex-1"
                      style={{ minWidth: 16, height: 2, background: '#E5E7EB' }}
                    />
                  )}
                </Fragment>
              )
            })}
          </div>
        </div>
      </div>

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
          {OWNER_NAME.split(' ')[0]} trusted you with this. When you are ready,
          start the release below.
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
          be notified immediately. {OWNER_NAME.split(' ')[0]}, if able, can
          cancel at any time during the waiting period if the release was
          initiated in error.
        </p>
        <div className="flex flex-wrap items-center justify-center gap-4 mt-2">
          <button
            type="button"
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
    </div>
  )
}
