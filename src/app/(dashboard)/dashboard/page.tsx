import ActivityFeed from '@/components/dashboard/ActivityFeed'
import OnboardingWidget from '@/components/dashboard/OnboardingWidget'
import QuickActionCard from '@/components/dashboard/QuickActionCard'
import ReleasePlanBanner from '@/components/dashboard/ReleasePlanBanner'
import StatCard from '@/components/dashboard/StatCard'
import { createClient } from '@/lib/supabase/server'
import type { OnboardingStep, User } from '@/types'
import {
  BookOpen,
  FileText,
  Image,
  Mic,
  Upload,
  UserPlus,
  Users,
  Video,
} from 'lucide-react'
import { redirect } from 'next/navigation'

export default async function DashboardPage() {
  const supabase = await createClient()
  const { data: { user: authUser } } = await supabase.auth.getUser()

  if (!authUser) redirect('/login')

  // Fetch user profile from NestJS API
  let profile: User | null = null
  try {
    const { data: { session } } = await supabase.auth.getSession()
    if (session?.access_token) {
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/api/v1/users/me`,
        {
          headers: { Authorization: `Bearer ${session.access_token}` },
          cache: 'no-store',
        }
      )
      if (res.ok) {
        const json = await res.json()
        profile = json.data
      }
    }
  } catch {
    // Silently fall back to auth user data
  }

  const onboardingSteps: OnboardingStep[] = [
    {
      key: 'finish_account',
      label: 'Finish Your Account',
      description: 'Complete your profile',
      href: '/settings',
      completed: profile?.onboarding?.finish_account ?? false,
    },
    {
      key: 'add_release_manager',
      label: 'Add a Release Manager',
      description: 'Designate someone you trust',
      href: '/release-manager',
      completed: profile?.onboarding?.add_release_manager ?? false,
    },
    {
      key: 'add_recipients',
      label: 'Add Recipients',
      description: 'Who will receive your legacy',
      href: '/recipients',
      completed: profile?.onboarding?.add_recipients ?? false,
    },
    {
      key: 'add_photos',
      label: 'Add Photos',
      description: 'Upload cherished memories',
      href: '/photos',
      completed: profile?.onboarding?.add_photos ?? false,
    },
    {
      key: 'create_message',
      label: 'Create a Message',
      description: 'Record your first message',
      href: '/messages/new',
      completed: profile?.onboarding?.create_message ?? false,
    },
  ]

  const showOnboarding = !profile?.onboarding?.completed_at

  return (
    <div className="max-w-7xl mx-auto px-6 py-6">
      {/* Release plan banner — hidden for Sprint 1 */}
      <ReleasePlanBanner plan={null} />

      {/* Onboarding widget */}
      {showOnboarding && <OnboardingWidget steps={onboardingSteps} />}

      {/* Stat cards */}
      <div className="mb-6">
        <h2 className="text-xl font-semibold text-[#1E293B] mb-4">Your Legacy</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          <StatCard label="Video Messages" count={0} icon={Video} iconColor="text-[#4338CA]" iconBg="bg-indigo-50" index={0} />
          <StatCard label="Audio Messages" count={0} icon={Mic} iconColor="text-purple-600" iconBg="bg-purple-50" index={1} />
          <StatCard label="Documents" count={0} icon={FileText} iconColor="text-[#D97706]" iconBg="bg-amber-50" index={2} />
          <StatCard label="Photos" count={0} icon={Image} iconColor="text-[#16A34A]" iconBg="bg-green-50" index={3} />
          <StatCard label="Memoir Chapters" count={0} icon={BookOpen} iconColor="text-[#0D9488]" iconBg="bg-teal-50" index={4} />
          <StatCard label="Recipients" count={0} icon={Users} iconColor="text-cyan-600" iconBg="bg-cyan-50" index={5} />
        </div>
      </div>

      {/* Quick actions */}
      <div className="mb-6">
        <h2 className="text-xl font-semibold text-[#1E293B] mb-4">Quick Actions</h2>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <QuickActionCard
            title="Record a Message"
            subtitle="Leave a personal video or audio message"
            href="/messages/new"
            icon={Video}
            iconColor="text-[#4338CA]"
            iconBg="bg-indigo-50"
          />
          <QuickActionCard
            title="Upload a Document"
            subtitle="Store important files for your legacy"
            href="/documents/upload"
            icon={Upload}
            iconColor="text-[#D97706]"
            iconBg="bg-amber-50"
          />
          <QuickActionCard
            title="Add a Recipient"
            subtitle="Choose who receives your legacy"
            href="/recipients/add"
            icon={UserPlus}
            iconColor="text-[#16A34A]"
            iconBg="bg-green-50"
          />
        </div>
      </div>

      {/* Activity feed */}
      <div>
        <h2 className="text-xl font-semibold text-[#1E293B] mb-4">Recent Activity</h2>
        <div className="bg-white rounded-xl shadow-sm p-6">
          <ActivityFeed items={[]} />
        </div>
      </div>
    </div>
  )
}
