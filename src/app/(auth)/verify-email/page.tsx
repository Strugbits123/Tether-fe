'use client'

import React, { useState, Suspense } from 'react'
import Link from 'next/link'
import { useSearchParams, useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { useToast } from '@/lib/context/ToastContext'

function VerifyEmailContent() {
  const searchParams = useSearchParams()
  const email = searchParams.get('email') ?? ''
  const router = useRouter()
  const { showToast } = useToast()
  const [loading, setLoading] = useState(false)

  const handleResend = async () => {
    if (!email) {
      showToast('Email address not found. Please sign up again.', 'error')
      return
    }

    setLoading(true)
    try {
      const supabase = createClient()
      const { error } = await supabase.auth.resend({
        type: 'signup',
        email,
        options: {
          emailRedirectTo: `${window.location.origin}/auth/callback`,
        },
      })

      if (error) {
        showToast(error.message, 'error')
        return
      }

      showToast('Verification email resent. Check your inbox.', 'success')
    } catch {
      showToast('Failed to resend. Please try again.', 'error')
    } finally {
      setLoading(false)
    }
  }

  const STEPS = [
    'Open the email from Tether',
    'Click the "Verify Email" button',
    "You'll be redirected to complete setup",
  ]

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

        {/* Card */}
        <div
          className="w-full max-w-[448px] md:w-[448px] bg-[#FFFFFF] rounded-[16px]"
          style={{
            padding: '47.96px 39.5px',
            boxShadow: '0px 8px 5px 0px rgba(0,0,0,0.10), 0px 20px 12.5px 0px rgba(0,0,0,0.10)',
          }}
        >
          <div className="flex flex-col items-center" style={{ gap: '30px' }}>
            {/* Success icon */}
            <div className="flex items-center justify-center" style={{ width: '80px', height: '80px' }}>
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src="/sendSuccess.png" alt="Email sent" className="w-full h-full object-contain" />
            </div>

            {/* Heading + subtext */}
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
                We sent a verification link to{' '}
                {email
                  ? <strong style={{ color: '#111827' }}>{email}</strong>
                  : 'your email address'
                }
                . Click it to activate your account.
              </p>
            </div>

            {/* Steps */}
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

            {/* Resend */}
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
                  disabled={loading}
                  className="hover:underline cursor-pointer disabled:opacity-50"
                  style={{
                    fontFamily: 'Inter, sans-serif',
                    fontWeight: 500,
                    fontSize: '15px',
                    lineHeight: '24px',
                    color: '#4F46E5',
                  }}
                >
                  {loading ? 'Sending…' : 'Resend email'}
                </button>
              </p>
            </div>

            <Link
              href="/signin"
              className="hover:opacity-80 transition-opacity"
              style={{
                fontFamily: 'Inter, sans-serif',
                fontWeight: 500,
                fontSize: '14px',
                lineHeight: '20px',
                color: '#4A5565',
              }}
            >
              Back to sign in
            </Link>
          </div>
        </div>

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

export default function VerifyEmailPage() {
  return (
    <Suspense fallback={null}>
      <VerifyEmailContent />
    </Suspense>
  )
}
