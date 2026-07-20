'use client'

import { useEffect, useState } from 'react'
import { X } from 'lucide-react'

interface ReleaseManagerConsentModalProps {
  open: boolean
  onClose: () => void
  onConfirm: () => void
}

/** "Before you continue" legal-notice gate shown before designating or
 *  changing a Release Manager. Confirm stays disabled until the user checks
 *  the acknowledgement box. */
export default function ReleaseManagerConsentModal({
  open,
  onClose,
  onConfirm,
}: ReleaseManagerConsentModalProps) {
  const [acknowledged, setAcknowledged] = useState(false)

  useEffect(() => {
    if (open) setAcknowledged(false)
  }, [open])

  useEffect(() => {
    if (!open) return
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose()
    }
    document.addEventListener('keydown', onKey)
    const prev = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    return () => {
      document.removeEventListener('keydown', onKey)
      document.body.style.overflow = prev
    }
  }, [open, onClose])

  if (!open) return null

  return (
    <div
      className="fixed inset-0 z-50 overflow-y-auto"
      style={{ background: 'rgba(0,0,0,0.4)' }}
      onMouseDown={(e) => {
        if (e.target === e.currentTarget) onClose()
      }}
    >
      <div
        className="flex min-h-full items-center justify-center px-2 sm:px-4 py-4 sm:py-10"
        onMouseDown={(e) => {
          if (e.target === e.currentTarget) onClose()
        }}
      >
        <div
          className="relative bg-white w-full"
          style={{
            maxWidth: 480,
            borderRadius: 16,
            boxShadow: '0px 8px 10px -6px rgba(0,0,0,0.1), 0px 20px 25px -5px rgba(0,0,0,0.1)',
            fontFamily: 'Inter, sans-serif',
          }}
        >
          <button
            type="button"
            onClick={onClose}
            aria-label="Close"
            className="absolute cursor-pointer top-5 right-5"
            style={{ width: 20, height: 20, opacity: 0.7 }}
          >
            <X className="w-5 h-5 text-[#0A0A0A]" strokeWidth={2} />
          </button>

          <div className="flex flex-col gap-4 px-6 pt-6 pb-6">
            <h2
              style={{
                fontFamily: 'Inter, sans-serif',
                fontWeight: 600,
                fontSize: 18,
                lineHeight: '26px',
                color: '#101828',
              }}
            >
              Before you continue — important notice
            </h2>
            <p
              style={{
                fontFamily: 'Inter, sans-serif',
                fontWeight: 400,
                fontSize: 14,
                lineHeight: '21px',
                color: '#4A5565',
              }}
            >
              Designating a Release Manager in Tether is not a substitute for a legal will. If
              you do not have a valid will, your estate will be governed by the intestacy laws
              of your state, which may not reflect your wishes. Your Tether Release Manager will
              be able to access and distribute your Tether content, but will have no legal
              authority over your financial accounts, property, or estate without a court
              appointment.
            </p>

            <label
              className="flex items-start gap-2.5 cursor-pointer"
              style={{
                borderRadius: 10,
                background: '#F9FAFB',
                border: '1px solid #E5E7EB',
                padding: 14,
              }}
            >
              <input
                type="checkbox"
                checked={acknowledged}
                onChange={(e) => setAcknowledged(e.target.checked)}
                className="mt-0.5 flex-shrink-0"
                style={{ width: 16, height: 16, accentColor: '#4F46E5' }}
              />
              <span
                style={{
                  fontFamily: 'Inter, sans-serif',
                  fontWeight: 400,
                  fontSize: 13.5,
                  lineHeight: '19px',
                  color: '#364153',
                }}
              >
                I understand that my Tether Release Manager designation does not replace a
                legal will and does not confer legal authority over my estate.
              </span>
            </label>
          </div>

          <div
            className="flex items-center justify-end gap-3 px-6 py-4"
            style={{
              background: '#F9FAFB',
              borderTop: '0.8px solid #E5E7EB',
              borderBottomLeftRadius: 16,
              borderBottomRightRadius: 16,
            }}
          >
            <button
              type="button"
              onClick={onClose}
              className="cursor-pointer hover:bg-gray-50"
              style={{
                height: 36,
                padding: '0 16px',
                borderRadius: 8,
                border: '1px solid rgba(0,0,0,0.1)',
                background: '#FFFFFF',
                fontFamily: 'Inter, sans-serif',
                fontWeight: 500,
                fontSize: 14,
                color: '#0A0A0A',
              }}
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={onConfirm}
              disabled={!acknowledged}
              className="cursor-pointer hover:opacity-90 disabled:opacity-40 disabled:cursor-not-allowed"
              style={{
                height: 36,
                padding: '0 16px',
                borderRadius: 8,
                background: '#4F46E5',
                fontFamily: 'Inter, sans-serif',
                fontWeight: 500,
                fontSize: 14,
                color: '#FFFFFF',
              }}
            >
              Continue
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
