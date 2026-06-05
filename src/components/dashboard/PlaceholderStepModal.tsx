'use client'

import { useEffect } from 'react'
import { X } from 'lucide-react'

interface PlaceholderStepModalProps {
  open: boolean
  title: string
  onClose: () => void
}

export default function PlaceholderStepModal({ open, title, onClose }: PlaceholderStepModalProps) {
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
      className="fixed inset-0 z-50 flex items-center justify-center"
      style={{ background: 'rgba(0,0,0,0.4)' }}
      onMouseDown={(e) => {
        if (e.target === e.currentTarget) onClose()
      }}
    >
      <div
        className="relative bg-white"
        style={{
          width: 520,
          maxWidth: 'calc(100vw - 24px)',
          borderRadius: 10,
          borderTop: '1px solid rgba(0,0,0,0.1)',
          boxShadow:
            '0px 4px 6px -4px rgba(0,0,0,0.1), 0px 10px 15px -3px rgba(0,0,0,0.1)',
          fontFamily: 'Inter, sans-serif',
          padding: '32px 28px',
        }}
      >
        <button
          type="button"
          onClick={onClose}
          aria-label="Close"
          className="absolute cursor-pointer"
          style={{ top: 20, right: 20, opacity: 0.7 }}
        >
          <X className="w-[22px] h-[22px] text-[#0A0A0A]" strokeWidth={2} />
        </button>

        <h2
          style={{
            fontFamily: 'Inter, sans-serif',
            fontWeight: 600,
            fontSize: 23,
            lineHeight: '28px',
            letterSpacing: '-0.45px',
            color: '#101828',
          }}
        >
          {title}
        </h2>
        <p
          className="mt-2"
          style={{
            fontFamily: 'Inter, sans-serif',
            fontWeight: 400,
            fontSize: 14,
            lineHeight: '20px',
            letterSpacing: '-0.15px',
            color: '#717182',
          }}
        >
          This step is coming soon. The flow for &ldquo;{title}&rdquo; will be implemented next.
        </p>

        <div className="flex items-center justify-end gap-3 mt-6">
          <button
            type="button"
            onClick={onClose}
            className="cursor-pointer hover:bg-gray-50"
            style={{
              height: 36,
              padding: '7.8px 15.8px',
              borderRadius: 8,
              border: '1px solid rgba(0,0,0,0.1)',
              background: '#FFFFFF',
              fontFamily: 'Inter, sans-serif',
              fontWeight: 500,
              fontSize: 13.2,
              lineHeight: '20px',
              color: '#0A0A0A',
            }}
          >
            Close
          </button>
        </div>
      </div>
    </div>
  )
}
