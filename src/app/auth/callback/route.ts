import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url)
  const code = searchParams.get('code')
  const type = searchParams.get('type')
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? origin

  if (!code) {
    return NextResponse.redirect(`${siteUrl}/signin`)
  }

  const supabase = await createClient()
  const { error } = await supabase.auth.exchangeCodeForSession(code)

  if (error) {
    console.error('Auth callback error:', error.message)
    return NextResponse.redirect(
      `${siteUrl}/signin?error=verification_failed`
    )
  }

  // Password reset flow — send to update password page
  if (type === 'recovery') {
    return NextResponse.redirect(`${siteUrl}/update-password`)
  }

  // All other flows — check onboarding status
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    return NextResponse.redirect(`${siteUrl}/signin`)
  }

  const { data: profile } = await supabase
    .from('users')
    .select('onboarding')
    .eq('id', user.id)
    .single()

  // New user or incomplete onboarding → onboarding
  if (!profile?.onboarding?.completed_at) {
    return NextResponse.redirect(`${siteUrl}/onboarding`)
  }

  // Completed onboarding → dashboard
  return NextResponse.redirect(`${siteUrl}/dashboard`)
}
