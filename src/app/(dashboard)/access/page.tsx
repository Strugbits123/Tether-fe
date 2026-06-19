'use client'

import { useCallback, useEffect, useMemo, useState } from 'react'
import Image from 'next/image'
import {
  ChevronDown,
  ChevronUp,
  Info,
  Lock,
  Plus,
  ShieldCheck,
  Users,
} from 'lucide-react'
import AddRecipientsModal from '@/components/dashboard/AddRecipientsModal'
import AddReleaseManagerModal from '@/components/dashboard/AddReleaseManagerModal'
import LegalNoticeModal from '@/components/dashboard/access/LegalNoticeModal'
import GuardianConfirmModal from '@/components/dashboard/access/GuardianConfirmModal'
import { createClient } from '@/lib/supabase/client'
import { useToast } from '@/lib/context/ToastContext'
import { getRecipients, type Recipient } from '@/lib/api/recipients'
import {
  getReleaseManager,
  type ReleaseManager,
} from '@/lib/api/release-managers'

async function getToken(): Promise<string | null> {
  const supabase = createClient()
  const {
    data: { session },
  } = await supabase.auth.getSession()
  return session?.access_token ?? null
}

/** Initials from a full name, e.g. "John Carter" → "JC". */
function initials(name: string): string {
  const parts = name.trim().split(/\s+/).filter(Boolean)
  if (parts.length === 0) return '?'
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase()
  return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase()
}

/** First name only, for "Remove {name}" / info copy. */
function firstName(name: string): string {
  return name.trim().split(/\s+/)[0] || name
}

// Recipients are grouped into two sections by relationship.
const FAMILY_RELATIONSHIPS = new Set(['family', 'partner', 'spouse', 'child', 'parent', 'sibling'])

// Per-recipient access counts are not yet exposed by the API; this placeholder
// mirrors the design until an access-assignment endpoint is available.
const ACCESS_SUMMARY = '11 Photos • 7 Memoir Chapters • 4 Documents'

export default function AccessPage() {
  const { showToast } = useToast()

  const [recipients, setRecipients] = useState<Recipient[]>([])
  const [releaseManager, setReleaseManager] = useState<ReleaseManager | null>(null)
  const [loading, setLoading] = useState(true)

  // Add-person flow: legal notice → form.
  const [legalNoticeOpen, setLegalNoticeOpen] = useState(false)
  const [addingRecipient, setAddingRecipient] = useState(false)
  // "Change Release Manager" reuses the add-manager modal.
  const [changingManager, setChangingManager] = useState(false)

  const [expandedId, setExpandedId] = useState<string | null>(null)
  // Guardian designation is client-side only for now (no backend endpoint yet).
  const [guardianIds, setGuardianIds] = useState<string[]>([])
  const [guardianTarget, setGuardianTarget] = useState<string | null>(null)

  const loadData = useCallback(async () => {
    const token = await getToken()
    if (!token) {
      setLoading(false)
      return
    }
    try {
      const [recipientsResult, rmResult] = await Promise.allSettled([
        getRecipients(token),
        getReleaseManager(token),
      ])
      if (recipientsResult.status === 'fulfilled') {
        setRecipients(recipientsResult.value)
      }
      if (rmResult.status === 'fulfilled') {
        setReleaseManager(rmResult.value)
      }
    } catch {
      showToast('Failed to load your access settings.', 'error')
    } finally {
      setLoading(false)
    }
  }, [showToast])

  useEffect(() => {
    loadData()
  }, [loadData])

  const { family, friends } = useMemo(() => {
    const family: Recipient[] = []
    const friends: Recipient[] = []
    for (const r of recipients) {
      if (FAMILY_RELATIONSHIPS.has((r.relationship || '').toLowerCase())) {
        family.push(r)
      } else {
        friends.push(r)
      }
    }
    return { family, friends }
  }, [recipients])

  const toggleExpanded = (id: string) =>
    setExpandedId((cur) => (cur === id ? null : id))

  const confirmGuardian = () => {
    if (!guardianTarget) return
    setGuardianIds((cur) =>
      cur.includes(guardianTarget) ? cur : [...cur, guardianTarget],
    )
    setGuardianTarget(null)
    showToast('Guardian designated', 'success')
  }

  const removeGuardian = (id: string) => {
    setGuardianIds((cur) => cur.filter((g) => g !== id))
    showToast('Guardian role removed', 'success')
  }

  const removeRecipient = (id: string, name: string) => {
    // No delete endpoint yet — remove locally so the flow is demonstrable.
    setRecipients((cur) => cur.filter((r) => r.id !== id))
    setGuardianIds((cur) => cur.filter((g) => g !== id))
    if (expandedId === id) setExpandedId(null)
    showToast(`${firstName(name)} removed`, 'success')
  }

  const renderCard = (r: Recipient) => {
    const guardianIndex = guardianIds.indexOf(r.id)
    return (
      <RecipientCard
        key={r.id}
        recipient={r}
        expanded={expandedId === r.id}
        guardianNumber={guardianIndex >= 0 ? guardianIndex + 1 : null}
        onToggle={() => toggleExpanded(r.id)}
        onSelectGuardian={() => setGuardianTarget(r.id)}
        onRemoveGuardian={() => removeGuardian(r.id)}
        onRemove={() => removeRecipient(r.id, r.name)}
      />
    )
  }

  return (
    <div className="flex flex-col gap-[25px]">
      {/* Header */}
      <div className="flex flex-col gap-1">
        <h1
          style={{
            fontFamily: '"Instrument Serif", serif',
            fontWeight: 400,
            fontSize: 32,
            lineHeight: '36px',
            color: '#101828',
          }}
        >
          Access Control
        </h1>
        <p
          style={{
            fontFamily: 'Inter, sans-serif',
            fontWeight: 400,
            fontSize: 16,
            lineHeight: '24px',
            letterSpacing: '-0.31px',
            color: '#4A5565',
          }}
        >
          Manage your recipients and what they will have access to
        </p>
      </div>

      {/* Release Manager */}
      {loading ? (
        <CardSkeleton />
      ) : releaseManager ? (
        <ReleaseManagerCard
          manager={releaseManager}
          onSendReminder={() => showToast('Reminder sent', 'success')}
          onChange={() => setChangingManager(true)}
        />
      ) : (
        <EmptyReleaseManager onClick={() => setChangingManager(true)} />
      )}

      {/* Family Members */}
      <RecipientSection
        label="Family Members"
        count={family.length}
        onAdd={() => setLegalNoticeOpen(true)}
        loading={loading}
      >
        {family.map(renderCard)}
      </RecipientSection>

      {/* Friends & Others */}
      <RecipientSection
        label="Friends & Others"
        count={friends.length}
        onAdd={() => setLegalNoticeOpen(true)}
        loading={loading}
      >
        {friends.map(renderCard)}
      </RecipientSection>

      {/* Modals */}
      <LegalNoticeModal
        open={legalNoticeOpen}
        onClose={() => setLegalNoticeOpen(false)}
        onContinue={() => {
          setLegalNoticeOpen(false)
          setAddingRecipient(true)
        }}
      />
      <AddRecipientsModal
        open={addingRecipient}
        onClose={() => setAddingRecipient(false)}
        onCreated={loadData}
        title="Add Person"
        subtitle={null}
        bottomVariant="guardian"
        relationshipOptions={['Family', 'Friend', 'Other']}
      />
      <AddReleaseManagerModal
        open={changingManager}
        onClose={() => setChangingManager(false)}
        onCreated={loadData}
      />
      <GuardianConfirmModal
        open={guardianTarget !== null}
        onClose={() => setGuardianTarget(null)}
        onConfirm={confirmGuardian}
      />
    </div>
  )
}

/* ---------------------- Release Manager ---------------------- */

function ReleaseManagerCard({
  manager,
  onSendReminder,
  onChange,
}: {
  manager: ReleaseManager
  onSendReminder: () => void
  onChange: () => void
}) {
  const isConfirmed = manager.status === 'accepted'
  return (
    <div className="flex flex-col gap-3">
      <div
        className="flex flex-col gap-[22px]"
        style={{
          borderRadius: 14,
          border: '1.25px solid #E5E7EB',
          background: '#FFFFFF',
          padding: '24px',
        }}
      >
        {/* Top: avatar + identity + actions */}
        <div className="flex flex-col sm:flex-row sm:items-start gap-4">
          <div
            className="flex items-center justify-center flex-shrink-0"
            style={{
              width: 56,
              height: 56,
              borderRadius: 9999,
              background: '#4F39F6',
            }}
          >
            <Image
              src="/images/Dashboard/Star.svg"
              alt=""
              width={24}
              height={24}
            />
          </div>

          <div className="flex-1 min-w-0 flex flex-col gap-0.5">
            <span
              style={{
                fontFamily: 'Inter, sans-serif',
                fontWeight: 600,
                fontSize: 12,
                lineHeight: '16px',
                letterSpacing: '0.3px',
                textTransform: 'uppercase',
                color: '#009966',
              }}
            >
              {isConfirmed ? 'Release Manager Confirmed' : 'Release Manager Invited'}
            </span>
            <span
              className="truncate"
              style={{
                fontFamily: 'Inter, sans-serif',
                fontWeight: 600,
                fontSize: 16,
                lineHeight: '24px',
                letterSpacing: '-0.31px',
                color: '#101828',
              }}
            >
              {manager.name}
            </span>
            <span
              className="truncate"
              style={{
                fontFamily: 'Inter, sans-serif',
                fontWeight: 400,
                fontSize: 14,
                lineHeight: '20px',
                letterSpacing: '-0.15px',
                color: '#4A5565',
              }}
            >
              {manager.email}
            </span>
            {manager.phone && (
              <span
                style={{
                  fontFamily: 'Inter, sans-serif',
                  fontWeight: 400,
                  fontSize: 14,
                  lineHeight: '20px',
                  letterSpacing: '-0.15px',
                  color: '#4A5565',
                }}
              >
                {manager.phone}
              </span>
            )}
          </div>

          <div className="flex flex-wrap items-center gap-2 sm:flex-shrink-0">
            <OutlineButton onClick={onSendReminder}>Send reminder</OutlineButton>
            <OutlineButton onClick={onChange}>Change Release Manager</OutlineButton>
          </div>
        </div>

        {/* Divider + feature columns */}
        <div
          className="flex flex-col gap-3 lg:flex-row lg:gap-12 lg:flex-wrap pt-6"
          style={{ borderTop: '1.25px solid #E5E7EB' }}
        >
          <FeatureItem icon={Lock} label="Accesses all documents after verification" />
          <FeatureItem icon={Users} label="Manages distribution to all recipients" />
          <FeatureItem icon={ShieldCheck} label="Carries out your final wishes" />
        </div>
      </div>

      {/* Disclaimer */}
      <div className="flex items-start gap-2">
        <Info
          className="flex-shrink-0"
          style={{ width: 16, height: 16, color: '#F54900', marginTop: 2 }}
          strokeWidth={2}
        />
        <p
          style={{
            fontFamily: 'Inter, sans-serif',
            fontSize: 14,
            lineHeight: '20px',
            letterSpacing: '-0.15px',
            color: '#F54900',
          }}
        >
          <span style={{ fontWeight: 700 }}>Disclaimer: </span>
          <span style={{ fontWeight: 400 }}>
            A Release Manager is a person you trust to initiate the delivery of
            your content.
          </span>
        </p>
      </div>
    </div>
  )
}

function FeatureItem({
  icon: Icon,
  label,
}: {
  icon: typeof Lock
  label: string
}) {
  return (
    <div className="flex items-center gap-2">
      <Icon
        className="flex-shrink-0"
        style={{ width: 20, height: 20, color: '#4F39F6' }}
        strokeWidth={2}
      />
      <span
        style={{
          fontFamily: 'Inter, sans-serif',
          fontWeight: 500,
          fontSize: 14,
          lineHeight: '20px',
          letterSpacing: '-0.15px',
          color: '#101828',
        }}
      >
        {label}
      </span>
    </div>
  )
}

function OutlineButton({
  children,
  onClick,
}: {
  children: React.ReactNode
  onClick: () => void
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="flex items-center justify-center cursor-pointer hover:bg-gray-50 whitespace-nowrap"
      style={{
        height: 32,
        borderRadius: 8,
        border: '1.25px solid #D1D5DC',
        background: '#FFFFFF',
        padding: '0 12px',
        fontFamily: 'Inter, sans-serif',
        fontWeight: 500,
        fontSize: 14,
        lineHeight: '20px',
        letterSpacing: '-0.15px',
        color: '#0A0A0A',
      }}
    >
      {children}
    </button>
  )
}

function EmptyReleaseManager({ onClick }: { onClick: () => void }) {
  return (
    <div
      className="flex flex-col items-center justify-center text-center gap-3"
      style={{
        borderRadius: 14,
        border: '1.25px dashed rgba(0,0,0,0.12)',
        background: '#FFFFFF',
        padding: '40px 24px',
      }}
    >
      <div
        className="flex items-center justify-center"
        style={{
          width: 56,
          height: 56,
          borderRadius: 12,
          background: 'linear-gradient(135deg, #E0E7FF 0%, #C6D2FF 100%)',
        }}
      >
        <ShieldCheck className="w-7 h-7" color="#4F39F6" strokeWidth={2} />
      </div>
      <p
        style={{
          fontFamily: 'Inter, sans-serif',
          fontWeight: 600,
          fontSize: 16,
          color: '#101828',
        }}
      >
        No Release Manager designated
      </p>
      <p
        className="max-w-md"
        style={{
          fontFamily: 'Inter, sans-serif',
          fontWeight: 400,
          fontSize: 14,
          lineHeight: '20px',
          color: '#4A5565',
        }}
      >
        Designate a trusted person who can release your Tether when the time
        comes.
      </p>
      <button
        type="button"
        onClick={onClick}
        className="flex items-center justify-center gap-1.5 cursor-pointer hover:opacity-90 mt-1"
        style={{
          height: 40,
          borderRadius: 8,
          background: '#4F46E5',
          padding: '0 18px',
          fontFamily: 'Inter, sans-serif',
          fontWeight: 500,
          fontSize: 14,
          lineHeight: '20px',
          color: '#FFFFFF',
        }}
      >
        Designate a Release Manager
      </button>
    </div>
  )
}

/* ---------------------- Recipient section ---------------------- */

function RecipientSection({
  label,
  count,
  onAdd,
  loading,
  children,
}: {
  label: string
  count: number
  onAdd: () => void
  loading: boolean
  children: React.ReactNode
}) {
  return (
    <section className="flex flex-col gap-4">
      <div className="flex items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <span
            style={{
              fontFamily: 'Inter, sans-serif',
              fontWeight: 600,
              fontSize: 12,
              lineHeight: '16px',
              letterSpacing: '0.3px',
              textTransform: 'uppercase',
              color: '#6A7282',
            }}
          >
            {label}
          </span>
          <span
            className="flex items-center justify-center"
            style={{
              width: 24,
              height: 24,
              borderRadius: 9999,
              background: '#DBEAFE',
              fontFamily: 'Inter, sans-serif',
              fontWeight: 600,
              fontSize: 12,
              lineHeight: '16px',
              color: '#1447E6',
            }}
          >
            {count}
          </span>
        </div>
        <button
          type="button"
          onClick={onAdd}
          className="flex items-center justify-center gap-1.5 cursor-pointer hover:bg-gray-50 whitespace-nowrap"
          style={{
            height: 32,
            borderRadius: 8,
            border: '1.25px solid rgba(0,0,0,0.1)',
            background: '#FFFFFF',
            padding: '0 12px',
            fontFamily: 'Inter, sans-serif',
            fontWeight: 500,
            fontSize: 14,
            lineHeight: '20px',
            letterSpacing: '-0.15px',
            color: '#0A0A0A',
          }}
        >
          <Plus className="w-4 h-4" strokeWidth={2.25} />
          Add person
        </button>
      </div>

      {loading ? (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-3">
          <CardSkeleton />
          <CardSkeleton />
        </div>
      ) : count === 0 ? (
        <EmptyRecipients onAdd={onAdd} />
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-3 items-start">
          {children}
        </div>
      )}
    </section>
  )
}

function EmptyRecipients({ onAdd }: { onAdd: () => void }) {
  return (
    <button
      type="button"
      onClick={onAdd}
      className="flex flex-col items-center justify-center text-center gap-2 cursor-pointer hover:bg-gray-50 w-full"
      style={{
        borderRadius: 14,
        border: '1.25px dashed rgba(0,0,0,0.12)',
        background: '#FFFFFF',
        padding: '28px 24px',
      }}
    >
      <Users className="w-6 h-6" color="#4F39F6" strokeWidth={2} />
      <span
        style={{
          fontFamily: 'Inter, sans-serif',
          fontWeight: 500,
          fontSize: 14,
          lineHeight: '20px',
          color: '#4A5565',
        }}
      >
        No one added yet. Click to add a person.
      </span>
    </button>
  )
}

/* ---------------------- Recipient card ---------------------- */

function RecipientCard({
  recipient,
  expanded,
  guardianNumber,
  onToggle,
  onSelectGuardian,
  onRemoveGuardian,
  onRemove,
}: {
  recipient: Recipient
  expanded: boolean
  guardianNumber: number | null
  onToggle: () => void
  onSelectGuardian: () => void
  onRemoveGuardian: () => void
  onRemove: () => void
}) {
  const isGuardian = guardianNumber !== null
  const first = firstName(recipient.name)

  // Contact fields are editable locally; persistence awaits a PATCH endpoint.
  // `saved*` holds the last-committed values so the button can flip Save/Saved.
  const [email, setEmail] = useState(recipient.email)
  const [phone, setPhone] = useState(recipient.phone ?? '')
  const [savedEmail, setSavedEmail] = useState(recipient.email)
  const [savedPhone, setSavedPhone] = useState(recipient.phone ?? '')
  const dirty = email !== savedEmail || phone !== savedPhone

  return (
    <div
      style={{
        borderRadius: 14,
        border: isGuardian ? '1.25px solid #E9D4FF' : '1.25px solid #E5E7EB',
        background: isGuardian ? '#FAF5FF' : '#FFFFFF',
        overflow: 'hidden',
      }}
    >
      {/* Header (always visible) */}
      <button
        type="button"
        onClick={onToggle}
        aria-expanded={expanded}
        className="w-full flex items-center gap-3 text-left cursor-pointer"
        style={{ padding: '16px' }}
      >
        <div
          className="flex items-center justify-center flex-shrink-0"
          style={{
            width: 40,
            height: 40,
            borderRadius: 9999,
            background: isGuardian ? '#F3E8FF' : '#E0E7FF',
            fontFamily: 'Inter, sans-serif',
            fontWeight: 600,
            fontSize: 14,
            lineHeight: '20px',
            letterSpacing: '-0.15px',
            color: isGuardian ? '#9810FA' : '#4F39F6',
          }}
        >
          {initials(recipient.name)}
        </div>

        <div className="flex-1 min-w-0 flex flex-col" style={{ gap: 3 }}>
          <span
            className="truncate"
            style={{
              fontFamily: 'Inter, sans-serif',
              fontWeight: 500,
              fontSize: 16,
              lineHeight: '24px',
              letterSpacing: '-0.31px',
              color: '#101828',
            }}
          >
            {recipient.name}
          </span>
          <span
            className="truncate"
            style={{
              fontFamily: 'Inter, sans-serif',
              fontWeight: 500,
              fontSize: 14,
              lineHeight: '20px',
              letterSpacing: '-0.15px',
              color: '#6A7282',
            }}
          >
            {ACCESS_SUMMARY}
          </span>
          <span
            className="truncate"
            style={{
              fontFamily: 'Inter, sans-serif',
              fontWeight: 500,
              fontSize: 14,
              lineHeight: '20px',
              letterSpacing: '-0.15px',
              color: '#6A7282',
            }}
          >
            {recipient.phone && (
              <>
                {recipient.phone}
                <span style={{ color: 'rgba(106,114,130,0.2)' }}> | </span>
              </>
            )}
            {recipient.email}
          </span>
        </div>

        <div className="flex items-center gap-3 flex-shrink-0">
          {isGuardian && (
            <span
              className="flex items-center justify-center"
              style={{
                height: 24,
                padding: '0 8px',
                borderRadius: 4,
                background: 'rgba(130,0,219,0.1)',
                fontFamily: 'Inter, sans-serif',
                fontWeight: 500,
                fontSize: 12,
                lineHeight: '16px',
                color: '#8200DB',
              }}
            >
              Guardian {guardianNumber}
            </span>
          )}
          {expanded ? (
            <ChevronUp className="w-5 h-5 text-[#99A1AF]" strokeWidth={2} />
          ) : (
            <ChevronDown className="w-5 h-5 text-[#99A1AF]" strokeWidth={2} />
          )}
        </div>
      </button>

      {/* Expanded body */}
      {expanded && (
        <div
          className="flex flex-col gap-4"
          style={{
            padding: '25px 24px 24px',
            borderTop: '1.25px solid #E5E7EB',
          }}
        >
          <h4
            style={{
              fontFamily: 'Inter, sans-serif',
              fontWeight: 600,
              fontSize: 18,
              lineHeight: '27px',
              letterSpacing: '-0.44px',
              color: '#101828',
            }}
          >
            Contact Information
          </h4>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <ContactField label="Email" value={email} onChange={setEmail} type="email" />
            <ContactField label="Phone number" value={phone} onChange={setPhone} type="tel" />
          </div>

          {/* Verification info box */}
          <div
            className="flex items-start gap-3"
            style={{
              borderRadius: 10,
              border: '1.25px solid #C6D2FF',
              background: '#EEF2FF',
              padding: '16px',
            }}
          >
            <Info
              className="flex-shrink-0"
              style={{ width: 20, height: 20, color: '#4F39F6', marginTop: 1 }}
              strokeWidth={2}
            />
            <p
              style={{
                fontFamily: 'Inter, sans-serif',
                fontWeight: 400,
                fontSize: 14,
                lineHeight: '20px',
                letterSpacing: '-0.15px',
                color: '#312C85',
              }}
            >
              Access is released after verification. {first} will not see any
              content until your release manager completes the release plan
              process.
            </p>
          </div>

          {/* Guardian role */}
          <div className="flex flex-col gap-4 pt-4" style={{ borderTop: '1.25px solid #E5E7EB' }}>
            <div
              className="flex flex-col gap-3"
              style={{
                borderRadius: 10,
                border: '1.25px solid #E9D4FF',
                background: '#FAF5FF',
                padding: '16px',
              }}
            >
              <div className="flex items-start gap-3">
                <ShieldCheck
                  className="flex-shrink-0"
                  style={{ width: 20, height: 20, color: '#9810FA', marginTop: 2 }}
                  strokeWidth={2}
                />
                <div className="flex flex-col gap-1 min-w-0">
                  <span
                    style={{
                      fontFamily: 'Inter, sans-serif',
                      fontWeight: 500,
                      fontSize: 16,
                      lineHeight: '24px',
                      letterSpacing: '-0.31px',
                      color: '#59168B',
                    }}
                  >
                    Guardian Role
                  </span>
                  <span
                    style={{
                      fontFamily: 'Inter, sans-serif',
                      fontWeight: 400,
                      fontSize: 14,
                      lineHeight: '20px',
                      letterSpacing: '-0.15px',
                      color: '#6E11B0',
                    }}
                  >
                    A Guardian acts as a backup Release Manager if your primary
                    Release Manager is unavailable or unwilling to act.
                  </span>
                </div>
              </div>

              <button
                type="button"
                onClick={isGuardian ? onRemoveGuardian : onSelectGuardian}
                className="flex items-center justify-center gap-2 cursor-pointer hover:bg-white/60"
                style={{
                  height: 32,
                  borderRadius: 8,
                  border: '1.25px solid #DAB2FF',
                  background: isGuardian ? '#F3E8FF' : '#FFFFFF',
                  fontFamily: 'Inter, sans-serif',
                  fontWeight: 500,
                  fontSize: 14,
                  lineHeight: '20px',
                  letterSpacing: '-0.15px',
                  color: '#8200DB',
                }}
              >
                <ShieldCheck className="w-4 h-4" strokeWidth={2} color="#8200DB" />
                {isGuardian ? 'Remove as Guardian' : 'Select as Guardian'}
              </button>
            </div>

            {/* Remove / Save */}
            <div className="flex items-center justify-between gap-3 pt-4">
              <button
                type="button"
                onClick={onRemove}
                className="flex items-center justify-center cursor-pointer hover:bg-gray-50 whitespace-nowrap"
                style={{
                  height: 32,
                  borderRadius: 8,
                  border: '1.25px solid #D1D5DC',
                  background: '#FFFFFF',
                  padding: '0 12px',
                  fontFamily: 'Inter, sans-serif',
                  fontWeight: 500,
                  fontSize: 14,
                  lineHeight: '20px',
                  letterSpacing: '-0.15px',
                  color: '#E7000B',
                }}
              >
                Remove {first}
              </button>
              <button
                type="button"
                disabled={!dirty}
                onClick={() => {
                  // No PATCH endpoint yet — commit the saved state locally.
                  setSavedEmail(email)
                  setSavedPhone(phone)
                }}
                className="flex items-center justify-center whitespace-nowrap disabled:cursor-not-allowed"
                style={{
                  height: 32,
                  borderRadius: 8,
                  padding: '0 12px',
                  background: dirty ? '#4F46E5' : '#99A1AF',
                  opacity: dirty ? 1 : 0.5,
                  cursor: dirty ? 'pointer' : 'not-allowed',
                  fontFamily: 'Inter, sans-serif',
                  fontWeight: 500,
                  fontSize: 14,
                  lineHeight: '20px',
                  letterSpacing: '-0.15px',
                  color: '#FFFFFF',
                }}
              >
                {dirty ? 'Save' : 'Saved'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

function ContactField({
  label,
  value,
  onChange,
  type,
}: {
  label: string
  value: string
  onChange: (v: string) => void
  type: string
}) {
  return (
    <div className="flex flex-col gap-1">
      <label
        style={{
          fontFamily: 'Inter, sans-serif',
          fontWeight: 500,
          fontSize: 14,
          lineHeight: '20px',
          letterSpacing: '-0.15px',
          color: '#364153',
        }}
      >
        {label}
      </label>
      <input
        type={type}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="w-full focus:outline-none"
        style={{
          height: 36,
          borderRadius: 8,
          border: '1.25px solid rgba(0,0,0,0.1)',
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
    </div>
  )
}

/* ---------------------- Skeleton ---------------------- */

function CardSkeleton() {
  return (
    <div
      className="animate-pulse flex items-start gap-4"
      style={{
        borderRadius: 14,
        border: '1.25px solid #E5E7EB',
        background: '#FFFFFF',
        padding: 16,
      }}
    >
      <div
        className="flex-shrink-0"
        style={{ width: 40, height: 40, borderRadius: 9999, background: '#EEF2FF' }}
      />
      <div className="flex-1 flex flex-col gap-2 pt-1">
        <div className="h-4 bg-gray-200 rounded w-1/3" />
        <div className="h-3 bg-gray-100 rounded w-2/3" />
        <div className="h-3 bg-gray-100 rounded w-1/2" />
      </div>
    </div>
  )
}
