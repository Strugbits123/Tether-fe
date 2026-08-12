'use client'

import { useCallback, useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { getAccessToken } from '@/lib/supabase/getAccessToken'
import { useToast } from '@/lib/context/ToastContext'
import { ApiError } from '@/lib/api/client'
import { getRmOverview, type RmOverview } from '@/lib/api/rm'

// Release Manager portal — Overview.

function statCards(overview: RmOverview): { value: string; label: string }[] {
  const s = overview.content_stats
  return [
    { value: String(s.video_messages), label: 'Video messages' },
    { value: String(s.audio_messages), label: 'Audio messages' },
    { value: String(s.documents), label: 'Documents' },
    { value: String(s.photos), label: 'Photos' },
    { value: String(s.memoir_chapters), label: 'Memoir chapters' },
    { value: String(s.recipients), label: 'Recipients' },
  ]
}

const ACTIVITY_COLOR = '#4F46E5'

export default function ReleaseManagerOverviewPage() {
  const router = useRouter()
  const { showToast } = useToast()
  const [overview, setOverview] = useState<RmOverview | null>(null)
  const [loading, setLoading] = useState(true)

  const load = useCallback(async () => {
    setLoading(true)
    const token = await getAccessToken()
    if (!token) {
      setLoading(false)
      return
    }
    try {
      const data = await getRmOverview(token)
      setOverview(data)
    } catch (e) {
      showToast(e instanceof ApiError ? e.message : 'Failed to load overview.', 'error')
    } finally {
      setLoading(false)
    }
  }, [showToast])

  useEffect(() => {
    // Fetch on mount. load() does set loading/error synchronously before its
    // first await, but on mount those already hold their initial values, so React
    // bails out without an extra render. The resets matter on later refetches.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    load()
  }, [load])

  if (loading) {
    return (
      <div className="w-full max-w-[1200px] mx-auto flex flex-col gap-8 p-6 sm:p-8">
        <div className="animate-pulse flex flex-col gap-2">
          <div className="h-8 bg-gray-200 rounded w-2/3" />
          <div className="h-4 bg-gray-100 rounded w-1/2" />
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {Array.from({ length: 6 }).map((_, i) => (
            <div
              key={i}
              className="animate-pulse"
              style={{ height: 100, borderRadius: 14, border: '1.25px solid #E5E7EB', background: '#FFFFFF' }}
            />
          ))}
        </div>
      </div>
    )
  }

  if (!overview) {
    return (
      <div className="w-full max-w-[1200px] mx-auto flex flex-col items-center gap-3 p-6 sm:p-8 text-center">
        <p style={{ fontFamily: 'Inter, sans-serif', fontSize: 15, color: '#6B7280' }}>
          Couldn&apos;t load your overview.
        </p>
        <button
          type="button"
          onClick={load}
          className="cursor-pointer hover:opacity-80"
          style={{ fontFamily: 'Inter, sans-serif', fontWeight: 500, fontSize: 14, color: '#4F46E5' }}
        >
          Try again
        </button>
      </div>
    )
  }

  return (
    <div className="w-full max-w-[1200px] mx-auto flex flex-col gap-8 p-6 sm:p-8">
      {/* Header */}
      <div className="flex flex-col gap-2">
        <h1
          style={{
            fontFamily: '"Instrument Serif", serif',
            fontWeight: 400,
            fontSize: 32,
            lineHeight: '48px',
            color: '#111827',
          }}
        >
          Welcome to Tether
        </h1>
        <p
          style={{
            fontFamily: 'Inter, sans-serif',
            fontWeight: 400,
            fontSize: 15,
            lineHeight: '22.5px',
            letterSpacing: '-0.23px',
            color: '#6B7280',
          }}
        >
          Overview of what {overview.account_owner.name || 'your Tether account owner'} is leaving
          for family and friends
        </p>
      </div>

      {/* Stat cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {statCards(overview).map((stat) => (
          <div
            key={stat.label}
            className="flex flex-col"
            style={{
              gap: 4,
              borderRadius: 14,
              border: '1.25px solid #E5E7EB',
              background: '#FFFFFF',
              padding: '24px 25px',
            }}
          >
            <span
              style={{
                fontFamily: '"Instrument Serif", serif',
                fontWeight: 400,
                fontSize: 36,
                lineHeight: '54px',
                color: '#111827',
              }}
            >
              {stat.value}
            </span>
            <span
              style={{
                fontFamily: 'Inter, sans-serif',
                fontWeight: 400,
                fontSize: 13,
                lineHeight: '19.5px',
                letterSpacing: '-0.08px',
                color: '#6B7280',
              }}
            >
              {stat.label}
            </span>
          </div>
        ))}
      </div>

      {/* Recent activity */}
      <div
        className="flex flex-col"
        style={{
          gap: 16,
          borderRadius: 14,
          border: '1.25px solid #E5E7EB',
          background: '#FFFFFF',
          padding: '24px 25px',
        }}
      >
        <h2
          style={{
            fontFamily: 'Inter, sans-serif',
            fontWeight: 600,
            fontSize: 18,
            lineHeight: '27px',
            letterSpacing: '-0.44px',
            color: '#111827',
          }}
        >
          Recent activity
        </h2>

        <div className="flex flex-col" style={{ gap: 16 }}>
          {overview.recent_activity.length === 0 ? (
            <span style={{ fontFamily: 'Inter, sans-serif', fontSize: 14, color: '#9CA3AF' }}>
              No activity yet.
            </span>
          ) : (
            overview.recent_activity.map((item) => (
              <div key={item.id} className="flex items-start gap-3">
                <span
                  className="flex-shrink-0"
                  style={{
                    width: 8,
                    height: 8,
                    borderRadius: 9999,
                    background: ACTIVITY_COLOR,
                    marginTop: 7,
                  }}
                />
                <div className="flex-1 min-w-0 flex items-start justify-between gap-3">
                  <span
                    style={{
                      fontFamily: 'Inter, sans-serif',
                      fontWeight: 400,
                      fontSize: 14,
                      lineHeight: '21px',
                      letterSpacing: '-0.15px',
                      color: '#374151',
                    }}
                  >
                    {item.event_label}
                  </span>
                  <span
                    className="flex-shrink-0 whitespace-nowrap"
                    style={{
                      fontFamily: 'Inter, sans-serif',
                      fontWeight: 400,
                      fontSize: 13,
                      lineHeight: '19.5px',
                      letterSpacing: '-0.08px',
                      color: '#9CA3AF',
                    }}
                  >
                    {item.time_ago}
                  </span>
                </div>
              </div>
            ))
          )}
        </div>

        <button
          type="button"
          onClick={() => router.push('/rm/notifications')}
          className="self-start cursor-pointer hover:opacity-80 mt-1"
          style={{
            fontFamily: 'Inter, sans-serif',
            fontWeight: 500,
            fontSize: 14,
            lineHeight: '21px',
            letterSpacing: '-0.15px',
            color: '#4F46E5',
          }}
        >
          View full notification log →
        </button>
      </div>
    </div>
  )
}
