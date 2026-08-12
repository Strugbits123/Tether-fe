'use client'

import { useCallback, useEffect, useRef, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useToast } from '@/lib/context/ToastContext'
import { ApiError } from '@/lib/api/client'
import {
  cancelRelease,
  continueDelivery,
  downloadActivityReport,
  getDeliveryStatus,
  getNotificationStatus,
  getReleasePlan,
  getReleasePlanActivityLog,
  getRmOverview,
  initiateRelease,
  type DeliveryStatus,
  type ReleasePlanActiveState,
  type ReleasePlanParty,
  type ReleasePlanState,
} from '@/lib/api/rm'
import RequestGuardianModal from '@/components/release-manager/RequestGuardianModal'
import CancelReleaseModal from '@/components/release-manager/CancelReleaseModal'
import ReleasePlanHeader, {
  type ReleasePlanView,
} from '@/components/release-manager/release-plan/ReleasePlanHeader'
import IntroView from '@/components/release-manager/release-plan/IntroView'
import Step1View from '@/components/release-manager/release-plan/Step1View'
import Step2View from '@/components/release-manager/release-plan/Step2View'
import Step3View from '@/components/release-manager/release-plan/Step3View'
import Step4View from '@/components/release-manager/release-plan/Step4View'
import Step5View from '@/components/release-manager/release-plan/Step5View'
import CompletionView from '@/components/release-manager/release-plan/CompletionView'
import { formatDateTime, formatDateTimeDot } from '@/components/release-manager/release-plan/constants'

async function getToken(): Promise<string | null> {
  const supabase = createClient()
  const {
    data: { session },
  } = await supabase.auth.getSession()
  return session?.access_token ?? null
}

function viewForStep(step: number): ReleasePlanView {
  if (step <= 2) return 'step2'
  if (step === 3) return 'step3'
  if (step === 4) return 'step5' // skip the transient "just triggered" screen on (re)load
  return 'complete'
}

// Full release-plan flow: intro -> step2 (notifications) -> step3 (waiting
// period) -> step5 (delivery) -> complete, plus the cancel and guardian-
// escalation branches. This is the page's default export.
export default function ReleasePlanPage() {
  const { showToast } = useToast()

  const [loading, setLoading] = useState(true)
  const [view, setView] = useState<ReleasePlanView>('intro')

  // "none" state fields
  const [canInitiate, setCanInitiate] = useState(true)
  const [hasGuardians, setHasGuardians] = useState(false)
  const [ownerName, setOwnerName] = useState('your account owner')

  // active-plan state
  const [plan, setPlan] = useState<ReleasePlanActiveState | null>(null)
  const [submitting, setSubmitting] = useState(false)
  const [cancelling, setCancelling] = useState(false)
  const [cancelOpen, setCancelOpen] = useState(false)
  // Synchronous double-submit guard for cancel — see handleCancel.
  const cancellingRef = useRef(false)
  const [continuing, setContinuing] = useState(false)
  const [downloading, setDownloading] = useState(false)

  // step2 notification polling
  const [parties, setParties] = useState<ReleasePlanParty[]>([])
  const [allSent, setAllSent] = useState(false)

  // step5 delivery-status polling
  const [delivery, setDelivery] = useState<DeliveryStatus | null>(null)

  // completion data
  const [completionStats, setCompletionStats] = useState<{ value: string; label: string }[]>([])
  const [completionTimeline, setCompletionTimeline] = useState<
    { event_type: string; event_label: string; actor_name: string; created_at: string }[]
  >([])

  const [guardianModalOpen, setGuardianModalOpen] = useState(false)

  const firstName = ownerName.split(' ')[0]

  const applyPlanState = useCallback((data: ReleasePlanState) => {
    if (!('current_step' in data)) {
      setCanInitiate(data.can_initiate)
      setHasGuardians(data.has_guardians)
      setOwnerName(data.account_owner_name)
      setPlan(null)
      setView('intro')
      return
    }
    setOwnerName(data.account_owner_name)
    setPlan(data)
    if (data.step_2_notifications) {
      setParties(data.step_2_notifications.parties)
      setAllSent(data.step_2_notifications.all_sent)
    }
    setView(viewForStep(data.current_step))
  }, [])

  const load = useCallback(async () => {
    setLoading(true)
    const token = await getToken()
    if (!token) {
      setLoading(false)
      return
    }
    try {
      const data = await getReleasePlan(token)
      applyPlanState(data)
    } catch (e) {
      showToast(e instanceof ApiError ? e.message : 'Failed to load release plan.', 'error')
    } finally {
      setLoading(false)
    }
  }, [applyPlanState, showToast])

  // Data-fetch-on-mount. The setState calls inside load() run after an await
  // (never synchronously in the effect body), so the cascading-render the rule
  // guards against doesn't apply here.
  /* eslint-disable react-hooks/set-state-in-effect */
  useEffect(() => {
    load()
  }, [load])
  /* eslint-enable react-hooks/set-state-in-effect */

  /* ---------------------- Step 1: initiate ---------------------- */

  const handleInitiate = async (data: { reason: Parameters<typeof initiateRelease>[1]['reason']; description: string }) => {
    const token = await getToken()
    if (!token) return
    setSubmitting(true)
    try {
      const res = await initiateRelease(token, {
        reason: data.reason,
        explanation: data.description,
        confirmation_checked: true,
      })
      // Seed a minimal active-plan shell; the step2 poll below fills in parties.
      setPlan({
        id: res.id,
        plan_id: res.plan_id,
        status: res.status,
        current_step: 2,
        initiated_at: new Date().toISOString(),
        delivery_scheduled_at: res.delivery_scheduled_at,
        delivered_at: null,
        account_owner_name: ownerName,
        step_2_notifications: null,
        step_3_waiting: null,
        step_4_delivery: null,
        step_5_complete: null,
      })
      setAllSent(false)
      setParties([])
      setView('step2')
    } catch (e) {
      showToast(e instanceof ApiError ? e.message : 'Failed to start the release plan.', 'error')
    } finally {
      setSubmitting(false)
    }
  }

  /* ---------------------- Step 2: poll notification status ---------------------- */

  useEffect(() => {
    if (view !== 'step2') return
    let cancelled = false
    const poll = async () => {
      const token = await getToken()
      if (!token || cancelled) return
      try {
        const status = await getNotificationStatus(token)
        if (cancelled) return
        setParties(status.parties)
        setAllSent(status.all_sent)
        if (status.all_sent) {
          const refreshed = await getReleasePlan(token)
          if (!cancelled) applyPlanState(refreshed)
        }
      } catch {
        // Keep polling — a transient failure here shouldn't stall the flow.
      }
    }
    poll()
    const interval = setInterval(poll, 3000)
    return () => {
      cancelled = true
      clearInterval(interval)
    }
  }, [view, applyPlanState])

  /* ---------------------- Cancel (shared by steps 2 & 3) ---------------------- */

  // The reason comes from CancelReleaseModal, which enforces the API's
  // non-empty + 1000-character rules before this is ever called.
  const handleCancel = async (reason: string) => {
    // Claimed synchronously, before the first await. `cancelling` is only set
    // after getToken() resolves, so two fast activations could both get past it
    // and fire two cancels. The API itself is safe — the update is conditional
    // on status='active', so no duplicate emails — but the loser returns an
    // error *after* the winner reported success, which reads as a failed cancel.
    if (cancellingRef.current) return
    cancellingRef.current = true
    setCancelling(true)
    try {
      const token = await getToken()
      if (!token) {
        showToast('Your session has expired. Sign in again.', 'error')
        return
      }
      await cancelRelease(token, { reason })
      showToast('Release plan cancelled.', 'success')
      // Only dismiss on success — a failure keeps the modal (and the typed
      // reason) so the operator can retry without writing it again.
      setCancelOpen(false)
      setPlan(null)
      await load()
    } catch (e) {
      showToast(e instanceof ApiError ? e.message : 'Failed to cancel the release plan.', 'error')
    } finally {
      // Single owner of both flags, so an early return can't strand them.
      cancellingRef.current = false
      setCancelling(false)
    }
  }

  /* ---------------------- Step 3: continue to delivery ---------------------- */

  const handleContinue = async () => {
    const token = await getToken()
    if (!token) return
    setContinuing(true)
    try {
      const res = await continueDelivery(token)
      setPlan((prev) =>
        prev
          ? { ...prev, current_step: 4, delivered_at: res.delivered_at, status: res.status }
          : prev,
      )
      setView('step4')
    } catch (e) {
      showToast(e instanceof ApiError ? e.message : 'Failed to continue delivery.', 'error')
    } finally {
      setContinuing(false)
    }
  }

  /* ---------------------- Step 5: poll delivery status ---------------------- */

  useEffect(() => {
    if (view !== 'step5') return
    let cancelled = false
    const poll = async () => {
      const token = await getToken()
      if (!token || cancelled) return
      try {
        const [status, refreshedPlan] = await Promise.all([
          getDeliveryStatus(token),
          getReleasePlan(token),
        ])
        if (cancelled) return
        setDelivery(status)
        if ('current_step' in refreshedPlan && refreshedPlan.current_step === 5) {
          applyPlanState(refreshedPlan)
        }
      } catch {
        // Keep polling — a transient failure here shouldn't stall the flow.
      }
    }
    poll()
    const interval = setInterval(poll, 10000)
    return () => {
      cancelled = true
      clearInterval(interval)
    }
  }, [view, applyPlanState])

  /* ---------------------- Completion data ---------------------- */

  useEffect(() => {
    if (view !== 'complete') return
    let cancelled = false
    ;(async () => {
      const token = await getToken()
      if (!token) return
      try {
        const [log, overview] = await Promise.all([
          getReleasePlanActivityLog(token),
          getRmOverview(token),
        ])
        if (cancelled) return
        setCompletionTimeline(log.events)
        setCompletionStats([
          { value: String(overview.content_stats.video_messages + overview.content_stats.audio_messages), label: 'Messages' },
          { value: String(overview.content_stats.photos), label: 'Photos' },
          { value: String(overview.content_stats.documents), label: 'Documents' },
          { value: String(overview.content_stats.memoir_chapters), label: 'Memoir Chapters' },
        ])
      } catch {
        // Completion recap degrades gracefully to empty stats/timeline.
      }
    })()
    return () => {
      cancelled = true
    }
  }, [view])

  const handleDownload = async () => {
    const token = await getToken()
    if (!token) return
    setDownloading(true)
    try {
      await downloadActivityReport(token)
    } catch (e) {
      showToast(e instanceof Error ? e.message : 'Download failed. Please try again.', 'error')
    } finally {
      setDownloading(false)
    }
  }

  const fetchActivityLog = useCallback(async () => {
    const token = await getToken()
    if (!token) return []
    try {
      const log = await getReleasePlanActivityLog(token)
      return log.events
    } catch {
      return []
    }
  }, [])

  if (loading) {
    return (
      <div className="w-full max-w-[900px] mx-auto flex flex-col gap-8 p-6 sm:p-8">
        <div className="animate-pulse flex flex-col gap-3">
          <div className="h-8 bg-gray-200 rounded w-1/2" />
          <div className="h-4 bg-gray-100 rounded w-2/3" />
        </div>
      </div>
    )
  }

  return (
    <div className="w-full max-w-[900px] mx-auto flex flex-col gap-8 p-6 sm:p-8">
      {view !== 'complete' && (
        <ReleasePlanHeader
          view={view}
          ownerName={ownerName}
          planId={plan?.plan_id}
          initiatedAt={plan?.initiated_at}
          deliveryScheduledAt={plan?.delivery_scheduled_at}
          deliveredAt={plan?.delivered_at}
        />
      )}

      {view === 'intro' && (
        <IntroView
          firstName={firstName}
          canInitiate={canInitiate}
          hasGuardians={hasGuardians}
          onStart={() => setView('step1')}
          onRequestGuardian={() => setGuardianModalOpen(true)}
        />
      )}

      {view === 'step1' && (
        <Step1View
          firstName={firstName}
          submitting={submitting}
          onCancel={() => setView('intro')}
          onSubmit={handleInitiate}
        />
      )}

      {view === 'step2' && plan && (
        <Step2View
          planId={plan.plan_id}
          deliveryScheduledAt={formatDateTime(plan.delivery_scheduled_at)}
          parties={parties}
          allSent={allSent}
          cancelling={cancelling}
          onCancel={() => setCancelOpen(true)}
        />
      )}

      {view === 'step3' && plan?.step_3_waiting && (
        <Step3View
          firstName={firstName}
          deliveryDisplay={formatDateTimeDot(plan.step_3_waiting.delivery_scheduled)}
          windowOpened={formatDateTimeDot(plan.step_3_waiting.window_opened)}
          deliveryScheduled={formatDateTimeDot(plan.step_3_waiting.delivery_scheduled)}
          daysElapsed={plan.step_3_waiting.days_elapsed}
          daysTotal={plan.step_3_waiting.days_total}
          cancellationsReceived={plan.step_3_waiting.cancellations_received}
          canContinue={plan.step_3_waiting.can_continue}
          cancelling={cancelling}
          continuing={continuing}
          onCancel={() => setCancelOpen(true)}
          onContinue={handleContinue}
        />
      )}

      {view === 'step4' && plan?.step_3_waiting && (
        <Step4View
          windowOpened={formatDateTimeDot(plan.step_3_waiting.window_opened)}
          deliveryScheduled={formatDateTimeDot(plan.step_3_waiting.delivery_scheduled)}
          onComplete={() => setView('step5')}
        />
      )}

      {view === 'step5' && (
        <Step5View
          deliveredAt={formatDateTime(plan?.delivered_at ?? null)}
          recipients={delivery?.recipients ?? []}
          fetchActivityLog={fetchActivityLog}
        />
      )}

      {view === 'complete' && (
        <CompletionView
          firstName={firstName}
          stats={completionStats}
          timeline={completionTimeline}
          downloading={downloading}
          onDownload={handleDownload}
        />
      )}

      <RequestGuardianModal
        open={guardianModalOpen}
        onClose={() => setGuardianModalOpen(false)}
      />

      <CancelReleaseModal
        open={cancelOpen}
        cancelling={cancelling}
        onConfirm={handleCancel}
        onClose={() => setCancelOpen(false)}
      />
    </div>
  )
}
