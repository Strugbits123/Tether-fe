'use client'

import { useState } from 'react'
import { Menu } from 'lucide-react'
import RecipientSidebar from '@/components/recipient/RecipientSidebar'

export default function RecipientLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const [mobileOpen, setMobileOpen] = useState(false)

  return (
    <div className="min-h-screen flex bg-white font-sans">
      <RecipientSidebar
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

        {/* Shared footer — present on every recipient page */}
        <footer
          className="w-full flex-shrink-0"
          style={{
            padding: '17.25px 0',
            borderTop: '1.25px solid #E5E7EB',
          }}
        >
          <div className="w-full max-w-[900px] mx-auto px-8 flex items-center justify-between">
            <span
              style={{
                fontFamily: 'Inter, sans-serif',
                fontWeight: 400,
                fontSize: 13,
                lineHeight: '19.5px',
                letterSpacing: '-0.08px',
                color: '#9CA3AF',
              }}
            >
              Your access never expires.
            </span>
            <button
              type="button"
              className="cursor-pointer hover:opacity-80"
              style={{
                fontFamily: 'Inter, sans-serif',
                fontWeight: 500,
                fontSize: 13,
                lineHeight: '19.5px',
                letterSpacing: '-0.08px',
                color: '#4F46E5',
              }}
            >
              Questions? Get support
            </button>
          </div>
        </footer>
      </div>
    </div>
  )
}
