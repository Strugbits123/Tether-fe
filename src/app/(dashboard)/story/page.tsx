'use client'

import { useCallback, useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import {
  Clock,
  Download,
  Grid3x3,
  List,
  Loader2,
  Mic,
  Pencil,
  Plus,
  Settings,
} from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import { useToast } from '@/lib/context/ToastContext'
import {
  listChapters,
  type ChapterAssignment,
  type ChapterListItem,
  type ChapterStats,
} from '@/lib/api/chapters'
import { ApiError } from '@/lib/api/client'

/* ---------------------- Helpers ---------------------- */

async function getToken(): Promise<string | null> {
  const supabase = createClient()
  const {
    data: { session },
  } = await supabase.auth.getSession()
  return session?.access_token ?? null
}

function formatDate(dateStr: string): string {
  return new Date(dateStr).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: '2-digit',
  })
}

function initialsOf(name: string): string {
  const parts = name.trim().split(/\s+/).filter(Boolean)
  if (parts.length === 0) return '?'
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase()
  return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase()
}

const GROUP_LABELS: Record<string, string> = {
  family: 'All Family',
  friends: 'All Friends',
  others: 'All Others',
}

/** Splits a chapter's assignments into group chips + individual initials. */
function summarizeAssignments(assignments: ChapterAssignment[]): {
  groups: string[]
  initials: string[]
  noRecipients: boolean
} {
  const groups: string[] = []
  const initials: string[] = []
  for (const a of assignments) {
    switch (a.assignment_scope) {
      case 'all':
        groups.push('All Recipients')
        break
      case 'release_manager':
        groups.push('Release Manager')
        break
      case 'group':
        if (a.group_value && GROUP_LABELS[a.group_value])
          groups.push(GROUP_LABELS[a.group_value])
        break
      case 'individual':
        initials.push(initialsOf(a.recipient_name ?? ''))
        break
    }
  }
  const noRecipients =
    groups.length === 0 &&
    initials.length === 0 // covers assign_later and empty
  return { groups, initials, noRecipients }
}

/* ---------------------- Display types ---------------------- */

type DisplayStatus = 'complete' | 'in-progress' | 'draft'
type ChapterKind = 'text' | 'voice'

interface DisplayChapter {
  id: string
  number: number
  title: string
  kind: ChapterKind
  period: string
  status: DisplayStatus
  words: string | null
  date: string
  groups: string[]
  initials: string[]
  extra: number
  noRecipients: boolean
}

const MAX_INITIALS = 3

function toDisplay(c: ChapterListItem, index: number): DisplayChapter {
  const { groups, initials, noRecipients } = summarizeAssignments(c.assignments)
  const status: DisplayStatus =
    c.status === 'in_progress' ? 'in-progress' : c.status
  return {
    id: c.id,
    number: index + 1,
    title: c.title,
    kind: c.type,
    period: c.date_label ?? '',
    status,
    words: c.status === 'draft' && c.word_count === 0
      ? null
      : c.word_count.toLocaleString('en-US'),
    date: formatDate(c.created_at),
    groups,
    initials: initials.slice(0, MAX_INITIALS),
    extra: Math.max(0, initials.length - MAX_INITIALS),
    noRecipients,
  }
}

const STATUS_CONFIG: Record<DisplayStatus, { label: string; bg: string; text: string }> = {
  complete: { label: 'Complete', bg: '#DCFCE7', text: '#008236' },
  'in-progress': { label: 'In Progress', bg: '#E0E7FF', text: '#432DD7' },
  draft: { label: 'Draft', bg: '#FEF3C6', text: '#BB4D00' },
}

const GROUP_COLORS: Record<string, { bg: string; text: string }> = {
  'All Family': { bg: '#FFA5001A', text: '#FF7700' },
  'All Friends': { bg: '#FF41701A', text: '#FF4170' },
  'All Recipients': { bg: '#417DFF1A', text: '#417DFF' },
  'Release Manager': { bg: '#0080801A', text: '#008080' },
  'All Others': { bg: '#0097A71A', text: '#0097A7' },
}

/* ---------------------- Page ---------------------- */

export default function StoryPage() {
  const router = useRouter()
  const { showToast } = useToast()
  const [layout, setLayout] = useState<'grid' | 'list'>('grid')
  const [chapters, setChapters] = useState<DisplayChapter[]>([])
  const [stats, setStats] = useState<ChapterStats | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const load = useCallback(async () => {
    setLoading(true)
    setError(null)
    const token = await getToken()
    if (!token) {
      setError('Your session has expired. Please sign in again.')
      setLoading(false)
      return
    }
    try {
      const data = await listChapters(token)
      setChapters(data.chapters.map(toDisplay))
      setStats(data.stats)
    } catch (e) {
      setError(e instanceof ApiError ? e.message : 'Failed to load your story.')
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    load()
  }, [load])

  const openChapter = (id: string) => router.push(`/story/${id}`)

  return (
    <div className="flex flex-col gap-6">
      {/* Header row */}
      <div className="flex items-start justify-between gap-4 flex-wrap">
        <div className="flex flex-col" style={{ gap: 8, maxWidth: 623 }}>
          <h1
            style={{
              fontFamily: '"Instrument Serif", serif',
              fontWeight: 400,
              fontSize: 32,
              lineHeight: '28px',
              color: '#101828',
            }}
          >
            My Story
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
            Your life in your words — organized into chapters your family will read for generations.
          </p>

          <div className="flex items-center flex-wrap" style={{ gap: 11.99 }}>
            <span
              className="inline-flex items-center justify-center"
              style={{
                height: 27.97,
                borderRadius: 9999,
                padding: '4px 12px',
                background: '#E0E7FF',
                fontFamily: 'Inter, sans-serif',
                fontWeight: 500,
                fontSize: 14,
                lineHeight: '20px',
                letterSpacing: '-0.15px',
                color: '#432DD7',
              }}
            >
              {chapters.length} {chapters.length === 1 ? 'chapter' : 'chapters'}
            </span>
            <button
              type="button"
              onClick={() => router.push('/story/preview')}
              className="cursor-pointer hover:opacity-80"
              style={{
                fontFamily: 'Inter, sans-serif',
                fontWeight: 500,
                fontSize: 14,
                lineHeight: '20px',
                letterSpacing: '-0.15px',
                textAlign: 'center',
                color: '#4F39F6',
                background: 'transparent',
              }}
            >
              Preview full memoir
            </button>
          </div>
        </div>

        {/* Right: layout toggle + Add a chapter */}
        <div className="flex items-center" style={{ gap: 11.99 }}>
          <div
            className="flex items-center"
            style={{
              height: 42.44,
              borderRadius: 10,
              border: '1.25px solid #D1D5DC',
              padding: '4px 3.98px',
              gap: 3.98,
              flexShrink: 0,
            }}
          >
            <button
              type="button"
              onClick={() => setLayout('grid')}
              aria-label="Grid view"
              className="flex items-center justify-center cursor-pointer"
              style={{
                width: 31.97,
                height: 31.97,
                borderRadius: 4,
                background: layout === 'grid' ? '#E5E7EB' : 'transparent',
              }}
            >
              <Grid3x3 style={{ width: 16, height: 16, flexShrink: 0 }} color="#0A0A0A" strokeWidth={2} />
            </button>
            <button
              type="button"
              onClick={() => setLayout('list')}
              aria-label="List view"
              className="flex items-center justify-center cursor-pointer"
              style={{
                width: 31.97,
                height: 31.97,
                borderRadius: 4,
                background: layout === 'list' ? '#E5E7EB' : 'transparent',
              }}
            >
              <List style={{ width: 16, height: 16, flexShrink: 0 }} color="#0A0A0A" strokeWidth={2} />
            </button>
          </div>

          <button
            type="button"
            onClick={() => router.push('/story/new')}
            className="flex items-center justify-center gap-2 cursor-pointer hover:opacity-90"
            style={{
              height: 35.996,
              padding: '8px 16px',
              borderRadius: 8,
              background: '#4F39F6',
              fontFamily: 'Inter, sans-serif',
              fontWeight: 500,
              fontSize: 14,
              lineHeight: '20px',
              letterSpacing: '-0.15px',
              color: '#FFFFFF',
              flexShrink: 0,
            }}
          >
            <Plus style={{ width: 16, height: 16, flexShrink: 0 }} color="#FFFFFF" strokeWidth={2} />
            Add a chapter
          </button>
        </div>
      </div>

      {/* Content: cards + progress panel */}
      <div className="flex flex-col lg:flex-row" style={{ gap: 24 }}>
        <div className="flex-1 min-w-0">
          {loading ? (
            <div className="flex items-center justify-center" style={{ minHeight: 240 }}>
              <Loader2 className="w-6 h-6 animate-spin text-[#4F39F6]" />
            </div>
          ) : error ? (
            <EmptyState
              title="Couldn’t load your story"
              body={error}
              action={{ label: 'Try again', onClick: load }}
            />
          ) : chapters.length === 0 ? (
            <EmptyState
              title="No chapters yet"
              body="Start your story by adding your first chapter."
              action={{ label: 'Add a chapter', onClick: () => router.push('/story/new') }}
            />
          ) : layout === 'grid' ? (
            <div className="grid grid-cols-1 md:grid-cols-2" style={{ gap: 20 }}>
              {chapters.map((c) => (
                <ChapterGridCard key={c.id} chapter={c} onOpen={() => openChapter(c.id)} />
              ))}
            </div>
          ) : (
            <div className="flex flex-col" style={{ gap: 15 }}>
              {chapters.map((c) => (
                <ChapterListCard key={c.id} chapter={c} onOpen={() => openChapter(c.id)} />
              ))}
            </div>
          )}
        </div>

        {/* Progress panel */}
        <div className="w-full lg:w-[286px] flex-shrink-0">
          <ProgressPanel stats={stats} totalChapters={chapters.length} showToast={showToast} />
        </div>
      </div>
    </div>
  )
}

/* ---------------------- Empty / error state ---------------------- */

function EmptyState({
  title,
  body,
  action,
}: {
  title: string
  body: string
  action: { label: string; onClick: () => void }
}) {
  return (
    <div
      className="flex flex-col items-center justify-center text-center"
      style={{
        minHeight: 240,
        borderRadius: 14,
        border: '1.25px dashed #D1D5DC',
        background: '#FFFFFF',
        padding: 32,
        gap: 12,
      }}
    >
      <h3
        style={{
          fontFamily: '"Instrument Serif", serif',
          fontWeight: 400,
          fontSize: 24,
          lineHeight: '28px',
          color: '#101828',
        }}
      >
        {title}
      </h3>
      <p
        style={{
          fontFamily: 'Inter, sans-serif',
          fontWeight: 400,
          fontSize: 14,
          lineHeight: '20px',
          color: '#4A5565',
          maxWidth: 360,
        }}
      >
        {body}
      </p>
      <button
        type="button"
        onClick={action.onClick}
        className="flex items-center justify-center gap-2 cursor-pointer hover:opacity-90"
        style={{
          height: 35.996,
          padding: '8px 16px',
          borderRadius: 8,
          background: '#4F39F6',
          fontFamily: 'Inter, sans-serif',
          fontWeight: 500,
          fontSize: 14,
          lineHeight: '20px',
          letterSpacing: '-0.15px',
          color: '#FFFFFF',
        }}
      >
        {action.label}
      </button>
    </div>
  )
}

/* ---------------------- Shared bits ---------------------- */

function TypeBadge({ kind }: { kind: ChapterKind }) {
  const Icon = kind === 'voice' ? Mic : Pencil
  return (
    <span
      className="inline-flex items-center"
      style={{
        height: 22,
        borderRadius: 4,
        padding: '1px 12px',
        gap: 6,
        background: '#F3F4F6',
        flexShrink: 0,
      }}
    >
      <Icon style={{ width: 11, height: 11, flexShrink: 0 }} color="#364153" strokeWidth={2} />
      <span
        style={{
          fontFamily: 'Inter, sans-serif',
          fontWeight: 500,
          fontSize: 10,
          lineHeight: '20px',
          letterSpacing: '-0.15px',
          color: '#364153',
          whiteSpace: 'nowrap',
        }}
      >
        {kind === 'voice' ? 'Voice Chapter' : 'Text Chapter'}
      </span>
    </span>
  )
}

function PeriodPill({ period }: { period: string }) {
  if (!period) return null
  return (
    <span
      className="inline-flex items-center justify-center"
      style={{
        height: 23.95,
        borderRadius: 9999,
        padding: '0 12px',
        background: '#F3F4F6',
        fontFamily: 'Inter, sans-serif',
        fontWeight: 400,
        fontSize: 12,
        lineHeight: '16px',
        color: '#364153',
        whiteSpace: 'nowrap',
        flexShrink: 0,
      }}
    >
      {period}
    </span>
  )
}

function StatusPill({ status }: { status: DisplayStatus }) {
  const cfg = STATUS_CONFIG[status]
  return (
    <span
      className="inline-flex items-center justify-center"
      style={{
        height: 23.95,
        borderRadius: 9999,
        padding: '0 12px',
        background: cfg.bg,
        fontFamily: 'Inter, sans-serif',
        fontWeight: 400,
        fontSize: 12,
        lineHeight: '16px',
        color: cfg.text,
        whiteSpace: 'nowrap',
        flexShrink: 0,
      }}
    >
      {cfg.label}
    </span>
  )
}

function DateLabel({ date }: { date: string }) {
  return (
    <span className="inline-flex items-center" style={{ gap: 4, flexShrink: 0 }}>
      <Clock style={{ width: 12, height: 12, flexShrink: 0 }} color="#99A1AF" strokeWidth={2} />
      <span
        style={{
          fontFamily: 'Inter, sans-serif',
          fontWeight: 400,
          fontSize: 12,
          lineHeight: '16px',
          color: '#99A1AF',
          whiteSpace: 'nowrap',
        }}
      >
        {date}
      </span>
    </span>
  )
}

function AssignedTo({ chapter }: { chapter: DisplayChapter }) {
  if (chapter.noRecipients) {
    return (
      <span
        style={{
          fontFamily: 'Inter, sans-serif',
          fontWeight: 400,
          fontSize: 12,
          lineHeight: '16px',
          color: '#6A7282',
        }}
      >
        No recipients assigned
      </span>
    )
  }

  return (
    <div className="flex flex-col" style={{ gap: 11 }}>
      <span
        style={{
          fontFamily: 'Inter, sans-serif',
          fontWeight: 400,
          fontSize: 12,
          lineHeight: '16px',
          color: '#6A7282',
        }}
      >
        Assigned to:
      </span>
      <div className="flex items-center flex-wrap" style={{ gap: 5 }}>
        {chapter.groups.map((g) => {
          const colors = GROUP_COLORS[g] ?? { bg: '#F3F4F6', text: '#364153' }
          return (
            <span
              key={g}
              className="inline-flex items-center justify-center"
              style={{
                height: 24,
                borderRadius: 9999,
                padding: '0 12px',
                background: colors.bg,
                fontFamily: 'Inter, sans-serif',
                fontWeight: 500,
                fontSize: 12,
                lineHeight: '16px',
                color: colors.text,
                whiteSpace: 'nowrap',
              }}
            >
              {g}
            </span>
          )
        })}
        {chapter.initials.map((init, i) => (
          <span
            key={`${init}-${i}`}
            className="inline-flex items-center justify-center flex-shrink-0"
            style={{
              width: 23.98,
              height: 23.98,
              borderRadius: 9999,
              background: '#E0E7FF',
              fontFamily: 'Inter, sans-serif',
              fontWeight: 500,
              fontSize: 12,
              lineHeight: '16px',
              color: '#432DD7',
            }}
          >
            {init}
          </span>
        ))}
        {chapter.extra > 0 && (
          <span
            className="inline-flex items-center justify-center flex-shrink-0"
            style={{
              width: 23.98,
              height: 23.98,
              borderRadius: 9999,
              background: '#EBEBEB',
              fontFamily: 'Inter, sans-serif',
              fontWeight: 500,
              fontSize: 12,
              lineHeight: '16px',
              color: '#676767',
            }}
          >
            +{chapter.extra}
          </span>
        )}
      </div>
    </div>
  )
}

/* ---------------------- Grid card ---------------------- */

function ChapterGridCard({ chapter, onOpen }: { chapter: DisplayChapter; onOpen: () => void }) {
  return (
    <div
      onClick={onOpen}
      className="flex flex-col cursor-pointer hover:shadow-sm transition-shadow"
      style={{
        borderRadius: 14,
        border: '1.25px solid #E5E7EB',
        background: '#FFFFFF',
        padding: 20,
      }}
    >
      <div className="flex items-center justify-between gap-2">
        <span
          style={{
            fontFamily: 'Inter, sans-serif',
            fontWeight: 400,
            fontSize: 12,
            lineHeight: '16px',
            color: '#6A7282',
          }}
        >
          Chapter {chapter.number}
        </span>
        <DateLabel date={chapter.date} />
      </div>

      <div className="flex items-start justify-between gap-3" style={{ marginTop: 15 }}>
        <h2
          style={{
            fontFamily: '"Instrument Serif", serif',
            fontWeight: 400,
            fontSize: 28,
            lineHeight: '28px',
            color: '#101828',
            wordBreak: 'break-word',
          }}
        >
          {chapter.title}
        </h2>
        <div style={{ marginTop: 3.75 }}>
          <TypeBadge kind={chapter.kind} />
        </div>
      </div>

      <div className="flex items-center flex-wrap" style={{ gap: 8, marginTop: 16 }}>
        <PeriodPill period={chapter.period} />
        <StatusPill status={chapter.status} />
      </div>

      <div style={{ marginTop: 16 }}>
        {chapter.words ? (
          <span
            style={{
              fontFamily: 'Inter, sans-serif',
              fontWeight: 400,
              fontSize: 14,
              lineHeight: '20px',
              letterSpacing: '-0.15px',
              color: '#4A5565',
            }}
          >
            {chapter.words} words
          </span>
        ) : (
          <span
            style={{
              fontFamily: 'Inter, sans-serif',
              fontWeight: 500,
              fontStyle: 'italic',
              fontSize: 14,
              lineHeight: '20px',
              letterSpacing: '-0.15px',
              color: '#4F46E5',
            }}
          >
            Continue Writing
          </span>
        )}
      </div>

      <div style={{ marginTop: 16, paddingTop: 16, borderTop: '1.25px solid #F3F4F6' }}>
        <AssignedTo chapter={chapter} />
      </div>
    </div>
  )
}

/* ---------------------- List card ---------------------- */

function ChapterListCard({ chapter, onOpen }: { chapter: DisplayChapter; onOpen: () => void }) {
  return (
    <div
      onClick={onOpen}
      className="flex flex-col cursor-pointer hover:shadow-sm transition-shadow"
      style={{
        borderRadius: 14,
        border: '1.25px solid #E5E7EB',
        background: '#FFFFFF',
        padding: 20,
        gap: 13,
      }}
    >
      <div className="flex items-start" style={{ gap: 16 }}>
        <div className="flex flex-col items-center flex-shrink-0" style={{ width: 63.98 }}>
          <span
            style={{
              fontFamily: 'Inter, sans-serif',
              fontWeight: 400,
              fontSize: 12,
              lineHeight: '16px',
              textAlign: 'center',
              color: '#6A7282',
            }}
          >
            Chapter
          </span>
          <span
            style={{
              fontFamily: '"Instrument Serif", serif',
              fontWeight: 400,
              fontSize: 24,
              lineHeight: '32px',
              textAlign: 'center',
              color: '#101828',
            }}
          >
            {chapter.number}
          </span>
        </div>

        <div className="flex flex-col flex-1 min-w-0" style={{ gap: 7.99 }}>
          <div className="flex items-start justify-between gap-3 flex-wrap">
            <h2
              style={{
                fontFamily: '"Instrument Serif", serif',
                fontWeight: 400,
                fontSize: 23,
                lineHeight: '28px',
                color: '#101828',
                wordBreak: 'break-word',
              }}
            >
              {chapter.title}
            </h2>
            <TypeBadge kind={chapter.kind} />
          </div>

          <div className="flex items-center flex-wrap" style={{ gap: 16 }}>
            {chapter.period && (
              <span
                style={{
                  fontFamily: 'Inter, sans-serif',
                  fontWeight: 400,
                  fontSize: 14,
                  lineHeight: '20px',
                  letterSpacing: '-0.15px',
                  color: '#4A5565',
                  whiteSpace: 'nowrap',
                }}
              >
                {chapter.period}
              </span>
            )}
            <StatusPill status={chapter.status} />
            {chapter.words ? (
              <span
                style={{
                  fontFamily: 'Inter, sans-serif',
                  fontWeight: 400,
                  fontSize: 14,
                  lineHeight: '20px',
                  letterSpacing: '-0.15px',
                  color: '#4A5565',
                  whiteSpace: 'nowrap',
                }}
              >
                {chapter.words} words
              </span>
            ) : (
              <span
                style={{
                  fontFamily: 'Inter, sans-serif',
                  fontWeight: 500,
                  fontStyle: 'italic',
                  fontSize: 14,
                  lineHeight: '20px',
                  letterSpacing: '-0.15px',
                  color: '#4F46E5',
                }}
              >
                Continue Writing
              </span>
            )}
          </div>
        </div>

        <div className="flex-shrink-0">
          <DateLabel date={chapter.date} />
        </div>
      </div>

      <div style={{ paddingTop: 9, borderTop: '1px solid #F3F4F6' }}>
        <AssignedTo chapter={chapter} />
      </div>
    </div>
  )
}

/* ---------------------- Progress panel ---------------------- */

function ProgressPanel({
  stats,
  totalChapters,
  showToast,
}: {
  stats: ChapterStats | null
  totalChapters: number
  showToast: (m: string, t?: 'success' | 'error' | 'info') => void
}) {
  const router = useRouter()
  const completed = stats?.completed_chapters ?? 0
  const total = stats?.total_chapters ?? totalChapters
  const percent = total > 0 ? Math.round((completed / total) * 100) : 0

  return (
    <div
      className="flex flex-col"
      style={{
        borderRadius: 14,
        border: '1.25px solid rgba(0,0,0,0.1)',
        background: '#FFFFFF',
        padding: 20,
        gap: 25,
      }}
    >
      <h3
        style={{
          fontFamily: 'Inter, sans-serif',
          fontWeight: 600,
          fontSize: 18,
          lineHeight: '27px',
          letterSpacing: '-0.44px',
          color: '#101828',
        }}
      >
        Progress
      </h3>

      <div className="flex items-center justify-center" style={{ height: 124 }}>
        <ProgressDonut percent={percent} />
      </div>

      <div className="flex flex-col" style={{ gap: 11.99 }}>
        <StatRow label="Chapters written" value={String(completed)} />
        <StatRow label="Total words" value={(stats?.total_words ?? 0).toLocaleString('en-US')} />
        <StatRow label="Recipients assigned" value={String(stats?.recipients_assigned ?? 0)} />
      </div>

      {total > 0 && completed < total && (
        <div
          style={{
            borderRadius: 10,
            border: '1.25px solid #E0E7FF',
            background: '#EEF2FF',
            padding: 13.24,
          }}
        >
          <p
            style={{
              fontFamily: 'Inter, sans-serif',
              fontWeight: 400,
              fontSize: 12,
              lineHeight: '16px',
              color: '#312C85',
            }}
          >
            Complete {total - completed} more {total - completed === 1 ? 'chapter' : 'chapters'} to give your family a complete picture of your life
          </p>
        </div>
      )}

      <div className="flex flex-col" style={{ gap: 7.99 }}>
        <PanelButton
          icon={<Download style={{ width: 16, height: 16 }} color="#0A0A0A" strokeWidth={2} />}
          label="Download Memoir"
          onClick={() => {
            if (total === 0) {
              showToast('Add a chapter before downloading your memoir.', 'info')
              return
            }
            router.push('/story/preview')
          }}
        />
        <PanelButton
          icon={<Settings style={{ width: 16, height: 16 }} color="#0A0A0A" strokeWidth={2} />}
          label="Memoir settings"
          onClick={() => router.push('/story/settings')}
        />
      </div>
    </div>
  )
}

function StatRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center justify-between gap-2">
      <span
        style={{
          fontFamily: 'Inter, sans-serif',
          fontWeight: 400,
          fontSize: 14,
          lineHeight: '20px',
          letterSpacing: '-0.15px',
          color: '#4A5565',
        }}
      >
        {label}
      </span>
      <span
        style={{
          fontFamily: 'Inter, sans-serif',
          fontWeight: 600,
          fontSize: 14,
          lineHeight: '20px',
          letterSpacing: '-0.15px',
          color: '#101828',
        }}
      >
        {value}
      </span>
    </div>
  )
}

function PanelButton({
  icon,
  label,
  onClick,
}: {
  icon: React.ReactNode
  label: string
  onClick?: () => void
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="flex items-center justify-center gap-2 cursor-pointer hover:bg-gray-50"
      style={{
        height: 31.99,
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
      {icon}
      {label}
    </button>
  )
}

function ProgressDonut({ percent }: { percent: number }) {
  const size = 128
  const stroke = 12
  const r = (size - stroke) / 2
  const c = size / 2
  const circumference = 2 * Math.PI * r

  const gapDeg = 8
  const progSpanDeg = Math.max(0, (percent / 100) * (360 - 2 * gapDeg))
  const trackSpanDeg = Math.max(0, ((100 - percent) / 100) * (360 - 2 * gapDeg))

  const progLen = (progSpanDeg / 360) * circumference
  const trackLen = (trackSpanDeg / 360) * circumference

  const progRotate = -90 + gapDeg
  const trackRotate = -90 + progSpanDeg + 2 * gapDeg

  return (
    <div className="relative" style={{ width: size, height: size }}>
      <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
        <circle
          cx={c}
          cy={c}
          r={r}
          fill="none"
          stroke="#E5E7EB"
          strokeWidth={stroke}
          strokeLinecap="round"
          strokeDasharray={`${trackLen} ${circumference}`}
          transform={`rotate(${trackRotate} ${c} ${c})`}
        />
        <circle
          cx={c}
          cy={c}
          r={r}
          fill="none"
          stroke="#4F39F6"
          strokeWidth={stroke}
          strokeLinecap="round"
          strokeDasharray={`${progLen} ${circumference}`}
          transform={`rotate(${progRotate} ${c} ${c})`}
        />
      </svg>
      <div className="absolute inset-0 flex items-center justify-center">
        <span
          style={{
            fontFamily: 'Inter, sans-serif',
            fontWeight: 700,
            fontSize: 24,
            lineHeight: '32px',
            letterSpacing: '0.07px',
            color: '#101828',
          }}
        >
          {percent}%
        </span>
      </div>
    </div>
  )
}
