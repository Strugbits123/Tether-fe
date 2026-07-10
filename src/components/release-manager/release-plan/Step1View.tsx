'use client'

import { useEffect, useRef, useState } from 'react'
import { ChevronDown, ChevronUp, Info } from 'lucide-react'
import { FIRST_NAME, MIN_DESCRIPTION, REASONS } from './constants'

/** Step 1 — Initiate Release Plan form. */
export default function Step1View({
  onCancel,
  onSubmit,
}: {
  onCancel: () => void
  onSubmit: () => void
}) {
  const [reason, setReason] = useState('')
  const [description, setDescription] = useState('')
  const [confirmed, setConfirmed] = useState(false)

  const canSubmit =
    reason !== '' && description.trim().length >= MIN_DESCRIPTION && confirmed

  return (
    <>
      {/* Trust banner with accent border */}
      <div
        style={{
          borderRadius: 10,
          borderLeft: '3.75px solid #4F46E5',
          background: '#EEF2FF',
          padding: '24px 24px 24px 27.73px',
        }}
      >
        <p
          style={{
            fontFamily: 'Inter, sans-serif',
            fontWeight: 400,
            fontSize: 14,
            lineHeight: '22.75px',
            letterSpacing: '-0.15px',
            color: '#4F46E5',
          }}
        >
          {FIRST_NAME} trusted you with this role. When you are ready to release
          her content to her designated recipients, complete the form below. All
          parties will be notified after you submit and start the release.
        </p>
      </div>

      {/* Form card */}
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
            fontSize: 18,
            lineHeight: '27px',
            letterSpacing: '-0.44px',
            color: '#111827',
          }}
        >
          STEP 1 — INITIATE RELEASE PLAN
        </h2>

        {/* Reason for release */}
        <div className="flex flex-col gap-2">
          <Label text="Reason for release" requiredText="required" />
          <ReasonDropdown value={reason} onChange={setReason} />
        </div>

        {/* Describe the circumstances */}
        <div className="flex flex-col gap-2">
          <Label
            text="Describe the circumstances"
            requiredText={`required, minimum ${MIN_DESCRIPTION} characters`}
          />
          <p
            style={{
              fontFamily: 'Inter, sans-serif',
              fontStyle: 'italic',
              fontWeight: 400,
              fontSize: 12,
              lineHeight: '18px',
              color: '#6B7280',
            }}
          >
            This explanation is stored permanently and cannot be edited after
            submission.
          </p>
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="e.g. Sarah passed away on November 3, 2026. I am her Release Manager and am initiating the Release Plan on behalf of her estate and family."
            className="w-full focus:outline-none resize-none"
            style={{
              height: 110,
              borderRadius: 10,
              border: '1.25px solid #D1D5DB',
              background: '#FFFFFF',
              padding: '12px 16px',
              fontFamily: 'Inter, sans-serif',
              fontWeight: 400,
              fontSize: 14,
              lineHeight: '21px',
              letterSpacing: '-0.15px',
              color: '#111827',
            }}
          />
          <span
            style={{
              fontFamily: 'Inter, sans-serif',
              fontWeight: 400,
              fontSize: 12,
              lineHeight: '18px',
              color: '#9CA3AF',
            }}
          >
            {description.trim().length} / {MIN_DESCRIPTION} minimum characters
          </span>
        </div>

        {/* Confirmation checkbox */}
        <label className="flex items-start gap-3 cursor-pointer">
          <input
            type="checkbox"
            checked={confirmed}
            onChange={(e) => setConfirmed(e.target.checked)}
            className="flex-shrink-0 cursor-pointer"
            style={{
              width: 13.5,
              height: 13.5,
              marginTop: 4,
              accentColor: '#4F46E5',
              borderRadius: 3,
              border: '1px solid #374151',
            }}
          />
          <span
            style={{
              fontFamily: 'Inter, sans-serif',
              fontWeight: 500,
              fontSize: 14,
              lineHeight: '22.75px',
              letterSpacing: '-0.15px',
              color: '#374151',
            }}
          >
            I confirm that I am authorized to initiate this release and that the
            information I have provided is accurate to the best of my knowledge.
          </span>
        </label>

        {/* Info note */}
        <div
          className="flex items-start gap-2"
          style={{ borderRadius: 10, background: '#F9FAFB', padding: '11px 16px' }}
        >
          <Info
            className="flex-shrink-0"
            style={{ width: 12, height: 12, color: '#4F46E5', marginTop: 4 }}
            strokeWidth={2.5}
          />
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
            After submission, all parties are notified within 60 seconds. Content
            delivers automatically in 5 business days.
          </span>
        </div>

        {/* Actions */}
        <div className="flex items-center justify-between gap-3">
          <button
            type="button"
            onClick={onCancel}
            className="cursor-pointer hover:opacity-80"
            style={{
              fontFamily: 'Inter, sans-serif',
              fontWeight: 500,
              fontSize: 14,
              lineHeight: '21px',
              letterSpacing: '-0.15px',
              color: '#6B7280',
              padding: '0 8px',
            }}
          >
            Cancel
          </button>
          <button
            type="button"
            disabled={!canSubmit}
            onClick={onSubmit}
            className="flex items-center justify-center whitespace-nowrap disabled:cursor-not-allowed"
            style={{
              height: 46,
              padding: '0 24px',
              borderRadius: 10,
              background: canSubmit ? '#4F46E5' : '#E5E7EB',
              cursor: canSubmit ? 'pointer' : 'not-allowed',
              fontFamily: 'Inter, sans-serif',
              fontWeight: 600,
              fontSize: 15,
              lineHeight: '22.5px',
              letterSpacing: '-0.23px',
              color: canSubmit ? '#FFFFFF' : '#9CA3AF',
            }}
          >
            Submit and start release
          </button>
        </div>
      </div>
    </>
  )
}

/* ---------------------- Local sub-components ---------------------- */

function Label({ text, requiredText }: { text: string; requiredText: string }) {
  return (
    <div className="flex items-center gap-1 flex-wrap">
      <span
        style={{
          fontFamily: 'Inter, sans-serif',
          fontWeight: 500,
          fontSize: 14,
          lineHeight: '21px',
          letterSpacing: '-0.15px',
          color: '#374151',
        }}
      >
        {text}
      </span>
      <span
        style={{
          fontFamily: 'Inter, sans-serif',
          fontWeight: 500,
          fontSize: 14,
          lineHeight: '21px',
          letterSpacing: '-0.15px',
          color: '#EF4444',
        }}
      >
        — {requiredText}
      </span>
    </div>
  )
}

function ReasonDropdown({
  value,
  onChange,
}: {
  value: string
  onChange: (v: string) => void
}) {
  const [open, setOpen] = useState(false)
  const ref = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const onClickOutside = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false)
    }
    document.addEventListener('mousedown', onClickOutside)
    return () => document.removeEventListener('mousedown', onClickOutside)
  }, [])

  const options = ['', ...REASONS]

  return (
    <div ref={ref} className="relative">
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        className="w-full flex items-center justify-between focus:outline-none"
        style={{
          height: 42.7,
          borderRadius: 10,
          border: '1.25px solid #D1D5DB',
          background: '#FFFFFF',
          padding: '0 16px',
          fontFamily: 'Inter, sans-serif',
          fontWeight: 400,
          fontSize: 14,
          lineHeight: '20px',
          letterSpacing: '-0.15px',
          color: value ? '#364153' : '#9CA3AF',
        }}
      >
        <span className="truncate">{value || 'Select a reason'}</span>
        {open ? (
          <ChevronUp className="w-4 h-4 text-[#6B7280] flex-shrink-0" />
        ) : (
          <ChevronDown className="w-4 h-4 text-[#6B7280] flex-shrink-0" />
        )}
      </button>
      {open && (
        <div
          className="absolute z-10 w-full mt-1"
          style={{
            background: '#FFFFFF',
            borderRadius: 10,
            border: '1.25px solid #E5E7EB',
            padding: '10px 5px',
            boxShadow:
              '0px 4px 6px -4px rgba(0,0,0,0.1), 0px 10px 15px -3px rgba(0,0,0,0.1)',
          }}
        >
          <div className="max-h-60 overflow-y-auto flex flex-col">
            {options.map((o) => {
              const selected = o === value
              return (
                <button
                  key={o || 'placeholder'}
                  type="button"
                  onClick={() => {
                    onChange(o)
                    setOpen(false)
                  }}
                  className="w-full text-left hover:bg-[#EBF0FE]"
                  style={{
                    borderRadius: 4,
                    padding: '8px 10px',
                    background: selected ? '#EBF0FE' : 'transparent',
                    fontFamily: 'Inter, sans-serif',
                    fontWeight: 500,
                    fontSize: 14,
                    lineHeight: '20px',
                    letterSpacing: '-0.15px',
                    color: o ? '#364153' : '#9CA3AF',
                  }}
                >
                  {o || 'Select a reason'}
                </button>
              )
            })}
          </div>
        </div>
      )}
    </div>
  )
}
