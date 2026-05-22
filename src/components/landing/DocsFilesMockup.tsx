"use client"

import React, { useEffect, useState } from 'react'

/* ─── Categories slide data ─── */
const CATEGORIES = [
  { name: 'Legal',     percent: 90, color: '#10B981' },
  { name: 'Financial', percent: 75, color: '#4F46E5' },
  { name: 'Insurance', percent: 60, color: '#4F46E5' },
  { name: 'Property',  percent: 40, color: '#F59E0B' },
  { name: 'Digital',   percent: 20, color: '#EF4444' },
  { name: 'Other',     percent: 55, color: '#9333EA' },
]

/* ─── Document list slide data ─── */
const DOCUMENTS = [
  {
    emoji: '📄',
    name: 'Last Will & Testament',
    sub: 'Legal · Updated Jan 2024',
    tag: 'Legal',
    tagColor: '#3B82F6',
    tagBg: '#EFF6FF',
    iconBg: 'rgba(59, 130, 246, 0.12)',
  },
  {
    emoji: '🏦',
    name: 'Investment Account Summary',
    sub: 'Financial · Fidelity',
    tag: 'Financial',
    tagColor: '#059669',
    tagBg: '#D1FAE5',
    iconBg: 'rgba(29, 158, 117, 0.12)',
  },
  {
    emoji: '🛡️',
    name: 'Life Insurance Policy',
    sub: 'Insurance · $500,000',
    tag: 'Insurance',
    tagColor: '#D97706',
    tagBg: '#FEF3C7',
    iconBg: 'rgba(201, 168, 76, 0.12)',
  },
  {
    emoji: '📝',
    name: 'Personal Letter',
    sub: 'Other · Final wishes',
    tag: 'Other',
    tagColor: '#9333EA',
    tagBg: '#F3E8FF',
    iconBg: 'rgba(147, 51, 234, 0.12)',
  },
]

export default function DocsFilesMockup() {
  /* 0 = categories card, 1 = document list card.  Default = 1 (list visible first) */
  const [slide, setSlide] = useState(1)

  useEffect(() => {
    const id = setInterval(() => {
      setSlide(prev => (prev === 0 ? 1 : 0))
    }, 4500)
    return () => clearInterval(id)
  }, [])

  return (
    <div className="w-full max-w-[508px] mx-auto">
      <div className="relative">

        {/* ═══════════════ CARD 0 — CATEGORIES ═══════════════ */}
        <div
          className="bg-white border border-[#E5E7EB] rounded-[24px] shadow-xl overflow-hidden transition-opacity duration-700"
          style={{
            opacity: slide === 0 ? 1 : 0,
            position: slide === 0 ? 'relative' : 'absolute',
            top: 0,
            left: 0,
            width: '100%',
            pointerEvents: slide === 0 ? 'auto' : 'none',
          }}
        >
          {/* Header */}
          <div className="bg-[#F9FAFB] border-b border-[#E5E7EB] px-5 py-3.5 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="text-lg">📂</span>
              <span className="text-[13px] font-medium text-[#374151]">Document Hub · Categories</span>
            </div>
            <div className="bg-[#EEF2FF] text-[#4F46E5] text-[11px] font-semibold px-2.5 py-1 rounded">
              14 / 23 docs
            </div>
          </div>

          {/* Body */}
          <div className="p-5">
            <div className="text-[12px] text-[#6B7280] mb-3.5">Category completion</div>
            <div className="space-y-3.5">
              {CATEGORIES.map((c, i) => (
                <div key={i} className="flex items-center gap-3">
                  <div className="text-[12px] text-[#6B7280] min-w-[90px]">{c.name}</div>
                  <div className="flex-1 bg-[#F9FAFB] rounded h-1.5 overflow-hidden">
                    <div
                      className="h-full rounded transition-all duration-500"
                      style={{ width: `${c.percent}%`, backgroundColor: c.color }}
                    />
                  </div>
                  <div className="text-[11px] font-semibold text-[#374151] min-w-[32px] text-right">
                    {c.percent}%
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* ═══════════════ CARD 1 — DOCUMENT LIST ═══════════════ */}
        <div
          className="bg-white border border-[#E5E7EB] rounded-[24px] shadow-xl overflow-hidden transition-opacity duration-700"
          style={{
            opacity: slide === 1 ? 1 : 0,
            position: slide === 1 ? 'relative' : 'absolute',
            top: 0,
            left: 0,
            width: '100%',
            pointerEvents: slide === 1 ? 'auto' : 'none',
          }}
        >
          {/* Header */}
          <div className="bg-[#F9FAFB] border-b border-[#E5E7EB] px-5 py-3.5 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="text-lg">📂</span>
              <span className="text-[13px] font-medium text-[#374151]">Document Hub</span>
            </div>
          </div>

          {/* Body */}
          <div className="p-5">
            <div className="space-y-2.5">
              {DOCUMENTS.map((d, i) => (
                <div
                  key={i}
                  className="flex items-center gap-2.5 p-2 px-2.5 rounded-lg bg-[#F9FAFB] border border-[#E5E7EB]"
                >
                  <div
                    className="w-7 h-7 rounded-md flex items-center justify-center flex-shrink-0"
                    style={{ backgroundColor: d.iconBg }}
                  >
                    <span className="text-[13px]">{d.emoji}</span>
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="text-[12px] text-[#374151] font-medium truncate">{d.name}</div>
                    <div className="text-[11px] text-[#9CA3AF]">{d.sub}</div>
                  </div>
                  <div
                    className="text-[11px] font-medium px-2.5 py-1 rounded flex-shrink-0"
                    style={{ color: d.tagColor, backgroundColor: d.tagBg }}
                  >
                    {d.tag}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* ─── Indicator dots ─── */}
      <div className="flex items-center justify-center gap-2 mt-4">
        {[0, 1].map(i => (
          <button
            key={i}
            type="button"
            aria-label={`Show ${i === 0 ? 'categories' : 'documents'} view`}
            onClick={() => setSlide(i)}
            className="w-2 h-2 rounded-full transition-all duration-300 cursor-pointer"
            style={{ backgroundColor: slide === i ? '#4F46E5' : '#D1D5DB' }}
          />
        ))}
      </div>
    </div>
  )
}
