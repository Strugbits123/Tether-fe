'use client'

import { Suspense, useEffect } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'

function RedirectInner() {
  const router = useRouter()
  const searchParams = useSearchParams()

  useEffect(() => {
    const qs = searchParams.toString()
    router.replace(qs ? `/signup?${qs}` : '/signup')
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  return null
}

// Bridges the backend's invitation redirectUrl format
// ({frontend}/auth/signup?invite_token=...) to this app's actual signup
// route (/signup), preserving every query param along the way.
export default function AuthSignupRedirectPage() {
  return (
    <Suspense fallback={null}>
      <RedirectInner />
    </Suspense>
  )
}
