'use client'

import * as Sentry from '@sentry/nextjs'
import { useEffect } from 'react'

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  useEffect(() => {
    Sentry.captureException(error)
  }, [error])

  return (
    <html>
      <body>
        <div className="min-h-screen flex flex-col items-center justify-center px-4">
          <h2 className="text-xl font-semibold text-[#1E293B] mb-2">Something went wrong</h2>
          <p className="text-sm text-[#64748B] mb-6">We have been notified and are working on a fix.</p>
          <button
            onClick={reset}
            className="px-4 py-2 bg-[#4338CA] text-white text-sm font-medium rounded-lg hover:bg-[#3730A3] transition-colors"
          >
            Try again
          </button>
        </div>
      </body>
    </html>
  )
}
