'use client'

import { createClient } from '@/lib/supabase/client'
import { api, ApiError } from '@/lib/api/client'
import { getActiveContext, getMemberships, switchContext } from '@/lib/api/memberships'
import { acceptInvitation } from '@/lib/api/invitations'
import { identifyUser, resetIdentity, track } from '@/lib/posthog/analytics'
import type { UserProfile } from '@/lib/api/users'
import type { Session, User } from '@supabase/supabase-js'
import { useRouter, usePathname } from 'next/navigation'
import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState } from 'react'

export type { UserProfile }

const ACTIVE_MEMBERSHIP_KEY = 'active_membership'
const PENDING_INVITE_KEY = 'pending_invite_token'
const ACCEPTED_TOKENS_KEY = 'accepted_invite_tokens'
const AUTH_PATHS = ['/signin', '/signup']

// Tracks tokens already sent to acceptInvitation from this browser, so a
// duplicate onAuthStateChange firing (SIGNED_IN followed by TOKEN_REFRESHED,
// multiple tabs, etc.) can't re-issue the same accept call. Backend accept is
// idempotent regardless — this just avoids the redundant network round trip.
function wasInviteAccepted(token: string): boolean {
  try {
    const raw = window.localStorage.getItem(ACCEPTED_TOKENS_KEY)
    const list: string[] = raw ? JSON.parse(raw) : []
    return list.includes(token)
  } catch {
    return false
  }
}

function markInviteAccepted(token: string): void {
  try {
    const raw = window.localStorage.getItem(ACCEPTED_TOKENS_KEY)
    const list: string[] = raw ? JSON.parse(raw) : []
    if (!list.includes(token)) list.push(token)
    window.localStorage.setItem(ACCEPTED_TOKENS_KEY, JSON.stringify(list.slice(-10)))
  } catch {
    // best-effort only
  }
}

interface AuthContextValue {
  user: User | null
  session: Session | null
  profile: UserProfile | null
  loading: boolean
  profileLoading: boolean
  /** Number of accounts (owner/guardian/recipient) this user belongs to. Only
   *  meaningful once membership resolution has run at least once; `null`
   *  beforehand or if the memberships endpoint isn't reachable. */
  membershipCount: number | null
  signOut: () => Promise<void>
  refreshProfile: () => Promise<void>
  switchAccount: () => void
  /** Resolves the session's membership(s) and navigates to the right
   *  destination (dashboard / rm portal / account picker). Call directly
   *  right after establishing a session (e.g. on login) so navigation
   *  happens once, synchronously with the caller, instead of racing an
   *  unconditional router.push against this same resolution running via the
   *  auth-state-change listener. Guarded internally so only one of the two
   *  callers (explicit vs. automatic) actually does the work. */
  resolveMembership: (token: string) => Promise<void>
}

const AuthContext = createContext<AuthContextValue | null>(null)

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [session, setSession] = useState<Session | null>(null)
  const [profile, setProfile] = useState<UserProfile | null>(null)
  const [loading, setLoading] = useState(true)
  const [profileLoading, setProfileLoading] = useState(false)
  const [membershipCount, setMembershipCount] = useState<number | null>(null)
  const router = useRouter()
  const pathname = usePathname()
  const supabase = useMemo(() => createClient(), [])
  const pathnameRef = useRef(pathname)
  useEffect(() => {
    pathnameRef.current = pathname
  })

  // Retry state for the profile fetch — the backend may be cold-starting or the
  // user may not be provisioned yet on first load.
  const retryRef = useRef<{ timer: ReturnType<typeof setTimeout> | null; attempt: number }>({
    timer: null,
    attempt: 0,
  })

  const stopRetry = useCallback(() => {
    if (retryRef.current.timer) clearTimeout(retryRef.current.timer)
    retryRef.current = { timer: null, attempt: 0 }
  }, [])

  // The retry below re-invokes loadProfile from inside its own definition, so it
  // can't reference the binding directly — that reads a `const` before it is
  // declared. Holding the latest instance in a ref is the standard indirection:
  // the ref is populated on every render, and the retry timer only ever fires
  // after at least one render has happened.
  const loadProfileRef = useRef<() => void>(() => {})

  // Backoff-scheduled retry, shared by the two transient-failure paths below
  // (session lookup and the /users/me call).
  const scheduleRetry = useCallback(() => {
    const delays = [2000, 4000, 8000, 15000, 30000]
    const attempt = retryRef.current.attempt
    const delay = delays[Math.min(attempt, delays.length - 1)]
    if (retryRef.current.timer) clearTimeout(retryRef.current.timer)
    retryRef.current.attempt = attempt + 1
    retryRef.current.timer = setTimeout(() => {
      loadProfileRef.current()
    }, delay)
  }, [])

  // Loads /users/me, reading a fresh token each time. On failure it keeps
  // retrying with backoff (capped at 30s) so the UI auto-recovers once the
  // backend is reachable — no page reload needed.
  const loadProfile = useCallback(async () => {
    const { data, error: sessionError } = await supabase.auth.getSession()
    // A failed session lookup (network drop, refresh-token round trip) is not
    // proof of being signed out. Treating it as such stopped the retry loop
    // permanently and left the app profile-less until a manual reload — retry
    // instead, and reserve stopRetry for a confirmed absence of a session.
    if (sessionError) {
      scheduleRetry()
      return
    }
    const token = data.session?.access_token
    if (!token) {
      stopRetry()
      return
    }
    setProfileLoading(true)
    try {
      const data = await api.get<UserProfile>('/users/me', token)
      setProfile(data)
      // Enrich the PostHog person + register user_id/environment super props
      // once the profile is available.
      identifyUser(data)
      stopRetry()
    } catch (e) {
      // Only retry transient failures (cold-start 5xx, network drop, rate limit).
      // Terminal auth/not-found statuses won't recover by retrying, so stop.
      const terminal =
        e instanceof ApiError && [400, 401, 403, 404].includes(e.statusCode)
      if (terminal) {
        stopRetry()
      } else {
        scheduleRetry()
      }
    } finally {
      setProfileLoading(false)
    }
  }, [supabase, stopRetry, scheduleRetry])

  // Assigned in an effect rather than during render — a render-phase ref write
  // is itself a lint violation (and unsafe under concurrent rendering).
  useEffect(() => {
    loadProfileRef.current = loadProfile
  }, [loadProfile])

  // Finalizes a pending invitation acceptance once a session exists. The
  // invite-accept page stores the token here (instead of relying on it
  // surviving through query params) because password/magic-link/OAuth signup
  // all redirect through different paths — localStorage is the one thing
  // that's guaranteed to still be there once we land back with a session.
  // Best-effort: any failure just clears the token so we don't retry forever.
  const finalizePendingInvite = useCallback(async (token: string) => {
    const inviteToken = window.localStorage.getItem(PENDING_INVITE_KEY)
    if (!inviteToken) return
    window.localStorage.removeItem(PENDING_INVITE_KEY)
    if (wasInviteAccepted(inviteToken)) return
    try {
      await acceptInvitation(inviteToken, token)
      markInviteAccepted(inviteToken)
    } catch {
      // Nothing more we can do client-side — the user can re-open the
      // original invitation email link if this genuinely failed.
    }
  }, [])

  // Resolves which membership is active for this session, best-effort: any
  // failure (endpoint not deployed yet, network hiccup) is swallowed so it can
  // never block sign-in. Runs once per session — guarded by resolvedRef.
  const resolvedRef = useRef(false)
  const resolveMembership = useCallback(
    async (token: string) => {
      if (resolvedRef.current) return
      resolvedRef.current = true
      try {
        const memberships = await getMemberships(token)
        setMembershipCount(memberships.length)

        const stored = window.localStorage.getItem(ACTIVE_MEMBERSHIP_KEY)
        if (stored) {
          // Validate a previously-stored membership is still valid (e.g. it
          // wasn't revoked since the last visit) rather than trusting it blindly.
          try {
            const ctx = await getActiveContext(token)
            // A returning user landing back on /signin (session expired, then
            // re-authenticated) still needs to be routed into the app — don't
            // leave them stranded on the sign-in page just because their
            // membership was already resolved in a prior session. Only forces
            // navigation from an auth page — someone already deep in the app
            // (e.g. browsing /rm/recipients) is left alone.
            if (AUTH_PATHS.includes(pathnameRef.current ?? '')) {
              const destination =
                ctx.portal === 'owner'
                  ? '/dashboard'
                  : ctx.portal === 'release_manager'
                    ? '/rm/overview'
                    : '/select-account'
              router.push(destination)
            }
          } catch {
            window.localStorage.removeItem(ACTIVE_MEMBERSHIP_KEY)
            if (pathnameRef.current !== '/select-account') router.push('/select-account')
          }
          return
        }

        if (memberships.length === 1) {
          const ctx = await switchContext(token, memberships[0].id)
          window.localStorage.setItem(ACTIVE_MEMBERSHIP_KEY, ctx.membership_id)
          // Single membership: land directly on the right portal — no
          // intermediate /dashboard flash for RM/guardian/recipient accounts.
          const destination =
            ctx.portal === 'owner'
              ? '/dashboard'
              : ctx.portal === 'release_manager'
                ? '/rm/overview'
                : '/select-account' // guardian/recipient portals don't exist yet
          if (pathnameRef.current !== destination) router.push(destination)
        } else if (memberships.length > 1) {
          if (pathnameRef.current !== '/select-account') router.push('/select-account')
        } else if (pathnameRef.current !== '/select-account') {
          // No memberships at all shouldn't happen (owner self-membership is
          // auto-created on signup), but never default an unresolved account to
          // the owner dashboard — that's a different account's data surface.
          // Land on the picker (empty-state + sign-out) instead of guessing.
          router.push('/select-account')
        }
      } catch {
        // Memberships aren't available (feature not live on the backend yet,
        // or a transient error). Don't yank the user off an unrelated page —
        // but a fresh login/signup still needs *somewhere* to land, and it must
        // never be the owner dashboard when we can't confirm that's who they are.
        resolvedRef.current = false
        if (AUTH_PATHS.includes(pathnameRef.current ?? '')) {
          router.push('/select-account')
        }
      }
    },
    [router],
  )

  useEffect(() => {
    supabase.auth.getSession().then(async ({ data: { session } }) => {
      setSession(session)
      setUser(session?.user ?? null)
      setLoading(false)
      if (session?.access_token) {
        loadProfile()
        await finalizePendingInvite(session.access_token)
        resolveMembership(session.access_token)
      }
    })

    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      setSession(session)
      setUser(session?.user ?? null)
      setLoading(false)
      if (session?.access_token) {
        // loadProfile() identifies + enriches the PostHog person once /users/me
        // resolves (see identifyUser), so no minimal identify is needed here.
        loadProfile()
        await finalizePendingInvite(session.access_token)
        resolveMembership(session.access_token)
      } else {
        stopRetry()
        setProfile(null)
        setMembershipCount(null)
        resolvedRef.current = false
        resetIdentity()
      }
    })

    return () => {
      subscription.unsubscribe()
      stopRetry()
    }
  }, []) // eslint-disable-line react-hooks/exhaustive-deps

  const refreshProfile = useCallback(async () => {
    await loadProfile()
  }, [loadProfile])

  const switchAccount = useCallback(() => {
    window.localStorage.removeItem(ACTIVE_MEMBERSHIP_KEY)
    resolvedRef.current = false
    router.push('/select-account')
  }, [router])

  const signOut = async () => {
    stopRetry()
    window.localStorage.removeItem(ACTIVE_MEMBERSHIP_KEY)
    // Fire backend logout (invalidates server-side session record) — don't await;
    // browser session cleared below is the authoritative action.
    const { data: { session: current } } = await supabase.auth.getSession()
    if (current?.access_token) {
      api.post('/auth/logout', {}, current.access_token).catch(() => null)
    }
    try {
      await supabase.auth.signOut()
      // Record only after sign-out actually succeeded, while identity is still
      // attached (resetIdentity runs afterwards via the auth-state-change
      // listener). If sign-out throws we skip the event but still tear down.
      track('user_logged_out')
    } catch {
      // Fall through — clear local UI state regardless so the user isn't stuck.
    } finally {
      setProfile(null)
      router.push('/signin')
    }
  }

  return (
    <AuthContext.Provider
      value={{
        user,
        session,
        profile,
        loading,
        profileLoading,
        membershipCount,
        signOut,
        refreshProfile,
        switchAccount,
        resolveMembership,
      }}
    >
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth must be used within AuthProvider')
  return ctx
}
