import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url)
  const code = searchParams.get('code')
  const token_hash = searchParams.get('token_hash')
  const type = searchParams.get('type') as 'email' | 'recovery' | 'magiclink' | null
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? origin

  const supabase = await createClient()

  // ── token_hash flow ──
  // Used by: email confirmation, magic link, password reset
  // Does NOT require the original browser session — works from any email client
  if (token_hash && type) {
    const { error } = await supabase.auth.verifyOtp({ token_hash, type })

    if (error) {
      console.error('OTP verification error:', error.message)
      return NextResponse.redirect(`${siteUrl}/signin?error=verification_failed`)
    }

    if (type === 'recovery') {
      return NextResponse.redirect(`${siteUrl}/update-password`)
    }

    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return NextResponse.redirect(`${siteUrl}/signin`)

    const { data: profile } = await supabase
      .from('users')
      .select('onboarding')
      .eq('id', user.id)
      .single()

    if (!profile?.onboarding?.completed_at) {
      return NextResponse.redirect(`${siteUrl}/onboarding`)
    }

    return NextResponse.redirect(`${siteUrl}/dashboard`)
  }

  // ── PKCE code flow ──
  // Used by: Google OAuth only
  if (code) {
    const { error } = await supabase.auth.exchangeCodeForSession(code)

    if (error) {
      console.error('Code exchange error:', error.message)
      return NextResponse.redirect(`${siteUrl}/signin?error=verification_failed`)
    }

    if (type === 'recovery') {
      return NextResponse.redirect(`${siteUrl}/update-password`)
    }

    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return NextResponse.redirect(`${siteUrl}/signin`)

    const { data: profile } = await supabase
      .from('users')
      .select('onboarding')
      .eq('id', user.id)
      .single()

    if (!profile?.onboarding?.completed_at) {
      return NextResponse.redirect(`${siteUrl}/onboarding`)
    }

    return NextResponse.redirect(`${siteUrl}/dashboard`)
  }

  // No code or token_hash
  return NextResponse.redirect(`${siteUrl}/signin`)
}
