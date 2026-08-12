'use client'

import { useCallback, useEffect, useState } from 'react'
import Link from 'next/link'
import { ArrowLeft, Download, Loader2, Lock, Video as VideoIcon } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import { useToast } from '@/lib/context/ToastContext'
import { ApiError } from '@/lib/api/client'
import { getDownloadableVideos, type DownloadableVideo } from '@/lib/api/rm'

async function getToken(): Promise<string | null> {
  const supabase = createClient()
  const {
    data: { session },
  } = await supabase.auth.getSession()
  return session?.access_token ?? null
}

function formatDuration(seconds: number | null): string | null {
  if (!seconds || seconds <= 0) return null
  // Round the total first, then split. Flooring the minutes and separately
  // rounding the remainder lets 59.6s render as "0:60" — the remainder can round
  // up to 60 without the minute ever incrementing.
  const total = Math.round(seconds)
  const m = Math.floor(total / 60)
  const s = total % 60
  return `${m}:${String(s).padStart(2, '0')}`
}

function formatSize(bytes: number | null): string | null {
  if (!bytes || bytes <= 0) return null
  const mb = bytes / 1024 / 1024
  return mb >= 1024 ? `${(mb / 1024).toFixed(1)} GB` : `${mb.toFixed(1)} MB`
}

function formatDate(iso: string): string {
  const d = new Date(iso)
  if (Number.isNaN(d.getTime())) return ''
  return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
}

export default function RmVideoDownloadsPage() {
  const { showToast } = useToast()
  const [videos, setVideos] = useState<DownloadableVideo[]>([])
  const [loading, setLoading] = useState(true)
  const [blockedMessage, setBlockedMessage] = useState<string | null>(null)
  // Tracked separately from `videos` being empty: a failed request would
  // otherwise fall through to the "No video messages" empty state and tell the
  // user there are no videos when we simply couldn't find out.
  const [loadError, setLoadError] = useState<string | null>(null)

  const load = useCallback(async () => {
    const token = await getToken()
    if (!token) {
      setLoading(false)
      return
    }
    try {
      const data = await getDownloadableVideos(token)
      setVideos(data.videos)
      setBlockedMessage(null)
      setLoadError(null)
    } catch (e) {
      // 403 is the expected "release hasn't been initiated yet" state, not an
      // error worth a toast — it gets its own explanatory panel below.
      if (e instanceof ApiError && e.statusCode === 403) {
        setBlockedMessage(e.message)
        setLoadError(null)
      } else {
        const message = e instanceof ApiError ? e.message : 'Failed to load videos.'
        setLoadError(message)
        showToast(message, 'error')
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

  const preparingCount = videos.filter((v) => v.status === 'preparing').length

  return (
    <div className="w-full max-w-[900px] mx-auto flex flex-col gap-6 p-4 sm:p-6">
      <div className="flex flex-col gap-2">
        <Link
          href="/rm/downloads"
          className="inline-flex items-center gap-1.5 w-fit"
          style={{ fontFamily: 'Inter, sans-serif', fontSize: 13.5, color: '#4F46E5' }}
        >
          <ArrowLeft style={{ width: 15, height: 15 }} strokeWidth={2} />
          Back to downloads
        </Link>
        <h1
          style={{
            fontFamily: '"Instrument Serif", serif',
            fontWeight: 400,
            fontSize: 30,
            lineHeight: '38px',
            color: '#101828',
          }}
        >
          Video messages
        </h1>
        <p
          style={{
            fontFamily: 'Inter, sans-serif',
            fontSize: 14.5,
            lineHeight: '22px',
            color: '#4A5565',
          }}
        >
          Videos are stored separately from the content package, so they&apos;re downloaded one at a
          time here. Only videos assigned for delivery appear on this page.
        </p>
      </div>

      {loading && (
        <div className="flex items-center gap-2" style={{ color: '#6A7282' }}>
          <Loader2 className="animate-spin" style={{ width: 16, height: 16 }} />
          <span style={{ fontFamily: 'Inter, sans-serif', fontSize: 14 }}>Loading videos…</span>
        </div>
      )}

      {!loading && blockedMessage && (
        <div
          className="flex items-start gap-3"
          style={{
            borderRadius: 12,
            background: '#F9FAFB',
            border: '1px solid #E5E7EB',
            padding: '18px 20px',
          }}
        >
          <Lock className="flex-shrink-0 mt-0.5" style={{ width: 18, height: 18, color: '#6A7282' }} />
          <p style={{ fontFamily: 'Inter, sans-serif', fontSize: 14, color: '#4A5565' }}>
            {blockedMessage}
          </p>
        </div>
      )}

      {!loading && !blockedMessage && loadError && (
        <div
          className="flex flex-col gap-3"
          style={{
            borderRadius: 12,
            background: '#FEF2F2',
            border: '1px solid #FECACA',
            padding: '18px 20px',
          }}
        >
          <p style={{ fontFamily: 'Inter, sans-serif', fontWeight: 600, fontSize: 14, color: '#991B1B' }}>
            Couldn&apos;t load videos
          </p>
          <p style={{ fontFamily: 'Inter, sans-serif', fontSize: 13.5, color: '#7F1D1D' }}>
            {loadError}
          </p>
          <button
            type="button"
            onClick={() => {
              setLoading(true)
              load()
            }}
            className="w-fit cursor-pointer hover:opacity-90"
            style={{
              height: 34,
              padding: '0 14px',
              borderRadius: 8,
              background: '#4F46E5',
              color: '#FFFFFF',
              fontFamily: 'Inter, sans-serif',
              fontWeight: 500,
              fontSize: 13.5,
            }}
          >
            Try again
          </button>
        </div>
      )}

      {!loading && !blockedMessage && !loadError && videos.length === 0 && (
        <div
          className="flex flex-col items-center text-center gap-3"
          style={{
            borderRadius: 12,
            background: '#F9FAFB',
            border: '1px solid #E5E7EB',
            padding: '40px 20px',
          }}
        >
          <span
            className="flex items-center justify-center"
            style={{ width: 48, height: 48, borderRadius: 9999, background: '#EEF2FF' }}
          >
            <VideoIcon style={{ width: 22, height: 22, color: '#4F46E5' }} strokeWidth={2} />
          </span>
          <p style={{ fontFamily: 'Inter, sans-serif', fontWeight: 600, fontSize: 15, color: '#101828' }}>
            No video messages
          </p>
          <p style={{ fontFamily: 'Inter, sans-serif', fontSize: 13.5, color: '#6A7282' }}>
            There are no videos assigned for delivery on this account.
          </p>
        </div>
      )}

      {!loading && !blockedMessage && preparingCount > 0 && (
        <p
          style={{
            fontFamily: 'Inter, sans-serif',
            fontSize: 13,
            color: '#BB4D00',
            background: '#FEF3C7',
            border: '1px solid #FDE68A',
            borderRadius: 10,
            padding: '10px 14px',
          }}
        >
          {preparingCount === 1 ? '1 video is' : `${preparingCount} videos are`} still being prepared
          for download. This usually takes a few minutes — reload this page to check again.
        </p>
      )}

      {!loading && videos.length > 0 && (
        <ul
          className="grid gap-4"
          style={{ gridTemplateColumns: 'repeat(auto-fill, minmax(240px, 1fr))' }}
        >
          {videos.map((v) => {
            const duration = formatDuration(v.duration_seconds)
            const size = formatSize(v.file_size_bytes)
            const meta = [formatDate(v.created_at), duration, size].filter(Boolean).join(' · ')

            return (
              <li
                key={v.id}
                className="flex flex-col"
                style={{
                  borderRadius: 12,
                  border: '1px solid #E5E7EB',
                  background: '#FFFFFF',
                  overflow: 'hidden',
                }}
              >
                {/* Thumbnail only — deliberately not a player. This page exists
                    to download the originals, not to watch them. */}
                <div
                  className="relative flex items-center justify-center"
                  style={{ aspectRatio: '16 / 9', background: '#F1F5F9' }}
                >
                  {v.thumbnail_url ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={v.thumbnail_url}
                      alt=""
                      style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                    />
                  ) : (
                    <VideoIcon style={{ width: 26, height: 26, color: '#94A3B8' }} strokeWidth={1.75} />
                  )}
                </div>

                <div className="flex flex-col gap-2 p-3">
                  <p
                    className="truncate"
                    title={v.title}
                    style={{
                      fontFamily: 'Inter, sans-serif',
                      fontWeight: 600,
                      fontSize: 14,
                      color: '#101828',
                    }}
                  >
                    {v.title}
                  </p>
                  {meta && (
                    <p style={{ fontFamily: 'Inter, sans-serif', fontSize: 12, color: '#6A7282' }}>
                      {meta}
                    </p>
                  )}

                  {v.status === 'ready' && v.download_url ? (
                    <a
                      href={v.download_url}
                      className="inline-flex items-center justify-center gap-2 cursor-pointer hover:opacity-90"
                      style={{
                        height: 36,
                        borderRadius: 8,
                        background: '#4F46E5',
                        color: '#FFFFFF',
                        fontFamily: 'Inter, sans-serif',
                        fontWeight: 500,
                        fontSize: 13.5,
                      }}
                    >
                      <Download style={{ width: 15, height: 15 }} strokeWidth={2} />
                      Download
                    </a>
                  ) : (
                    <span
                      className="inline-flex items-center justify-center gap-2"
                      style={{
                        height: 36,
                        borderRadius: 8,
                        background: '#F3F4F6',
                        color: '#6A7282',
                        fontFamily: 'Inter, sans-serif',
                        fontWeight: 500,
                        fontSize: 13.5,
                        cursor: 'not-allowed',
                      }}
                    >
                      {v.status === 'errored' ? (
                        'Unavailable'
                      ) : (
                        <>
                          <Loader2 className="animate-spin" style={{ width: 14, height: 14 }} />
                          Preparing…
                        </>
                      )}
                    </span>
                  )}
                </div>
              </li>
            )
          })}
        </ul>
      )}
    </div>
  )
}
