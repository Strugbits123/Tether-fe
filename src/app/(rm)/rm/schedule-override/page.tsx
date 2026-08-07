'use client'

import { useCallback, useEffect, useRef, useState } from 'react'
import { AlertTriangle, Loader2 } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import { useToast } from '@/lib/context/ToastContext'
import { ApiError } from '@/lib/api/client'
import {
  getReleasePlan,
  overrideDeliverySchedule,
  type RescheduledPlan,
} from '@/lib/api/rm'

/**
 * Hidden QA page: change an active release plan's delivery date.
 *
 * Deliberately unlinked — reachable only by typing /rm/schedule-override. It is
 * not "secure" by being hidden; the actual gate is the password, which the API
 * verifies server-side against RELEASE_SCHEDULE_OVERRIDE_SECRET. Nothing here
 * knows or stores the password, and the route is useless on an environment
 * where that variable isn't set (the API answers 404).
 */
async function getToken(): Promise<string | null> {
  const supabase = createClient()
  const {
    data: { session },
  } = await supabase.auth.getSession()
  return session?.access_token ?? null
}

/** `2026-03-10T13:45` — the shape <input type="datetime-local"> expects. */
function toLocalInputValue(iso: string | null): string {
  if (!iso) return ''
  const d = new Date(iso)
  if (Number.isNaN(d.getTime())) return ''
  const pad = (n: number) => String(n).padStart(2, '0')
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(
    d.getHours(),
  )}:${pad(d.getMinutes())}`
}

export default function ScheduleOverridePage() {
  const { showToast } = useToast()

  const [password, setPassword] = useState('')
  const [scheduledAt, setScheduledAt] = useState('')
  const [currentPlan, setCurrentPlan] = useState<{
    plan_id?: string
    status?: string
    delivery_scheduled_at?: string | null
  } | null>(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [result, setResult] = useState<RescheduledPlan | null>(null)
  // Distinct from "no plan": without a session we know nothing about the plan,
  // and rendering the empty state would tell the operator there's no release
  // plan when we simply never asked.
  const [needsAuth, setNeedsAuth] = useState(false)
  // Synchronous double-submit guard. `saving` is only set after an await, so two
  // fast clicks could both get past it and fire two overrides.
  const submittingRef = useRef(false)

  const load = useCallback(async () => {
    const token = await getToken()
    if (!token) {
      setNeedsAuth(true)
      setLoading(false)
      return
    }
    setNeedsAuth(false)
    try {
      const plan = await getReleasePlan(token)
      if ('status' in plan && plan.status !== 'none') {
        const active = plan as unknown as {
          plan_id: string
          status: string
          delivery_scheduled_at: string | null
        }
        setCurrentPlan(active)
        setScheduledAt(toLocalInputValue(active.delivery_scheduled_at))
      } else {
        setCurrentPlan(null)
      }
    } catch (e) {
      showToast(
        e instanceof ApiError ? e.message : 'Failed to load the release plan.',
        'error',
      )
    } finally {
      setLoading(false)
    }
  }, [showToast])

  // Data-fetch-on-mount. The setState calls inside load() run after an await
  // (never synchronously in the effect body), so the cascading-render the rule
  // guards against doesn't apply here.
  /* eslint-disable react-hooks/set-state-in-effect */
  useEffect(() => {
    load()
  }, [load])
  /* eslint-enable react-hooks/set-state-in-effect */

  const handleSubmit = async () => {
    // Claimed before the first await — the disabled attribute and `saving` both
    // only take effect a tick later, which is too late to stop a double click.
    if (submittingRef.current) return

    if (!password.trim()) {
      showToast('Enter the override password.', 'error')
      return
    }
    if (!scheduledAt) {
      showToast('Pick a delivery date and time.', 'error')
      return
    }

    submittingRef.current = true
    setSaving(true)

    const token = await getToken()
    if (!token) {
      // Previously returned silently, leaving the button spinning with no
      // explanation of why nothing happened.
      setNeedsAuth(true)
      submittingRef.current = false
      setSaving(false)
      showToast('Your session has expired. Sign in again.', 'error')
      return
    }

    try {
      // datetime-local yields a zone-less string; construct a Date so it's sent
      // as a proper instant rather than being reinterpreted server-side.
      const iso = new Date(scheduledAt).toISOString()
      const updated = await overrideDeliverySchedule(token, password, iso)
      setResult(updated)
      setCurrentPlan({
        plan_id: updated.plan_id,
        status: updated.status,
        delivery_scheduled_at: updated.delivery_scheduled_at,
      })
      showToast('Delivery date updated.', 'success')
    } catch (e) {
      showToast(e instanceof Error ? e.message : 'Failed to update.', 'error')
    } finally {
      submittingRef.current = false
      setSaving(false)
    }
  }

  const label = { fontFamily: 'Inter, sans-serif', fontWeight: 500, fontSize: 13, color: '#364153' }
  const input = {
    height: 38,
    width: '100%',
    padding: '0 12px',
    borderRadius: 8,
    border: '1px solid #E5E7EB',
    fontFamily: 'Inter, sans-serif',
    fontSize: 14,
    color: '#101828',
  } as const

  return (
    <div className="w-full max-w-[560px] mx-auto flex flex-col gap-6 p-4 sm:p-6">
      <div className="flex flex-col gap-2">
        <h1
          style={{
            fontFamily: '"Instrument Serif", serif',
            fontWeight: 400,
            fontSize: 28,
            lineHeight: '36px',
            color: '#101828',
          }}
        >
          Delivery date override
        </h1>
        <div
          className="flex items-start gap-2.5"
          style={{
            borderRadius: 10,
            background: '#FEF3C7',
            border: '1px solid #FDE68A',
            padding: 12,
          }}
        >
          <AlertTriangle
            className="flex-shrink-0 mt-0.5"
            style={{ width: 16, height: 16, color: '#BB4D00' }}
          />
          <p style={{ fontFamily: 'Inter, sans-serif', fontSize: 13, lineHeight: '19px', color: '#7C4A03' }}>
            Testing tool. This moves the date the release actually delivers on, for
            the account you&apos;re currently managing. Every change is recorded in
            the release activity log.
          </p>
        </div>
      </div>

      {loading && (
        <div className="flex items-center gap-2" style={{ color: '#6A7282' }}>
          <Loader2 className="animate-spin" style={{ width: 16, height: 16 }} />
          <span style={{ fontFamily: 'Inter, sans-serif', fontSize: 14 }}>Loading plan…</span>
        </div>
      )}

      {!loading && needsAuth && (
        <p
          style={{
            fontFamily: 'Inter, sans-serif',
            fontSize: 14,
            color: '#7F1D1D',
            borderRadius: 10,
            background: '#FEF2F2',
            border: '1px solid #FECACA',
            padding: 16,
          }}
        >
          You&apos;re not signed in, so the release plan couldn&apos;t be loaded.
          Sign in as the Release Manager for this account and reload.
        </p>
      )}

      {!loading && !needsAuth && !currentPlan && (
        <p
          style={{
            fontFamily: 'Inter, sans-serif',
            fontSize: 14,
            color: '#4A5565',
            borderRadius: 10,
            background: '#F9FAFB',
            border: '1px solid #E5E7EB',
            padding: 16,
          }}
        >
          No release plan on this account yet. Initiate one first — there&apos;s no
          delivery date to change until then.
        </p>
      )}

      {!loading && !needsAuth && currentPlan && (
        <div className="flex flex-col gap-4">
          <div
            className="flex flex-col gap-1"
            style={{ borderRadius: 10, background: '#F9FAFB', border: '1px solid #E5E7EB', padding: 14 }}
          >
            <span style={{ fontFamily: 'Inter, sans-serif', fontSize: 12, color: '#6A7282' }}>
              Plan {currentPlan.plan_id} · {currentPlan.status}
            </span>
            <span style={{ fontFamily: 'Inter, sans-serif', fontSize: 13.5, color: '#101828' }}>
              Currently delivers:{' '}
              {currentPlan.delivery_scheduled_at
                ? new Date(currentPlan.delivery_scheduled_at).toLocaleString('en-US')
                : '—'}
            </span>
          </div>

          <label className="flex flex-col gap-1.5">
            <span style={label}>Override password</span>
            <input
              type="password"
              autoComplete="off"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Set on the server, not in this app"
              style={input}
            />
          </label>

          <label className="flex flex-col gap-1.5">
            <span style={label}>New delivery date &amp; time</span>
            <input
              type="datetime-local"
              value={scheduledAt}
              onChange={(e) => setScheduledAt(e.target.value)}
              style={input}
            />
            <span style={{ fontFamily: 'Inter, sans-serif', fontSize: 12, color: '#6A7282' }}>
              Set this in the past to make the waiting period count as elapsed, then
              use Continue delivery on the release plan.
            </span>
          </label>

          <button
            type="button"
            onClick={handleSubmit}
            disabled={saving}
            className="cursor-pointer hover:opacity-90 disabled:opacity-50 disabled:cursor-not-allowed"
            style={{
              height: 40,
              borderRadius: 8,
              background: '#4F46E5',
              color: '#FFFFFF',
              fontFamily: 'Inter, sans-serif',
              fontWeight: 500,
              fontSize: 14,
            }}
          >
            {saving ? 'Updating…' : 'Update delivery date'}
          </button>

          {result && (
            <p
              style={{
                fontFamily: 'Inter, sans-serif',
                fontSize: 13,
                lineHeight: '19px',
                color: '#065F46',
                borderRadius: 10,
                background: '#D1FAE5',
                border: '1px solid #A7F3D0',
                padding: 12,
              }}
            >
              Updated from{' '}
              {new Date(result.previous_delivery_scheduled_at).toLocaleString('en-US')} to{' '}
              {new Date(result.delivery_scheduled_at).toLocaleString('en-US')}.
            </p>
          )}
        </div>
      )}
    </div>
  )
}
