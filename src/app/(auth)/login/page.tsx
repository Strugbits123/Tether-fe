'use client'

import Button from '@/components/ui/Button'
import Input from '@/components/ui/Input'
import { createClient } from '@/lib/supabase/client'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { useState } from 'react'

export default function LoginPage() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [googleLoading, setGoogleLoading] = useState(false)
  const router = useRouter()
  const supabase = createClient()

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setLoading(true)

    try {
      const { error } = await supabase.auth.signInWithPassword({ email, password })
      if (error) throw error
      router.push('/dashboard')
    } catch {
      setError('Invalid email or password.')
    } finally {
      setLoading(false)
    }
  }

  const handleGoogleSignIn = async () => {
    setGoogleLoading(true)
    const { error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: { redirectTo: window.location.origin + '/auth/callback' },
    })
    if (error) {
      setError(error.message)
      setGoogleLoading(false)
    }
  }

  return (
    <div className="w-full max-w-md">
      <div className="text-center mb-6">
        <div className="text-[#4338CA] font-bold text-2xl mb-1">Tether</div>
        <p className="text-sm text-[#64748B]">Your digital legacy, protected.</p>
      </div>

      <div className="bg-white rounded-xl shadow-sm p-8">
        <h1 className="text-2xl font-bold text-[#1E293B] mb-6">Welcome back</h1>

        <form onSubmit={handleLogin} className="space-y-4">
          <Input
            label="Email"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="you@example.com"
            required
            autoComplete="email"
          />
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label className="text-xs font-medium text-[#64748B] uppercase tracking-wide">Password</label>
              <Link href="/reset-password" className="text-xs text-[#4338CA] hover:underline">
                Forgot password?
              </Link>
            </div>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Your password"
              required
              autoComplete="current-password"
              className="border border-[#E2E8F0] rounded-lg px-3 py-2 text-sm w-full text-[#1E293B] focus:outline-none focus:ring-2 focus:ring-[#4338CA] focus:border-[#4338CA] placeholder:text-[#94A3B8]"
            />
          </div>

          {error && <p className="text-sm text-[#DC2626]">{error}</p>}

          <Button type="submit" variant="primary" loading={loading} className="w-full">
            Sign in
          </Button>
        </form>

        <p className="mt-4 text-sm text-center text-[#64748B]">
          Don&apos;t have an account?{' '}
          <Link href="/signup" className="text-[#4338CA] font-medium hover:underline">
            Sign up
          </Link>
        </p>

        <div className="flex items-center my-5 gap-3">
          <div className="flex-1 h-px bg-[#E2E8F0]" />
          <span className="text-xs text-[#64748B]">or</span>
          <div className="flex-1 h-px bg-[#E2E8F0]" />
        </div>

        <Button
          type="button"
          variant="secondary"
          loading={googleLoading}
          onClick={handleGoogleSignIn}
          className="w-full mb-3"
        >
          <svg className="w-4 h-4" viewBox="0 0 24 24">
            <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
            <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
            <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
            <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
          </svg>
          Continue with Google
        </Button>

        <div className="flex items-center my-3 gap-3">
          <div className="flex-1 h-px bg-[#E2E8F0]" />
          <span className="text-xs text-[#64748B]">or</span>
          <div className="flex-1 h-px bg-[#E2E8F0]" />
        </div>

        <Link
          href="/magic-link"
          className="flex items-center justify-center w-full px-4 py-2 text-sm font-medium text-[#4338CA] border border-[#E2E8F0] rounded-lg hover:bg-[#F1F5F9] transition-colors"
        >
          Sign in with a magic link
        </Link>
      </div>
    </div>
  )
}
