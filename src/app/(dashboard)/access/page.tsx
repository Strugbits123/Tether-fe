'use client'

import { useCallback, useEffect, useState } from 'react'
import { Mail, Phone, Plus, Shield, UserPlus, Users } from 'lucide-react'
import Badge from '@/components/ui/Badge'
import AddRecipientsModal from '@/components/dashboard/AddRecipientsModal'
import AddReleaseManagerModal from '@/components/dashboard/AddReleaseManagerModal'
import { createClient } from '@/lib/supabase/client'
import { useToast } from '@/lib/context/ToastContext'
import { getRecipients, type Recipient } from '@/lib/api/recipients'
import {
  getReleaseManager,
  type ReleaseManager,
} from '@/lib/api/release-managers'
import { displayRelationship } from '@/lib/relationship'

type BadgeVariant = 'default' | 'success' | 'warning' | 'error' | 'info'

const RECIPIENT_STATUS: Record<
  Recipient['invitation_status'],
  { label: string; variant: BadgeVariant }
> = {
  pending: { label: 'Pending', variant: 'default' },
  sent: { label: 'Sent', variant: 'info' },
  bounced: { label: 'Bounced', variant: 'error' },
}

const RM_STATUS: Record<
  ReleaseManager['status'],
  { label: string; variant: BadgeVariant }
> = {
  invited: { label: 'Invited', variant: 'warning' },
  accepted: { label: 'Accepted', variant: 'success' },
  declined: { label: 'Declined', variant: 'error' },
  bounced: { label: 'Bounced', variant: 'error' },
  revoked: { label: 'Revoked', variant: 'default' },
}

async function getToken(): Promise<string | null> {
  const supabase = createClient()
  const {
    data: { session },
  } = await supabase.auth.getSession()
  return session?.access_token ?? null
}

function formatDate(iso: string): string {
  const d = new Date(iso)
  if (Number.isNaN(d.getTime())) return ''
  return d.toLocaleDateString(undefined, {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  })
}

export default function AccessPage() {
  const { showToast } = useToast()

  const [recipients, setRecipients] = useState<Recipient[]>([])
  const [releaseManager, setReleaseManager] = useState<ReleaseManager | null>(null)
  const [loading, setLoading] = useState(true)

  const [addingRecipient, setAddingRecipient] = useState(false)
  const [addingManager, setAddingManager] = useState(false)

  const loadData = useCallback(async () => {
    const token = await getToken()
    if (!token) {
      setLoading(false)
      return
    }
    try {
      const [recipientsData, rmData] = await Promise.all([
        getRecipients(token),
        getReleaseManager(token),
      ])
      setRecipients(recipientsData)
      setReleaseManager(rmData)
    } catch {
      showToast('Failed to load your access settings.', 'error')
    } finally {
      setLoading(false)
    }
  }, [showToast])

  useEffect(() => {
    loadData()
  }, [loadData])

  return (
    <div className="flex flex-col gap-8">
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
          Access
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
          Manage who can receive your legacy and who can release it
        </p>
      </div>

      {/* Release Manager */}
      <section className="flex flex-col gap-4">
        <div className="flex items-center justify-between gap-4 flex-wrap">
          <SectionTitle icon={Shield} label="Release Manager" />
          {!loading && !releaseManager && (
            <AddButton label="Add Release Manager" onClick={() => setAddingManager(true)} />
          )}
        </div>

        {loading ? (
          <CardSkeleton />
        ) : releaseManager ? (
          <div
            className="flex items-start gap-4"
            style={{
              borderRadius: 14,
              border: '1.25px solid rgba(0,0,0,0.1)',
              background: '#FFFFFF',
              padding: 16,
            }}
          >
            <div
              className="flex items-center justify-center flex-shrink-0"
              style={{
                width: 56,
                height: 56,
                borderRadius: 10,
                background: 'linear-gradient(135deg, #E0E7FF 0%, #C6D2FF 100%)',
              }}
            >
              <Shield className="w-7 h-7" color="#4F39F6" strokeWidth={2} />
            </div>
            <div className="flex-1 min-w-0 flex flex-col gap-1.5">
              <div className="flex items-center gap-2 flex-wrap">
                <h3
                  style={{
                    fontFamily: 'Inter, sans-serif',
                    fontWeight: 600,
                    fontSize: 16,
                    lineHeight: '24px',
                    color: '#101828',
                  }}
                >
                  {releaseManager.name}
                </h3>
                <Badge variant={RM_STATUS[releaseManager.status].variant}>
                  {RM_STATUS[releaseManager.status].label}
                </Badge>
              </div>
              <MetaRow recipient={releaseManager} />
              {releaseManager.note && <NoteText note={releaseManager.note} />}
            </div>
          </div>
        ) : (
          <EmptyState
            icon={Shield}
            title="No Release Manager designated"
            description="Designate a trusted person who can release your Tether when the time comes."
            cta="Designate a Release Manager"
            onClick={() => setAddingManager(true)}
          />
        )}
      </section>

      {/* Recipients */}
      <section className="flex flex-col gap-4">
        <div className="flex items-center justify-between gap-4 flex-wrap">
          <SectionTitle icon={Users} label="Recipients" count={recipients.length} />
          {!loading && recipients.length > 0 && (
            <AddButton label="Add Recipient" onClick={() => setAddingRecipient(true)} />
          )}
        </div>

        {loading ? (
          <div className="flex flex-col gap-4">
            <CardSkeleton />
            <CardSkeleton />
          </div>
        ) : recipients.length === 0 ? (
          <EmptyState
            icon={Users}
            title="No recipients yet"
            description="Recipients are the people who will receive your messages, photos, and documents."
            cta="Add your first recipient"
            onClick={() => setAddingRecipient(true)}
          />
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            {recipients.map((r) => (
              <div
                key={r.id}
                className="flex items-start gap-4"
                style={{
                  borderRadius: 14,
                  border: '1.25px solid rgba(0,0,0,0.1)',
                  background: '#FFFFFF',
                  padding: 16,
                }}
              >
                <div
                  className="flex items-center justify-center flex-shrink-0"
                  style={{
                    width: 56,
                    height: 56,
                    borderRadius: 10,
                    background: 'linear-gradient(135deg, #E0E7FF 0%, #C6D2FF 100%)',
                  }}
                >
                  <Users className="w-7 h-7" color="#4F39F6" strokeWidth={2} />
                </div>
                <div className="flex-1 min-w-0 flex flex-col gap-1.5">
                  <div className="flex items-center gap-2 flex-wrap">
                    <h3
                      className="truncate"
                      style={{
                        fontFamily: 'Inter, sans-serif',
                        fontWeight: 600,
                        fontSize: 16,
                        lineHeight: '24px',
                        color: '#101828',
                      }}
                    >
                      {r.name}
                    </h3>
                    <Badge variant={RECIPIENT_STATUS[r.invitation_status].variant}>
                      {RECIPIENT_STATUS[r.invitation_status].label}
                    </Badge>
                  </div>
                  <MetaRow recipient={r} />
                  {r.note && <NoteText note={r.note} />}
                  <p
                    style={{
                      fontFamily: 'Inter, sans-serif',
                      fontWeight: 400,
                      fontSize: 12,
                      lineHeight: '16px',
                      color: '#6A7282',
                    }}
                  >
                    Added {formatDate(r.created_at)}
                  </p>
                </div>
              </div>
            ))}
          </div>
        )}
      </section>

      {/* Modals */}
      <AddReleaseManagerModal
        open={addingManager}
        onClose={() => setAddingManager(false)}
        onCreated={loadData}
      />
      <AddRecipientsModal
        open={addingRecipient}
        onClose={() => setAddingRecipient(false)}
        onCreated={loadData}
      />
    </div>
  )
}

/* ---------------------- Sub components ---------------------- */

function SectionTitle({
  icon: Icon,
  label,
  count,
}: {
  icon: typeof Shield
  label: string
  count?: number
}) {
  return (
    <div className="flex items-center gap-2">
      <Icon className="w-5 h-5 text-[#4F39F6]" strokeWidth={2} />
      <h2
        style={{
          fontFamily: 'Inter, sans-serif',
          fontWeight: 600,
          fontSize: 18,
          lineHeight: '28px',
          color: '#101828',
        }}
      >
        {label}
      </h2>
      {typeof count === 'number' && count > 0 && (
        <span
          className="flex items-center justify-center"
          style={{
            minWidth: 22,
            height: 22,
            padding: '0 7px',
            borderRadius: 9999,
            background: '#EEF2FF',
            color: '#4F39F6',
            fontFamily: 'Inter, sans-serif',
            fontWeight: 600,
            fontSize: 12,
          }}
        >
          {count}
        </span>
      )}
    </div>
  )
}

function AddButton({ label, onClick }: { label: string; onClick: () => void }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="flex items-center justify-center gap-1.5 cursor-pointer hover:opacity-90"
      style={{
        height: 36,
        borderRadius: 8,
        background: '#4F46E5',
        padding: '0 16px',
        fontFamily: 'Inter, sans-serif',
        fontWeight: 500,
        fontSize: 14,
        lineHeight: '20px',
        letterSpacing: '-0.15px',
        color: '#FFFFFF',
      }}
    >
      <Plus className="w-4 h-4" strokeWidth={2.25} />
      {label}
    </button>
  )
}

function MetaRow({
  recipient,
}: {
  recipient: { email: string; phone: string | null; relationship: string }
}) {
  return (
    <div
      className="flex flex-wrap items-center gap-x-3 gap-y-1"
      style={{
        fontFamily: 'Inter, sans-serif',
        fontWeight: 400,
        fontSize: 14,
        lineHeight: '20px',
        letterSpacing: '-0.15px',
        color: '#4A5565',
      }}
    >
      <span className="flex items-center gap-1.5 min-w-0">
        <Mail className="w-4 h-4 text-[#4A5565] flex-shrink-0" strokeWidth={2} />
        <span className="truncate">{recipient.email}</span>
      </span>
      {recipient.phone && (
        <>
          <span aria-hidden>•</span>
          <span className="flex items-center gap-1.5">
            <Phone className="w-4 h-4 text-[#4A5565] flex-shrink-0" strokeWidth={2} />
            {recipient.phone}
          </span>
        </>
      )}
      {recipient.relationship && (
        <>
          <span aria-hidden>•</span>
          <span>{displayRelationship(recipient.relationship)}</span>
        </>
      )}
    </div>
  )
}

function NoteText({ note }: { note: string }) {
  return (
    <p
      style={{
        fontFamily: 'Inter, sans-serif',
        fontWeight: 400,
        fontSize: 13,
        lineHeight: '18px',
        color: '#6A7282',
        fontStyle: 'italic',
      }}
    >
      “{note}”
    </p>
  )
}

function EmptyState({
  icon: Icon,
  title,
  description,
  cta,
  onClick,
}: {
  icon: typeof Shield
  title: string
  description: string
  cta: string
  onClick: () => void
}) {
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
        <Icon className="w-7 h-7" color="#4F39F6" strokeWidth={2} />
      </div>
      <p
        style={{
          fontFamily: 'Inter, sans-serif',
          fontWeight: 600,
          fontSize: 16,
          color: '#101828',
        }}
      >
        {title}
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
        {description}
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
        <UserPlus className="w-4 h-4" strokeWidth={2.25} />
        {cta}
      </button>
    </div>
  )
}

function CardSkeleton() {
  return (
    <div
      className="animate-pulse flex items-start gap-4"
      style={{
        borderRadius: 14,
        border: '1.25px solid rgba(0,0,0,0.1)',
        background: '#FFFFFF',
        padding: 16,
      }}
    >
      <div
        className="flex-shrink-0"
        style={{ width: 56, height: 56, borderRadius: 10, background: '#EEF2FF' }}
      />
      <div className="flex-1 flex flex-col gap-2 pt-1">
        <div className="h-4 bg-gray-200 rounded w-1/3" />
        <div className="h-3 bg-gray-100 rounded w-2/3" />
        <div className="h-3 bg-gray-100 rounded w-1/4" />
      </div>
    </div>
  )
}
