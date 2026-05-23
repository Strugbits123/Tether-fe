'use client'

import { useState } from 'react'
import DashboardSidebar from '@/components/dashboard/DashboardSidebar'
import DashboardTopBar from '@/components/dashboard/DashboardTopBar'

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const [mobileOpen, setMobileOpen] = useState(false)

  return (
    <div className="min-h-screen flex bg-[#F8FAFC] font-sans">
      <DashboardSidebar
        mobileOpen={mobileOpen}
        onClose={() => setMobileOpen(false)}
      />

      <div className="flex-1 min-w-0 flex flex-col">
        <DashboardTopBar onMenuClick={() => setMobileOpen(true)} />

        <main className="flex-1 px-4 sm:px-6 py-6">
          <div className="w-full max-w-[1280px] mx-auto flex flex-col gap-6">
            {children}
          </div>
        </main>
      </div>
    </div>
  )
}
