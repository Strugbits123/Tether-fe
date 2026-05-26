// REMOVE AFTER SENTRY VERIFICATION
'use client'

export default function SentryTestPage() {
  return (
    <button
      onClick={() => {
        throw new Error('Sentry frontend test error from Tether')
      }}
      className="px-4 py-2 bg-red-600 text-white rounded-lg m-8"
    >
      Trigger Sentry Test Error
    </button>
  )
}
