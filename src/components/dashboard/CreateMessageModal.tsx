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
  Outdent,
  Palette,
  PenLine,
  Radio,
  Search,
  Strikethrough,
  Underline,
  X,
} from 'lucide-react'

interface CreateMessageModalProps {
  open: boolean
  onClose: () => void
  headerTitle?: string
  headerSubtitle?: string
  /** Optional initial values for edit mode. */
  initialMessage?: EditableMessage
  onSave?: (message: EditableMessage) => void
}

export interface EditableMessage {
  id?: string
  audience: string[]
  selectedIndividualId?: string
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
]

interface Individual {
  id: string
  name: string
  relationship: string
}

const INDIVIDUALS: Individual[] = [
  { id: 'p1', name: 'Sarah Chen', relationship: 'Family' },
  { id: 'p2', name: 'Michael Chen', relationship: 'Family' },
  { id: 'p3', name: 'Emma Rodriguez', relationship: 'Family' },
  { id: 'p4', name: 'David Thompson', relationship: 'Friend' },
  { id: 'p5', name: 'Sophie Martin', relationship: 'Friend' },
  { id: 'p6', name: 'James Wilson', relationship: 'Colleague' },
]

const STORAGE_KEY = 'tether_recorded_messages'

interface StoredRecording {
  id: string
  kind: 'video' | 'audio'
  recipient: string
  title: string
  mimeType: string
  dataUrl: string
  createdAt: number
}

function readStored(): StoredRecording[] {
  if (typeof window === 'undefined') return []
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY)
    if (!raw) return []
    return JSON.parse(raw) as StoredRecording[]
  } catch {
    return []
  }
}
function writeStored(items: StoredRecording[]) {
  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(items))
  } catch {
    /* ignore quota errors */
  }
}

export default function CreateMessageModal({
  open,
  onClose,
  headerTitle = 'Create Your First Message',
  headerSubtitle = 'This is the heart of your Tether',
  initialMessage,
  onSave,
}: CreateMessageModalProps) {
  // step state
  const [step, setStep] = useState<Step>('setup')

  // setup state — multi-select audience
  const [audience, setAudience] = useState<string[]>(
    initialMessage?.audience ?? ['All recipients'],
  )
  const [selectedIndividualId, setSelectedIndividualId] = useState<string>(
    initialMessage?.selectedIndividualId ?? 'p1',
  )
  const [messageType, setMessageType] = useState<MessageType>(
    initialMessage?.messageType ?? 'video',
  )
  const [title, setTitle] = useState(initialMessage?.title ?? '')
  const [notes, setNotes] = useState(initialMessage?.notes ?? '')
  const [body, setBody] = useState(initialMessage?.body ?? '')

  // Resync if a different message is opened for editing
  useEffect(() => {
    if (!open) return
    setAudience(initialMessage?.audience ?? ['All recipients'])
    setSelectedIndividualId(initialMessage?.selectedIndividualId ?? 'p1')
    setMessageType(initialMessage?.messageType ?? 'video')
    setTitle(initialMessage?.title ?? '')
    setNotes(initialMessage?.notes ?? '')
    setBody(initialMessage?.body ?? '')
    setStep('setup')
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open, initialMessage?.id])

  const recipientLabel =
    audience.includes('Choose individuals')
      ? INDIVIDUALS.find((p) => p.id === selectedIndividualId)?.name ?? 'someone special'
      : audience[0] ?? 'someone special'

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

  if (!open) return null

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
              selectedIndividualId={selectedIndividualId}
              setSelectedIndividualId={setSelectedIndividualId}
              messageType={messageType}
              setMessageType={setMessageType}
              title={title}
              setTitle={setTitle}
              notes={notes}
              setNotes={setNotes}
              isEditMode={!!initialMessage}
              onOpenRecorder={() => {
                if (initialMessage && messageType === 'write') {
                  onSave?.({
                    id: initialMessage.id,
                    audience,
                    selectedIndividualId,
                    messageType,
                    title,
                    notes,
                    body,
                  })
                  handleClose()
                  return
                }
                handleOpenRecorder()
              }}
              onSaveEdits={() => {
                onSave?.({
                  id: initialMessage?.id,
                  audience,
                  selectedIndividualId,
                  messageType,
                  title,
                  notes,
                  body,
                })
                handleClose()
              }}
            />
          )}

          {step === 'record' && (
            <RecordStep
              kind={messageType === 'audio' ? 'audio' : 'video'}
              recipient={recipientLabel}
              title={title}
              onBack={() => setStep('setup')}
            />
          )}

          {step === 'write' && (
            <WriteMessageStep
              recipient={recipientLabel}
              initialTitle={title}
              initialNotes={notes}
              initialBody={body}
              onCancel={handleClose}
              onSave={(text) => {
                setBody(text)
                onSave?.({
                  id: initialMessage?.id,
                  audience,
                  selectedIndividualId,
                  messageType,
                  title,
                  notes,
                  body: text,
                })
                handleClose()
              }}
            />
          )}
        </div>
      </div>
    </div>
  )
}

/* ===================== Setup Step ===================== */

function SetupStep({
  headerTitle,
  headerSubtitle,
  audience,
  setAudience,
  selectedIndividualId,
  setSelectedIndividualId,
  messageType,
  setMessageType,
  title,
  setTitle,
  notes,
  setNotes,
  isEditMode,
  onOpenRecorder,
  onSaveEdits,
}: {
  headerTitle: string
  headerSubtitle: string
  audience: string[]
  setAudience: (v: string[] | ((prev: string[]) => string[])) => void
  selectedIndividualId: string
  setSelectedIndividualId: (v: string) => void
  messageType: MessageType
  setMessageType: (v: MessageType) => void
  title: string
  setTitle: (v: string) => void
  notes: string
  setNotes: (v: string) => void
  isEditMode: boolean
  onOpenRecorder: () => void
  onSaveEdits: () => void
}) {
  const toggleAudience = (chip: string) =>
    setAudience((prev) =>
      prev.includes(chip) ? prev.filter((c) => c !== chip) : [...prev, chip],
    )
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
              value={selectedIndividualId}
              onChange={setSelectedIndividualId}
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
              onClick={() => setMessageType('write')}
            />
            <TypeCard
              icon={<Camera className="w-[40px] h-[40px] text-[#4F46E5]" strokeWidth={1.75} />}
              title="Video message"
              subtitle="Record face-to-face · Up to 5 minutes"
              selected={messageType === 'video'}
              onClick={() => setMessageType('video')}
            />
            <TypeCard
              icon={<Radio className="w-[40px] h-[40px] text-[#99A1AF]" strokeWidth={1.75} />}
              title="Audio message"
              subtitle="Voice only · Up to 10 minutes"
              selected={messageType === 'audio'}
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
            onChange={(e) => setTitle(e.target.value)}
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
            }}
          />
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
          {isEditMode && messageType !== 'write' && (
            <button
              type="button"
              onClick={onSaveEdits}
              className="flex-1 flex items-center justify-center cursor-pointer hover:bg-gray-50"
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
              Save changes
            </button>
          )}
          <button
            type="button"
            onClick={onOpenRecorder}
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
  onClick,
}: {
  icon: React.ReactNode
  title: string
  subtitle: string
  selected: boolean
  onClick: () => void
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="flex flex-col items-center justify-center text-center cursor-pointer transition-colors"
      style={{
        minHeight: 159,
        borderRadius: 14,
        border: selected ? '1px solid #4F46E5' : '1px solid #E5E7EB',
        background: selected ? '#EEF2FF' : '#FFFFFF',
        padding: 20,
        gap: 10,
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
  value,
  onChange,
}: {
  value: string
  onChange: (id: string) => void
}) {
  const [search, setSearch] = useState('')

  const filtered = INDIVIDUALS.filter((p) =>
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
            No matches.
          </p>
        ) : (
          filtered.map((p) => {
            const selected = value === p.id
            return (
              <button
                key={p.id}
                type="button"
                onClick={() => onChange(p.id)}
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

function RecordStep({
  kind,
  recipient,
  title,
  onBack,
}: {
  kind: 'video' | 'audio'
  recipient: string
  title: string
  onBack: () => void
}) {
  const videoRef = useRef<HTMLVideoElement>(null)
  const streamRef = useRef<MediaStream | null>(null)
  const mediaRecorderRef = useRef<MediaRecorder | null>(null)
  const chunksRef = useRef<BlobPart[]>([])
  const timerRef = useRef<number | null>(null)

  const [recording, setRecording] = useState(false)
  const [elapsed, setElapsed] = useState(0)
  const [error, setError] = useState<string | null>(null)
  const [saved, setSaved] = useState<StoredRecording[]>([])

  const maxSeconds = kind === 'video' ? 5 * 60 : 10 * 60

  useEffect(() => {
    setSaved(readStored().filter((r) => r.kind === kind))
    return () => {
      stopStream()
      if (timerRef.current) window.clearInterval(timerRef.current)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const stopStream = () => {
    if (mediaRecorderRef.current && mediaRecorderRef.current.state !== 'inactive') {
      try { mediaRecorderRef.current.stop() } catch {}
    }
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((t) => t.stop())
      streamRef.current = null
    }
    if (videoRef.current) {
      videoRef.current.srcObject = null
    }
  }

  const startRecording = async () => {
    setError(null)
    chunksRef.current = []
    try {
      const stream = await navigator.mediaDevices.getUserMedia(
        kind === 'video' ? { video: true, audio: true } : { audio: true },
      )
      streamRef.current = stream

      if (kind === 'video' && videoRef.current) {
        videoRef.current.srcObject = stream
        videoRef.current.muted = true
        await videoRef.current.play().catch(() => {})
      }

      const mr = new MediaRecorder(stream)
      mediaRecorderRef.current = mr
      mr.ondataavailable = (e) => {
        if (e.data.size > 0) chunksRef.current.push(e.data)
      }
      mr.onstop = async () => {
        const blob = new Blob(chunksRef.current, {
          type: kind === 'video' ? 'video/webm' : 'audio/webm',
        })
        const dataUrl = await blobToDataUrl(blob)
        const entry: StoredRecording = {
          id: `${Date.now()}`,
          kind,
          recipient,
          title: title || 'Untitled',
          mimeType: blob.type,
          dataUrl,
          createdAt: Date.now(),
        }
        try {
          const next = [entry, ...readStored()]
          writeStored(next)
          setSaved(next.filter((r) => r.kind === kind))
        } catch (err) {
          setError('Recording too large to save to local storage.')
        }
        stopStream()
      }
      mr.start()
      setRecording(true)
      setElapsed(0)
      timerRef.current = window.setInterval(() => {
        setElapsed((s) => {
          if (s + 1 >= maxSeconds) {
            stopRecording()
          }
          return s + 1
        })
      }, 1000)
    } catch (e) {
      console.error(e)
      setError('Unable to access camera/microphone.')
    }
  }

  const stopRecording = () => {
    setRecording(false)
    if (timerRef.current) {
      window.clearInterval(timerRef.current)
      timerRef.current = null
    }
    if (mediaRecorderRef.current && mediaRecorderRef.current.state !== 'inactive') {
      mediaRecorderRef.current.stop()
    }
  }

  const removeSaved = (id: string) => {
    const next = readStored().filter((r) => r.id !== id)
    writeStored(next)
    setSaved(next.filter((r) => r.kind === kind))
  }

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
            <video
              ref={videoRef}
              playsInline
              className="w-full h-full object-cover"
            />
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
              {recording ? `Recording… ${formatTime(elapsed)}` : 'Ready to record'}
            </span>
          </div>
        )}

        {kind === 'video' && (
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
            <span style={{ fontWeight: 600, color: '#4F46E5' }}>
              {kind === 'video' ? '5 minutes' : '10 minutes'}
            </span>
          </p>
        )}

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
            <span
              className="w-4 h-4 bg-white"
              style={{ borderRadius: 2 }}
              aria-hidden
            />
          ) : (
            <span className="w-4 h-4 rounded-full bg-white" aria-hidden />
          )}
          {recording ? 'Stop Recording' : 'Start Recording'}
        </button>

        {error && (
          <p className="text-sm text-red-600 text-center">{error}</p>
        )}

        {/* Saved recordings */}
        {saved.length > 0 && (
          <div className="flex flex-col gap-2 mt-2">
            <p
              style={{
                fontFamily: 'Inter, sans-serif',
                fontWeight: 600,
                fontSize: 14,
                color: '#101828',
              }}
            >
              Saved {kind === 'video' ? 'videos' : 'recordings'}
            </p>
            <div className="flex flex-col gap-2">
              {saved.map((r) => (
                <div
                  key={r.id}
                  className="flex flex-col gap-2 p-3"
                  style={{
                    border: '1px solid rgba(0,0,0,0.08)',
                    borderRadius: 10,
                    background: '#F9FAFB',
                  }}
                >
                  <div className="flex items-center justify-between gap-3">
                    <span
                      className="truncate"
                      style={{
                        fontFamily: 'Inter, sans-serif',
                        fontWeight: 500,
                        fontSize: 14,
                        color: '#0A0A0A',
                      }}
                    >
                      {r.title} — {new Date(r.createdAt).toLocaleString()}
                    </span>
                    <button
                      type="button"
                      onClick={() => removeSaved(r.id)}
                      className="text-xs text-red-600 cursor-pointer hover:underline"
                    >
                      Remove
                    </button>
                  </div>
                  {r.kind === 'video' ? (
                    // eslint-disable-next-line jsx-a11y/media-has-caption
                    <video
                      src={r.dataUrl}
                      controls
                      className="w-full"
                      style={{ borderRadius: 8, background: '#000', maxHeight: 240 }}
                    />
                  ) : (
                    // eslint-disable-next-line jsx-a11y/media-has-caption
                    <audio src={r.dataUrl} controls className="w-full" />
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        <button
          type="button"
          onClick={onBack}
          className="text-sm text-[#4F46E5] hover:underline cursor-pointer self-start"
        >
          ← Back
        </button>
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
  onCancel,
  onSave,
}: {
  recipient: string
  initialTitle?: string
  initialNotes?: string
  initialBody?: string
  onCancel: () => void
  onSave: (body: string) => void
}) {
  const [messageTitle, setMessageTitle] = useState(initialTitle ?? '')
  const [messageNotes, setMessageNotes] = useState(initialNotes ?? '')
  const [bodyText, setBodyText] = useState(initialBody ?? '')
  const editorRef = useRef<HTMLDivElement>(null)

  // Seed the contenteditable with initial body once.
  useEffect(() => {
    if (editorRef.current && initialBody && editorRef.current.innerText.length === 0) {
      editorRef.current.innerText = initialBody
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

          <ToolbarBtn onClick={() => exec('outdent')} label="Decrease indent">
            <Outdent className="w-4 h-4 text-[#0A0A0A]" strokeWidth={2.25} />
          </ToolbarBtn>
          <ToolbarBtn onClick={() => exec('indent')} label="Increase indent">
            <Indent className="w-4 h-4 text-[#0A0A0A]" strokeWidth={2.25} />
          </ToolbarBtn>

          <Divider />

          <ColorPicker
            onPick={(color) => exec('foreColor', color)}
          />
        </div>

        {/* Editor */}
        <div
          ref={editorRef}
          contentEditable
          suppressContentEditableWarning
          onInput={handleInput}
          onKeyUp={refreshActive}
          onMouseUp={refreshActive}
          className="w-full focus:outline-none whitespace-pre-wrap overflow-y-auto [&::-webkit-scrollbar]:w-1 [&::-webkit-scrollbar-thumb]:bg-[#D1D5DC] [&::-webkit-scrollbar-thumb]:rounded-full [&::-webkit-scrollbar-track]:bg-transparent"
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
          onClick={() => onSave(bodyText)}
          className="cursor-pointer hover:opacity-90"
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
          Save and Continue
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

function blobToDataUrl(blob: Blob): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.onloadend = () => resolve(reader.result as string)
    reader.onerror = reject
    reader.readAsDataURL(blob)
  })
}
