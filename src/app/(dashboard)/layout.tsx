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
    // Fixed viewport shell: the sidebar stays put and the main content area is
    // its own scroll container. This avoids relying on document/body scroll,
    // so a stray body `overflow:hidden` can never freeze the whole page.
    <div className="h-screen flex bg-[#F8FAFC] font-sans overflow-hidden">
      <DashboardSidebar
        mobileOpen={mobileOpen}
        onClose={() => setMobileOpen(false)}
      />

      <div className="flex-1 min-w-0 flex flex-col h-screen min-h-0">
        <DashboardTopBar onMenuClick={() => setMobileOpen(true)} />

        <main className="flex-1 min-h-0 overflow-y-auto px-4 sm:px-6 py-6">
          <div className="w-full max-w-[1280px] mx-auto flex flex-col gap-6">
            {children}
          </div>
        </main>
      </div>
    </div>
  )
}
