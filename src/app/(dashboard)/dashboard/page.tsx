'use client'

import { Suspense, useEffect } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { useAuth } from '@/lib/context/AuthContext'
import WelcomeBanner from '@/components/dashboard/WelcomeBanner'
import SetupSteps from '@/components/dashboard/SetupSteps'
import RecentActivity from '@/components/dashboard/RecentActivity'
import QuickActions from '@/components/dashboard/QuickActions'
import { track } from '@/lib/posthog/analytics'

// Days since this browser last opened the dashboard (localStorage-based, since
// the backend doesn't expose a prior-visit timestamp to the client).
const LAST_VISIT_KEY = 'tether_last_dashboard_visit'
function daysSinceLastVisit(): number | null {
  if (typeof window === 'undefined') return null
  const prev = window.localStorage.getItem(LAST_VISIT_KEY)
  window.localStorage.setItem(LAST_VISIT_KEY, String(Date.now()))
  if (!prev) return null
  const ms = Date.now() - Number(prev)
  return Number.isNaN(ms) ? null : Math.max(0, Math.floor(ms / 86_400_000))
}

function DashboardContent() {
  const { user, loading, profile, profileLoading, refreshProfile } = useAuth()
  const router = useRouter()
  const searchParams = useSearchParams()
  const justOnboarded = searchParams.get('onboarded') === 'true'

  // Re-fetch the profile once on entry so the setup checklist reflects the
  // latest completion state rather than a potentially stale cache.
  useEffect(() => {
    refreshProfile()
    // account_health_score is not modelled yet (deferred) — sent as null.
    track('dashboard_viewed', {
      account_health_score: null,
      days_since_last_visit: daysSinceLastVisit(),
    })
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
