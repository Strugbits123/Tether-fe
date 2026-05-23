'use client'

import WelcomeBanner from '@/components/dashboard/WelcomeBanner'
import SetupSteps from '@/components/dashboard/SetupSteps'
import RecentActivity from '@/components/dashboard/RecentActivity'
import QuickActions from '@/components/dashboard/QuickActions'

export default function DashboardPage() {
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
