'use client'

import { createClient } from '@/lib/supabase/client'
import { api, ApiError } from '@/lib/api/client'
import type { UserProfile } from '@/lib/api/users'
import type { Session, User } from '@supabase/supabase-js'
import { useRouter } from 'next/navigation'
import { createContext, useCallback, useContext, useEffect, useRef, useState } from 'react'

export type { UserProfile }

interface AuthContextValue {
  user: User | null
  session: Session | null
  profile: UserProfile | null
  loading: boolean
  profileLoading: boolean
  signOut: () => Promise<void>
  refreshProfile: () => Promise<void>
}

const AuthContext = createContext<AuthContextValue | null>(null)

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [session, setSession] = useState<Session | null>(null)
  const [profile, setProfile] = useState<UserProfile | null>(null)
  const [loading, setLoading] = useState(true)
  const [profileLoading, setProfileLoading] = useState(false)
  const router = useRouter()
  const supabase = createClient()

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

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session)
      setUser(session?.user ?? null)
      setLoading(false)
      if (session?.access_token) {
        loadProfile()
      }
    })

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session)
      setUser(session?.user ?? null)
      setLoading(false)
      if (session?.access_token) {
        loadProfile()
      } else {
        stopRetry()
        setProfile(null)
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

  const signOut = async () => {
    stopRetry()
    await supabase.auth.signOut()
    setProfile(null)
    router.push('/signin')
  }

  return (
    <AuthContext.Provider value={{ user, session, profile, loading, profileLoading, signOut, refreshProfile }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth must be used within AuthProvider')
  return ctx
}
