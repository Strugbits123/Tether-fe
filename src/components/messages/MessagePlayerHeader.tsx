'use client'

import { X } from 'lucide-react'

interface MessagePlayerHeaderProps {
  type: 'audio' | 'video'
  recipientName?: string
  messageTitle?: string
  onClose: () => void
}

/**
 * Shared header for the audio + video players:
 *   "AUDIO MESSAGE FOR" (small caps, gray)
 *   <recipient name, bold>  <message title, italic indigo>
 * with a circular close button on the right.
 */
export default function MessagePlayerHeader({
  type,
  recipientName,
  messageTitle,
  onClose,
}: MessagePlayerHeaderProps) {
  return (
    <div className="flex items-start justify-between gap-4">
      <div className="min-w-0">
        <p
          style={{
            fontFamily: 'Inter, sans-serif',
            fontSize: 11,
            fontWeight: 600,
            textTransform: 'uppercase',
            letterSpacing: '1.5px',
            color: '#9CA3AF',
          }}
        >
          {type === 'audio' ? 'AUDIO' : 'VIDEO'} MESSAGE FOR
        </p>
        <h2
          className="mt-1"
          style={{
            fontFamily: 'Inter, sans-serif',
            fontSize: 22,
            fontWeight: 700,
            lineHeight: '28px',
            color: '#111827',
            wordBreak: 'break-word',
          }}
        >
          {recipientName || 'All Recipients'}
          {messageTitle && (
            <span
              style={{
                fontStyle: 'italic',
                fontWeight: 400,
                color: '#4F39F6',
                marginLeft: 8,
                fontFamily: 'Georgia, "Times New Roman", serif',
              }}
            >
              {messageTitle}
            </span>
          )}
        </h2>
      </div>
      <button
        type="button"
        onClick={onClose}
        aria-label="Close"
        className="flex items-center justify-center flex-shrink-0 cursor-pointer hover:bg-gray-200 transition-colors"
        style={{ width: 32, height: 32, borderRadius: '50%', background: '#F3F4F6' }}
      >
        <X className="w-4 h-4 text-gray-500" strokeWidth={2} />
      </button>
    </div>
  )
}
