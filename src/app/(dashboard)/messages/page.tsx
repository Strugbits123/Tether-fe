'use client'

import { useCallback, useEffect, useRef, useState } from 'react'
import dynamic from 'next/dynamic'
import {
  FileText,
  Loader2,
  Mic,
  MoreVertical,
  Pencil,
  Play,
  Plus,
  Trash2,
  UserPlus,
  Video,
  X,
} from 'lucide-react'
import CreateMessageModal, {
  type EditableMessage,
  buildAssignments,
} from '@/components/dashboard/CreateMessageModal'
import AssignRecipientsModal from '@/components/dashboard/AssignRecipientsModal'
import { createClient } from '@/lib/supabase/client'
import { useToast } from '@/lib/context/ToastContext'
import { withRetry } from '@/lib/utils/retry'
import AudioPlaybackWaveform from '@/components/audio/AudioPlaybackWaveform'
import {
  type Assignment,
  type Message,
  type MessageAssignment,
  assignmentsToAudience,
  deleteMessage,
  getAudioUrl,
  getMessage,
  getMessages,
  getMessageStatus,
  getPlaybackToken,
  updateMessage,
} from '@/lib/api/messages'

const MuxPlayer = dynamic(() => import('@mux/mux-player-react'), { ssr: false })

type FilterKey = 'all' | Message['type']

const FILTERS: { key: FilterKey; label: string; icon?: typeof Mic }[] = [
  { key: 'all', label: 'All' },
  { key: 'audio', label: 'Audio', icon: Mic },
  { key: 'video', label: 'Video', icon: Video },
  { key: 'text', label: 'Written', icon: FileText },
]

const STATUS_BADGE: Record<
  Message['processing_status'],
  { label: string; bg: string; color: string }
> = {
  uploading: { label: 'Uploading', bg: '#FEF9C2', color: '#A16207' },
  processing: { label: 'Processing', bg: '#DBEAFE', color: '#1447E6' },
  ready: { label: 'Ready', bg: '#DCFCE7', color: '#016630' },
  failed: { label: 'Failed', bg: '#FEE2E2', color: '#C10007' },
}

const ASSIGN_GROUP_MAP: Record<string, Assignment> = {
  'All Recipients': { scope: 'all' },
  'All Family': { scope: 'group', groupValue: 'family' },
  'All Friends': { scope: 'group', groupValue: 'friends' },
  'All Others': { scope: 'group', groupValue: 'others' },
  'Release Manager': { scope: 'release_manager' },
}

/**
 * Reverse of ASSIGN_GROUP_MAP — turns a message's saved assignments back into the
 * AssignRecipientsModal's group labels + selected individual ids, so it opens
 * pre-filled with the message's current audience.
 */
function assignmentsToAssignSelection(assignments: MessageAssignment[] = []): {
  groups: string[]
  individualIds: string[]
} {
  const groups: string[] = []
  const individualIds: string[] = []
  for (const a of assignments) {
    switch (a.assignment_scope) {
      case 'all':
        groups.push('All Recipients')
        break
      case 'group':
        if (a.group_value === 'family') groups.push('All Family')
        else if (a.group_value === 'friends') groups.push('All Friends')
        else if (a.group_value === 'others') groups.push('All Others')
        break
      case 'release_manager':
        groups.push('Release Manager')
        break
      case 'individual':
        if (a.recipient_id) individualIds.push(a.recipient_id)
        break
    }
  }
  return { groups, individualIds }
}

async function getToken(): Promise<string | null> {
  const supabase = createClient()
  const {
    data: { session },
  } = await supabase.auth.getSession()
  return session?.access_token ?? null
}

/** Capitalises the first letter so validation errors read in sentence case. */
function toSentenceCase(message: string): string {
  if (!message) return message
  return message.charAt(0).toUpperCase() + message.slice(1)
}

function errorMessage(e: unknown, fallback: string): string {
  return toSentenceCase(e instanceof Error ? e.message : fallback)
}

function formatDuration(sec?: number): string | undefined {
  if (!sec || sec <= 0) return undefined
  const m = Math.floor(sec / 60)
  const s = sec % 60
  if (m === 0) return `${s} sec`
  if (s === 0) return `${m} min`
  return `${m} min ${s} sec`
}

function formatDate(iso: string): string {
  const d = new Date(iso)
  if (Number.isNaN(d.getTime())) return ''
  return d.toLocaleDateString(undefined, {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  })
}

function typeLabel(type: Message['type']): string {
  return type === 'audio'
    ? 'Audio message'
    : type === 'video'
    ? 'Video message'
    : 'Written message'
}

export default function MessagesPage() {
  const { showToast } = useToast()

  const [items, setItems] = useState<Message[]>([])
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState<FilterKey>('all')

  // Modals
  const [editing, setEditing] = useState<Message | null>(null)
  const [creating, setCreating] = useState(false)
  const [assigning, setAssigning] = useState<Message | null>(null)
  const [confirmDelete, setConfirmDelete] = useState<Message | null>(null)
  const [deleting, setDeleting] = useState(false)
  const [playing, setPlaying] = useState<Message | null>(null)

  const load = useCallback(async () => {
    const token = await getToken()
    if (!token) {
      setLoading(false)
      return
    }
    try {
      const data = await withRetry(() => getMessages(token))
      setItems(data)
    } catch (e) {
      showToast(errorMessage(e, 'Could not load your messages.'), 'error')
    } finally {
      setLoading(false)
    }
  }, [showToast])

  useEffect(() => {
    load()
  }, [load])

  // Poll messages that are still being processed.
  const pollRef = useRef<number | null>(null)
  useEffect(() => {
    const pending = items.filter(
      (m) => m.processing_status !== 'ready' && m.processing_status !== 'failed',
    )
    if (pending.length === 0) {
      if (pollRef.current) {
        window.clearInterval(pollRef.current)
        pollRef.current = null
      }
      return
    }
    if (pollRef.current) return // already polling

    pollRef.current = window.setInterval(async () => {
      const token = await getToken()
      if (!token) return
      const stillPending = items.filter(
        (m) => m.processing_status !== 'ready' && m.processing_status !== 'failed',
      )
      await Promise.all(
        stillPending.map(async (m) => {
          try {
            const status = await getMessageStatus(token, m.id)
            setItems((prev) =>
              prev.map((it) =>
                it.id === m.id
                  ? {
                      ...it,
                      processing_status:
                        (status.processingStatus as Message['processing_status']) ??
                        it.processing_status,
                      transcription_status:
                        (status.transcriptionStatus as Message['transcription_status']) ??
                        it.transcription_status,
                      transcript: status.transcript ?? it.transcript,
                    }
                  : it,
              ),
            )
          } catch {
            /* transient — try again next tick */
          }
        }),
      )
    }, 5000)

    return () => {
      if (pollRef.current) {
        window.clearInterval(pollRef.current)
        pollRef.current = null
      }
    }
  }, [items])

  const visible = items.filter((m) => filter === 'all' || m.type === filter)

  // Current audience of the message being assigned, mapped to the modal's shape.
  const assignSelection = assignmentsToAssignSelection(assigning?.assignments ?? [])

  const handleDelete = async () => {
    if (!confirmDelete) return
    const token = await getToken()
    if (!token) {
      showToast('Your session has expired. Please sign in again.', 'error')
      return
    }
    setDeleting(true)
    try {
      await deleteMessage(token, confirmDelete.id)
      setItems((prev) => prev.filter((m) => m.id !== confirmDelete.id))
      showToast('Message deleted', 'success')
      setConfirmDelete(null)
    } catch (e) {
      showToast(errorMessage(e, 'Could not delete the message.'), 'error')
    } finally {
      setDeleting(false)
    }
  }

  // Fetch the full message (with assignments) so the edit modal can pre-fill
  // the audience. Falls back to the list item if the fetch fails.
  const handleEdit = async (m: Message) => {
    const token = await getToken()
    if (!token) {
      setEditing(m)
      return
    }
    try {
      const full = await getMessage(token, m.id)
      setEditing(full)
    } catch {
      setEditing(m)
    }
  }

  // Fetch the full message (with assignments) so the assign modal can pre-fill
  // the current audience. Falls back to the list item if the fetch fails.
  const handleAssign = async (m: Message) => {
    const token = await getToken()
    if (!token) {
      setAssigning(m)
      return
    }
    try {
      const full = await getMessage(token, m.id)
      setAssigning(full)
    } catch {
      setAssigning(m)
    }
  }

  const handleSaveEdit = async (m: EditableMessage) => {
    if (!m.id) return
    const token = await getToken()
    if (!token) {
      showToast('Your session has expired. Please sign in again.', 'error')
      throw new Error('No session')
    }
    try {
      await updateMessage(token, m.id, {
        title: m.title,
        notes: m.notes || undefined,
        // Only text messages carry an editable body.
        body: m.messageType === 'write' ? m.body : undefined,
        assignments: buildAssignments(m.audience, m.selectedIndividualIds ?? []),
      })
      showToast('Message updated', 'success')
      load()
    } catch (e) {
      showToast(errorMessage(e, 'Could not update the message.'), 'error')
      // Re-throw so the modal keeps its loading state cleared and stays open.
      throw e
    }
  }

  const handleSaveAssign = async (groups: string[], individualIds: string[]) => {
    if (!assigning) return
    const token = await getToken()
    if (!token) {
      showToast('Your session has expired. Please sign in again.', 'error')
      return
    }
    const assignments: Assignment[] = []
    for (const g of groups) {
      if (ASSIGN_GROUP_MAP[g]) assignments.push(ASSIGN_GROUP_MAP[g])
    }
    for (const id of individualIds) {
      assignments.push({ scope: 'individual', recipientId: id })
    }
    if (assignments.length === 0) assignments.push({ scope: 'assign_later' })
    try {
      await updateMessage(token, assigning.id, { assignments })
      showToast('Recipients updated', 'success')
      setAssigning(null)
    } catch (e) {
      showToast(errorMessage(e, 'Could not update recipients.'), 'error')
    }
  }

  return (
    <div className="flex flex-col gap-6">
      {/* Header */}
      <div className="flex items-start sm:items-center justify-between gap-4 flex-wrap">
        <div className="flex flex-col gap-1">
          <h1
            style={{
              fontFamily: '"Instrument Serif", serif',
              fontWeight: 400,
              fontSize: 32,
              lineHeight: '36px',
              color: '#101828',
            }}
          >
            Messages
          </h1>
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
            Share your guidance and love for when it matters most
          </p>
        </div>
        <button
          type="button"
          onClick={() => setCreating(true)}
          className="flex items-center justify-center gap-1.5 cursor-pointer hover:opacity-90"
          style={{
            width: 150,
            height: 36,
            borderRadius: 8,
            background: '#4F46E5',
            fontFamily: 'Inter, sans-serif',
            fontWeight: 500,
            fontSize: 14,
            lineHeight: '20px',
            letterSpacing: '-0.15px',
            color: '#FFFFFF',
          }}
        >
          <Plus className="w-4 h-4" strokeWidth={2.25} />
          New Messages
        </button>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap items-center gap-2">
        {FILTERS.map((f) => {
          const Icon = f.icon
          const active = filter === f.key
          return (
            <button
              key={f.key}
              type="button"
              onClick={() => setFilter(f.key)}
              className="flex items-center gap-1.5 cursor-pointer transition-colors"
              style={{
                minHeight: 36,
                borderRadius: 10,
                background: active ? '#4F39F6' : '#F3F4F6',
                padding: '0 16px',
                fontFamily: 'Inter, sans-serif',
                fontWeight: 500,
                fontSize: 14,
                lineHeight: '20px',
                letterSpacing: '-0.15px',
                color: active ? '#FFFFFF' : '#364153',
              }}
            >
              {Icon && (
                <Icon
                  className="w-4 h-4"
                  strokeWidth={2}
                  color={active ? '#FFFFFF' : '#364153'}
                />
              )}
              {f.label}
            </button>
          )
        })}
      </div>

      {/* Cards grid */}
      {loading ? (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          {[0, 1, 2, 3].map((i) => (
            <div
              key={i}
              className="animate-pulse flex items-start gap-4"
              style={{
                borderRadius: 14,
                border: '1.25px solid rgba(0,0,0,0.1)',
                background: '#FFFFFF',
                padding: 16,
              }}
            >
              <div
                className="flex-shrink-0"
                style={{ width: 80, height: 80, borderRadius: 10, background: '#EEF2FF' }}
              />
              <div className="flex-1 flex flex-col gap-2 pt-1">
                <div className="h-4 bg-gray-200 rounded w-2/3" />
                <div className="h-3 bg-gray-100 rounded w-1/2" />
                <div className="h-3 bg-gray-100 rounded w-1/3" />
              </div>
            </div>
          ))}
        </div>
      ) : visible.length === 0 ? (
        <div
          className="flex flex-col items-center justify-center text-center gap-3"
          style={{
            borderRadius: 14,
            border: '1.25px dashed rgba(0,0,0,0.12)',
            background: '#FFFFFF',
            padding: '48px 24px',
          }}
        >
          <div
            className="flex items-center justify-center"
            style={{
              width: 56,
              height: 56,
              borderRadius: 12,
              background: 'linear-gradient(135deg, #E0E7FF 0%, #C6D2FF 100%)',
            }}
          >
            <FileText className="w-7 h-7" color="#4F39F6" strokeWidth={2} />
          </div>
          <p
            style={{
              fontFamily: 'Inter, sans-serif',
              fontWeight: 600,
              fontSize: 16,
              color: '#101828',
            }}
          >
            No messages yet
          </p>
          <p
            style={{
              fontFamily: 'Inter, sans-serif',
              fontWeight: 400,
              fontSize: 14,
              color: '#4A5565',
            }}
          >
            Create your first message to share your guidance and love.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          {visible.map((m) => (
            <MessageCard
              key={m.id}
              item={m}
              onEdit={() => handleEdit(m)}
              onAssign={() => handleAssign(m)}
              onDelete={() => setConfirmDelete(m)}
              onPlay={() => setPlaying(m)}
            />
          ))}
        </div>
      )}

      {/* Modals */}
      <CreateMessageModal
        open={creating}
        onClose={() => setCreating(false)}
        headerTitle="New Message"
        headerSubtitle="Create a new message to share with your loved ones"
        onCreated={() => load()}
      />
      <CreateMessageModal
        open={!!editing}
        onClose={() => setEditing(null)}
        headerTitle="Edit Message"
        headerSubtitle={editing?.title ?? ''}
        initialMessage={
          editing
            ? {
                id: editing.id,
                ...assignmentsToAudience(editing.assignments),
                messageType:
                  editing.type === 'text'
                    ? 'write'
                    : editing.type === 'video'
                    ? 'video'
                    : 'audio',
                title: editing.title,
                notes: editing.notes ?? '',
                body: editing.body ?? '',
              }
            : undefined
        }
        onSave={handleSaveEdit}
      />
      <AssignRecipientsModal
        open={!!assigning}
        onClose={() => setAssigning(null)}
        messageTitle={assigning?.title ?? ''}
        initialGroups={assignSelection.groups}
        initialIndividualIds={assignSelection.individualIds}
        onSave={handleSaveAssign}
      />

      {playing && (
        <PlaybackModal message={playing} onClose={() => setPlaying(null)} />
      )}

      {confirmDelete && (
        <ConfirmDeleteModal
          title={confirmDelete.title}
          deleting={deleting}
          onCancel={() => setConfirmDelete(null)}
          onConfirm={handleDelete}
        />
      )}
    </div>
  )
}

/* ---------------------- Message card ---------------------- */

function MessageCard({
  item,
  onEdit,
  onAssign,
  onDelete,
  onPlay,
}: {
  item: Message
  onEdit: () => void
  onAssign: () => void
  onDelete: () => void
  onPlay: () => void
}) {
  const [menuOpen, setMenuOpen] = useState(false)
  const menuRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const handle = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) setMenuOpen(false)
    }
    if (menuOpen) document.addEventListener('mousedown', handle)
    return () => document.removeEventListener('mousedown', handle)
  }, [menuOpen])

  const Icon = item.type === 'audio' ? Mic : item.type === 'video' ? Video : FileText
  const duration = formatDuration(item.duration_seconds)
  const badge = STATUS_BADGE[item.processing_status]
  const isPlayable =
    (item.type === 'video' || item.type === 'audio') &&
    item.processing_status === 'ready'

  return (
    <div
      className="relative flex items-start gap-4"
      style={{
        borderRadius: 14,
        border: '1.25px solid rgba(0,0,0,0.1)',
        background: '#FFFFFF',
        padding: 16,
      }}
    >
      {/* Icon tile */}
      <button
        type="button"
        onClick={isPlayable ? onPlay : undefined}
        aria-label={isPlayable ? 'Play message' : undefined}
        className={`flex items-center justify-center flex-shrink-0 relative ${
          isPlayable ? 'cursor-pointer group' : 'cursor-default'
        }`}
        style={{
          width: 80,
          height: 80,
          borderRadius: 10,
          background: 'linear-gradient(135deg, #E0E7FF 0%, #C6D2FF 100%)',
        }}
      >
        <Icon className="w-8 h-8" color="#4F39F6" strokeWidth={2} />
        {isPlayable && (
          <span
            className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
            style={{ borderRadius: 10, background: 'rgba(79,57,246,0.85)' }}
          >
            <Play className="w-7 h-7 text-white fill-white" strokeWidth={2} />
          </span>
        )}
      </button>

      {/* Content */}
      <div className="flex-1 min-w-0 flex flex-col gap-2">
        <h3
          className="truncate pr-10"
          style={{
            fontFamily: 'Inter, sans-serif',
            fontWeight: 600,
            fontSize: 18,
            lineHeight: '28px',
            letterSpacing: '-0.44px',
            color: '#101828',
          }}
        >
          {item.title}
        </h3>
        <div
          className="flex flex-wrap items-center gap-x-3 gap-y-1"
          style={{
            fontFamily: 'Inter, sans-serif',
            fontWeight: 400,
            fontSize: 14,
            lineHeight: '20px',
            letterSpacing: '-0.15px',
            color: '#4A5565',
          }}
        >
          <span>{typeLabel(item.type)}</span>
          {duration && (
            <>
              <span aria-hidden>•</span>
              <span>{duration}</span>
            </>
          )}
          <span
            className="flex-shrink-0 px-2 py-[2px] rounded"
            style={{
              background: badge.bg,
              color: badge.color,
              fontSize: 11.8,
              fontWeight: 500,
              lineHeight: '16px',
            }}
          >
            {item.processing_status !== 'ready' && (
              <Loader2 className="inline w-3 h-3 mr-1 animate-spin align-[-1px]" />
            )}
            {badge.label}
          </span>
        </div>
        <p
          style={{
            fontFamily: 'Inter, sans-serif',
            fontWeight: 400,
            fontSize: 12,
            lineHeight: '16px',
            color: '#6A7282',
          }}
        >
          Created {formatDate(item.created_at)}
        </p>
      </div>

      {/* Menu trigger */}
      <div ref={menuRef} className="absolute top-3 right-3">
        <button
          type="button"
          onClick={() => setMenuOpen((o) => !o)}
          aria-label="Open actions"
          className="flex items-center justify-center cursor-pointer hover:bg-gray-100 transition-colors"
          style={{
            width: 36,
            height: 36,
            borderRadius: 10,
          }}
        >
          <MoreVertical className="w-5 h-5 text-[#364153]" strokeWidth={2} />
        </button>

        {menuOpen && (
          <div
            className="absolute right-0 mt-1 flex flex-col z-10"
            style={{
              width: 192,
              borderRadius: 10,
              border: '1.25px solid #E5E7EB',
              background: '#FFFFFF',
              padding: 5,
              boxShadow:
                '0px 4px 6px -4px rgba(0,0,0,0.1), 0px 10px 15px -3px rgba(0,0,0,0.1)',
            }}
          >
            {isPlayable && (
              <MenuItem
                icon={<Play className="w-4 h-4 text-[#364153]" strokeWidth={2} />}
                label="Play message"
                onClick={() => {
                  setMenuOpen(false)
                  onPlay()
                }}
              />
            )}
            <MenuItem
              icon={<Pencil className="w-4 h-4 text-[#364153]" strokeWidth={2} />}
              label="Edit message"
              onClick={() => {
                setMenuOpen(false)
                onEdit()
              }}
            />
            <MenuItem
              icon={<UserPlus className="w-4 h-4 text-[#364153]" strokeWidth={2} />}
              label="Assign recipients"
              onClick={() => {
                setMenuOpen(false)
                onAssign()
              }}
            />
            <MenuItem
              icon={<Trash2 className="w-4 h-4 text-[#E7000B]" strokeWidth={2} />}
              label="Delete message"
              danger
              onClick={() => {
                setMenuOpen(false)
                onDelete()
              }}
            />
          </div>
        )}
      </div>
    </div>
  )
}

function MenuItem({
  icon,
  label,
  danger,
  onClick,
}: {
  icon: React.ReactNode
  label: string
  danger?: boolean
  onClick: () => void
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="w-full flex items-center gap-3 cursor-pointer hover:bg-gray-50 rounded-md"
      style={{
        padding: '8px 10px',
        fontFamily: 'Inter, sans-serif',
        fontWeight: 500,
        fontSize: 14,
        lineHeight: '20px',
        letterSpacing: '-0.15px',
        color: danger ? '#E7000B' : '#364153',
      }}
    >
      {icon}
      {label}
    </button>
  )
}

/* ---------------------- Playback modal ---------------------- */

function PlaybackModal({
  message,
  onClose,
}: {
  message: Message
  onClose: () => void
}) {
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [video, setVideo] = useState<{ playbackId: string; token: string } | null>(null)
  const [audioUrl, setAudioUrl] = useState<string | null>(null)

  useEffect(() => {
    let active = true
    ;(async () => {
      const token = await getToken()
      if (!token) {
        if (active) {
          setError('Your session has expired. Please sign in again.')
          setLoading(false)
        }
        return
      }
      try {
        if (message.type === 'video') {
          const { token: playbackToken, playbackId } = await getPlaybackToken(
            token,
            message.id,
          )
          if (active) setVideo({ playbackId, token: playbackToken })
        } else {
          const { signedUrl } = await getAudioUrl(token, message.id)
          if (active) setAudioUrl(signedUrl)
        }
      } catch (e) {
        if (active) setError(errorMessage(e, 'Could not load playback.'))
      } finally {
        if (active) setLoading(false)
      }
    })()
    return () => {
      active = false
    }
  }, [message.id, message.type])

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
          className="relative bg-white w-full"
          style={{
            maxWidth: 768,
            borderRadius: 16,
            paddingBottom: 24,
            boxShadow: '0px 25px 50px -12px rgba(0,0,0,0.25)',
            fontFamily: 'Inter, sans-serif',
          }}
        >
          <button
            type="button"
            onClick={onClose}
            aria-label="Close"
            className="absolute cursor-pointer top-5 right-5 sm:top-6 sm:right-6 z-10"
            style={{ width: 22, height: 22, opacity: 0.7 }}
          >
            <X className="w-[22px] h-[22px] text-[#0A0A0A]" strokeWidth={2} />
          </button>

          <div
            className="px-6 py-6 pr-12 sm:pr-14"
            style={{ borderBottom: '0.8px solid #E5E7EB' }}
          >
            <h2
              style={{
                fontFamily: 'Inter, sans-serif',
                fontWeight: 700,
                fontSize: 23,
                lineHeight: '32px',
                color: '#101828',
              }}
            >
              {message.title}
            </h2>
            <p
              style={{
                fontFamily: 'Inter, sans-serif',
                fontWeight: 400,
                fontSize: 12.9,
                lineHeight: '20px',
                color: '#4A5565',
              }}
            >
              {typeLabel(message.type)}
            </p>
          </div>

          <div className="px-6 pt-6">
            {loading ? (
              <div
                className="w-full flex items-center justify-center"
                style={{ minHeight: 240 }}
              >
                <Loader2 className="w-8 h-8 text-[#4F46E5] animate-spin" />
              </div>
            ) : error ? (
              <p className="text-sm text-red-600 text-center py-10">{error}</p>
            ) : message.type === 'video' && video ? (
              <div className="w-full overflow-hidden" style={{ borderRadius: 10 }}>
                <MuxPlayer
                  playbackId={video.playbackId}
                  tokens={{ playback: video.token }}
                  style={{ width: '100%', aspectRatio: '16 / 9' }}
                  accentColor="#4F46E5"
                />
              </div>
            ) : audioUrl ? (
              <div
                className="w-full flex flex-col items-center justify-center gap-4"
                style={{
                  minHeight: 200,
                  borderRadius: 10,
                  background: 'linear-gradient(135deg, #615FFF 0%, #9810FA 100%)',
                  padding: 32,
                }}
              >
                <Mic className="w-16 h-16 text-white" strokeWidth={1.5} />
                <AudioPlaybackWaveform
                  audioUrl={audioUrl}
                  height={80}
                  waveColor="rgba(255, 255, 255, 0.3)"
                  progressColor="rgba(255, 255, 255, 1)"
                  autoPlay
                />
              </div>
            ) : null}

            {message.transcript && (
              <div className="mt-5">
                <h3
                  className="mb-2"
                  style={{
                    fontFamily: 'Inter, sans-serif',
                    fontWeight: 600,
                    fontSize: 14,
                    color: '#101828',
                  }}
                >
                  Transcript
                </h3>
                <p
                  style={{
                    fontFamily: 'Inter, sans-serif',
                    fontWeight: 400,
                    fontSize: 14,
                    lineHeight: '22px',
                    color: '#4A5565',
                    whiteSpace: 'pre-wrap',
                  }}
                >
                  {message.transcript}
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

/* ---------------------- Confirm delete modal ---------------------- */

function ConfirmDeleteModal({
  title,
  deleting,
  onCancel,
  onConfirm,
}: {
  title: string
  deleting: boolean
  onCancel: () => void
  onConfirm: () => void
}) {
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onCancel()
    }
    document.addEventListener('keydown', onKey)
    const prev = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    return () => {
      document.removeEventListener('keydown', onKey)
      document.body.style.overflow = prev
    }
  }, [onCancel])

  return (
    <div
      className="fixed inset-0 z-50 overflow-y-auto"
      style={{ background: 'rgba(0,0,0,0.4)' }}
      onMouseDown={(e) => {
        if (e.target === e.currentTarget) onCancel()
      }}
    >
      <div
        className="flex min-h-full items-center justify-center px-2 sm:px-4 py-4 sm:py-10"
        onMouseDown={(e) => {
          if (e.target === e.currentTarget) onCancel()
        }}
      >
        <div
          className="relative bg-white w-full"
          style={{
            maxWidth: 420,
            borderRadius: 10,
            boxShadow:
              '0px 8px 10px -6px rgba(0,0,0,0.1), 0px 20px 25px -5px rgba(0,0,0,0.1)',
            fontFamily: 'Inter, sans-serif',
          }}
        >
          <div className="px-6 pt-6 pb-2">
            <h2
              style={{
                fontFamily: 'Inter, sans-serif',
                fontWeight: 600,
                fontSize: 19,
                lineHeight: '28px',
                color: '#101828',
              }}
            >
              Delete this message?
            </h2>
            <p
              className="mt-2"
              style={{
                fontFamily: 'Inter, sans-serif',
                fontWeight: 400,
                fontSize: 14,
                lineHeight: '20px',
                color: '#717182',
              }}
            >
              &ldquo;{title}&rdquo; will be permanently removed. This cannot be undone.
            </p>
          </div>
          <div
            className="flex items-center justify-end gap-3 px-6 py-4 mt-4"
            style={{
              background: '#F9FAFB',
              borderTop: '0.8px solid #E5E7EB',
              borderBottomLeftRadius: 10,
              borderBottomRightRadius: 10,
            }}
          >
            <button
              type="button"
              onClick={onCancel}
              disabled={deleting}
              className="cursor-pointer hover:bg-gray-50 disabled:opacity-60"
              style={{
                height: 36,
                padding: '7.8px 15.8px',
                borderRadius: 8,
                border: '1px solid rgba(0,0,0,0.1)',
                background: '#FFFFFF',
                fontFamily: 'Inter, sans-serif',
                fontWeight: 500,
                fontSize: 13.2,
                lineHeight: '20px',
                color: '#0A0A0A',
              }}
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={onConfirm}
              disabled={deleting}
              className="flex items-center justify-center gap-2 cursor-pointer hover:opacity-90 disabled:opacity-80 disabled:cursor-not-allowed"
              style={{
                height: 36,
                padding: '8px 16px',
                borderRadius: 8,
                background: '#E7000B',
                fontFamily: 'Inter, sans-serif',
                fontWeight: 500,
                fontSize: 14,
                lineHeight: '20px',
                color: '#FFFFFF',
              }}
            >
              {deleting && <Loader2 className="w-4 h-4 animate-spin" />}
              {deleting ? 'Deleting…' : 'Delete'}
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
