'use client'

import { useCallback, useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { ArrowLeft, Download, GripVertical, Loader2, Trash2, X } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import { useToast } from '@/lib/context/ToastContext'
import { ApiError } from '@/lib/api/client'
import { listChapters, reorderChapters } from '@/lib/api/chapters'
import {
  deleteMemoir,
  downloadMemoirPdf,
  downloadMemoirText,
  getMemoir,
  updateMemoir,
} from '@/lib/api/memoir'

/* ---------------------- Helpers ---------------------- */

async function getToken(): Promise<string | null> {
  const supabase = createClient()
  const {
    data: { session },
  } = await supabase.auth.getSession()
  return session?.access_token ?? null
}

const DELETE_PHRASE = 'delete my story'

interface SettingsChapter {
  id: string
  title: string
}

/* ---------------------- Page ---------------------- */

export default function StorySettingsPage() {
  const router = useRouter()
  const { showToast } = useToast()

  const [loading, setLoading] = useState(true)
  const [title, setTitle] = useState('')
  const [dedication, setDedication] = useState('')
  const [initial, setInitial] = useState({ title: '', dedication: '' })
  const [chapters, setChapters] = useState<SettingsChapter[]>([])
  const [initialOrder, setInitialOrder] = useState<string[]>([])
  const [dragIndex, setDragIndex] = useState<number | null>(null)
  const [saving, setSaving] = useState(false)
  const [downloading, setDownloading] = useState<'pdf' | 'text' | null>(null)
  const [confirmOpen, setConfirmOpen] = useState(false)

  const load = useCallback(async () => {
    const token = await getToken()
    if (!token) {
      setLoading(false)
      showToast('Your session has expired. Please sign in again.', 'error')
      return
    }
    try {
      const [memoir, list] = await Promise.all([getMemoir(token), listChapters(token)])
      setTitle(memoir.title ?? '')
      setDedication(memoir.dedication ?? '')
      setInitial({ title: memoir.title ?? '', dedication: memoir.dedication ?? '' })
      const cs = list.chapters.map((c) => ({ id: c.id, title: c.title }))
      setChapters(cs)
      setInitialOrder(cs.map((c) => c.id))
    } catch (e) {
      showToast(e instanceof ApiError ? e.message : 'Could not load your settings.', 'error')
    } finally {
      setLoading(false)
    }
  }, [showToast])

  useEffect(() => {
    load()
  }, [load])

  function handleDrop(targetIndex: number) {
    if (dragIndex === null || dragIndex === targetIndex) {
      setDragIndex(null)
      return
    }
    setChapters((prev) => {
      const next = [...prev]
      const [moved] = next.splice(dragIndex, 1)
      next.splice(targetIndex, 0, moved)
      return next
    })
    setDragIndex(null)
  }

  const orderChanged =
    chapters.map((c) => c.id).join(',') !== initialOrder.join(',')
  const metaChanged = title !== initial.title || dedication !== initial.dedication

  const handleSave = async () => {
    if (saving) return
    if (!metaChanged && !orderChanged) {
      router.push('/story')
      return
    }
    setSaving(true)
    const token = await getToken()
    if (!token) {
      setSaving(false)
      showToast('Your session has expired. Please sign in again.', 'error')
      return
    }
    try {
      if (metaChanged) {
        await updateMemoir(token, { title: title.trim(), dedication: dedication.trim() })
      }
      if (orderChanged) {
        await reorderChapters(
          token,
          chapters.map((c, i) => ({ id: c.id, display_order: i })),
        )
      }
      showToast('Changes saved', 'success')
      router.push('/story')
    } catch (e) {
      setSaving(false)
      showToast(e instanceof ApiError ? e.message : 'Could not save changes.', 'error')
    }
  }

  const handleDownload = async (kind: 'pdf' | 'text') => {
    if (downloading) return
    setDownloading(kind)
    const token = await getToken()
    if (!token) {
      setDownloading(null)
      showToast('Your session has expired. Please sign in again.', 'error')
      return
    }
    try {
      if (kind === 'pdf') await downloadMemoirPdf(token)
      else await downloadMemoirText(token)
    } catch {
      showToast('Download failed. Please try again.', 'error')
    } finally {
      setDownloading(null)
    }
  }

  const handleDelete = async () => {
    const token = await getToken()
    if (!token) {
      showToast('Your session has expired. Please sign in again.', 'error')
      return
    }
    await deleteMemoir(token, DELETE_PHRASE)
    showToast('Your story has been permanently deleted.', 'success')
    router.push('/story')
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center" style={{ minHeight: 'calc(100vh - 200px)' }}>
        <Loader2 className="w-6 h-6 animate-spin text-[#4F39F6]" />
      </div>
    )
  }

  return (
    <div className="mx-auto w-full flex flex-col" style={{ maxWidth: 832, gap: 25 }}>
      {/* Back link */}
      <button
        type="button"
        onClick={() => router.push('/story')}
        className="flex items-center cursor-pointer hover:opacity-80 self-start"
        style={{ gap: 8, background: 'transparent' }}
      >
        <ArrowLeft style={{ width: 16, height: 16, flexShrink: 0 }} color="#4A5565" strokeWidth={2} />
        <span style={{ fontFamily: 'Inter, sans-serif', fontWeight: 500, fontSize: 14, lineHeight: '20px', letterSpacing: '-0.15px', color: '#4A5565' }}>
          Back to My Story
        </span>
      </button>

      {/* Heading */}
      <div className="flex flex-col" style={{ gap: 7.99 }}>
        <h1 style={{ fontFamily: '"Instrument Serif", serif', fontWeight: 400, fontSize: 38, lineHeight: '48px', color: '#101828' }}>
          My Story Settings
        </h1>
        <p style={{ fontFamily: 'Inter, sans-serif', fontWeight: 400, fontSize: 16, lineHeight: '24px', letterSpacing: '-0.31px', color: '#4A5565' }}>
          Customize how your memoir appears and behaves
        </p>
      </div>

      {/* Story Information */}
      <Card>
        <CardTitle>Story Information</CardTitle>
        <div className="flex flex-col" style={{ gap: 16 }}>
          <Field label="Story title" helper="This appears at the top of your memoir" value={title} onChange={setTitle} maxLength={255} />
          <Field
            label="Dedication line"
            optional
            helper="Shown below the title before your chapters begin"
            placeholder="For my children and their children"
            value={dedication}
            onChange={setDedication}
            maxLength={500}
          />
        </div>
      </Card>

      {/* Chapter Order */}
      <Card>
        <div className="flex flex-col" style={{ gap: 4 }}>
          <CardTitle>Chapter Order</CardTitle>
          <p style={{ fontFamily: 'Inter, sans-serif', fontWeight: 400, fontSize: 14, lineHeight: '20px', letterSpacing: '-0.15px', color: '#4A5565' }}>
            Drag to reorder how chapters appear in your story
          </p>
        </div>

        {chapters.length === 0 ? (
          <p style={{ fontFamily: 'Inter, sans-serif', fontSize: 14, color: '#6A7282' }}>No chapters yet.</p>
        ) : (
          <div className="flex flex-col" style={{ gap: 7.99 }}>
            {chapters.map((c, i) => (
              <div
                key={c.id}
                draggable
                onDragStart={() => setDragIndex(i)}
                onDragOver={(e) => e.preventDefault()}
                onDrop={() => handleDrop(i)}
                onDragEnd={() => setDragIndex(null)}
                className="flex items-center"
                style={{
                  padding: '12px 11.99px',
                  gap: 11.99,
                  borderRadius: 10,
                  border: '1.25px solid #E5E7EB',
                  background: '#F9FAFB',
                  cursor: 'grab',
                  opacity: dragIndex === i ? 0.5 : 1,
                }}
              >
                <GripVertical style={{ width: 20, height: 20, flexShrink: 0 }} color="#99A1AF" strokeWidth={2} />
                <span style={{ minWidth: 0 }}>
                  <span style={{ fontFamily: 'Inter, sans-serif', fontWeight: 400, fontSize: 14, lineHeight: '20px', letterSpacing: '-0.15px', color: '#6A7282' }}>
                    Chapter {i + 1}:{' '}
                  </span>
                  <span style={{ fontFamily: 'Inter, sans-serif', fontWeight: 400, fontSize: 16, lineHeight: '24px', letterSpacing: '-0.31px', color: '#101828' }}>
                    {c.title}
                  </span>
                </span>
              </div>
            ))}
          </div>
        )}
      </Card>

      {/* Download My Story */}
      <Card>
        <div className="flex flex-col" style={{ gap: 4 }}>
          <CardTitle>Download My Story</CardTitle>
          <p style={{ fontFamily: 'Inter, sans-serif', fontWeight: 400, fontSize: 14, lineHeight: '20px', letterSpacing: '-0.15px', color: '#4A5565' }}>
            Download all completed chapters as a single file
          </p>
        </div>

        <div className="flex items-center flex-wrap" style={{ gap: 11.99 }}>
          <DownloadButton label="Download as PDF" busy={downloading === 'pdf'} onClick={() => handleDownload('pdf')} />
          <DownloadButton label="Download as Text" busy={downloading === 'text'} onClick={() => handleDownload('text')} />
        </div>
      </Card>

      {/* Delete + footer */}
      <div className="flex flex-col" style={{ gap: 35 }}>
        <div
          className="flex flex-col"
          style={{ borderRadius: 14, border: '1.25px solid #FFC9C9', background: '#FEF2F2', padding: 23.98, gap: 16 }}
        >
          <h3 style={{ fontFamily: 'Inter, sans-serif', fontWeight: 600, fontSize: 20, lineHeight: '30px', letterSpacing: '-0.45px', color: '#82181A' }}>
            Delete Story
          </h3>
          <p style={{ fontFamily: 'Inter, sans-serif', fontWeight: 400, fontSize: 14, lineHeight: '20px', letterSpacing: '-0.15px', color: '#C10007' }}>
            Permanently delete your entire story and all chapters. This action cannot be undone.
          </p>
          <button
            type="button"
            onClick={() => setConfirmOpen(true)}
            className="flex items-center justify-center cursor-pointer hover:opacity-90"
            style={{ height: 35.99, gap: 8, borderRadius: 8, border: '1.25px solid #FFA2A2', background: '#FFFFFF', width: '100%' }}
          >
            <Trash2 style={{ width: 16, height: 16, flexShrink: 0 }} color="#C10007" strokeWidth={2} />
            <span style={{ fontFamily: 'Inter, sans-serif', fontWeight: 500, fontSize: 14, lineHeight: '20px', letterSpacing: '-0.15px', textAlign: 'center', color: '#C10007' }}>
              Delete My Story
            </span>
          </button>
        </div>

        {/* Footer actions */}
        <div className="flex items-center justify-end flex-wrap" style={{ paddingTop: 32, gap: 11.99, borderTop: '1.25px solid #E5E7EB' }}>
          <button
            type="button"
            onClick={() => router.push('/story')}
            className="flex items-center justify-center cursor-pointer hover:bg-gray-50"
            style={{
              height: 35.99,
              padding: '8px 16px',
              gap: 8,
              borderRadius: 8,
              border: '1.25px solid rgba(0,0,0,0.1)',
              background: '#FFFFFF',
              fontFamily: 'Inter, sans-serif',
              fontWeight: 500,
              fontSize: 14,
              lineHeight: '20px',
              letterSpacing: '-0.15px',
              textAlign: 'center',
              color: '#0A0A0A',
            }}
          >
            Cancel
          </button>
          <button
            type="button"
            disabled={saving}
            onClick={handleSave}
            className="flex items-center justify-center gap-2 cursor-pointer hover:opacity-90 disabled:opacity-60"
            style={{
              height: 35.99,
              padding: '8px 16px',
              borderRadius: 8,
              background: '#4F39F6',
              fontFamily: 'Inter, sans-serif',
              fontWeight: 500,
              fontSize: 14,
              lineHeight: '20px',
              letterSpacing: '-0.15px',
              textAlign: 'center',
              color: '#FFFFFF',
            }}
          >
            {saving && <Loader2 className="w-4 h-4 animate-spin" />}
            Save changes
          </button>
        </div>
      </div>

      {confirmOpen && (
        <DeleteConfirmModal onClose={() => setConfirmOpen(false)} onConfirm={handleDelete} />
      )}
    </div>
  )
}

/* ---------------------- Delete confirm modal ---------------------- */

function DeleteConfirmModal({ onClose, onConfirm }: { onClose: () => void; onConfirm: () => Promise<void> }) {
  const { showToast } = useToast()
  const [value, setValue] = useState('')
  const [busy, setBusy] = useState(false)

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose()
    }
    document.addEventListener('keydown', onKey)
    const prev = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    return () => {
      document.removeEventListener('keydown', onKey)
      document.body.style.overflow = prev
    }
  }, [onClose])

  const confirm = async () => {
    if (value.trim() !== DELETE_PHRASE || busy) return
    setBusy(true)
    try {
      await onConfirm()
    } catch (e) {
      setBusy(false)
      showToast(e instanceof ApiError ? e.message : 'Could not delete your story.', 'error')
    }
  }

  return (
    <div
      className="fixed inset-0 z-50 overflow-y-auto"
      style={{ background: 'rgba(0,0,0,0.4)' }}
      onMouseDown={(e) => {
        if (e.target === e.currentTarget) onClose()
      }}
    >
      <div
        className="flex min-h-full items-center justify-center px-4 py-10"
        onMouseDown={(e) => {
          if (e.target === e.currentTarget) onClose()
        }}
      >
        <div
          className="relative bg-white w-full flex flex-col"
          style={{ maxWidth: 448, borderRadius: 10, boxShadow: '0px 8px 10px -6px rgba(0,0,0,0.1), 0px 20px 25px -5px rgba(0,0,0,0.1)', padding: 24, gap: 16, fontFamily: 'Inter, sans-serif' }}
        >
          <button
            type="button"
            onClick={onClose}
            aria-label="Close"
            className="absolute cursor-pointer top-5 right-5"
            style={{ width: 22, height: 22, opacity: 0.7 }}
          >
            <X className="w-[22px] h-[22px] text-[#0A0A0A]" strokeWidth={2} />
          </button>

          <h2 style={{ fontWeight: 600, fontSize: 20, lineHeight: '28px', letterSpacing: '-0.45px', color: '#82181A' }}>
            Delete your entire story?
          </h2>
          <p style={{ fontWeight: 400, fontSize: 14, lineHeight: '20px', color: '#4A5565' }}>
            This permanently removes your memoir, every chapter, all exhibits, audio and assignments. This cannot be undone.
            Type <span style={{ fontWeight: 600, color: '#C10007' }}>{DELETE_PHRASE}</span> to confirm.
          </p>
          <input
            type="text"
            value={value}
            onChange={(e) => setValue(e.target.value)}
            placeholder={DELETE_PHRASE}
            className="focus:outline-none focus:border-[#C10007]"
            style={{ width: '100%', height: 40, borderRadius: 8, border: '1.25px solid #D1D5DC', background: '#F3F3F5', padding: '0 12px', fontSize: 14, color: '#0A0A0A' }}
          />
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 flex items-center justify-center cursor-pointer hover:bg-gray-50"
              style={{ minHeight: 36, borderRadius: 8, border: '1.25px solid rgba(0,0,0,0.1)', background: '#FFFFFF', padding: '8px 16px', fontWeight: 500, fontSize: 14, color: '#0A0A0A' }}
            >
              Cancel
            </button>
            <button
              type="button"
              disabled={value.trim() !== DELETE_PHRASE || busy}
              onClick={confirm}
              className="flex-1 flex items-center justify-center gap-2 cursor-pointer hover:opacity-90 disabled:opacity-50 disabled:cursor-not-allowed"
              style={{ minHeight: 36, borderRadius: 8, background: '#C10007', padding: '8px 16px', fontWeight: 500, fontSize: 14, color: '#FFFFFF' }}
            >
              {busy && <Loader2 className="w-4 h-4 animate-spin" />}
              Delete forever
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

/* ---------------------- Building blocks ---------------------- */

function Card({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex flex-col" style={{ borderRadius: 14, border: '1.25px solid rgba(0,0,0,0.1)', background: '#FFFFFF', padding: 23.98, gap: 25 }}>
      {children}
    </div>
  )
}

function CardTitle({ children }: { children: React.ReactNode }) {
  return (
    <h2 style={{ fontFamily: 'Inter, sans-serif', fontWeight: 600, fontSize: 20, lineHeight: '30px', letterSpacing: '-0.45px', color: '#101828' }}>
      {children}
    </h2>
  )
}

function Field({
  label,
  optional,
  helper,
  placeholder,
  value,
  onChange,
  maxLength,
}: {
  label: string
  optional?: boolean
  helper: string
  placeholder?: string
  value: string
  onChange: (v: string) => void
  maxLength?: number
}) {
  return (
    <div className="flex flex-col" style={{ gap: 8 }}>
      <label style={{ fontFamily: 'Inter, sans-serif', fontWeight: 500, fontSize: 14, lineHeight: '20px', letterSpacing: '-0.15px', color: '#364153' }}>
        {label}
        {optional && <span style={{ color: '#99A1AF' }}> (optional)</span>}
      </label>
      <input
        type="text"
        value={value}
        placeholder={placeholder}
        maxLength={maxLength}
        onChange={(e) => onChange(e.target.value)}
        style={{
          height: 35.99,
          padding: '4px 12px',
          borderRadius: 8,
          border: '1.25px solid rgba(0,0,0,0.1)',
          background: '#F3F3F5',
          fontFamily: 'Georgia, serif',
          fontWeight: 400,
          fontSize: 14,
          lineHeight: '20px',
          color: '#0A0A0A',
          width: '100%',
          outline: 'none',
        }}
      />
      <p style={{ fontFamily: 'Inter, sans-serif', fontWeight: 400, fontSize: 12, lineHeight: '16px', color: '#6A7282' }}>{helper}</p>
    </div>
  )
}

function DownloadButton({ label, busy, onClick }: { label: string; busy: boolean; onClick: () => void }) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={busy}
      className="flex items-center justify-center cursor-pointer hover:bg-gray-50 disabled:opacity-60"
      style={{ height: 36, padding: '0 12px', gap: 8, borderRadius: 8, border: '1.25px solid rgba(0,0,0,0.1)', background: '#FFFFFF', flexShrink: 0 }}
    >
      {busy ? (
        <Loader2 className="w-4 h-4 animate-spin text-[#0A0A0A]" />
      ) : (
        <Download style={{ width: 16, height: 16, flexShrink: 0 }} color="#0A0A0A" strokeWidth={2} />
      )}
      <span style={{ fontFamily: 'Inter, sans-serif', fontWeight: 500, fontSize: 14, lineHeight: '20px', letterSpacing: '-0.15px', textAlign: 'center', color: '#0A0A0A', whiteSpace: 'nowrap' }}>
        {label}
      </span>
    </button>
  )
}
