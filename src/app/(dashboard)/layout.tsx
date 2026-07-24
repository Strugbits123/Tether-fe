'use client'

import { useEffect, useRef, useState } from 'react'
import { useRouter } from 'next/navigation'
import DashboardSidebar from '@/components/dashboard/DashboardSidebar'
import DashboardTopBar from '@/components/dashboard/DashboardTopBar'
import { getAccessToken } from '@/lib/supabase/getAccessToken'
import { getActiveContext } from '@/lib/api/memberships'

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const [mobileOpen, setMobileOpen] = useState(false)
  const router = useRouter()
  const checkedRef = useRef(false)

  // Context guard: this dashboard only makes sense for an owner membership.
  // A Release Manager with no owner account of their own (the common case)
  // must never be able to sit on this shell — even if they navigate here
  // directly, or if a stale active_membership from a previous session lingers.
  useEffect(() => {
    if (checkedRef.current) return
    checkedRef.current = true
    ;(async () => {
      const membershipId =
        typeof window !== 'undefined' ? window.localStorage.getItem('active_membership') : null
      if (!membershipId) {
        router.replace('/select-account')
        return
      }
      const token = await getAccessToken()
      if (!token) return
      try {
        const ctx = await getActiveContext(token)
        if (ctx.portal !== 'owner') {
          router.replace('/select-account')
        }
      } catch {
        window.localStorage.removeItem('active_membership')
        router.replace('/select-account')
      }
    })()
  }, [router])

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
