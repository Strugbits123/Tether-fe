import React from 'react'
import { IoLockClosedOutline } from "react-icons/io5";
import { IoIosCheckmarkCircleOutline } from "react-icons/io";
import { AiOutlineDollarCircle } from "react-icons/ai";
import { HiOutlineSparkles } from "react-icons/hi2";
const FEATURES = [
  { Icon: IoIosCheckmarkCircleOutline,           title: 'Easy to use',       desc: 'We make it simple' },
  { Icon: HiOutlineSparkles,       title: 'Beautifully made',  desc: 'Designed with care' },
  { Icon: AiOutlineDollarCircle, title: 'Affordable',        desc: 'For every budget' },
  { Icon: IoLockClosedOutline,                  title: 'Private & Secure',  desc: 'Your data is protected' },
]

export default function FeaturesBar() {
  return (
    <section
      className="w-full bg-white"
      style={{
        borderTop: '1.25px solid #E5E7EB',
        borderBottom: '1.25px solid #E5E7EB',
      }}
    >
      <div
        className="mx-auto px-4 sm:px-6"
        style={{
          maxWidth: '1156.04px',
          paddingTop: '33.24px',
          paddingBottom: '33.24px',
        }}
      >
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-y-8 gap-x-6 sm:gap-x-[52px] items-start justify-items-center">
          {FEATURES.map(({ Icon, title, desc }, i) => (
            <div key={i} className="flex flex-col items-center text-center gap-2.5 w-full max-w-[250px]">
              <Icon style={{ width: '32px', height: '32px', color: '#4F46E5' }} />
              <h4
                style={{
                  fontFamily: 'Inter, sans-serif',
                  fontWeight: 600,
                  fontSize: '18px',
                  lineHeight: '21px',
                  letterSpacing: '0px',
                  color: '#111827',
                  textAlign: 'center',
                  margin: 0,
                }}
              >
                {title}
              </h4>
              <p
                style={{
                  fontFamily: 'Inter, sans-serif',
                  fontWeight: 400,
                  fontSize: '12px',
                  lineHeight: '18px',
                  letterSpacing: '0px',
                  color: '#6B7280',
                  textAlign: 'center',
                  margin: 0,
                }}
              >
                {desc}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
