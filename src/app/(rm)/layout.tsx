import { createClient } from '@/lib/supabase/server'
import { hasOwnerMembership } from '@/lib/api/memberships'
import ReleaseManagerLayoutClient from './rm-layout-client'

// Server component: resolves whether this user already has an owner account
// before the first paint, so the sidebar's "Create my Tether" item never
// flickers in/out on load.
export default async function ReleaseManagerLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const supabase = await createClient()
  const {
    data: { session },
  } = await supabase.auth.getSession()

  let hasOwnerAccount = false
  if (session?.access_token) {
    try {
      hasOwnerAccount = await hasOwnerMembership(session.access_token)
    } catch {
      // Default to false — worst case the promo shows for a user who
      // happens to already have an owner account, which is harmless.
    }
  }

  return (
    <ReleaseManagerLayoutClient hasOwnerAccount={hasOwnerAccount}>
      {children}
    </ReleaseManagerLayoutClient>
  )
}
