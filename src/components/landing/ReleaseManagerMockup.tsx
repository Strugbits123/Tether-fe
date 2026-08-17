"use client"

import React, { useEffect, useState } from 'react'
import { FiCheck, FiLock } from 'react-icons/fi'

/* ─── Verification progress steps ─── */
const STEPS = [
  'Release Manager starts the release process',
  '12 recipients have been notified of the upcoming release',
  '5-day waiting period for final verification',
  'Content released to all recipients',
]

const FILL_INTERVAL = 1100 // ms between each checkbox filling in
const HOLD_DURATION = 3000 // ms all-filled hold before resetting
const FLASH_DURATION = 400 // ms border flash on reset
const CYCLE_GAP = 500 // ms pause before the next loop starts

export default function ReleaseManagerMockup() {
  const [filledCount, setFilledCount] = useState(0)
  const [flashing, setFlashing] = useState(false)

  useEffect(() => {
    const timeouts: ReturnType<typeof setTimeout>[] = []

    const runCycle = () => {
      setFilledCount(0)
      setFlashing(false)

      for (let i = 1; i <= STEPS.length; i++) {
        timeouts.push(setTimeout(() => setFilledCount(i), i * FILL_INTERVAL))
      }

      const allFilledAt = STEPS.length * FILL_INTERVAL

      timeouts.push(
        setTimeout(() => {
          setFlashing(true)
          setFilledCount(0)
        }, allFilledAt + HOLD_DURATION)
      )

      timeouts.push(
        setTimeout(
          () => setFlashing(false),
          allFilledAt + HOLD_DURATION + FLASH_DURATION
        )
      )

      timeouts.push(
        setTimeout(
          runCycle,
          allFilledAt + HOLD_DURATION + FLASH_DURATION + CYCLE_GAP
        )
      )
    }

    runCycle()

    return () => timeouts.forEach(clearTimeout)
  }, [])

  return (
    <div className="w-full max-w-[508px] mx-auto">
      <div className="bg-white border border-[#E5E7EB] rounded-[24px] shadow-xl overflow-hidden">
        {/* Header */}
        <div className="bg-[#F9FAFB] border-b border-[#E5E7EB] px-5 py-3.5 flex items-center justify-between gap-3">
          <div className="flex items-center gap-2 min-w-0">
            <FiLock className="text-[#F59E0B] flex-shrink-0" style={{ width: 16, height: 16 }} />
            <span className="text-[13px] font-medium text-[#374151] truncate">
              Release Manager Portal · Activation
            </span>
          </div>
          <div className="bg-[#FEF3C7] text-[#92400E] text-[11px] font-semibold px-2.5 py-1 rounded flex-shrink-0">
            Step 3 of 4
          </div>
        </div>

        {/* Body */}
        <div className="p-5 flex flex-col gap-4">
          <div className="bg-[#F9FAFB] border border-[#E5E7EB] rounded-2xl p-4">
            <div className="text-[13px] font-semibold text-[#111827] mb-3">
              Verification progress
            </div>
            <div className="flex flex-col gap-2.5">
              {STEPS.map((text, i) => {
                const done = i < filledCount
                return (
                  <div key={i} className="flex items-center gap-2.5">
                    <span
                      className="flex items-center justify-center flex-shrink-0 rounded-full"
                      style={{
                        width: 18,
                        height: 18,
                        backgroundColor: done ? '#D1FAE5' : 'transparent',
                        border: flashing
                          ? '1.5px solid #000000'
                          : done
                          ? 'none'
                          : '1.5px solid #D1D5DB',
                        transition:
                          'background-color 250ms ease, border-color 250ms ease',
                      }}
                    >
                      <FiCheck
                        style={{
                          width: 11,
                          height: 11,
                          color: '#059669',
                          strokeWidth: 3,
                          opacity: done ? 1 : 0,
                          transform: done ? 'scale(1)' : 'scale(0.5)',
                          transition: 'opacity 250ms ease, transform 250ms ease',
                        }}
                      />
                    </span>
                    <span className="text-[13px] leading-[19px] text-[#374151]">
                      {text}
                    </span>
                  </div>
                )
              })}
            </div>
          </div>

          {/* Review window banner */}
          <div className="bg-[#EEF2FF] border border-[#E0E7FF] rounded-xl px-4 py-3">
            <p className="text-[13px] leading-[19px] text-[#4338CA] m-0">
              <span className="font-semibold">Review window open.</span>{' '}
              Content will be released automatically on Oct 14, 2025. All
              recipients have been notified.
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
