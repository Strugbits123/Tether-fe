'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import FinishProfileModal from '@/components/dashboard/FinishProfileModal'
import { createClient } from '@/lib/supabase/client'
import { getMe } from '@/lib/api/users'

async function getToken(): Promise<string | null> {
  const supabase = createClient()
  const {
    data: { session },
  } = await supabase.auth.getSession()
  return session?.access_token ?? null
}

// A profile is considered "saved" once the fields the form requires are
// filled in — mirrors FinishProfileModal's own required-field validation.
function isProfileComplete(user: {
  first_name: string | null
  last_name: string | null
  zip_code: string | null
  state: string | null
  age_group: string | null
  gender: string | null
  relationship_status: string | null
}): boolean {
  return Boolean(
    user.first_name?.trim() &&
      user.last_name?.trim() &&
      user.zip_code?.trim() &&
      user.state &&
      user.age_group &&
      user.gender &&
      user.relationship_status,
  )
}

// Release Manager portal — My Profile. Reuses the shared profile form
// (FinishProfileModal, embedded mode) as a full page instead of an overlay.
// Shows the saved profile read-only once it's complete, with an option to
// switch into the edit form.
export default function RmProfilePage() {
  const router = useRouter()
  const [mode, setMode] = useState<'loading' | 'view' | 'edit'>('loading')

  useEffect(() => {
    let active = true
    ;(async () => {
      const token = await getToken()
      if (!token) {
        if (active) setMode('edit')
        return
      }
      try {
        const user = await getMe(token)
        if (!active) return
        setMode(isProfileComplete(user) ? 'view' : 'edit')
      } catch {
        if (active) setMode('edit')
      }
    })()
    return () => {
      active = false
    }
  }, [])

  if (mode === 'loading') return null

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
        readOnly={mode === 'view'}
        onEdit={() => setMode('edit')}
        onClose={() => router.push('/rm/overview')}
        onSkip={mode === 'edit' ? () => setMode('view') : undefined}
        cancelLabel={mode === 'edit' ? 'Cancel' : undefined}
        onCompleted={() => setMode('view')}
        title="My Profile"
        phoneHelpText="We will use this for important account info - never for marketing. See our Privacy Policy for additional details."
        hideSmsOptIn
      />
    </div>
  )
}
