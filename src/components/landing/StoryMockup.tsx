"use client"

import React, { useEffect, useState } from 'react'
import { FiMic, FiEdit3 } from 'react-icons/fi'

const HEADING_SERIF = '"Instrument Serif", Georgia, "Times New Roman", serif'

/* ─── Chapter tag (Voice / Written) ─── */
function ChapterTag({ type }: { type: 'voice' | 'written' }) {
  const Icon = type === 'voice' ? FiMic : FiEdit3
  const label = type === 'voice' ? 'Voice Chapter' : 'Written Chapter'
  return (
    <div
      className="flex items-center gap-1.5"
      style={{
        padding: '1px 12px',
        backgroundColor: '#F3F4F6',
        borderRadius: '4px',
        height: '22px',
      }}
    >
      <Icon style={{ width: '12px', height: '12px', color: '#364153' }} />
      <span
        style={{
          fontFamily: 'Inter, sans-serif',
          fontWeight: 500,
          fontSize: '10px',
          lineHeight: '20px',
          letterSpacing: '-0.15px',
          color: '#364153',
        }}
      >
        {label}
      </span>
    </div>
  )
}

/* ─── Recipient counter (24px circle + label) ─── */
function RecipientCounter({ count }: { count: number }) {
  return (
    <div className="flex items-center gap-2">
      <div
        className="rounded-full flex items-center justify-center flex-shrink-0"
        style={{
          width: '24px',
          height: '24px',
          backgroundColor: '#EBEBEB',
        }}
      >
        <span
          style={{
            fontFamily: 'Inter, sans-serif',
            fontWeight: 500,
            fontSize: '12px',
            lineHeight: '16px',
            color: '#676767',
          }}
        >
          {count}
        </span>
      </div>
      <span
        style={{
          fontFamily: 'Inter, sans-serif',
          fontWeight: 400,
          fontSize: '12px',
          color: '#6B7280',
        }}
      >
        recipients
      </span>
    </div>
  )
}

/* ─── Cross-fade slide wrapper helper ─── */
function slideStyle(active: boolean): React.CSSProperties {
  return {
    opacity: active ? 1 : 0,
    position: active ? 'relative' : 'absolute',
    top: 0,
    left: 0,
    width: '100%',
    pointerEvents: active ? 'auto' : 'none',
  }
}

export default function StoryMockup() {
  /* 0 = cover, 1 = ch1, 2 = exhibits, 3 = ch2 */
  const [slide, setSlide] = useState(0)

  useEffect(() => {
    const id = setInterval(() => {
      setSlide(prev => (prev + 1) % 4)
    }, 4500)
    return () => clearInterval(id)
  }, [])

  return (
    <div className="w-full max-w-[508px] mx-auto">
      <div className="relative">

        {/* ═══════════ SLIDE 0 — COVER ═══════════ */}
        <div
          className="bg-white border border-[#E5E7EB] rounded-[24px] shadow-xl overflow-hidden transition-opacity duration-700"
          style={slideStyle(slide === 0)}
        >
          <div className="aspect-[4/3] bg-gradient-to-br from-[#F8F7F4] to-[#E5E4E0] flex items-center justify-center p-12">
            <div className="text-center space-y-5">
              <div className="inline-block px-4 py-1.5 bg-[#4F46E5]/10 rounded-full">
                <p className="text-[11px] font-semibold text-[#4F46E5] uppercase tracking-wider">A Story</p>
              </div>
              <h1
                className="text-[40px] leading-[1.1] text-[#111827]"
                style={{ fontFamily: HEADING_SERIF, fontWeight: 400, margin: 0 }}
              >
                Sarah&apos;s Story
              </h1>
              <p
                className="text-[16px] text-[#6B7280] italic"
                style={{ fontFamily: HEADING_SERIF, margin: 0 }}
              >
                A life remembered, a legacy shared
              </p>
              <div className="h-px bg-[#E5E7EB] w-16 mx-auto" />
              <p className="text-[13px] text-[#6B7280]" style={{ margin: 0 }}>12 chapters</p>
              <button
                type="button"
                className="inline-flex items-center gap-1.5 bg-[#4F46E5] hover:bg-[#4338CA] text-white text-[12px] font-semibold px-5 py-2 rounded-lg transition-colors"
              >
                Continue
                <span aria-hidden>→</span>
              </button>
            </div>
          </div>
        </div>

        {/* ═══════════ SLIDE 1 — CHAPTER 1: GROWING UP IN CHICAGO ═══════════ */}
        <div
          className="bg-white border border-[#E5E7EB] rounded-[24px] shadow-xl overflow-hidden transition-opacity duration-700"
          style={slideStyle(slide === 1)}
        >
          <div className="aspect-[4/3] bg-[#F8F7F4] p-8 overflow-hidden flex flex-col">
            <div className="flex items-center justify-between mb-6">
              <p className="text-[11px] text-[#9CA3AF] uppercase tracking-wider">Chapter 1 of 3</p>
              <ChapterTag type="voice" />
            </div>

            <h2
              className="text-[28px] text-[#111827] mb-6"
              style={{ fontFamily: HEADING_SERIF, fontWeight: 400, margin: 0, marginBottom: '24px' }}
            >
              Growing Up in Chicago
            </h2>

            <div
              className="flex-1 space-y-4"
              style={{ fontFamily: HEADING_SERIF, fontSize: '14px', lineHeight: 1.8, color: '#374151' }}
            >
              <p className="first-letter:text-[40px] first-letter:float-left first-letter:mr-2 first-letter:leading-[0.8] first-letter:text-[#4F46E5]">
                I was born in Chicago in 1965, in a small apartment on the South Side. My parents had immigrated from Poland just three years earlier, carrying with them nothing but hope and determination.
              </p>
              <p className="text-[#6B7280] text-[12px]">Continue reading...</p>
            </div>

            <div className="flex items-center justify-end mt-4 pt-2">
              <RecipientCounter count={4} />
            </div>
          </div>
        </div>

        {/* ═══════════ SLIDE 2 — CHAPTER EXHIBITS (unchanged) ═══════════ */}
        <div
          className="bg-white border border-[#E5E7EB] rounded-[24px] shadow-xl overflow-hidden transition-opacity duration-700"
          style={slideStyle(slide === 2)}
        >
          <div className="aspect-[4/3] bg-[#F8F7F4] p-8 overflow-hidden">
            <div className="flex items-center justify-between mb-4">
              <h3
                className="text-[20px] text-[#111827]"
                style={{ fontFamily: HEADING_SERIF, fontWeight: 400, margin: 0 }}
              >
                Chapter Exhibits
              </h3>
              <p className="text-[12px] text-[#6B7280]" style={{ margin: 0 }}>3 photos</p>
            </div>

            <div className="grid grid-cols-3 gap-3 mb-4">
              <div className="aspect-square rounded-lg overflow-hidden">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src="https://images.unsplash.com/photo-1477959858617-67f85cf4f1df?w=400"
                  alt="Apartment building"
                  className="w-full h-full object-cover"
                />
              </div>
              <div className="aspect-square rounded-lg overflow-hidden">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src="https://images.unsplash.com/photo-1449824913935-59a10b8d2000?w=400"
                  alt="Neighborhood"
                  className="w-full h-full object-cover"
                />
              </div>
              <div className="aspect-square rounded-lg overflow-hidden">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src="https://images.unsplash.com/photo-1516594798947-e65505dbb29d?w=400"
                  alt="Parents"
                  className="w-full h-full object-cover"
                />
              </div>
            </div>

            <div className="bg-white rounded-lg p-4 border border-[#E5E7EB]">
              <p className="text-[12px] font-medium text-[#111827] mb-1">
                Our apartment building on the South Side
              </p>
              <p className="text-[11px] text-[#6B7280] italic leading-[1.6]">
                This is the building where we lived. Fourth floor, apartment 4C. I can still remember running up those stairs every day after school.
              </p>
            </div>
          </div>
        </div>

        {/* ═══════════ SLIDE 3 — CHAPTER 2: MEETING YOUR FATHER ═══════════ */}
        <div
          className="bg-white border border-[#E5E7EB] rounded-[24px] shadow-xl overflow-hidden transition-opacity duration-700"
          style={slideStyle(slide === 3)}
        >
          <div className="aspect-[4/3] bg-[#F8F7F4] p-8 overflow-hidden flex flex-col">
            <div className="flex items-center justify-between mb-6">
              <p className="text-[11px] text-[#9CA3AF] uppercase tracking-wider">Chapter 2 of 3</p>
              <ChapterTag type="written" />
            </div>

            <h2
              className="text-[28px] text-[#111827] mb-6"
              style={{ fontFamily: HEADING_SERIF, fontWeight: 400, margin: 0, marginBottom: '24px' }}
            >
              Meeting Your Father
            </h2>

            <div
              className="flex-1 space-y-4"
              style={{ fontFamily: HEADING_SERIF, fontSize: '14px', lineHeight: 1.8, color: '#374151' }}
            >
              <p className="first-letter:text-[40px] first-letter:float-left first-letter:mr-2 first-letter:leading-[0.8] first-letter:text-[#4F46E5]">
                I met your father in the fall of 1987, at a coffee shop near the university. I was studying late, buried in textbooks for my nursing exam, and he walked in with his guitar case slung over his shoulder.
              </p>
              <p className="text-[#6B7280] text-[12px]">Continue reading...</p>
            </div>

            <div className="flex items-center justify-end mt-4 pt-2">
              <RecipientCounter count={7} />
            </div>
          </div>
        </div>

      </div>

      {/* ─── Indicator dots ─── */}
      <div className="flex items-center justify-center gap-2 mt-4">
        {[0, 1, 2, 3].map(i => (
          <button
            key={i}
            type="button"
            aria-label={`Show story slide ${i + 1}`}
            onClick={() => setSlide(i)}
            className="w-2 h-2 rounded-full transition-all duration-300 cursor-pointer"
            style={{ backgroundColor: slide === i ? '#4F46E5' : '#D1D5DB' }}
          />
        ))}
      </div>
    </div>
  )
}
