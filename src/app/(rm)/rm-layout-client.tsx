'use client'

import { useEffect, useRef, useState } from 'react'
import { useRouter } from 'next/navigation'
import { Menu } from 'lucide-react'
import ReleaseManagerSidebar from '@/components/release-manager/ReleaseManagerSidebar'
import { getAccessToken } from '@/lib/supabase/getAccessToken'
import { getActiveContext } from '@/lib/api/memberships'

export default function ReleaseManagerLayoutClient({
  hasOwnerAccount,
  children,
}: {
  hasOwnerAccount: boolean
  children: React.ReactNode
}) {
  const [mobileOpen, setMobileOpen] = useState(false)
  const router = useRouter()
  const checkedRef = useRef(false)

  // Context guard: this portal only makes sense for a release_manager
  // membership. If there's no active membership, or it turns out to be some
  // other role, bounce to account selection rather than showing someone
  // else's data.
  useEffect(() => {
    if (checkedRef.current) return
    checkedRef.current = true
    ;(async () => {
      const membershipId =
        typeof window !== 'undefined' ? window.localStorage.getItem('active_membership') : null
      if (!membershipId) {
        router.push('/select-account')
        return
      }
      const token = await getAccessToken()
      if (!token) {
        // A membership is flagged as active but there's no valid session to
        // confirm it with — don't strand the user on a gated page with data
        // fetches that will just fail silently.
        window.localStorage.removeItem('active_membership')
        router.push('/select-account')
        return
      }
      try {
        const ctx = await getActiveContext(token)
        if (ctx.portal !== 'release_manager') {
          router.push('/select-account')
        }
      } catch {
        window.localStorage.removeItem('active_membership')
        router.push('/select-account')
      }
    })()
  }, [router])

  return (
    <div className="min-h-screen flex bg-[#F9FAFB] font-sans">
      <ReleaseManagerSidebar
        mobileOpen={mobileOpen}
        onClose={() => setMobileOpen(false)}
        hasOwnerAccount={hasOwnerAccount}
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
