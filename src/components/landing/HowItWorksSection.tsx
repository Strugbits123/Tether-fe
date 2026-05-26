import React from 'react'
import Link from 'next/link'

const HEADING_SERIF = '"Instrument Serif", Georgia, "Times New Roman", serif'

type Step = {
  n: string
  title: string
  desc: string
  active?: boolean
}

const STEPS: Step[] = [
  {
    n: '01',
    title: 'Create account',
    desc: 'Free 14-day trial. Our guided onboarding walks you through every step.',
  },
  {
    n: '02',
    title: 'Record messages',
    desc: 'Audio, video, or written. Messages are released to the people you choose.',
  },
  {
    n: '03',
    title: 'Organize documents',
    desc: 'Upload into 6 guided categories. Everything your family will ever need — in one place.',
  },
  {
    n: '04',
    title: 'Designate Access',
    desc: 'Control who receives what and when. Assign specific messages, documents, and photos to the right people.',
    active: true,
  },
]

export default function HowItWorksSection() {
  return (
    <section
      id="how-it-works"
      className="w-full"
      style={{ backgroundColor: '#FFFDF9' }}
    >
      <div
        className="mx-auto w-full"
        style={{
          maxWidth: '1160.5px',
          paddingTop: '100px',
          paddingBottom: '100px',
          paddingLeft: '24px',
          paddingRight: '24px',
        }}
      >
        <div className="flex flex-col items-center w-full" style={{ gap: '48px' }}>

          {/* ─── HEADING BLOCK ─── */}
          <div className="flex flex-col items-center" style={{ gap: '15px' }}>

            {/* "HOW IT WORKS" pill */}
            <div
              className="flex items-center"
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
                  color: '#525252',
                }}
              >
                How it works
              </span>
            </div>

            {/* Heading */}
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
              Set up in an afternoon.{' '}
              <em style={{ color: '#4F46E5', fontStyle: 'italic' }}>
                Peace of mind forever.
              </em>
            </h2>
          </div>

          {/* ─── STEPS ROW (with dotted line on desktop) ─── */}
          <div className="relative w-full" style={{ maxWidth: '1000px' }}>

            {/* Dashed connector line — desktop only, behind circles */}
            <div
              className="hidden md:block absolute pointer-events-none"
              style={{
                top: '26px',
                left: '12.5%',
                right: '12.5%',
                borderTop: '1.25px dashed #4F46E5',
                opacity: 0.35,
                zIndex: 0,
              }}
            />

            {/* Steps grid */}
            <div
              className="
                grid
                grid-cols-1
                sm:grid-cols-2
                md:grid-cols-4
                relative
                z-10
              "
              style={{ gap: '32px' }}
            >
              {STEPS.map(({ n, title, desc, active }, i) => (
                <div key={i} className="flex flex-col items-center" style={{ gap: '14px' }}>

                  {/* Number circle: 52×52 */}
                  <div
                    className="flex items-center justify-center flex-shrink-0"
                    style={{
                      width: '52px',
                      height: '52px',
                      borderRadius: '41943000px',
                      border: '1.25px solid #4F46E5',
                      backgroundColor: active ? '#4F46E5' : '#FFFFFF',
                    }}
                  >
                    <span
                      style={{
                        fontFamily: 'Inter, sans-serif',
                        fontWeight: 600,
                        fontSize: '16px',
                        lineHeight: '24px',
                        textAlign: 'center',
                        color: active ? '#FFFFFF' : '#4F46E5',
                      }}
                    >
                      {n}
                    </span>
                  </div>

                  {/* Title */}
                  <h3
                    style={{
                      fontFamily: 'Inter, sans-serif',
                      fontWeight: 500,
                      fontSize: '14.5px',
                      lineHeight: '21.75px',
                      textAlign: 'center',
                      color: '#111827',
                      margin: 0,
                      marginTop: '4px',
                    }}
                  >
                    {title}
                  </h3>

                  {/* Description */}
                  <p
                    className="max-w-[240px]"
                    style={{
                      fontFamily: 'Inter, sans-serif',
                      fontWeight: 400,
                      fontSize: '13px',
                      lineHeight: '20.8px',
                      textAlign: 'center',
                      color: '#6B7280',
                      margin: 0,
                    }}
                  >
                    {desc}
                  </p>
                </div>
              ))}
            </div>
          </div>

          {/* ─── RELEASE MANAGER CTA BANNER ─── */}
          <div
            className="
              w-full
              flex
              flex-col
              md:flex-row
              items-center
              justify-between
              gap-4
            "
            style={{
              maxWidth: '1096px',
              padding: '24px 32px',
              borderRadius: '24px',
              background: 'linear-gradient(135deg, #4F46E5 0%, #6366F1 100%)',
            }}
          >
            {/* Banner text */}
            <p
              className="text-center md:text-left"
              style={{
                fontFamily: 'Inter, sans-serif',
                fontWeight: 400,
                fontSize: '15px',
                lineHeight: '22.5px',
                letterSpacing: '0px',
                color: '#FFFFFFE5',
                margin: 0,
                flex: 1,
              }}
            >
              When the time comes, your Release Manager will get everything to the right people with automated delivery.
            </p>

            {/* Button: 240×41 */}
            <Link
              href="/signup"
              className="flex items-center justify-center flex-shrink-0 hover:bg-white/20 transition-colors"
              style={{
                width: '240px',
                height: '41px',
                padding: '10px 5px',
                gap: '10px',
                borderRadius: '10px',
                border: '1.25px solid #FFFFFF4D',
                backgroundColor: '#FFFFFF26',
                fontFamily: 'Inter, sans-serif',
                fontWeight: 500,
                fontSize: '14px',
                lineHeight: '21px',
                textAlign: 'center',
                color: '#FFFFFF',
              }}
            >
              See Release Manager Portal →
            </Link>
          </div>

        </div>
      </div>
    </section>
  )
}
