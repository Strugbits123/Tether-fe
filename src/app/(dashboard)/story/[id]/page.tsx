'use client'

import { useCallback, useEffect, useRef, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import {
  AlignCenter,
  AlignLeft,
  AlignRight,
  ArrowLeft,
  Bold,
  Clock,
  FileText,
  Image as ImageIcon,
  Indent,
  Italic,
  List,
  ListOrdered,
  Loader2,
  MoreVertical,
  Outdent,
  Palette,
  Save,
  Strikethrough,
  Trash2,
  Underline,
  Upload,
  Users,
  X,
} from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import { useToast } from '@/lib/context/ToastContext'
import { ApiError } from '@/lib/api/client'
import {
  autosaveChapter,
  createExhibit,
  deleteChapter,
  deleteExhibit,
  getChapter,
  getExhibitUploadUrl,
  getTranscriptionStatus,
  updateChapter,
  type ChapterDetail,
  type ChapterExhibit,
  type ChapterStatus,
} from '@/lib/api/chapters'
import { formatFileSize } from '@/lib/utils/assignments'

/* ---------------------- Helpers ---------------------- */

async function getToken(): Promise<string | null> {
  const supabase = createClient()
  const {
    data: { session },
  } = await supabase.auth.getSession()
  return session?.access_token ?? null
}

function countWords(text: string): number {
  return text
    .trim()
    .split(/\s+/)
    .filter((w) => w.length > 0).length
}

const ALLOWED_EXHIBIT_TYPES = [
  'image/jpeg',
  'image/png',
  'image/webp',
  'image/heic',
  'application/pdf',
]
const MAX_EXHIBIT_BYTES = 10 * 1024 * 1024

/* ---------------------- Page ---------------------- */

export default function ChapterEditorPage() {
  const router = useRouter()
  const params = useParams<{ id: string }>()
  const chapterId = params.id
  const { showToast } = useToast()

  const [chapter, setChapter] = useState<ChapterDetail | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const load = useCallback(async () => {
    const token = await getToken()
    if (!token) {
      setError('Your session has expired. Please sign in again.')
      setLoading(false)
      return
    }
    try {
      const data = await getChapter(token, chapterId)
      setChapter(data)
    } catch (e) {
      setError(e instanceof ApiError ? e.message : 'Failed to load this chapter.')
    } finally {
      setLoading(false)
    }
  }, [chapterId])

  useEffect(() => {
    load()
  }, [load])

  const goToStory = () => router.push('/story')

  if (loading) {
    return (
      <div className="flex items-center justify-center" style={{ minHeight: 'calc(100vh - 200px)' }}>
        <Loader2 className="w-6 h-6 animate-spin text-[#4F39F6]" />
      </div>
    )
  }

  if (error || !chapter) {
    return (
      <div className="w-full max-w-[680px] mx-auto flex flex-col items-center text-center" style={{ gap: 16, paddingTop: 80 }}>
        <p style={{ fontFamily: 'Inter, sans-serif', fontSize: 16, color: '#4A5565' }}>
          {error ?? 'Chapter not found.'}
        </p>
        <BackLink onClick={goToStory} />
      </div>
    )
  }

  const isTranscribing =
    chapter.type === 'voice' &&
    chapter.transcription_status !== 'completed' &&
    chapter.transcription_status !== 'failed'

  return (
    <ChapterEditor
      key={chapter.id}
      chapter={chapter}
      isTranscribing={isTranscribing}
      onReload={load}
      onBack={goToStory}
      onDeleted={() => {
        showToast('Chapter deleted', 'success')
        goToStory()
      }}
    />
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

/* ---------------------- Editor shell ---------------------- */

type SaveState = 'idle' | 'saving' | 'saved'

function ChapterEditor({
  chapter,
  isTranscribing,
  onReload,
  onBack,
  onDeleted,
}: {
  chapter: ChapterDetail
  isTranscribing: boolean
  onReload: () => void
  onBack: () => void
  onDeleted: () => void
}) {
  const { showToast } = useToast()
  const router = useRouter()
  const chapterId = chapter.id

  const [title, setTitle] = useState(chapter.title)
  const [period, setPeriod] = useState(chapter.date_label ?? '')
  const [status, setStatus] = useState<ChapterStatus>(chapter.status)
  const [wordCount, setWordCount] = useState(chapter.word_count)
  const [saveState, setSaveState] = useState<SaveState>('idle')
  const [lastSaved, setLastSaved] = useState<string | null>(chapter.updated_at)

  const [menuOpen, setMenuOpen] = useState(false)
  const [exhibitsOpen, setExhibitsOpen] = useState(false)
  const [deleting, setDeleting] = useState(false)

  const [exhibits, setExhibits] = useState<ChapterExhibit[]>(chapter.exhibits ?? [])
  const assignmentCount = chapter.assignment_count ?? 0

  const menuRef = useRef<HTMLDivElement>(null)
  const bodyRef = useRef<string>(chapter.body ?? '')
  const autosaveTimer = useRef<ReturnType<typeof setTimeout> | null>(null)

  // Close the "more" menu on outside click.
  useEffect(() => {
    const handle = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) setMenuOpen(false)
    }
    if (menuOpen) document.addEventListener('mousedown', handle)
    return () => document.removeEventListener('mousedown', handle)
  }, [menuOpen])

  // Poll transcription for voice chapters until it completes/fails.
  useEffect(() => {
    if (!isTranscribing) return
    let active = true
    const interval = setInterval(async () => {
      const token = await getToken()
      if (!token) return
      try {
        const res = await getTranscriptionStatus(token, chapterId)
        if (!active) return
        if (res.transcription_status === 'completed') {
          clearInterval(interval)
          onReload() // re-fetch to load the transcribed body
        } else if (res.transcription_status === 'failed') {
          clearInterval(interval)
          showToast('Transcription failed. You can still edit this chapter.', 'error')
          onReload()
        }
      } catch {
        /* transient — keep polling */
      }
    }, 3000)
    return () => {
      active = false
      clearInterval(interval)
    }
  }, [isTranscribing, chapterId, onReload, showToast])

  const runAutosave = useCallback(
    async (body: string, words: number) => {
      const token = await getToken()
      if (!token) return
      setSaveState('saving')
      try {
        const res = await autosaveChapter(token, chapterId, { body, word_count: words })
        setSaveState('saved')
        setLastSaved(res.updated_at)
        if (res.status && status === 'draft') setStatus(res.status)
      } catch {
        setSaveState('idle')
        showToast('Could not save your changes. Retrying on next edit.', 'error')
      }
    },
    [chapterId, status, showToast],
  )

  const handleBodyChange = useCallback(
    (html: string, text: string) => {
      bodyRef.current = html
      const words = countWords(text)
      setWordCount(words)
      setSaveState('saving')
      if (autosaveTimer.current) clearTimeout(autosaveTimer.current)
      autosaveTimer.current = setTimeout(() => runAutosave(html, words), 3000)
    },
    [runAutosave],
  )

  // Flush a pending autosave on unmount.
  useEffect(() => {
    return () => {
      if (autosaveTimer.current) clearTimeout(autosaveTimer.current)
    }
  }, [])

  const saveMeta = useCallback(
    async (patch: { title?: string; date_label?: string }) => {
      const token = await getToken()
      if (!token) return
      try {
        await updateChapter(token, chapterId, patch)
      } catch {
        showToast('Could not save chapter details.', 'error')
      }
    },
    [chapterId, showToast],
  )

  const toggleComplete = useCallback(async () => {
    const token = await getToken()
    if (!token) return
    const next: ChapterStatus = status === 'complete' ? 'in_progress' : 'complete'
    const prev = status
    setStatus(next)
    try {
      await updateChapter(token, chapterId, { status: next })
      showToast(next === 'complete' ? 'Chapter marked complete' : 'Chapter reopened', 'success')
    } catch {
      setStatus(prev)
      showToast('Could not update status.', 'error')
    }
  }, [chapterId, status, showToast])

  const handleDelete = useCallback(async () => {
    if (deleting) return
    setDeleting(true)
    const token = await getToken()
    if (!token) {
      setDeleting(false)
      return
    }
    try {
      await deleteChapter(token, chapterId)
      onDeleted()
    } catch (e) {
      setDeleting(false)
      showToast(e instanceof ApiError ? e.message : 'Could not delete chapter.', 'error')
    }
  }, [chapterId, deleting, onDeleted, showToast])

  return (
    <div className="w-full max-w-[1024px] mx-auto flex flex-col" style={{ gap: 16 }}>
      {/* Top bar */}
      <div className="flex items-center justify-between gap-3 flex-wrap">
        <BackLink onClick={onBack} />

        <div className="flex items-center flex-wrap" style={{ gap: 10 }}>
          {/* Status chip (click to toggle complete) */}
          <button
            type="button"
            onClick={toggleComplete}
            className="inline-flex items-center justify-center cursor-pointer hover:opacity-90"
            style={{
              height: 32,
              borderRadius: 9999,
              padding: '0 16px',
              background:
                status === 'complete' ? '#DCFCE7' : status === 'in_progress' ? '#E0E7FF' : '#FEF3C6',
              fontFamily: 'Inter, sans-serif',
              fontWeight: 500,
              fontSize: 14,
              lineHeight: '20px',
              letterSpacing: '-0.15px',
              color:
                status === 'complete' ? '#008236' : status === 'in_progress' ? '#432DD7' : '#BB4D00',
            }}
          >
            {status === 'complete' ? 'Complete' : 'Mark as complete'}
          </button>

          {/* Recipients */}
          <button
            type="button"
            onClick={() => router.push(`/story/${chapterId}/recipients`)}
            className="flex items-center justify-center gap-2 cursor-pointer hover:bg-gray-50"
            style={{
              height: 31.99,
              borderRadius: 8,
              border: '1.25px solid rgba(0,0,0,0.1)',
              background: '#FFFFFF',
              padding: '0 12px',
              fontFamily: 'Inter, sans-serif',
              fontWeight: 500,
              fontSize: 14,
              lineHeight: '20px',
              letterSpacing: '-0.15px',
              color: '#0A0A0A',
            }}
          >
            <Users style={{ width: 16, height: 16, flexShrink: 0 }} color="#0A0A0A" strokeWidth={2} />
            {assignmentCount} {assignmentCount === 1 ? 'recipient' : 'recipients'}
          </button>

          {/* Exhibits */}
          <button
            type="button"
            onClick={() => setExhibitsOpen(true)}
            className="flex items-center justify-center gap-2 cursor-pointer hover:opacity-90"
            style={{
              height: 32,
              borderRadius: 8,
              border: '1.25px solid rgba(255,255,255,0.1)',
              background: '#8983F0',
              padding: '6px 17px',
              fontFamily: 'Inter, sans-serif',
              fontWeight: 500,
              fontSize: 14,
              lineHeight: '20px',
              letterSpacing: '-0.15px',
              color: '#FFFFFF',
            }}
          >
            <ImageIcon style={{ width: 16, height: 16, flexShrink: 0 }} color="#FFFFFF" strokeWidth={2} />
            {exhibits.length} Exhibits
          </button>

          {/* Save state */}
          <SaveIndicator state={saveState} />

          {/* More menu */}
          <div ref={menuRef} className="relative">
            <button
              type="button"
              aria-label="More actions"
              onClick={() => setMenuOpen((o) => !o)}
              className="flex items-center justify-center cursor-pointer hover:bg-gray-100"
              style={{ width: 35.996, height: 31.99, borderRadius: 8 }}
            >
              <MoreVertical style={{ width: 16, height: 16, flexShrink: 0 }} color="#0A0A0A" strokeWidth={2} />
            </button>
            {menuOpen && (
              <div
                className="absolute right-0 mt-1 z-30"
                style={{
                  width: 175,
                  borderRadius: 10,
                  border: '1.25px solid #E5E7EB',
                  background: '#FFFFFF',
                  padding: '5.23px 1.25px 1.25px 1.25px',
                  boxShadow: '0px 4px 6px -4px rgba(0,0,0,0.1), 0px 10px 15px -3px rgba(0,0,0,0.1)',
                }}
              >
                <button
                  type="button"
                  disabled={deleting}
                  onClick={() => {
                    setMenuOpen(false)
                    handleDelete()
                  }}
                  className="w-full flex items-center gap-3 cursor-pointer rounded-md hover:bg-[#FEF2F2] transition-colors disabled:opacity-50"
                  style={{
                    height: 35.98,
                    padding: '0 10px',
                    fontFamily: 'Inter, sans-serif',
                    fontWeight: 500,
                    fontSize: 14,
                    lineHeight: '20px',
                    letterSpacing: '-0.15px',
                    color: '#E7000B',
                  }}
                >
                  <Trash2 style={{ width: 16, height: 16, flexShrink: 0 }} color="#E7000B" strokeWidth={2} />
                  Delete Chapter
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Title input */}
      <input
        type="text"
        value={title}
        onChange={(e) => setTitle(e.target.value)}
        onBlur={() => {
          const trimmed = title.trim()
          if (trimmed && trimmed !== chapter.title) saveMeta({ title: trimmed })
        }}
        className="w-full focus:outline-none"
        style={{
          height: 35.996,
          borderRadius: 8,
          background: '#F3F3F5',
          padding: '4px 20px',
          fontFamily: 'Georgia, serif',
          fontWeight: 700,
          fontSize: 14,
          lineHeight: '100%',
          color: '#717182',
        }}
      />

      {/* Period input */}
      <input
        type="text"
        value={period}
        onChange={(e) => setPeriod(e.target.value)}
        onBlur={() => {
          if (period !== (chapter.date_label ?? '')) saveMeta({ date_label: period })
        }}
        placeholder="e.g. 1965 – 1978, or Summer of 1992"
        className="w-full focus:outline-none"
        style={{
          height: 35.996,
          borderRadius: 8,
          background: '#F3F3F5',
          padding: '4px 20px',
          fontFamily: 'Inter, sans-serif',
          fontWeight: 400,
          fontSize: 14,
          lineHeight: '100%',
          letterSpacing: '-0.15px',
          color: '#717182',
        }}
      />

      {isTranscribing ? (
        <TranscribingNotice status={chapter.transcription_status} />
      ) : (
        <>
          <RichTextEditor
            initialHtml={chapter.body ?? ''}
            wordCount={wordCount}
            lastSaved={lastSaved}
            saveState={saveState}
            onChange={handleBodyChange}
          />
          {chapter.type === 'voice' && chapter.audio_playback_url && (
            <audio
              controls
              src={chapter.audio_playback_url}
              className="w-full"
              style={{ marginTop: 8 }}
            />
          )}
        </>
      )}

      {exhibitsOpen && (
        <ExhibitsModal
          chapterId={chapterId}
          title={title}
          exhibits={exhibits}
          setExhibits={setExhibits}
          onClose={() => setExhibitsOpen(false)}
        />
      )}
    </div>
  )
}

/* ---------------------- Save indicator ---------------------- */

function SaveIndicator({ state }: { state: SaveState }) {
  const saving = state === 'saving'
  return (
    <span
      className="inline-flex items-center justify-center gap-2"
      style={{
        height: 31.99,
        borderRadius: 8,
        background: '#99A1AF',
        opacity: 0.5,
        padding: '0 12px',
        fontFamily: 'Inter, sans-serif',
        fontWeight: 500,
        fontSize: 14,
        lineHeight: '20px',
        letterSpacing: '-0.15px',
        color: '#FFFFFF',
      }}
    >
      {saving ? (
        <Loader2 style={{ width: 16, height: 16, flexShrink: 0 }} className="animate-spin" color="#FFFFFF" />
      ) : (
        <Save style={{ width: 16, height: 16, flexShrink: 0 }} color="#FFFFFF" strokeWidth={2} />
      )}
      {saving ? 'Saving…' : 'Saved'}
    </span>
  )
}

/* ---------------------- Transcribing notice ---------------------- */

function TranscribingNotice({ status }: { status: string | null }) {
  return (
    <div
      className="flex flex-col items-center justify-center text-center"
      style={{
        minHeight: 360,
        borderRadius: 10,
        border: '1.25px solid #E5E7EB',
        background: '#FFFFFF',
        padding: 32,
        gap: 12,
      }}
    >
      <Loader2 className="w-8 h-8 animate-spin text-[#4F39F6]" />
      <h3
        style={{
          fontFamily: '"Instrument Serif", serif',
          fontWeight: 400,
          fontSize: 24,
          lineHeight: '28px',
          color: '#101828',
        }}
      >
        Transcribing your recording…
      </h3>
      <p style={{ fontFamily: 'Inter, sans-serif', fontSize: 14, lineHeight: '20px', color: '#4A5565', maxWidth: 380 }}>
        This can take a minute or two. We&apos;ll load your words into the editor as soon as it&apos;s ready
        {status ? ` (${status})` : ''}.
      </p>
    </div>
  )
}

/* ---------------------- Rich text editor ---------------------- */

function RichTextEditor({
  initialHtml,
  wordCount,
  lastSaved,
  saveState,
  onChange,
}: {
  initialHtml: string
  wordCount: number
  lastSaved: string | null
  saveState: SaveState
  onChange: (html: string, text: string) => void
}) {
  const editorRef = useRef<HTMLDivElement>(null)
  const [active, setActive] = useState<Record<string, boolean>>({})

  useEffect(() => {
    try {
      document.execCommand('defaultParagraphSeparator', false, 'div')
    } catch {
      /* harmless */
    }
    if (editorRef.current && editorRef.current.innerHTML.length === 0) {
      editorRef.current.innerHTML = initialHtml
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const refreshActive = () => {
    if (typeof document === 'undefined') return
    const is = (cmd: string) => {
      try {
        return document.queryCommandState(cmd)
      } catch {
        return false
      }
    }
    setActive({
      bold: is('bold'),
      italic: is('italic'),
      underline: is('underline'),
      strikeThrough: is('strikeThrough'),
      justifyLeft: is('justifyLeft'),
      justifyCenter: is('justifyCenter'),
      justifyRight: is('justifyRight'),
      insertUnorderedList: is('insertUnorderedList'),
      insertOrderedList: is('insertOrderedList'),
    })
  }

  const emitChange = () => {
    if (editorRef.current) onChange(editorRef.current.innerHTML, editorRef.current.innerText)
  }

  const exec = (command: string, value?: string) => {
    if (typeof document === 'undefined') return
    editorRef.current?.focus()
    try {
      document.execCommand(command, false, value)
    } catch {
      /* unsupported */
    }
    emitChange()
    refreshActive()
  }

  const handleInput = () => {
    emitChange()
    refreshActive()
  }

  return (
    <div className="flex flex-col" style={{ gap: 16 }}>
      {/* Toolbar */}
      <div className="flex flex-wrap items-center gap-1 pb-2" style={{ borderBottom: '1.25px solid #E5E7EB' }}>
        <ToolbarBtn onClick={() => exec('bold')} active={active.bold} label="Bold">
          <Bold className="w-4 h-4 text-[#0A0A0A]" strokeWidth={2.25} />
        </ToolbarBtn>
        <ToolbarBtn onClick={() => exec('italic')} active={active.italic} label="Italic">
          <Italic className="w-4 h-4 text-[#0A0A0A]" strokeWidth={2.25} />
        </ToolbarBtn>
        <ToolbarBtn onClick={() => exec('underline')} active={active.underline} label="Underline">
          <Underline className="w-4 h-4 text-[#0A0A0A]" strokeWidth={2.25} />
        </ToolbarBtn>
        <ToolbarBtn onClick={() => exec('strikeThrough')} active={active.strikeThrough} label="Strikethrough">
          <Strikethrough className="w-4 h-4 text-[#0A0A0A]" strokeWidth={2.25} />
        </ToolbarBtn>

        <Divider />

        <ToolbarBtn onClick={() => exec('justifyLeft')} active={active.justifyLeft} label="Align left">
          <AlignLeft className="w-4 h-4 text-[#0A0A0A]" strokeWidth={2.25} />
        </ToolbarBtn>
        <ToolbarBtn onClick={() => exec('justifyCenter')} active={active.justifyCenter} label="Align center">
          <AlignCenter className="w-4 h-4 text-[#0A0A0A]" strokeWidth={2.25} />
        </ToolbarBtn>
        <ToolbarBtn onClick={() => exec('justifyRight')} active={active.justifyRight} label="Align right">
          <AlignRight className="w-4 h-4 text-[#0A0A0A]" strokeWidth={2.25} />
        </ToolbarBtn>

        <Divider />

        <ToolbarBtn onClick={() => exec('insertUnorderedList')} active={active.insertUnorderedList} label="Bulleted list">
          <List className="w-4 h-4 text-[#0A0A0A]" strokeWidth={2.25} />
        </ToolbarBtn>
        <ToolbarBtn onClick={() => exec('insertOrderedList')} active={active.insertOrderedList} label="Numbered list">
          <ListOrdered className="w-4 h-4 text-[#0A0A0A]" strokeWidth={2.25} />
        </ToolbarBtn>

        <Divider />

        <ToolbarBtn onClick={() => exec('outdent')} label="Decrease indent">
          <Outdent className="w-4 h-4 text-[#0A0A0A]" strokeWidth={2.25} />
        </ToolbarBtn>
        <ToolbarBtn onClick={() => exec('indent')} label="Increase indent">
          <Indent className="w-4 h-4 text-[#0A0A0A]" strokeWidth={2.25} />
        </ToolbarBtn>

        <Divider />

        <ColorPicker onPick={(color) => exec('foreColor', color)} />
      </div>

      {/* Editor */}
      <div
        ref={editorRef}
        contentEditable
        suppressContentEditableWarning
        onInput={handleInput}
        onKeyUp={refreshActive}
        onMouseUp={refreshActive}
        onBlur={handleInput}
        className="w-full focus:outline-none overflow-y-auto [&_ul]:list-disc [&_ul]:pl-7 [&_ul]:my-2 [&_ol]:list-decimal [&_ol]:pl-7 [&_ol]:my-2 [&_li]:mb-1 [&_p]:mb-4 [&::-webkit-scrollbar]:w-1 [&::-webkit-scrollbar-thumb]:bg-[#D1D5DC] [&::-webkit-scrollbar-thumb]:rounded-full"
        style={{
          minHeight: 360,
          maxHeight: 520,
          borderRadius: 10,
          border: '1.25px solid #E5E7EB',
          background: '#FFFFFF',
          padding: 16,
          fontFamily: 'Georgia, serif',
          fontWeight: 400,
          fontSize: 16,
          lineHeight: '26px',
          color: '#101828',
          boxShadow: '0px 1px 2px -1px rgba(0,0,0,0.1), 0px 1px 3px 0px rgba(0,0,0,0.1)',
          scrollbarWidth: 'thin',
          scrollbarColor: '#D1D5DC transparent',
        }}
      />

      {/* Word count / last saved */}
      <div className="flex items-center gap-6 flex-wrap">
        <div className="flex items-center gap-2">
          <FileText className="w-4 h-4 text-[#6A7282]" strokeWidth={2} />
          <span style={metaStyle}>{wordCount} words</span>
        </div>
        <div className="flex items-center gap-2">
          <Clock className="w-4 h-4 text-[#6A7282]" strokeWidth={2} />
          <span style={metaStyle}>
            {saveState === 'saving'
              ? 'Saving…'
              : lastSaved
                ? `Last saved: ${new Date(lastSaved).toLocaleString('en-US', {
                    month: 'short',
                    day: '2-digit',
                    year: 'numeric',
                    hour: 'numeric',
                    minute: '2-digit',
                  })}`
                : 'Not saved yet'}
          </span>
        </div>
      </div>
    </div>
  )
}

const metaStyle: React.CSSProperties = {
  fontFamily: 'Inter, sans-serif',
  fontWeight: 400,
  fontSize: 14,
  lineHeight: '20px',
  letterSpacing: '-0.15px',
  color: '#6A7282',
}

function ToolbarBtn({
  onClick,
  active,
  children,
  label,
}: {
  onClick: () => void
  active?: boolean
  children: React.ReactNode
  label: string
}) {
  return (
    <button
      type="button"
      title={label}
      aria-label={label}
      onMouseDown={(e) => e.preventDefault()}
      onClick={onClick}
      className="flex items-center justify-center cursor-pointer hover:bg-gray-100 transition-colors"
      style={{ width: 32, height: 32, borderRadius: 4, background: active ? '#E5E7EB' : 'transparent' }}
    >
      {children}
    </button>
  )
}

function Divider() {
  return (
    <span
      aria-hidden
      style={{ display: 'inline-block', width: 1, height: 24, margin: '0 4px', background: '#D1D5DC' }}
    />
  )
}

function ColorPicker({ onPick }: { onPick: (color: string) => void }) {
  const [open, setOpen] = useState(false)
  const ref = useRef<HTMLDivElement>(null)
  const colors = ['#101828', '#4F46E5', '#E11D48', '#16A34A', '#F59E0B', '#0EA5E9', '#9333EA', '#000000', '#6B7280']

  useEffect(() => {
    const onClickOutside = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false)
    }
    document.addEventListener('mousedown', onClickOutside)
    return () => document.removeEventListener('mousedown', onClickOutside)
  }, [])

  return (
    <div ref={ref} className="relative">
      <button
        type="button"
        aria-label="Text color"
        title="Text color"
        onMouseDown={(e) => e.preventDefault()}
        onClick={() => setOpen((o) => !o)}
        className="flex items-center justify-center cursor-pointer hover:bg-gray-100 transition-colors"
        style={{ width: 32, height: 32, borderRadius: 4 }}
      >
        <Palette className="w-4 h-4 text-[#0A0A0A]" strokeWidth={2.25} />
      </button>
      {open && (
        <div
          className="absolute z-20 mt-1 left-0 grid grid-cols-5 gap-1.5 p-2"
          style={{
            background: '#FFFFFF',
            borderRadius: 8,
            border: '1px solid rgba(0,0,0,0.1)',
            boxShadow: '0 4px 12px rgba(0,0,0,0.08)',
            width: 'max-content',
          }}
        >
          {colors.map((c) => (
            <button
              key={c}
              type="button"
              onMouseDown={(e) => e.preventDefault()}
              onClick={() => {
                onPick(c)
                setOpen(false)
              }}
              aria-label={`Color ${c}`}
              className="cursor-pointer hover:scale-105 transition-transform"
              style={{ width: 20, height: 20, borderRadius: 4, background: c, border: '1px solid rgba(0,0,0,0.08)' }}
            />
          ))}
        </div>
      )}
    </div>
  )
}

/* ====================== Exhibits modal ====================== */

function ExhibitsModal({
  chapterId,
  title,
  exhibits,
  setExhibits,
  onClose,
}: {
  chapterId: string
  title: string
  exhibits: ChapterExhibit[]
  setExhibits: React.Dispatch<React.SetStateAction<ChapterExhibit[]>>
  onClose: () => void
}) {
  const { showToast } = useToast()
  const fileInputRef = useRef<HTMLInputElement>(null)
  const [dragging, setDragging] = useState(false)
  const [uploading, setUploading] = useState(false)
  const [removingId, setRemovingId] = useState<string | null>(null)

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

  const uploadOne = async (token: string, file: File) => {
    const { upload_url, storage_path } = await getExhibitUploadUrl(token, chapterId, {
      file_name: file.name,
      file_type: file.type,
      file_size_bytes: file.size,
    })
    const put = await fetch(upload_url, {
      method: 'PUT',
      headers: { 'Content-Type': file.type },
      body: file,
    })
    if (!put.ok) throw new Error('Upload failed')

    // Grab image dimensions where possible (best-effort).
    let width: number | undefined
    let height: number | undefined
    if (file.type.startsWith('image/')) {
      try {
        const dims = await readImageSize(file)
        width = dims.width
        height = dims.height
      } catch {
        /* non-fatal */
      }
    }

    const created = await createExhibit(token, chapterId, {
      file_name: file.name,
      storage_path,
      file_type: file.type,
      file_size_bytes: file.size,
      width,
      height,
    })
    return created
  }

  const addFiles = async (files: FileList | null) => {
    if (!files || files.length === 0) return
    const valid: File[] = []
    for (const f of Array.from(files)) {
      if (!ALLOWED_EXHIBIT_TYPES.includes(f.type)) {
        showToast(`${f.name}: unsupported file type.`, 'error')
        continue
      }
      if (f.size > MAX_EXHIBIT_BYTES) {
        showToast(`${f.name}: exceeds the 10 MB limit.`, 'error')
        continue
      }
      valid.push(f)
    }
    if (valid.length === 0) return

    const token = await getToken()
    if (!token) return
    setUploading(true)
    try {
      for (const file of valid) {
        try {
          const created = await uploadOne(token, file)
          setExhibits((prev) => [...prev, created])
        } catch {
          showToast(`${file.name}: upload failed.`, 'error')
        }
      }
    } finally {
      setUploading(false)
    }
  }

  const removeExhibit = async (id: string) => {
    const token = await getToken()
    if (!token) return
    setRemovingId(id)
    try {
      await deleteExhibit(token, chapterId, id)
      setExhibits((prev) => prev.filter((e) => e.id !== id))
    } catch {
      showToast('Could not remove exhibit.', 'error')
    } finally {
      setRemovingId(null)
    }
  }

  const isSlider = exhibits.length > 3

  return (
    <div
      className="fixed inset-0 z-50 overflow-y-auto"
      style={{ background: 'rgba(0,0,0,0.4)' }}
      onMouseDown={(e) => {
        if (e.target === e.currentTarget) onClose()
      }}
    >
      <div
        className="flex min-h-full items-center justify-center px-2 sm:px-4 py-4 sm:py-10"
        onMouseDown={(e) => {
          if (e.target === e.currentTarget) onClose()
        }}
      >
        <div
          className="relative bg-white w-full flex flex-col"
          style={{
            maxWidth: 750,
            borderRadius: 10,
            border: '1px solid rgba(0,0,0,0.1)',
            boxShadow: '0px 4px 6px -4px rgba(0,0,0,0.1), 0px 10px 15px -3px rgba(0,0,0,0.1)',
            padding: 25,
            gap: 16,
            fontFamily: 'Inter, sans-serif',
          }}
        >
          {/* Header */}
          <div className="flex items-start justify-between gap-4">
            <div className="flex flex-col" style={{ gap: 8 }}>
              <h2 style={{ fontFamily: 'Inter, sans-serif', fontWeight: 600, fontSize: 23, lineHeight: '28px', color: '#0A0A0A' }}>
                {title}
              </h2>
              <p
                style={{
                  fontFamily: 'Inter, sans-serif',
                  fontWeight: 400,
                  fontSize: 16,
                  lineHeight: '24px',
                  letterSpacing: '-0.31px',
                  color: '#4A5565',
                }}
              >
                Exhibits and memories from this chapter
              </p>
            </div>
            <button
              type="button"
              onClick={onClose}
              aria-label="Close"
              className="cursor-pointer hover:bg-gray-100 rounded-md flex items-center justify-center flex-shrink-0"
              style={{ width: 24, height: 24 }}
            >
              <X style={{ width: 18, height: 18 }} color="#0A0A0A" strokeWidth={2} />
            </button>
          </div>

          {/* Hidden file input */}
          <input
            ref={fileInputRef}
            type="file"
            accept="image/jpeg,image/png,image/webp,image/heic,application/pdf"
            multiple
            className="hidden"
            onChange={(e) => {
              addFiles(e.target.files)
              e.target.value = ''
            }}
          />

          {/* Dropzone */}
          <button
            type="button"
            disabled={uploading}
            onClick={() => fileInputRef.current?.click()}
            onDragOver={(e) => {
              e.preventDefault()
              setDragging(true)
            }}
            onDragLeave={() => setDragging(false)}
            onDrop={(e) => {
              e.preventDefault()
              setDragging(false)
              addFiles(e.dataTransfer.files)
            }}
            className="flex flex-col items-center justify-center text-center cursor-pointer transition-colors w-full disabled:cursor-wait"
            style={{
              minHeight: 200,
              borderRadius: 14,
              border: '2px dashed #D1D5DC',
              background: dragging ? '#F5F3FF' : 'transparent',
              padding: 24,
              gap: 8,
            }}
          >
            {uploading ? (
              <Loader2 className="w-10 h-10 animate-spin text-[#99A1AF]" />
            ) : (
              <Upload style={{ width: 40, height: 40 }} color="#99A1AF" strokeWidth={1.75} />
            )}
            <span style={{ fontFamily: 'Inter, sans-serif', fontWeight: 400, fontSize: 16, lineHeight: '24px', color: '#4A5565' }}>
              {uploading ? 'Uploading…' : 'Drop files here or click to browse'}
            </span>
            <span style={{ fontFamily: 'Inter, sans-serif', fontWeight: 400, fontSize: 14, lineHeight: '20px', color: '#6A7282' }}>
              JPEG, PNG, WebP, HEIC or PDF · up to 10 MB each
            </span>
          </button>

          {/* Uploaded previews */}
          {exhibits.length > 0 && (
            <div
              className={
                isSlider
                  ? 'flex overflow-x-auto [&::-webkit-scrollbar]:h-1.5 [&::-webkit-scrollbar-thumb]:bg-[#D1D5DC] [&::-webkit-scrollbar-thumb]:rounded-full'
                  : 'grid grid-cols-1 sm:grid-cols-3'
              }
              style={{ gap: 14, scrollbarWidth: 'thin', scrollbarColor: '#D1D5DC transparent', paddingBottom: isSlider ? 6 : 0 }}
            >
              {exhibits.map((ex) => {
                const isImage = ex.file_type.startsWith('image/')
                return (
                  <div
                    key={ex.id}
                    className="group relative overflow-hidden flex-shrink-0 flex items-center justify-center"
                    style={{
                      width: isSlider ? 224 : undefined,
                      height: 197,
                      borderRadius: 10,
                      background: '#F3F4F6',
                      boxShadow: '0px 1px 2px -1px rgba(0,0,0,0.1), 0px 1px 3px 0px rgba(0,0,0,0.1)',
                    }}
                  >
                    {isImage && ex.signed_url ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img src={ex.signed_url} alt={ex.file_name} className="w-full h-full object-cover" />
                    ) : (
                      <div className="flex flex-col items-center justify-center gap-2 px-3 text-center">
                        <FileText className="w-8 h-8 text-[#6A7282]" strokeWidth={1.75} />
                        <span className="truncate max-w-full" style={{ fontSize: 12, color: '#4A5565' }}>
                          {ex.file_name}
                        </span>
                        <span style={{ fontSize: 11, color: '#99A1AF' }}>{formatFileSize(ex.file_size_bytes)}</span>
                      </div>
                    )}
                    <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                      <button
                        type="button"
                        aria-label="Remove exhibit"
                        disabled={removingId === ex.id}
                        onClick={() => removeExhibit(ex.id)}
                        className="flex items-center justify-center cursor-pointer"
                        style={{ width: 36, height: 36, borderRadius: 100, background: 'rgba(0,0,0,0.45)' }}
                      >
                        {removingId === ex.id ? (
                          <Loader2 className="w-4 h-4 animate-spin text-white" />
                        ) : (
                          <X style={{ width: 18, height: 18 }} color="#FFFFFF" strokeWidth={2.5} />
                        )}
                      </button>
                    </div>
                  </div>
                )
              })}
            </div>
          )}

          {/* Footer */}
          <div className="flex items-center justify-between gap-4" style={{ paddingTop: 16, borderTop: '1px solid #E5E7EB' }}>
            <span style={{ fontFamily: 'Inter, sans-serif', fontWeight: 400, fontSize: 14, lineHeight: '20px', color: '#4A5565' }}>
              {exhibits.length} {exhibits.length === 1 ? 'exhibit' : 'exhibits'}
            </span>
            <button
              type="button"
              onClick={onClose}
              className="flex items-center justify-center cursor-pointer hover:opacity-90"
              style={{
                height: 36,
                padding: '8px 16px',
                borderRadius: 8,
                background: '#4F46E5',
                fontFamily: 'Inter, sans-serif',
                fontWeight: 500,
                fontSize: 14,
                lineHeight: '20px',
                textAlign: 'center',
                color: '#FFFFFF',
              }}
            >
              Done
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

function readImageSize(file: File): Promise<{ width: number; height: number }> {
  return new Promise((resolve, reject) => {
    const url = URL.createObjectURL(file)
    const img = new Image()
    img.onload = () => {
      resolve({ width: img.naturalWidth, height: img.naturalHeight })
      URL.revokeObjectURL(url)
    }
    img.onerror = () => {
      URL.revokeObjectURL(url)
      reject(new Error('Could not read image'))
    }
    img.src = url
  })
}
