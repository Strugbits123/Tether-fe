import React from 'react'
import { IoStarSharp } from 'react-icons/io5'

const HEADING_SERIF = '"Instrument Serif", Georgia, "Times New Roman", serif'

/* ─── Pill badge ─── */
function PillBadge({ label }: { label: string }) {
  return (
    <div
      className="flex items-center w-fit"
      style={{
        gap: '8px',
        padding: '4px 12px',
        borderRadius: '41943000px',
        backgroundColor: '#F0E8E0',
      }}
    >
      <span
        style={{
          width: '6px',
          height: '6px',
          borderRadius: '41943000px',
          backgroundColor: '#4F46E5',
          flexShrink: 0,
        }}
      />
      <span
        style={{
          fontFamily: 'Inter, sans-serif',
          fontWeight: 600,
          fontSize: '12px',
          lineHeight: '18px',
          letterSpacing: '0.6px',
          textTransform: 'uppercase',
          textAlign: 'center',
          color: '#525252',
        }}
      >
        {label}
      </span>
    </div>
  )
}

/* ─── Card data ─── */
type Testimonial = {
  quote: string
  initials: string
  name: string
  role: string
  avatarBg: string
  avatarText: string
}

const TESTIMONIALS: Testimonial[] = [
  {
    quote:
      "I recorded a message for my daughter for her wedding day. Whether I'm there or not, she'll have my words. That's worth more than anything I've ever bought.",
    initials: 'RH',
    name: 'Robert H.',
    role: 'Tether Legacy plan · Father of 3',
    avatarBg: '#EEF2FF',
    avatarText: '#4F46E5',
  },
  {
    quote:
      "After watching my mother-in-law's estate take two years to settle, I set up Tether in a weekend. My husband's family will never go through what we did.",
    initials: 'SM',
    name: 'Sarah M.',
    role: 'Tether Family plan · Former Release Manager',
    avatarBg: '#D1FAE5',
    avatarText: '#065F46',
  },
  {
    quote:
      "As an estate attorney, I recommend Tether to every client after they sign their will. It's the organizational layer the law alone can't provide.",
    initials: 'DW',
    name: 'David W., Esq.',
    role: 'Estate attorney · Tether partner',
    avatarBg: '#FEF3C7',
    avatarText: '#92400E',
  },
]

/* ─── Testimonial card ─── */
function TestimonialCard({ quote, initials, name, role, avatarBg, avatarText }: Testimonial) {
  return (
    <div
      className="flex flex-col"
      style={{
        padding: '29px',
        borderRadius: '16px',
        border: '1.25px solid rgba(0,0,0,0.05)',
        backgroundColor: '#FFFFFF',
        boxShadow:
          '0px 1px 2px -1px rgba(0,0,0,0.10), 0px 1px 3px 0px rgba(0,0,0,0.10)',
        minHeight: '251.29px',
        gap: '16px',
      }}
    >
      {/* 5 stars */}
      <div className="flex items-center" style={{ gap: '3.98px' }}>
        {[...Array(5)].map((_, i) => (
          <IoStarSharp
            key={i}
            style={{ width: '14px', height: '14px', color: '#EAB308' }}
          />
        ))}
      </div>

      {/* Quote */}
      <p
        style={{
          fontFamily: HEADING_SERIF,
          fontWeight: 400,
          fontStyle: 'italic',
          fontSize: '16px',
          lineHeight: '25.6px',
          letterSpacing: '0px',
          color: '#374151',
          margin: 0,
          flex: 1,
        }}
      >
        &ldquo;{quote}&rdquo;
      </p>

      {/* Author row */}
      <div className="flex items-center" style={{ gap: '11.99px', marginTop: 'auto' }}>
        {/* Avatar circle */}
        <div
          className="flex items-center justify-center flex-shrink-0"
          style={{
            width: '36px',
            height: '36px',
            borderRadius: '41943000px',
            backgroundColor: avatarBg,
          }}
        >
          <span
            style={{
              fontFamily: 'Inter, sans-serif',
              fontWeight: 700,
              fontSize: '13px',
              lineHeight: '19.5px',
              color: avatarText,
            }}
          >
            {initials}
          </span>
        </div>

        {/* Name + role stack */}
        <div className="flex flex-col" style={{ minWidth: 0 }}>
          <span
            style={{
              fontFamily: 'Inter, sans-serif',
              fontWeight: 500,
              fontSize: '13px',
              lineHeight: '19.5px',
              color: '#111827',
            }}
          >
            {name}
          </span>
          <span
            style={{
              fontFamily: 'Inter, sans-serif',
              fontWeight: 400,
              fontSize: '12px',
              lineHeight: '18px',
              color: '#9CA3AF',
            }}
          >
            {role}
          </span>
        </div>
      </div>
    </div>
  )
}

export default function WhatFamiliesSaySection() {
  return (
    <section className="w-full" style={{ backgroundColor: '#FFFDF9' }}>
      <div
        className="mx-auto w-full"
        style={{
          maxWidth: '1160.5px',
          paddingTop: '100px',
          paddingBottom: '100px',
          paddingLeft: '32px',
          paddingRight: '32px',
        }}
      >
        <div className="flex flex-col items-center w-full" style={{ gap: '56px' }}>

          {/* ─── HEADING BLOCK ─── */}
          <div className="flex flex-col items-center" style={{ gap: '15px' }}>
            <PillBadge label="What families say" />

            <h2
              className="text-[28px] sm:text-[34px] lg:text-[40px] text-center"
              style={{
                fontFamily: HEADING_SERIF,
                fontWeight: 400,
                lineHeight: 1.3,
                letterSpacing: '0px',
                color: '#111827',
                margin: 0,
              }}
            >
              What early users are{' '}
              <em style={{ color: '#4F46E5', fontStyle: 'italic' }}>actually</em>{' '}
              saying.
            </h2>
          </div>

          {/* ─── 3 TESTIMONIAL CARDS ─── */}
          <div
            className="grid grid-cols-1 md:grid-cols-3 w-full"
            style={{ gap: '20px', maxWidth: '1096.5px' }}
          >
            {TESTIMONIALS.map((t, i) => (
              <TestimonialCard key={i} {...t} />
            ))}
          </div>

        </div>
      </div>
    </section>
  )
}
