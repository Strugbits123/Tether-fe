'use client'

import Button from '@/components/ui/Button'
import { createClient } from '@/lib/supabase/client'
import { Mail } from 'lucide-react'
import Link from 'next/link'
import { useSearchParams } from 'next/navigation'
import { Suspense, useState } from 'react'

function VerifyEmailContent() {
  const searchParams = useSearchParams()
  const email = searchParams.get('email') || ''
  const [resending, setResending] = useState(false)
  const [resent, setResent] = useState(false)
  const supabase = createClient()

  const handleResend = async () => {
    if (!email) return
    setResending(true)
    await supabase.auth.resend({ type: 'signup', email })
    setResending(false)
    setResent(true)
  }

  return (
    <div className="w-full max-w-md">
      <div className="text-center mb-6">
        <div className="text-[#4338CA] font-bold text-2xl mb-1">Tether</div>
        <p className="text-sm text-[#64748B]">Your digital legacy, protected.</p>
      </div>

      <div className="bg-white rounded-xl shadow-sm p-8 text-center">
        <div className="w-14 h-14 bg-indigo-50 rounded-full flex items-center justify-center mx-auto mb-5">
          <Mail className="w-7 h-7 text-[#4338CA]" />
        </div>
        <h1 className="text-2xl font-bold text-[#1E293B] mb-2">Check your inbox</h1>
        <p className="text-sm text-[#64748B] mb-6">
          We sent a verification link to <strong className="text-[#1E293B]">{email || 'your email'}</strong>.
          Click the link to activate your account.
        </p>

        {resent ? (
          <p className="text-sm text-[#16A34A] mb-4">Verification email resent!</p>
        ) : (
          <Button
            variant="secondary"
            loading={resending}
            onClick={handleResend}
            disabled={!email}
            className="mb-4"
          >
            Didn&apos;t receive it? Resend
          </Button>
        )}

        <div className="mt-2">
          <Link href="/login" className="text-sm text-[#4338CA] hover:underline">
            Back to sign in
          </Link>
        </div>
      </div>
    </div>
  )
}

export default function VerifyEmailPage() {
  return (
    <Suspense>
      <VerifyEmailContent />
    </Suspense>
  )
}
