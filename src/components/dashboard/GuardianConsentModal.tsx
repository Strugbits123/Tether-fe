'use client'

import { useEffect, useState } from 'react'
import { Shield, X } from 'lucide-react'

interface GuardianConsentModalProps {
  open: boolean
  onClose: () => void
  onConfirm: () => void
  loading?: boolean
}

/** Consent gate shown before designating a recipient as a Guardian. Confirm
 *  stays disabled until the user checks the acknowledgement box. */
export default function GuardianConsentModal({
  open,
  onClose,
  onConfirm,
  loading = false,
}: GuardianConsentModalProps) {
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
            maxWidth: 460,
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
            <div className="flex items-center gap-2.5">
              <Shield className="w-5 h-5 text-[#7C3AED]" strokeWidth={2} />
              <h2
                style={{
                  fontFamily: 'Inter, sans-serif',
                  fontWeight: 600,
                  fontSize: 18,
                  lineHeight: '26px',
                  color: '#101828',
                }}
              >
                Select as Guardian
              </h2>
            </div>
            <p
              style={{
                fontFamily: 'Inter, sans-serif',
                fontWeight: 400,
                fontSize: 14,
                lineHeight: '21px',
                color: '#4A5565',
              }}
            >
              A Guardian is a back up Release Manager if your primary Release Manager is unable
              to act, becomes unresponsive, or steps down from the role. Your Guardian will only
              be contacted if needed — they have no access to your account until that happens.
            </p>
            <p
              style={{
                fontFamily: 'Inter, sans-serif',
                fontWeight: 400,
                fontSize: 14,
                lineHeight: '21px',
                color: '#4A5565',
              }}
            >
              You can add up to two Guardians. They will be notified of their role by email.
            </p>

            <label
              className="flex items-start gap-2.5 cursor-pointer"
              style={{
                borderRadius: 10,
                background: '#F5F3FF',
                border: '1px solid #E9D5FF',
                padding: 14,
              }}
            >
              <input
                type="checkbox"
                checked={acknowledged}
                onChange={(e) => setAcknowledged(e.target.checked)}
                className="mt-0.5 flex-shrink-0"
                style={{ width: 16, height: 16, accentColor: '#7C3AED' }}
              />
              <span
                style={{
                  fontFamily: 'Inter, sans-serif',
                  fontWeight: 400,
                  fontSize: 13.5,
                  lineHeight: '19px',
                  color: '#4C1D95',
                }}
              >
                I understand that Guardians act as backup Release Managers and will only be
                contacted if my primary Release Manager is unavailable.
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
              disabled={loading}
              className="cursor-pointer hover:bg-gray-50 disabled:opacity-60"
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
              disabled={!acknowledged || loading}
              className="cursor-pointer hover:opacity-90 disabled:opacity-40 disabled:cursor-not-allowed"
              style={{
                height: 36,
                padding: '0 16px',
                borderRadius: 8,
                background: '#7C3AED',
                fontFamily: 'Inter, sans-serif',
                fontWeight: 500,
                fontSize: 14,
                color: '#FFFFFF',
              }}
            >
              {loading ? 'Confirming…' : 'Confirm Guardian'}
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
