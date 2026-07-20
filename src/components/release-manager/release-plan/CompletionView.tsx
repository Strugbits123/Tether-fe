'use client'

import { Check, Download, Loader2 } from 'lucide-react'
import type { ReleasePlanActivityEvent } from '@/lib/api/rm'

/** Final completion screen — celebratory recap shown once the release is fully
 * delivered. Stands alone (no header/stepper); centered card layout. */
export default function CompletionView({
  firstName,
  stats,
  timeline,
  downloading,
  onDownload,
}: {
  firstName: string
  stats: { value: string; label: string }[]
  timeline: ReleasePlanActivityEvent[]
  downloading: boolean
  onDownload: () => void
}) {
  return (
    <div className="w-full max-w-[760px] mx-auto flex flex-col gap-6">
      {/* Hero recap card */}
      <div
        className="flex flex-col items-center text-center"
        style={{
          borderRadius: 16,
          background: '#F5EDE2',
          padding: '40px',
          gap: 21,
          boxShadow:
            '0px 1px 2px -1px #0000001A, 0px 1px 3px 0px #0000001A',
        }}
      >
        {/* Success badge */}
        <span
          className="flex items-center justify-center flex-shrink-0"
          style={{
            width: 79.5,
            height: 79.5,
            borderRadius: 9999,
            background: '#FFFFFF',
            boxShadow: '0px 4px 20px 0px #0000001A',
          }}
        >
          <Check style={{ width: 40, height: 40, color: '#009966' }} strokeWidth={2.5} />
        </span>

        <div className="flex flex-col items-center" style={{ gap: 12 }}>
          <h1
            style={{
              fontFamily: '"Instrument Serif", serif',
              fontWeight: 400,
              fontSize: 32,
              lineHeight: '36px',
              color: '#101828',
            }}
          >
            You carried out {firstName}&apos;s wishes.
          </h1>
          <p
            style={{
              fontFamily: 'Inter, sans-serif',
              fontWeight: 400,
              fontSize: 16,
              lineHeight: '24px',
              color: '#4A5565',
              maxWidth: 608,
            }}
          >
            Everything&apos;s been securely delivered with no trace left. Each
            recipient got what was meant just for them. Your thoughtful planning
            made this moment possible.
          </p>
        </div>

        {/* Stat columns */}
        <div className="w-full grid grid-cols-2 sm:grid-cols-4 gap-4">
          {stats.map((stat) => (
            <div
              key={stat.label}
              className="flex flex-col items-center"
              style={{ gap: 4 }}
            >
              <span
                style={{
                  fontFamily: 'Inter, sans-serif',
                  fontWeight: 400,
                  fontSize: 30,
                  lineHeight: '36px',
                  color: '#0A0A0A',
                }}
              >
                {stat.value}
              </span>
              <span
                style={{
                  fontFamily: 'Inter, sans-serif',
                  fontWeight: 400,
                  fontSize: 14,
                  lineHeight: '20px',
                  color: '#4A5565',
                }}
              >
                {stat.label}
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* Activity timeline */}
      <div className="flex flex-col gap-4">
        {timeline.length === 0 ? (
          <p style={{ fontFamily: 'Inter, sans-serif', fontSize: 14, color: '#9CA3AF', textAlign: 'center' }}>
            No activity recorded.
          </p>
        ) : (
          timeline.map((item, i) => (
            <div key={`${item.event_type}-${i}`} className="flex items-center gap-4">
              <span
                className="flex items-center justify-center flex-shrink-0"
                style={{
                  width: 32,
                  height: 32,
                  borderRadius: 9999,
                  background: '#00BC7D',
                }}
              >
                <Check className="w-5 h-5 text-white" strokeWidth={2.5} />
              </span>
              <div
                className="flex-1 min-w-0 flex flex-col"
                style={{
                  borderRadius: 10,
                  background: '#F5EDE2',
                  padding: '16px',
                  gap: 4,
                  boxShadow:
                    '0px 1px 2px -1px #0000001A, 0px 1px 3px 0px #0000001A',
                }}
              >
                <span
                  style={{
                    fontFamily: '"Instrument Serif", serif',
                    fontWeight: 400,
                    fontSize: 21,
                    lineHeight: '28px',
                    color: '#101828',
                  }}
                >
                  {item.event_label}
                </span>
                <span
                  style={{
                    fontFamily: 'Inter, sans-serif',
                    fontWeight: 400,
                    fontSize: 14,
                    lineHeight: '20px',
                    color: '#4A5565',
                  }}
                >
                  {item.actor_name} — {new Date(item.created_at).toLocaleString()}
                </span>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Download report */}
      <button
        type="button"
        onClick={onDownload}
        disabled={downloading}
        className="flex items-center justify-center gap-2 cursor-pointer hover:bg-gray-50 w-full disabled:opacity-60"
        style={{
          height: 50,
          borderRadius: 12,
          border: '1px solid #364153',
          background: '#FFFFFF',
        }}
      >
        {downloading ? (
          <Loader2 style={{ width: 20, height: 20, color: '#364153' }} className="animate-spin" strokeWidth={2} />
        ) : (
          <Download style={{ width: 20, height: 20, color: '#364153' }} strokeWidth={2} />
        )}
        <span
          style={{
            fontFamily: 'Inter, sans-serif',
            fontWeight: 500,
            fontSize: 16,
            lineHeight: '24px',
            color: '#364153',
          }}
        >
          {downloading ? 'Preparing report…' : 'Download full activity report (PDF)'}
        </span>
      </button>
    </div>
  )
}
