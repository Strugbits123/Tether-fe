'use client'

import React, { useEffect, useRef, useState } from 'react'
import { ChevronDown, ChevronUp, Info, Upload, User, X } from 'lucide-react'

interface FinishProfileModalProps {
  open: boolean
  onClose: () => void
  onSave?: (data: ProfileFormData) => void
}

export interface ProfileFormData {
  firstName: string
  lastName: string
  zipCode: string
  state: string
  ageGroup: string
  gender: string
  status: string
  phone: string
  hearAbout: string
  photo: string | null
}

const STATES = [
  'Alabama', 'Alaska', 'Arizona', 'Arkansas', 'California', 'Colorado',
  'Connecticut', 'Delaware', 'Florida', 'Georgia', 'Hawaii', 'Idaho',
  'Illinois', 'Indiana', 'Iowa', 'Kansas', 'Kentucky', 'Louisiana',
  'Maine', 'Maryland', 'Massachusetts', 'Michigan', 'Minnesota', 'Mississippi',
  'Missouri', 'Montana', 'Nebraska', 'Nevada', 'New Hampshire', 'New Jersey',
  'New Mexico', 'New York', 'North Carolina', 'North Dakota', 'Ohio',
  'Oklahoma', 'Oregon', 'Pennsylvania', 'Rhode Island', 'South Carolina',
  'South Dakota', 'Tennessee', 'Texas', 'Utah', 'Vermont', 'Virginia',
  'Washington', 'West Virginia', 'Wisconsin', 'Wyoming',
  'American Samoa', 'Guam', 'Northern Mariana Islands', 'Puerto Rico',
  'U.S. Virgin Islands', 'Washington D.C.',
]

const AGE_GROUPS = ['18-29', '30-44', '45-59', '60+']
const GENDERS = ['Woman', 'Man', 'Non-binary']
const STATUSES = [
  'Single',
  'Married or partnered',
  'Married/partnered with children',
  'Single parent',
]
const HEAR_OPTIONS = [
  'From a friend or family member',
  'Online search',
  'Social media',
  'News article or podcast',
  'Advertisement',
  'Other',
]

export default function FinishProfileModal({ open, onClose, onSave }: FinishProfileModalProps) {
  const [firstName, setFirstName] = useState('')
  const [lastName, setLastName] = useState('')
  const [zipCode, setZipCode] = useState('')
  const [state, setState] = useState('')
  const [ageGroup, setAgeGroup] = useState('18-29')
  const [gender, setGender] = useState('Man')
  const [status, setStatus] = useState('Single')
  const [phone, setPhone] = useState('+1 5165321112')
  const [hearAbout, setHearAbout] = useState('From a friend or family member')
  const [photo, setPhoto] = useState<string | null>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const handlePickPhoto = () => fileInputRef.current?.click()
  const handlePhotoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    const reader = new FileReader()
    reader.onload = (ev) => {
      const result = ev.target?.result
      if (typeof result === 'string') setPhoto(result)
    }
    reader.readAsDataURL(file)
    e.target.value = ''
  }

  useEffect(() => {
    if (!open) return
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose()
    }
    document.addEventListener('keydown', onKey)
    const prevOverflow = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    return () => {
      document.removeEventListener('keydown', onKey)
      document.body.style.overflow = prevOverflow
    }
  }, [open, onClose])

  if (!open) return null

  const handleSave = () => {
    onSave?.({ firstName, lastName, zipCode, state, ageGroup, gender, status, phone, hearAbout, photo })
    onClose()
  }

  return (
    <div
      className="fixed inset-0 z-50 overflow-y-auto"
      style={{ background: 'rgba(0,0,0,0.4)' }}
      onMouseDown={(e) => {
        if (e.target === e.currentTarget) onClose()
      }}
    >
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        onChange={handlePhotoChange}
        className="hidden"
      />
      <div
        className="flex min-h-full items-center justify-center px-2 sm:px-4 py-4 sm:py-10"
        onMouseDown={(e) => {
          if (e.target === e.currentTarget) onClose()
        }}
      >
      <div
        className="relative bg-white w-full"
        style={{
          maxWidth: 700,
          borderRadius: 10,
          borderTop: '1px solid rgba(0,0,0,0.1)',
          boxShadow: '0px 4px 6px -4px rgba(0,0,0,0.1), 0px 10px 15px -3px rgba(0,0,0,0.1)',
          fontFamily: 'Inter, sans-serif',
        }}
      >
        {/* Close button */}
        <button
          type="button"
          onClick={onClose}
          aria-label="Close"
          className="absolute flex items-center justify-center hover:opacity-100 cursor-pointer top-4 right-4 sm:top-[26px] sm:right-6"
          style={{
            width: 22,
            height: 22,
            opacity: 0.7,
            borderRadius: 2.74,
          }}
        >
          <X className="w-[22px] h-[22px] text-[#0A0A0A]" strokeWidth={2} />
        </button>

        {/* Header */}
        <div className="pt-6 sm:pt-[37px] px-4 sm:px-6 pr-12 sm:pr-14">
          <h2
            style={{
              fontFamily: 'Inter, sans-serif',
              fontWeight: 600,
              fontSize: 23,
              lineHeight: '28px',
              letterSpacing: '-0.45px',
              color: '#101828',
            }}
          >
            Finish Your Profile
          </h2>
          <p
            className="mt-2"
            style={{
              fontFamily: 'Inter, sans-serif',
              fontWeight: 400,
              fontSize: 14,
              lineHeight: '20px',
              letterSpacing: '-0.15px',
              color: '#717182',
            }}
          >
            Answer the questions below so Tether can provide the best experience possible.
          </p>
        </div>

        {/* Body */}
        <div className="flex flex-col gap-5 px-4 sm:px-6 pt-6 pb-4">
          {/* Profile photo row */}
          <div
            className="flex items-center gap-4"
            style={{ borderBottom: '1px solid rgba(0,0,0,0.1)', paddingBottom: 16 }}
          >
            <button
              type="button"
              onClick={handlePickPhoto}
              className="relative flex-shrink-0 cursor-pointer"
              style={{ width: 80, height: 80 }}
              aria-label="Upload profile photo"
            >
              <div
                className="flex items-center justify-center w-full h-full rounded-full overflow-hidden"
                style={{ background: '#4F46E5' }}
              >
                {photo ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={photo}
                    alt="Profile"
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <User className="text-white" style={{ width: 40, height: 40 }} strokeWidth={2} />
                )}
              </div>
              <span
                className="absolute flex items-center justify-center rounded-full pointer-events-none"
                style={{
                  width: 28,
                  height: 28,
                  bottom: 0,
                  right: 0,
                  background: '#FFFFFF',
                  border: '2px solid #4F46E5',
                  boxShadow: '0px 4px 6px -4px rgba(0,0,0,0.1), 0px 10px 15px -3px rgba(0,0,0,0.1)',
                }}
              >
                <Upload style={{ width: 14, height: 14, color: '#4F46E5' }} strokeWidth={2} />
              </span>
            </button>
            <div className="flex flex-col min-w-0">
              <span
                style={{
                  fontFamily: 'Inter, sans-serif',
                  fontWeight: 600,
                  fontSize: 16,
                  lineHeight: '24px',
                  color: '#101828',
                }}
              >
                Profile Photo
              </span>
              <button
                type="button"
                onClick={handlePickPhoto}
                className="mt-2 cursor-pointer hover:bg-gray-50"
                style={{
                  width: 114,
                  height: 32,
                  borderRadius: 8,
                  border: '1px solid rgba(0,0,0,0.1)',
                  background: '#FFFFFF',
                  fontFamily: 'Inter, sans-serif',
                  fontWeight: 500,
                  fontSize: 14,
                  lineHeight: '20px',
                  color: '#0A0A0A',
                }}
              >
                {photo ? 'Change Photo' : 'Upload Photo'}
              </button>
            </div>
          </div>

          {/* Basic Information */}
          <div
            className="flex flex-col gap-3"
            style={{ borderBottom: '1px solid rgba(0,0,0,0.1)', paddingBottom: 20 }}
          >
            <h3
              style={{
                fontFamily: 'Inter, sans-serif',
                fontWeight: 600,
                fontSize: 16,
                lineHeight: '24px',
                color: '#101828',
              }}
            >
              Basic Information
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <FieldLabel label="First Name" required>
                <TextInput value={firstName} onChange={setFirstName} placeholder="Enter first name" />
              </FieldLabel>
              <FieldLabel label="Last Name" required>
                <TextInput value={lastName} onChange={setLastName} placeholder="Enter last name" />
              </FieldLabel>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <FieldLabel label="Zip Code" required>
                <TextInput value={zipCode} onChange={setZipCode} placeholder="Enter zip code" />
              </FieldLabel>
              <FieldLabel label="State" required>
                <StateDropdown value={state} onChange={setState} />
              </FieldLabel>
            </div>
          </div>

          {/* Age Group */}
          <div
            className="flex flex-col gap-2"
            style={{ borderBottom: '1px solid rgba(0,0,0,0.1)', paddingBottom: 20 }}
          >
            <FieldLabelInline label="Age Group" required />
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              {AGE_GROUPS.map((g) => (
                <RadioPill key={g} label={g} selected={ageGroup === g} onClick={() => setAgeGroup(g)} />
              ))}
            </div>
          </div>

          {/* Gender Identity */}
          <div
            className="flex flex-col gap-2"
            style={{ borderBottom: '1px solid rgba(0,0,0,0.1)', paddingBottom: 20 }}
          >
            <FieldLabelInline label="Gender Identity" required />
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              {GENDERS.map((g) => (
                <RadioPill key={g} label={g} selected={gender === g} onClick={() => setGender(g)} />
              ))}
            </div>
          </div>

          {/* Status */}
          <div
            className="flex flex-col gap-2"
            style={{ borderBottom: '1px solid rgba(0,0,0,0.1)', paddingBottom: 20 }}
          >
            <div className="flex items-center gap-1">
              <FieldLabelInline label="Status" required />
              <Info className="w-4 h-4 text-[#717182]" />
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {STATUSES.map((s) => (
                <RadioPill key={s} label={s} selected={status === s} onClick={() => setStatus(s)} />
              ))}
            </div>
          </div>

          {/* Contact Information */}
          <div className="flex flex-col gap-2" style={{ paddingBottom: 4 }}>
            <h3
              style={{
                fontFamily: 'Inter, sans-serif',
                fontWeight: 600,
                fontSize: 16,
                lineHeight: '24px',
                color: '#101828',
              }}
            >
              Contact Information
            </h3>
            <div>
              <div className="flex items-center gap-1.5 mb-1.5">
                <span
                  style={{
                    fontFamily: 'Inter, sans-serif',
                    fontWeight: 500,
                    fontSize: 14,
                    lineHeight: '14px',
                    color: '#0A0A0A',
                  }}
                >
                  Mobile Phone Number
                </span>
                <span
                  style={{
                    fontFamily: 'Inter, sans-serif',
                    fontWeight: 400,
                    fontSize: 14,
                    lineHeight: '14px',
                    color: '#717182',
                  }}
                >
                  (Recommended)
                </span>
              </div>
              <input
                type="tel"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="+1 555 000 0000"
                className="w-full focus:outline-none"
                style={{
                  height: 36,
                  borderRadius: 8,
                  border: '1px solid rgba(0,0,0,0.1)',
                  background: '#F3F3F5',
                  padding: '4px 12px',
                  fontFamily: 'Inter, sans-serif',
                  fontWeight: 400,
                  fontSize: 14,
                  lineHeight: '20px',
                  color: '#0A0A0A',
                }}
              />
              <p
                className="mt-2"
                style={{
                  fontFamily: 'Inter, sans-serif',
                  fontWeight: 400,
                  fontSize: 12,
                  lineHeight: '16px',
                  color: '#717182',
                }}
              >
                We&apos;ll use this for important account notifications. See our Privacy Policy for additional details.
              </p>
            </div>
          </div>

          {/* How did you hear about Tether? */}
          <div className="flex flex-col gap-2">
            <div className="flex items-center gap-0.5">
              <span
                style={{
                  fontFamily: 'Inter, sans-serif',
                  fontWeight: 500,
                  fontSize: 14,
                  lineHeight: '14px',
                  color: '#0A0A0A',
                }}
              >
                How did you hear about Tether?
              </span>
              <span style={{ color: '#FB2C36', fontSize: 14, lineHeight: '14px' }}>*</span>
            </div>
            <HearAboutDropdown value={hearAbout} onChange={setHearAbout} />
          </div>
        </div>

        {/* Footer */}
        <div
          className="flex flex-wrap items-center justify-end gap-3 px-4 sm:px-10 py-[15px]"
          style={{
            background: '#F9FAFB',
            borderTop: '0.8px solid #E5E7EB',
            borderBottomLeftRadius: 10,
            borderBottomRightRadius: 10,
          }}
        >
          <button
            type="button"
            onClick={onClose}
            className="cursor-pointer hover:bg-gray-50"
            style={{
              height: 36,
              padding: '7.8px 15.8px',
              borderRadius: 8,
              border: '1px solid rgba(0,0,0,0.1)',
              background: '#FFFFFF',
              fontFamily: 'Inter, sans-serif',
              fontWeight: 500,
              fontSize: 13.2,
              lineHeight: '20px',
              color: '#0A0A0A',
            }}
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={handleSave}
            className="cursor-pointer hover:opacity-90"
            style={{
              width: 158,
              height: 36,
              padding: '8px 16px',
              borderRadius: 8,
              background: '#4F46E5',
              fontFamily: 'Inter, sans-serif',
              fontWeight: 500,
              fontSize: 14,
              lineHeight: '20px',
              color: '#FFFFFF',
            }}
          >
            Save and Continue
          </button>
        </div>
      </div>
      </div>
    </div>
  )
}

/* ------------------------ Sub-components ------------------------ */

function FieldLabel({
  label,
  required,
  children,
}: {
  label: string
  required?: boolean
  children: React.ReactNode
}) {
  return (
    <div className="flex flex-col gap-2">
      <div className="flex items-center gap-0.5">
        <span
          style={{
            fontFamily: 'Inter, sans-serif',
            fontWeight: 500,
            fontSize: 14,
            lineHeight: '14px',
            color: '#0A0A0A',
          }}
        >
          {label}
        </span>
        {required && (
          <span style={{ color: '#FB2C36', fontSize: 14, lineHeight: '14px' }}>*</span>
        )}
      </div>
      {children}
    </div>
  )
}

function FieldLabelInline({ label, required }: { label: string; required?: boolean }) {
  return (
    <div className="flex items-center gap-0.5">
      <span
        style={{
          fontFamily: 'Inter, sans-serif',
          fontWeight: 500,
          fontSize: 14,
          lineHeight: '14px',
          color: '#0A0A0A',
        }}
      >
        {label}
      </span>
      {required && (
        <span style={{ color: '#FB2C36', fontSize: 14, lineHeight: '14px' }}>*</span>
      )}
    </div>
  )
}

function TextInput({
  value,
  onChange,
  placeholder,
}: {
  value: string
  onChange: (v: string) => void
  placeholder: string
}) {
  return (
    <input
      type="text"
      value={value}
      onChange={(e) => onChange(e.target.value)}
      placeholder={placeholder}
      className="w-full focus:outline-none"
      style={{
        height: 36,
        borderRadius: 8,
        border: '1px solid rgba(0,0,0,0.1)',
        background: '#F3F3F5',
        padding: '4px 12px',
        fontFamily: 'Inter, sans-serif',
        fontWeight: 400,
        fontSize: 14,
        lineHeight: '20px',
        color: '#0A0A0A',
      }}
    />
  )
}

function RadioPill({
  label,
  selected,
  onClick,
}: {
  label: string
  selected: boolean
  onClick: () => void
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="flex items-center justify-center gap-2 cursor-pointer transition-colors w-full min-w-0"
      style={{
        minHeight: 44,
        borderRadius: 10,
        border: selected ? '2px solid #4F46E5' : '2px solid #E5E7EB',
        background: selected ? '#E0E7FF' : '#FFFFFF',
        padding: '8px 10px',
      }}
    >
      <span
        className="flex items-center justify-center rounded-full flex-shrink-0"
        style={{
          width: 16,
          height: 16,
          background: '#FFFFFF',
          border: selected ? '1px solid #4F46E5' : '1px solid rgba(0,0,0,0.2)',
          boxShadow: '0px 1px 2px 0px rgba(0,0,0,0.05)',
        }}
      >
        {selected && (
          <span
            style={{
              width: 6.67,
              height: 6.67,
              borderRadius: '50%',
              background: '#4F46E5',
            }}
          />
        )}
      </span>
      <span
        className="min-w-0 text-center break-words"
        style={{
          fontFamily: 'Inter, sans-serif',
          fontWeight: 500,
          fontSize: 14,
          lineHeight: '18px',
          color: '#0A0A0A',
        }}
      >
        {label}
      </span>
    </button>
  )
}

function StateDropdown({ value, onChange }: { value: string; onChange: (v: string) => void }) {
  const [open, setOpen] = useState(false)
  const ref = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const onClickOutside = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false)
    }
    document.addEventListener('mousedown', onClickOutside)
    return () => document.removeEventListener('mousedown', onClickOutside)
  }, [])

  return (
    <div ref={ref} className="relative">
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        className="w-full flex items-center justify-between focus:outline-none"
        style={{
          height: 36,
          borderRadius: 8,
          border: '1px solid rgba(0,0,0,0.1)',
          background: '#F3F3F5',
          padding: '4px 12px',
          fontFamily: 'Inter, sans-serif',
          fontWeight: 400,
          fontSize: 14,
          lineHeight: '20px',
          color: value ? '#0A0A0A' : '#717182',
        }}
      >
        <span className="truncate">{value || 'Select state'}</span>
        {open ? (
          <ChevronUp style={{ width: 12, height: 12, color: '#717182' }} />
        ) : (
          <ChevronDown style={{ width: 12, height: 12, color: '#717182' }} />
        )}
      </button>
      {open && (
        <div
          className="absolute z-10 w-full mt-1 overflow-hidden"
          style={{
            background: '#FFFFFF',
            borderRadius: 8,
            border: '1px solid rgba(0,0,0,0.1)',
            boxShadow: '0 4px 12px rgba(0,0,0,0.08)',
          }}
        >
          <div className="max-h-60 overflow-y-auto">
            {STATES.map((s) => (
              <button
                key={s}
                type="button"
                onClick={() => {
                  onChange(s)
                  setOpen(false)
                }}
                className="w-full text-left hover:bg-[#F3F4F6]"
                style={{
                  padding: '8px 12px',
                  fontFamily: 'Inter, sans-serif',
                  fontWeight: 400,
                  fontSize: 14,
                  lineHeight: '20px',
                  color: '#374151',
                }}
              >
                {s}
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}

function HearAboutDropdown({ value, onChange }: { value: string; onChange: (v: string) => void }) {
  const [open, setOpen] = useState(false)
  const ref = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const onClickOutside = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false)
    }
    document.addEventListener('mousedown', onClickOutside)
    return () => document.removeEventListener('mousedown', onClickOutside)
  }, [])

  return (
    <div ref={ref} className="relative">
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        className="w-full flex items-center justify-between focus:outline-none"
        style={{
          height: 36,
          borderRadius: 8,
          border: '1px solid rgba(0,0,0,0.1)',
          background: '#F9FAFB',
          padding: '8px 12px',
          fontFamily: 'Inter, sans-serif',
          fontWeight: 500,
          fontSize: 14,
          lineHeight: '20px',
          color: '#0A0A0A',
        }}
      >
        <span className="truncate">{value}</span>
        {open ? (
          <ChevronUp style={{ width: 12, height: 12, color: '#717182' }} />
        ) : (
          <ChevronDown style={{ width: 12, height: 12, color: '#717182' }} />
        )}
      </button>
      {open && (
        <div
          className="absolute z-10 w-full mt-1 overflow-hidden"
          style={{
            background: '#FFFFFF',
            borderRadius: 8,
            border: '1px solid rgba(0,0,0,0.1)',
            boxShadow: '0 4px 12px rgba(0,0,0,0.08)',
          }}
        >
          <div className="max-h-60 overflow-y-auto">
            {HEAR_OPTIONS.map((o) => (
              <button
                key={o}
                type="button"
                onClick={() => {
                  onChange(o)
                  setOpen(false)
                }}
                className="w-full text-left hover:bg-[#F3F4F6]"
                style={{
                  padding: '8px 12px',
                  fontFamily: 'Inter, sans-serif',
                  fontWeight: 400,
                  fontSize: 14,
                  lineHeight: '20px',
                  color: '#374151',
                }}
              >
                {o}
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
