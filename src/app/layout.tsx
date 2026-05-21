import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'
import { ToastProvider } from '@/lib/context/ToastContext'

const inter = Inter({
  subsets: ['latin'],
  variable: '--font-inter',
})

export const metadata: Metadata = {
  title: 'Tether — Your digital legacy, protected.',
  description: 'Record video/audio messages, upload documents, and ensure your legacy reaches the people you love.',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" className={`${inter.variable} h-full antialiased`}>
      <body className="min-h-full font-[family-name:var(--font-inter)] bg-[#F1F5F9] text-[#1E293B]">
        <ToastProvider>
          {children}
        </ToastProvider>
      </body>
    </html>
  )
}
