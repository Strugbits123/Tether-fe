'use client'

import React, { useEffect, useRef, useState } from 'react'
import {
  AlignCenter,
  AlignLeft,
  AlignRight,
  Bold,
  Camera,
  Check,
  Clock,
  FileText,
  Italic,
  Indent,
  List,
  ListOrdered,
  Loader2,
  Outdent,
  Palette,
  PenLine,
  Radio,
  Search,
  Strikethrough,
  Underline,
  X,
} from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import { useToast } from '@/lib/context/ToastContext'
import {
  type Assignment,
  createTextMessage,
  createVideoUploadUrl,
  createAudioUploadUrl,
  confirmAudioUpload,
  getMessageStatus,
} from '@/lib/api/messages'
import { getRecipients, type Recipient } from '@/lib/api/recipients'
import AudioRecordingWaveform from '@/components/audio/AudioRecordingWaveform'
import AudioPlaybackWaveform from '@/components/audio/AudioPlaybackWaveform'

interface CreateMessageModalProps {
  open: boolean
  onClose: () => void
  headerTitle?: string
  headerSubtitle?: string
  /** Optional initial values for edit mode. */
  initialMessage?: EditableMessage
  onSave?: (message: EditableMessage) => void | Promise<void>
  /** Called after a message is successfully created on the backend. */
  onCreated?: () => void
  /** Skip this onboarding step without creating a message. */
  onSkip?: () => void
  /** Open directly on a specific step instead of 'setup'. */
  initialStep?: Step
  /** Pre-select the message type (used with initialStep). */
  initialMessageType?: MessageType
  /** Pre-fill the title (used with initialStep). */
  initialTitle?: string
  /** Read-only view of an existing message (no editing/recording). */
  readOnly?: boolean
}

export interface EditableMessage {
  id?: string
  audience: string[]
  selectedIndividualIds?: string[]
  messageType: 'write' | 'video' | 'audio'
  title: string
  notes: string
  body?: string
}

type MessageType = 'write' | 'video' | 'audio'
type Step = 'setup' | 'record' | 'write'

const AUDIENCE_CHIPS = [
  'All recipients',
  'All family',
  'All friends',
  'Release Manager',
  'All Others',
  'Choose individuals',
  'Assign later',
]

/** Chips that stand alone — selecting one clears every other chip. */
const EXCLUSIVE_CHIPS = ['Choose individuals', 'Assign later']

/** Maps an audience chip label to its backend Assignment shape. */
const RECIPIENT_OPTIONS: Record<string, Assignment> = {
  'All recipients': { scope: 'all' },
  'All family': { scope: 'group', groupValue: 'family' },
  'All friends': { scope: 'group', groupValue: 'friends' },
  'Release Manager': { scope: 'release_manager' },
  'All Others': { scope: 'group', groupValue: 'others' },
  'Assign later': { scope: 'assign_later' },
}

export function buildAssignments(
  audience: string[],
  selectedIndividualIds: string[],
): Assignment[] {
  // "Assign later" stands alone — send only that.
  if (audience.includes('Assign later')) return [{ scope: 'assign_later' }]

  const result: Assignment[] = []
  for (const chip of audience) {
    if (chip === 'Choose individuals') {
      for (const id of selectedIndividualIds) {
        if (id) result.push({ scope: 'individual', recipientId: id })
      }
    } else if (RECIPIENT_OPTIONS[chip]) {
      result.push(RECIPIENT_OPTIONS[chip])
    }
  }
  if (result.length === 0) result.push({ scope: 'assign_later' })
  return result
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

export default function CreateMessageModal({
  open,
  onClose,
  headerTitle = 'Create Your First Message',
  headerSubtitle = 'This is the heart of your Tether',
  initialMessage,
  onSave,
  onCreated,
  onSkip,
  initialStep,
  initialMessageType,
  initialTitle,
  readOnly = false,
}: CreateMessageModalProps) {
  const { showToast } = useToast()

  // step state
  const [step, setStep] = useState<Step>(initialStep ?? 'setup')

  // setup state — multi-select audience
  const [audience, setAudience] = useState<string[]>(
    initialMessage?.audience ?? ['All recipients'],
  )
  const [selectedIndividualIds, setSelectedIndividualIds] = useState<string[]>(
    initialMessage?.selectedIndividualIds ?? [],
  )
  const [messageType, setMessageType] = useState<MessageType>(
    initialMessageType ?? initialMessage?.messageType ?? 'video',
  )
  const [title, setTitle] = useState(initialTitle ?? initialMessage?.title ?? '')
  const [notes, setNotes] = useState(initialMessage?.notes ?? '')
  const [body, setBody] = useState(initialMessage?.body ?? '')

  // recipients (for the "Choose individuals" picker)
  const [recipients, setRecipients] = useState<Recipient[]>([])

  // submit state for the text flow
  const [submitting, setSubmitting] = useState(false)

  // Resync if a different message is opened for editing
  useEffect(() => {
    if (!open) return
    setAudience(initialMessage?.audience ?? ['All recipients'])
    setSelectedIndividualIds(initialMessage?.selectedIndividualIds ?? [])
    setMessageType(initialMessageType ?? initialMessage?.messageType ?? 'video')
    setTitle(initialTitle ?? initialMessage?.title ?? '')
    setNotes(initialMessage?.notes ?? '')
    setBody(initialMessage?.body ?? '')
    setStep(initialStep ?? 'setup')
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open, initialMessage?.id])

  // Load real recipients when the modal opens.
  useEffect(() => {
    if (!open) return
    let active = true
    ;(async () => {
      const token = await getToken()
      if (!token) return
      try {
        const data = await getRecipients(token)
        if (active) setRecipients(data)
      } catch {
        /* non-fatal — picker just stays empty */
      }
    })()
    return () => {
      active = false
    }
  }, [open])

  const recipientLabel = (() => {
    if (audience.includes('Choose individuals')) {
      if (selectedIndividualIds.length === 1) {
        return recipients.find((r) => r.id === selectedIndividualIds[0])?.name ?? 'someone special'
      }
      if (selectedIndividualIds.length > 1) return `${selectedIndividualIds.length} people`
      return 'someone special'
    }
    return audience[0] ?? 'someone special'
  })()

  useEffect(() => {
    if (!open) return
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') handleClose()
    }
    document.addEventListener('keydown', onKey)
    const prev = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    return () => {
      document.removeEventListener('keydown', onKey)
      document.body.style.overflow = prev
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open])

  const handleClose = () => {
    setStep('setup')
    onClose()
  }

  const handleOpenRecorder = () => {
    if (messageType === 'write') setStep('write')
    else setStep('record')
  }

  // Edit-mode save: awaits the parent's async onSave, keeps the modal open with a
  // loading state, and only closes once the API call resolves.
  const handleEditSave = async (overrides?: {
    title?: string
    notes?: string
    body?: string
  }) => {
    if (submitting) return
    setSubmitting(true)
    try {
      await onSave?.({
        id: initialMessage?.id,
        audience,
        selectedIndividualIds,
        messageType,
        title: overrides?.title ?? title,
        notes: overrides?.notes ?? notes,
        body: overrides?.body ?? body,
      })
      handleClose()
    } catch {
      /* parent surfaces the error toast — keep the modal open so input is preserved */
    } finally {
      setSubmitting(false)
    }
  }

  // Create a text message (or fall back to the edit callback in edit mode).
  const handleSubmitText = async (data: {
    title: string
    notes: string
    body: string
  }) => {
    if (initialMessage) {
      setBody(data.body)
      await handleEditSave({ title: data.title, notes: data.notes, body: data.body })
      return
    }

    const token = await getToken()
    if (!token) {
      showToast('Your session has expired. Please sign in again.', 'error')
      return
    }
    setSubmitting(true)
    try {
      await createTextMessage(token, {
        title: data.title,
        body: data.body,
        notes: data.notes || undefined,
        assignments: buildAssignments(audience, selectedIndividualIds),
      })
      showToast('Message saved', 'success')
      onCreated?.()
      handleClose()
    } catch (e) {
      showToast(errorMessage(e, 'Could not save your message.'), 'error')
    } finally {
      setSubmitting(false)
    }
  }

  if (!open) return null

  // Read-only view of an existing message — bypasses the create/record/write steps.
  if (readOnly && initialMessage) {
    return (
      <ReadOnlyMessage
        message={initialMessage}
        headerTitle={headerTitle}
        onClose={handleClose}
      />
    )
  }

  /* ---------------------- Step routing ---------------------- */
  let maxWidth = 672
  if (step === 'record') maxWidth = 896
  if (step === 'write') maxWidth = 775

  return (
    <div
      className="fixed inset-0 z-50 overflow-y-auto"
      style={{ background: 'rgba(0,0,0,0.4)' }}
      onMouseDown={(e) => {
        if (e.target === e.currentTarget) handleClose()
      }}
    >
      <div
        className="flex min-h-full items-center justify-center px-2 sm:px-4 py-4 sm:py-10"
        onMouseDown={(e) => {
          if (e.target === e.currentTarget) handleClose()
        }}
      >
        <div
          className="relative bg-white w-full"
          style={{
            maxWidth,
            borderRadius: 16,
            paddingBottom: 24,
            boxShadow: '0px 25px 50px -12px rgba(0,0,0,0.25)',
            fontFamily: 'Inter, sans-serif',
          }}
        >
          {/* Close */}
          <button
            type="button"
            onClick={handleClose}
            aria-label="Close"
            className="absolute cursor-pointer top-5 right-5 sm:top-6 sm:right-6 z-10"
            style={{ width: 22, height: 22, opacity: 0.7 }}
          >
            <X className="w-[22px] h-[22px] text-[#0A0A0A]" strokeWidth={2} />
          </button>

          {step === 'setup' && (
            <SetupStep
              headerTitle={headerTitle}
              headerSubtitle={headerSubtitle}
              audience={audience}
              setAudience={setAudience}
              selectedIndividualIds={selectedIndividualIds}
              setSelectedIndividualIds={setSelectedIndividualIds}
              messageType={messageType}
              setMessageType={setMessageType}
              title={title}
              setTitle={setTitle}
              notes={notes}
              setNotes={setNotes}
              recipients={recipients}
              isEditMode={!!initialMessage}
              saving={submitting}
              onOpenRecorder={handleOpenRecorder}
              onSaveEdits={() => handleEditSave()}
              onSkip={onSkip}
            />
          )}

          {step === 'record' && (
            <RecordStep
              kind={messageType === 'audio' ? 'audio' : 'video'}
              recipient={recipientLabel}
              title={title}
              notes={notes}
              assignments={buildAssignments(audience, selectedIndividualIds)}
              onBack={() => setStep('setup')}
              onDone={() => {
                onCreated?.()
                handleClose()
              }}
            />
          )}

          {step === 'write' && (
            <WriteMessageStep
              recipient={recipientLabel}
              initialTitle={title}
              initialNotes={notes}
              initialBody={body}
              saving={submitting}
              onCancel={handleClose}
              onSave={handleSubmitText}
            />
          )}
        </div>
      </div>
    </div>
  )
}

/* ===================== Read-only view ===================== */

function ReadOnlyMessage({
  message,
  headerTitle,
  onClose,
}: {
  message: EditableMessage
  headerTitle: string
  onClose: () => void
}) {
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

  const typeLabel =
    message.messageType === 'write'
      ? 'Written message'
      : message.messageType === 'video'
      ? 'Video message'
      : 'Audio message'

  const audience = message.audience.length > 0 ? message.audience : ['Assign later']

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
            maxWidth: 672,
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

          {/* Header */}
          <div className="px-6 py-6 pr-12 sm:pr-14" style={{ borderBottom: '0.8px solid #E5E7EB' }}>
            <h2 style={{ fontWeight: 700, fontSize: 23, lineHeight: '32px', color: '#101828' }}>
              {headerTitle}
            </h2>
            <p style={{ fontWeight: 400, fontSize: 12.9, lineHeight: '20px', color: '#4A5565' }}>
              {typeLabel}
            </p>
          </div>

          {/* Body */}
          <div className="px-6 pt-6 flex flex-col gap-5">
            <Detail label="Title">{message.title || '—'}</Detail>

            <div className="flex flex-col gap-2">
              <span style={{ fontWeight: 500, fontSize: 14, lineHeight: '20px', color: '#0A0A0A' }}>
                Recipients
              </span>
              <div className="flex flex-wrap gap-2">
                {audience.map((a) => (
                  <span
                    key={a}
                    style={{
                      height: 30,
                      borderRadius: 9999,
                      padding: '4px 14px',
                      background: '#EEF2FF',
                      color: '#4F46E5',
                      fontWeight: 500,
                      fontSize: 13,
                      lineHeight: '22px',
                    }}
                  >
                    {a}
                  </span>
                ))}
              </div>
            </div>

            {message.notes?.trim() && <Detail label="Notes">{message.notes}</Detail>}

            {message.messageType === 'write' ? (
              <div className="flex flex-col gap-2">
                <span style={{ fontWeight: 500, fontSize: 14, lineHeight: '20px', color: '#0A0A0A' }}>
                  Message
                </span>
                <div
                  className="[&_ul]:list-disc [&_ul]:pl-7 [&_ol]:list-decimal [&_ol]:pl-7 overflow-y-auto"
                  style={{
                    maxHeight: 320,
                    borderRadius: 10,
                    border: '1.25px solid #E5E7EB',
                    background: '#FFFFFF',
                    padding: 16,
                    fontFamily: 'Georgia, serif',
                    fontSize: 16,
                    lineHeight: '26px',
                    color: '#101828',
                  }}
                  dangerouslySetInnerHTML={{ __html: message.body || '<em>(empty)</em>' }}
                />
              </div>
            ) : (
              <p style={{ fontSize: 14, lineHeight: '22px', color: '#4A5565' }}>
                This is a {message.messageType} message. Play it from the Messages page.
              </p>
            )}
          </div>

          {/* Footer */}
          <div className="flex justify-end px-6 pt-6">
            <button
              type="button"
              onClick={onClose}
              className="flex items-center justify-center cursor-pointer hover:opacity-90"
              style={{
                height: 40,
                padding: '8px 20px',
                borderRadius: 8,
                background: '#4F46E5',
                fontWeight: 600,
                fontSize: 15,
                lineHeight: '24px',
                color: '#FFFFFF',
              }}
            >
              Close
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

function Detail({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="flex flex-col gap-1">
      <span style={{ fontWeight: 500, fontSize: 14, lineHeight: '20px', color: '#0A0A0A' }}>
        {label}
      </span>
      <span style={{ fontWeight: 400, fontSize: 14, lineHeight: '22px', color: '#4A5565' }}>
        {children}
      </span>
    </div>
  )
}

/* ===================== Setup Step ===================== */

function SetupStep({
  headerTitle,
  headerSubtitle,
  audience,
  setAudience,
  selectedIndividualIds,
  setSelectedIndividualIds,
  messageType,
  setMessageType,
  title,
  setTitle,
  notes,
  setNotes,
  recipients,
  isEditMode,
  saving,
  onOpenRecorder,
  onSaveEdits,
  onSkip,
}: {
  headerTitle: string
  headerSubtitle: string
  audience: string[]
  setAudience: (v: string[] | ((prev: string[]) => string[])) => void
  selectedIndividualIds: string[]
  setSelectedIndividualIds: (v: string[] | ((prev: string[]) => string[])) => void
  messageType: MessageType
  setMessageType: (v: MessageType) => void
  title: string
  setTitle: (v: string) => void
  notes: string
  setNotes: (v: string) => void
  recipients: Recipient[]
  isEditMode: boolean
  saving: boolean
  onOpenRecorder: () => void
  onSaveEdits: () => void
  onSkip?: () => void
}) {
  const [titleError, setTitleError] = useState<string | null>(null)

  const toggleAudience = (chip: string) =>
    setAudience((prev) => {
      // "Choose individuals" and "Assign later" are exclusive — picking one clears
      // every other chip, and picking any group clears them.
      if (EXCLUSIVE_CHIPS.includes(chip)) {
        return prev.includes(chip) ? prev.filter((c) => c !== chip) : [chip]
      }
      const withoutExclusive = prev.filter((c) => !EXCLUSIVE_CHIPS.includes(c))
      return withoutExclusive.includes(chip)
        ? withoutExclusive.filter((c) => c !== chip)
        : [...withoutExclusive, chip]
    })

  const validateTitle = () => {
    if (!title.trim()) {
      setTitleError('Title should not be empty')
      return false
    }
    setTitleError(null)
    return true
  }

  const handleCta = () => {
    if (!validateTitle()) return
    onOpenRecorder()
  }

  const handleSaveEdits = () => {
    if (!validateTitle()) return
    onSaveEdits()
  }

  return (
    <>
      {/* Header */}
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
          {headerTitle}
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
          {headerSubtitle}
        </p>
      </div>

      <div className="px-6 pt-6 flex flex-col gap-5">
        {/* Audience */}
        <div className="flex flex-col gap-4">
          <h3
            style={{
              fontFamily: '"Instrument Serif", serif',
              fontWeight: 400,
              fontSize: 25,
              lineHeight: '32px',
              color: '#101828',
            }}
          >
            Who are you leaving this message for?
            <span style={{ color: '#FF0000' }}> *</span>
          </h3>
          <div className="flex flex-wrap gap-3">
            {AUDIENCE_CHIPS.map((chip) => {
              const selected = audience.includes(chip)
              return (
                <button
                  key={chip}
                  type="button"
                  onClick={() => toggleAudience(chip)}
                  className="cursor-pointer transition-colors"
                  style={{
                    height: 36,
                    borderRadius: 9999,
                    padding: '8px 16px',
                    background: selected ? '#4F46E5' : '#F3F4F6',
                    color: selected ? '#FFFFFF' : '#364153',
                    fontFamily: 'Inter, sans-serif',
                    fontWeight: 500,
                    fontSize: 13.6,
                    lineHeight: '20px',
                  }}
                >
                  {chip}
                </button>
              )
            })}
          </div>

          {audience.includes('Choose individuals') && (
            <IndividualPicker
              recipients={recipients}
              selectedIds={selectedIndividualIds}
              onToggle={(id) =>
                setSelectedIndividualIds((prev) =>
                  prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id],
                )
              }
            />
          )}
        </div>

        {/* Video or audio? */}
        <div className="flex flex-col gap-3">
          <h4
            style={{
              fontFamily: 'Inter, sans-serif',
              fontWeight: 500,
              fontSize: 17.3,
              lineHeight: '27px',
              color: '#101828',
            }}
          >
            Video or audio?
          </h4>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <TypeCard
              icon={<PenLine className="w-[42px] h-[42px] text-[#4F46E5]" strokeWidth={1.75} />}
              title="Write Message"
              subtitle="Type a letter for someone"
              selected={messageType === 'write'}
              disabled={isEditMode}
              onClick={() => setMessageType('write')}
            />
            <TypeCard
              icon={<Camera className="w-[40px] h-[40px] text-[#4F46E5]" strokeWidth={1.75} />}
              title="Video message"
              subtitle="Record face-to-face · Up to 5 minutes"
              selected={messageType === 'video'}
              disabled={isEditMode}
              onClick={() => setMessageType('video')}
            />
            <TypeCard
              icon={<Radio className="w-[40px] h-[40px] text-[#99A1AF]" strokeWidth={1.75} />}
              title="Audio message"
              subtitle="Voice only · Up to 10 minutes"
              selected={messageType === 'audio'}
              disabled={isEditMode}
              onClick={() => setMessageType('audio')}
            />
          </div>
        </div>

        {/* Title */}
        <div className="flex flex-col gap-1">
          <label
            style={{
              fontFamily: 'Inter, sans-serif',
              fontWeight: 500,
              fontSize: 14,
              lineHeight: '20px',
              color: '#0A0A0A',
            }}
          >
            Give your message a title: <span style={{ color: '#FB2C36' }}>*</span>
          </label>
          <input
            type="text"
            value={title}
            onChange={(e) => {
              setTitle(e.target.value)
              if (titleError) setTitleError(null)
            }}
            placeholder="Write Your title here"
            className="w-full focus:outline-none"
            style={{
              minHeight: 67,
              borderRadius: 10,
              background: '#F3F3F5',
              padding: '0 15px',
              fontFamily: 'Inter, sans-serif',
              fontWeight: 400,
              fontSize: 13,
              lineHeight: '20px',
              color: '#0A0A0A',
              border: titleError ? '1px solid #FB2C36' : undefined,
            }}
          />
          {titleError && (
            <p
              style={{
                fontFamily: 'Inter, sans-serif',
                fontWeight: 400,
                fontSize: 13,
                lineHeight: '18px',
                color: '#FB2C36',
              }}
            >
              {titleError}
            </p>
          )}
        </div>

        {/* Notes (optional) */}
        <div className="flex flex-col gap-1">
          <label
            style={{
              fontFamily: 'Inter, sans-serif',
              fontWeight: 500,
              fontSize: 14,
              lineHeight: '20px',
              color: '#0A0A0A',
            }}
          >
            Notes <span style={{ color: '#717182', fontWeight: 400 }}>(optional)</span>
          </label>
          <textarea
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            placeholder="Add any additional information..."
            rows={3}
            className="w-full focus:outline-none resize-none"
            style={{
              minHeight: 78,
              borderRadius: 10,
              background: '#F3F3F5',
              padding: '12px 15px',
              fontFamily: 'Inter, sans-serif',
              fontWeight: 400,
              fontSize: 13,
              lineHeight: '20px',
              color: '#0A0A0A',
            }}
          />
        </div>

        {/* CTA */}
        <div className="flex flex-col sm:flex-row gap-3 mt-1">
          {onSkip && (
            <button
              type="button"
              onClick={onSkip}
              className="flex items-center justify-center cursor-pointer hover:bg-gray-50"
              style={{
                height: 48,
                borderRadius: 8,
                border: '1px solid rgba(0,0,0,0.1)',
                background: '#FFFFFF',
                padding: '12px 16px',
                fontFamily: 'Inter, sans-serif',
                fontWeight: 600,
                fontSize: 15.3,
                lineHeight: '24px',
                color: '#0A0A0A',
              }}
            >
              Skip
            </button>
          )}
          {isEditMode && messageType !== 'write' && (
            <button
              type="button"
              onClick={handleSaveEdits}
              disabled={saving}
              className="flex-1 flex items-center justify-center gap-2 cursor-pointer hover:bg-gray-50 disabled:opacity-70 disabled:cursor-not-allowed"
              style={{
                height: 48,
                borderRadius: 8,
                border: '1px solid rgba(0,0,0,0.1)',
                background: '#FFFFFF',
                fontFamily: 'Inter, sans-serif',
                fontWeight: 600,
                fontSize: 15.3,
                lineHeight: '24px',
                color: '#0A0A0A',
              }}
            >
              {saving && <Loader2 className="w-4 h-4 animate-spin" />}
              {saving ? 'Saving…' : 'Save changes'}
            </button>
          )}
          <button
            type="button"
            onClick={handleCta}
            className="flex-1 flex items-center justify-center cursor-pointer hover:opacity-90"
            style={{
              height: 48,
              borderRadius: 8,
              background: '#4F46E5',
              padding: '12px 16px',
              fontFamily: 'Inter, sans-serif',
              fontWeight: 600,
              fontSize: 15.3,
              lineHeight: '24px',
              color: '#FFFFFF',
            }}
          >
            {messageType === 'write'
              ? isEditMode
                ? 'Continue editing'
                : 'Start writing'
              : isEditMode
              ? 'Re-record'
              : 'Open recorder'}
          </button>
        </div>
      </div>
    </>
  )
}

function TypeCard({
  icon,
  title,
  subtitle,
  selected,
  disabled,
  onClick,
}: {
  icon: React.ReactNode
  title: string
  subtitle: string
  selected: boolean
  disabled?: boolean
  onClick: () => void
}) {
  // The message type can't be changed once a message is created, so disabled
  // (edit mode) cards are non-interactive. The selected card keeps its styling;
  // the others dim slightly to signal they're locked.
  return (
    <button
      type="button"
      onClick={disabled ? undefined : onClick}
      disabled={disabled}
      aria-disabled={disabled}
      className={`flex flex-col items-center justify-center text-center transition-colors ${
        disabled ? 'cursor-not-allowed' : 'cursor-pointer'
      }`}
      style={{
        minHeight: 159,
        borderRadius: 14,
        border: selected ? '1px solid #4F46E5' : '1px solid #E5E7EB',
        background: selected ? '#EEF2FF' : '#FFFFFF',
        padding: 20,
        gap: 10,
        opacity: disabled && !selected ? 0.55 : 1,
      }}
    >
      {icon}
      <span
        style={{
          fontFamily: 'Inter, sans-serif',
          fontWeight: 600,
          fontSize: 15,
          lineHeight: '24px',
          color: '#101828',
        }}
      >
        {title}
      </span>
      <span
        style={{
          fontFamily: 'Inter, sans-serif',
          fontWeight: 400,
          fontSize: 13.3,
          lineHeight: '20px',
          color: '#4A5565',
        }}
      >
        {subtitle}
      </span>
    </button>
  )
}

function IndividualPicker({
  recipients,
  selectedIds,
  onToggle,
}: {
  recipients: Recipient[]
  selectedIds: string[]
  onToggle: (id: string) => void
}) {
  const [search, setSearch] = useState('')

  const filtered = recipients.filter((p) =>
    p.name.toLowerCase().includes(search.trim().toLowerCase()),
  )

  return (
    <div className="flex flex-col gap-2">
      <div
        className="w-full flex items-center gap-2"
        style={{
          height: 36,
          borderRadius: 8,
          background: '#F3F3F5',
          padding: '4px 12px',
        }}
      >
        <Search className="w-4 h-4 text-[#717182] flex-shrink-0" strokeWidth={2} />
        <input
          type="text"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search by name..."
          className="flex-1 bg-transparent outline-none min-w-0"
          style={{
            fontFamily: 'Inter, sans-serif',
            fontWeight: 400,
            fontSize: 14,
            lineHeight: '20px',
            color: '#0A0A0A',
          }}
        />
      </div>

      <div
        className="flex flex-col gap-2 overflow-y-auto pr-1 [&::-webkit-scrollbar]:w-1 [&::-webkit-scrollbar-thumb]:bg-[#D1D5DC] [&::-webkit-scrollbar-thumb]:rounded-full [&::-webkit-scrollbar-track]:bg-transparent"
        style={{
          maxHeight: 180,
          borderRadius: 10,
          border: '1.1px solid rgba(0,0,0,0.1)',
          background: '#F9FAFB',
          padding: 8,
          scrollbarWidth: 'thin',
          scrollbarColor: '#D1D5DC transparent',
        }}
      >
        {filtered.length === 0 ? (
          <p
            className="text-center py-4"
            style={{
              fontFamily: 'Inter, sans-serif',
              fontSize: 13,
              color: '#717182',
            }}
          >
            {recipients.length === 0 ? 'No recipients yet.' : 'No matches.'}
          </p>
        ) : (
          filtered.map((p) => {
            const selected = selectedIds.includes(p.id)
            return (
              <button
                key={p.id}
                type="button"
                onClick={() => onToggle(p.id)}
                className="w-full flex items-center gap-2 cursor-pointer"
                style={{
                  borderRadius: 8,
                  background: selected ? '#E0E7FF' : '#FFFFFF',
                  border: selected ? '1px solid #4F46E5' : '1px solid transparent',
                  padding: 8,
                }}
              >
                <span
                  className="flex items-center justify-center flex-shrink-0"
                  style={{
                    width: 16,
                    height: 16,
                    borderRadius: 4,
                    background: selected ? '#4F46E5' : '#FFFFFF',
                    border: selected
                      ? '1.1px solid #4F46E5'
                      : '1.1px solid rgba(0,0,0,0.1)',
                    boxShadow: '0px 1px 2px 0px rgba(0,0,0,0.05)',
                  }}
                >
                  {selected && <Check className="w-3 h-3 text-white" strokeWidth={3} />}
                </span>
                <div className="flex flex-col items-start flex-1 min-w-0">
                  <span
                    className="truncate"
                    style={{
                      fontFamily: 'Inter, sans-serif',
                      fontWeight: 500,
                      fontSize: 14,
                      lineHeight: '20px',
                      color: '#0A0A0A',
                    }}
                  >
                    {p.name}
                  </span>
                  <span
                    style={{
                      fontFamily: 'Inter, sans-serif',
                      fontWeight: 400,
                      fontSize: 12,
                      lineHeight: '16px',
                      color: '#717182',
                    }}
                  >
                    {p.relationship}
                  </span>
                </div>
              </button>
            )
          })
        )}
      </div>
    </div>
  )
}

/* ===================== Record Step ===================== */

function pickRecorderMime(kind: 'video' | 'audio'): string | undefined {
  const candidates =
    kind === 'video'
      ? ['video/webm;codecs=vp9,opus', 'video/webm;codecs=vp8,opus', 'video/webm']
      : ['audio/webm;codecs=opus', 'audio/webm']
  if (typeof MediaRecorder === 'undefined') return undefined
  for (const c of candidates) {
    try {
      if (MediaRecorder.isTypeSupported(c)) return c
    } catch {
      /* ignore */
    }
  }
  return undefined
}

type RecordPhase = 'record' | 'recording' | 'preview' | 'uploading'

function RecordStep({
  kind,
  recipient,
  title,
  notes,
  assignments,
  onBack,
  onDone,
}: {
  kind: 'video' | 'audio'
  recipient: string
  title: string
  notes: string
  assignments: Assignment[]
  onBack: () => void
  onDone: () => void
}) {
  const { showToast } = useToast()

  const videoRef = useRef<HTMLVideoElement>(null)
  const streamRef = useRef<MediaStream | null>(null)
  const mediaRecorderRef = useRef<MediaRecorder | null>(null)
  const chunksRef = useRef<BlobPart[]>([])
  const timerRef = useRef<number | null>(null)
  const pollRef = useRef<number | null>(null)
  const blobRef = useRef<Blob | null>(null)
  const previewUrlRef = useRef<string | null>(null)

  const [phase, setPhase] = useState<RecordPhase>('record')
  const [elapsed, setElapsed] = useState(0)
  const [duration, setDuration] = useState(0)
  const [previewUrl, setPreviewUrl] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [uploadStatus, setUploadStatus] = useState('')

  // Audio uses WaveSurfer's Record plugin (Option A) for both visualization and
  // capture. This flag drives the recording waveform; the captured blob arrives
  // via its onRecordEnd. Video keeps the MediaRecorder path below.
  const [audioRecording, setAudioRecording] = useState(false)

  const maxSeconds = kind === 'video' ? 5 * 60 : 10 * 60

  // Start the camera preview as soon as the video recorder opens.
  useEffect(() => {
    if (kind === 'video') initStream()
    return () => cleanup()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const stopTracks = () => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((t) => t.stop())
      streamRef.current = null
    }
    if (videoRef.current) videoRef.current.srcObject = null
  }

  const cleanup = () => {
    if (timerRef.current) {
      window.clearInterval(timerRef.current)
      timerRef.current = null
    }
    if (pollRef.current) {
      window.clearInterval(pollRef.current)
      pollRef.current = null
    }
    if (mediaRecorderRef.current && mediaRecorderRef.current.state !== 'inactive') {
      try {
        mediaRecorderRef.current.stop()
      } catch {
        /* ignore */
      }
    }
    stopTracks()
    if (previewUrlRef.current) {
      URL.revokeObjectURL(previewUrlRef.current)
      previewUrlRef.current = null
    }
  }

  const initStream = async () => {
    setError(null)
    try {
      const stream = await navigator.mediaDevices.getUserMedia(
        kind === 'video' ? { video: { width: 1280, height: 720 }, audio: true } : { audio: true },
      )
      streamRef.current = stream
      if (kind === 'video' && videoRef.current) {
        videoRef.current.srcObject = stream
        videoRef.current.muted = true
        await videoRef.current.play().catch(() => {})
      }
    } catch {
      setError(
        kind === 'video'
          ? 'Camera access is required to record video. Please allow access in your browser settings.'
          : 'Microphone access is required to record audio. Please allow access in your browser settings.',
      )
    }
  }

  // Audio: WaveSurfer's Record plugin opens the mic and captures the blob (see
  // AudioRecordingWaveform). We just drive the phase + elapsed timer here; the
  // blob arrives via handleAudioRecordEnd.
  const startAudioRecording = () => {
    setError(null)
    blobRef.current = null
    setElapsed(0)
    setPhase('recording')
    setAudioRecording(true)
    timerRef.current = window.setInterval(() => {
      setElapsed((s) => {
        const next = s + 1
        if (next >= maxSeconds) stopRecording()
        return next
      })
    }, 1000)
  }

  const handleAudioRecordEnd = (blob: Blob) => {
    blobRef.current = blob
    setPhase('preview')
  }

  const startRecording = async () => {
    if (kind === 'audio') {
      startAudioRecording()
      return
    }
    setError(null)
    chunksRef.current = []
    try {
      if (!streamRef.current) {
        await initStream()
      }
      const stream = streamRef.current
      if (!stream) return // initStream surfaced an error

      const mimeType = pickRecorderMime(kind)
      const mr = new MediaRecorder(stream, mimeType ? { mimeType } : undefined)
      mediaRecorderRef.current = mr
      mr.ondataavailable = (e) => {
        if (e.data.size > 0) chunksRef.current.push(e.data)
      }
      mr.onstop = () => {
        const blob = new Blob(chunksRef.current, {
          type: kind === 'video' ? 'video/webm' : 'audio/webm',
        })
        blobRef.current = blob
        if (previewUrlRef.current) URL.revokeObjectURL(previewUrlRef.current)
        const url = URL.createObjectURL(blob)
        previewUrlRef.current = url
        setPreviewUrl(url)
        // Release the live camera/mic while previewing.
        stopTracks()
        setPhase('preview')
      }
      mr.start(1000)
      setPhase('recording')
      setElapsed(0)
      timerRef.current = window.setInterval(() => {
        setElapsed((s) => {
          const next = s + 1
          if (next >= maxSeconds) stopRecording()
          return next
        })
      }, 1000)
    } catch {
      setError(
        kind === 'video'
          ? 'Camera access is required to record video. Please allow access in your browser settings.'
          : 'Microphone access is required to record audio. Please allow access in your browser settings.',
      )
    }
  }

  const stopRecording = () => {
    setDuration(elapsed)
    if (timerRef.current) {
      window.clearInterval(timerRef.current)
      timerRef.current = null
    }
    if (kind === 'audio') {
      // Flip the flag — AudioRecordingWaveform stops the plugin and fires
      // record-end, which transitions us to preview via handleAudioRecordEnd.
      setAudioRecording(false)
      return
    }
    if (mediaRecorderRef.current && mediaRecorderRef.current.state !== 'inactive') {
      mediaRecorderRef.current.stop()
    }
  }

  const reRecord = () => {
    setAudioRecording(false)
    blobRef.current = null
    if (previewUrlRef.current) {
      URL.revokeObjectURL(previewUrlRef.current)
      previewUrlRef.current = null
    }
    setPreviewUrl(null)
    setElapsed(0)
    setDuration(0)
    setError(null)
    setPhase('record')
    if (kind === 'video') initStream()
  }

  const pollProcessing = (token: string, messageId: string) =>
    new Promise<void>((resolve, reject) => {
      pollRef.current = window.setInterval(async () => {
        try {
          const status = await getMessageStatus(token, messageId)
          if (status.processingStatus === 'ready') {
            if (pollRef.current) window.clearInterval(pollRef.current)
            pollRef.current = null
            resolve()
          } else if (status.processingStatus === 'failed') {
            if (pollRef.current) window.clearInterval(pollRef.current)
            pollRef.current = null
            reject(new Error('Processing failed'))
          }
        } catch {
          /* transient — keep polling */
        }
      }, 3000)
    })

  const handleSave = async () => {
    const blob = blobRef.current
    if (!blob) return

    // Offline guard — keep the recording and retry on reconnect.
    if (typeof navigator !== 'undefined' && navigator.onLine === false) {
      setError(
        'You appear to be offline. Your recording is saved locally and will upload when you reconnect.',
      )
      window.addEventListener('online', () => handleSave(), { once: true })
      return
    }

    setError(null)
    setPhase('uploading')

    const token = await getToken()
    if (!token) {
      setError('Your session has expired. Please sign in again.')
      setPhase('preview')
      return
    }

    try {
      if (kind === 'video') {
        setUploadStatus('Uploading…')
        const { messageId, uploadUrl } = await createVideoUploadUrl(token, {
          title,
          notes: notes || undefined,
          assignments,
        })
        const res = await fetch(uploadUrl, {
          method: 'PUT',
          body: blob,
          headers: { 'Content-Type': 'video/webm' },
        })
        if (!res.ok) throw new Error('Upload failed. Please try again.')
        setUploadStatus('Processing…')
        await pollProcessing(token, messageId)
      } else {
        setUploadStatus('Uploading…')
        const { messageId, signedUploadUrl } = await createAudioUploadUrl(token, {
          title,
          notes: notes || undefined,
          assignments,
          fileType: 'audio/webm',
        })
        const res = await fetch(signedUploadUrl, {
          method: 'PUT',
          body: blob,
          headers: { 'Content-Type': 'audio/webm' },
        })
        if (!res.ok) throw new Error('Upload failed. Please try again.')
        setUploadStatus('Processing…')
        await confirmAudioUpload(token, messageId, {
          durationSeconds: Math.round(duration),
          fileSizeBytes: blob.size,
        })
      }
      setUploadStatus('Ready!')
      showToast('Message saved', 'success')
      cleanup()
      onDone()
    } catch (e) {
      setError(errorMessage(e, 'Upload failed. Please try again.'))
      setPhase('preview')
    }
  }

  const recording = phase === 'recording'
  const uploading = phase === 'uploading'

  return (
    <>
      {/* Header */}
      <div
        className="px-6 py-6 pr-12 sm:pr-14 flex items-start"
        style={{ borderBottom: '0.8px solid #E5E7EB' }}
      >
        <div className="flex-1 min-w-0">
          <h2
            style={{
              fontFamily: 'Inter, sans-serif',
              fontWeight: 700,
              fontSize: 23,
              lineHeight: '32px',
              color: '#101828',
            }}
          >
            Recording for {recipient}
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
            Your message will be preserved forever
          </p>
        </div>
      </div>

      <div className="px-6 pt-6 flex flex-col gap-4">
        {kind === 'video' ? (
          <div
            className="w-full overflow-hidden relative"
            style={{
              borderRadius: 10,
              background: '#000000',
              aspectRatio: '16 / 9',
              maxHeight: 425,
            }}
          >
            {phase === 'preview' || phase === 'uploading' ? (
              <video
                src={previewUrl ?? undefined}
                controls
                className="w-full h-full object-contain bg-black"
              />
            ) : (
              <video
                ref={videoRef}
                playsInline
                className="w-full h-full object-cover"
              />
            )}
            {recording && (
              <div
                className="absolute top-3 left-3 flex items-center gap-2 px-2 py-1 rounded-full"
                style={{ background: 'rgba(0,0,0,0.55)' }}
              >
                <span className="w-2.5 h-2.5 rounded-full bg-red-500 animate-pulse" />
                <span className="text-white text-xs font-medium">
                  {formatTime(elapsed)} / {formatTime(maxSeconds)}
                </span>
              </div>
            )}
          </div>
        ) : (
          <div
            className="w-full flex flex-col items-center justify-center"
            style={{
              minHeight: 236,
              borderRadius: 10,
              background: 'linear-gradient(135deg, #615FFF 0%, #9810FA 100%)',
              padding: 48,
              gap: 16,
            }}
          >
            {phase === 'recording' ? (
              <>
                <AudioRecordingWaveform
                  isRecording={audioRecording}
                  height={80}
                  waveColor="rgba(255, 255, 255, 0.6)"
                  progressColor="rgba(255, 255, 255, 1)"
                  onRecordEnd={handleAudioRecordEnd}
                  onError={() =>
                    setError(
                      'Microphone access is required to record audio. Please allow access in your browser settings.',
                    )
                  }
                />
                <span
                  style={{
                    fontFamily: 'Inter, sans-serif',
                    fontWeight: 400,
                    fontSize: 17.2,
                    lineHeight: '28px',
                    color: '#FFFFFF',
                    textAlign: 'center',
                  }}
                >
                  {`Recording… ${formatTime(elapsed)}`}
                </span>
              </>
            ) : (phase === 'preview' || phase === 'uploading') && blobRef.current ? (
              <AudioPlaybackWaveform
                audioBlob={blobRef.current}
                height={80}
                waveColor="rgba(255, 255, 255, 0.3)"
                progressColor="rgba(255, 255, 255, 1)"
              />
            ) : (
              <>
                <Radio className="w-[96px] h-[96px] text-white" strokeWidth={1.5} />
                <span
                  style={{
                    fontFamily: 'Inter, sans-serif',
                    fontWeight: 400,
                    fontSize: 17.2,
                    lineHeight: '28px',
                    color: '#FFFFFF',
                    textAlign: 'center',
                  }}
                >
                  Ready to record
                </span>
              </>
            )}
          </div>
        )}

        {kind === 'video' && phase !== 'preview' && phase !== 'uploading' && (
          <p
            className="text-center"
            style={{
              fontFamily: 'Inter, sans-serif',
              fontSize: 14,
              lineHeight: '20px',
              color: '#0A0A0A',
            }}
          >
            Maximum recording time:{' '}
            <span style={{ fontWeight: 600, color: '#4F46E5' }}>5 minutes</span>
          </p>
        )}

        {/* Action buttons */}
        {phase === 'preview' || phase === 'uploading' ? (
          <div className="flex flex-col sm:flex-row gap-3">
            <button
              type="button"
              onClick={reRecord}
              disabled={uploading}
              className="flex-1 flex items-center justify-center cursor-pointer hover:bg-gray-50 disabled:opacity-60 disabled:cursor-not-allowed"
              style={{
                height: 48,
                borderRadius: 8,
                border: '1px solid rgba(0,0,0,0.1)',
                background: '#FFFFFF',
                fontFamily: 'Inter, sans-serif',
                fontWeight: 600,
                fontSize: 15.1,
                lineHeight: '24px',
                color: '#0A0A0A',
              }}
            >
              Re-record
            </button>
            <button
              type="button"
              onClick={handleSave}
              disabled={uploading}
              className="flex-1 flex items-center justify-center gap-2 cursor-pointer hover:opacity-90 disabled:opacity-80 disabled:cursor-not-allowed"
              style={{
                height: 48,
                borderRadius: 8,
                background: '#4F46E5',
                padding: '12px 16px',
                fontFamily: 'Inter, sans-serif',
                fontWeight: 600,
                fontSize: 15.1,
                lineHeight: '24px',
                color: '#FFFFFF',
              }}
            >
              {uploading && <Loader2 className="w-4 h-4 animate-spin" />}
              {uploading ? uploadStatus || 'Uploading…' : error ? 'Try Again' : 'Save'}
            </button>
          </div>
        ) : (
          <button
            type="button"
            onClick={recording ? stopRecording : startRecording}
            className="w-full flex items-center justify-center gap-3 cursor-pointer hover:opacity-90"
            style={{
              height: 48,
              borderRadius: 8,
              background: '#E7000B',
              padding: '12px 16px',
              fontFamily: 'Inter, sans-serif',
              fontWeight: 600,
              fontSize: 15.1,
              lineHeight: '24px',
              color: '#FFFFFF',
            }}
          >
            {recording ? (
              <span className="w-4 h-4 bg-white" style={{ borderRadius: 2 }} aria-hidden />
            ) : (
              <span className="w-4 h-4 rounded-full bg-white" aria-hidden />
            )}
            {recording ? 'Stop Recording' : 'Start Recording'}
          </button>
        )}

        {error && <p className="text-sm text-red-600 text-center">{error}</p>}

        {!uploading && (
          <button
            type="button"
            onClick={onBack}
            className="text-sm text-[#4F46E5] hover:underline cursor-pointer self-start"
          >
            ← Back
          </button>
        )}
      </div>
    </>
  )
}

/* ===================== Write Message Step ===================== */

function WriteMessageStep({
  recipient,
  initialTitle,
  initialNotes,
  initialBody,
  saving,
  onCancel,
  onSave,
}: {
  recipient: string
  initialTitle?: string
  initialNotes?: string
  initialBody?: string
  saving?: boolean
  onCancel: () => void
  onSave: (data: { title: string; notes: string; body: string }) => void
}) {
  const [messageTitle, setMessageTitle] = useState(initialTitle ?? '')
  const [messageNotes, setMessageNotes] = useState(initialNotes ?? '')
  const [bodyText, setBodyText] = useState(initialBody ?? '')
  const editorRef = useRef<HTMLDivElement>(null)

  // Seed the contenteditable with initial body once.
  useEffect(() => {
    // Use <div> blocks for new lines so indent/outdent act on a real block
    // rather than spawning a stray line.
    try {
      document.execCommand('defaultParagraphSeparator', false, 'div')
    } catch {
      /* not supported everywhere — harmless */
    }
    if (editorRef.current && initialBody && editorRef.current.innerHTML.length === 0) {
      editorRef.current.innerHTML = initialBody
      setBodyText(editorRef.current.innerText)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  // Track active formatting commands so we can highlight toolbar buttons.
  const [active, setActive] = useState<Record<string, boolean>>({})
  const refreshActive = () => {
    if (typeof document === 'undefined') return
    const isActive = (cmd: string) => {
      try {
        return document.queryCommandState(cmd)
      } catch {
        return false
      }
    }
    setActive({
      bold: isActive('bold'),
      italic: isActive('italic'),
      underline: isActive('underline'),
      strikeThrough: isActive('strikeThrough'),
      justifyLeft: isActive('justifyLeft'),
      justifyCenter: isActive('justifyCenter'),
      justifyRight: isActive('justifyRight'),
      insertUnorderedList: isActive('insertUnorderedList'),
      insertOrderedList: isActive('insertOrderedList'),
    })
  }

  const exec = (command: string, value?: string) => {
    if (typeof document === 'undefined') return
    editorRef.current?.focus()
    try {
      document.execCommand(command, false, value)
    } catch {
      /* unsupported in some browsers */
    }
    if (editorRef.current) {
      setBodyText(editorRef.current.innerText)
    }
    refreshActive()
  }

  // Resolve the block holding the caret: the nearest block-level ancestor inside
  // the editor, falling back to the direct child. Wraps a bare text line in a
  // <div> only when there's genuinely no block to act on.
  const getCaretBlock = (): HTMLElement | null => {
    const editor = editorRef.current
    if (!editor || typeof window === 'undefined') return null
    const sel = window.getSelection()
    if (!sel || sel.rangeCount === 0) return null
    const resolve = (start: Node | null): HTMLElement | null => {
      let el: HTMLElement | null =
        start && start.nodeType === Node.TEXT_NODE
          ? start.parentElement
          : (start as HTMLElement | null)
      let directChild: HTMLElement | null = null
      while (el && el !== editor) {
        if (el.parentElement === editor) directChild = el
        const display = window.getComputedStyle(el).display
        if (display === 'block' || display === 'list-item' || display === 'flex') {
          return el
        }
        el = el.parentElement
      }
      return directChild
    }
    let block = resolve(sel.getRangeAt(0).startContainer)
    if (!block) {
      // No block at all (bare text directly in the editor) — wrap it.
      try {
        document.execCommand('formatBlock', false, 'div')
      } catch {
        /* ignore */
      }
      const sel2 = window.getSelection()
      block = sel2 && sel2.rangeCount ? resolve(sel2.getRangeAt(0).startContainer) : null
    }
    return block
  }

  const INDENT_STEP = 40 // px

  const indentOf = (el: HTMLElement) => parseInt(el.style.marginLeft || '0', 10) || 0

  // Indent/outdent in place: nests within lists, otherwise shifts the block's
  // left margin so the line stays put instead of jumping to a new line.
  const adjustIndent = (direction: 1 | -1) => {
    if (typeof document === 'undefined') return
    const editor = editorRef.current
    editor?.focus()
    const inList = (() => {
      try {
        return (
          document.queryCommandState('insertUnorderedList') ||
          document.queryCommandState('insertOrderedList')
        )
      } catch {
        return false
      }
    })()
    if (inList) {
      try {
        document.execCommand(direction > 0 ? 'indent' : 'outdent')
      } catch {
        /* ignore */
      }
    } else {
      let block = getCaretBlock()
      if (block && editor) {
        // When reducing, target whichever ancestor (or self) actually carries the
        // indentation — the saved HTML may nest the margin on an outer block.
        if (direction < 0 && indentOf(block) === 0) {
          let anc: HTMLElement | null = block
          while (anc && anc !== editor && indentOf(anc) === 0) {
            anc = anc.parentElement
          }
          if (anc && anc !== editor && indentOf(anc) > 0) block = anc
        }
        const next = Math.max(0, indentOf(block) + direction * INDENT_STEP)
        block.style.marginLeft = next > 0 ? `${next}px` : ''
      }
    }
    if (editorRef.current) setBodyText(editorRef.current.innerText)
    refreshActive()
  }

  const handleInput = () => {
    if (editorRef.current) {
      setBodyText(editorRef.current.innerText)
    }
    refreshActive()
  }

  // Word counter
  const wordCount = bodyText
    .trim()
    .split(/\s+/)
    .filter((w) => w.length > 0).length

  // "Last saved" — derived from latest edit, formatted in user locale
  const [lastSaved, setLastSaved] = useState<string>('')
  useEffect(() => {
    if (bodyText.length === 0 && messageTitle.length === 0) return
    const t = window.setTimeout(() => {
      const now = new Date()
      setLastSaved(
        now.toLocaleString(undefined, {
          month: 'short',
          day: '2-digit',
          year: 'numeric',
          hour: 'numeric',
          minute: '2-digit',
        }),
      )
    }, 600)
    return () => window.clearTimeout(t)
  }, [bodyText, messageTitle, messageNotes])

  const [formError, setFormError] = useState<string | null>(null)

  const handleSaveClick = () => {
    if (saving) return
    const text = (editorRef.current?.innerText ?? bodyText).trim()
    const errors: string[] = []
    if (!messageTitle.trim()) errors.push('Title should not be empty')
    if (!text) errors.push('Body should not be empty')
    if (errors.length > 0) {
      setFormError(errors.join(', '))
      return
    }
    setFormError(null)
    onSave({
      title: messageTitle,
      notes: messageNotes,
      body: editorRef.current?.innerHTML ?? bodyText,
    })
  }

  return (
    <>
      {/* Header */}
      <div
        className="px-6 sm:px-8 pt-7 pb-5 pr-12 sm:pr-14"
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
          Write Message for {recipient}
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
          Your message will be preserved forever
        </p>
      </div>

      <div className="px-6 sm:px-8 pt-5 flex flex-col gap-4">
        {/* Title row */}
        <input
          type="text"
          value={messageTitle}
          onChange={(e) => setMessageTitle(e.target.value)}
          placeholder="Growing Up in Chicago"
          className="w-full focus:outline-none"
          style={{
            height: 36,
            borderRadius: 8,
            background: '#F3F3F5',
            padding: '4px 20px',
            fontFamily: 'Georgia, serif',
            fontWeight: 700,
            fontSize: 14,
            lineHeight: '20px',
            color: '#0A0A0A',
          }}
        />

        {/* Notes row — shown only when notes were added in setup */}
        {messageNotes.trim().length > 0 && (
          <textarea
            value={messageNotes}
            onChange={(e) => setMessageNotes(e.target.value)}
            placeholder="Add any additional information..."
            rows={2}
            className="w-full focus:outline-none resize-none"
            style={{
              minHeight: 36,
              borderRadius: 8,
              background: '#F3F3F5',
              padding: '8px 20px',
              fontFamily: 'Inter, sans-serif',
              fontWeight: 400,
              fontSize: 14,
              lineHeight: '20px',
              letterSpacing: '-0.15px',
              color: '#0A0A0A',
            }}
          />
        )}

        {/* Toolbar */}
        <div
          className="flex flex-wrap items-center gap-1 pb-2"
          style={{ borderBottom: '1.25px solid #E5E7EB' }}
        >
          <ToolbarBtn onClick={() => exec('bold')} active={active.bold} label="Bold">
            <Bold className="w-4 h-4 text-[#0A0A0A]" strokeWidth={2.25} />
          </ToolbarBtn>
          <ToolbarBtn onClick={() => exec('italic')} active={active.italic} label="Italic">
            <Italic className="w-4 h-4 text-[#0A0A0A]" strokeWidth={2.25} />
          </ToolbarBtn>
          <ToolbarBtn
            onClick={() => exec('underline')}
            active={active.underline}
            label="Underline"
          >
            <Underline className="w-4 h-4 text-[#0A0A0A]" strokeWidth={2.25} />
          </ToolbarBtn>
          <ToolbarBtn
            onClick={() => exec('strikeThrough')}
            active={active.strikeThrough}
            label="Strikethrough"
          >
            <Strikethrough className="w-4 h-4 text-[#0A0A0A]" strokeWidth={2.25} />
          </ToolbarBtn>

          <Divider />

          <ToolbarBtn
            onClick={() => exec('justifyLeft')}
            active={active.justifyLeft}
            label="Align left"
          >
            <AlignLeft className="w-4 h-4 text-[#0A0A0A]" strokeWidth={2.25} />
          </ToolbarBtn>
          <ToolbarBtn
            onClick={() => exec('justifyCenter')}
            active={active.justifyCenter}
            label="Align center"
          >
            <AlignCenter className="w-4 h-4 text-[#0A0A0A]" strokeWidth={2.25} />
          </ToolbarBtn>
          <ToolbarBtn
            onClick={() => exec('justifyRight')}
            active={active.justifyRight}
            label="Align right"
          >
            <AlignRight className="w-4 h-4 text-[#0A0A0A]" strokeWidth={2.25} />
          </ToolbarBtn>

          <Divider />

          <ToolbarBtn
            onClick={() => exec('insertUnorderedList')}
            active={active.insertUnorderedList}
            label="Bulleted list"
          >
            <List className="w-4 h-4 text-[#0A0A0A]" strokeWidth={2.25} />
          </ToolbarBtn>
          <ToolbarBtn
            onClick={() => exec('insertOrderedList')}
            active={active.insertOrderedList}
            label="Numbered list"
          >
            <ListOrdered className="w-4 h-4 text-[#0A0A0A]" strokeWidth={2.25} />
          </ToolbarBtn>

          <Divider />

          <ToolbarBtn onClick={() => adjustIndent(-1)} label="Decrease indent">
            <Outdent className="w-4 h-4 text-[#0A0A0A]" strokeWidth={2.25} />
          </ToolbarBtn>
          <ToolbarBtn onClick={() => adjustIndent(1)} label="Increase indent">
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
          className="w-full focus:outline-none overflow-y-auto [&_ul]:list-disc [&_ul]:pl-7 [&_ul]:my-2 [&_ol]:list-decimal [&_ol]:pl-7 [&_ol]:my-2 [&_li]:mb-1 [&_blockquote]:ml-10 [&::-webkit-scrollbar]:w-1 [&::-webkit-scrollbar-thumb]:bg-[#D1D5DC] [&::-webkit-scrollbar-thumb]:rounded-full [&::-webkit-scrollbar-track]:bg-transparent"
          data-placeholder="Growing up in Chicago during the 1960s and 70s was an experience that shaped everything I became…"
          style={{
            minHeight: 274,
            maxHeight: 360,
            borderRadius: 10,
            border: '1.25px solid #E5E7EB',
            background: '#FFFFFF',
            padding: '16px',
            fontFamily: 'Georgia, serif',
            fontWeight: 400,
            fontSize: 16,
            lineHeight: '26px',
            color: '#101828',
            boxShadow:
              '0px 1px 2px -1px rgba(0,0,0,0.1), 0px 1px 3px 0px rgba(0,0,0,0.1)',
            scrollbarWidth: 'thin',
            scrollbarColor: '#D1D5DC transparent',
          }}
        />

        {/* Word count / last saved */}
        <div className="flex items-center justify-between flex-wrap gap-2">
          <div className="flex items-center gap-2">
            <FileText className="w-4 h-4 text-[#6A7282]" strokeWidth={2} />
            <span
              style={{
                fontFamily: 'Inter, sans-serif',
                fontWeight: 400,
                fontSize: 14,
                lineHeight: '20px',
                letterSpacing: '-0.15px',
                color: '#6A7282',
              }}
            >
              {wordCount} words
            </span>
          </div>
          <div className="flex items-center gap-2">
            <Clock className="w-4 h-4 text-[#6A7282]" strokeWidth={2} />
            <span
              style={{
                fontFamily: 'Inter, sans-serif',
                fontWeight: 400,
                fontSize: 14,
                lineHeight: '20px',
                letterSpacing: '-0.15px',
                color: '#6A7282',
              }}
            >
              {lastSaved ? `Last saved: ${lastSaved}` : 'Not saved yet'}
            </span>
          </div>
        </div>

        {formError && (
          <p
            style={{
              fontFamily: 'Inter, sans-serif',
              fontWeight: 400,
              fontSize: 13,
              lineHeight: '18px',
              color: '#FB2C36',
            }}
          >
            {formError}
          </p>
        )}
      </div>

      {/* Footer */}
      <div
        className="flex flex-wrap items-center justify-end gap-3 mt-6"
        style={{
          background: '#F9FAFB',
          borderTop: '0.8px solid #E5E7EB',
          padding: '15px 40px',
          borderBottomLeftRadius: 16,
          borderBottomRightRadius: 16,
        }}
      >
        <button
          type="button"
          onClick={onCancel}
          className="cursor-pointer hover:bg-gray-50"
          style={{
            width: 77.6,
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
          onClick={handleSaveClick}
          disabled={saving}
          className="flex items-center justify-center gap-2 cursor-pointer hover:opacity-90 disabled:opacity-80 disabled:cursor-not-allowed"
          style={{
            height: 36,
            padding: '8px 16px',
            borderRadius: 8,
            background: '#4F46E5',
            fontFamily: 'Inter, sans-serif',
            fontWeight: 500,
            fontSize: 14,
            lineHeight: '20px',
            color: '#FFFFFF',
          }}
        >
          {saving && <Loader2 className="w-4 h-4 animate-spin" />}
          {saving ? 'Saving…' : 'Save and Continue'}
        </button>
      </div>
    </>
  )
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
      onMouseDown={(e) => {
        // Prevent losing selection in the editor when toolbar button is pressed.
        e.preventDefault()
      }}
      onClick={onClick}
      className="flex items-center justify-center cursor-pointer hover:bg-gray-100 transition-colors"
      style={{
        width: 32,
        height: 32,
        borderRadius: 4,
        background: active ? '#E5E7EB' : 'transparent',
      }}
    >
      {children}
    </button>
  )
}

function Divider() {
  return (
    <span
      aria-hidden
      style={{
        display: 'inline-block',
        width: 1,
        height: 24,
        margin: '0 4px',
        background: '#D1D5DC',
      }}
    />
  )
}

function ColorPicker({ onPick }: { onPick: (color: string) => void }) {
  const [open, setOpen] = useState(false)
  const ref = useRef<HTMLDivElement>(null)
  const colors = [
    '#101828',
    '#4F46E5',
    '#E11D48',
    '#16A34A',
    '#F59E0B',
    '#0EA5E9',
    '#9333EA',
    '#000000',
    '#6B7280',
  ]

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
          className="absolute z-20 mt-1 right-0 grid grid-cols-5 gap-1.5 p-2"
          style={{
            background: '#FFFFFF',
            borderRadius: 8,
            border: '1px solid rgba(0,0,0,0.1)',
            boxShadow: '0 4px 12px rgba(0,0,0,0.08)',
            width: 'max-content',
            maxWidth: 'min(220px, calc(100vw - 24px))',
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
              style={{
                width: 20,
                height: 20,
                borderRadius: 4,
                background: c,
                border: '1px solid rgba(0,0,0,0.08)',
              }}
            />
          ))}
        </div>
      )}
    </div>
  )
}

/* ===================== Utils ===================== */

function formatTime(seconds: number) {
  const m = Math.floor(seconds / 60).toString().padStart(2, '0')
  const s = (seconds % 60).toString().padStart(2, '0')
  return `${m}:${s}`
}
