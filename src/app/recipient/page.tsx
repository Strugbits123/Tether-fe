'use client'

// Recipient portal — Overview. A warm landing page for the person an owner has
// left items for. Static placeholder content for now; wires to real data once
// the recipient-facing endpoints exist.

import { useState } from 'react'
import {
  BookOpen,
  FileText,
  Image as ImageIcon,
  MessageSquare,
  X,
} from 'lucide-react'

const RECIPIENT_NAME = 'Maya'
const OWNER_NAME = 'Sarah'

type Stat = {
  value: string
  label: string
  icon: typeof MessageSquare
  iconColor: string
  iconBg: string
}

const STATS: Stat[] = [
  {
    value: '6',
    label: 'Messages',
    icon: MessageSquare,
    iconColor: '#4F46E5',
    iconBg: '#EEF2FF',
  },
  {
    value: '9',
    label: 'Documents',
    icon: FileText,
    iconColor: '#10B981',
    iconBg: '#D1FAE5',
  },
  {
    value: '24',
    label: 'Photos',
    icon: ImageIcon,
    iconColor: '#F59E0B',
    iconBg: '#FEF3C7',
  },
  {
    value: '3',
    label: 'Story chapters',
    icon: BookOpen,
    iconColor: '#8B5CF6',
    iconBg: '#F3E8FF',
  },
]

export default function RecipientOverviewPage() {
  const [showWelcome, setShowWelcome] = useState(true)

  return (
    <div className="min-h-full flex flex-col">
      {/* Content */}
      <div
        className="w-full max-w-[900px] mx-auto flex-1 flex flex-col"
        style={{ padding: 32, gap: 32 }}
      >
        {/* Welcome hero */}
        {showWelcome && (
          <div
            className="relative w-full"
            style={{
              borderRadius: 16,
              padding: 32,
              background:
                'linear-gradient(135deg, #4F46E5 0%, #5149E6 9.09%, #524CE7 18.18%, #544FE8 27.27%, #5652E9 36.36%, #5855EB 45.45%, #5958EC 54.55%, #5B5BED 63.64%, #5D5EEE 72.73%, #5F61EF 81.82%, #6163F0 90.91%, #6366F1 100%)',
            }}
          >
            {/* Close */}
            <button
              type="button"
              onClick={() => setShowWelcome(false)}
              aria-label="Dismiss welcome message"
              className="absolute flex items-center justify-center cursor-pointer transition-colors hover:bg-white/30"
              style={{
                top: 16,
                right: 16,
                width: 32,
                height: 32,
                borderRadius: 9999,
                background: 'rgba(255,255,255,0.2)',
              }}
            >
              <X className="w-4 h-4" style={{ color: '#FFFFFF' }} strokeWidth={2} />
            </button>

            <h1
              style={{
                fontFamily: '"Instrument Serif", serif',
                fontWeight: 400,
                fontSize: 32,
                lineHeight: '48px',
                color: '#FFFFFF',
              }}
            >
              Welcome to Tether, {RECIPIENT_NAME}.
            </h1>

            <p
              className="mt-5 max-w-[772px]"
              style={{
                fontFamily: 'Inter, sans-serif',
                fontWeight: 400,
                fontSize: 16,
                lineHeight: '24px',
                letterSpacing: '-0.31px',
                color: 'rgba(255,255,255,0.9)',
              }}
            >
              {OWNER_NAME} left these items for you. Everything here was created
              for you personally. Take your time.
            </p>

            <button
              type="button"
              className="mt-6 flex items-center justify-center cursor-pointer transition-opacity hover:opacity-90"
              style={{
                height: 46.48,
                padding: '0 20px',
                borderRadius: 10,
                background: '#FFFFFF',
                fontFamily: 'Inter, sans-serif',
                fontWeight: 600,
                fontSize: 15,
                lineHeight: '22.5px',
                letterSpacing: '-0.23px',
                color: '#4F46E5',
              }}
            >
              Start with their messages →
            </button>
          </div>
        )}

        {/* Stat cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2" style={{ gap: 16 }}>
          {STATS.map((stat) => {
            const Icon = stat.icon
            return (
              <div
                key={stat.label}
                className="flex flex-col"
                style={{
                  borderRadius: 14,
                  border: '1.25px solid #E5E7EB',
                  background: '#FFFFFF',
                  padding: 25,
                  gap: 12,
                }}
              >
                <div
                  className="flex items-center justify-center"
                  style={{
                    width: 48,
                    height: 48,
                    borderRadius: 10,
                    background: stat.iconBg,
                  }}
                >
                  <Icon
                    style={{ width: 24, height: 24, color: stat.iconColor }}
                    strokeWidth={2}
                  />
                </div>

                <span
                  style={{
                    fontFamily: '"Instrument Serif", serif',
                    fontWeight: 400,
                    fontSize: 32,
                    lineHeight: '48px',
                    color: '#111827',
                  }}
                >
                  {stat.value}
                </span>

                <span
                  style={{
                    fontFamily: 'Inter, sans-serif',
                    fontWeight: 500,
                    fontSize: 14,
                    lineHeight: '21px',
                    letterSpacing: '-0.15px',
                    color: '#6B7280',
                    marginTop: -8,
                  }}
                >
                  {stat.label}
                </span>
              </div>
            )
          })}
        </div>

        {/* Reassurance line */}
        <p
          className="text-center"
          style={{
            fontFamily: 'Inter, sans-serif',
            fontWeight: 400,
            fontSize: 13,
            lineHeight: '19.5px',
            letterSpacing: '-0.08px',
            color: '#9CA3AF',
          }}
        >
          Everything here is yours to keep. Your access never expires.
        </p>
      </div>
    </div>
  )
}
