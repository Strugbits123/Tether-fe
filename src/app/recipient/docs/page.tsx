'use client'

// Recipient portal — Docs & Files. Documents an owner left for this recipient,
// grouped by category and filterable. Static placeholder content for now;
// wires to real data once the recipient-facing endpoints exist.

import { useEffect, useMemo, useRef, useState } from 'react'
import {
  Calendar,
  ChevronDown,
  Download,
  Eye,
  FileText,
  MoreVertical,
  Trash2,
} from 'lucide-react'

type Category =
  | 'Legal'
  | 'Financial'
  | 'Insurance'
  | 'Medical'
  | 'Property'
  | 'Other'

type Document = {
  id: string
  category: Category
  title: string
  note?: string
}

const DOCUMENTS: Document[] = [
  {
    id: 'l1',
    category: 'Legal',
    title: 'Last Will and Testament - Final Version',
    note: 'This is the most current version as of 2025. The original is with my attorney.',
  },
  { id: 'l2', category: 'Legal', title: 'Living Trust Document' },
  { id: 'l3', category: 'Legal', title: 'Power of Attorney' },
  {
    id: 'f1',
    category: 'Financial',
    title: 'Bank Account Summary - Chase',
    note: 'Checking and savings account details.',
  },
  { id: 'f2', category: 'Financial', title: 'Investment Portfolio Statement' },
  {
    id: 'i1',
    category: 'Insurance',
    title: 'Life Insurance Policy - MetLife',
    note: 'Policy #847392. You are listed as the primary beneficiary.',
  },
  { id: 'i2', category: 'Insurance', title: 'Home Insurance Policy' },
  {
    id: 'm1',
    category: 'Medical',
    title: 'Medical Directive',
    note: 'Please honor these wishes.',
  },
  { id: 'p1', category: 'Property', title: 'Property Deed - 142 Oak Street' },
]

const CATEGORY_ORDER: Category[] = [
  'Legal',
  'Financial',
  'Insurance',
  'Medical',
  'Property',
  'Other',
]

type Filter = 'All' | Category

const FILTERS: Filter[] = ['All', ...CATEGORY_ORDER]

function DocumentRow({
  doc,
  openId,
  setOpenId,
  isFirst,
  isLast,
}: {
  doc: Document
  openId: string | null
  setOpenId: (id: string | null) => void
  isFirst: boolean
  isLast: boolean
}) {
  const isOpen = openId === doc.id

  return (
    <div
      className="relative flex items-center hover:bg-[#F9FAFB] transition-colors"
      style={{
        gap: 16,
        padding: '16px 24px',
        // Lift the active row (and its menu) above sibling rows/sections.
        zIndex: isOpen ? 30 : undefined,
        borderTopLeftRadius: isFirst ? 14 : 0,
        borderTopRightRadius: isFirst ? 14 : 0,
        borderBottomLeftRadius: isLast ? 14 : 0,
        borderBottomRightRadius: isLast ? 14 : 0,
      }}
    >
      <FileText
        className="flex-shrink-0"
        style={{ width: 20, height: 20, color: '#EF4444' }}
        strokeWidth={2}
      />

      <div className="flex-1 min-w-0 flex flex-col" style={{ gap: 2 }}>
        <span
          style={{
            fontFamily: 'Inter, sans-serif',
            fontWeight: 500,
            fontSize: 14,
            lineHeight: '21px',
            letterSpacing: '-0.15px',
            color: '#111827',
          }}
        >
          {doc.title}
        </span>
        {doc.note && (
          <span
            style={{
              fontFamily: '"Instrument Serif", serif',
              fontWeight: 400,
              fontStyle: 'italic',
              fontSize: 13,
              lineHeight: '19.5px',
              color: '#6B7280',
            }}
          >
            {doc.note}
          </span>
        )}
      </div>

      <button
        type="button"
        onClick={(e) => {
          e.stopPropagation()
          setOpenId(isOpen ? null : doc.id)
        }}
        aria-label="Document actions"
        className="flex-shrink-0 flex items-center justify-center rounded-md hover:bg-black/5 transition-colors cursor-pointer"
        style={{ width: 28, height: 28 }}
      >
        <MoreVertical
          style={{ width: 20, height: 20, color: '#6B7280' }}
          strokeWidth={2}
        />
      </button>

      {/* Actions menu */}
      {isOpen && (
        <div
          className="absolute z-20 overflow-hidden"
          style={{
            top: 'calc(100% - 8px)',
            right: 24,
            width: 155,
            padding: '4px 1.25px 1.25px',
            borderRadius: 10,
            border: '1.25px solid #E5E7EB',
            background: '#FFFFFF',
            boxShadow:
              '0px 10px 15px -3px rgba(0,0,0,0.1), 0px 4px 6px -4px rgba(0,0,0,0.1)',
          }}
        >
          <button
            type="button"
            className="w-full flex items-center gap-2 px-3 hover:bg-gray-50 transition-colors cursor-pointer"
            style={{ height: 36 }}
          >
            <Eye style={{ width: 16, height: 16, color: '#364153' }} strokeWidth={2} />
            <span
              style={{
                fontFamily: 'Inter, sans-serif',
                fontWeight: 500,
                fontSize: 14,
                lineHeight: '20px',
                letterSpacing: '-0.15px',
                color: '#364153',
              }}
            >
              View
            </span>
          </button>
          <button
            type="button"
            className="w-full flex items-center gap-2 px-3 hover:bg-gray-50 transition-colors cursor-pointer"
            style={{ height: 36 }}
          >
            <Download style={{ width: 16, height: 16, color: '#364153' }} strokeWidth={2} />
            <span
              style={{
                fontFamily: 'Inter, sans-serif',
                fontWeight: 500,
                fontSize: 14,
                lineHeight: '20px',
                letterSpacing: '-0.15px',
                color: '#364153',
              }}
            >
              Download
            </span>
          </button>
          <button
            type="button"
            className="w-full flex items-center gap-2 px-3 hover:bg-red-50 transition-colors cursor-pointer"
            style={{ height: 36 }}
          >
            <Trash2 style={{ width: 16, height: 16, color: '#E7000B' }} strokeWidth={2} />
            <span
              style={{
                fontFamily: 'Inter, sans-serif',
                fontWeight: 500,
                fontSize: 14,
                lineHeight: '20px',
                letterSpacing: '-0.15px',
                color: '#E7000B',
              }}
            >
              Delete
            </span>
          </button>
        </div>
      )}
    </div>
  )
}

export default function RecipientDocsPage() {
  const [active, setActive] = useState<Filter>('All')
  const [openId, setOpenId] = useState<string | null>(null)
  const containerRef = useRef<HTMLDivElement>(null)

  // Close any open actions menu on outside click.
  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (
        containerRef.current &&
        !(e.target as HTMLElement).closest('[data-doc-row]')
      ) {
        setOpenId(null)
      }
    }
    if (openId) document.addEventListener('mousedown', handleClick)
    return () => document.removeEventListener('mousedown', handleClick)
  }, [openId])

  const sections = useMemo(() => {
    const cats =
      active === 'All' ? CATEGORY_ORDER : [active as Category]
    return cats
      .map((cat) => ({
        category: cat,
        docs: DOCUMENTS.filter((d) => d.category === cat),
      }))
      .filter((s) => s.docs.length > 0)
  }, [active])

  return (
    <div
      ref={containerRef}
      className="w-full max-w-[900px] mx-auto flex flex-col"
      style={{ padding: 32, gap: 32 }}
    >
      {/* Header + filters */}
      <div className="flex flex-col" style={{ gap: 15 }}>
        <div className="flex items-start justify-between gap-4">
          <div className="flex flex-col" style={{ gap: 8 }}>
            <h1
              style={{
                fontFamily: '"Instrument Serif", serif',
                fontWeight: 400,
                fontSize: 36,
                lineHeight: '54px',
                color: '#111827',
              }}
            >
              Documents
            </h1>
            <p
              style={{
                fontFamily: 'Inter, sans-serif',
                fontWeight: 400,
                fontSize: 15,
                lineHeight: '22.5px',
                letterSpacing: '-0.23px',
                color: '#6B7280',
              }}
            >
              {DOCUMENTS.length} documents left for you
            </p>
          </div>

          {/* Date range selector */}
          <button
            type="button"
            className="flex items-center flex-shrink-0 cursor-pointer hover:bg-gray-50 transition-colors"
            style={{
              gap: 8,
              height: 32,
              padding: '0 10px',
              borderRadius: 8,
              border: '1.25px solid rgba(0,0,0,0.1)',
              background: '#FFFFFF',
            }}
          >
            <Calendar style={{ width: 16, height: 16, color: '#0A0A0A' }} strokeWidth={2} />
            <span
              style={{
                fontFamily: 'Inter, sans-serif',
                fontWeight: 500,
                fontSize: 14,
                lineHeight: '20px',
                letterSpacing: '-0.15px',
                color: '#0A0A0A',
              }}
            >
              Last 30 days
            </span>
            <ChevronDown style={{ width: 16, height: 16, color: '#0A0A0A' }} strokeWidth={2} />
          </button>
        </div>

        {/* Category filters */}
        <div className="flex items-center flex-wrap" style={{ gap: 12 }}>
          <span
            className="flex-shrink-0"
            style={{
              fontFamily: 'Inter, sans-serif',
              fontWeight: 500,
              fontSize: 14,
              lineHeight: '20px',
              letterSpacing: '-0.15px',
              color: '#364153',
            }}
          >
            Filter by category:
          </span>

          <div className="flex items-center flex-wrap" style={{ gap: 10 }}>
            {FILTERS.map((f) => {
              const selected = active === f
              return (
                <button
                  key={f}
                  type="button"
                  onClick={() => setActive(f)}
                  className="flex items-center justify-center cursor-pointer transition-colors"
                  style={{
                    height: 36,
                    padding: '8px 16px',
                    borderRadius: 10,
                    background: selected ? '#101828' : '#F3F3F3',
                    border: selected ? '1px solid #101828' : '1px solid #E9E9E9',
                    fontFamily: 'Inter, sans-serif',
                    fontWeight: 500,
                    fontSize: 14,
                    lineHeight: '20px',
                    letterSpacing: '-0.15px',
                    color: selected ? '#FFFFFF' : '#101828',
                  }}
                >
                  {f}
                </button>
              )
            })}
          </div>
        </div>
      </div>

      {/* Sections */}
      <div className="flex flex-col" style={{ gap: 32 }}>
        {sections.map((section) => (
          <div key={section.category} className="flex flex-col" style={{ gap: 12 }}>
            <div className="flex items-center justify-between">
              <span
                style={{
                  fontFamily: 'Inter, sans-serif',
                  fontWeight: 600,
                  fontSize: 13,
                  lineHeight: '19.5px',
                  letterSpacing: '0.57px',
                  textTransform: 'uppercase',
                  color: '#6B7280',
                }}
              >
                {section.category}
              </span>
              <button
                type="button"
                className="cursor-pointer hover:opacity-80"
                style={{
                  fontFamily: 'Inter, sans-serif',
                  fontWeight: 500,
                  fontSize: 13,
                  lineHeight: '19.5px',
                  letterSpacing: '-0.08px',
                  color: '#4F46E5',
                }}
              >
                Download all
              </button>
            </div>

            <div
              style={{
                borderRadius: 14,
                border: '1.25px solid #E5E7EB',
                background: '#FFFFFF',
              }}
            >
              {section.docs.map((doc, idx) => (
                <div key={doc.id} data-doc-row>
                  <DocumentRow
                    doc={doc}
                    openId={openId}
                    setOpenId={setOpenId}
                    isFirst={idx === 0}
                    isLast={idx === section.docs.length - 1}
                  />
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
