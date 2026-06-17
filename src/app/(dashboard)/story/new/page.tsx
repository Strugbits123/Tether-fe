'use client'

import { useEffect, useRef, useState } from 'react'
import { useRouter } from 'next/navigation'
import {
  AlignCenter,
  AlignLeft,
  AlignRight,
  ArrowLeft,
  Bold,
  Check,
  Clock,
  FileText,
  Image as ImageIcon,
  Indent,
  Italic,
  Keyboard,
  List,
  ListOrdered,
  Mic,
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
import { useToast } from '@/lib/context/ToastContext'

/* ---------------------- Constants ---------------------- */

const THEMES = [
  'Childhood',
  'Family',
  'Career',
  'Love',
  'Hardship',
  'Adventure',
  'Faith',
  'Friendship',
  'Parenthood',
  'Legacy',
  'College',
  'Advice',
  'Funny Moments',
]

const SEED_BODY = `<p>Growing up in Chicago during the 1960s and 70s was an experience that shaped everything I became. The home I knew was a modest two-story house on Maple Street, filled with the sounds of my mother's cooking and my father's jazz records playing in the evening.</p><p>My parents were hardworking people who taught me the value of persistence and kindness. My father worked at the steel mill for thirty years, and my mother raised four children while working part-time as a seamstress. They showed me what dedication looked like, even when times were tough.</p><p>One memory that stands out happened when I was ten years old. Our neighborhood was changing, and there was tension in the air. But my parents taught us to see people for who they were, not what others said about them. That lesson of empathy and understanding became a cornerstone of how I live my life.</p><p>As a child, I loved playing baseball in the empty lot behind our house. Those summer evenings, when the sun stayed out late and we played until we could barely see the ball, were some of the happiest moments of my youth. That simple joy of being outside with friends taught me about teamwork and the beauty of simple pleasures.</p>`

type Step = 'form' | 'editor' | 'assign'
type CreateMethod = 'write' | 'record'

/* ---------------------- Page ---------------------- */

export default function NewChapterPage() {
  const router = useRouter()
  const { showToast } = useToast()

  const [step, setStep] = useState<Step>('form')

  // Form state
  const [name, setName] = useState('')
  const [period, setPeriod] = useState('')
  const [theme, setTheme] = useState<string | null>(null)
  const [method, setMethod] = useState<CreateMethod>('write')

  const goToStory = () => router.push('/story')

  return (
    <div
      className="w-full flex flex-col items-center justify-center"
      style={{ minHeight: 'calc(100vh - 112px)' }}
    >
      {step === 'form' && (
        <FormStep
          name={name}
          setName={setName}
          period={period}
          setPeriod={setPeriod}
          theme={theme}
          setTheme={setTheme}
          method={method}
          setMethod={setMethod}
          onBack={goToStory}
          onStart={() => setStep('editor')}
        />
      )}

      {step === 'editor' && (
        <EditorStep
          initialTitle={name || 'Growing Up in Chicago'}
          initialPeriod={period || '1965 – 1978'}
          onBack={goToStory}
          onOpenAssign={() => setStep('assign')}
          onDelete={() => {
            showToast('Chapter deleted', 'success')
            goToStory()
          }}
        />
      )}

      {step === 'assign' && (
        <AssignStep
          chapterTitle={name || 'Growing Up in Chicago'}
          onBack={goToStory}
          onCancel={() => setStep('editor')}
          onSave={() => {
            showToast('Assignments saved', 'success')
            setStep('editor')
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
  onBack: () => void
  onStart: () => void
}) {
  const canStart = name.trim().length > 0

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
      {/* Header */}
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

      {/* Fields */}
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
              const selected = theme === t
              return (
                <button
                  key={t}
                  type="button"
                  onClick={() => setTheme(selected ? null : t)}
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
                  {t}
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
          className="flex items-center justify-center cursor-pointer hover:opacity-90 disabled:cursor-not-allowed"
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
        style={{
          width: 47.99,
          height: 47.99,
          borderRadius: 9999,
          background: selected ? '#4F39F6' : '#F3F4F6',
        }}
      >
        {icon}
      </span>
      <span
        style={{
          fontFamily: 'Inter, sans-serif',
          fontWeight: 600,
          fontSize: 16,
          lineHeight: '24px',
          letterSpacing: '-0.31px',
          color: titleColor,
        }}
      >
        {title}
      </span>
      <span
        style={{
          fontFamily: 'Inter, sans-serif',
          fontWeight: 500,
          fontSize: 12,
          lineHeight: '16px',
          color: '#4A5565',
        }}
      >
        {subtitle}
      </span>
    </button>
  )
}

/* ====================== Step 2 — Editor ====================== */

function EditorStep({
  initialTitle,
  initialPeriod,
  onBack,
  onOpenAssign,
  onDelete,
}: {
  initialTitle: string
  initialPeriod: string
  onBack: () => void
  onOpenAssign: () => void
  onDelete: () => void
}) {
  const [title, setTitle] = useState(initialTitle)
  const [period, setPeriod] = useState(initialPeriod)
  const [menuOpen, setMenuOpen] = useState(false)
  const [exhibitsOpen, setExhibitsOpen] = useState(false)
  const [exhibits, setExhibits] = useState<ExhibitImage[]>([])
  const menuRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const handle = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) setMenuOpen(false)
    }
    if (menuOpen) document.addEventListener('mousedown', handle)
    return () => document.removeEventListener('mousedown', handle)
  }, [menuOpen])

  return (
    <div className="w-full max-w-[1024px] mx-auto flex flex-col" style={{ gap: 16 }}>
      {/* Top bar */}
      <div className="flex items-center justify-between gap-3 flex-wrap">
        <BackLink onClick={onBack} />

        <div className="flex items-center flex-wrap" style={{ gap: 10 }}>
          {/* Complete chip */}
          <span
            className="inline-flex items-center justify-center"
            style={{
              height: 32,
              borderRadius: 9999,
              padding: '0 16px',
              background: '#DCFCE7',
              fontFamily: 'Inter, sans-serif',
              fontWeight: 500,
              fontSize: 14,
              lineHeight: '20px',
              letterSpacing: '-0.15px',
              color: '#008236',
            }}
          >
            Complete
          </span>

          {/* Recipients */}
          <button
            type="button"
            onClick={onOpenAssign}
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
            8 recipients
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

          {/* Saved */}
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
            <Save style={{ width: 16, height: 16, flexShrink: 0 }} color="#FFFFFF" strokeWidth={2} />
            Saved
          </span>

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
                  boxShadow:
                    '0px 4px 6px -4px rgba(0,0,0,0.1), 0px 10px 15px -3px rgba(0,0,0,0.1)',
                }}
              >
                <button
                  type="button"
                  onClick={() => {
                    setMenuOpen(false)
                    onDelete()
                  }}
                  className="w-full flex items-center gap-3 cursor-pointer rounded-md hover:bg-[#FEF2F2] transition-colors"
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
        placeholder="1965 – 1978"
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

      {/* Rich text editor */}
      <RichTextEditor />

      {exhibitsOpen && (
        <ExhibitsModal
          title={title}
          exhibits={exhibits}
          setExhibits={setExhibits}
          onClose={() => setExhibitsOpen(false)}
        />
      )}
    </div>
  )
}

/* ---------------------- Rich text editor ---------------------- */

function RichTextEditor() {
  const editorRef = useRef<HTMLDivElement>(null)
  const [text, setText] = useState('')
  const [active, setActive] = useState<Record<string, boolean>>({})

  useEffect(() => {
    try {
      document.execCommand('defaultParagraphSeparator', false, 'div')
    } catch {
      /* harmless */
    }
    if (editorRef.current && editorRef.current.innerHTML.length === 0) {
      editorRef.current.innerHTML = SEED_BODY
      setText(editorRef.current.innerText)
    }
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

  const exec = (command: string, value?: string) => {
    if (typeof document === 'undefined') return
    editorRef.current?.focus()
    try {
      document.execCommand(command, false, value)
    } catch {
      /* unsupported */
    }
    if (editorRef.current) setText(editorRef.current.innerText)
    refreshActive()
  }

  const handleInput = () => {
    if (editorRef.current) setText(editorRef.current.innerText)
    refreshActive()
  }

  const wordCount = text
    .trim()
    .split(/\s+/)
    .filter((w) => w.length > 0).length

  return (
    <div className="flex flex-col" style={{ gap: 16 }}>
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
        onKeyUp={handleInput}
        onMouseUp={handleInput}
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
          <span style={metaStyle}>Last saved: Mar 28, 2026 at 3:42 PM</span>
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

interface ExhibitImage {
  id: string
  url: string
}

function ExhibitsModal({
  title,
  exhibits,
  setExhibits,
  onClose,
}: {
  title: string
  exhibits: ExhibitImage[]
  setExhibits: React.Dispatch<React.SetStateAction<ExhibitImage[]>>
  onClose: () => void
}) {
  const fileInputRef = useRef<HTMLInputElement>(null)
  const [dragging, setDragging] = useState(false)

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

  const addFiles = (files: FileList | null) => {
    if (!files || files.length === 0) return
    const next: ExhibitImage[] = Array.from(files)
      .filter((f) => f.type.startsWith('image/'))
      .map((f) => {
        const url = URL.createObjectURL(f)
        return { id: url, url }
      })
    if (next.length > 0) setExhibits((prev) => [...prev, ...next])
  }

  const removeExhibit = (id: string) => {
    setExhibits((prev) => prev.filter((e) => e.id !== id))
    URL.revokeObjectURL(id)
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
              <h2
                style={{
                  fontFamily: 'Inter, sans-serif',
                  fontWeight: 600,
                  fontSize: 23,
                  lineHeight: '28px',
                  color: '#0A0A0A',
                }}
              >
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
            accept="image/*"
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
            className="flex flex-col items-center justify-center text-center cursor-pointer transition-colors w-full"
            style={{
              minHeight: 200,
              borderRadius: 14,
              border: '2px dashed #D1D5DC',
              background: dragging ? '#F5F3FF' : 'transparent',
              padding: 24,
              gap: 8,
            }}
          >
            <Upload style={{ width: 40, height: 40 }} color="#99A1AF" strokeWidth={1.75} />
            <span
              style={{
                fontFamily: 'Inter, sans-serif',
                fontWeight: 400,
                fontSize: 16,
                lineHeight: '24px',
                color: '#4A5565',
              }}
            >
              Drop photos here or click to browse
            </span>
            <span
              style={{
                fontFamily: 'Inter, sans-serif',
                fontWeight: 400,
                fontSize: 14,
                lineHeight: '20px',
                color: '#6A7282',
              }}
            >
              Add photos, documents, or other visual memories
            </span>
          </button>

          {/* Uploaded previews — grid up to 3, horizontal slider beyond */}
          {exhibits.length > 0 && (
            <div
              className={
                isSlider
                  ? 'flex overflow-x-auto [&::-webkit-scrollbar]:h-1.5 [&::-webkit-scrollbar-thumb]:bg-[#D1D5DC] [&::-webkit-scrollbar-thumb]:rounded-full'
                  : 'grid grid-cols-1 sm:grid-cols-3'
              }
              style={{ gap: 14, scrollbarWidth: 'thin', scrollbarColor: '#D1D5DC transparent', paddingBottom: isSlider ? 6 : 0 }}
            >
              {exhibits.map((ex) => (
                <div
                  key={ex.id}
                  className="group relative overflow-hidden flex-shrink-0"
                  style={{
                    width: isSlider ? 224 : undefined,
                    height: 197,
                    borderRadius: 10,
                    background: '#F3F4F6',
                    boxShadow: '0px 1px 2px -1px rgba(0,0,0,0.1), 0px 1px 3px 0px rgba(0,0,0,0.1)',
                  }}
                >
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={ex.url} alt="Exhibit" className="w-full h-full object-cover" />
                  <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                    <button
                      type="button"
                      aria-label="Remove exhibit"
                      onClick={() => removeExhibit(ex.id)}
                      className="flex items-center justify-center cursor-pointer"
                      style={{ width: 36, height: 36, borderRadius: 100, background: 'rgba(255,255,255,0.3)' }}
                    >
                      <X style={{ width: 18, height: 18 }} color="#FFFFFF" strokeWidth={2.5} />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Footer */}
          <div
            className="flex items-center justify-between gap-4"
            style={{ paddingTop: 16, borderTop: '1px solid #E5E7EB' }}
          >
            <span
              style={{
                fontFamily: 'Inter, sans-serif',
                fontWeight: 400,
                fontSize: 14,
                lineHeight: '20px',
                color: '#4A5565',
              }}
            >
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

/* ====================== Step 3 — Assigning ====================== */

const ASSIGN_GROUPS = ['All Family', 'All Friends', 'All Others', 'Release Manager', 'All Recipients']

interface Person {
  id: string
  initials: string
  name: string
  relationship: string
  invitePending?: boolean
  on: boolean
}

const INITIAL_PEOPLE: Person[] = [
  { id: '1', initials: 'JC', name: 'Jennifer Chen', relationship: 'Daughter', on: true },
  { id: '2', initials: 'KH', name: 'Kevin Holder', relationship: 'Son', on: true },
  { id: '3', initials: 'EM', name: 'Emily Martinez', relationship: 'Executor', on: false },
  { id: '4', initials: 'SJ', name: 'Sarah Johnson', relationship: 'Sister', invitePending: true, on: false },
  { id: '5', initials: 'MH', name: 'Michael Holder', relationship: 'Brother', on: false },
]

function AssignStep({
  chapterTitle,
  onBack,
  onCancel,
  onSave,
}: {
  chapterTitle: string
  onBack: () => void
  onCancel: () => void
  onSave: () => void
}) {
  const [assignLater, setAssignLater] = useState(true)
  const [groups, setGroups] = useState<string[]>([])
  const [people, setPeople] = useState<Person[]>(INITIAL_PEOPLE)
  const [note, setNote] = useState('')

  const toggleGroup = (g: string) => {
    setAssignLater(false)
    setGroups((prev) => (prev.includes(g) ? prev.filter((x) => x !== g) : [...prev, g]))
  }

  const toggleAssignLater = () => {
    setAssignLater((prev) => {
      const next = !prev
      if (next) setGroups([])
      return next
    })
  }

  const togglePerson = (id: string) => {
    setAssignLater(false)
    setPeople((prev) => prev.map((p) => (p.id === id ? { ...p, on: !p.on } : p)))
  }

  const receiveCount = people.filter((p) => p.on).length

  return (
    <div className="w-full max-w-[864px] mx-auto flex flex-col" style={{ gap: 24 }}>
      <BackLink onClick={onBack} />

      {/* Heading */}
      <div className="flex flex-col" style={{ gap: 8 }}>
        <h1
          style={{
            fontFamily: '"Instrument Serif", serif',
            fontWeight: 400,
            fontSize: 38,
            lineHeight: '48px',
            color: '#101828',
          }}
        >
          Assigning — <span style={{ color: '#4F46E5' }}>{chapterTitle}</span>
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
          Choose who receives this chapter. Recipients will be able to read it after verification is complete.
        </p>
      </div>

      {/* Card */}
      <div
        className="flex flex-col"
        style={{
          borderRadius: 14,
          border: '1px solid rgba(0,0,0,0.1)',
          background: '#FFFFFF',
          padding: 24,
          gap: 24,
        }}
      >
        {/* Group checkboxes */}
        <div
          className="flex flex-wrap items-center"
          style={{ gap: 10, paddingBottom: 16, borderBottom: '1px solid #E5E7EB' }}
        >
          {/* Assign later (yellow) */}
          <button
            type="button"
            onClick={toggleAssignLater}
            className="flex items-center cursor-pointer"
            style={{
              height: 34,
              borderRadius: 8,
              border: '1px solid #FFD230',
              background: '#FEF3C6',
              padding: '0 12.5px',
              gap: 5,
            }}
          >
            <span
              className="flex items-center justify-center flex-shrink-0"
              style={{
                width: 13,
                height: 13,
                borderRadius: 4,
                background: assignLater ? '#7B3306' : 'transparent',
                border: assignLater ? '1px solid #7B3306' : '1px solid #7B3306',
              }}
            >
              {assignLater && <Check style={{ width: 9, height: 9 }} color="#F9FAFB" strokeWidth={3} />}
            </span>
            <span
              style={{
                fontFamily: 'Inter, sans-serif',
                fontWeight: 500,
                fontSize: 14,
                lineHeight: '20px',
                letterSpacing: '-0.15px',
                color: '#7B3306',
              }}
            >
              Assign later
            </span>
          </button>

          {/* Group options */}
          {ASSIGN_GROUPS.map((g) => {
            const checked = groups.includes(g)
            return (
              <button
                key={g}
                type="button"
                onClick={() => toggleGroup(g)}
                className="flex items-center cursor-pointer"
                style={{ gap: 5, padding: '0 2px' }}
              >
                <span
                  className="flex items-center justify-center flex-shrink-0"
                  style={{
                    width: 13,
                    height: 13,
                    borderRadius: 4,
                    background: checked ? '#4F46E5' : 'transparent',
                    border: checked ? '1px solid #4F46E5' : '1px solid #4A5565',
                  }}
                >
                  {checked && <Check style={{ width: 9, height: 9 }} color="#FFFFFF" strokeWidth={3} />}
                </span>
                <span
                  style={{
                    fontFamily: 'Inter, sans-serif',
                    fontWeight: 500,
                    fontSize: 14,
                    lineHeight: '20px',
                    letterSpacing: '-0.15px',
                    color: '#4A5565',
                  }}
                >
                  {g}
                </span>
              </button>
            )
          })}
        </div>

        {/* People toggles */}
        <div className="flex flex-col" style={{ gap: 12 }}>
          {people.map((p) => (
            <div
              key={p.id}
              className="flex items-center justify-between gap-3"
              style={{ borderRadius: 10, border: '1px solid #E5E7EB', padding: 17 }}
            >
              <div className="flex items-center min-w-0" style={{ gap: 12 }}>
                <span
                  className="flex items-center justify-center flex-shrink-0"
                  style={{
                    width: 40,
                    height: 40,
                    borderRadius: 9999,
                    background: '#E0E7FF',
                    fontFamily: 'Inter, sans-serif',
                    fontWeight: 500,
                    fontSize: 16,
                    lineHeight: '24px',
                    letterSpacing: '-0.31px',
                    color: '#4F46E5',
                  }}
                >
                  {p.initials}
                </span>
                <div className="flex flex-col min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span
                      style={{
                        fontFamily: 'Inter, sans-serif',
                        fontWeight: 500,
                        fontSize: 16,
                        lineHeight: '24px',
                        letterSpacing: '-0.31px',
                        color: '#101828',
                      }}
                    >
                      {p.name}
                    </span>
                    {p.invitePending && (
                      <span
                        className="inline-flex items-center"
                        style={{
                          borderRadius: 9999,
                          padding: '1px 8px',
                          background: '#FEF3C6',
                          fontFamily: 'Inter, sans-serif',
                          fontWeight: 500,
                          fontSize: 12,
                          lineHeight: '16px',
                          color: '#BB4D00',
                        }}
                      >
                        Invite pending
                      </span>
                    )}
                  </div>
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
                    {p.relationship}
                  </span>
                </div>
              </div>

              <Toggle on={p.on} onClick={() => togglePerson(p.id)} />
            </div>
          ))}
        </div>

        {/* Note */}
        <div className="flex flex-col" style={{ gap: 8, paddingTop: 16, borderTop: '1px solid #E5E7EB' }}>
          <label style={labelStyle}>
            Add a note for recipients <span style={optionalStyle}>(optional)</span>
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
          <span
            style={{
              fontFamily: 'Inter, sans-serif',
              fontWeight: 400,
              fontSize: 12,
              lineHeight: '16px',
              color: '#6A7282',
            }}
          >
            This message appears when recipients first access this chapter
          </span>
        </div>
      </div>

      {/* Receive count banner */}
      <div
        className="flex items-center"
        style={{
          borderRadius: 10,
          border: '1px solid #C6D2FF',
          background: '#EEF2FF',
          padding: '17px',
          gap: 8,
        }}
      >
        <Users style={{ width: 20, height: 20, flexShrink: 0 }} color="#4F46E5" strokeWidth={2} />
        <span
          style={{
            fontFamily: 'Inter, sans-serif',
            fontWeight: 500,
            fontSize: 16,
            lineHeight: '24px',
            letterSpacing: '-0.31px',
            color: '#4F46E5',
          }}
        >
          {receiveCount} {receiveCount === 1 ? 'person' : 'people'} will receive this chapter
        </span>
      </div>

      {/* Footer buttons */}
      <div className="flex items-center justify-end" style={{ gap: 12 }}>
        <button
          type="button"
          onClick={onCancel}
          className="flex items-center justify-center cursor-pointer hover:bg-gray-50"
          style={{
            height: 36,
            padding: '8px 16px',
            borderRadius: 8,
            border: '1px solid rgba(0,0,0,0.1)',
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
          onClick={onSave}
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
            letterSpacing: '-0.15px',
            textAlign: 'center',
            color: '#FFFFFF',
          }}
        >
          Save assignments
        </button>
      </div>
    </div>
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
      style={{
        width: 44,
        height: 24,
        borderRadius: 9999,
        background: on ? '#4F46E5' : '#E5E7EB',
      }}
    >
      <span
        className="absolute top-1/2 -translate-y-1/2 transition-all"
        style={{
          width: 20,
          height: 20,
          borderRadius: 9999,
          background: '#FFFFFF',
          left: on ? 22 : 2,
          boxShadow: '0px 1px 2px rgba(0,0,0,0.2)',
        }}
      />
    </button>
  )
}
