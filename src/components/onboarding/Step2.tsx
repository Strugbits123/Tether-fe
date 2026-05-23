"use client"

import React, { useState } from 'react'
import { ArrowLeft, ArrowRight, Plus } from 'lucide-react'
import CustomSelect from './CustomSelect'
import { useRouter } from 'next/navigation'

interface Recipient {
  firstName: string
  lastName: string
  relationship: string
  email: string
}

interface Step2Props {
  onNext: (recipients: Recipient[]) => void
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

export default function Step2({ onNext, onBack, loading }: Step2Props) {
  const router = useRouter()
  const [recipients, setRecipients] = useState<Recipient[]>([])
  const [firstName, setFirstName] = useState('')
  const [lastName, setLastName] = useState('')
  const [relationship, setRelationship] = useState('')
  const [email, setEmail] = useState('')

  const handleAddPerson = () => {
    if (!firstName.trim() || !lastName.trim() || !relationship || !email.trim()) return

    setRecipients(prev => [
      ...prev,
      { firstName, lastName, relationship, email },
    ])

    setFirstName('')
    setLastName('')
    setRelationship('')
    setEmail('')
  }

  const handleContinue = () => {
    
    onNext(recipients)
  }

  const handleSkip = () => {
    onNext([])
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
            Add your recipients - family,
            <br />
            friends, whomever.
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
            Who should have access to your information when the time comes?
          </p>
        </div>

        {/* Form Card */}
        <div
          className="bg-white rounded-[14px] mb-6"
          style={{
            border: '1.25px solid rgba(0, 0, 0, 0.1)',
            padding: '24px',
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

            {/* Add Person Button */}
            <button
              onClick={handleAddPerson}
              disabled={!firstName.trim() || !lastName.trim() || !relationship || !email.trim()}
              className="w-full flex items-center justify-center gap-2 text-white font-medium rounded-lg transition-all cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
              style={{
                height: '45px',
                background: '#4F46E5',
                fontFamily: 'Inter, sans-serif',
                fontWeight: 500,
                fontSize: '14px',
                lineHeight: '20px',
                letterSpacing: '-0.15px',
                borderRadius: '8px',
              }}
            >
              <Plus className="w-4 h-4" />
              Add Person
            </button>
          </div>
        </div>

        {/* Added Recipients List */}
        {recipients.length > 0 && (
          <div className="space-y-2 mb-6">
            {recipients.map((r, i) => (
              <div
                key={i}
                className="flex items-center justify-between px-4 py-3 bg-white rounded-lg border border-[#E5E7EB]"
              >
                <div>
                  <span className="font-medium text-sm text-[#101828]">
                    {r.firstName} {r.lastName}
                  </span>
                  <span className="text-xs text-[#6A7282] ml-2">
                    ({r.relationship})
                  </span>
                </div>
                <button
                  onClick={() =>
                    setRecipients(prev => prev.filter((_, idx) => idx !== i))
                  }
                  className="text-red-500 text-xs hover:text-red-700 cursor-pointer"
                >
                  Remove
                </button>
              </div>
            ))}
          </div>
        )}

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
            disabled={recipients.length === 0 || loading}
            className="flex items-center justify-center gap-2 text-white font-medium rounded-lg transition-all cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
            style={{
              width: '165px',
              height: '50px',
              background: recipients.length > 0 && !loading ? '#4F46E5' : '#9CA3AF',
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
      </div>
    </div>
  )
}
