import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url)
  const code = searchParams.get('code')
  const token_hash = searchParams.get('token_hash')
  const type = searchParams.get('type') as 'email' | 'recovery' | 'magiclink' | null
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL
    ?? (process.env.NODE_ENV !== 'production' ? origin : null)
  if (!siteUrl) {
    throw new Error('NEXT_PUBLIC_SITE_URL must be set in production')
  }

  const supabase = await createClient()

  // Adds a one-shot `li` (login-intent) param the client reads to fire the
  // user_logged_in analytics event, since this server route can't use the
  // browser PostHog SDK. LoginEventTracker strips it after capturing.
  const dest = (path: string, loginMethod?: string) => {
    const url = new URL(`${siteUrl}${path}`)
    if (loginMethod) url.searchParams.set('li', loginMethod)
    return NextResponse.redirect(url.toString())
  }

  // Someone who signed up via an invite (RM/guardian/recipient) has no owner
  // account and must never land in the owner onboarding wizard — route them
  // to /select-account instead, which resolves their real membership once
  // AuthContext finalizes invite acceptance client-side.
  const isInviteSignup = async (userId: string, email: string | undefined) => {
    // user_id alone can identify an already-linked non-owner membership (e.g.
    // an accepted invite) — the email claim can be absent for some OAuth
    // providers, so it must only ever widen this check, never gate it.
    const filter = email
      ? `user_id.eq.${userId},invite_email.eq.${email.toLowerCase()}`
      : `user_id.eq.${userId}`
    const { data } = await supabase
      .from('account_memberships')
      .select('id')
      .or(filter)
      .neq('role', 'owner')
      .limit(1)
      .maybeSingle()
    return !!data
  }

  // ── token_hash flow ──
  // Used by: email confirmation, magic link, password reset
  // Does NOT require the original browser session — works from any email client
  if (token_hash && type) {
    const { error } = await supabase.auth.verifyOtp({ token_hash, type })

    if (error) {
      return NextResponse.redirect(`${siteUrl}/signin?error=verification_failed`)
    }

    if (type === 'recovery') {
      return NextResponse.redirect(`${siteUrl}/update-password`)
    }

    // Only a magic link is a "login"; email-confirmation is tracked separately
    // (email_verified, server-side).
    const loginMethod = type === 'magiclink' ? 'magic_link' : undefined

    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return NextResponse.redirect(`${siteUrl}/signin`)

    if (await isInviteSignup(user.id, user.email)) {
      return dest('/select-account', loginMethod)
    }

    const { data: profile } = await supabase
      .from('users')
      .select('onboarding')
      .eq('id', user.id)
      .single()

    if (!profile?.onboarding?.completed_at) {
      return dest('/onboarding', loginMethod)
    }

    return dest('/dashboard', loginMethod)
  }

  // ── PKCE code flow ──
  // Used by: Google OAuth only
  if (code) {
    const { error } = await supabase.auth.exchangeCodeForSession(code)

    if (error) {
      return NextResponse.redirect(`${siteUrl}/signin?error=verification_failed`)
    }

    if (type === 'recovery') {
      return NextResponse.redirect(`${siteUrl}/update-password`)
    }

    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return NextResponse.redirect(`${siteUrl}/signin`)

    if (await isInviteSignup(user.id, user.email)) {
      return dest('/select-account', 'oauth')
    }

    const { data: profile } = await supabase
      .from('users')
      .select('onboarding')
      .eq('id', user.id)
      .single()

    if (!profile?.onboarding?.completed_at) {
      return dest('/onboarding', 'oauth')
    }

    return dest('/dashboard', 'oauth')
  }

  // No code or token_hash
  return NextResponse.redirect(`${siteUrl}/signin`)
}
