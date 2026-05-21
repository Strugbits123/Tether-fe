"use client"

import React from 'react'
import { ArrowLeft, ArrowRight, Video, Mic, PencilIcon } from 'lucide-react'

interface Step4Props {
  onNext: () => void
  onBack: () => void
}

export default function Step4({ onNext, onBack }: Step4Props) {
  return (
    <div
      className="w-full flex flex-col items-center px-4 py-8 font-sans"
      style={{
        background: 'linear-gradient(135deg, #EEF2FF 0%, #FFFFFF 50%, #F0FDF4 100%)',
      }}
    >
      <div className="w-full max-w-[673px]">
        {/* Back Button */}
        <button
          onClick={onBack}
          className="flex items-center gap-1 text-[#4F46E5] text-[14px] font-medium underline mb-8 cursor-pointer hover:text-[#4338CA] transition-colors"
          style={{
            fontFamily: 'Inter, sans-serif',
            fontWeight: 500,
            fontSize: '14px',
            lineHeight: '20px',
            letterSpacing: '-0.15px',
          }}
        >
          <ArrowLeft className="w-4 h-4" />
          Back
        </button>

        {/* Title Section */}
        <div className="text-center mb-8">
          <h1
            className="text-[#111827] mb-3"
            style={{
              fontFamily: 'Instrument Serif, serif',
              fontWeight: 400,
              fontSize: '46px',
              lineHeight: '48px',
              letterSpacing: '0px',
            }}
          >
            Record your first message
          </h1>
          <p
            className="text-[#4A5565]"
            style={{
              fontFamily: 'Inter, sans-serif',
              fontWeight: 400,
              fontSize: '18px',
              lineHeight: '28px',
              letterSpacing: '-0.44px',
            }}
          >
            Share something meaningful with the people who matter most
          </p>
        </div>

        {/* Record Cards */}
        <div className="flex justify-center mb-8">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 w-full">
            {[
              {
                icon: PencilIcon,
                title: 'Write Message',
                subtitle: 'Typed letters',
              },
              {
                icon: Mic,
                title: 'Audio Message',
                subtitle: 'Quick and easy',
              },
            {
                icon: Video,
                title: 'Video Message',
                subtitle: 'More personal',
              },
            ].map((card, i) => {
              const Icon = card.icon
              return (
                <div
                  key={i}
                  className="flex flex-col items-center justify-center text-center"
                  style={{
                    borderRadius: '14px',
                    border: '1.25px solid rgba(0, 0, 0, 0.1)',
                    padding: '32px 24px',
                    background: '#FFFFFF',
                    minHeight: '198px',
                  }}
                >
                  <div
                    className="flex items-center justify-center mb-4"
                    style={{
                      width: '64px',
                      height: '64px',
                      borderRadius: '50%',
                      background: '#E0E7FF',
                    }}
                  >
                    <Icon className="w-6 h-6" style={{ color: '#4F46E5' }} />
                  </div>

                  <p
                    className="mb-1"
                    style={{
                      fontFamily: 'Inter, sans-serif',
                      fontWeight: 600,
                      fontSize: '18px',
                      lineHeight: '28px',
                      letterSpacing: '-0.44px',
                      color: '#101828',
                    }}
                  >
                    {card.title}
                  </p>

                  <p
                    style={{
                      fontFamily: 'Inter, sans-serif',
                      fontWeight: 400,
                      fontSize: '14px',
                      lineHeight: '20px',
                      letterSpacing: '-0.15px',
                      color: '#4A5565',
                    }}
                  >
                    {card.subtitle}
                  </p>
                </div>
              )
            })}
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center justify-between">
          <button
            onClick={onBack}
            className="flex items-center justify-center text-[#0A0A0A] font-medium rounded-lg transition-all cursor-pointer hover:bg-slate-50"
            style={{
              width: '165px',
              height: '50px',
              background: '#FFFFFF',
              border: '1.25px solid rgba(0, 0, 0, 0.2)',
              fontFamily: 'Inter, sans-serif',
              fontWeight: 500,
              fontSize: '14px',
              lineHeight: '20px',
              letterSpacing: '-0.15px',
              borderRadius: '8px',
            }}
          >
            Skip for now
          </button>

          <button
            onClick={onNext}
            className="flex items-center justify-center gap-2 text-white font-medium rounded-lg transition-all cursor-pointer"
            style={{
              width: '165px',
              height: '50px',
              background: '#4F46E5',
              fontFamily: 'Inter, sans-serif',
              fontWeight: 500,
              fontSize: '14px',
              lineHeight: '20px',
              letterSpacing: '-0.15px',
              borderRadius: '8px',
            }}
          >
            Continue
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  )
}
