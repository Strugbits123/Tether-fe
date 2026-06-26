'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import {
  Clock,
  Download,
  Grid3x3,
  List,
  Mic,
  Pencil,
  Plus,
  Settings,
} from 'lucide-react'

/* ---------------------- Types & data ---------------------- */

type ChapterStatus = 'complete' | 'in-progress' | 'draft'
type ChapterKind = 'text' | 'voice'

interface Chapter {
  number: number
  title: string
  kind: ChapterKind
  period: string
  status: ChapterStatus
  words: string | null
  date: string
  groups: string[]
  initials: string[]
  extra: number
  noRecipients?: boolean
}

const CHAPTERS: Chapter[] = [
  {
    number: 1,
    title: 'Growing Up in Chicago',
    kind: 'text',
    period: '1965 – 1978',
    status: 'complete',
    words: '1,247',
    date: 'Mar 28, 2026',
    groups: ['All Family', 'All Friends', 'All Recipients', 'Release Manager', 'All Others'],
    initials: ['KH', 'EM', 'WI'],
    extra: 4,
  },
  {
    number: 2,
    title: 'Growing Up in Chicago',
    kind: 'voice',
    period: '1982',
    status: 'complete',
    words: '1,247',
    date: 'Mar 30, 2026',
    groups: ['All Friends'],
    initials: ['KH', 'WI'],
    extra: 0,
  },
  {
    number: 3,
    title: 'Growing Up in Chicago',
    kind: 'text',
    period: '1988 – 2005',
    status: 'in-progress',
    words: '1,247',
    date: 'April 03, 2026',
    groups: ['All Family', 'All Friends', 'All Recipients'],
    initials: ['KH', 'EM', 'WI'],
    extra: 4,
  },
  {
    number: 4,
    title: 'Growing Up in Chicago',
    kind: 'text',
    period: '2008 – 2012',
    status: 'draft',
    words: null,
    date: 'April 30, 2026',
    groups: [],
    initials: [],
    extra: 0,
    noRecipients: true,
  },
]

const STATUS_CONFIG: Record<ChapterStatus, { label: string; bg: string; text: string; bold: boolean }> = {
  complete: { label: 'Complete', bg: '#DCFCE7', text: '#008236', bold: false },
  'in-progress': { label: 'In Progress', bg: '#E0E7FF', text: '#432DD7', bold: false },
  draft: { label: 'Draft', bg: '#FEF3C6', text: '#BB4D00', bold: false },
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
  const [layout, setLayout] = useState<'grid' | 'list'>('grid')

  return (
    <div className="flex flex-col gap-6">
      {/* Header row */}
      <div className="flex items-start justify-between gap-4 flex-wrap">
        {/* Left: title + subtitle + chips */}
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

          {/* Chips row */}
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
              {CHAPTERS.length} chapters
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
        {/* Cards area */}
        <div className="flex-1 min-w-0">
          {layout === 'grid' ? (
            <div className="grid grid-cols-1 md:grid-cols-2" style={{ gap: 20 }}>
              {CHAPTERS.map((c) => (
                <ChapterGridCard key={c.number} chapter={c} />
              ))}
            </div>
          ) : (
            <div className="flex flex-col" style={{ gap: 15 }}>
              {CHAPTERS.map((c) => (
                <ChapterListCard key={c.number} chapter={c} />
              ))}
            </div>
          )}
        </div>

        {/* Progress panel */}
        <div className="w-full lg:w-[286px] flex-shrink-0">
          <ProgressPanel />
        </div>
      </div>
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

function StatusPill({ status }: { status: ChapterStatus }) {
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

function AssignedTo({ chapter }: { chapter: Chapter }) {
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
        {chapter.initials.map((init) => (
          <span
            key={init}
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

function ChapterGridCard({ chapter }: { chapter: Chapter }) {
  return (
    <div
      className="flex flex-col cursor-pointer hover:shadow-sm transition-shadow"
      style={{
        borderRadius: 14,
        border: '1.25px solid #E5E7EB',
        background: '#FFFFFF',
        padding: 20,
      }}
    >
      {/* Top: chapter no. + date */}
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

      {/* Title + type badge */}
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

      {/* Period + status */}
      <div className="flex items-center flex-wrap" style={{ gap: 8, marginTop: 16 }}>
        <PeriodPill period={chapter.period} />
        <StatusPill status={chapter.status} />
      </div>

      {/* Word count / continue writing */}
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
          <button
            type="button"
            className="cursor-pointer hover:opacity-80"
            style={{
              fontFamily: 'Inter, sans-serif',
              fontWeight: 500,
              fontStyle: 'italic',
              fontSize: 14,
              lineHeight: '20px',
              letterSpacing: '-0.15px',
              color: '#4F46E5',
              background: 'transparent',
            }}
          >
            Continue Writing
          </button>
        )}
      </div>

      {/* Divider + assigned to */}
      <div
        style={{
          marginTop: 16,
          paddingTop: 16,
          borderTop: '1.25px solid #F3F4F6',
        }}
      >
        <AssignedTo chapter={chapter} />
      </div>
    </div>
  )
}

/* ---------------------- List card ---------------------- */

function ChapterListCard({ chapter }: { chapter: Chapter }) {
  return (
    <div
      className="flex flex-col cursor-pointer hover:shadow-sm transition-shadow"
      style={{
        borderRadius: 14,
        border: '1.25px solid #E5E7EB',
        background: '#FFFFFF',
        padding: 20,
        gap: 13,
      }}
    >
      {/* Top row: number + main info + date */}
      <div className="flex items-start" style={{ gap: 16 }}>
        {/* Chapter number block */}
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

        {/* Main info */}
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
            {chapter.words ? (
              <>
                <StatusPill status={chapter.status} />
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
              </>
            ) : (
              <>
                <StatusPill status={chapter.status} />
                <button
                  type="button"
                  className="cursor-pointer hover:opacity-80"
                  style={{
                    fontFamily: 'Inter, sans-serif',
                    fontWeight: 500,
                    fontStyle: 'italic',
                    fontSize: 14,
                    lineHeight: '20px',
                    letterSpacing: '-0.15px',
                    color: '#4F46E5',
                    background: 'transparent',
                  }}
                >
                  Continue Writing
                </button>
              </>
            )}
          </div>
        </div>

        {/* Date */}
        <div className="flex-shrink-0">
          <DateLabel date={chapter.date} />
        </div>
      </div>

      {/* Assigned to */}
      <div
        style={{
          paddingTop: 9,
          borderTop: '1px solid #F3F4F6',
        }}
      >
        <AssignedTo chapter={chapter} />
      </div>
    </div>
  )
}

/* ---------------------- Progress panel ---------------------- */

function ProgressPanel() {
  const router = useRouter()
  const percent = 50

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

      {/* Donut */}
      <div className="flex items-center justify-center" style={{ height: 124 }}>
        <ProgressDonut percent={percent} />
      </div>

      {/* Stats */}
      <div className="flex flex-col" style={{ gap: 11.99 }}>
        <StatRow label="Chapters written" value="2" />
        <StatRow label="Total words" value="2,773" />
        <StatRow label="Recipients assigned" value="3" />
      </div>

      {/* Info box */}
      <div
        style={{
          borderRadius: 10,
          border: '1.25px solid #E0E7FF',
          background: '#EEF2FF',
          padding: '13.24px 13.24px 13.24px 13.24px',
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
          Add 2 more chapters to give your family a complete picture of your life
        </p>
      </div>

      {/* Buttons */}
      <div className="flex flex-col" style={{ gap: 7.99 }}>
        <PanelButton
          icon={<Download style={{ width: 16, height: 16 }} color="#0A0A0A" strokeWidth={2} />}
          label="Download Memoir"
          onClick={() => router.push('/story/preview')}
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

  // Two separate rounded arcs with a small gap at each junction.
  const gapDeg = 8
  const progSpanDeg = Math.max(0, (percent / 100) * (360 - 2 * gapDeg))
  const trackSpanDeg = Math.max(0, ((100 - percent) / 100) * (360 - 2 * gapDeg))

  const progLen = (progSpanDeg / 360) * circumference
  const trackLen = (trackSpanDeg / 360) * circumference

  // Sequence clockwise from the top: gap → progress → gap → track.
  const progRotate = -90 + gapDeg
  const trackRotate = -90 + progSpanDeg + 2 * gapDeg

  return (
    <div className="relative" style={{ width: size, height: size }}>
      <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
        {/* Unfilled track arc */}
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
        {/* Filled progress arc */}
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
