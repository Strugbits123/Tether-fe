"use client"

import React, { useEffect, useState } from 'react'

/* ─── Recipient row used inside both cards ─── */
type RecipientProps = {
  initials: string
  name: string
  tag: string
  initialsBg: string
  initialsColor: string
  tagBg: string
  tagColor: string
}

function Recipient({ initials, name, tag, initialsBg, initialsColor, tagBg, tagColor }: RecipientProps) {
  return (
    <div className="flex items-center gap-3 bg-[#F9FAFB] rounded-lg px-3 py-2.5">
      <div
        className="w-[28px] h-[28px] rounded-full flex items-center justify-center flex-shrink-0"
        style={{ backgroundColor: initialsBg }}
      >
        <span className="text-[11px] font-bold" style={{ color: initialsColor }}>
          {initials}
        </span>
      </div>
      <div className="flex-1 min-w-0">
        <span className="text-[12px] font-medium text-[#111827]">{name}</span>
      </div>
      <div
        className="text-[10px] font-semibold px-2 py-1 rounded flex-shrink-0"
        style={{ backgroundColor: tagBg, color: tagColor }}
      >
        {tag}
      </div>
    </div>
  )
}

/* ─── Waveform bar heights (in px) ─── */
const BAR_HEIGHTS = [16, 28, 20, 36, 24, 32, 18, 26, 22, 30]

export default function MessagesMockup() {
  /* 0 = audio card, 1 = video card */
  const [slide, setSlide] = useState(0)

  useEffect(() => {
    const id = setInterval(() => {
      setSlide(prev => (prev === 0 ? 1 : 0))
    }, 4500)
    return () => clearInterval(id)
  }, [])

  return (
    <div className="w-full max-w-[508px] mx-auto">
      <div className="relative">

        {/* ═══════════════ AUDIO CARD ═══════════════ */}
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
              <span className="text-lg">🎙️</span>
              <span className="text-[13px] font-medium text-[#374151]">Audio Message</span>
            </div>
            <div className="bg-[#D1FAE5] text-[#065F46] text-[11px] font-semibold px-2.5 py-1 rounded">
              Live
            </div>
          </div>

          {/* Body */}
          <div className="p-5">
            {/* Recording panel */}
            <div className="bg-[#F9FAFB] border border-[#E5E7EB] rounded-2xl p-4 mb-3.5">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                  <div className="w-2.5 h-2.5 bg-[#EF4444] rounded-full animate-pulse" />
                  <span className="text-[12px] font-medium text-[#EF4444]">Recording</span>
                </div>
                <span className="text-[12px] text-[#9CA3AF]">02:47</span>
              </div>

              {/* Waveform bars */}
              <div className="flex items-center justify-center gap-1 h-9">
                {BAR_HEIGHTS.map((h, i) => (
                  <div
                    key={i}
                    className="w-[5px] bg-[#4F46E5] rounded-full"
                    style={{
                      height: `${h}px`,
                      animation: `waveform 0.8s ease-in-out ${i * 0.08}s infinite`,
                    }}
                  />
                ))}
              </div>
            </div>

            {/* Releasing to */}
            <div className="text-[12px] font-medium text-[#6B7280] mb-2.5">Releasing to</div>
            <div className="space-y-2">
              <Recipient
                initials="SC"
                name="Sarah C. — On her wedding day"
                tag="Milestone"
                initialsBg="#EEF2FF"
                initialsColor="#4F46E5"
                tagBg="#EEF2FF"
                tagColor="#4F46E5"
              />
              <Recipient
                initials="JC"
                name="James C. — When the time comes"
                tag="Anytime"
                initialsBg="#D1FAE5"
                initialsColor="#065F46"
                tagBg="#F3F4F6"
                tagColor="#6B7280"
              />
            </div>
          </div>
        </div>

        {/* ═══════════════ VIDEO CARD ═══════════════ */}
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
              <span className="text-lg">🎥</span>
              <span className="text-[13px] font-medium text-[#374151]">Video Message</span>
            </div>
            <div className="bg-[#D1FAE5] text-[#065F46] text-[11px] font-semibold px-2.5 py-1 rounded">
              Live
            </div>
          </div>

          {/* Body */}
          <div className="p-5">
            {/* Video preview */}
            <div className="bg-[#111827] border border-[#E5E7EB] rounded-2xl mb-3.5 relative aspect-video overflow-hidden">
              {/* Using plain <img> to avoid next/image domain config for Unsplash */}
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src="https://images.unsplash.com/photo-1713946598534-c5523c97ba60?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=1080"
                alt="Woman recording video message"
                className="w-full h-full object-cover"
              />
              <div className="absolute top-4 left-4 flex items-center gap-2 bg-[rgba(0,0,0,0.6)] rounded px-2.5 py-1.5 z-10">
                <div className="w-2.5 h-2.5 bg-[#EF4444] rounded-full animate-pulse" />
                <span className="text-[12px] font-medium text-white">REC</span>
                <span className="text-[12px] text-white">03:21</span>
              </div>
            </div>

            {/* Releasing to */}
            <div className="text-[12px] font-medium text-[#6B7280] mb-2.5">Releasing to</div>
            <div className="space-y-2">
              <Recipient
                initials="KH"
                name="Kamryn H. — 21st birthday"
                tag="Milestone"
                initialsBg="#FEF3C7"
                initialsColor="#92400E"
                tagBg="#FEF3C7"
                tagColor="#92400E"
              />
              <Recipient
                initials="AF"
                name="All Family — When the time comes"
                tag="Anytime"
                initialsBg="#EEF2FF"
                initialsColor="#4F46E5"
                tagBg="#F3F4F6"
                tagColor="#6B7280"
              />
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
            aria-label={`Show ${i === 0 ? 'audio' : 'video'} message`}
            onClick={() => setSlide(i)}
            className="w-2 h-2 rounded-full transition-all duration-300 cursor-pointer"
            style={{
              backgroundColor: slide === i ? '#4F46E5' : '#D1D5DB',
            }}
          />
        ))}
      </div>
    </div>
  )
}
