import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'

export default async function SettingsPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) redirect('/login')

  const displayName = user.user_metadata?.full_name || user.email?.split('@')[0] || 'User'
  const email = user.email || ''

  return (
    <div className="max-w-3xl mx-auto px-6 py-6 space-y-8">

      {/* Profile */}
      <section>
        <h2 className="text-lg font-semibold text-[#1E293B]">Profile</h2>
        <p className="text-sm text-[#64748B] mt-1">Manage your personal information and account details</p>
        <div className="h-px bg-[#E2E8F0] my-4" />
        <div className="bg-white rounded-xl shadow-sm p-6 space-y-3">
          <div>
            <p className="text-xs font-medium text-[#64748B] uppercase tracking-wide mb-1">Full name</p>
            <p className="text-sm text-[#1E293B]">{displayName}</p>
          </div>
          <div>
            <p className="text-xs font-medium text-[#64748B] uppercase tracking-wide mb-1">Email address</p>
            <p className="text-sm text-[#1E293B]">{email}</p>
          </div>
        </div>
      </section>

      {/* Notifications */}
      <section>
        <h2 className="text-lg font-semibold text-[#1E293B]">Notifications</h2>
        <p className="text-sm text-[#64748B] mt-1">Control how and when Tether contacts you</p>
        <div className="h-px bg-[#E2E8F0] my-4" />
        <div className="bg-white rounded-xl shadow-sm p-6">
          <p className="text-sm text-[#94A3B8] italic">Coming soon</p>
        </div>
      </section>

      {/* Billing */}
      <section>
        <h2 className="text-lg font-semibold text-[#1E293B]">Billing</h2>
        <p className="text-sm text-[#64748B] mt-1">Manage your subscription and payment details</p>
        <div className="h-px bg-[#E2E8F0] my-4" />
        <div className="bg-white rounded-xl shadow-sm p-6">
          <p className="text-sm text-[#94A3B8] italic">Coming soon</p>
        </div>
      </section>

      {/* Danger Zone */}
      <section>
        <h2 className="text-lg font-semibold text-[#1E293B]">Danger Zone</h2>
        <p className="text-sm text-[#64748B] mt-1">Delete your account and all associated data</p>
        <div className="h-px bg-[#E2E8F0] my-4" />
        <div className="bg-white rounded-xl shadow-sm p-6 border border-[#DC2626]/20">
          <p className="text-sm text-[#94A3B8] italic">Coming soon</p>
        </div>
      </section>

    </div>
  )
}
