'use client'

import { useRouter } from 'next/navigation'
import FinishProfileModal from '@/components/dashboard/FinishProfileModal'

// Release Manager portal — My Profile. Reuses the shared profile form
// (FinishProfileModal, embedded mode) as a full page instead of an overlay.
export default function RmProfilePage() {
  const router = useRouter()

  return (
    <div className="w-full max-w-[900px] mx-auto flex flex-col gap-6 p-6 sm:p-8">
      <div className="flex flex-col gap-1">
        <h1
          style={{
            fontFamily: '"Instrument Serif", serif',
            fontWeight: 400,
            fontSize: 32,
            lineHeight: '48px',
            color: '#111827',
          }}
        >
          My Profile
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
          Manage your personal details as a Release Manager on Tether.
        </p>
      </div>

      <FinishProfileModal
        open
        embedded
        onClose={() => router.push('/rm/overview')}
        onCompleted={() => router.push('/rm/overview')}
        title="My Profile"
        phoneHelpText="We will use this for important account info - never for marketing. See our Privacy Policy for additional details."
      />
    </div>
  )
}
