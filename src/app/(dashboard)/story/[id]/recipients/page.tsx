'use client'

import { useCallback, useEffect, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { ArrowLeft, Check, Loader2, Users } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import { useToast } from '@/lib/context/ToastContext'
import { ApiError } from '@/lib/api/client'
import {
  buildChapterAssignments,
  getChapter,
  setChapterAssignments,
} from '@/lib/api/chapters'
import { getRecipients, type Recipient } from '@/lib/api/recipients'
import { assignmentsToSelection } from '@/lib/utils/assignments'
import { displayRelationship } from '@/lib/relationship'

/* ---------------------- Helpers ---------------------- */

async function getToken(): Promise<string | null> {
  const supabase = createClient()
  const {
    data: { session },
  } = await supabase.auth.getSession()
  return session?.access_token ?? null
}

const GROUPS = ['All Family', 'All Friends', 'All Others', 'Release Manager', 'All Recipients']

function initialsOf(name: string): string {
  const parts = name.trim().split(/\s+/).filter(Boolean)
  if (parts.length === 0) return '?'
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase()
  return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase()
}

const labelStyle: React.CSSProperties = {
  fontFamily: 'Inter, sans-serif',
  fontWeight: 500,
  fontSize: 14,
  lineHeight: '20px',
  letterSpacing: '-0.15px',
  color: '#364153',
}

/* ---------------------- Page ---------------------- */

export default function ChapterRecipientsPage() {
  const router = useRouter()
  const params = useParams<{ id: string }>()
  const chapterId = params.id
  const { showToast } = useToast()

  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [chapterTitle, setChapterTitle] = useState('')
  const [recipients, setRecipients] = useState<Recipient[]>([])

  const [assignLater, setAssignLater] = useState(false)
  const [groups, setGroups] = useState<string[]>([])
  const [individualIds, setIndividualIds] = useState<string[]>([])
  const [note, setNote] = useState('')
  const [saving, setSaving] = useState(false)

  const backToEditor = () => router.push(`/story/${chapterId}`)

  const load = useCallback(async () => {
    const token = await getToken()
    if (!token) {
      setError('Your session has expired. Please sign in again.')
      setLoading(false)
      return
    }
    try {
      const [chapter, people] = await Promise.all([
        getChapter(token, chapterId),
        getRecipients(token).catch(() => [] as Recipient[]),
      ])
      setChapterTitle(chapter.title)
      setRecipients(people)
      const { groups: g, individuals } = assignmentsToSelection(
        (chapter.assignments ?? []).map((a) => ({
          assignment_scope: a.assignment_scope,
          group_value: a.group_value ?? null,
          recipient_id: a.recipient_id ?? null,
        })),
      )
      setAssignLater(g.includes('Assign Later'))
      setGroups(g.filter((x) => x !== 'Assign Later'))
      setIndividualIds(individuals)
    } catch (e) {
      setError(e instanceof ApiError ? e.message : 'Could not load recipients.')
    } finally {
      setLoading(false)
    }
  }, [chapterId])

  useEffect(() => {
    load()
  }, [load])

  const toggleGroup = (g: string) => {
    setAssignLater(false)
    setGroups((prev) => (prev.includes(g) ? prev.filter((x) => x !== g) : [...prev, g]))
  }

  const toggleAssignLater = () => {
    setAssignLater((prev) => {
      const next = !prev
      if (next) {
        setGroups([])
        setIndividualIds([])
      }
      return next
    })
  }

  const togglePerson = (id: string) => {
    setAssignLater(false)
    setIndividualIds((prev) => (prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]))
  }

  const handleSave = async () => {
    if (saving) return
    setSaving(true)
    const token = await getToken()
    if (!token) {
      setSaving(false)
      showToast('Your session has expired. Please sign in again.', 'error')
      return
    }
    try {
      const selectedGroups = assignLater ? ['Assign Later'] : groups
      await setChapterAssignments(
        token,
        chapterId,
        buildChapterAssignments(selectedGroups, assignLater ? [] : individualIds),
        note,
      )
      showToast('Assignments saved', 'success')
      backToEditor()
    } catch (e) {
      setSaving(false)
      showToast(e instanceof ApiError ? e.message : 'Could not save assignments.', 'error')
    }
  }

  const receiveCount = individualIds.length

  if (loading) {
    return (
      <div className="flex items-center justify-center" style={{ minHeight: 'calc(100vh - 200px)' }}>
        <Loader2 className="w-6 h-6 animate-spin text-[#4F39F6]" />
      </div>
    )
  }

  if (error) {
    return (
      <div className="w-full max-w-[680px] mx-auto flex flex-col items-center text-center" style={{ gap: 16, paddingTop: 80 }}>
        <p style={{ fontFamily: 'Inter, sans-serif', fontSize: 16, color: '#4A5565' }}>{error}</p>
        <BackLink onClick={backToEditor} />
      </div>
    )
  }

  return (
    <div className="w-full max-w-[864px] mx-auto flex flex-col" style={{ gap: 24 }}>
      <BackLink onClick={backToEditor} />

      {/* Heading */}
      <div className="flex flex-col" style={{ gap: 8 }}>
        <h1 style={{ fontFamily: '"Instrument Serif", serif', fontWeight: 400, fontSize: 38, lineHeight: '48px', color: '#101828' }}>
          Assigning — <span style={{ color: '#4F46E5' }}>{chapterTitle}</span>
        </h1>
        <p style={{ fontFamily: 'Inter, sans-serif', fontWeight: 400, fontSize: 16, lineHeight: '24px', letterSpacing: '-0.31px', color: '#4A5565' }}>
          Choose who receives this chapter. Recipients will be able to read it after verification is complete.
        </p>
      </div>

      {/* Card */}
      <div className="flex flex-col" style={{ borderRadius: 14, border: '1px solid rgba(0,0,0,0.1)', background: '#FFFFFF', padding: 24, gap: 24 }}>
        {/* Group checkboxes */}
        <div className="flex flex-wrap items-center" style={{ gap: 10, paddingBottom: 16, borderBottom: '1px solid #E5E7EB' }}>
          {/* Assign later (yellow) */}
          <button
            type="button"
            onClick={toggleAssignLater}
            className="flex items-center cursor-pointer"
            style={{ height: 34, borderRadius: 8, border: '1px solid #FFD230', background: '#FEF3C6', padding: '0 12.5px', gap: 5 }}
          >
            <span
              className="flex items-center justify-center flex-shrink-0"
              style={{ width: 13, height: 13, borderRadius: 4, background: assignLater ? '#7B3306' : 'transparent', border: '1px solid #7B3306' }}
            >
              {assignLater && <Check style={{ width: 9, height: 9 }} color="#F9FAFB" strokeWidth={3} />}
            </span>
            <span style={{ fontFamily: 'Inter, sans-serif', fontWeight: 500, fontSize: 14, lineHeight: '20px', letterSpacing: '-0.15px', color: '#7B3306' }}>
              Assign later
            </span>
          </button>

          {/* Group options */}
          {GROUPS.map((g) => {
            const checked = groups.includes(g)
            return (
              <button key={g} type="button" onClick={() => toggleGroup(g)} className="flex items-center cursor-pointer" style={{ gap: 5, padding: '0 2px' }}>
                <span
                  className="flex items-center justify-center flex-shrink-0"
                  style={{ width: 13, height: 13, borderRadius: 4, background: checked ? '#4F46E5' : 'transparent', border: checked ? '1px solid #4F46E5' : '1px solid #4A5565' }}
                >
                  {checked && <Check style={{ width: 9, height: 9 }} color="#FFFFFF" strokeWidth={3} />}
                </span>
                <span style={{ fontFamily: 'Inter, sans-serif', fontWeight: 500, fontSize: 14, lineHeight: '20px', letterSpacing: '-0.15px', color: '#4A5565' }}>
                  {g}
                </span>
              </button>
            )
          })}
        </div>

        {/* People toggles */}
        {recipients.length === 0 ? (
          <p style={{ fontFamily: 'Inter, sans-serif', fontSize: 14, color: '#6A7282' }}>
            You haven&apos;t added any recipients yet. Assign a group above, or add recipients from the Access page.
          </p>
        ) : (
          <div className="flex flex-col" style={{ gap: 12 }}>
            {recipients.map((p) => (
              <div key={p.id} className="flex items-center justify-between gap-3" style={{ borderRadius: 10, border: '1px solid #E5E7EB', padding: 17 }}>
                <div className="flex items-center min-w-0" style={{ gap: 12 }}>
                  <span
                    className="flex items-center justify-center flex-shrink-0"
                    style={{ width: 40, height: 40, borderRadius: 9999, background: '#E0E7FF', fontFamily: 'Inter, sans-serif', fontWeight: 500, fontSize: 16, lineHeight: '24px', letterSpacing: '-0.31px', color: '#4F46E5' }}
                  >
                    {initialsOf(p.name)}
                  </span>
                  <div className="flex flex-col min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span style={{ fontFamily: 'Inter, sans-serif', fontWeight: 500, fontSize: 16, lineHeight: '24px', letterSpacing: '-0.31px', color: '#101828' }}>
                        {p.name}
                      </span>
                      {p.invitation_status === 'pending' && (
                        <span
                          className="inline-flex items-center"
                          style={{ borderRadius: 9999, padding: '1px 8px', background: '#FEF3C6', fontFamily: 'Inter, sans-serif', fontWeight: 500, fontSize: 12, lineHeight: '16px', color: '#BB4D00' }}
                        >
                          Invite pending
                        </span>
                      )}
                    </div>
                    <span style={{ fontFamily: 'Inter, sans-serif', fontWeight: 400, fontSize: 14, lineHeight: '20px', letterSpacing: '-0.15px', color: '#6A7282' }}>
                      {displayRelationship(p.relationship)}
                    </span>
                  </div>
                </div>

                <Toggle on={individualIds.includes(p.id)} onClick={() => togglePerson(p.id)} />
              </div>
            ))}
          </div>
        )}

        {/* Note for recipients */}
        <div className="flex flex-col" style={{ gap: 8, paddingTop: 16, borderTop: '1px solid #E5E7EB' }}>
          <label style={labelStyle}>
            Add a note for recipients <span style={{ color: '#99A1AF' }}>(optional)</span>
          </label>
          <textarea
            value={note}
            onChange={(e) => setNote(e.target.value)}
            placeholder="This note will appear before they read this chapter. Example: 'I wrote this one especially for you.'"
            rows={3}
            className="w-full focus:outline-none resize-none focus:border-[#4F39F6]"
            style={{
              minHeight: 96,
              borderRadius: 10,
              border: '1px solid #D1D5DC',
              padding: 12,
              fontFamily: 'Inter, sans-serif',
              fontWeight: 400,
              fontSize: 14,
              lineHeight: '20px',
              letterSpacing: '-0.15px',
              color: '#0A0A0A',
            }}
          />
          <span style={{ fontFamily: 'Inter, sans-serif', fontWeight: 400, fontSize: 12, lineHeight: '16px', color: '#6A7282' }}>
            This message appears when recipients first access this chapter
          </span>
        </div>
      </div>

      {/* Receive count banner */}
      <div className="flex items-center" style={{ borderRadius: 10, border: '1px solid #C6D2FF', background: '#EEF2FF', padding: 17, gap: 8 }}>
        <Users style={{ width: 20, height: 20, flexShrink: 0 }} color="#4F46E5" strokeWidth={2} />
        <span style={{ fontFamily: 'Inter, sans-serif', fontWeight: 500, fontSize: 16, lineHeight: '24px', letterSpacing: '-0.31px', color: '#4F46E5' }}>
          {assignLater
            ? 'Assignments will be decided later'
            : `${receiveCount} ${receiveCount === 1 ? 'person' : 'people'} selected individually`}
        </span>
      </div>

      {/* Footer buttons */}
      <div className="flex items-center justify-end" style={{ gap: 12 }}>
        <button
          type="button"
          onClick={backToEditor}
          className="flex items-center justify-center cursor-pointer hover:bg-gray-50"
          style={{ height: 36, padding: '8px 16px', borderRadius: 8, border: '1px solid rgba(0,0,0,0.1)', background: '#FFFFFF', ...labelStyle, color: '#0A0A0A' }}
        >
          Cancel
        </button>
        <button
          type="button"
          disabled={saving}
          onClick={handleSave}
          className="flex items-center justify-center gap-2 cursor-pointer hover:opacity-90 disabled:opacity-60"
          style={{ height: 36, padding: '8px 16px', borderRadius: 8, background: '#4F46E5', ...labelStyle, color: '#FFFFFF' }}
        >
          {saving && <Loader2 className="w-4 h-4 animate-spin" />}
          Save assignments
        </button>
      </div>
    </div>
  )
}

/* ---------------------- Bits ---------------------- */

function BackLink({ onClick }: { onClick: () => void }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="flex items-center gap-2 cursor-pointer hover:opacity-80 self-start"
      style={{ ...labelStyle, color: '#4A5565', background: 'transparent' }}
    >
      <ArrowLeft style={{ width: 16, height: 16, flexShrink: 0 }} color="#4A5565" strokeWidth={2} />
      Back to chapter
    </button>
  )
}

function Toggle({ on, onClick }: { on: boolean; onClick: () => void }) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={on}
      onClick={onClick}
      className="relative flex-shrink-0 cursor-pointer transition-colors"
      style={{ width: 44, height: 24, borderRadius: 9999, background: on ? '#4F46E5' : '#E5E7EB' }}
    >
      <span
        className="absolute top-1/2 -translate-y-1/2 transition-all"
        style={{ width: 20, height: 20, borderRadius: 9999, background: '#FFFFFF', left: on ? 22 : 2, boxShadow: '0px 1px 2px rgba(0,0,0,0.2)' }}
      />
    </button>
  )
}
