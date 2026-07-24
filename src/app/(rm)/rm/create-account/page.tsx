import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { getMemberships } from '@/lib/api/memberships'
import CreateAccountForm from './CreateAccountForm'

// Only relevant for RMs who don't already have their own owner account.
// Checked server-side so a user who already has one never sees this page
// flash in before redirecting.
export default async function CreateAccountPage() {
  const supabase = await createClient()
  const {
    data: { session },
  } = await supabase.auth.getSession()

  let hasOwnerAccount = false
  if (session?.access_token) {
    try {
      const memberships = await getMemberships(session.access_token)
      hasOwnerAccount = memberships.some((m) => m.portal === 'owner')
    } catch {
      // If the check fails, fall through and show the page rather than
      // trapping the user on a broken redirect.
    }
  }

  if (hasOwnerAccount) {
    redirect('/rm/overview')
  }

  return <CreateAccountForm />
}
