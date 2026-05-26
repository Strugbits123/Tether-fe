import React from 'react'
import { FiMessageCircle, FiFileText, FiBookOpen, FiUsers } from 'react-icons/fi'
import type { IconType } from 'react-icons'

const HEADING_SERIF = '"Instrument Serif", Georgia, "Times New Roman", serif'

type Card = {
  Icon: IconType
  title: string
  desc: string
}

const CARDS: Card[] = [
  {
    Icon: FiMessageCircle,
    title: 'Leave messages',
    desc: 'Create lasting messages for the people who matter most',
  },
  {
    Icon: FiFileText,
    title: 'Secure documents',
    desc: 'Store important documents and files safely with bank-level encryption',
  },
  {
    Icon: FiBookOpen,
    title: 'Share memoir',
    desc: 'Tell your story in your own words, organized by chapters',
  },
  {
    Icon: FiUsers,
    title: 'Control access',
    desc: 'Chose exactly what you want to leave to each of your recipients.',
  },
]

export default function WhatWeDoSection() {
  return (
    <section
      id="about"
      className="w-full"
      style={{ backgroundColor: '#FFFDF9' }}
    >
      <div
        className="mx-auto w-full"
        style={{
          maxWidth: '1205.7px',
          paddingTop: '100px',
          paddingBottom: '100px',
          paddingLeft: '24px',
          paddingRight: '24px',
        }}
      >
        {/* Inner wrapper: gap 60px between heading-block and cards row */}
        <div className="flex flex-col items-center" style={{ gap: '60px' }}>

          {/* ─── HEADING BLOCK (gap: 15px) ─── */}
          <div
            className="flex flex-col items-center w-full"
            style={{ gap: '15px', maxWidth: '1097px' }}
          >

            {/* "PEACE OF MIND" pill badge */}
            <div
              className="flex items-center"
              style={{
                gap: '8px',
                padding: '4px 12px',
                borderRadius: '41943000px',
                backgroundColor: '#EEF2FF',
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
                Peace of Mind
              </span>
            </div>

            {/* Heading */}
            <h2
              className="text-[28px] sm:text-[34px] lg:text-[40px] text-center max-w-[750px]"
              style={{
                fontFamily: HEADING_SERIF,
                fontWeight: 400,
                lineHeight: 1.2,
                letterSpacing: '0px',
                color: '#111827',
                margin: 0,
              }}
            >
              Make sure your family and friends have what they need,{' '}
              <em style={{ color: '#4F46E5', fontStyle: 'italic' }}>
                when they need it.
              </em>
            </h2>
          </div>

          {/* ─── 4 CARDS ROW ─── */}
          <div
            className="
              grid
              grid-cols-1
              sm:grid-cols-2
              lg:grid-cols-4
              w-full
            "
            style={{ gap: '25px' }}
          >
            {CARDS.map(({ Icon, title, desc }, i) => (
              <div
                key={i}
                className="flex flex-col items-center text-center"
                style={{
                  borderRadius: '24px',
                  border: '1.25px solid #5252521A',
                  backgroundColor: '#FFFDF9',
                  padding: '25px 20px',
                  minHeight: '199.94px',
                  gap: '16px',
                  justifyContent: 'center',
                }}
              >

                {/* Icon container: 56×56 with 14px radius */}
                <div
                  className="flex items-center justify-center flex-shrink-0"
                  style={{
                    width: '56px',
                    height: '56px',
                    borderRadius: '14px',
                    backgroundColor: '#F5EDE3',
                  }}
                >
                  <Icon style={{ width: '23px', height: '23px', color: '#4F46E5' }} />
                </div>

                {/* Title */}
                <h3
                  style={{
                    fontFamily: 'Inter, sans-serif',
                    fontWeight: 600,
                    fontSize: '16px',
                    lineHeight: '24px',
                    letterSpacing: '-0.31px',
                    textAlign: 'center',
                    color: '#101828',
                    margin: 0,
                  }}
                >
                  {title}
                </h3>

                {/* Description */}
                <p
                  style={{
                    fontFamily: 'Inter, sans-serif',
                    fontWeight: 400,
                    fontSize: '14px',
                    lineHeight: '22.75px',
                    letterSpacing: '-0.15px',
                    textAlign: 'center',
                    color: '#4A5565',
                    margin: 0,
                  }}
                >
                  {desc}
                </p>
              </div>
            ))}
          </div>

        </div>
      </div>
    </section>
  )
}
