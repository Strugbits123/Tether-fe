'use client'

import React, { useEffect, useRef, useState } from 'react'
import { ChevronDown, ChevronUp, Loader2, ShieldCheck, X } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import { ApiError } from '@/lib/api/client'
import { useToast } from '@/lib/context/ToastContext'
import { createRecipient } from '@/lib/api/recipients'
import { toRecipientRelationship } from '@/lib/relationship'

interface AddRecipientsModalProps {
  open: boolean
  onClose: () => void
  /** Called after a recipient is successfully created on the backend. */
  onCreated?: () => void
  title?: string
  subtitle?: string | null
  bottomVariant?: 'note' | 'guardian'
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

export default function AddRecipientsModal({
  open,
  onClose,
  onCreated,
  title = 'Add a Recipients',
  subtitle = 'Recipients are the people who will receive access to your messages, photos, and documents when your Tether is released. You can add more in the Access page.',
  bottomVariant = 'note',
}: AddRecipientsModalProps) {
  const { showToast } = useToast()
  const [firstName, setFirstName] = useState('')
  const [lastName, setLastName] = useState('')
  const [email, setEmail] = useState('')
  const [phone, setPhone] = useState('')
  const [relationship, setRelationship] = useState('Family')
  const [note, setNote] = useState('')
  const [isGuardian, setIsGuardian] = useState(false)

  const [loading, setLoading] = useState(false)
  const [formError, setFormError] = useState<string | null>(null)
  const [emailError, setEmailError] = useState<string | null>(null)

  // Reset the form ONLY when the modal transitions to open — never on a
  // re-render or after an API error, so the user's input is preserved on failure.
  useEffect(() => {
    if (!open) return
    setFirstName('')
    setLastName('')
    setEmail('')
    setPhone('')
    setRelationship('Family')
    setNote('')
    setIsGuardian(false)
    setFormError(null)
    setEmailError(null)
    setLoading(false)
  }, [open])

  // Escape-to-close + scroll lock.
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

  const handleAdd = async () => {
    setFormError(null)
    setEmailError(null)
    if (!firstName.trim() || !lastName.trim() || !email.trim()) {
      setFormError('Please fill in the required fields.')
      return
    }

    const supabase = createClient()
    const {
      data: { session },
    } = await supabase.auth.getSession()
    const token = session?.access_token
    if (!token) {
      setFormError('Your session has expired. Please sign in again.')
      return
    }

    setLoading(true)
    try {
      await createRecipient(token, {
        firstName: firstName.trim(),
        lastName: lastName.trim(),
        email: email.trim().toLowerCase(),
        phone: phone.trim() || undefined,
        relationship: toRecipientRelationship(relationship),
        note: note.trim() || undefined,
      })
      showToast('Recipient added successfully', 'success')
      onCreated?.()
      onClose()
    } catch (error) {
      if (error instanceof ApiError && error.statusCode === 409) {
        setEmailError(
          'A recipient with this email address already exists on your account.',
        )
      } else {
        setFormError(
          error instanceof Error ? error.message : 'Could not add the recipient.',
        )
      }
    } finally {
      setLoading(false)
    }
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
          borderRadius: 10,
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
          className="absolute cursor-pointer top-5 right-5 sm:top-[22px] sm:right-6"
          style={{ width: 22, height: 22, opacity: 0.7, borderRadius: 2.74 }}
        >
          <X className="w-[22px] h-[22px] text-[#0A0A0A]" strokeWidth={2} />
        </button>

        {/* Header */}
        <div
          className="px-5 sm:px-6 pt-6 sm:pt-[22px] pb-5 pr-12 sm:pr-14"
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
            {title}
          </h2>
          {subtitle && (
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
              {subtitle}
            </p>
          )}
        </div>

        {/* Body */}
        <div className="flex flex-col gap-4 px-5 sm:px-6 py-6">
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
              onChange={(v) => {
                setEmail(v)
                if (emailError) setEmailError(null)
              }}
              placeholder="email@example.com"
              type="email"
              invalid={!!emailError}
            />
            {emailError && <FieldError message={emailError} />}
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

          {bottomVariant === 'note' ? (
            /* Note */
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
                Leave a note for the Recipient{' '}
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
          ) : (
            <GuardianBox checked={isGuardian} onToggle={() => setIsGuardian((v) => !v)} />
          )}
        </div>

        {/* Footer */}
        <div
          className="flex flex-col gap-2 px-5 sm:px-6 py-[15px]"
          style={{
            background: '#F9FAFB',
            borderTop: '0.8px solid #E5E7EB',
            borderBottomLeftRadius: 10,
            borderBottomRightRadius: 10,
          }}
        >
          {formError && <FieldError message={formError} />}
          <div className="flex flex-wrap items-center justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
              disabled={loading}
              className="cursor-pointer hover:bg-gray-50 disabled:opacity-60"
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
              disabled={loading}
              className="flex items-center justify-center gap-2 cursor-pointer hover:opacity-90 disabled:opacity-80 disabled:cursor-not-allowed"
              style={{
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
              {loading && <Loader2 className="w-4 h-4 animate-spin" />}
              {loading ? 'Adding…' : 'Add Recipients'}
            </button>
          </div>
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

function GuardianBox({
  checked,
  onToggle,
}: {
  checked: boolean
  onToggle: () => void
}) {
  return (
    <div
      className="flex items-start gap-3"
      style={{
        borderRadius: 10,
        border: '1px solid #E9D4FF',
        background: '#FAF5FF',
        padding: '16px',
        gap: 12,
      }}
    >
      <ShieldCheck
        style={{ width: 20, height: 22, color: '#9810FA', flexShrink: 0, marginTop: 2 }}
        strokeWidth={2}
      />
      <button
        type="button"
        onClick={onToggle}
        aria-pressed={checked}
        aria-label="Select as Guardian"
        className="flex items-center justify-center flex-shrink-0 cursor-pointer mt-1"
        style={{
          width: 16,
          height: 16,
          borderRadius: 2.5,
          border: checked ? '1px solid #9810FA' : '1px solid #767676',
          background: checked ? '#9810FA' : '#FFFFFF',
        }}
      >
        {checked && (
          <svg width="10" height="10" viewBox="0 0 10 10" fill="none" aria-hidden>
            <path
              d="M2 5l2 2 4-4"
              stroke="#FFFFFF"
              strokeWidth="1.6"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        )}
      </button>
      <button
        type="button"
        onClick={onToggle}
        className="flex flex-col flex-1 min-w-0 text-left cursor-pointer"
        style={{ gap: 4 }}
      >
        <span
          style={{
            fontFamily: 'Inter, sans-serif',
            fontWeight: 500,
            fontSize: 14.9,
            lineHeight: '24px',
            color: '#59168B',
          }}
        >
          Select as Guardian
        </span>
        <span
          style={{
            fontFamily: 'Inter, sans-serif',
            fontWeight: 500,
            fontSize: 13.2,
            lineHeight: '20px',
            color: '#6E11B0',
          }}
        >
          A Guardian acts as a backup Release Manager if your primary Release Manager
          is unavailable. You can add up to 2 Guardians.
        </span>
      </button>
    </div>
  )
}

function FieldError({ message }: { message: string }) {
  return (
    <p
      style={{
        fontFamily: 'Inter, sans-serif',
        fontWeight: 400,
        fontSize: 13,
        lineHeight: '18px',
        color: '#FB2C36',
      }}
    >
      {message}
    </p>
  )
}

function TextInput({
  value,
  onChange,
  placeholder,
  type = 'text',
  invalid,
}: {
  value: string
  onChange: (v: string) => void
  placeholder: string
  type?: string
  invalid?: boolean
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
        border: invalid ? '1px solid #FB2C36' : '1px solid rgba(0,0,0,0.1)',
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
