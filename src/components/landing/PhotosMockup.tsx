"use client"

import React, { useEffect, useState } from 'react'
import { HiOutlinePhotograph, HiOutlineUser, HiOutlineTag } from 'react-icons/hi'

type Folder = {
  label: string
  count?: number
  Icon: React.ComponentType<{ className?: string }>
  key: string
}

const FOLDERS: Folder[] = [
  { key: 'all',        label: 'All',                count: 142, Icon: HiOutlinePhotograph },
  { key: 'recipient',  label: 'By recipient',       count: 8,   Icon: HiOutlineUser },
  { key: 'childhood',  label: 'Childhood memories',             Icon: HiOutlineTag },
  { key: 'wedding',    label: 'Wedding day',                    Icon: HiOutlineTag },
]

/* Photo data per slide */
const UNCATEGORIZED_PHOTOS = [
  {
    src:
      'https://images.unsplash.com/photo-1650433349342-3eefed21339f?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=1080',
    alt: "Grandma's 75th",
    caption: "Grandma's 75th",
  },
  {
    src:
      'https://images.unsplash.com/photo-1628198661856-102874fb9d82?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=1080',
    alt: 'Graduation 2018',
    caption: 'Graduation 2018',
  },
]

const WEDDING_PHOTOS = [
  {
    src:
      'https://images.unsplash.com/photo-1603214924133-5c2c78471b73?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=1080',
    alt: 'Wedding ceremony',
  },
  {
    src:
      'https://images.unsplash.com/photo-1745231991466-19d41014cc66?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=1080',
    alt: 'Wedding couple',
  },
]

/* ─── Folder row used in both cards ─── */
function FolderItem({
  Icon,
  label,
  count,
  active,
}: {
  Icon: React.ComponentType<{ className?: string }>
  label: string
  count?: number
  active?: boolean
}) {
  return (
    <div
      className={`flex items-center gap-2 px-2 py-1.5 rounded-lg cursor-pointer ${
        active ? 'bg-[#EEF2FF]' : 'hover:bg-[#F9FAFB]'
      }`}
    >
      <Icon className={`w-4 h-4 ${active ? 'text-[#4F46E5]' : 'text-[#6B7280]'}`} />
      <span
        className={`text-[12px] ${
          active ? 'text-[#4F46E5] font-medium' : 'text-[#6B7280]'
        }`}
      >
        {label}
      </span>
      {count != null && (
        <span
          className={`text-[10px] ml-auto ${active ? 'text-[#6B7280]' : 'text-[#9CA3AF]'}`}
        >
          {count}
        </span>
      )}
    </div>
  )
}

/* ─── Card body shared between both slides ─── */
function CardShell({
  activeFolder,
  rightTitle,
  photos,
}: {
  activeFolder: string
  rightTitle: string
  photos: { src: string; alt: string; caption?: string }[]
}) {
  return (
    <>
      {/* Header */}
      <div className="bg-[#F9FAFB] border-b border-[#E5E7EB] px-5 py-3.5 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="text-[18px]">📸</span>
          <span className="text-[13px] font-medium text-[#374151]">Photos</span>
        </div>
        <button className="bg-[#4F46E5] text-white text-[11px] font-semibold px-3 py-1.5 rounded-lg hover:bg-[#3730A3] transition-colors">
          + New folder
        </button>
      </div>

      {/* Body */}
      <div className="p-5">
        <div className="flex gap-4 mb-4">
          {/* Left — folder list */}
          <div className="w-1/3 space-y-1">
            <div className="text-[11px] font-semibold text-[#6B7280] mb-2">Folders</div>
            {FOLDERS.map(f => (
              <FolderItem
                key={f.key}
                Icon={f.Icon}
                label={f.label}
                count={f.count}
                active={f.key === activeFolder}
              />
            ))}
          </div>

          {/* Right — photo grid */}
          <div className="flex-1">
            <div className="flex items-center justify-between mb-3">
              <div className="text-[12px] font-medium text-[#111827]">{rightTitle}</div>
              <button className="text-[11px] text-[#6B7280] hover:text-[#111827]">
                Select photos…
              </button>
            </div>
            <div className="grid grid-cols-2 gap-3">
              {photos.map((p, i) => (
                <div
                  key={i}
                  className="aspect-square rounded-lg overflow-hidden border border-[#E5E7EB] relative group"
                >
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={p.src} alt={p.alt} className="w-full h-full object-cover" />
                  {p.caption && (
                    <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/70 to-transparent p-2">
                      <div className="text-[10px] text-white font-medium">{p.caption}</div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </>
  )
}

export default function PhotosMockup() {
  /* 0 = uncategorized (All folder), 1 = Wedding day folder.  Default = 1. */
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

        {/* CARD 0 — Uncategorized */}
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
          <CardShell
            activeFolder="all"
            rightTitle="Uncategorized Photos"
            photos={UNCATEGORIZED_PHOTOS}
          />
        </div>

        {/* CARD 1 — Wedding day */}
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
          <CardShell
            activeFolder="wedding"
            rightTitle="Wedding day"
            photos={WEDDING_PHOTOS}
          />
        </div>
      </div>

      {/* Indicator dots */}
      <div className="flex items-center justify-center gap-2 mt-4">
        {[0, 1].map(i => (
          <button
            key={i}
            type="button"
            aria-label={`Show ${i === 0 ? 'uncategorized' : 'wedding'} folder`}
            onClick={() => setSlide(i)}
            className="w-2 h-2 rounded-full transition-all duration-300 cursor-pointer"
            style={{ backgroundColor: slide === i ? '#4F46E5' : '#D1D5DB' }}
          />
        ))}
      </div>
    </div>
  )
}
