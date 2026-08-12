import type { Metadata } from 'next'
import { Inter, Instrument_Serif } from 'next/font/google'
import { Suspense } from 'react'
import './globals.css'
import { ToastProvider } from '@/lib/context/ToastContext'
import { AuthProvider } from '@/lib/context/AuthContext'
import PostHogProvider from '@/lib/posthog/PostHogProvider'
import PostHogPageView from '@/lib/posthog/PostHogPageView'
import SessionReplayController from '@/lib/posthog/SessionReplayController'
import LoginEventTracker from '@/lib/posthog/LoginEventTracker'

const inter = Inter({
  subsets: ['latin'],
  variable: '--font-inter',
})

const instrumentSerif = Instrument_Serif({
  subsets: ['latin'],
  weight: ['400'],
  style: ['normal', 'italic'],
  variable: '--font-instrument-serif',
})

export const metadata: Metadata = {
  title: 'Tether — Your digital legacy, protected.',
  description: 'Record video/audio messages, upload documents, and ensure your legacy reaches the people you love.',
  // Declared explicitly because the icon lives in public/ rather than as an
  // app-directory `icon.png`. Next.js only auto-injects icon links for the
  // file-convention path (src/app/icon.*), so a public/ asset needs this to be
  // referenced at all. The stale default src/app/favicon.ico was removed —
  // while it existed it kept answering /favicon.ico with the Next.js logo
  // regardless of what was declared here.
  icons: {
    icon: '/icon.png',
    shortcut: '/icon.png',
    apple: '/icon.png',
  },
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" className={`${inter.variable} ${instrumentSerif.variable} h-full antialiased`} suppressHydrationWarning>
      <body className="min-h-full font-sans bg-slate-50 text-slate-900 antialiased" suppressHydrationWarning>
        <PostHogProvider>
          <Suspense fallback={null}>
            <PostHogPageView />
          </Suspense>
          <Suspense fallback={null}>
            <LoginEventTracker />
          </Suspense>
          <SessionReplayController />
          <ToastProvider>
            <AuthProvider>
              {children}
            </AuthProvider>
          </ToastProvider>
        </PostHogProvider>
      </body>
    </html>
  )
}
