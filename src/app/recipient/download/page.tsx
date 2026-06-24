'use client'

// Recipient portal — Download everything. Lets the recipient pick which content
// to bundle into a single ZIP. "Prepare my download" swaps the primary action
// for a ready-to-download state. Static placeholder content for now; wires to a
// real export endpoint once it exists.

import { useState } from 'react'
import { Download } from 'lucide-react'

const SANS = 'Inter, sans-serif'
const SERIF = '"Instrument Serif", serif'

type IncludeItem = {
  id: string
  label: string
  meta: string
}

const INCLUDE_ITEMS: IncludeItem[] = [
  { id: 'audio', label: 'Audio messages', meta: '3 files' },
  { id: 'documents', label: 'Documents', meta: '9 files' },
  { id: 'photos', label: 'Photos', meta: '24 files' },
  { id: 'transcripts', label: 'Transcripts as PDF', meta: '6 files' },
  { id: 'lifestory', label: 'Life story as PDF', meta: '3 chapters' },
]

const ABOUT_POINTS = [
  'Video messages cannot be downloaded but remain accessible in your portal forever',
  'Photos are included at full resolution',
  'Documents are included in their original format (PDF, Word, etc.)',
  'You can download this package as many times as you need',
]

export default function RecipientDownloadPage() {
  const [selected, setSelected] = useState<Set<string>>(
    new Set(INCLUDE_ITEMS.map((i) => i.id)),
  )
  const [prepared, setPrepared] = useState(false)

  const toggle = (id: string) => {
    setSelected((prev) => {
      const next = new Set(prev)
      if (next.has(id)) next.delete(id)
      else next.add(id)
      return next
    })
    setPrepared(false)
  }

  return (
    <div className="w-full flex justify-center px-4 sm:px-6 lg:px-8 py-8">
      <div className="w-full max-w-[700px] flex flex-col" style={{ gap: 24 }}>
        {/* Header */}
        <div className="flex flex-col" style={{ gap: 11.99 }}>
          <h1
            style={{
              fontFamily: SERIF,
              fontWeight: 400,
              fontSize: 36,
              lineHeight: '54px',
              color: '#111827',
              margin: 0,
            }}
          >
            Download your content
          </h1>
          <p
            style={{
              fontFamily: SANS,
              fontWeight: 400,
              fontSize: 15,
              lineHeight: '25.5px',
              letterSpacing: '-0.23px',
              color: '#6B7280',
              margin: 0,
            }}
          >
            Everything left for you — messages, documents, and photos — packaged as a
            ZIP file. Audio messages are included. Video messages are not downloadable
            but will always be available in your portal.
          </p>
        </div>

        {/* Select card */}
        <div
          className="flex flex-col"
          style={{
            borderRadius: 14,
            border: '1.25px solid #E5E7EB',
            background: '#FFFFFF',
            padding: 'clamp(20px, 4vw, 33px)',
            gap: 24,
          }}
        >
          <h2
            style={{
              fontFamily: SANS,
              fontWeight: 600,
              fontSize: 18,
              lineHeight: '27px',
              letterSpacing: '-0.44px',
              color: '#111827',
              margin: 0,
            }}
          >
            Select what to include
          </h2>

          {/* Items */}
          <div className="flex flex-col" style={{ gap: 16 }}>
            {INCLUDE_ITEMS.map((item) => {
              const checked = selected.has(item.id)
              return (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => toggle(item.id)}
                  className="flex items-start text-left cursor-pointer"
                  style={{ gap: 11.99 }}
                >
                  <span
                    className="flex items-center justify-center flex-shrink-0"
                    style={{
                      width: 20,
                      height: 20,
                      marginTop: 1,
                      borderRadius: 6,
                      background: checked ? '#4F46E5' : '#FFFFFF',
                      border: checked ? 'none' : '1.5px solid #D1D5DB',
                    }}
                  >
                    {checked && (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img
                        src="/images/Dashboard/Tick.svg"
                        alt=""
                        aria-hidden="true"
                        style={{ width: 13, height: 13 }}
                        className="brightness-0 invert select-none"
                      />
                    )}
                  </span>

                  <span className="flex flex-col min-w-0">
                    <span
                      style={{
                        fontFamily: SANS,
                        fontWeight: 500,
                        fontSize: 15,
                        lineHeight: '22.5px',
                        letterSpacing: '-0.23px',
                        color: '#111827',
                      }}
                    >
                      {item.label}
                    </span>
                    <span
                      style={{
                        fontFamily: SANS,
                        fontWeight: 500,
                        fontSize: 13,
                        lineHeight: '19.5px',
                        letterSpacing: '-0.08px',
                        color: '#9CA3AF',
                      }}
                    >
                      {item.meta}
                    </span>
                  </span>
                </button>
              )
            })}
          </div>

          {/* Action area */}
          {!prepared ? (
            <button
              type="button"
              onClick={() => setPrepared(true)}
              className="w-full flex items-center justify-center cursor-pointer transition-opacity hover:opacity-90"
              style={{
                height: 46.484,
                borderRadius: 10,
                background: '#4F46E5',
                fontFamily: SANS,
                fontWeight: 600,
                fontSize: 15,
                lineHeight: '22.5px',
                letterSpacing: '-0.23px',
                color: '#FFFFFF',
              }}
            >
              Prepare my download
            </button>
          ) : (
            <div className="flex flex-col items-center" style={{ gap: 11.99 }}>
              <button
                type="button"
                className="w-full flex items-center justify-center cursor-pointer transition-opacity hover:opacity-90"
                style={{
                  gap: 8,
                  height: 46.484,
                  borderRadius: 10,
                  background: '#10B981',
                }}
              >
                <Download style={{ width: 20, height: 20, color: '#FFFFFF' }} strokeWidth={2} />
                <span
                  style={{
                    fontFamily: SANS,
                    fontWeight: 600,
                    fontSize: 15,
                    lineHeight: '22.5px',
                    letterSpacing: '-0.23px',
                    color: '#FFFFFF',
                  }}
                >
                  Download ZIP
                </span>
              </button>
              <p
                style={{
                  fontFamily: SANS,
                  fontWeight: 400,
                  fontSize: 13,
                  lineHeight: '19.5px',
                  letterSpacing: '-0.08px',
                  textAlign: 'center',
                  color: '#6B7280',
                  margin: 0,
                }}
              >
                Ready to download • File size: ~245 MB
              </p>
            </div>
          )}

          {/* Footnote */}
          <p
            style={{
              fontFamily: SANS,
              fontWeight: 400,
              fontSize: 13,
              lineHeight: '19.5px',
              letterSpacing: '-0.08px',
              textAlign: 'center',
              color: '#9CA3AF',
              margin: 0,
            }}
          >
            This file is for you to keep. Your portal access is not affected by downloading.
          </p>
        </div>

        {/* About card */}
        <div
          className="flex flex-col"
          style={{
            borderRadius: 14,
            border: '1.25px solid #E5E7EB',
            background: '#F9FAFB',
            padding: 'clamp(18px, 3.5vw, 25.23px)',
            gap: 11.99,
          }}
        >
          <h3
            style={{
              fontFamily: SANS,
              fontWeight: 600,
              fontSize: 15,
              lineHeight: '22.5px',
              letterSpacing: '-0.23px',
              color: '#111827',
              margin: 0,
            }}
          >
            About your download
          </h3>

          <div className="flex flex-col" style={{ gap: 7.99 }}>
            {ABOUT_POINTS.map((point) => (
              <div key={point} className="flex items-start" style={{ gap: 7.99 }}>
                <span
                  className="flex-shrink-0"
                  style={{
                    fontFamily: SANS,
                    fontWeight: 400,
                    fontSize: 14,
                    lineHeight: '21px',
                    letterSpacing: '-0.15px',
                    color: '#10B981',
                  }}
                >
                  •
                </span>
                <span
                  style={{
                    fontFamily: SANS,
                    fontWeight: 400,
                    fontSize: 14,
                    lineHeight: '21px',
                    letterSpacing: '-0.15px',
                    color: '#4B5563',
                  }}
                >
                  {point}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
