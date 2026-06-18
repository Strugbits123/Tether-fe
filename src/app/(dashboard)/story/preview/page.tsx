'use client'

import { useRouter } from 'next/navigation'
import {  Printer, Volume2, X } from 'lucide-react'

/* ---------------------- Data ---------------------- */

interface PreviewChapter {
  number: number
  title: string
  period: string
  tags: string[]
  paragraphs: string[]
  listenLabel: string
}

const MEMOIR = {
  title: 'The Story of RJ Holder',
  subtitle: 'For my children and their children',
  chapters: [
    {
      number: 1,
      title: 'Growing Up in Chicago',
      period: '1965 – 1978',
      tags: ['being love', 'hardship', 'lifestyle'],
      listenLabel: 'listen to all',
      paragraphs: [
        "Growing up in Chicago during the 1960s and 70s was an experience that shaped everything I became. The home I knew was a modest two-story house on Maple Street, filled with the sounds of my mother's cooking and my father's jazz records playing in the evening.",
        'My parents were hardworking people who taught me the value of persistence and kindness. My father worked at the steel mill for thirty years, and my mother raised four children while working part-time as a seamstress. They showed me what dedication looked like, even when times were tough.',
        'One memory that stands out happened when I was ten years old. Our neighborhood was changing, and there was tension in the air. But my parents taught us to see people for who they were, not what others said about them. That lesson of empathy and understanding became a cornerstone of how I live my life.',
      ],
    },
    {
      number: 2,
      title: 'Meeting Your Mother',
      period: '1982',
      tags: ['being love', 'hardship', 'lifestyle'],
      listenLabel: 'listen',
      paragraphs: [
        'The first time I saw your mother was at a community dance in the summer of 1982. She was wearing a yellow dress, and when she laughed, the whole room seemed to light up. I knew in that moment that my life was about to change forever.',
        'We spent that entire evening talking, and by the time the dance ended, I had already decided I would marry her. She had this way of making you feel like you were the only person in the world who mattered. Even now, after all these years, she still has that gift.',
        "Our courtship wasn't always easy. We came from different backgrounds, and our families had their doubts. But we believed in each other, and that belief carried us through every challenge we faced.",
      ],
    },
  ] as PreviewChapter[],
}

/* ---------------------- Page ---------------------- */

export default function MemoirPreviewPage() {
  const router = useRouter()

  return (
    <div
      className="w-full overflow-hidden"
      style={{
        borderRadius: 14,
      
      }}
    >
      {/* Toolbar row */}
      <div
        className="flex items-center justify-between flex-wrap gap-3"
        style={{
          padding: '16px 23.98px',
          borderBottom: '1.25px solid #E5E7EB',
        }}
      >
        {/* Exit preview */}
        <button
          type="button"
          onClick={() => router.push('/story')}
          className="flex items-center cursor-pointer hover:opacity-80"
          style={{ gap: 8, background: 'transparent' }}
        >
          <X style={{ width: 16, height: 16, flexShrink: 0 }} color="#4A5565" strokeWidth={2} />
          <span
            style={{
              fontFamily: 'Inter, sans-serif',
              fontWeight: 500,
              fontSize: 14,
              lineHeight: '20px',
              letterSpacing: '-0.15px',
              color: '#4A5565',
              whiteSpace: 'nowrap',
            }}
          >
            Exit preview
          </span>
        </button>

        {/* Actions */}
        <div className="flex items-center" style={{ gap: 10 }}>
          {/* Download PDF */}
          <button
            type="button"
            onClick={() => window.print()}
            className="flex items-center justify-center cursor-pointer hover:opacity-90"
            style={{
              height: 32,
              width: 150,
              gap: 8,
              borderRadius: 8,
              border: '1.25px solid rgba(255,255,255,0.1)',
              background: '#4F46E5',
              flexShrink: 0,
            }}
          >
             <Printer style={{ width: 16, height: 16, flexShrink: 0 }} color="#FFFFFF" strokeWidth={2} />
            <span
              style={{
                fontFamily: 'Inter, sans-serif',
                fontWeight: 500,
                fontSize: 14,
                lineHeight: '20px',
                letterSpacing: '-0.15px',
                textAlign: 'center',
                color: '#FFFFFF',
                whiteSpace: 'nowrap',
              }}
            >
              Download PDF
            </span>
          </button>

          {/* Print */}
          <button
            type="button"
            onClick={() => window.print()}
            className="flex items-center justify-center cursor-pointer hover:bg-gray-50"
            style={{
              height: 32,
              width: 83.73,
              gap: 6,
              borderRadius: 8,
              border: '1.25px solid rgba(0,0,0,0.1)',
              background: '#FFFFFF',
              flexShrink: 0,
            }}
          >
            <Printer style={{ width: 16, height: 16, flexShrink: 0 }} color="#0A0A0A" strokeWidth={2} />
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
              Print
            </span>
          </button>
        </div>
      </div>

      {/* Document */}
      <div
        className="mx-auto w-full flex flex-col"
        style={{
          maxWidth: 799,
          padding: 'clamp(24px, 5vw, 47.99px) clamp(16px, 3vw, 23.98px) clamp(32px, 6vw, 48px)',
          gap: 35,
        }}
      >
        {/* Title block */}
        <div className="flex flex-col items-center" style={{ gap: 16 }}>
          <h1
            style={{
              fontFamily: '"Instrument Serif", serif',
              fontWeight: 400,
              fontSize: 'clamp(34px, 9vw, 48px)',
              lineHeight: 1,
              color: '#101828',
              textAlign: 'center',
            }}
          >
            {MEMOIR.title}
          </h1>
          <p
            style={{
              fontFamily: 'Inter, sans-serif',
              fontWeight: 400,
              fontStyle: 'italic',
              fontSize: 18,
              lineHeight: '28px',
              letterSpacing: '-0.44px',
              color: '#4A5565',
              textAlign: 'center',
            }}
          >
            {MEMOIR.subtitle}
          </p>
        </div>

        {/* Body */}
        <div className="flex flex-col" style={{ gap: 30 }}>
          {/* Contents */}
          <div
            className="flex flex-col"
            style={{
              gap: 23.98,
              paddingBottom: 23.98,
              borderBottom: '1.25px solid #E5E7EB',
            }}
          >
            <h2
              style={{
                fontFamily: 'Georgia, serif',
                fontWeight: 500,
                fontSize: 24,
                lineHeight: '32px',
                color: '#101828',
              }}
            >
              Contents
            </h2>
            <div className="flex flex-col" style={{ gap: 16 }}>
              {MEMOIR.chapters.map((c) => (
                <ContentsRow key={c.number} chapter={c} />
              ))}
            </div>
          </div>

          {/* Chapters */}
          {MEMOIR.chapters.map((c) => (
            <ChapterBlock key={c.number} chapter={c} />
          ))}

          {/* End */}
          <p
            style={{
              fontFamily: 'Inter, sans-serif',
              fontWeight: 400,
              fontStyle: 'italic',
              fontSize: 16,
              lineHeight: '24px',
              letterSpacing: '-0.31px',
              textAlign: 'center',
              color: '#6A7282',
            }}
          >
            End of story
          </p>
        </div>
      </div>
    </div>
  )
}

/* ---------------------- Contents row ---------------------- */

function ContentsRow({ chapter }: { chapter: PreviewChapter }) {
  return (
    <div className="flex items-baseline justify-between gap-3">
      <span style={{ minWidth: 0 }}>
        <span
          style={{
            fontFamily: 'Inter, sans-serif',
            fontWeight: 400,
            fontSize: 16,
            lineHeight: '24px',
            letterSpacing: '-0.31px',
            color: '#6A7282',
          }}
        >
          Chapter {chapter.number}:{' '}
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
          {chapter.title}
        </span>
      </span>
      <span
        style={{
          fontFamily: 'Inter, sans-serif',
          fontWeight: 400,
          fontSize: 14,
          lineHeight: '20px',
          letterSpacing: '-0.15px',
          color: '#99A1AF',
          whiteSpace: 'nowrap',
          flexShrink: 0,
        }}
      >
        {chapter.period}
      </span>
    </div>
  )
}

/* ---------------------- Chapter block ---------------------- */

function ChapterBlock({ chapter }: { chapter: PreviewChapter }) {
  return (
    <div className="flex flex-col" style={{ gap: 23.98 }}>
      {/* Heading area */}
      <div className="flex flex-col" style={{ gap: 12 }}>
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
          Chapter {chapter.number}
        </span>

        {/* Title + listen button */}
        <div className="flex items-start justify-between gap-3 flex-wrap">
          <h2
            style={{
              fontFamily: '"Instrument Serif", serif',
              fontWeight: 400,
              fontSize: 'clamp(32px, 8vw, 48px)',
              lineHeight: 1,
              color: '#101828',
              wordBreak: 'break-word',
            }}
          >
            {chapter.title}
          </h2>

          <button
            type="button"
            className="flex items-center justify-center cursor-pointer hover:opacity-90"
            style={{
              height: 32,
              padding: '6px 16px',
              gap: 8,
              borderRadius: 8,
              border: '1.25px solid rgba(255,255,255,0.1)',
              background: '#4F46E5',
              flexShrink: 0,
            }}
          >
            <Volume2 style={{ width: 16, height: 16, flexShrink: 0 }} color="#FFFFFF" strokeWidth={2} />
            <span
              style={{
                fontFamily: 'Inter, sans-serif',
                fontWeight: 500,
                fontSize: 14,
                lineHeight: '20px',
                letterSpacing: '-0.15px',
                textAlign: 'center',
                color: '#FFFFFF',
                whiteSpace: 'nowrap',
              }}
            >
              {chapter.listenLabel}
            </span>
          </button>
        </div>

        {/* Tags */}
        <div className="flex items-center flex-wrap" style={{ gap: 8 }}>
          {chapter.tags.map((tag) => (
            <span
              key={tag}
              className="inline-flex items-center justify-center"
              style={{
                height: 36,
                borderRadius: 9999,
                padding: '8px 12px',
                background: 'rgba(79,70,229,0.1)',
                fontFamily: 'Inter, sans-serif',
                fontWeight: 500,
                fontSize: 14,
                lineHeight: '20px',
                letterSpacing: '-0.15px',
                textAlign: 'center',
                color: '#4F46E5',
                whiteSpace: 'nowrap',
              }}
            >
              {tag}
            </span>
          ))}
        </div>

        {/* Period */}
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
          {chapter.period}
        </span>
      </div>

      {/* Paragraphs */}
      <div className="flex flex-col" style={{ gap: 23.98 }}>
        {chapter.paragraphs.map((p, i) => (
          <p
            key={i}
            style={{
              fontFamily: 'Georgia, serif',
              fontWeight: 400,
              fontSize: 16,
              lineHeight: '26px',
              color: '#101828',
            }}
          >
            {p}
          </p>
        ))}
      </div>
    </div>
  )
}
