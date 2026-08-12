'use client'

import { useEffect, useRef, useState } from 'react'
import { AlertTriangle, Loader2, X } from 'lucide-react'

/** Mirrors MaxLength(1000) on CancelReleaseDto — the API rejects anything longer,
 *  so stop the user here rather than after a round trip. */
const REASON_MAX = 1000

interface CancelReleaseModalProps {
  open: boolean
  cancelling: boolean
  /** Called with a trimmed, non-empty reason. Closing is the caller's job, so
   *  the modal can stay open (and keep the typed reason) if the request fails. */
  onConfirm: (reason: string) => void
  onClose: () => void
}

const CONSEQUENCES = [
  'The five-business-day waiting period stops and no content is delivered.',
  'Recipients are never notified — they will not know a release was started.',
  'The account owner and any Guardians are told it was cancelled.',
  'This is recorded permanently in the release activity log.',
  'Restarting later means beginning a brand-new release plan from step one.',
]

/**
 * Confirmation for cancelling an in-flight release plan.
 *
 * Replaces a window.prompt(), which was wrong for this in three ways: it gave no
 * indication of what cancelling actually does, it couldn't enforce the API's
 * 1000-character limit, and browsers let users suppress further prompts — which
 * would have made the reason silently empty and every cancel attempt fail
 * validation.
 */
export default function CancelReleaseModal({
  open,
  cancelling,
  onConfirm,
  onClose,
}: CancelReleaseModalProps) {
  const [reason, setReason] = useState('')
  const textareaRef = useRef<HTMLTextAreaElement | null>(null)
  const dialogRef = useRef<HTMLDivElement | null>(null)

  // Clear the previous reason on reopen, during render so it never flashes.
  // See react.dev "Adjusting some state when a prop changes".
  const [wasOpen, setWasOpen] = useState(open)
  if (open !== wasOpen) {
    setWasOpen(open)
    if (open) setReason('')
  }

  // Escape-to-close, scroll lock, focus the reason field, and keep Tab inside the
  // dialog. Without the trap, tabbing walks out into the page behind the overlay
  // — for a destructive confirmation that means a keyboard user can end up
  // operating controls they can't see.
  useEffect(() => {
    if (!open) return

    // Remembered so focus can go back where it came from on dismissal, rather
    // than resetting to the top of the document.
    const opener = document.activeElement as HTMLElement | null

    const focusable = () =>
      Array.from(
        dialogRef.current?.querySelectorAll<HTMLElement>(
          'button, [href], textarea, input, select, [tabindex]:not([tabindex="-1"])',
        ) ?? [],
      ).filter((el) => !el.hasAttribute('disabled') && el.tabIndex !== -1)

    const onKey = (e: KeyboardEvent) => {
      // Never close mid-request: the release may already be cancelled server-side
      // and dismissing here would leave the UI showing a stale active plan.
      if (e.key === 'Escape' && !cancelling) {
        onClose()
        return
      }
      if (e.key !== 'Tab') return
      const items = focusable()
      if (items.length === 0) return
      const first = items[0]
      const last = items[items.length - 1]
      const active = document.activeElement
      // Wrap at both ends, and pull focus back in if it has already escaped.
      if (e.shiftKey && (active === first || !dialogRef.current?.contains(active))) {
        e.preventDefault()
        last.focus()
      } else if (!e.shiftKey && (active === last || !dialogRef.current?.contains(active))) {
        e.preventDefault()
        first.focus()
      }
    }

    document.addEventListener('keydown', onKey)
    const prev = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    textareaRef.current?.focus()
    return () => {
      document.removeEventListener('keydown', onKey)
      document.body.style.overflow = prev
      // Only restore if the opener is still in the document — the element may
      // have unmounted while the modal was open.
      if (opener && document.contains(opener)) opener.focus()
    }
  }, [open, onClose, cancelling])

  if (!open) return null

  const trimmed = reason.trim()
  const tooLong = reason.length > REASON_MAX
  const canConfirm = trimmed.length > 0 && !tooLong && !cancelling

  const dismiss = () => {
    if (!cancelling) onClose()
  }

  return (
    <div
      className="fixed inset-0 z-50 overflow-y-auto"
      style={{ background: 'rgba(0,0,0,0.4)' }}
      onMouseDown={(e) => {
        if (e.target === e.currentTarget) dismiss()
      }}
    >
      <div
        className="flex min-h-full items-center justify-center px-2 sm:px-4 py-4 sm:py-10"
        onMouseDown={(e) => {
          if (e.target === e.currentTarget) dismiss()
        }}
      >
        <div
          ref={dialogRef}
          role="dialog"
          aria-modal="true"
          aria-labelledby="cancel-release-title"
          className="relative bg-white w-full"
          style={{
            maxWidth: 512,
            borderRadius: 16,
            boxShadow: '0px 25px 50px -12px rgba(0,0,0,0.25)',
            fontFamily: 'Inter, sans-serif',
          }}
        >
          {/* Header */}
          <div
            className="flex items-start justify-between gap-4 px-6 pt-6 pb-5"
            style={{ borderBottom: '0.8px solid #F3F4F6' }}
          >
            <div className="flex items-start gap-3">
              <span
                className="flex items-center justify-center flex-shrink-0"
                style={{ width: 40, height: 40, borderRadius: 9999, background: '#FFE2E3' }}
              >
                <AlertTriangle className="w-5 h-5" style={{ color: '#C10007' }} strokeWidth={2} />
              </span>
              <div className="flex flex-col" style={{ gap: 4 }}>
                <h2
                  id="cancel-release-title"
                  style={{ fontWeight: 600, fontSize: 20, lineHeight: '28px', color: '#101828' }}
                >
                  Cancel this release plan?
                </h2>
                <p style={{ fontWeight: 400, fontSize: 14, lineHeight: '20px', color: '#4A5565' }}>
                  This stops the release before any content reaches recipients.
                </p>
              </div>
            </div>
            <button
              type="button"
              onClick={dismiss}
              aria-label="Close"
              disabled={cancelling}
              className="cursor-pointer flex-shrink-0 mt-0.5 disabled:cursor-not-allowed disabled:opacity-50"
            >
              <X className="w-5 h-5 text-[#99A1AF]" strokeWidth={2} />
            </button>
          </div>

          {/* Body */}
          <div className="flex flex-col px-6 pt-6 pb-6" style={{ gap: 24 }}>
            <div
              className="flex flex-col"
              style={{
                gap: 10,
                borderRadius: 10,
                border: '0.8px solid #FFC9C9',
                background: '#FEF2F2',
                padding: 16,
              }}
            >
              <span style={{ fontWeight: 500, fontSize: 14, lineHeight: '20px', color: '#9F0712' }}>
                What happens when you cancel
              </span>
              <ul className="flex flex-col" style={{ gap: 6, listStyle: 'none' }}>
                {CONSEQUENCES.map((line) => (
                  <li key={line} className="flex items-start" style={{ gap: 8 }}>
                    <span
                      className="flex-shrink-0"
                      style={{
                        width: 4,
                        height: 4,
                        borderRadius: 9999,
                        background: '#C10007',
                        marginTop: 8,
                      }}
                    />
                    <span
                      style={{ fontWeight: 400, fontSize: 13.5, lineHeight: '20px', color: '#C10007' }}
                    >
                      {line}
                    </span>
                  </li>
                ))}
              </ul>
            </div>

            {/* Reason — required by the API, and the thing the activity log records */}
            <div className="flex flex-col gap-2">
              <label htmlFor="cancel-release-reason" className="flex items-center gap-0.5">
                <span style={{ fontWeight: 500, fontSize: 14, lineHeight: '20px', color: '#364153' }}>
                  Why are you cancelling?
                </span>
                <span style={{ color: '#FB2C36', fontSize: 14, lineHeight: '20px' }}>*</span>
              </label>
              <textarea
                id="cancel-release-reason"
                ref={textareaRef}
                value={reason}
                onChange={(e) => setReason(e.target.value)}
                disabled={cancelling}
                aria-invalid={tooLong}
                placeholder="e.g. Initiated in error — the account owner is well."
                className="w-full focus:outline-none resize-none disabled:opacity-60"
                style={{
                  height: 104,
                  borderRadius: 10,
                  border: `0.8px solid ${tooLong ? '#FB2C36' : '#D1D5DC'}`,
                  background: '#FFFFFF',
                  padding: '12px 16px',
                  fontWeight: 400,
                  fontSize: 16,
                  lineHeight: '24px',
                  color: '#101828',
                }}
              />
              <div className="flex items-center justify-between gap-3">
                <span style={{ fontWeight: 400, fontSize: 12, lineHeight: '16px', color: '#6A7282' }}>
                  Recorded in the activity log and shared with everyone notified.
                </span>
                <span
                  style={{
                    fontWeight: 400,
                    fontSize: 12,
                    lineHeight: '16px',
                    color: tooLong ? '#C10007' : '#6A7282',
                  }}
                >
                  {reason.length} / {REASON_MAX}
                </span>
              </div>
            </div>

            {/* Actions. Destructive action is second so it isn't the reflex click. */}
            <div className="flex flex-col-reverse sm:flex-row items-stretch sm:items-center gap-3">
              <button
                type="button"
                onClick={dismiss}
                disabled={cancelling}
                className="flex-1 flex items-center justify-center cursor-pointer hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-60"
                style={{
                  height: 42,
                  borderRadius: 10,
                  border: '0.8px solid #D1D5DC',
                  background: '#FFFFFF',
                  fontWeight: 500,
                  fontSize: 14,
                  lineHeight: '20px',
                  color: '#364153',
                }}
              >
                Keep release plan
              </button>
              <button
                type="button"
                onClick={() => canConfirm && onConfirm(trimmed)}
                // aria-disabled rather than disabled so screen readers still
                // reach the button and can announce why it's unavailable.
                aria-disabled={!canConfirm}
                className="flex-1 flex items-center justify-center gap-2 cursor-pointer hover:opacity-90 aria-disabled:cursor-not-allowed"
                style={{
                  height: 42,
                  borderRadius: 10,
                  background: '#C10007',
                  opacity: canConfirm ? 1 : 0.5,
                  fontWeight: 500,
                  fontSize: 14,
                  lineHeight: '20px',
                  color: '#FFFFFF',
                }}
              >
                {cancelling && <Loader2 className="w-4 h-4 animate-spin" strokeWidth={2} />}
                {cancelling ? 'Cancelling…' : 'Cancel release plan'}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
