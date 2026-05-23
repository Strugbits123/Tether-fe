"use client"

import React, { useState } from 'react'
import { ArrowLeft, ArrowRight, Check } from 'lucide-react'
import CustomSelect from './CustomSelect'

interface ReleaseManager {
  firstName: string
  lastName: string
  phone: string
  email: string
  relationship: string
}

interface Step3Props {
  onNext: (manager: ReleaseManager | null) => void
  onBack: () => void
  loading?: boolean
}

const relationshipOptions = [
  'Spouse',
  'Child',
  'Parent',
  'Sibling',
  'Friend',
  'Colleague',
  'Lawyer',
  'Other',
]

export default function Step3({ onNext, onBack, loading }: Step3Props) {
  const [firstName, setFirstName] = useState('')
  const [lastName, setLastName] = useState('')
  const [phone, setPhone] = useState('')
  const [email, setEmail] = useState('')
  const [relationship, setRelationship] = useState('')

  const handleContinue = () => {
    if (!firstName.trim() || !lastName.trim() || !email.trim() || !relationship) return
    onNext({ firstName, lastName, phone, email, relationship })
  }

  const handleSkip = () => {
    onNext(null)
  }

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
            Assign your Release Manager
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
            Chose someone you trust to release your information when the time comes
          </p>
        </div>

        {/* Form Card */}
        <div
          className="bg-white rounded-[14px] mb-4"
          style={{
            border: '1.25px solid rgba(0, 0, 0, 0.1)',
            padding: '25px',
          }}
        >
          <div className="space-y-4">
            {/* First Name & Last Name Row */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label
                  className="block mb-1.5"
                  style={{
                    fontFamily: 'Inter, sans-serif',
                    fontWeight: 500,
                    fontSize: '14px',
                    lineHeight: '14px',
                    letterSpacing: '-0.15px',
                    color: '#374151',
                  }}
                >
                  First Name <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={firstName}
                  onChange={(e) => setFirstName(e.target.value)}
                  placeholder="Sarah"
                  className="w-full text-sm focus:outline-none focus:border-indigo-600 transition-all"
                  style={{
                    height: '48px',
                    borderRadius: '12px',
                    border: '1.25px solid #D1D5DC',
                    padding: '0 16px',
                    fontFamily: 'Inter, sans-serif',
                  }}
                />
              </div>
              <div>
                <label
                  className="block mb-1.5"
                  style={{
                    fontFamily: 'Inter, sans-serif',
                    fontWeight: 500,
                    fontSize: '14px',
                    lineHeight: '14px',
                    letterSpacing: '-0.15px',
                    color: '#374151',
                  }}
                >
                  Last Name <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={lastName}
                  onChange={(e) => setLastName(e.target.value)}
                  placeholder="Smith"
                  className="w-full text-sm focus:outline-none focus:border-indigo-600 transition-all"
                  style={{
                    height: '48px',
                    borderRadius: '12px',
                    border: '1.25px solid #D1D5DC',
                    padding: '0 16px',
                    fontFamily: 'Inter, sans-serif',
                  }}
                />
              </div>
            </div>

            {/* Phone Number */}
            <div>
              <label
                className="block mb-1.5"
                style={{
                  fontFamily: 'Inter, sans-serif',
                  fontWeight: 500,
                  fontSize: '14px',
                  lineHeight: '14px',
                  letterSpacing: '-0.15px',
                  color: '#374151',
                }}
              >
                Phone Number
              </label>
              <input
                type="tel"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="+1 (555) 000-0000"
                className="w-full text-sm focus:outline-none focus:border-indigo-600 transition-all"
                style={{
                  height: '48px',
                  borderRadius: '12px',
                  border: '1.25px solid #D1D5DC',
                  padding: '0 16px',
                  fontFamily: 'Inter, sans-serif',
                }}
              />
            </div>

            {/* Email */}
            <div>
              <label
                className="block mb-1.5"
                style={{
                  fontFamily: 'Inter, sans-serif',
                  fontWeight: 500,
                  fontSize: '14px',
                  lineHeight: '14px',
                  letterSpacing: '-0.15px',
                  color: '#374151',
                }}
              >
                Email <span className="text-red-500">*</span>
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="email@example.com"
                className="w-full text-sm focus:outline-none focus:border-indigo-600 transition-all"
                style={{
                  height: '48px',
                  borderRadius: '12px',
                  border: '1.25px solid #D1D5DC',
                  padding: '0 16px',
                  fontFamily: 'Inter, sans-serif',
                }}
              />
            </div>

            {/* Relationship */}
            <div>
              <label
                className="block mb-1.5"
                style={{
                  fontFamily: 'Inter, sans-serif',
                  fontWeight: 500,
                  fontSize: '14px',
                  lineHeight: '14px',
                  letterSpacing: '-0.15px',
                  color: '#374151',
                }}
              >
                Relationship <span className="text-red-500">*</span>
              </label>
              <CustomSelect
                options={relationshipOptions}
                value={relationship}
                onChange={setRelationship}
                placeholder="Select relationship"
              />
            </div>
          </div>
        </div>

        {/* Info Card */}
        <div
          className="rounded-[14px] mb-6"
          style={{
            border: '1.25px solid #EEECFF',
            background: '#EEF2FF',
            padding: '24px',
          }}
        >
          <h3
            className="mb-4"
            style={{
              fontFamily: 'Inter, sans-serif',
              fontWeight: 600,
              fontSize: '18px',
              lineHeight: '27px',
              letterSpacing: '-0.44px',
              color: '#4F46E5',
            }}
          >
            What can a Release Manager do?
          </h3>
          <div className="space-y-3">
            <div className="flex items-start gap-2">
              <Check className="w-4 h-4 mt-0.5 flex-shrink-0" style={{ color: '#4F46E5' }} />
              <span
                style={{
                  fontFamily: 'Inter, sans-serif',
                  fontWeight: 400,
                  fontSize: '14px',
                  lineHeight: '20px',
                  letterSpacing: '-0.15px',
                  color: '#4F46E5',
                }}
              >
                Access all your documents and messages when needed
              </span>
            </div>
            <div className="flex items-start gap-2">
              <Check className="w-4 h-4 mt-0.5 flex-shrink-0" style={{ color: '#4F46E5' }} />
              <span
                style={{
                  fontFamily: 'Inter, sans-serif',
                  fontWeight: 400,
                  fontSize: '14px',
                  lineHeight: '20px',
                  letterSpacing: '-0.15px',
                  color: '#4F46E5',
                }}
              >
                Manage distribution of information to family and friends
              </span>
            </div>
            <div className="flex items-start gap-2">
              <Check className="w-4 h-4 mt-0.5 flex-shrink-0" style={{ color: '#4F46E5' }} />
              <span
                style={{
                  fontFamily: 'Inter, sans-serif',
                  fontWeight: 400,
                  fontSize: '14px',
                  lineHeight: '20px',
                  letterSpacing: '-0.15px',
                  color: '#4F46E5',
                }}
              >
                Ensure your wishes are carried out
              </span>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center justify-between">
          <button
            onClick={handleSkip}
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
            onClick={handleContinue}
            disabled={!firstName.trim() || !lastName.trim() || !email.trim() || !relationship || loading}
            className="flex items-center justify-center gap-2 text-white font-medium rounded-lg transition-all cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
            style={{
              width: '165px',
              height: '50px',
              background: firstName.trim() && lastName.trim() && email.trim() && relationship && !loading ? '#4F46E5' : '#9CA3AF',
              fontFamily: 'Inter, sans-serif',
              fontWeight: 500,
              fontSize: '14px',
              lineHeight: '20px',
              letterSpacing: '-0.15px',
              borderRadius: '8px',
            }}
          >
            {loading ? (
              <svg className="animate-spin h-5 w-5 text-white" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
              </svg>
            ) : (
              <>
                Continue
                <ArrowRight className="w-4 h-4" />
              </>
            )}
          </button>
        </div>

        {/* Helper Text */}
        <p
          className="text-center mt-4"
          style={{
            fontFamily: 'Inter, sans-serif',
            fontWeight: 400,
            fontSize: '14px',
            lineHeight: '20px',
            letterSpacing: '-0.15px',
            color: '#6A7282',
          }}
        >
          You can change your Release Manager anytime in settings
        </p>
      </div>
    </div>
  )
}
