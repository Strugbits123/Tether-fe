'use client'

import { useState } from 'react'
import { Menu } from 'lucide-react'
import ReleaseManagerSidebar from '@/components/release-manager/ReleaseManagerSidebar'

export default function ReleaseManagerLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const [mobileOpen, setMobileOpen] = useState(false)

  return (
    <div className="min-h-screen flex bg-[#F9FAFB] font-sans">
      <ReleaseManagerSidebar
        mobileOpen={mobileOpen}
        onClose={() => setMobileOpen(false)}
      />

      <div className="flex-1 min-w-0 flex flex-col">
        {/* Mobile header */}
        <header
          className="lg:hidden h-14 bg-white flex items-center px-4 flex-shrink-0"
          style={{ borderBottom: '0.8px solid #E5E7EB' }}
        >
          <button
            onClick={() => setMobileOpen(true)}
            className="p-2 -ml-1 rounded-lg text-[#4A5565] hover:bg-gray-100 transition-colors"
            aria-label="Open menu"
          >
            <Menu className="w-5 h-5" />
          </button>
        </header>

        <main className="flex-1">{children}</main>
      </div>
    </div>
  )
}
