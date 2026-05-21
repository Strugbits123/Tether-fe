'use client'

import Button from '@/components/ui/Button'
import Input from '@/components/ui/Input'
import { createClient } from '@/lib/supabase/client'
import Link from 'next/link'
import { useState } from 'react'

export default function ResetPasswordPage() {
  const [email, setEmail] = useState('')
  const [loading, setLoading] = useState(false)
  const [submitted, setSubmitted] = useState(false)
  const supabase = createClient()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: window.location.origin + '/auth/callback',
    })

    setLoading(false)
    setSubmitted(true)
  }

  return (
    <div className="w-full max-w-md">
      <div className="text-center mb-6">
        <div className="text-[#4338CA] font-bold text-2xl mb-1">Tether</div>
        <p className="text-sm text-[#64748B]">Your digital legacy, protected.</p>
      </div>

      <div className="bg-white rounded-xl shadow-sm p-8">
        {submitted ? (
          <div className="text-center">
            <div className="w-12 h-12 bg-indigo-50 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg className="w-6 h-6 text-[#4338CA]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
            </div>
            <h2 className="text-xl font-semibold text-[#1E293B] mb-2">Check your inbox</h2>
            <p className="text-sm text-[#64748B] mb-6">
              If an account exists for that email, we&apos;ve sent a password reset link.
            </p>
            <Link href="/login" className="text-sm text-[#4338CA] hover:underline">
              Back to sign in
            </Link>
          </div>
        ) : (
          <>
            <h1 className="text-2xl font-bold text-[#1E293B] mb-2">Reset your password</h1>
            <p className="text-sm text-[#64748B] mb-6">
              Enter your email and we&apos;ll send you a reset link.
            </p>

            <form onSubmit={handleSubmit} className="space-y-4">
              <Input
                label="Email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@example.com"
                required
                autoComplete="email"
              />

              <Button type="submit" variant="primary" loading={loading} className="w-full">
                Send reset link
              </Button>
            </form>

            <p className="mt-4 text-sm text-center text-[#64748B]">
              <Link href="/login" className="text-[#4338CA] hover:underline">
                Back to sign in
              </Link>
            </p>
          </>
        )}
      </div>
    </div>
  )
}
