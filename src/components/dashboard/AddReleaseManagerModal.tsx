'use client'

import React, { useEffect, useRef, useState } from 'react'
import { ChevronDown, ChevronUp, X } from 'lucide-react'

interface AddReleaseManagerModalProps {
  open: boolean
  onClose: () => void
  onSave?: (data: ReleaseManagerData) => void
}

export interface ReleaseManagerData {
  firstName: string
  lastName: string
  email: string
  phone: string
  relationship: string
  note: string
}

const RELATIONSHIP_OPTIONS = [
  'Family',
  'Spouse',
  'Child',
  'Parent',
  'Sibling',
  'Friend',
  'Colleague',
  'Lawyer',
  'Other',
]

export default function AddReleaseManagerModal({
  open,
  onClose,
  onSave,
}: AddReleaseManagerModalProps) {
  const [firstName, setFirstName] = useState('')
  const [lastName, setLastName] = useState('')
  const [email, setEmail] = useState('')
  const [phone, setPhone] = useState('')
  const [relationship, setRelationship] = useState('Family')
  const [note, setNote] = useState('')

  useEffect(() => {
    if (!open) return
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose()
    }
    document.addEventListener('keydown', onKey)
    const prev = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    return () => {
      document.removeEventListener('keydown', onKey)
      document.body.style.overflow = prev
    }
  }, [open, onClose])

  if (!open) return null

  const handleAdd = () => {
    onSave?.({ firstName, lastName, email, phone, relationship, note })
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
      <div
        className="flex min-h-full items-center justify-center px-2 sm:px-4 py-4 sm:py-10"
        onMouseDown={(e) => {
          if (e.target === e.currentTarget) onClose()
        }}
      >
      <div
        className="relative bg-white w-full"
        style={{
          maxWidth: 448,
          borderRadius: 16,
          boxShadow:
            '0px 8px 10px -6px rgba(0,0,0,0.1), 0px 20px 25px -5px rgba(0,0,0,0.1)',
          fontFamily: 'Inter, sans-serif',
        }}
      >
        {/* Close button */}
        <button
          type="button"
          onClick={onClose}
          aria-label="Close"
          className="absolute cursor-pointer top-5 right-5 sm:top-[27px] sm:right-6"
          style={{ width: 22, height: 22, opacity: 0.7, borderRadius: 2.74 }}
        >
          <X className="w-[22px] h-[22px] text-[#0A0A0A]" strokeWidth={2} />
        </button>

        {/* Header */}
        <div
          className="px-5 sm:px-6 pt-6 sm:pt-[27px] pb-5 pr-12 sm:pr-14"
          style={{ borderBottom: '0.8px solid #E5E7EB' }}
        >
          <h2
            style={{
              fontFamily: 'Inter, sans-serif',
              fontWeight: 600,
              fontSize: 23,
              lineHeight: '28px',
              color: '#101828',
            }}
          >
            Add a Release Manager
          </h2>
          <p
            className="mt-[7px]"
            style={{
              fontFamily: 'Inter, sans-serif',
              fontWeight: 400,
              fontSize: 14,
              lineHeight: '20px',
              letterSpacing: '-0.15px',
              color: '#717182',
            }}
          >
            Your Release Manager is the trusted person who activates your Release Plan when the time
            comes.
          </p>
        </div>

        {/* Body */}
        <div className="flex flex-col gap-4 px-5 sm:px-6 pt-[15px] pb-5">
          {/* First / Last name */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Field label="First Name" required>
              <TextInput value={firstName} onChange={setFirstName} placeholder="Enter first Name" />
            </Field>
            <Field label="Last Name" required>
              <TextInput value={lastName} onChange={setLastName} placeholder="Enter last name" />
            </Field>
          </div>

          {/* Email */}
          <Field label="Email" required>
            <TextInput
              value={email}
              onChange={setEmail}
              placeholder="email@example.com"
              type="email"
            />
          </Field>

          {/* Phone Number — no asterisk */}
          <Field label="Phone Number">
            <TextInput
              value={phone}
              onChange={setPhone}
              placeholder="+1 (555) 123-4567"
              type="tel"
            />
          </Field>

          {/* Relationship */}
          <Field label="Relationship" required>
            <RelationshipDropdown value={relationship} onChange={setRelationship} />
          </Field>

          {/* Note */}
          <div className="flex flex-col gap-1">
            <label
              style={{
                fontFamily: 'Inter, sans-serif',
                fontWeight: 500,
                fontSize: 14,
                lineHeight: '14px',
                letterSpacing: '-0.15px',
                color: '#0A0A0A',
              }}
            >
              Leave a note for the Release Manager
              <span style={{ color: '#0A0A0A', fontWeight: 500 }}>(Recommended)</span>
            </label>
            <textarea
              value={note}
              onChange={(e) => setNote(e.target.value)}
              placeholder="short message to the recipient"
              rows={3}
              className="w-full focus:outline-none resize-none"
              style={{
                minHeight: 68,
                borderRadius: 8,
                border: '1.25px solid rgba(0,0,0,0.1)',
                background: '#F3F3F5',
                padding: '12px',
                fontFamily: 'Inter, sans-serif',
                fontWeight: 400,
                fontSize: 14,
                lineHeight: '20px',
                letterSpacing: '-0.15px',
                color: '#0A0A0A',
                boxShadow: '0px 0px 0px 0.14px rgba(161,161,161,0.025)',
              }}
            />
          </div>

          {/* Tip box */}
          <div
            style={{
              borderRadius: 10,
              border: '1.33px solid #E0E7FF',
              background: '#EEF2FF',
              padding: '14px 16px',
            }}
          >
            <p
              style={{
                fontFamily: 'Inter, sans-serif',
                fontSize: 14,
                lineHeight: '20px',
                letterSpacing: '-0.15px',
                color: '#432DD7',
                fontWeight: 400,
              }}
            >
              <span style={{ fontWeight: 700 }}>Tip:</span> Tip: Choose someone reliable, such as a
              close friend, attorney, or trusted family member. This person will receive an email
              invitation and must accept the role before it becomes active.
            </p>
          </div>
        </div>

        {/* Footer */}
        <div
          className="flex flex-wrap items-center justify-end gap-3 px-5 sm:px-6 py-[15px]"
          style={{
            background: '#F9FAFB',
            borderTop: '0.8px solid #E5E7EB',
            borderBottomLeftRadius: 16,
            borderBottomRightRadius: 16,
          }}
        >
          <button
            type="button"
            onClick={onClose}
            className="cursor-pointer hover:bg-gray-50"
            style={{
              width: 77.6,
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
            onClick={handleAdd}
            className="cursor-pointer hover:opacity-90"
            style={{
              width: 80,
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
            Add
          </button>
        </div>
      </div>
      </div>
    </div>
  )
}

/* ------------------- Sub components ------------------- */

function Field({
  label,
  required,
  children,
}: {
  label: string
  required?: boolean
  children: React.ReactNode
}) {
  return (
    <div className="flex flex-col gap-1">
      <div className="flex items-center gap-0.5">
        <span
          style={{
            fontFamily: 'Inter, sans-serif',
            fontWeight: 500,
            fontSize: 14,
            lineHeight: '14px',
            letterSpacing: '-0.15px',
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

function TextInput({
  value,
  onChange,
  placeholder,
  type = 'text',
}: {
  value: string
  onChange: (v: string) => void
  placeholder: string
  type?: string
}) {
  return (
    <input
      type={type}
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
        letterSpacing: '-0.15px',
        color: '#0A0A0A',
      }}
    />
  )
}

function RelationshipDropdown({
  value,
  onChange,
}: {
  value: string
  onChange: (v: string) => void
}) {
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
        className="w-full flex items-center justify-between focus:outline-none bg-white"
        style={{
          height: 41.2,
          borderRadius: 8,
          border: '1px solid #D1D5DC',
          padding: '7.8px 15.8px',
          fontFamily: 'Inter, sans-serif',
          fontWeight: 500,
          fontSize: 14,
          lineHeight: '20px',
          color: value ? '#101828' : '#717182',
        }}
      >
        <span className="truncate">{value || 'Select relationship'}</span>
        {open ? (
          <ChevronUp className="w-5 h-5 text-[#717182] flex-shrink-0" />
        ) : (
          <ChevronDown className="w-5 h-5 text-[#717182] flex-shrink-0" />
        )}
      </button>
      {open && (
        <div
          className="absolute z-10 w-full mt-1 overflow-hidden"
          style={{
            background: '#FFFFFF',
            borderRadius: 8,
            border: '1px solid #D1D5DC',
            boxShadow: '0 4px 12px rgba(0,0,0,0.08)',
          }}
        >
          <div className="max-h-60 overflow-y-auto">
            {RELATIONSHIP_OPTIONS.map((o) => (
              <button
                key={o}
                type="button"
                onClick={() => {
                  onChange(o)
                  setOpen(false)
                }}
                className="w-full text-left hover:bg-[#F3F4F6]"
                style={{
                  padding: '8px 16px',
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
