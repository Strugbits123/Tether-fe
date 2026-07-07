'use client'

import { useEffect, useRef, useState } from 'react'
import { useRouter } from 'next/navigation'
import { ArrowLeft, Keyboard, Loader2, Mic, Play, Square, Trash2 } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import { useToast } from '@/lib/context/ToastContext'
import { ApiError } from '@/lib/api/client'
import {
  createChapter,
  createVoiceChapter,
  getVoiceUploadUrl,
} from '@/lib/api/chapters'

/* ---------------------- Constants ---------------------- */

// Themes limited to the values the backend accepts.
const THEMES: { label: string; value: string }[] = [
  { label: 'Childhood', value: 'childhood' },
  { label: 'Family', value: 'family' },
  { label: 'Career', value: 'career' },
  { label: 'Love', value: 'love' },
  { label: 'Hardship', value: 'hardship' },
  { label: 'Adventure', value: 'adventure' },
  { label: 'Faith', value: 'faith' },
  { label: 'Friendship', value: 'friendship' },
  { label: 'Loss', value: 'loss' },
  { label: 'Milestone', value: 'milestone' },
]

type CreateMethod = 'write' | 'record'

async function getToken(): Promise<string | null> {
  const supabase = createClient()
  const {
    data: { session },
  } = await supabase.auth.getSession()
  return session?.access_token ?? null
}

/* ---------------------- Page ---------------------- */

export default function NewChapterPage() {
  const router = useRouter()
  const { showToast } = useToast()

  const [name, setName] = useState('')
  const [period, setPeriod] = useState('')
  const [theme, setTheme] = useState<string | null>(null)
  const [method, setMethod] = useState<CreateMethod>('write')
  const [recording, setRecording] = useState(false)
  const [submitting, setSubmitting] = useState(false)

  const goToStory = () => router.push('/story')

  const startWriting = async () => {
    if (submitting) return
    const title = name.trim()
    if (!title) return
    setSubmitting(true)
    const token = await getToken()
    if (!token) {
      setSubmitting(false)
      showToast('Your session has expired. Please sign in again.', 'error')
      return
    }
    try {
      const chapter = await createChapter(token, {
        title,
        ...(period.trim() ? { date_label: period.trim() } : {}),
        ...(theme ? { theme } : {}),
      })
      router.push(`/story/${chapter.id}`)
    } catch (e) {
      setSubmitting(false)
      showToast(e instanceof ApiError ? e.message : 'Could not create chapter.', 'error')
    }
  }

  return (
    <div className="w-full flex flex-col items-center justify-center" style={{ minHeight: 'calc(100vh - 112px)' }}>
      {recording ? (
        <RecordStep
          title={name.trim() || 'Untitled chapter'}
          meta={{
            title: name.trim(),
            date_label: period.trim() || undefined,
            theme: theme ?? undefined,
          }}
          onCancel={() => setRecording(false)}
          onError={(m) => showToast(m, 'error')}
          onCreated={(id) => router.push(`/story/${id}`)}
        />
      ) : (
        <FormStep
          name={name}
          setName={setName}
          period={period}
          setPeriod={setPeriod}
          theme={theme}
          setTheme={setTheme}
          method={method}
          setMethod={setMethod}
          submitting={submitting}
          onBack={goToStory}
          onStart={() => {
            if (!name.trim()) return
            if (method === 'record') setRecording(true)
            else startWriting()
          }}
        />
      )}
    </div>
  )
}

/* ---------------------- Back link ---------------------- */

function BackLink({ onClick }: { onClick: () => void }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="flex items-center gap-2 cursor-pointer hover:opacity-80"
      style={{
        fontFamily: 'Inter, sans-serif',
        fontWeight: 500,
        fontSize: 14,
        lineHeight: '20px',
        letterSpacing: '-0.15px',
        color: '#4A5565',
        background: 'transparent',
      }}
    >
      <ArrowLeft style={{ width: 16, height: 16, flexShrink: 0 }} color="#4A5565" strokeWidth={2} />
      Back to My Story
    </button>
  )
}

/* ====================== Step 1 — Create form ====================== */

function FormStep({
  name,
  setName,
  period,
  setPeriod,
  theme,
  setTheme,
  method,
  setMethod,
  submitting,
  onBack,
  onStart,
}: {
  name: string
  setName: (v: string) => void
  period: string
  setPeriod: (v: string) => void
  theme: string | null
  setTheme: (v: string | null) => void
  method: CreateMethod
  setMethod: (v: CreateMethod) => void
  submitting: boolean
  onBack: () => void
  onStart: () => void
}) {
  const canStart = name.trim().length > 0 && !submitting

  const inputStyle: React.CSSProperties = {
    width: '100%',
    borderRadius: 8,
    border: '1.25px solid #D1D5DC',
    background: '#F3F3F5',
    padding: 12,
    fontFamily: 'Inter, sans-serif',
    fontWeight: 400,
    fontSize: 14,
    lineHeight: '100%',
    color: '#0A0A0A',
  }

  return (
    <div className="w-full max-w-[680px] mx-auto flex flex-col" style={{ gap: 30 }}>
      <div className="flex flex-col" style={{ gap: 16 }}>
        <BackLink onClick={onBack} />
        <h1
          style={{
            fontFamily: '"Instrument Serif", serif',
            fontWeight: 400,
            fontSize: 38,
            lineHeight: '42px',
            color: '#101828',
          }}
        >
          What would you like this chapter to be about?
        </h1>
      </div>

      <div className="flex flex-col" style={{ gap: 23.98 }}>
        {/* Name */}
        <div className="flex flex-col" style={{ gap: 8 }}>
          <label style={labelStyle}>
            Name of chapter <span style={{ color: '#FF0000' }}>*</span>
          </label>
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Give this chapter a name..."
            className="focus:outline-none focus:border-[#4F39F6]"
            style={inputStyle}
          />
        </div>

        {/* Period */}
        <div className="flex flex-col" style={{ gap: 8 }}>
          <label style={labelStyle}>
            When did this take place? <span style={optionalStyle}>(optional)</span>
          </label>
          <input
            type="text"
            value={period}
            onChange={(e) => setPeriod(e.target.value)}
            placeholder="e.g. 1975 – 1988, or Summer of 1992"
            className="focus:outline-none focus:border-[#4F39F6]"
            style={inputStyle}
          />
        </div>

        {/* Theme */}
        <div className="flex flex-col" style={{ gap: 12 }}>
          <label style={labelStyle}>
            Select a theme for this chapter <span style={optionalStyle}>(optional)</span>
          </label>
          <div className="flex flex-wrap" style={{ gap: 8 }}>
            {THEMES.map((t) => {
              const selected = theme === t.value
              return (
                <button
                  key={t.value}
                  type="button"
                  onClick={() => setTheme(selected ? null : t.value)}
                  className="cursor-pointer transition-colors"
                  style={{
                    height: 35.98,
                    borderRadius: 9999,
                    padding: '8px 16px',
                    background: selected ? '#4F46E5' : '#F3F4F6',
                    fontFamily: 'Inter, sans-serif',
                    fontWeight: 500,
                    fontSize: 14,
                    lineHeight: '20px',
                    letterSpacing: '-0.15px',
                    textAlign: 'center',
                    color: selected ? '#FFFFFF' : '#364153',
                  }}
                >
                  {t.label}
                </button>
              )
            })}
          </div>
        </div>

        {/* Method */}
        <div className="flex flex-col" style={{ gap: 12 }}>
          <label style={labelStyle}>How would you like to create this chapter?</label>
          <div className="grid grid-cols-1 sm:grid-cols-2" style={{ gap: 18 }}>
            <MethodCard
              selected={method === 'write'}
              icon={<Keyboard style={{ width: 24, height: 24 }} color={method === 'write' ? '#FFFFFF' : '#4A5565'} strokeWidth={2} />}
              title="Write your answers"
              subtitle="Type your responses"
              titleColor={method === 'write' ? '#312C85' : '#101828'}
              onClick={() => setMethod('write')}
            />
            <MethodCard
              selected={method === 'record'}
              icon={<Mic style={{ width: 24, height: 24 }} color={method === 'record' ? '#FFFFFF' : '#4A5565'} strokeWidth={2} />}
              title="Record your voice"
              subtitle="Speak your responses naturally"
              titleColor={method === 'record' ? '#312C85' : '#101828'}
              onClick={() => setMethod('record')}
            />
          </div>
        </div>

        {/* CTA */}
        <button
          type="button"
          disabled={!canStart}
          onClick={onStart}
          className="flex items-center justify-center gap-2 cursor-pointer hover:opacity-90 disabled:cursor-not-allowed"
          style={{
            height: 47.97,
            borderRadius: 8,
            background: '#4F39F6',
            opacity: canStart ? 1 : 0.5,
            fontFamily: 'Inter, sans-serif',
            fontWeight: 500,
            fontSize: 18,
            lineHeight: '28px',
            letterSpacing: '-0.44px',
            textAlign: 'center',
            color: '#FFFFFF',
          }}
        >
          {submitting && <Loader2 className="w-5 h-5 animate-spin" />}
          {method === 'record' ? 'Start recording this chapter' : 'Start writing this chapter'}
        </button>
      </div>
    </div>
  )
}

const labelStyle: React.CSSProperties = {
  fontFamily: 'Inter, sans-serif',
  fontWeight: 500,
  fontSize: 14,
  lineHeight: '20px',
  letterSpacing: '-0.15px',
  color: '#364153',
}

const optionalStyle: React.CSSProperties = {
  fontFamily: 'Inter, sans-serif',
  fontWeight: 500,
  fontSize: 14,
  lineHeight: '20px',
  letterSpacing: '-0.15px',
  color: '#99A1AF',
}

function MethodCard({
  selected,
  icon,
  title,
  subtitle,
  titleColor,
  onClick,
}: {
  selected: boolean
  icon: React.ReactNode
  title: string
  subtitle: string
  titleColor: string
  onClick: () => void
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="flex flex-col items-center justify-center text-center cursor-pointer transition-colors"
      style={{
        minHeight: 155,
        borderRadius: 10,
        border: selected ? '1.25px solid #4F39F6' : '1.25px solid #E5E7EB',
        background: selected ? '#EEF2FF' : '#FFFFFF',
        padding: '25.23px',
        gap: 11.99,
      }}
    >
      <span
        className="flex items-center justify-center flex-shrink-0"
        style={{ width: 47.99, height: 47.99, borderRadius: 9999, background: selected ? '#4F39F6' : '#F3F4F6' }}
      >
        {icon}
      </span>
      <span style={{ fontFamily: 'Inter, sans-serif', fontWeight: 600, fontSize: 16, lineHeight: '24px', letterSpacing: '-0.31px', color: titleColor }}>
        {title}
      </span>
      <span style={{ fontFamily: 'Inter, sans-serif', fontWeight: 500, fontSize: 12, lineHeight: '16px', color: '#4A5565' }}>
        {subtitle}
      </span>
    </button>
  )
}

/* ====================== Step 2 — Record voice ====================== */

function formatDuration(seconds: number): string {
  const m = Math.floor(seconds / 60)
  const s = Math.floor(seconds % 60)
  return `${m}:${s.toString().padStart(2, '0')}`
}

function RecordStep({
  title,
  meta,
  onCancel,
  onError,
  onCreated,
}: {
  title: string
  meta: { title: string; date_label?: string; theme?: string }
  onCancel: () => void
  onError: (message: string) => void
  onCreated: (chapterId: string) => void
}) {
  const [phase, setPhase] = useState<'idle' | 'recording' | 'recorded' | 'uploading'>('idle')
  const [elapsed, setElapsed] = useState(0)
  const [blob, setBlob] = useState<Blob | null>(null)
  const [previewUrl, setPreviewUrl] = useState<string | null>(null)

  const recorderRef = useRef<MediaRecorder | null>(null)
  const streamRef = useRef<MediaStream | null>(null)
  const chunksRef = useRef<BlobPart[]>([])
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null)
  const durationRef = useRef(0)

  const stopTracks = () => {
    streamRef.current?.getTracks().forEach((t) => t.stop())
    streamRef.current = null
  }

  useEffect(() => {
    return () => {
      if (timerRef.current) clearInterval(timerRef.current)
      stopTracks()
      if (previewUrl) URL.revokeObjectURL(previewUrl)
    }
  }, [previewUrl])

  const start = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true })
      streamRef.current = stream
      const mimeType = MediaRecorder.isTypeSupported('audio/webm')
        ? 'audio/webm'
        : ''
      const recorder = new MediaRecorder(stream, mimeType ? { mimeType } : undefined)
      chunksRef.current = []
      recorder.ondataavailable = (e) => {
        if (e.data.size > 0) chunksRef.current.push(e.data)
      }
      recorder.onstop = () => {
        const type = recorder.mimeType || 'audio/webm'
        const recorded = new Blob(chunksRef.current, { type })
        setBlob(recorded)
        setPreviewUrl(URL.createObjectURL(recorded))
        setPhase('recorded')
        stopTracks()
      }
      recorder.start()
      recorderRef.current = recorder
      durationRef.current = 0
      setElapsed(0)
      setPhase('recording')
      timerRef.current = setInterval(() => {
        durationRef.current += 1
        setElapsed(durationRef.current)
      }, 1000)
    } catch {
      onError('Microphone access was denied or is unavailable.')
    }
  }

  const stop = () => {
    if (timerRef.current) clearInterval(timerRef.current)
    recorderRef.current?.stop()
  }

  const reset = () => {
    if (previewUrl) URL.revokeObjectURL(previewUrl)
    setBlob(null)
    setPreviewUrl(null)
    setElapsed(0)
    durationRef.current = 0
    setPhase('idle')
  }

  const upload = async () => {
    if (!blob) return
    setPhase('uploading')
    const token = await getToken()
    if (!token) {
      setPhase('recorded')
      onError('Your session has expired. Please sign in again.')
      return
    }
    const fileType = blob.type || 'audio/webm'
    const ext = fileType.includes('mp4') ? 'mp4' : fileType.includes('ogg') ? 'ogg' : 'webm'
    const fileName = `recording.${ext}`
    try {
      const { upload_url, storage_path } = await getVoiceUploadUrl(token, {
        title: meta.title,
        date_label: meta.date_label,
        theme: meta.theme,
        file_name: fileName,
        file_type: fileType,
        file_size_bytes: blob.size,
      })
      const put = await fetch(upload_url, {
        method: 'PUT',
        headers: { 'Content-Type': fileType },
        body: blob,
      })
      if (!put.ok) throw new Error('Upload failed')

      const chapter = await createVoiceChapter(token, {
        title: meta.title,
        date_label: meta.date_label,
        theme: meta.theme,
        storage_path,
        file_type: fileType,
        file_size_bytes: blob.size,
        duration_seconds: durationRef.current,
      })
      onCreated(chapter.id)
    } catch (e) {
      setPhase('recorded')
      onError(e instanceof ApiError ? e.message : 'Could not upload your recording.')
    }
  }

  return (
    <div className="w-full max-w-[680px] mx-auto flex flex-col" style={{ gap: 30 }}>
      <div className="flex flex-col" style={{ gap: 16 }}>
        <BackLink onClick={onCancel} />
        <h1
          style={{
            fontFamily: '"Instrument Serif", serif',
            fontWeight: 400,
            fontSize: 38,
            lineHeight: '42px',
            color: '#101828',
          }}
        >
          Recording — <span style={{ color: '#4F46E5' }}>{title}</span>
        </h1>
        <p style={{ fontFamily: 'Inter, sans-serif', fontSize: 16, lineHeight: '24px', letterSpacing: '-0.31px', color: '#4A5565' }}>
          Speak naturally. When you&apos;re done, we&apos;ll transcribe your recording into a chapter you can edit.
        </p>
      </div>

      <div
        className="flex flex-col items-center"
        style={{ borderRadius: 14, border: '1.25px solid #E5E7EB', background: '#FFFFFF', padding: 40, gap: 24 }}
      >
        {/* Mic circle */}
        <div
          className="flex items-center justify-center"
          style={{
            width: 96,
            height: 96,
            borderRadius: 9999,
            background: phase === 'recording' ? '#FEE2E2' : '#EEF2FF',
            transition: 'background 0.2s',
          }}
        >
          <Mic style={{ width: 40, height: 40 }} color={phase === 'recording' ? '#DC2626' : '#4F46E5'} strokeWidth={2} />
        </div>

        {/* Timer */}
        <span style={{ fontFamily: 'Inter, sans-serif', fontWeight: 600, fontSize: 32, lineHeight: '40px', color: '#101828', fontVariantNumeric: 'tabular-nums' }}>
          {formatDuration(elapsed)}
        </span>

        {/* Preview */}
        {phase === 'recorded' && previewUrl && (
          <audio controls src={previewUrl} className="w-full" />
        )}

        {/* Controls */}
        <div className="flex items-center gap-3 flex-wrap justify-center">
          {phase === 'idle' && (
            <ActionButton primary icon={<Play className="w-4 h-4" color="#FFFFFF" />} label="Start recording" onClick={start} />
          )}
          {phase === 'recording' && (
            <ActionButton primary danger icon={<Square className="w-4 h-4" color="#FFFFFF" />} label="Stop recording" onClick={stop} />
          )}
          {phase === 'recorded' && (
            <>
              <ActionButton icon={<Trash2 className="w-4 h-4" color="#0A0A0A" />} label="Re-record" onClick={reset} />
              <ActionButton primary icon={<Play className="w-4 h-4" color="#FFFFFF" />} label="Use this recording" onClick={upload} />
            </>
          )}
          {phase === 'uploading' && (
            <span className="flex items-center gap-2" style={{ fontFamily: 'Inter, sans-serif', fontSize: 14, color: '#4A5565' }}>
              <Loader2 className="w-5 h-5 animate-spin text-[#4F39F6]" />
              Uploading & starting transcription…
            </span>
          )}
        </div>
      </div>
    </div>
  )
}

function ActionButton({
  primary,
  danger,
  icon,
  label,
  onClick,
}: {
  primary?: boolean
  danger?: boolean
  icon: React.ReactNode
  label: string
  onClick: () => void
}) {
  const bg = danger ? '#DC2626' : primary ? '#4F39F6' : '#FFFFFF'
  const color = primary || danger ? '#FFFFFF' : '#0A0A0A'
  return (
    <button
      type="button"
      onClick={onClick}
      className="flex items-center justify-center gap-2 cursor-pointer hover:opacity-90"
      style={{
        height: 40,
        padding: '8px 20px',
        borderRadius: 8,
        background: bg,
        border: primary || danger ? '1.25px solid transparent' : '1.25px solid rgba(0,0,0,0.1)',
        fontFamily: 'Inter, sans-serif',
        fontWeight: 500,
        fontSize: 14,
        lineHeight: '20px',
        letterSpacing: '-0.15px',
        color,
      }}
    >
      {icon}
      {label}
    </button>
  )
}
