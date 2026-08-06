'use client'

import { useCallback, useEffect, useState } from 'react'
import Link from 'next/link'
import { Check, Lock, Loader2 } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import { useToast } from '@/lib/context/ToastContext'
import { ApiError } from '@/lib/api/client'
import {
  getDownloadSummary,
  prepareDownload,
  type DownloadSummary,
  type PrepareDownloadSelection,
} from '@/lib/api/rm'

async function getToken(): Promise<string | null> {
  const supabase = createClient()
  const {
    data: { session },
  } = await supabase.auth.getSession()
  return session?.access_token ?? null
}

type CategoryKey = keyof PrepareDownloadSelection

interface CategoryDef {
  key: CategoryKey
  label: string
  unit: (count: number) => string
}

const CATEGORIES: CategoryDef[] = [
  { key: 'audio', label: 'Audio messages', unit: (n) => `${n} file${n === 1 ? '' : 's'}` },
  { key: 'documents', label: 'Documents', unit: (n) => `${n} file${n === 1 ? '' : 's'}` },
  { key: 'photos', label: 'Photos', unit: (n) => `${n} file${n === 1 ? '' : 's'}` },
  { key: 'transcripts', label: 'Transcripts as PDF', unit: (n) => `${n} file${n === 1 ? '' : 's'}` },
  { key: 'life_story', label: 'Life story as PDF', unit: (n) => `${n} chapter${n === 1 ? '' : 's'}` },
]

const SUMMARY_KEY: Record<CategoryKey, keyof DownloadSummary> = {
  audio: 'audio_messages',
  documents: 'documents',
  photos: 'photos',
  transcripts: 'transcripts',
  life_story: 'life_story',
}

export default function RmDownloadsPage() {
  const { showToast } = useToast()
  const [summary, setSummary] = useState<DownloadSummary | null>(null)
  const [loading, setLoading] = useState(true)
  const [blockedMessage, setBlockedMessage] = useState<string | null>(null)
  const [selection, setSelection] = useState<Record<CategoryKey, boolean>>({
    audio: true,
    documents: true,
    photos: true,
    transcripts: true,
    life_story: true,
  })
  const [preparing, setPreparing] = useState(false)

  const load = useCallback(async () => {
    setLoading(true)
    setBlockedMessage(null)
    const token = await getToken()
    if (!token) {
      setLoading(false)
      return
    }
    try {
      const data = await getDownloadSummary(token)
      setSummary(data)
    } catch (e) {
      if (e instanceof ApiError && e.statusCode === 403) {
        setBlockedMessage(e.message)
      } else {
        showToast(e instanceof ApiError ? e.message : 'Failed to load your download options.', 'error')
      }
    } finally {
      setLoading(false)
    }
  }, [showToast])

  // Data-fetch-on-mount. The setState calls inside load() run after an await
  // (never synchronously in the effect body), so the cascading-render the rule
  // guards against doesn't apply here.
  /* eslint-disable react-hooks/set-state-in-effect */
  useEffect(() => {
    load()
  }, [load])
  /* eslint-enable react-hooks/set-state-in-effect */

  const toggle = (key: CategoryKey) => setSelection((prev) => ({ ...prev, [key]: !prev[key] }))

  const anySelected = Object.values(selection).some(Boolean)

  const handlePrepare = async () => {
    const token = await getToken()
    if (!token) return
    setPreparing(true)
    try {
      await prepareDownload(token, selection)
      showToast('Your download is ready.', 'success')
    } catch (e) {
      showToast(e instanceof Error ? e.message : 'Failed to prepare your download.', 'error')
    } finally {
      setPreparing(false)
    }
  }

  return (
    <div className="w-full max-w-[720px] mx-auto flex flex-col gap-6 p-6 sm:p-8">
      {/* Header */}
      <div className="flex flex-col gap-2">
        <h1
          style={{
            fontFamily: '"Instrument Serif", serif',
            fontWeight: 400,
            fontSize: 32,
            lineHeight: '40px',
            color: '#101828',
          }}
        >
          Download Everything
        </h1>
        <p
          style={{
            fontFamily: 'Inter, sans-serif',
            fontWeight: 400,
            fontSize: 15,
            lineHeight: '22px',
            color: '#6A7282',
          }}
        >
          Everything assigned for delivery — messages, documents, and photos — packaged as a ZIP
          file. Audio messages are included. Video messages are not downloadable but will always
          be available in the recipient portal.
        </p>
      </div>

      {loading ? (
        <div
          className="animate-pulse"
          style={{ height: 340, borderRadius: 16, border: '1.25px solid #E5E7EB', background: '#FFFFFF' }}
        />
      ) : blockedMessage ? (
        <div
          className="flex flex-col items-center text-center"
          style={{ borderRadius: 16, border: '1.25px solid #E5E7EB', background: '#FFFFFF', padding: 48, gap: 12 }}
        >
          <span
            className="flex items-center justify-center"
            style={{ width: 48, height: 48, borderRadius: 9999, background: '#F3F4F6' }}
          >
            <Lock className="w-5 h-5 text-[#6A7282]" strokeWidth={2} />
          </span>
          <p style={{ fontFamily: 'Inter, sans-serif', fontWeight: 500, fontSize: 15, color: '#101828' }}>
            Content isn&apos;t available yet
          </p>
          <p style={{ fontFamily: 'Inter, sans-serif', fontSize: 14, color: '#6A7282', maxWidth: 420 }}>
            {blockedMessage}
          </p>
        </div>
      ) : (
        <>
          {/* Select what to include */}
          <div
            style={{
              borderRadius: 16,
              border: '1.25px solid #E5E7EB',
              background: '#FFFFFF',
              padding: 24,
            }}
          >
            <p
              className="mb-4"
              style={{ fontFamily: 'Inter, sans-serif', fontWeight: 600, fontSize: 15, color: '#101828' }}
            >
              Select what to include
            </p>

            <div className="flex flex-col" style={{ gap: 4 }}>
              {CATEGORIES.map((cat) => {
                const count = summary?.[SUMMARY_KEY[cat.key]]?.count ?? 0
                const checked = selection[cat.key]
                const disabled = count === 0
                return (
                  <button
                    key={cat.key}
                    type="button"
                    onClick={() => !disabled && toggle(cat.key)}
                    disabled={disabled}
                    className="flex items-center gap-3 w-full text-left cursor-pointer disabled:cursor-not-allowed"
                    style={{ padding: '10px 4px', borderRadius: 8 }}
                  >
                    <span
                      className="flex items-center justify-center flex-shrink-0"
                      style={{
                        width: 18,
                        height: 18,
                        borderRadius: 4,
                        border: checked && !disabled ? 'none' : '1.5px solid #D1D5DB',
                        background: checked && !disabled ? '#4F46E5' : '#FFFFFF',
                      }}
                    >
                      {checked && !disabled && <Check className="w-3 h-3 text-white" strokeWidth={3} />}
                    </span>
                    <span className="flex flex-col">
                      <span
                        style={{
                          fontFamily: 'Inter, sans-serif',
                          fontWeight: 500,
                          fontSize: 14,
                          color: disabled ? '#9CA3AF' : '#101828',
                        }}
                      >
                        {cat.label}
                      </span>
                      <span style={{ fontFamily: 'Inter, sans-serif', fontSize: 13, color: '#9CA3AF' }}>
                        {cat.unit(count)}
                      </span>
                    </span>
                  </button>
                )
              })}
            </div>

            <button
              type="button"
              onClick={handlePrepare}
              disabled={preparing || !anySelected}
              className="flex items-center justify-center gap-2 w-full mt-5 cursor-pointer hover:opacity-90 disabled:opacity-50 disabled:cursor-not-allowed"
              style={{
                height: 44,
                borderRadius: 8,
                background: '#4F46E5',
                fontFamily: 'Inter, sans-serif',
                fontWeight: 500,
                fontSize: 14,
                color: '#FFFFFF',
              }}
            >
              {preparing && <Loader2 className="w-4 h-4 animate-spin" />}
              {preparing ? 'Preparing your download…' : 'Prepare my download'}
            </button>
            <p
              className="text-center mt-3"
              style={{ fontFamily: 'Inter, sans-serif', fontSize: 12.5, color: '#9CA3AF' }}
            >
              This ZIP is generated on demand. You can download it as many times as you need.
            </p>
          </div>

          {/* About your download */}
          <div
            style={{ borderRadius: 12, background: '#F9FAFB', border: '1px solid #E5E7EB', padding: '18px 20px' }}
          >
            <p
              className="mb-2"
              style={{ fontFamily: 'Inter, sans-serif', fontWeight: 600, fontSize: 14, color: '#101828' }}
            >
              About your download
            </p>
            <ul className="flex flex-col" style={{ gap: 6 }}>
              {[
                {
                  key: 'video',
                  // Videos are stored in Mux, not Supabase Storage, so they
                  // can't be added to the ZIP — they get their own page.
                  content: (
                    <span>
                      Video messages cannot be downloaded from this page but can be
                      downloaded{' '}
                      <Link
                        href="/rm/downloads/videos"
                        style={{ color: '#4F46E5', fontWeight: 500, textDecoration: 'underline' }}
                      >
                        here
                      </Link>
                    </span>
                  ),
                },
                { key: 'photos', content: 'Photos are included at full resolution' },
                {
                  key: 'documents',
                  content: 'Documents are included in their original format (PDF, Word, etc.)',
                },
                {
                  key: 'repeat',
                  content: 'You can download this package as many times as you need',
                },
                {
                  key: 'assigned',
                  content:
                    'Only content assigned for delivery is included — draft or unassigned content never appears here',
                },
              ].map((item) => (
                <li
                  key={item.key}
                  className="flex items-start gap-2"
                  style={{ fontFamily: 'Inter, sans-serif', fontSize: 13.5, color: '#4A5565' }}
                >
                  <span
                    className="flex-shrink-0 mt-[7px]"
                    style={{ width: 5, height: 5, borderRadius: 9999, background: '#16A34A' }}
                  />
                  {item.content}
                </li>
              ))}
            </ul>
          </div>
        </>
      )}
    </div>
  )
}
