'use client'

// Recipient portal — Messages. The collection of personal messages an owner
// left for this recipient, filterable by media type. Static placeholder
// content for now; wires to real data once the recipient-facing endpoints
// exist.

import { useMemo, useState } from 'react'
import { Download, Play, Volume2 } from 'lucide-react'

const OWNER_NAME = 'Sarah'
const RECIPIENT_NAME = 'Maya'

type MessageType = 'video' | 'audio' | 'written'

type Message = {
  id: string
  type: MessageType
  title: string
  meta: string
  excerpt: string
  thumbnail?: string
}

const MESSAGES: Message[] = [
  {
    id: '1',
    type: 'video',
    title: `For you, ${RECIPIENT_NAME} — on becoming who you are`,
    meta: 'Video · 3:42',
    excerpt:
      "Maya, sweetheart. I wanted to record this for you because I know how much you've grown...",
    thumbnail: '/images/Dashboard/reciepients/video1.png',
  },
  {
    id: '2',
    type: 'video',
    title: 'On your wedding day',
    meta: 'Video · 5:18',
    excerpt:
      "Today you're getting married, and I wish I could be there with you. But I want you to know...",
    thumbnail: '/images/Dashboard/reciepients/video2.png',
  },
  {
    id: '3',
    type: 'audio',
    title: 'Life advice — becoming who you are',
    meta: 'Audio · 8:15',
    excerpt:
      "There are a few things I've learned over the years that I want to share with you...",
  },
  {
    id: '4',
    type: 'video',
    title: 'Family history you should know',
    meta: 'Video · 12:03',
    excerpt:
      'I want to tell you about where we come from, about the people who came before us...',
    thumbnail: '/images/Dashboard/reciepients/video3.png',
  },
  {
    id: '5',
    type: 'audio',
    title: 'Remember me this way',
    meta: 'Audio · 4:27',
    excerpt:
      'When you think of me, I hope you remember the good times, the laughter, the love...',
  },
  {
    id: '6',
    type: 'video',
    title: 'On having children of your own',
    meta: 'Video · 6:34',
    excerpt:
      'If you decide to have children, they will be so lucky to have you as their mother...',
    thumbnail: '/images/Dashboard/reciepients/video4.png',
  },
]

type Category = 'all' | 'video' | 'audio' | 'written'

const CATEGORIES: { key: Category; label: string }[] = [
  { key: 'all', label: 'All' },
  { key: 'video', label: 'Video' },
  { key: 'audio', label: 'Audio' },
  { key: 'written', label: 'Written' },
]

// A simple equaliser-style waveform used as the artwork for audio messages.
function AudioWaveform() {
  const bars = [18, 34, 52, 70, 44, 88, 60, 100, 72, 40, 84, 56, 30, 66, 22]
  return (
    <div className="flex items-center justify-center" style={{ gap: 4, height: 64 }}>
      {bars.map((h, i) => (
        <span
          key={i}
          style={{
            width: 4,
            height: `${h}%`,
            borderRadius: 9999,
            background: '#10B981',
          }}
        />
      ))}
    </div>
  )
}

export default function RecipientMessagesPage() {
  const [active, setActive] = useState<Category>('all')

  const visible = useMemo(
    () =>
      active === 'all'
        ? MESSAGES
        : MESSAGES.filter((m) => m.type === active),
    [active]
  )

  return (
    <div className="w-full max-w-[900px] mx-auto flex flex-col" style={{ padding: 32, gap: 32 }}>
      {/* Header + filters */}
      <div className="flex flex-col" style={{ gap: 15 }}>
        <div className="flex flex-col" style={{ gap: 8 }}>
          <h1
            style={{
              fontFamily: '"Instrument Serif", serif',
              fontWeight: 400,
              fontSize: 36,
              lineHeight: '54px',
              color: '#111827',
            }}
          >
            Messages from {OWNER_NAME}
          </h1>
          <p
            style={{
              fontFamily: 'Inter, sans-serif',
              fontWeight: 400,
              fontSize: 15,
              lineHeight: '22.5px',
              letterSpacing: '-0.23px',
              color: '#6B7280',
            }}
          >
            {MESSAGES.length} messages left for you
          </p>
        </div>

        <div className="flex items-center flex-wrap" style={{ gap: 12 }}>
          <span
            style={{
              fontFamily: 'Inter, sans-serif',
              fontWeight: 500,
              fontSize: 14,
              lineHeight: '20px',
              letterSpacing: '-0.15px',
              color: '#364153',
            }}
          >
            Filter by category:
          </span>

          <div className="flex items-center" style={{ gap: 10 }}>
            {CATEGORIES.map((cat) => {
              const selected = active === cat.key
              return (
                <button
                  key={cat.key}
                  type="button"
                  onClick={() => setActive(cat.key)}
                  className="flex items-center justify-center cursor-pointer transition-colors"
                  style={{
                    height: 36,
                    padding: '8px 16px',
                    borderRadius: 10,
                    background: selected ? '#101828' : '#F3F3F3',
                    border: selected ? '1px solid #101828' : '1px solid #E9E9E9',
                    fontFamily: 'Inter, sans-serif',
                    fontWeight: 500,
                    fontSize: 14,
                    lineHeight: '20px',
                    letterSpacing: '-0.15px',
                    color: selected ? '#FFFFFF' : '#101828',
                  }}
                >
                  {cat.label}
                </button>
              )
            })}
          </div>
        </div>
      </div>

      {/* Cards */}
      <div className="flex flex-col" style={{ gap: 24 }}>
        {visible.map((msg) => {
          const isAudio = msg.type === 'audio'
          return (
            <div
              key={msg.id}
              style={{
                borderRadius: 14,
                border: '1.25px solid #E5E7EB',
                background: '#FFFFFF',
                padding: 24,
              }}
            >
              <div className="flex flex-col sm:flex-row" style={{ gap: 24 }}>
                {/* Artwork */}
                {isAudio ? (
                  <div
                    className="flex items-center justify-center flex-shrink-0"
                    style={{
                      width: 200,
                      height: 112,
                      borderRadius: 10,
                      background: '#D1FAE5',
                    }}
                  >
                    <AudioWaveform />
                  </div>
                ) : (
                  <div
                    className="relative flex items-center justify-center flex-shrink-0 overflow-hidden"
                    style={{
                      width: 200,
                      height: 112,
                      borderRadius: 10,
                      background: '#E5E7EB',
                    }}
                  >
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={msg.thumbnail}
                      alt=""
                      className="absolute inset-0 w-full h-full object-cover"
                    />
                    <div
                      className="relative flex items-center justify-center"
                      style={{
                        width: 48,
                        height: 48,
                        borderRadius: 9999,
                        background: 'rgba(255,255,255,0.9)',
                      }}
                    >
                      <Play
                        style={{ width: 20, height: 20, color: '#4F46E5' }}
                        fill="#4F46E5"
                        strokeWidth={0}
                      />
                    </div>
                  </div>
                )}

                {/* Content */}
                <div className="flex-1 min-w-0 flex flex-col" style={{ gap: 6 }}>
                  <h2
                    style={{
                      fontFamily: '"Instrument Serif", serif',
                      fontWeight: 400,
                      fontSize: 20,
                      lineHeight: '30px',
                      color: '#111827',
                    }}
                  >
                    {msg.title}
                  </h2>
                  <p
                    style={{
                      fontFamily: 'Inter, sans-serif',
                      fontWeight: 400,
                      fontSize: 13,
                      lineHeight: '19.5px',
                      letterSpacing: '-0.08px',
                      color: '#6B7280',
                    }}
                  >
                    {msg.meta}
                  </p>
                  <p
                    style={{
                      fontFamily: '"Instrument Serif", serif',
                      fontWeight: 400,
                      fontStyle: 'italic',
                      fontSize: 14,
                      lineHeight: '22.75px',
                      color: '#6B7280',
                    }}
                  >
                    {msg.excerpt}
                  </p>

                  {/* Play row */}
                  <div className="flex items-center justify-between" style={{ marginTop: 8 }}>
                    <button
                      type="button"
                      className="flex items-center justify-center cursor-pointer transition-opacity hover:opacity-90"
                      style={{
                        gap: 8,
                        height: 37,
                        padding: '0 16px',
                        borderRadius: 10,
                        background: isAudio ? '#10B981' : '#4F46E5',
                      }}
                    >
                      {isAudio ? (
                        <Volume2
                          style={{ width: 16, height: 16, color: '#FFFFFF' }}
                          strokeWidth={2}
                        />
                      ) : (
                        <Play
                          style={{ width: 16, height: 16, color: '#FFFFFF' }}
                          fill="#FFFFFF"
                          strokeWidth={0}
                        />
                      )}
                      <span
                        style={{
                          fontFamily: 'Inter, sans-serif',
                          fontWeight: 600,
                          fontSize: 14,
                          lineHeight: '21px',
                          letterSpacing: '-0.15px',
                          color: '#FFFFFF',
                        }}
                      >
                        Play
                      </span>
                    </button>

                    {isAudio && (
                      <button
                        type="button"
                        className="flex items-center cursor-pointer hover:opacity-80"
                        style={{ gap: 6 }}
                      >
                        <Download
                          style={{ width: 14, height: 14, color: '#9CA3AF' }}
                          strokeWidth={2}
                        />
                        <span
                          style={{
                            fontFamily: 'Inter, sans-serif',
                            fontWeight: 400,
                            fontSize: 13,
                            lineHeight: '19.5px',
                            letterSpacing: '-0.08px',
                            color: '#9CA3AF',
                          }}
                        >
                          Download audio
                        </span>
                      </button>
                    )}
                  </div>
                </div>
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}
