'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { ArrowLeft, Download, GripVertical, Trash2 } from 'lucide-react'

/* ---------------------- Data ---------------------- */

interface SettingsChapter {
  number: number
  title: string
}

const INITIAL_CHAPTERS: SettingsChapter[] = [
  { number: 1, title: 'Growing Up in Chicago' },
  { number: 2, title: 'Meeting Your Mother' },
  { number: 3, title: 'Building Our Family Business' },
  { number: 4, title: 'Lessons from Hardship' },
]

/* ---------------------- Page ---------------------- */

export default function StorySettingsPage() {
  const router = useRouter()

  const [title, setTitle] = useState('The Memoir of RJ Holder')
  const [dedication, setDedication] = useState('')
  const [chapters, setChapters] = useState<SettingsChapter[]>(INITIAL_CHAPTERS)
  const [dragIndex, setDragIndex] = useState<number | null>(null)

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
          Back to My Story
        </span>
      </button>

      {/* Heading */}
      <div className="flex flex-col" style={{ gap: 7.99 }}>
        <h1
          style={{
            fontFamily: '"Instrument Serif", serif',
            fontWeight: 400,
            fontSize: 38,
            lineHeight: '48px',
            color: '#101828',
          }}
        >
          My Story Settings
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
          Customize how your memoir appears and behaves
        </p>
      </div>

      {/* Story Information */}
      <Card>
        <CardTitle>Story Information</CardTitle>
        <div className="flex flex-col" style={{ gap: 16 }}>
          <Field
            label="Story title"
            helper="This appears at the top of your memoir"
            value={title}
            onChange={setTitle}
          />
          <Field
            label="Dedication line"
            optional
            helper="Shown below the title before your chapters begin"
            placeholder="For my children and their children"
            value={dedication}
            onChange={setDedication}
          />
        </div>
      </Card>

      {/* Chapter Order */}
      <Card>
        <div className="flex flex-col" style={{ gap: 4 }}>
          <CardTitle>Chapter Order</CardTitle>
          <p
            style={{
              fontFamily: 'Inter, sans-serif',
              fontWeight: 400,
              fontSize: 14,
              lineHeight: '20px',
              letterSpacing: '-0.15px',
              color: '#4A5565',
            }}
          >
            Drag to reorder how chapters appear in your story
          </p>
        </div>

        <div className="flex flex-col" style={{ gap: 7.99 }}>
          {chapters.map((c, i) => (
            <div
              key={c.number}
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
              <GripVertical
                style={{ width: 20, height: 20, flexShrink: 0 }}
                color="#99A1AF"
                strokeWidth={2}
              />
              <span style={{ minWidth: 0 }}>
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
                  Chapter {i + 1}:{' '}
                </span>
                <span
                  style={{
                    fontFamily: 'Inter, sans-serif',
                    fontWeight: 400,
                    fontSize: 16,
                    lineHeight: '24px',
                    letterSpacing: '-0.31px',
                    color: '#101828',
                  }}
                >
                  {c.title}
                </span>
              </span>
            </div>
          ))}
        </div>
      </Card>

      {/* Download My Story */}
      <Card>
        <div className="flex flex-col" style={{ gap: 4 }}>
          <CardTitle>Download My Story</CardTitle>
          <p
            style={{
              fontFamily: 'Inter, sans-serif',
              fontWeight: 400,
              fontSize: 14,
              lineHeight: '20px',
              letterSpacing: '-0.15px',
              color: '#4A5565',
            }}
          >
            Download all completed chapters as a single file
          </p>
        </div>

        <div className="flex items-center flex-wrap" style={{ gap: 11.99 }}>
          <DownloadButton label="Download as PDF" />
          <DownloadButton label="Download as Text" />
        </div>
      </Card>

      {/* Delete + footer */}
      <div className="flex flex-col" style={{ gap: 35 }}>
        {/* Delete card */}
        <div
          className="flex flex-col"
          style={{
            borderRadius: 14,
            border: '1.25px solid #FFC9C9',
            background: '#FEF2F2',
            padding: 23.98,
            gap: 16,
          }}
        >
          <h3
            style={{
              fontFamily: 'Inter, sans-serif',
              fontWeight: 600,
              fontSize: 20,
              lineHeight: '30px',
              letterSpacing: '-0.45px',
              color: '#82181A',
            }}
          >
            Delete Story
          </h3>
          <p
            style={{
              fontFamily: 'Inter, sans-serif',
              fontWeight: 400,
              fontSize: 14,
              lineHeight: '20px',
              letterSpacing: '-0.15px',
              color: '#C10007',
            }}
          >
            Permanently delete your entire story and all chapters. This action cannot be undone.
          </p>
          <button
            type="button"
            className="flex items-center justify-center cursor-pointer hover:opacity-90"
            style={{
              height: 35.99,
              gap: 8,
              borderRadius: 8,
              border: '1.25px solid #FFA2A2',
              background: '#FFFFFF',
              width: '100%',
            }}
          >
            <Trash2 style={{ width: 16, height: 16, flexShrink: 0 }} color="#C10007" strokeWidth={2} />
            <span
              style={{
                fontFamily: 'Inter, sans-serif',
                fontWeight: 500,
                fontSize: 14,
                lineHeight: '20px',
                letterSpacing: '-0.15px',
                textAlign: 'center',
                color: '#C10007',
              }}
            >
              Delete My Story
            </span>
          </button>
        </div>

        {/* Footer actions */}
        <div
          className="flex items-center justify-end flex-wrap"
          style={{
            paddingTop: 32,
            gap: 11.99,
            borderTop: '1.25px solid #E5E7EB',
          }}
        >
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
            onClick={() => router.push('/story')}
            className="flex items-center justify-center cursor-pointer hover:opacity-90"
            style={{
              height: 35.99,
              padding: '8px 16px',
              gap: 8,
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
            Save changes
          </button>
        </div>
      </div>
    </div>
  )
}

/* ---------------------- Building blocks ---------------------- */

function Card({ children }: { children: React.ReactNode }) {
  return (
    <div
      className="flex flex-col"
      style={{
        borderRadius: 14,
        border: '1.25px solid rgba(0,0,0,0.1)',
        background: '#FFFFFF',
        padding: 23.98,
        gap: 25,
      }}
    >
      {children}
    </div>
  )
}

function CardTitle({ children }: { children: React.ReactNode }) {
  return (
    <h2
      style={{
        fontFamily: 'Inter, sans-serif',
        fontWeight: 600,
        fontSize: 20,
        lineHeight: '30px',
        letterSpacing: '-0.45px',
        color: '#101828',
      }}
    >
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
}: {
  label: string
  optional?: boolean
  helper: string
  placeholder?: string
  value: string
  onChange: (v: string) => void
}) {
  return (
    <div className="flex flex-col" style={{ gap: 8 }}>
      <label
        style={{
          fontFamily: 'Inter, sans-serif',
          fontWeight: 500,
          fontSize: 14,
          lineHeight: '20px',
          letterSpacing: '-0.15px',
          color: '#364153',
        }}
      >
        {label}
        {optional && <span style={{ color: '#99A1AF' }}> (optional)</span>}
      </label>
      <input
        type="text"
        value={value}
        placeholder={placeholder}
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
      <p
        style={{
          fontFamily: 'Inter, sans-serif',
          fontWeight: 400,
          fontSize: 12,
          lineHeight: '16px',
          color: '#6A7282',
        }}
      >
        {helper}
      </p>
    </div>
  )
}

function DownloadButton({ label }: { label: string }) {
  return (
    <button
      type="button"
      className="flex items-center justify-center cursor-pointer hover:bg-gray-50"
      style={{
        height: 36,
        padding: '0 12px',
        gap: 8,
        borderRadius: 8,
        border: '1.25px solid rgba(0,0,0,0.1)',
        background: '#FFFFFF',
        flexShrink: 0,
      }}
    >
      <Download style={{ width: 16, height: 16, flexShrink: 0 }} color="#0A0A0A" strokeWidth={2} />
      <span
        style={{
          fontFamily: 'Inter, sans-serif',
          fontWeight: 500,
          fontSize: 14,
          lineHeight: '20px',
          letterSpacing: '-0.15px',
          textAlign: 'center',
          color: '#0A0A0A',
          whiteSpace: 'nowrap',
        }}
      >
        {label}
      </span>
    </button>
  )
}
