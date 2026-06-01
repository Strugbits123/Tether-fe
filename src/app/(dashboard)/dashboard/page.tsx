'use client'

import { Suspense, useEffect } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { useAuth } from '@/lib/context/AuthContext'
import { createClient } from '@/lib/supabase/client'
import WelcomeBanner from '@/components/dashboard/WelcomeBanner'
import SetupSteps from '@/components/dashboard/SetupSteps'
import RecentActivity from '@/components/dashboard/RecentActivity'
import QuickActions from '@/components/dashboard/QuickActions'

function DashboardContent() {
  const { user, loading } = useAuth()
  const router = useRouter()
  const searchParams = useSearchParams()
  const justOnboarded = searchParams.get('onboarded') === 'true'
  const supabase = createClient()

  useEffect(() => {
    if (loading) return
    if (justOnboarded) return // skip check — just completed onboarding

    if (!user) {
      router.push('/signin')
      return
    }

    supabase
      .from('users')
      .select('onboarding')
      .eq('id', user.id)
      .single()
      .then(({ data }) => {
        if (!data?.onboarding?.completed_at) {
          router.push('/onboarding')
        }
      })
  }, [user, loading, justOnboarded]) // eslint-disable-line react-hooks/exhaustive-deps

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
