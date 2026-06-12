'use client'

import { X } from 'lucide-react'
import { useState } from 'react'
import { useAuth } from '@/lib/context/AuthContext'

// Mirrors the dashboard setup checklist — the banner is only relevant while
// these steps are still incomplete.
const ONBOARDING_STEP_KEYS = [
  'finish_account',
  'add_recipients',
  'add_release_manager',
  'add_photos',
  'create_message',
] as const

export default function WelcomeBanner() {
  const [visible, setVisible] = useState(true)
  const { profile, user } = useAuth()
  const firstName = profile?.first_name?.trim() || user?.user_metadata?.first_name || user?.email?.split('@')[0] || 'there'

  // Wait for the profile so we don't flash the banner for already-onboarded users.
  if (!profile) return null

  const onboarding = profile.onboarding
  const onboardingIncomplete =
    !onboarding || ONBOARDING_STEP_KEYS.some((k) => !onboarding[k as keyof typeof onboarding])

  // Hide once dismissed or once every onboarding step is complete.
  if (!visible || !onboardingIncomplete) return null

  return (
    <div
      className="relative w-full rounded-[14px] p-6 sm:p-8"
      style={{
        background:
          'linear-gradient(90deg, #4F46E5 0%, #6366F1 50%, #2C25A7 100%)',
      }}
    >
      {/* Close icon */}
      <button
        type="button"
        onClick={() => setVisible(false)}
        className="absolute top-4 right-4 w-5 h-5 text-white/80 hover:text-white transition-colors"
        aria-label="Dismiss welcome banner"
      >
        <X className="w-5 h-5" strokeWidth={2} />
      </button>

      <div className="flex items-start sm:items-center gap-3 sm:gap-5">
        {/* Icon */}
        <div
          className="w-12 h-12 rounded-[10px] flex items-center justify-center flex-shrink-0"
          style={{ background: 'rgba(255,255,255,0.2)' }}
        >
          <img
            src="/images/Dashboard/Greet.svg"
            alt=""
            className="w-[25px] h-[25px]"
          />
        </div>

        {/* Text + badge */}
        <div className="flex-1 min-w-0 flex flex-col gap-2 sm:gap-3 pr-6">
          <div className="flex flex-wrap items-center gap-2 sm:gap-3">
            <h2
              className="text-white text-[22px] sm:text-[28px] md:text-[32px] leading-tight"
              style={{
                fontFamily: 'Instrument Serif, serif',
                fontWeight: 400,
              }}
            >
              Welcome to Tether, {firstName}!
            </h2>
            <span
              className="inline-flex items-center px-2 py-[2px] rounded-md bg-[#FF6900] text-white text-[11px] font-semibold uppercase tracking-wide"
              style={{ fontFamily: 'Inter, sans-serif' }}
            >
              New
            </span>
          </div>
          <p
            className="text-white/95 text-[13px] sm:text-[14px] leading-5 sm:leading-6"
            style={{ fontFamily: 'Inter, sans-serif' }}
          >
            Discover how Tether makes legacy planning easy, beautiful, and quicker
            than you might expect. Start by completing your onboarding below.
          </p>
        </div>
      </div>
    </div>
  )
}
