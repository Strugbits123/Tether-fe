'use client'

import { use, useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { ApiError } from '@/lib/api/client'
import { acceptInvitation, type InvitationRole } from '@/lib/api/invitations'
import { getMemberships, switchContext } from '@/lib/api/memberships'

const PENDING_INVITE_KEY = 'pending_invite_token'

/** Only a release_manager portal exists in this app today; guardian/recipient
 *  roles fall back to the account picker until their own portals ship. */
function portalForRole(role: InvitationRole): string {
  return role === 'release_manager' ? '/rm/overview' : '/select-account'
}

/** After any successful acceptance, follow the membership flow: resolve how
 *  many accounts this user now belongs to and route accordingly, rather than
 *  trusting a single static redirect (the user may have more than one
 *  membership by now). Falls back to `fallbackUrl` if that resolution fails. */
async function routeAfterAcceptance(
  token: string,
  fallbackUrl: string,
  router: ReturnType<typeof useRouter>,
) {
  try {
    const memberships = await getMemberships(token)
    if (memberships.length === 1) {
      const ctx = await switchContext(token, memberships[0].id)
      window.localStorage.setItem('active_membership', ctx.membership_id)
      router.push(ctx.portal === 'owner' ? '/dashboard' : '/rm/overview')
      return
    }
    if (memberships.length > 1) {
      router.push('/select-account')
      return
    }
  } catch {
    // Memberships endpoint not reachable — fall back to the backend's
    // computed redirect rather than blocking the user here.
  }
  window.location.href = fallbackUrl
}

type Status = 'confirm' | 'loading' | 'already-accepted' | 'error'

export default function AcceptInvitationPage({
  params,
}: {
  params: Promise<{ token: string }>
}) {
  const { token } = use(params)
  const router = useRouter()
  // Acceptance only happens on an explicit click (see handleAccept) — the
  // accept endpoint is a GET with a side effect, and this page must not fire
  // it just because a browser (or a link-preview crawler) loaded the URL.
  const [status, setStatus] = useState<Status>('confirm')
  const [message, setMessage] = useState('')

  const handleAccept = async () => {
    setStatus('loading')
    const supabase = createClient()
    const {
      data: { session },
    } = await supabase.auth.getSession()
    const accessToken = session?.access_token

    try {
      const res = await acceptInvitation(token, accessToken)

      if (res.alreadyAccepted) {
        setStatus('already-accepted')
        setMessage("You've already accepted this invitation.")
        setTimeout(() => {
          router.push(res.loggedIn ? portalForRole(res.role) : '/signin')
        }, 1800)
        return
      }

      if (!res.loggedIn) {
        // Needs to sign up first — persist the invite token so it survives
        // the entire signup flow (password, magic link, or OAuth all pass
        // through the same browser storage regardless of which redirects
        // happen in between).
        window.localStorage.setItem(PENDING_INVITE_KEY, token)
        window.location.href = res.redirectUrl
        return
      }

      // Already logged in — the backend accepted it server-side as part of
      // this call. Clear any stale pending token and route by membership.
      window.localStorage.removeItem(PENDING_INVITE_KEY)
      await routeAfterAcceptance(accessToken as string, res.redirectUrl, router)
    } catch (e) {
      setStatus('error')
      setMessage(
        e instanceof ApiError
          ? e.message
          : 'This invitation link is invalid or has expired.',
      )
    }
  }

  return (
    <div
      className="min-h-screen flex flex-col items-center justify-center px-4 py-8 font-sans"
      style={{ background: 'linear-gradient(135deg, #EEF2FF 0%, #FFFFFF 50%, #F0FDF4 100%)' }}
    >
      <div className="flex flex-col items-center">
        <div className="mb-8 flex justify-center">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src="/Logo.png" alt="Tether Logo" className="h-[43px] w-auto select-none" />
        </div>

        <div
          className="w-full max-w-[440px] flex flex-col items-center text-center"
          style={{
            borderRadius: 16,
            background: '#FFFFFF',
            padding: 40,
            gap: 16,
            boxShadow: '0px 8px 10px -6px rgba(0,0,0,0.1), 0px 20px 25px -5px rgba(0,0,0,0.1)',
          }}
        >
          {status === 'confirm' && (
            <>
              <h1
                style={{
                  fontFamily: '"Instrument Serif", serif',
                  fontWeight: 400,
                  fontSize: 26,
                  lineHeight: '34px',
                  color: '#111827',
                }}
              >
                You&apos;ve been invited
              </h1>
              <p style={{ fontFamily: 'Inter, sans-serif', fontSize: 14, color: '#4A5565' }}>
                Accept this invitation to continue.
              </p>
              <button
                type="button"
                onClick={handleAccept}
                className="cursor-pointer hover:opacity-90 mt-2"
                style={{
                  height: 40,
                  padding: '0 24px',
                  borderRadius: 8,
                  background: '#4F46E5',
                  fontFamily: 'Inter, sans-serif',
                  fontWeight: 500,
                  fontSize: 14,
                  color: '#FFFFFF',
                }}
              >
                Accept invitation
              </button>
            </>
          )}

          {status === 'loading' && (
            <>
              <svg className="animate-spin h-8 w-8 text-[#4F46E5]" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                <path
                  className="opacity-75"
                  fill="currentColor"
                  d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                />
              </svg>
              <p style={{ fontFamily: 'Inter, sans-serif', fontSize: 14, color: '#4A5565' }}>
                Confirming your invitation…
              </p>
            </>
          )}

          {status === 'already-accepted' && (
            <>
              <h1
                style={{
                  fontFamily: '"Instrument Serif", serif',
                  fontWeight: 400,
                  fontSize: 26,
                  lineHeight: '34px',
                  color: '#111827',
                }}
              >
                Already accepted
              </h1>
              <p style={{ fontFamily: 'Inter, sans-serif', fontSize: 14, color: '#4A5565' }}>
                {message}
              </p>
            </>
          )}

          {status === 'error' && (
            <>
              <h1
                style={{
                  fontFamily: '"Instrument Serif", serif',
                  fontWeight: 400,
                  fontSize: 26,
                  lineHeight: '34px',
                  color: '#111827',
                }}
              >
                Invitation link problem
              </h1>
              <p style={{ fontFamily: 'Inter, sans-serif', fontSize: 14, color: '#4A5565' }}>
                {message}
              </p>
              <button
                type="button"
                onClick={() => router.push('/signin')}
                className="cursor-pointer hover:opacity-80 mt-2"
                style={{
                  fontFamily: 'Inter, sans-serif',
                  fontWeight: 500,
                  fontSize: 14,
                  color: '#4F46E5',
                }}
              >
                Go to sign in
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  )
}
