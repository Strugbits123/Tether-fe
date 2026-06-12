'use client'

import React, { useEffect, useRef, useState } from 'react'
import { ChevronDown, ChevronUp, Info, Loader2, Upload, User, X } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import { useToast } from '@/lib/context/ToastContext'
import { getMe, updateProfile, getAvatarUploadUrl } from '@/lib/api/users'

interface FinishProfileModalProps {
  open: boolean
  onClose: () => void
  /** Called after the profile is successfully saved on the backend. */
  onCompleted?: () => void
  /** Skip this onboarding step without saving. */
  onSkip?: () => void
  /** Overrides the secondary (left) button label. Defaults to Skip/Cancel. */
  cancelLabel?: string
}

// State display name <-> 2-letter code (the API stores/returns the code).
const STATE_TO_CODE: Record<string, string> = {
  Alabama: 'AL', Alaska: 'AK', Arizona: 'AZ', Arkansas: 'AR', California: 'CA',
  Colorado: 'CO', Connecticut: 'CT', Delaware: 'DE', Florida: 'FL', Georgia: 'GA',
  Hawaii: 'HI', Idaho: 'ID', Illinois: 'IL', Indiana: 'IN', Iowa: 'IA',
  Kansas: 'KS', Kentucky: 'KY', Louisiana: 'LA', Maine: 'ME', Maryland: 'MD',
  Massachusetts: 'MA', Michigan: 'MI', Minnesota: 'MN', Mississippi: 'MS',
  Missouri: 'MO', Montana: 'MT', Nebraska: 'NE', Nevada: 'NV',
  'New Hampshire': 'NH', 'New Jersey': 'NJ', 'New Mexico': 'NM', 'New York': 'NY',
  'North Carolina': 'NC', 'North Dakota': 'ND', Ohio: 'OH', Oklahoma: 'OK',
  Oregon: 'OR', Pennsylvania: 'PA', 'Rhode Island': 'RI', 'South Carolina': 'SC',
  'South Dakota': 'SD', Tennessee: 'TN', Texas: 'TX', Utah: 'UT', Vermont: 'VT',
  Virginia: 'VA', Washington: 'WA', 'West Virginia': 'WV', Wisconsin: 'WI',
  Wyoming: 'WY', 'American Samoa': 'AS', Guam: 'GU',
  'Northern Mariana Islands': 'MP', 'Puerto Rico': 'PR',
  'U.S. Virgin Islands': 'VI', 'Washington D.C.': 'DC',
}
const CODE_TO_STATE: Record<string, string> = Object.fromEntries(
  Object.entries(STATE_TO_CODE).map(([name, code]) => [code, name]),
)
const STATES = Object.keys(STATE_TO_CODE)

const AGE_GROUPS = ['18-29', '30-44', '45-59', '60+']

const GENDERS = ['Woman', 'Man', 'Non-binary']
const GENDER_TO_VALUE: Record<string, string> = {
  Woman: 'woman',
  Man: 'man',
  'Non-binary': 'non-binary',
}
const GENDER_TO_LABEL: Record<string, string> = Object.fromEntries(
  Object.entries(GENDER_TO_VALUE).map(([label, value]) => [value, label]),
)

const STATUSES = [
  'Single',
  'Married or partnered',
  'Married/partnered with children',
  'Single parent',
]
const STATUS_TO_VALUE: Record<string, string> = {
  Single: 'single',
  'Married or partnered': 'married_partnered',
  'Married/partnered with children': 'married_partnered_children',
  'Single parent': 'single_parent',
}
const STATUS_TO_LABEL: Record<string, string> = Object.fromEntries(
  Object.entries(STATUS_TO_VALUE).map(([label, value]) => [value, label]),
)
const HEAR_OPTIONS = [
  'From a friend or family member',
  'Online search',
  'Social media',
  'News article or podcast',
  'Advertisement',
  'Other',
]

export default function FinishProfileModal({ open, onClose, onCompleted, onSkip, cancelLabel }: FinishProfileModalProps) {
  const { showToast } = useToast()
  const [firstName, setFirstName] = useState('')
  const [lastName, setLastName] = useState('')
  const [zipCode, setZipCode] = useState('')
  const [state, setState] = useState('')
  const [ageGroup, setAgeGroup] = useState('')
  const [gender, setGender] = useState('')
  const [status, setStatus] = useState('')
  const [phone, setPhone] = useState('')
  const [hearAbout, setHearAbout] = useState('From a friend or family member')
  const [photo, setPhoto] = useState<string | null>(null)
  const [avatarFile, setAvatarFile] = useState<File | null>(null)
  const [submitting, setSubmitting] = useState(false)
  const [statusText, setStatusText] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({})
  const fileInputRef = useRef<HTMLInputElement>(null)

  const clearFieldError = (field: string) =>
    setFieldErrors((prev) => {
      if (!prev[field]) return prev
      const next = { ...prev }
      delete next[field]
      return next
    })

  const getToken = async () => {
    const supabase = createClient()
    const {
      data: { session },
    } = await supabase.auth.getSession()
    return session?.access_token ?? null
  }

  const handlePickPhoto = () => fileInputRef.current?.click()
  const handlePhotoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    e.target.value = ''
    if (!file) return
    if (file.size > 5 * 1024 * 1024) {
      showToast('Image must be under 5 MB', 'error')
      return
    }
    setAvatarFile(file)
    setPhoto((prev) => {
      if (prev && prev.startsWith('blob:')) URL.revokeObjectURL(prev)
      return URL.createObjectURL(file)
    })
  }

  // Pre-populate from the current user when the modal opens (works as both
  // first-time setup and an edit form). Resets transient state too.
  useEffect(() => {
    if (!open) return
    setError(null)
    setFieldErrors({})
    setSubmitting(false)
    setStatusText('')
    setAvatarFile(null)
    let active = true
    ;(async () => {
      const token = await getToken()
      if (!token) return
      try {
        const user = await getMe(token)
        if (!active) return
        setFirstName(user.first_name || '')
        setLastName(user.last_name || '')
        setZipCode(user.zip_code || '')
        setState(user.state ? CODE_TO_STATE[user.state] || '' : '')
        setAgeGroup(user.age_group || '')
        setGender(user.gender ? GENDER_TO_LABEL[user.gender] || '' : '')
        setStatus(
          user.relationship_status ? STATUS_TO_LABEL[user.relationship_status] || '' : '',
        )
        setPhone(user.phone_number || '')
        if (user.avatar_url) setPhoto(user.avatar_url)
      } catch {
        /* ignore — form starts empty */
      }
    })()
    return () => {
      active = false
    }
  }, [open])

  // Escape-to-close + scroll lock.
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

  // Revoke object URLs to avoid memory leaks.
  useEffect(() => {
    return () => {
      if (photo && photo.startsWith('blob:')) URL.revokeObjectURL(photo)
    }
  }, [photo])

  if (!open) return null

  const validate = (): boolean => {
    const errs: Record<string, string> = {}
    if (!firstName.trim()) errs.firstName = 'First name is required.'
    if (!lastName.trim()) errs.lastName = 'Last name is required.'
    if (!zipCode.trim()) errs.zipCode = 'Zip code is required.'
    else if (!/^\d{5}(-\d{4})?$/.test(zipCode.trim()))
      errs.zipCode = 'Enter a valid US zip code (e.g. 10001).'
    if (!state) errs.state = 'Please select your state.'
    if (!ageGroup) errs.ageGroup = 'Please select an age group.'
    if (!gender) errs.gender = 'Please select a gender identity.'
    if (!status) errs.status = 'Please select a status.'
    if (phone.trim() && !/^\+?[\d\s()-]{7,20}$/.test(phone.trim()))
      errs.phone = 'Enter a valid phone number.'
    setFieldErrors(errs)
    return Object.keys(errs).length === 0
  }

  const handleSave = async () => {
    if (submitting) return
    setError(null)
    if (!validate()) return
    const token = await getToken()
    if (!token) {
      setError('Session expired. Please sign in again.')
      return
    }

    setSubmitting(true)
    try {
      let avatarUrl: string | undefined
      if (avatarFile) {
        setStatusText('Uploading photo…')
        const { signedUploadUrl, publicUrl } = await getAvatarUploadUrl(token, avatarFile.type)
        const uploadRes = await fetch(signedUploadUrl, {
          method: 'PUT',
          body: avatarFile,
          headers: { 'Content-Type': avatarFile.type },
        })
        if (!uploadRes.ok) {
          throw new Error('Failed to upload profile photo. Please try again.')
        }
        avatarUrl = publicUrl
      }

      setStatusText('Saving profile…')
      await updateProfile(token, {
        first_name: firstName.trim(),
        last_name: lastName.trim(),
        zip_code: zipCode.trim() || undefined,
        state: state ? STATE_TO_CODE[state] || undefined : undefined,
        age_group: ageGroup || undefined,
        gender: gender ? GENDER_TO_VALUE[gender] || undefined : undefined,
        relationship_status: status ? STATUS_TO_VALUE[status] || undefined : undefined,
        phone_number: phone.trim() || undefined,
        ...(avatarUrl ? { avatar_url: avatarUrl } : {}),
      })

      showToast('Profile updated!', 'success')
      onCompleted?.()
      onClose()
    } catch (err) {
      setError(
        err instanceof Error ? err.message : 'Something went wrong. Please try again.',
      )
    } finally {
      setSubmitting(false)
      setStatusText('')
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
      <input
        ref={fileInputRef}
        type="file"
        accept="image/jpeg,image/png,image/webp,image/heic"
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
              <FieldLabel label="First Name" required error={fieldErrors.firstName}>
                <TextInput
                  value={firstName}
                  onChange={(v) => {
                    setFirstName(v)
                    clearFieldError('firstName')
                  }}
                  placeholder="Enter first name"
                  invalid={!!fieldErrors.firstName}
                />
              </FieldLabel>
              <FieldLabel label="Last Name" required error={fieldErrors.lastName}>
                <TextInput
                  value={lastName}
                  onChange={(v) => {
                    setLastName(v)
                    clearFieldError('lastName')
                  }}
                  placeholder="Enter last name"
                  invalid={!!fieldErrors.lastName}
                />
              </FieldLabel>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <FieldLabel label="Zip Code" required error={fieldErrors.zipCode}>
                <TextInput
                  value={zipCode}
                  onChange={(v) => {
                    setZipCode(v)
                    clearFieldError('zipCode')
                  }}
                  placeholder="Enter zip code"
                  invalid={!!fieldErrors.zipCode}
                />
              </FieldLabel>
              <FieldLabel label="State" required error={fieldErrors.state}>
                <StateDropdown
                  value={state}
                  onChange={(v) => {
                    setState(v)
                    clearFieldError('state')
                  }}
                  invalid={!!fieldErrors.state}
                />
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
                <RadioPill
                  key={g}
                  label={g}
                  selected={ageGroup === g}
                  onClick={() => {
                    setAgeGroup(g)
                    clearFieldError('ageGroup')
                  }}
                />
              ))}
            </div>
            {fieldErrors.ageGroup && <FieldError message={fieldErrors.ageGroup} />}
          </div>

          {/* Gender Identity */}
          <div
            className="flex flex-col gap-2"
            style={{ borderBottom: '1px solid rgba(0,0,0,0.1)', paddingBottom: 20 }}
          >
            <FieldLabelInline label="Gender Identity" required />
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              {GENDERS.map((g) => (
                <RadioPill
                  key={g}
                  label={g}
                  selected={gender === g}
                  onClick={() => {
                    setGender(g)
                    clearFieldError('gender')
                  }}
                />
              ))}
            </div>
            {fieldErrors.gender && <FieldError message={fieldErrors.gender} />}
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
                <RadioPill
                  key={s}
                  label={s}
                  selected={status === s}
                  onClick={() => {
                    setStatus(s)
                    clearFieldError('status')
                  }}
                />
              ))}
            </div>
            {fieldErrors.status && <FieldError message={fieldErrors.status} />}
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
                onChange={(e) => {
                  setPhone(e.target.value)
                  clearFieldError('phone')
                }}
                placeholder="+1 555 000 0000"
                className="w-full focus:outline-none"
                style={{
                  height: 36,
                  borderRadius: 8,
                  border: fieldErrors.phone
                    ? '1px solid #FB2C36'
                    : '1px solid rgba(0,0,0,0.1)',
                  background: '#F3F3F5',
                  padding: '4px 12px',
                  fontFamily: 'Inter, sans-serif',
                  fontWeight: 400,
                  fontSize: 14,
                  lineHeight: '20px',
                  color: '#0A0A0A',
                }}
              />
              {fieldErrors.phone && <FieldError message={fieldErrors.phone} />}
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
          className="flex flex-col gap-2 px-4 sm:px-10 py-[15px]"
          style={{
            background: '#F9FAFB',
            borderTop: '0.8px solid #E5E7EB',
            borderBottomLeftRadius: 10,
            borderBottomRightRadius: 10,
          }}
        >
          {error && (
            <p
              className="text-right"
              style={{
                fontFamily: 'Inter, sans-serif',
                fontWeight: 400,
                fontSize: 13,
                lineHeight: '18px',
                color: '#FB2C36',
              }}
            >
              {error}
            </p>
          )}
          <div className="flex flex-wrap items-center justify-end gap-3">
            <button
              type="button"
              onClick={onSkip ?? onClose}
              disabled={submitting}
              className="cursor-pointer hover:bg-gray-50 disabled:opacity-60"
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
              {cancelLabel ?? (onSkip ? 'Skip' : 'Cancel')}
            </button>
            <button
              type="button"
              onClick={handleSave}
              disabled={submitting || !firstName.trim() || !lastName.trim()}
              className="flex items-center justify-center gap-2 cursor-pointer hover:opacity-90 disabled:opacity-50 disabled:cursor-not-allowed"
              style={{
                minWidth: 158,
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
              {submitting && <Loader2 className="w-4 h-4 animate-spin" />}
              {submitting ? statusText || 'Saving…' : 'Save and Continue'}
            </button>
          </div>
        </div>
      </div>
      </div>
    </div>
  )
}

/* ------------------------ Sub-components ------------------------ */

function FieldError({ message }: { message: string }) {
  return (
    <p
      style={{
        fontFamily: 'Inter, sans-serif',
        fontWeight: 400,
        fontSize: 12.5,
        lineHeight: '16px',
        color: '#FB2C36',
      }}
    >
      {message}
    </p>
  )
}

function FieldLabel({
  label,
  required,
  error,
  children,
}: {
  label: string
  required?: boolean
  error?: string
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
      {error && <FieldError message={error} />}
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
  invalid,
}: {
  value: string
  onChange: (v: string) => void
  placeholder: string
  invalid?: boolean
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
        border: invalid ? '1px solid #FB2C36' : '1px solid rgba(0,0,0,0.1)',
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

function StateDropdown({
  value,
  onChange,
  invalid,
}: {
  value: string
  onChange: (v: string) => void
  invalid?: boolean
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
        className="w-full flex items-center justify-between focus:outline-none"
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
