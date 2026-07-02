'use client'

import { useCallback, useEffect, useRef, useState } from 'react'
import { useRouter } from 'next/navigation'
import { Loader2, Printer, Volume2, X } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import { useToast } from '@/lib/context/ToastContext'
import { ApiError } from '@/lib/api/client'
import {
  downloadMemoirPdf,
  generateTts,
  getMemoirPreview,
  getTtsStatus,
  type MemoirPreview,
  type PreviewChapter,
  type TtsStatus,
} from '@/lib/api/memoir'

/* ---------------------- Helpers ---------------------- */

async function getToken(): Promise<string | null> {
  const supabase = createClient()
  const {
    data: { session },
  } = await supabase.auth.getSession()
  return session?.access_token ?? null
}

const THEME_LABELS: Record<string, string> = {
  childhood: 'Childhood',
  family: 'Family',
  career: 'Career',
  love: 'Love',
  hardship: 'Hardship',
  adventure: 'Adventure',
  faith: 'Faith',
  friendship: 'Friendship',
  loss: 'Loss',
  milestone: 'Milestone',
}

/* ---------------------- Page ---------------------- */

export default function MemoirPreviewPage() {
  const router = useRouter()
  const { showToast } = useToast()
  const [memoir, setMemoir] = useState<MemoirPreview | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [downloading, setDownloading] = useState(false)

  const load = useCallback(async () => {
    const token = await getToken()
    if (!token) {
      setError('Your session has expired. Please sign in again.')
      setLoading(false)
      return
    }
    try {
      const data = await getMemoirPreview(token)
      setMemoir(data)
    } catch (e) {
      setError(e instanceof ApiError ? e.message : 'Could not load your memoir.')
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    load()
  }, [load])

  const handleDownloadPdf = async () => {
    if (downloading) return
    setDownloading(true)
    const token = await getToken()
    if (!token) {
      setDownloading(false)
      return
    }
    try {
      await downloadMemoirPdf(token)
    } catch {
      showToast('Download failed. Please try again.', 'error')
    } finally {
      setDownloading(false)
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center" style={{ minHeight: 'calc(100vh - 200px)' }}>
        <Loader2 className="w-6 h-6 animate-spin text-[#4F39F6]" />
      </div>
    )
  }

  if (error || !memoir) {
    return (
      <div className="w-full flex flex-col items-center text-center" style={{ gap: 16, paddingTop: 80 }}>
        <p style={{ fontFamily: 'Inter, sans-serif', fontSize: 16, color: '#4A5565' }}>{error ?? 'Your memoir is empty.'}</p>
        <button
          type="button"
          onClick={() => router.push('/story')}
          className="flex items-center gap-2 cursor-pointer hover:opacity-80"
          style={{ fontFamily: 'Inter, sans-serif', fontWeight: 500, fontSize: 14, color: '#4A5565' }}
        >
          <X style={{ width: 16, height: 16 }} color="#4A5565" strokeWidth={2} />
          Back to My Story
        </button>
      </div>
    )
  }

  return (
    <div className="w-full overflow-hidden" style={{ borderRadius: 14 }}>
      {/* Toolbar */}
      <div className="flex items-center justify-between flex-wrap gap-3 print:hidden" style={{ padding: '16px 23.98px', borderBottom: '1.25px solid #E5E7EB' }}>
        <button
          type="button"
          onClick={() => router.push('/story')}
          className="flex items-center cursor-pointer hover:opacity-80"
          style={{ gap: 8, background: 'transparent' }}
        >
          <X style={{ width: 16, height: 16, flexShrink: 0 }} color="#4A5565" strokeWidth={2} />
          <span style={{ fontFamily: 'Inter, sans-serif', fontWeight: 500, fontSize: 14, lineHeight: '20px', letterSpacing: '-0.15px', color: '#4A5565', whiteSpace: 'nowrap' }}>
            Exit preview
          </span>
        </button>

        <div className="flex items-center" style={{ gap: 10 }}>
          <button
            type="button"
            onClick={handleDownloadPdf}
            disabled={downloading}
            className="flex items-center justify-center cursor-pointer hover:opacity-90 disabled:opacity-60"
            style={{ height: 32, minWidth: 150, padding: '0 14px', gap: 8, borderRadius: 8, border: '1.25px solid rgba(255,255,255,0.1)', background: '#4F46E5', flexShrink: 0 }}
          >
            {downloading ? <Loader2 className="w-4 h-4 animate-spin text-white" /> : <Printer style={{ width: 16, height: 16, flexShrink: 0 }} color="#FFFFFF" strokeWidth={2} />}
            <span style={{ fontFamily: 'Inter, sans-serif', fontWeight: 500, fontSize: 14, lineHeight: '20px', letterSpacing: '-0.15px', textAlign: 'center', color: '#FFFFFF', whiteSpace: 'nowrap' }}>
              Download PDF
            </span>
          </button>

          <button
            type="button"
            onClick={() => window.print()}
            className="flex items-center justify-center cursor-pointer hover:bg-gray-50"
            style={{ height: 32, width: 83.73, gap: 6, borderRadius: 8, border: '1.25px solid rgba(0,0,0,0.1)', background: '#FFFFFF', flexShrink: 0 }}
          >
            <Printer style={{ width: 16, height: 16, flexShrink: 0 }} color="#0A0A0A" strokeWidth={2} />
            <span style={{ fontFamily: 'Inter, sans-serif', fontWeight: 500, fontSize: 14, lineHeight: '20px', letterSpacing: '-0.15px', textAlign: 'center', color: '#0A0A0A', whiteSpace: 'nowrap' }}>
              Print
            </span>
          </button>
        </div>
      </div>

      {/* Document */}
      <div className="mx-auto w-full flex flex-col" style={{ maxWidth: 799, padding: 'clamp(24px, 5vw, 47.99px) clamp(16px, 3vw, 23.98px) clamp(32px, 6vw, 48px)', gap: 35 }}>
        {/* Title block */}
        <div className="flex flex-col items-center" style={{ gap: 16 }}>
          <h1 style={{ fontFamily: '"Instrument Serif", serif', fontWeight: 400, fontSize: 'clamp(34px, 9vw, 48px)', lineHeight: 1, color: '#101828', textAlign: 'center' }}>
            {memoir.title}
          </h1>
          {memoir.dedication && (
            <p style={{ fontFamily: 'Inter, sans-serif', fontWeight: 400, fontStyle: 'italic', fontSize: 18, lineHeight: '28px', letterSpacing: '-0.44px', color: '#4A5565', textAlign: 'center' }}>
              {memoir.dedication}
            </p>
          )}
        </div>

        {memoir.chapters.length === 0 ? (
          <p style={{ fontFamily: 'Inter, sans-serif', fontStyle: 'italic', fontSize: 16, textAlign: 'center', color: '#6A7282' }}>
            No completed chapters yet.
          </p>
        ) : (
          <div className="flex flex-col" style={{ gap: 30 }}>
            {/* Contents */}
            <div className="flex flex-col" style={{ gap: 23.98, paddingBottom: 23.98, borderBottom: '1.25px solid #E5E7EB' }}>
              <h2 style={{ fontFamily: 'Georgia, serif', fontWeight: 500, fontSize: 24, lineHeight: '32px', color: '#101828' }}>Contents</h2>
              <div className="flex flex-col" style={{ gap: 16 }}>
                {memoir.chapters.map((c) => (
                  <ContentsRow key={c.id} chapter={c} />
                ))}
              </div>
            </div>

            {memoir.chapters.map((c) => (
              <ChapterBlock key={c.id} chapter={c} onError={(m) => showToast(m, 'error')} />
            ))}

            <p style={{ fontFamily: 'Inter, sans-serif', fontWeight: 400, fontStyle: 'italic', fontSize: 16, lineHeight: '24px', letterSpacing: '-0.31px', textAlign: 'center', color: '#6A7282' }}>
              End of story
            </p>
          </div>
        )}
      </div>
    </div>
  )
}

/* ---------------------- Contents row ---------------------- */

function ContentsRow({ chapter }: { chapter: PreviewChapter }) {
  return (
    <div className="flex items-baseline justify-between gap-3">
      <span style={{ minWidth: 0 }}>
        <span style={{ fontFamily: 'Inter, sans-serif', fontWeight: 400, fontSize: 16, lineHeight: '24px', letterSpacing: '-0.31px', color: '#6A7282' }}>
          Chapter {chapter.chapter_number}:{' '}
        </span>
        <span style={{ fontFamily: 'Inter, sans-serif', fontWeight: 400, fontSize: 16, lineHeight: '24px', letterSpacing: '-0.31px', color: '#101828' }}>
          {chapter.title}
        </span>
      </span>
      {chapter.date_label && (
        <span style={{ fontFamily: 'Inter, sans-serif', fontWeight: 400, fontSize: 14, lineHeight: '20px', letterSpacing: '-0.15px', color: '#99A1AF', whiteSpace: 'nowrap', flexShrink: 0 }}>
          {chapter.date_label}
        </span>
      )}
    </div>
  )
}

/* ---------------------- Chapter block ---------------------- */

function ChapterBlock({ chapter, onError }: { chapter: PreviewChapter; onError: (m: string) => void }) {
  const images = chapter.exhibits.filter((e) => e.file_type.startsWith('image/') && e.signed_url)

  return (
    <div className="flex flex-col" style={{ gap: 23.98 }}>
      <div className="flex flex-col" style={{ gap: 12 }}>
        <span style={{ fontFamily: 'Inter, sans-serif', fontWeight: 400, fontSize: 14, lineHeight: '20px', letterSpacing: '-0.15px', color: '#6A7282' }}>
          Chapter {chapter.chapter_number}
        </span>

        <div className="flex items-start justify-between gap-3 flex-wrap">
          <h2 style={{ fontFamily: '"Instrument Serif", serif', fontWeight: 400, fontSize: 'clamp(32px, 8vw, 48px)', lineHeight: 1, color: '#101828', wordBreak: 'break-word' }}>
            {chapter.title}
          </h2>
          <TtsButton chapter={chapter} onError={onError} />
        </div>

        {chapter.theme && (
          <div className="flex items-center flex-wrap" style={{ gap: 8 }}>
            <span
              className="inline-flex items-center justify-center"
              style={{ height: 36, borderRadius: 9999, padding: '8px 12px', background: 'rgba(79,70,229,0.1)', fontFamily: 'Inter, sans-serif', fontWeight: 500, fontSize: 14, lineHeight: '20px', letterSpacing: '-0.15px', textAlign: 'center', color: '#4F46E5', whiteSpace: 'nowrap' }}
            >
              {THEME_LABELS[chapter.theme] ?? chapter.theme}
            </span>
          </div>
        )}

        {chapter.date_label && (
          <span style={{ fontFamily: 'Inter, sans-serif', fontWeight: 400, fontSize: 14, lineHeight: '20px', letterSpacing: '-0.15px', color: '#4A5565' }}>
            {chapter.date_label}
          </span>
        )}
      </div>

      {/* Body (rich HTML) */}
      <div
        className="[&_p]:mb-4 [&_ul]:list-disc [&_ul]:pl-7 [&_ul]:my-2 [&_ol]:list-decimal [&_ol]:pl-7 [&_ol]:my-2 [&_li]:mb-1"
        style={{ fontFamily: 'Georgia, serif', fontWeight: 400, fontSize: 16, lineHeight: '26px', color: '#101828' }}
        dangerouslySetInnerHTML={{ __html: chapter.body ?? '' }}
      />

      {/* Exhibit images */}
      {images.length > 0 && (
        <div className="grid grid-cols-1 sm:grid-cols-2" style={{ gap: 14 }}>
          {images.map((ex) => (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              key={ex.id}
              src={ex.signed_url as string}
              alt={ex.file_name}
              className="w-full object-cover"
              style={{ borderRadius: 10, maxHeight: 320 }}
            />
          ))}
        </div>
      )}
    </div>
  )
}

/* ---------------------- TTS button ---------------------- */

function TtsButton({ chapter, onError }: { chapter: PreviewChapter; onError: (m: string) => void }) {
  const initialStatus: TtsStatus = chapter.tts_audio?.status ?? 'none'
  const [status, setStatus] = useState<TtsStatus>(initialStatus)
  const [playbackUrl, setPlaybackUrl] = useState<string | null>(chapter.tts_audio?.playback_url ?? null)
  const [showPlayer, setShowPlayer] = useState(false)
  const pollRef = useRef<ReturnType<typeof setInterval> | null>(null)

  useEffect(() => {
    return () => {
      if (pollRef.current) clearInterval(pollRef.current)
    }
  }, [])

  const startPolling = useCallback(() => {
    if (pollRef.current) clearInterval(pollRef.current)
    pollRef.current = setInterval(async () => {
      const token = await getToken()
      if (!token) return
      try {
        const res = await getTtsStatus(token, chapter.id)
        setStatus(res.status)
        if (res.status === 'ready') {
          setPlaybackUrl(res.playback_url ?? null)
          setShowPlayer(true)
          if (pollRef.current) clearInterval(pollRef.current)
        } else if (res.status === 'failed') {
          if (pollRef.current) clearInterval(pollRef.current)
          onError('Narration generation failed. Please try again.')
        }
      } catch {
        /* transient — keep polling */
      }
    }, 4000)
  }, [chapter.id, onError])

  const handleClick = async () => {
    if (status === 'ready' && playbackUrl) {
      setShowPlayer((s) => !s)
      return
    }
    if (status === 'pending' || status === 'processing') return

    const token = await getToken()
    if (!token) return
    setStatus('pending')
    try {
      await generateTts(token, chapter.id)
      startPolling()
    } catch (e) {
      setStatus('none')
      onError(e instanceof ApiError ? e.message : 'Could not start narration.')
    }
  }

  const busy = status === 'pending' || status === 'processing'
  const label = status === 'ready' ? (showPlayer ? 'Hide audio' : 'Listen') : busy ? 'Generating…' : 'Generate narration'

  return (
    <div className="flex flex-col items-end gap-2 print:hidden">
      <button
        type="button"
        onClick={handleClick}
        disabled={busy}
        className="flex items-center justify-center cursor-pointer hover:opacity-90 disabled:opacity-70"
        style={{ height: 32, padding: '6px 16px', gap: 8, borderRadius: 8, border: '1.25px solid rgba(255,255,255,0.1)', background: '#4F46E5', flexShrink: 0 }}
      >
        {busy ? <Loader2 className="w-4 h-4 animate-spin text-white" /> : <Volume2 style={{ width: 16, height: 16, flexShrink: 0 }} color="#FFFFFF" strokeWidth={2} />}
        <span style={{ fontFamily: 'Inter, sans-serif', fontWeight: 500, fontSize: 14, lineHeight: '20px', letterSpacing: '-0.15px', textAlign: 'center', color: '#FFFFFF', whiteSpace: 'nowrap' }}>
          {label}
        </span>
      </button>
      {showPlayer && playbackUrl && <audio controls src={playbackUrl} style={{ maxWidth: 260 }} />}
    </div>
  )
}
