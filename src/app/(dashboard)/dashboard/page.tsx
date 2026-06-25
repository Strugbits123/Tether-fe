'use client'

import { Suspense, useEffect } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { useAuth } from '@/lib/context/AuthContext'
import WelcomeBanner from '@/components/dashboard/WelcomeBanner'
import SetupSteps from '@/components/dashboard/SetupSteps'
import RecentActivity from '@/components/dashboard/RecentActivity'
import QuickActions from '@/components/dashboard/QuickActions'

function DashboardContent() {
  const { user, loading, profile, profileLoading, refreshProfile } = useAuth()
  const router = useRouter()
  const searchParams = useSearchParams()
  const justOnboarded = searchParams.get('onboarded') === 'true'

  // Re-fetch the profile once on entry so the setup checklist reflects the
  // latest completion state rather than a potentially stale cache.
  useEffect(() => {
    refreshProfile()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  useEffect(() => {
    if (loading || profileLoading) return
    if (justOnboarded) return // skip check — just completed onboarding

    if (!user) {
      router.push('/signin')
      return
    }

    if (profile && !profile.onboarding?.completed_at) {
      router.push('/onboarding')
    }
  }, [user, loading, profile, profileLoading, justOnboarded]) // eslint-disable-line react-hooks/exhaustive-deps

  return (
    <>
      <WelcomeBanner />
      <SetupSteps />
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <RecentActivity />
        <QuickActions />
      </div>
    </>
  )
}

export default function DashboardPage() {
  return (
    <Suspense fallback={null}>
      <DashboardContent />
    </Suspense>
  )
}
