"use client"

import React, { useState, use, useEffect } from 'react'
import Link from 'next/link'
import { useRouter, notFound, useSearchParams } from 'next/navigation'
import { useToast } from '@/lib/context/ToastContext'
import { Eye, EyeOff } from 'lucide-react'
import { FiArrowLeft, FiLock } from 'react-icons/fi'
import { HiOutlineSparkles } from 'react-icons/hi'
import { createClient } from '@/lib/supabase/client'
import { api } from '@/lib/api/client'

/* ─── Allowed modes ─── */
const VALID_MODES = ['signin', 'signup'] as const
type Mode = (typeof VALID_MODES)[number]

/* ─── Sub-views inside the sign-in flow ─── */
type View = 'main' | 'magic-link' | 'inbox' | 'forgot-password' | 'forgot-password-sent'

/* ──────────────────────────────────────────────────────────── */
/*  Shared layout wrapper (logo + card + footer)                */
/* ──────────────────────────────────────────────────────────── */
function AuthLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter()
  return (
    <div
      className="min-h-screen flex flex-col items-center justify-center px-4 py-8 font-sans"
      style={{ background: 'linear-gradient(135deg, #EEF2FF 0%, #FFFFFF 50%, #F0FDF4 100%)' }}
    >
      <div className="flex flex-col items-center">
        {/* Logo */}
        <div className="mb-8 flex justify-center cursor-pointer" onClick={() => router.push('/')}>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src="/Logo.png" alt="Tether Logo" className="h-[43px] w-auto select-none" />
        </div>

        {children}

        {/* Under-card text */}
        <div className="mt-6 flex items-center justify-center gap-2">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src="/register/secure.png" alt="Secure" className="w-4 h-4 object-contain select-none" />
          <span className="font-sans font-normal text-sm leading-[20px] tracking-[-0.15px] text-[#6A7282] text-center">
            Your data is encrypted and secure
          </span>
        </div>
      </div>
    </div>
  )
}

/* ──────────────────────────────────────────────────────────── */
/*  MAIN SIGN-IN / SIGN-UP FORM                                 */
/* ──────────────────────────────────────────────────────────── */
function MainAuthForm({
  isSignUp,
  onMagicLink,
  onForgotPassword,
  onToggleMode,
}: {
  isSignUp: boolean
  onMagicLink: () => void
  onForgotPassword: () => void
  onToggleMode: () => void
}) {
  const router = useRouter()
  const { showToast } = useToast()
  const searchParams = useSearchParams()

  useEffect(() => {
    const error = searchParams.get('error')
    if (error === 'verification_failed') {
      showToast('Verification link expired or invalid. Please request a new one.', 'error')
    }
  }, [searchParams]) // eslint-disable-line react-hooks/exhaustive-deps

  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [loading, setLoading] = useState(false)

  const [firstName, setFirstName] = useState('')
  const [lastName, setLastName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [agreeTerms, setAgreeTerms] = useState(false)
  const [formError, setFormError] = useState<string | null>(null)

  const DUPLICATE_EMAIL_MESSAGE =
    'An account with this email already exists. Please sign in or reset your password.'

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setFormError(null)

    if (!email || !password) {
      showToast('Please fill in all required fields.', 'error')
      return
    }

    if (isSignUp) {
      if (!firstName || !lastName) {
        showToast('Please enter your first and last name.', 'error')
        return
      }
      if (password !== confirmPassword) {
        showToast('Passwords do not match.', 'error')
        return
      }
      if (!agreeTerms) {
        showToast('You must agree to the terms and privacy policy.', 'error')
        return
      }
    }

    setLoading(true)
    try {
      const supabase = createClient()
      if (isSignUp) {
        const { data, error } = await supabase.auth.signUp({
          email,
          password,
          options: {
            emailRedirectTo: `${window.location.origin}/auth/callback`,
            data: { first_name: firstName, last_name: lastName },
          },
        })
        if (error) {
          setFormError(
            error.message.toLowerCase().includes('already registered')
              ? DUPLICATE_EMAIL_MESSAGE
              : error.message,
          )
          return
        }
        // Supabase returns a user with an EMPTY identities array when the email is
        // already registered & confirmed (anti-enumeration). Treat that as a duplicate.
        if (data.user && (data.user.identities?.length ?? 0) === 0) {
          setFormError(DUPLICATE_EMAIL_MESSAGE)
          return
        }
        // Brand-new, already-active account (email confirmation disabled in Supabase) —
        // a session exists immediately, so go straight into onboarding.
        if (data.session) {
          router.push('/onboarding')
          return
        }
        // Otherwise the account is unconfirmed — either a fresh signup or an
        // unconfirmed re-signup (Supabase re-sends the confirmation, identities > 0,
        // email_verified false). Never the dashboard: send them to verify their email.
        router.push(`/verify-email?email=${encodeURIComponent(email)}`)
      } else {
        const { error } = await supabase.auth.signInWithPassword({ email, password })
        if (error) {
          setFormError('Invalid email or password')
          return
        }
        try {
          await api.post('/auth/login', { email, password })
        } catch {
          // Non-blocking — login still works via Supabase
        }
        showToast('Welcome back to Tether!', 'success')
        router.push('/dashboard')
      }
    } catch (err: any) {
      setFormError(err.message || 'Something went wrong. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div
      className="w-full max-w-[485px] md:w-[485px] min-h-[671px] bg-[#FFFFFF] rounded-[16px] p-8 md:p-[48px] flex flex-col justify-between"
      style={{
        boxShadow: '0px 8px 10px -6px rgba(0,0,0,0.1), 0px 20px 25px -5px rgba(0,0,0,0.1)',
      }}
    >
      <div className="space-y-6">
        <div className="text-center space-y-1">
          <h2 className="font-serif font-normal text-[37px] leading-[48px] text-[#111827]">
            {isSignUp ? 'Create your account' : 'Welcome back to Tether'}
          </h2>
          <p className="font-sans font-normal text-sm text-[#4B5563]">
            {isSignUp ? 'Share what matters most' : 'Continue to your account.'}
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          {isSignUp && (
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label className="block font-sans font-medium text-sm leading-[20px] tracking-[-0.15px] text-[#374151]">
                  First Name<span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={firstName}
                  onChange={e => setFirstName(e.target.value)}
                  placeholder="Alan"
                  className="w-full px-4 py-3 bg-white border border-[#D1D5DB] rounded-[10px] text-sm text-[#111827] focus:outline-none focus:border-indigo-600 focus:ring-1 focus:ring-indigo-600 transition-all font-sans h-[50px]"
                />
              </div>
              <div className="space-y-1.5">
                <label className="block font-sans font-medium text-sm leading-[20px] tracking-[-0.15px] text-[#374151]">
                  Last Name<span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={lastName}
                  onChange={e => setLastName(e.target.value)}
                  placeholder="Wally"
                  className="w-full px-4 py-3 bg-white border border-[#D1D5DB] rounded-[10px] text-sm text-[#111827] focus:outline-none focus:border-indigo-600 focus:ring-1 focus:ring-indigo-600 transition-all font-sans h-[50px]"
                />
              </div>
            </div>
          )}

          <div className="space-y-1.5">
            <label className="block font-sans font-medium text-sm leading-[20px] tracking-[-0.15px] text-[#374151]">
              Email address<span className="text-red-500">*</span>
            </label>
            <input
              type="email"
              value={email}
              onChange={e => { setEmail(e.target.value); if (formError) setFormError(null) }}
              placeholder="you@example.com"
              className="w-full px-4 py-3 bg-white border border-[#D1D5DB] rounded-[10px] text-sm text-[#111827] focus:outline-none focus:border-indigo-600 focus:ring-1 focus:ring-indigo-600 transition-all font-sans h-[50px]"
            />
          </div>

          <div className="space-y-1.5">
            <label className="block font-sans font-medium text-sm leading-[20px] tracking-[-0.15px] text-[#374151]">
              Password<span className="text-red-500">*</span>
            </label>
            <div className="relative">
              <input
                type={showPassword ? 'text' : 'password'}
                value={password}
                onChange={e => setPassword(e.target.value)}
                placeholder={isSignUp ? 'Create a strong password' : 'password'}
                className="w-full pl-4 pr-10 py-3 bg-white border border-[#D1D5DB] rounded-[10px] text-sm text-[#111827] focus:outline-none focus:border-indigo-600 focus:ring-1 focus:ring-indigo-600 transition-all font-sans h-[50px]"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3.5 top-1/2 -translate-y-1/2 p-0.5 text-slate-400 hover:text-slate-600 focus:outline-none"
              >
                {showPassword ? <EyeOff className="w-[18px] h-[18px]" /> : <Eye className="w-[18px] h-[18px]" />}
              </button>
            </div>
          </div>

          {isSignUp && (
            <div className="space-y-1.5">
              <label className="block font-sans font-medium text-sm leading-[20px] tracking-[-0.15px] text-[#374151]">
                Confirm password<span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <input
                  type={showConfirmPassword ? 'text' : 'password'}
                  value={confirmPassword}
                  onChange={e => setConfirmPassword(e.target.value)}
                  placeholder="Re-enter your password"
                  className="w-full pl-4 pr-10 py-3 bg-white border border-[#D1D5DB] rounded-[10px] text-sm text-[#111827] focus:outline-none focus:border-indigo-600 focus:ring-1 focus:ring-indigo-600 transition-all font-sans h-[50px]"
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  className="absolute right-3.5 top-1/2 -translate-y-1/2 p-0.5 text-slate-400 hover:text-slate-600 focus:outline-none"
                >
                  {showConfirmPassword ? <EyeOff className="w-[18px] h-[18px]" /> : <Eye className="w-[18px] h-[18px]" />}
                </button>
              </div>
            </div>
          )}

          <div className="flex items-center justify-between text-sm py-1">
            {isSignUp ? (
              <div className="flex items-start gap-2">
                <input
                  type="checkbox"
                  id="agree"
                  checked={agreeTerms}
                  onChange={e => setAgreeTerms(e.target.checked)}
                  className="w-4 h-4 mt-[3px] rounded border-[#D1D5DB] accent-indigo-600 focus:ring-indigo-500"
                />
                <label htmlFor="agree" className="text-xs self-center text-[#6B7280] leading-tight select-none">
                  I agree to the{' '}
                  <a href="#" className="font-medium text-[#4F46E5] hover:underline underline-offset-2">
                    Terms of Service
                  </a>{' '}
                  and{' '}
                  <a href="#" className="font-medium text-[#4F46E5] hover:underline underline-offset-2">
                    Privacy Policy
                  </a>
                </label>
              </div>
            ) : (
              <>
                <div className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    id="remember"
                    className="w-4 h-4 rounded border-[#D1D5DB] accent-indigo-600 focus:ring-indigo-500"
                  />
                  <label htmlFor="remember" className="font-sans text-[13px] text-[#4B5563] select-none leading-[19.5px]">
                    Remember me
                  </label>
                </div>
                <button
                  type="button"
                  onClick={onForgotPassword}
                  className="font-sans font-medium text-[13px] leading-[19.5px] text-[#4F46E5] hover:text-[#4338CA] transition-colors cursor-pointer"
                >
                  Forgot password?
                </button>
              </>
            )}
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full h-[48px] bg-[#4F46E5] hover:bg-[#4338CA] text-white font-sans font-medium text-sm rounded-[10px] transition-all flex items-center justify-center gap-2 shadow-sm hover:shadow-md cursor-pointer disabled:bg-indigo-400 mt-2"
          >
            {loading ? (
              <svg className="animate-spin h-5 w-5 text-white" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
              </svg>
            ) : (
              <>
                <span>{isSignUp ? 'Continue' : 'Sign in'}</span>
                <span className="text-base font-bold">→</span>
              </>
            )}
          </button>

          {formError && (
            <div
              role="alert"
              className="text-center"
              style={{
                color: '#DC2626',
                fontFamily: 'Inter, sans-serif',
                fontSize: 14,
                lineHeight: '20px',
              }}
            >
              {formError}
              {formError.includes('already exists') && (
                <>
                  {' '}
                  <Link
                    href="/signin"
                    className="hover:opacity-80"
                    style={{ textDecoration: 'underline', fontWeight: 500, color: '#DC2626' }}
                  >
                    Sign in instead
                  </Link>
                </>
              )}
            </div>
          )}
        </form>
      </div>

      <div className="space-y-4 pt-4">
        <div className="relative flex items-center justify-center">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t border-[#E5E7EB]"></div>
          </div>
          <span className="relative px-3 bg-white text-xs font-sans text-[#9CA3AF] uppercase">Or</span>
        </div>

        <div className="space-y-2.5">
          {!isSignUp && (
            <button
              type="button"
              onClick={onMagicLink}
              className="w-full h-[48px] bg-[#FFFFFF] border-[1.25px] border-[#D1D5DB] hover:bg-[#F9FAFB] rounded-[10px] transition-all flex items-center justify-center text-sm font-sans font-medium text-[#374151] cursor-pointer"
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src="/register/magicIcon.png" alt="Magic Icon" className="w-[18px] h-[18px] mr-2 select-none" />
              <span>Sign in with Magic Link</span>
            </button>
          )}

          <button
            type="button"
            onClick={async () => {
              try {
                const supabase = createClient()
                const { error } = await supabase.auth.signInWithOAuth({
                  provider: 'google',
                  options: { redirectTo: `${window.location.origin}/auth/callback` },
                })
                if (error) showToast(error.message, 'error')
              } catch {
                showToast('Failed to connect to Google', 'error')
              }
            }}
            className="w-full h-[48px] bg-[#FFFFFF] border-[1.25px] border-[#D1D5DB] hover:bg-[#F9FAFB] rounded-[10px] transition-all flex items-center justify-center text-sm font-sans font-medium text-[#374151] cursor-pointer"
          >
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src="/register/google.png" alt="Google Icon" className="w-[18px] h-[18px] mr-2 select-none" />
            <span>Continue with Google</span>
          </button>
        </div>

        <div className="text-center text-sm font-sans text-[#4B5563] pt-2">
          {isSignUp ? 'Already have an account? ' : "Don't have an account? "}
          <button
            type="button"
            onClick={onToggleMode}
            className="font-semibold text-[#4F46E5] cursor-pointer hover:text-[#4338CA] hover:underline"
          >
            {isSignUp ? 'Sign in' : 'Sign up'}
          </button>
        </div>
      </div>
    </div>
  )
}

/* ──────────────────────────────────────────────────────────── */
/*  MAGIC LINK FORM                                              */
/* ──────────────────────────────────────────────────────────── */
function MagicLinkForm({
  onBack,
  onSent,
}: {
  onBack: () => void
  onSent: (email: string) => void
}) {
  const { showToast } = useToast()
  const [email, setEmail] = useState('')
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!email) {
      showToast('Please enter your email address.', 'error')
      return
    }
    setLoading(true)
    try {
      const supabase = createClient()
      const { error } = await supabase.auth.signInWithOtp({
        email,
        options: {
          emailRedirectTo: `${window.location.origin}/auth/callback`,
          shouldCreateUser: false,
        },
      })
      if (error) {
        showToast(error.message, 'error')
        return
      }
      onSent(email)
    } catch (err: any) {
      showToast(err.message || 'Failed to send magic link', 'error')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div
      className="w-full max-w-[448px] md:w-[448px] bg-[#FFFFFF] rounded-[16px] flex flex-col"
      style={{
        padding: '40px',
        gap: '24px',
        boxShadow: '0px 8px 5px 0px rgba(0,0,0,0.10), 0px 20px 12.5px 0px rgba(0,0,0,0.10)',
      }}
    >
      {/* Back link */}
      <button
        type="button"
        onClick={onBack}
        className="flex items-center gap-1.5 w-fit cursor-pointer hover:opacity-80 transition-opacity"
        style={{
          fontFamily: 'Inter, sans-serif',
          fontWeight: 500,
          fontSize: '14px',
          lineHeight: '20px',
          color: '#6A7282',
        }}
      >
        <FiArrowLeft className="w-4 h-4" />
        <span>Back to sign in</span>
      </button>

      {/* Sparkles icon — 56×56 */}
      <div
        className="mx-auto flex items-center justify-center"
        style={{
          width: '56px',
          height: '56px',
          borderRadius: '16px',
          backgroundColor: '#EEF2FF',
        }}
      >
        <HiOutlineSparkles style={{ width: '26px', height: '26px', color: '#4F46E5' }} />
      </div>

      {/* Heading + subtext */}
      <div className="text-center space-y-2">
        <h2
          style={{
            fontFamily: '"Instrument Serif", Georgia, serif',
            fontWeight: 400,
            fontSize: '32px',
            lineHeight: '40px',
            color: '#111827',
            margin: 0,
          }}
        >
          Sign in with Magic Link
        </h2>
        <p
          style={{
            fontFamily: 'Inter, sans-serif',
            fontWeight: 400,
            fontSize: '14px',
            lineHeight: '22.75px',
            color: '#4A5565',
            margin: 0,
          }}
        >
          We&apos;ll send a secure, passwordless sign-in link straight to your inbox.
        </p>
      </div>

      {/* Form */}
      <form onSubmit={handleSubmit} className="flex flex-col" style={{ gap: '16px' }}>
        <div className="space-y-1.5">
          <label className="block font-sans font-medium text-sm leading-[20px] tracking-[-0.15px] text-[#374151]">
            Email address<span className="text-red-500">*</span>
          </label>
          <input
            type="email"
            value={email}
            onChange={e => setEmail(e.target.value)}
            placeholder="you@example.com"
            className="w-full px-4 py-3 bg-white border border-[#D1D5DB] rounded-[10px] text-sm text-[#111827] focus:outline-none focus:border-indigo-600 focus:ring-1 focus:ring-indigo-600 transition-all font-sans h-[50px]"
          />
        </div>

        <button
          type="submit"
          disabled={loading}
          className="w-full bg-[#4F46E5] hover:bg-[#4338CA] text-white font-sans font-medium text-sm rounded-[10px] transition-all flex items-center justify-center gap-2 cursor-pointer disabled:bg-indigo-400"
          style={{ height: '48px' }}
        >
          {loading ? (
            <svg className="animate-spin h-5 w-5 text-white" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
            </svg>
          ) : (
            <>
              <span>Send Magic Link</span>
              <span className="text-base">→</span>
            </>
          )}
        </button>
      </form>

      <p
        className="text-center"
        style={{
          fontFamily: 'Inter, sans-serif',
          fontWeight: 400,
          fontSize: '12px',
          lineHeight: '19.5px',
          color: '#6A7282',
          margin: 0,
        }}
      >
        The link expires in 15 minutes and can only be used once.
      </p>
    </div>
  )
}

/* ──────────────────────────────────────────────────────────── */
/*  CHECK YOUR INBOX VIEW                                        */
/* ──────────────────────────────────────────────────────────── */
function InboxView({
  onBack,
  onResend,
  subtitle = 'We sent you a magic sign-in link. Tap it on any device to log in instantly — no password needed.',
  steps = [
    'Open the email from Tether',
    'Click the "Sign in" button',
    "You'll be signed in automatically",
  ],
  resendToastMessage = 'Magic link resent. Check your inbox.',
}: {
  onBack: () => void
  /** Performs the actual resend. Should throw on failure. */
  onResend?: () => Promise<void>
  subtitle?: string
  steps?: string[]
  resendToastMessage?: string
}) {
  const { showToast } = useToast()
  const [resending, setResending] = useState(false)

  const handleResend = async () => {
    if (!onResend) {
      showToast(resendToastMessage, 'success')
      return
    }
    setResending(true)
    try {
      await onResend()
      showToast(resendToastMessage, 'success')
    } catch (err) {
      showToast(
        err instanceof Error ? err.message : 'Failed to resend. Please try again.',
        'error',
      )
    } finally {
      setResending(false)
    }
  }

  const STEPS = steps

  return (
    <div
      className="w-full max-w-[448px] md:w-[448px] bg-[#FFFFFF] rounded-[16px]"
      style={{
        padding: '47.96px 39.5px',
        boxShadow: '0px 8px 5px 0px rgba(0,0,0,0.10), 0px 20px 12.5px 0px rgba(0,0,0,0.10)',
      }}
    >
      <div className="flex flex-col items-center" style={{ gap: '30px' }}>

        {/* 80×80 success icon */}
        <div className="flex items-center justify-center" style={{ width: '80px', height: '80px' }}>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src="/sendSuccess.png" alt="Sent successfully" className="w-full h-full object-contain" />
        </div>

        {/* Heading */}
        <div className="text-center" style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
          <h2
            style={{
              fontFamily: '"Instrument Serif", Georgia, serif',
              fontWeight: 400,
              fontSize: '32px',
              lineHeight: '40px',
              color: '#111827',
              margin: 0,
            }}
          >
            Check your inbox
          </h2>
          <p
            style={{
              fontFamily: 'Inter, sans-serif',
              fontWeight: 400,
              fontSize: '14px',
              lineHeight: '22.75px',
              color: '#4A5565',
              margin: 0,
            }}
          >
            {subtitle}
          </p>
        </div>

        {/* Ordered list */}
        <ol
          className="w-full list-none m-0"
          style={{
            padding: '20px',
            borderRadius: '14px',
            backgroundColor: '#F9FAFB',
            display: 'flex',
            flexDirection: 'column',
            gap: '12px',
          }}
        >
          {STEPS.map((step, i) => (
            <li key={i} className="flex items-start" style={{ gap: '12px' }}>
              {/* Number circle: 20×20 */}
              <span
                className="flex items-center justify-center flex-shrink-0"
                style={{
                  width: '20px',
                  height: '20px',
                  borderRadius: '999px',
                  backgroundColor: 'rgba(79, 70, 229, 0.1)',
                  marginTop: '2px',
                }}
              >
                <span
                  style={{
                    fontFamily: 'Inter, sans-serif',
                    fontWeight: 600,
                    fontSize: '12px',
                    lineHeight: '16px',
                    color: '#4F46E5',
                  }}
                >
                  {i + 1}
                </span>
              </span>
              <span
                style={{
                  fontFamily: 'Inter, sans-serif',
                  fontWeight: 400,
                  fontSize: '14px',
                  lineHeight: '22.75px',
                  color: '#364153',
                }}
              >
                {step}
              </span>
            </li>
          ))}
        </ol>

        {/* Resend + back */}
        <div className="text-center w-full">
          <p
            style={{
              fontFamily: 'Inter, sans-serif',
              margin: 0,
              fontSize: '12px',
              lineHeight: '24px',
              color: '#6A7282',
            }}
          >
            Didn&apos;t receive it?{' '}
            <button
              type="button"
              onClick={handleResend}
              disabled={resending}
              className="hover:underline cursor-pointer disabled:opacity-50"
              style={{
                fontFamily: 'Inter, sans-serif',
                fontWeight: 500,
                fontSize: '15px',
                lineHeight: '24px',
                color: '#4F46E5',
              }}
            >
              {resending ? 'Sending…' : 'Resend email'}
            </button>
          </p>
        </div>

        <button
          type="button"
          onClick={onBack}
          className="hover:opacity-80 cursor-pointer transition-opacity"
          style={{
            fontFamily: 'Inter, sans-serif',
            fontWeight: 500,
            fontSize: '14px',
            lineHeight: '20px',
            color: '#4A5565',
          }}
        >
          Back to sign in
        </button>
      </div>
    </div>
  )
}

/* ──────────────────────────────────────────────────────────── */
/*  FORGOT PASSWORD FORM                                         */
/* ──────────────────────────────────────────────────────────── */
function ForgotPasswordForm({
  onBack,
  onSent,
}: {
  onBack: () => void
  onSent: (email: string) => void
}) {
  const { showToast } = useToast()
  const [email, setEmail] = useState('')
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!email) {
      showToast('Please enter your email address.', 'error')
      return
    }
    setLoading(true)
    try {
      const supabase = createClient()
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/auth/callback`,
      })
      if (error) {
        showToast(error.message, 'error')
        return
      }
      onSent(email)
    } catch (err: any) {
      showToast(err.message || 'Failed to send reset email', 'error')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div
      className="w-full max-w-[448px] md:w-[448px] bg-[#FFFFFF] rounded-[16px] flex flex-col"
      style={{
        padding: '40px',
        gap: '24px',
        boxShadow: '0px 8px 5px 0px rgba(0,0,0,0.10), 0px 20px 12.5px 0px rgba(0,0,0,0.10)',
      }}
    >
      {/* Back link */}
      <button
        type="button"
        onClick={onBack}
        className="flex items-center gap-1.5 w-fit cursor-pointer hover:opacity-80 transition-opacity"
        style={{
          fontFamily: 'Inter, sans-serif',
          fontWeight: 500,
          fontSize: '14px',
          lineHeight: '20px',
          color: '#6A7282',
        }}
      >
        <FiArrowLeft className="w-4 h-4" />
        <span>Back to sign in</span>
      </button>

      {/* Padlock icon — 56×56 */}
      <div
        className="mx-auto flex items-center justify-center"
        style={{
          width: '56px',
          height: '56px',
          borderRadius: '16px',
          backgroundColor: '#EEF2FF',
        }}
      >
        <FiLock style={{ width: '24px', height: '24px', color: '#4F46E5' }} />
      </div>

      {/* Heading + subtext */}
      <div className="text-center space-y-2">
        <h2
          style={{
            fontFamily: '"Instrument Serif", Georgia, serif',
            fontWeight: 400,
            fontSize: '32px',
            lineHeight: '40px',
            color: '#111827',
            margin: 0,
          }}
        >
          Forgot your password?
        </h2>
        <p
          style={{
            fontFamily: 'Inter, sans-serif',
            fontWeight: 400,
            fontSize: '14px',
            lineHeight: '22.75px',
            color: '#4A5565',
            margin: 0,
          }}
        >
          No worries — enter your email and we&apos;ll send you a reset link right away.
        </p>
      </div>

      {/* Form */}
      <form onSubmit={handleSubmit} className="flex flex-col" style={{ gap: '16px' }}>
        <div className="space-y-1.5">
          <label className="block font-sans font-medium text-sm leading-[20px] tracking-[-0.15px] text-[#374151]">
            Email address<span className="text-red-500">*</span>
          </label>
          <input
            type="email"
            value={email}
            onChange={e => setEmail(e.target.value)}
            placeholder="you@example.com"
            className="w-full px-4 py-3 bg-white border border-[#D1D5DB] rounded-[10px] text-sm text-[#111827] focus:outline-none focus:border-indigo-600 focus:ring-1 focus:ring-indigo-600 transition-all font-sans h-[50px]"
          />
        </div>

        <button
          type="submit"
          disabled={loading}
          className="w-full bg-[#4F46E5] hover:bg-[#4338CA] text-white rounded-[10px] transition-all flex items-center justify-center gap-2 cursor-pointer disabled:bg-indigo-400"
          style={{
            height: '48px',
            fontFamily: 'Inter, sans-serif',
            fontWeight: 500,
            fontSize: '16px',
            lineHeight: '24px',
            color: '#FFFFFF',
          }}
        >
          {loading ? (
            <svg className="animate-spin h-5 w-5 text-white" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
            </svg>
          ) : (
            <>
              <span>Send Reset Link</span>
              <span className="text-base">→</span>
            </>
          )}
        </button>
      </form>

      <p
        className="text-center"
        style={{
          fontFamily: 'Inter, sans-serif',
          fontWeight: 400,
          fontSize: '12px',
          lineHeight: '19.5px',
          color: '#6A7282',
          margin: 0,
        }}
      >
        The reset link expires in 30 minutes. Check your spam folder if you don&apos;t see it.
      </p>
    </div>
  )
}

/* ──────────────────────────────────────────────────────────── */
/*  PAGE COMPONENT — validates dynamic [mode] and dispatches    */
/* ──────────────────────────────────────────────────────────── */
export default function AuthModePage({
  params,
}: {
  params: Promise<{ mode: string }>
}) {
  const { mode } = use(params)
  const router = useRouter()

  if (!VALID_MODES.includes(mode as Mode)) {
    notFound()
  }

  const isSignUp = mode === 'signup'
  const [view, setView] = useState<View>('main')
  // Email captured from the magic-link / reset forms, so the inbox view can
  // resend to the same address.
  const [flowEmail, setFlowEmail] = useState('')

  // Reset to main view if the route changes (e.g. signup → signin)
  React.useEffect(() => {
    setView('main')
  }, [mode])

  const handleToggleMode = () => {
    router.push(isSignUp ? '/signin' : '/signup')
  }

  const resendMagicLink = async () => {
    const supabase = createClient()
    const { error } = await supabase.auth.signInWithOtp({
      email: flowEmail,
      options: {
        emailRedirectTo: `${window.location.origin}/auth/callback`,
        shouldCreateUser: false,
      },
    })
    if (error) throw new Error(error.message)
  }

  const resendResetLink = async () => {
    const supabase = createClient()
    const { error } = await supabase.auth.resetPasswordForEmail(flowEmail, {
      redirectTo: `${window.location.origin}/auth/callback`,
    })
    if (error) throw new Error(error.message)
  }

  return (
    <AuthLayout>
      {view === 'main' && (
        <MainAuthForm
          isSignUp={isSignUp}
          onMagicLink={() => setView('magic-link')}
          onForgotPassword={() => setView('forgot-password')}
          onToggleMode={handleToggleMode}
        />
      )}
      {view === 'magic-link' && (
        <MagicLinkForm
          onBack={() => setView('main')}
          onSent={(email) => { setFlowEmail(email); setView('inbox') }}
        />
      )}
      {view === 'inbox' && (
        <InboxView onBack={() => setView('main')} onResend={resendMagicLink} />
      )}
      {view === 'forgot-password' && (
        <ForgotPasswordForm
          onBack={() => setView('main')}
          onSent={(email) => { setFlowEmail(email); setView('forgot-password-sent') }}
        />
      )}
      {view === 'forgot-password-sent' && (
        <InboxView
          onBack={() => setView('main')}
          onResend={resendResetLink}
          subtitle="We sent a password reset link to your email address. Follow the instructions to create a new password."
          steps={[
            'Open the email from Tether',
            'Click the "Reset Password" button',
            'Create your new password',
          ]}
          resendToastMessage="Password reset link resent. Check your inbox."
        />
      )}
    </AuthLayout>
  )
}
