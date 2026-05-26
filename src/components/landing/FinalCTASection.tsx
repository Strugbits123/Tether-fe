import React from 'react'
import Link from 'next/link'
import { FiArrowRight } from 'react-icons/fi'

const HEADING_SERIF = '"Instrument Serif", Georgia, "Times New Roman", serif'

export default function FinalCTASection() {
  return (
    <section className="w-full" style={{ backgroundColor: '#FFFFFF' }}>
      <div
        className="mx-auto w-full"
        style={{
          maxWidth: '1280px',
          paddingTop: '100px',
          paddingBottom: '100px',
          paddingLeft: '24px',
          paddingRight: '24px',
        }}
      >
        {/* ── Cream card ── */}
        <div
          className="w-full mx-auto"
          style={{
            maxWidth: '1096.5px',
            borderRadius: '24px',
            backgroundColor: '#F5EDE3',
            paddingTop: '64px',
            paddingBottom: '64px',
            paddingLeft: '64px',
            paddingRight: '64px',
          }}
        >
          <div
            className="flex flex-col items-center text-center mx-auto"
            style={{ gap: '24px', maxWidth: '968px' }}
          >

            {/* "GET STARTED TODAY" pill */}
            <div
              className="flex items-center"
              style={{
                gap: '8px',
                padding: '4px 12px',
                borderRadius: '41943000px',
                backgroundColor: '#FFFDF9',
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
                  color: '#4F46E5',
                }}
              >
                Get started today
              </span>
            </div>

            {/* Heading */}
            <h2
              className="text-[30px] sm:text-[36px] md:text-[40px] lg:text-[44px] text-center"
              style={{
                fontFamily: HEADING_SERIF,
                fontWeight: 400,
                lineHeight: 1.15,
                letterSpacing: '0px',
                color: '#111827',
                margin: 0,
              }}
            >
              The most loving thing
              <br />
              you can do is{' '}
              <em style={{ color: '#4F46E5', fontStyle: 'italic' }}>be prepared.</em>
            </h2>

            {/* Subtext */}
            <p
              className="text-[14px] sm:text-[16px] text-center"
              style={{
                fontFamily: 'Inter, sans-serif',
                fontWeight: 400,
                lineHeight: '24px',
                color: '#374151',
                margin: 0,
              }}
            >
              Setup in minutes. Free onboarding assistance.
            </p>

            {/* CTA button */}
            <Link
              href="/signup"
              className="inline-flex items-center justify-center gap-2 hover:bg-slate-50 transition-colors"
              style={{
                height: '36px',
                padding: '0 18px',
                borderRadius: '10px',
                backgroundColor: '#FFFFFF',
                fontFamily: 'Inter, "Geist", sans-serif',
                fontWeight: 600,
                fontSize: '14px',
                lineHeight: '22.5px',
                color: '#4F46E5',
                textDecoration: 'none',
              }}
            >
              Start free trial
              <FiArrowRight style={{ width: '16px', height: '16px', color: '#4F46E5' }} />
            </Link>

            {/* Footer micro-copy */}
            <p
              className="text-[11px] sm:text-[12px] text-center"
              style={{
                fontFamily: 'Inter, sans-serif',
                fontWeight: 400,
                lineHeight: '18px',
                color: '#374151',
                margin: 0,
              }}
            >
              14-day free trial · Cancel anytime
            </p>
          </div>
        </div>
      </div>
    </section>
  )
}
