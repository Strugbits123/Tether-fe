'use client'

import { createClient } from '@/lib/supabase/client'
import { api } from '@/lib/api/client'
import type { Session, User } from '@supabase/supabase-js'
import { useRouter } from 'next/navigation'
import { createContext, useCallback, useContext, useEffect, useState } from 'react'

export interface UserProfile {
  id: string
  email: string
  first_name: string
  last_name: string
  full_name: string
  date_of_birth: string | null
  gender: string | null
  phone_number: string | null
  sms_opted_in: boolean
  auth_provider: string
  account_status: string
  role: string
  onboarding: {
    add_photos: boolean
    completed_at: string | null
    add_recipients: boolean
    create_message: boolean
    finish_account: boolean
    add_release_manager: boolean
  } | null
  [key: string]: any
}

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

  const fetchProfile = useCallback(async (token: string) => {
    setProfileLoading(true)
    try {
      const data = await api.get<UserProfile>('/users/me', token)
      setProfile(data)
    } catch {
      // Non-fatal — profile unavailable
    } finally {
      setProfileLoading(false)
    }
  }, [])

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session)
      setUser(session?.user ?? null)
      setLoading(false)
      if (session?.access_token) {
        fetchProfile(session.access_token)
      }
    })

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session)
      setUser(session?.user ?? null)
      setLoading(false)
      if (session?.access_token) {
        fetchProfile(session.access_token)
      } else {
        setProfile(null)
      }
    })

    return () => subscription.unsubscribe()
  }, []) // eslint-disable-line react-hooks/exhaustive-deps

  const refreshProfile = useCallback(async () => {
    const { data: { session: current } } = await supabase.auth.getSession()
    if (current?.access_token) {
      await fetchProfile(current.access_token)
    }
  }, [supabase, fetchProfile])

  const signOut = async () => {
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
