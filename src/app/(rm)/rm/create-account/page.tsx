import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { hasOwnerMembership } from '@/lib/api/memberships'
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
      hasOwnerAccount = await hasOwnerMembership(session.access_token)
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
