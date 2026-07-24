'use client'

import { useCallback, useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { useAuth } from '@/lib/context/AuthContext'
import { useToast } from '@/lib/context/ToastContext'
import { ApiError } from '@/lib/api/client'
import { getMemberships, switchContext, type Membership } from '@/lib/api/memberships'
import { displayRelationship } from '@/lib/relationship'

async function getToken(): Promise<string | null> {
  const supabase = createClient()
  const {
    data: { session },
  } = await supabase.auth.getSession()
  return session?.access_token ?? null
}

const AVATAR_COLORS = ['#134E4A', '#581C87', '#7C2D12', '#164E63', '#3F2E5C', '#1E3A5F']

function avatarColor(id: string): string {
  let hash = 0
  for (let i = 0; i < id.length; i++) hash = (hash * 31 + id.charCodeAt(i)) | 0
  return AVATAR_COLORS[Math.abs(hash) % AVATAR_COLORS.length]
}

function initialsOf(name: string): string {
  const parts = name.trim().split(/\s+/)
  const first = parts[0]?.[0] ?? ''
  const last = parts.length > 1 ? parts[parts.length - 1][0] : ''
  return (first + last).toUpperCase() || '?'
}

export default function SelectAccountPage() {
  const router = useRouter()
  const { showToast } = useToast()
  const { profile, signOut } = useAuth()

  const [memberships, setMemberships] = useState<Membership[]>([])
  const [loading, setLoading] = useState(true)
  const [switchingId, setSwitchingId] = useState<string | null>(null)

  const load = useCallback(async () => {
    setLoading(true)
    const token = await getToken()
    if (!token) {
      router.push('/signin')
      return
    }
    try {
      const data = await getMemberships(token)

      // This picker only makes sense when there's an actual choice to make —
      // with exactly one membership, switch straight into it instead of
      // showing a list with a single row.
      if (data.length === 1) {
        const ctx = await switchContext(token, data[0].id)
        window.localStorage.setItem('active_membership', ctx.membership_id)
        router.replace(ctx.portal === 'owner' ? '/dashboard' : '/rm/overview')
        return
      }

      setMemberships(data)
    } catch (e) {
      showToast(e instanceof ApiError ? e.message : 'Failed to load your accounts.', 'error')
    } finally {
      setLoading(false)
    }
  }, [router, showToast])

  useEffect(() => {
    load()
  }, [load])

  const handleSelect = async (membership: Membership) => {
    setSwitchingId(membership.id)
    const token = await getToken()
    if (!token) {
      router.push('/signin')
      return
    }
    try {
      const ctx = await switchContext(token, membership.id)
      window.localStorage.setItem('active_membership', ctx.membership_id)
      router.push(ctx.portal === 'owner' ? '/dashboard' : '/rm/overview')
    } catch (e) {
      showToast(e instanceof ApiError ? e.message : 'Failed to switch accounts.', 'error')
      setSwitchingId(null)
    }
  }

  const releaseManagerCount = memberships.filter((m) => m.portal === 'release_manager').length

  const firstName = profile?.first_name?.trim() || 'there'
  const displayName =
    profile?.first_name && profile?.last_name
      ? `${profile.first_name} ${profile.last_name}`
      : profile?.first_name || profile?.email?.split('@')[0] || 'Your Account'

  return (
    <div className="min-h-screen font-sans" style={{ background: '#F8FAFC' }}>
      <div className="w-full max-w-[720px] mx-auto flex flex-col" style={{ padding: '64px 24px', gap: 24 }}>
        <div className="flex flex-col" style={{ gap: 6 }}>
          <h1
            style={{
              fontFamily: '"Instrument Serif", serif',
              fontWeight: 400,
              fontSize: 30,
              lineHeight: '36px',
              color: '#101828',
            }}
          >
            Welcome back, {firstName}.
          </h1>
          <p
            style={{
              fontFamily: 'Inter, sans-serif',
              fontWeight: 400,
              fontSize: 15,
              lineHeight: '22px',
              color: '#6A7282',
            }}
          >
            {releaseManagerCount > 0
              ? `You are a Release Manager for ${releaseManagerCount} account${releaseManagerCount === 1 ? '' : 's'}. Select one to view, or keep an eye on both.`
              : 'Select an account to continue.'}
          </p>
        </div>

        <div className="flex flex-col" style={{ gap: 12 }}>
          {loading ? (
            <>
              <MembershipSkeleton />
              <MembershipSkeleton />
            </>
          ) : (
            memberships.map((m) => (
              <MembershipRow
                key={m.id}
                membership={m}
                busy={switchingId === m.id}
                disabled={switchingId !== null}
                onSelect={() => handleSelect(m)}
              />
            ))
          )}
        </div>

        <div style={{ borderTop: '1px solid #E5E7EB', paddingTop: 20 }}>
          <div className="flex items-center justify-between gap-4 flex-wrap">
            <div className="flex items-center" style={{ gap: 12 }}>
              <div
                className="flex items-center justify-center flex-shrink-0"
                style={{
                  width: 36,
                  height: 36,
                  borderRadius: '50%',
                  background: '#1E1B4B',
                }}
              >
                <span
                  style={{
                    fontFamily: 'Inter, sans-serif',
                    fontWeight: 600,
                    fontSize: 13,
                    color: '#FFFFFF',
                  }}
                >
                  {initialsOf(displayName)}
                </span>
              </div>
              <div className="flex flex-col">
                <span
                  style={{
                    fontFamily: 'Inter, sans-serif',
                    fontWeight: 600,
                    fontSize: 14,
                    color: '#101828',
                  }}
                >
                  {displayName}
                </span>
                <span
                  style={{
                    fontFamily: 'Inter, sans-serif',
                    fontWeight: 400,
                    fontSize: 13,
                    color: '#9CA3AF',
                  }}
                >
                  {profile?.email}
                </span>
              </div>
            </div>
            <button
              type="button"
              onClick={() => signOut()}
              className="cursor-pointer hover:opacity-70"
              style={{
                fontFamily: 'Inter, sans-serif',
                fontWeight: 400,
                fontSize: 13,
                color: '#6A7282',
                textDecoration: 'underline',
              }}
            >
              Sign out
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

function MembershipRow({
  membership,
  busy,
  disabled,
  onSelect,
}: {
  membership: Membership
  busy: boolean
  disabled: boolean
  onSelect: () => void
}) {
  const name = membership.is_self ? 'Your Account' : membership.owner_name ?? 'Account'
  const roleLabel = membership.portal === 'release_manager' ? 'Release Manager' : 'Owner'

  return (
    <div
      className="flex items-center gap-4 flex-wrap"
      style={{
        borderRadius: 14,
        border: '1.25px solid #E5E7EB',
        background: '#FFFFFF',
        padding: 20,
      }}
    >
      <div
        className="flex items-center justify-center flex-shrink-0"
        style={{
          width: 56,
          height: 56,
          borderRadius: 12,
          background: avatarColor(membership.id),
        }}
      >
        <span
          style={{
            fontFamily: 'Inter, sans-serif',
            fontWeight: 700,
            fontSize: 16,
            color: '#FFFFFF',
          }}
        >
          {initialsOf(name)}
        </span>
      </div>

      <div className="flex-1 min-w-0 flex flex-col gap-0.5">
        <span
          className="truncate"
          style={{
            fontFamily: 'Inter, sans-serif',
            fontWeight: 700,
            fontSize: 17,
            color: '#101828',
          }}
        >
          {name}
        </span>
        <span
          style={{
            fontFamily: 'Inter, sans-serif',
            fontWeight: 400,
            fontSize: 14,
            color: '#6A7282',
          }}
        >
          {membership.relationship && !membership.is_self
            ? `${displayRelationship(membership.relationship)} · ${roleLabel}`
            : roleLabel}
        </span>
        <span
          style={{
            fontFamily: 'Inter, sans-serif',
            fontWeight: 400,
            fontSize: 13,
            color: '#9CA3AF',
          }}
        >
          {membership.stats.messages} messages · {membership.stats.documents} documents ·{' '}
          {membership.stats.recipients} recipients
        </span>
      </div>

      <div className="flex flex-col items-end gap-2 flex-shrink-0">
        {membership.portal === 'release_manager' && (
          <span
            className="inline-flex items-center gap-1.5"
            style={{
              height: 22,
              borderRadius: 9999,
              padding: '0 10px',
              background: membership.release_active ? '#FEF3C6' : '#F1F5F9',
              color: membership.release_active ? '#BB4D00' : '#64748B',
              fontFamily: 'Inter, sans-serif',
              fontWeight: 500,
              fontSize: 12,
            }}
          >
            {membership.release_active && (
              <span
                style={{ width: 6, height: 6, borderRadius: '50%', background: '#BB4D00' }}
              />
            )}
            {membership.release_active ? 'Release active' : 'No release active'}
          </span>
        )}
        <button
          type="button"
          onClick={onSelect}
          disabled={disabled}
          className="flex items-center justify-center gap-1.5 cursor-pointer hover:opacity-90 disabled:opacity-60 disabled:cursor-not-allowed"
          style={{
            height: 36,
            borderRadius: 8,
            padding: '0 16px',
            background: membership.release_active ? '#4F46E5' : '#FFFFFF',
            border: membership.release_active ? 'none' : '1.25px solid #4F46E5',
            fontFamily: 'Inter, sans-serif',
            fontWeight: 500,
            fontSize: 14,
            color: membership.release_active ? '#FFFFFF' : '#4F46E5',
          }}
        >
          {busy ? (
            <svg className="animate-spin h-4 w-4" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
            </svg>
          ) : (
            <>View account →</>
          )}
        </button>
      </div>
    </div>
  )
}

function MembershipSkeleton() {
  return (
    <div
      className="animate-pulse flex items-center gap-4"
      style={{ borderRadius: 14, border: '1.25px solid #E5E7EB', background: '#FFFFFF', padding: 20 }}
    >
      <div style={{ width: 56, height: 56, borderRadius: 12, background: '#EEF2FF' }} />
      <div className="flex-1 flex flex-col gap-2">
        <div className="h-4 bg-gray-200 rounded w-1/3" />
        <div className="h-3 bg-gray-100 rounded w-1/4" />
        <div className="h-3 bg-gray-100 rounded w-1/2" />
      </div>
    </div>
  )
}
