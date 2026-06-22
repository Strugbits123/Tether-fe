'use client'

import Image from 'next/image'
import { useEffect, useState } from 'react'
import { Bell, Info, Mail, MessageSquare, Send, X } from 'lucide-react'

interface RequestGuardianModalProps {
  open: boolean
  onClose: () => void
}

/**
 * Two-step flow for asking a Guardian to complete the release:
 *  1. "form"  — explanation textarea + Send Request
 *  2. "sent"  — confirmation summary + Got it
 */
export default function RequestGuardianModal({
  open,
  onClose,
}: RequestGuardianModalProps) {
  const [step, setStep] = useState<'form' | 'sent'>('form')
  const [explanation, setExplanation] = useState('')

  // Reset to the form whenever the modal (re)opens.
  useEffect(() => {
    if (open) {
      setStep('form')
      setExplanation('')
    }
  }, [open])

  // Escape-to-close + scroll lock.
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

  const canSend = explanation.trim().length > 0

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
        {step === 'form' ? (
          <FormStep
            explanation={explanation}
            onChange={setExplanation}
            canSend={canSend}
            onClose={onClose}
            onSend={() => setStep('sent')}
          />
        ) : (
          <SentStep explanation={explanation.trim()} onClose={onClose} />
        )}
      </div>
    </div>
  )
}

/* ------------------------ Step 1: form ------------------------ */

function FormStep({
  explanation,
  onChange,
  canSend,
  onClose,
  onSend,
}: {
  explanation: string
  onChange: (v: string) => void
  canSend: boolean
  onClose: () => void
  onSend: () => void
}) {
  return (
    <div
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
        <div className="flex flex-col" style={{ gap: 4 }}>
          <h2
            style={{
              fontFamily: 'Inter, sans-serif',
              fontWeight: 600,
              fontSize: 20,
              lineHeight: '28px',
              color: '#101828',
            }}
          >
            Request Guardian to Complete
          </h2>
          <p
            style={{
              fontFamily: 'Inter, sans-serif',
              fontWeight: 400,
              fontSize: 14,
              lineHeight: '20px',
              color: '#4A5565',
            }}
          >
            Provide an explanation for why the Guardian needs to complete this
            release
          </p>
        </div>
        <button
          type="button"
          onClick={onClose}
          aria-label="Close"
          className="cursor-pointer flex-shrink-0 mt-0.5"
        >
          <X className="w-5 h-5 text-[#99A1AF]" strokeWidth={2} />
        </button>
      </div>

      {/* Body */}
      <div className="flex flex-col px-6 pt-6 pb-6" style={{ gap: 24 }}>
        {/* Notification info box */}
        <div
          className="flex items-start gap-3"
          style={{
            borderRadius: 10,
            border: '0.8px solid #DBEAFE',
            background: '#EFF6FF',
            padding: '16px',
          }}
        >
          <Info
            className="flex-shrink-0"
            style={{ width: 18, height: 18, color: '#1447E6', marginTop: 1 }}
            strokeWidth={2}
          />
          <div className="flex flex-col" style={{ gap: 4 }}>
            <span
              style={{
                fontFamily: 'Inter, sans-serif',
                fontWeight: 500,
                fontSize: 14,
                lineHeight: '20px',
                color: '#1C398E',
              }}
            >
              Guardian Notification Process
            </span>
            <span
              style={{
                fontFamily: 'Inter, sans-serif',
                fontWeight: 400,
                fontSize: 14,
                lineHeight: '20px',
                color: '#1447E6',
              }}
            >
              Guardian 1 will receive email and text notifications. If they
              don&apos;t accept within 3 days, Guardian 2 will be notified.
            </span>
          </div>
        </div>

        {/* Explanation field */}
        <div className="flex flex-col gap-2">
          <div className="flex items-center gap-0.5">
            <span
              style={{
                fontFamily: 'Inter, sans-serif',
                fontWeight: 500,
                fontSize: 14,
                lineHeight: '20px',
                color: '#364153',
              }}
            >
              Explanation
            </span>
            <span style={{ color: '#FB2C36', fontSize: 14, lineHeight: '20px' }}>
              *
            </span>
          </div>
          <textarea
            value={explanation}
            onChange={(e) => onChange(e.target.value)}
            placeholder="Please explain why you need the Guardian to complete this release..."
            className="w-full focus:outline-none resize-none"
            style={{
              height: 128,
              borderRadius: 10,
              border: '0.8px solid #D1D5DC',
              background: '#FFFFFF',
              padding: '12px 16px',
              fontFamily: 'Inter, sans-serif',
              fontWeight: 400,
              fontSize: 16,
              lineHeight: '24px',
              color: '#101828',
            }}
          />
          <span
            style={{
              fontFamily: 'Inter, sans-serif',
              fontWeight: 400,
              fontSize: 12,
              lineHeight: '16px',
              color: '#6A7282',
            }}
          >
            {explanation.length} characters
          </span>
        </div>

        {/* Actions */}
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={onClose}
            className="flex-1 flex items-center justify-center cursor-pointer hover:bg-gray-50"
            style={{
              height: 42,
              borderRadius: 10,
              border: '0.8px solid #D1D5DC',
              background: '#FFFFFF',
              fontFamily: 'Inter, sans-serif',
              fontWeight: 500,
              fontSize: 14,
              lineHeight: '20px',
              color: '#364153',
            }}
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={onSend}
            disabled={!canSend}
            className="flex-1 flex items-center justify-center gap-2 cursor-pointer hover:opacity-90 disabled:cursor-not-allowed"
            style={{
              height: 42,
              borderRadius: 10,
              background: '#4F39F6',
              opacity: canSend ? 1 : 0.5,
              fontFamily: 'Inter, sans-serif',
              fontWeight: 500,
              fontSize: 14,
              lineHeight: '20px',
              color: '#FFFFFF',
            }}
          >
            <Send className="w-4 h-4" strokeWidth={2} />
            Send Request
          </button>
        </div>
      </div>
    </div>
  )
}

/* ------------------------ Step 2: sent ------------------------ */

const NOTIFICATIONS: { icon: typeof Mail; label: string }[] = [
  { icon: Mail, label: 'Email notification sent' },
  { icon: MessageSquare, label: 'Text message sent (if applicable)' },
  { icon: Bell, label: 'Dashboard notification created' },
]

function SentStep({
  explanation,
  onClose,
}: {
  explanation: string
  onClose: () => void
}) {
  return (
    <div
      className="relative bg-white w-full flex flex-col items-center"
      style={{
        maxWidth: 448,
        borderRadius: 16,
        boxShadow: '0px 25px 50px -12px rgba(0,0,0,0.25)',
        fontFamily: 'Inter, sans-serif',
        padding: '32px',
        gap: 16,
      }}
    >
      {/* Success icon */}
      <div
        className="flex items-center justify-center"
        style={{ width: 64, height: 64, borderRadius: 9999, background: '#DCFCE7' }}
      >
        <Image src="/images/Dashboard/Tick.svg" alt="" width={32} height={32} />
      </div>

      <h2
        className="text-center"
        style={{
          fontFamily: 'Inter, sans-serif',
          fontWeight: 600,
          fontSize: 20,
          lineHeight: '28px',
          color: '#101828',
        }}
      >
        Guardian Request Sent
      </h2>
      <p
        className="text-center"
        style={{
          fontFamily: 'Inter, sans-serif',
          fontWeight: 400,
          fontSize: 14,
          lineHeight: '20px',
          color: '#4A5565',
        }}
      >
        Guardian 1 has been notified via email and text message. You&apos;ll
        receive an update once they respond.
      </p>

      {/* Your explanation */}
      <div
        className="w-full flex flex-col"
        style={{ gap: 8, borderRadius: 10, background: '#F9FAFB', padding: '16px' }}
      >
        <span
          style={{
            fontFamily: 'Inter, sans-serif',
            fontWeight: 500,
            fontSize: 12,
            lineHeight: '16px',
            letterSpacing: '0.04em',
            color: '#6A7282',
          }}
        >
          YOUR EXPLANATION
        </span>
        <span
          className="break-words"
          style={{
            fontFamily: 'Inter, sans-serif',
            fontWeight: 400,
            fontSize: 14,
            lineHeight: '22.75px',
            color: '#364153',
          }}
        >
          {explanation}
        </span>
      </div>

      {/* Notification steps */}
      <div className="w-full flex flex-col" style={{ gap: 12 }}>
        {NOTIFICATIONS.map(({ icon: Icon, label }) => (
          <div key={label} className="flex items-center" style={{ gap: 12 }}>
            <span
              className="flex items-center justify-center flex-shrink-0"
              style={{
                width: 32,
                height: 32,
                borderRadius: 9999,
                background: '#EEF2FF',
              }}
            >
              <Icon className="w-4 h-4" style={{ color: '#4F39F6' }} strokeWidth={2} />
            </span>
            <span
              style={{
                fontFamily: 'Inter, sans-serif',
                fontWeight: 400,
                fontSize: 14,
                lineHeight: '20px',
                color: '#364153',
              }}
            >
              {label}
            </span>
          </div>
        ))}
      </div>

      {/* Warning */}
      <div
        className="w-full"
        style={{
          borderRadius: 10,
          border: '0.8px solid #FEF3C6',
          background: '#FFFBEB',
          padding: '13px',
        }}
      >
        <p
          className="text-center"
          style={{
            fontFamily: 'Inter, sans-serif',
            fontWeight: 400,
            fontSize: 12,
            lineHeight: '16px',
            color: '#973C00',
          }}
        >
          If Guardian 1 doesn&apos;t accept within 3 days, Guardian 2 will be
          automatically notified.
        </p>
      </div>

      {/* Got it */}
      <button
        type="button"
        onClick={onClose}
        className="w-full flex items-center justify-center cursor-pointer hover:opacity-90"
        style={{
          height: 40,
          borderRadius: 10,
          background: '#4F39F6',
          fontFamily: 'Inter, sans-serif',
          fontWeight: 500,
          fontSize: 14,
          lineHeight: '20px',
          color: '#FFFFFF',
        }}
      >
        Got it
      </button>
    </div>
  )
}
