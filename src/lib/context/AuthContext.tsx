'use client'

import { createClient } from '@/lib/supabase/client'
import { api, ApiError } from '@/lib/api/client'
import { getActiveContext, getMemberships, switchContext } from '@/lib/api/memberships'
import { identifyUser, resetIdentity, track } from '@/lib/posthog/analytics'
import type { UserProfile } from '@/lib/api/users'
import type { Session, User } from '@supabase/supabase-js'
import { useRouter, usePathname } from 'next/navigation'
import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState } from 'react'

export type { UserProfile }

const ACTIVE_MEMBERSHIP_KEY = 'active_membership'

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

  // Loads /users/me, reading a fresh token each time. On failure it keeps
  // retrying with backoff (capped at 30s) so the UI auto-recovers once the
  // backend is reachable — no page reload needed.
  const loadProfile = useCallback(async () => {
    const {
      data: { session: current },
    } = await supabase.auth.getSession()
    const token = current?.access_token
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
        const delays = [2000, 4000, 8000, 15000, 30000]
        const attempt = retryRef.current.attempt
        const delay = delays[Math.min(attempt, delays.length - 1)]
        if (retryRef.current.timer) clearTimeout(retryRef.current.timer)
        retryRef.current.attempt = attempt + 1
        retryRef.current.timer = setTimeout(() => {
          loadProfile()
        }, delay)
      }
    } finally {
      setProfileLoading(false)
    }
  }, [supabase, stopRetry])

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
            await getActiveContext(token)
          } catch {
            window.localStorage.removeItem(ACTIVE_MEMBERSHIP_KEY)
            if (pathnameRef.current !== '/select-account') router.push('/select-account')
          }
          return
        }

        if (memberships.length === 1) {
          const ctx = await switchContext(token, memberships[0].id)
          window.localStorage.setItem(ACTIVE_MEMBERSHIP_KEY, ctx.membership_id)
          if (ctx.portal === 'release_manager' && pathnameRef.current !== '/rm/overview') {
            router.push('/rm/overview')
          }
        } else if (memberships.length > 1 && pathnameRef.current !== '/select-account') {
          router.push('/select-account')
        }
      } catch {
        // Memberships aren't available (feature not live on the backend yet,
        // or a transient error) — fall back to single-owner behavior.
        resolvedRef.current = false
      }
    },
    [router],
  )

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session)
      setUser(session?.user ?? null)
      setLoading(false)
      if (session?.access_token) {
        loadProfile()
        resolveMembership(session.access_token)
      }
    })

    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      setSession(session)
      setUser(session?.user ?? null)
      setLoading(false)
      if (session?.access_token) {
        // loadProfile() identifies + enriches the PostHog person once /users/me
        // resolves (see identifyUser), so no minimal identify is needed here.
        loadProfile()
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
