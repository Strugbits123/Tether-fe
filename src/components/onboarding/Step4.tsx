"use client"

import React, { useState } from 'react'
import { ArrowLeft, ArrowRight, Check, Video, Mic, PencilIcon } from 'lucide-react'
import CreateMessageModal from '@/components/dashboard/CreateMessageModal'

interface SavedMessage {
  id: string
  title: string
  type: string
}

interface Step4Props {
  onNext: () => void
  onBack: () => void
  initialMessages?: SavedMessage[]
}

type ModalType = 'write' | 'audio' | 'video'

export default function Step4({ onNext, onBack, initialMessages = [] }: Step4Props) {
  const [modalType, setModalType] = useState<ModalType | null>(null)

  const cards: { icon: React.ElementType; title: string; subtitle: string; type: ModalType }[] = [
    { icon: PencilIcon, title: 'Write Message',  subtitle: 'Typed letters',  type: 'write' },
    { icon: Mic,        title: 'Audio Message',  subtitle: 'Quick and easy', type: 'audio' },
    { icon: Video,      title: 'Video Message',  subtitle: 'More personal',  type: 'video' },
  ]

  const canContinue = initialMessages.length > 0

  return (
    <div
      className="w-full flex flex-col items-center px-4 py-8 font-sans"
      style={{ background: 'linear-gradient(135deg, #EEF2FF 0%, #FFFFFF 50%, #F0FDF4 100%)' }}
    >
      <div className="w-full max-w-[673px]">
        {/* Back Button */}
        <button
          onClick={onBack}
          className="flex items-center gap-1 text-[#4F46E5] text-[14px] font-medium underline mb-8 cursor-pointer hover:text-[#4338CA] transition-colors"
          style={{ fontFamily: 'Inter, sans-serif', fontWeight: 500, fontSize: '14px', lineHeight: '20px', letterSpacing: '-0.15px' }}
        >
          <ArrowLeft className="w-4 h-4" />
          Back
        </button>

        {/* Title Section */}
        <div className="text-center mb-8">
          <h1
            className="text-[#111827] mb-3"
            style={{ fontFamily: 'Instrument Serif, serif', fontWeight: 400, fontSize: '46px', lineHeight: '48px', letterSpacing: '0px' }}
          >
            Record your first message
          </h1>
          <p
            className="text-[#4A5565]"
            style={{ fontFamily: 'Inter, sans-serif', fontWeight: 400, fontSize: '18px', lineHeight: '28px', letterSpacing: '-0.44px' }}
          >
            Share something meaningful with the people who matter most
          </p>
        </div>

        {/* Already-saved messages */}
        {initialMessages.length > 0 && (
          <div className="space-y-2 mb-6">
            {initialMessages.map((m) => (
              <div
                key={m.id}
                className="flex items-center justify-between px-4 py-3 rounded-lg border border-[#B9F8CF]"
                style={{ background: '#F0FDF4' }}
              >
                <div>
                  <span className="font-medium text-sm text-[#101828]">{m.title || 'Untitled'}</span>
                  <span className="text-xs text-[#6A7282] ml-2 capitalize">({m.type})</span>
                </div>
                <Check className="w-4 h-4 text-[#00C950]" strokeWidth={3} />
              </div>
            ))}
          </div>
        )}

        {/* Record Cards */}
        <div className="flex justify-center mb-8">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 w-full">
            {cards.map((card) => {
              const Icon = card.icon
              return (
                <button
                  key={card.type}
                  type="button"
                  onClick={() => setModalType(card.type)}
                  className="flex flex-col items-center justify-center text-center cursor-pointer transition-all hover:border-[#C7D2FE] hover:shadow-sm"
                  style={{ borderRadius: '14px', border: '1.25px solid rgba(0, 0, 0, 0.1)', padding: '32px 24px', background: '#FFFFFF', minHeight: '198px' }}
                >
                  <div
                    className="flex items-center justify-center mb-4"
                    style={{ width: '64px', height: '64px', borderRadius: '50%', background: '#E0E7FF' }}
                  >
                    <Icon className="w-6 h-6" style={{ color: '#4F46E5' }} />
                  </div>
                  <p
                    className="mb-1"
                    style={{ fontFamily: 'Inter, sans-serif', fontWeight: 600, fontSize: '18px', lineHeight: '28px', letterSpacing: '-0.44px', color: '#101828' }}
                  >
                    {card.title}
                  </p>
                  <p
                    style={{ fontFamily: 'Inter, sans-serif', fontWeight: 400, fontSize: '14px', lineHeight: '20px', letterSpacing: '-0.15px', color: '#4A5565' }}
                  >
                    {card.subtitle}
                  </p>
                </button>
              )
            })}
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center justify-between">
          <button
            onClick={onNext}
            className="flex items-center justify-center text-[#0A0A0A] font-medium rounded-lg transition-all cursor-pointer hover:bg-slate-50"
            style={{ width: '165px', height: '50px', background: '#FFFFFF', border: '1.25px solid rgba(0, 0, 0, 0.2)', fontFamily: 'Inter, sans-serif', fontWeight: 500, fontSize: '14px', lineHeight: '20px', letterSpacing: '-0.15px', borderRadius: '8px' }}
          >
            Skip for now
          </button>

          <button
            onClick={onNext}
            disabled={!canContinue}
            className="flex items-center justify-center gap-2 text-white font-medium rounded-lg transition-all cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
            style={{ width: '165px', height: '50px', background: canContinue ? '#4F46E5' : '#9CA3AF', fontFamily: 'Inter, sans-serif', fontWeight: 500, fontSize: '14px', lineHeight: '20px', letterSpacing: '-0.15px', borderRadius: '8px' }}
          >
            Continue
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Message modal — opens at step 2 (record or write) */}
      <CreateMessageModal
        open={modalType !== null}
        onClose={() => setModalType(null)}
        initialStep={modalType === 'write' ? 'write' : 'record'}
        initialMessageType={modalType ?? 'video'}
        initialTitle={modalType === 'write' ? '' : 'untitled'}
        onCreated={onNext}
        onSkip={() => setModalType(null)}
      />
    </div>
  )
}
