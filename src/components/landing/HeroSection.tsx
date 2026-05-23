import React from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { BsFillPlayFill } from 'react-icons/bs'

const BULLETS = [
  'Easily build and share your personal memoir',
  'Store and share photos, documents, and files',
  'Make video, audio, and written messages for loved ones',
  'Automated delivery when the time comes',
]

export default function HeroSection() {
  return (
    <section className="relative w-full overflow-hidden min-h-[640px] lg:min-h-[742px]">
      {/* Background image */}
      <Image
        src="/images/landingpage/HeroSectionBg.png"
        alt=""
        fill
        className="object-cover object-center"
       
        priority
      />
      {/* White overlay */}
      <div className="absolute inset-0 bg-white/35 z-[1]" />

      {/* Content */}
      <div className="relative z-10 flex items-center justify-center px-3 sm:px-6 lg:px-8 py-10 sm:py-14 lg:py-0 min-h-[640px] lg:min-h-[742px]">
        <div className="w-full max-w-[1095px] flex flex-col lg:flex-row items-center justify-between gap-10 sm:gap-12 lg:gap-8">

          {/* ── LEFT COLUMN ── */}
          <div className="w-full max-w-[516px] flex flex-col gap-5 sm:gap-6 items-center lg:items-start text-center lg:text-left">

            {/* Badge */}
            <div className="w-fit max-w-full flex items-center gap-2 rounded-full border border-[#E5E7EB] bg-white shadow-sm px-3 py-1.5 sm:py-2">
              <div className="bg-[#4F46E5] rounded-full px-2 py-[2px] flex items-center justify-center flex-shrink-0">
                <span className="text-[10px] sm:text-[11px] leading-[16.5px] font-semibold text-white">
                  NEW
                </span>
              </div>
              <span className="text-[11px] xs:text-[12px] sm:text-[13px] leading-[16px] sm:leading-[19px] text-[#374151] text-left">
                Legacy planning made simple and affordable
              </span>
            </div>

            {/* Heading */}
            <h1
              className="
                text-[26px]
                [@media(min-width:380px)]:text-[32px]
                sm:text-[42px]
                md:text-[48px]
                lg:text-[56px]
                leading-[1.1]
                tracking-[-0.5px]
                sm:tracking-[-1px]
                lg:tracking-[-1.4px]
                text-[#111827]
                break-words
              "
              style={{
                fontFamily: '"Instrument Serif", Georgia, "Times New Roman", serif',
                fontWeight: 400,
              }}
            >
              Your legacy.
              <br />
              Planned beautifully.
              <br />
              <em className="italic">Remembered forever.</em>
            </h1>

            {/* Bullets */}
            <div className="flex flex-col gap-1.5 sm:gap-2 w-full max-w-[460px]">
              {BULLETS.map((text, i) => (
                <div
                  key={i}
                  className="flex items-start sm:items-center gap-2 sm:gap-3 justify-start text-left"
                >
                  <span className="text-[#4F46E5] text-[16px] sm:text-[18px] leading-[24px] sm:leading-[28px] flex-shrink-0">
                    •
                  </span>
                  <span className="text-[13px] sm:text-[15px] md:text-[16px] leading-[20px] sm:leading-[24px] md:leading-[28px] text-[#111827]">
                    {text}
                  </span>
                </div>
              ))}
            </div>

            {/* CTA Row */}
            <div className="flex flex-wrap items-center justify-center lg:justify-start gap-x-3 gap-y-3 w-full">
              <Link
                href="/signup"
                className="
                  w-full
                  [@media(min-width:380px)]:w-auto
                  min-w-[140px]
                  h-[44px]
                  rounded-[10px]
                  bg-[#4F46E5]
                  hover:bg-[#4338CA]
                  transition-colors
                  shadow-sm
                  text-white
                  text-[14px]
                  font-medium
                  flex
                  items-center
                  justify-center
                  px-6
                "
                style={{ boxShadow: '0px 1px 2px 0px #4F46E54D' }}
              >
                Start Free
              </Link>

              <Link
                href="#how-it-works"
                className="
                  w-full
                  [@media(min-width:380px)]:w-auto
                  flex
                  items-center
                  justify-center
                  gap-2
                  text-[#111827]
                  hover:opacity-70
                  transition-opacity
                  text-[14px]
                  sm:text-[16px]
                  font-medium
                  whitespace-nowrap
                  min-h-[44px]
                  px-2
                "
              >
                <span>See how it works</span>
                <BsFillPlayFill className="w-5 h-5 flex-shrink-0" style={{ color: '#111827' }} />
              </Link>
            </div>
          </div>

          {/* ── RIGHT COLUMN — 536 × 600 at lg+, scales proportionally below ── */}
          <div className="relative w-full max-w-[536px] flex-shrink-0">
            <Image
              src="/images/landingpage/bannerImage.png"
              alt="Tether app preview"
              width={536}
              height={600}
              className="w-full h-auto"
              style={{ width: '100%', height: 'auto' }}
              priority
            />
          </div>

        </div>
      </div>
    </section>
  )
}
