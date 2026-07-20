import Stepper from './Stepper'
import { formatDateTime } from './constants'

export type ReleasePlanView =
  | 'intro'
  | 'step1'
  | 'step2'
  | 'step3'
  | 'step4'
  | 'step5'
  | 'complete'

interface ReleasePlanHeaderProps {
  view: ReleasePlanView
  ownerName: string
  planId?: string | null
  initiatedAt?: string | null
  deliveryScheduledAt?: string | null
  deliveredAt?: string | null
}

/** Title, status chip, subtitle and stepper — adapts to the current view. */
export default function ReleasePlanHeader({
  view,
  ownerName,
  planId,
  initiatedAt,
  deliveryScheduledAt,
  deliveredAt,
}: ReleasePlanHeaderProps) {
  const isActive =
    view === 'step2' || view === 'step3' || view === 'step4' || view === 'step5'
  const isDelivering = view === 'step4'
  const isDelivered = view === 'step5'
  // Step 5 is terminal: render every step as completed (6 > all step numbers).
  const activeStep =
    view === 'step5'
      ? 6
      : view === 'step4'
        ? 4
        : view === 'step3'
          ? 3
          : view === 'step2'
            ? 2
            : 1
  const subtitle =
    view === 'step5'
      ? `Delivered ${formatDateTime(deliveredAt ?? null)} — tracking recipient access`
      : view === 'step4'
        ? 'Waiting period complete — delivery triggered'
        : view === 'step3'
          ? `Waiting period — delivers ${formatDateTime(deliveryScheduledAt ?? null)}`
          : view === 'step2'
            ? `Initiated ${formatDateTime(initiatedAt ?? null)}`
            : `Start and manage content delivery for ${ownerName}`
  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center justify-between gap-3 flex-wrap">
        <h1
          style={{
            fontFamily: '"Instrument Serif", serif',
            fontWeight: 400,
            fontSize: 32,
            lineHeight: '48px',
            color: '#111827',
          }}
        >
          {isActive && planId ? `Release Plan — ${planId}` : 'Release Plan'}
        </h1>
        {view === 'intro' && (
          <span
            className="flex items-center justify-center flex-shrink-0"
            style={{
              height: 30,
              padding: '0 14px',
              borderRadius: 9999,
              border: '1.25px solid #E5E7EB',
              background: '#FFFFFF',
              fontFamily: 'Inter, sans-serif',
              fontWeight: 400,
              fontSize: 13,
              lineHeight: '19.5px',
              letterSpacing: '-0.08px',
              color: '#9CA3AF',
            }}
          >
            No active release
          </span>
        )}
        {isActive && planId && (
          <span
            className="flex items-center justify-center flex-shrink-0"
            style={{
              height: 27.5,
              padding: '0 14px',
              borderRadius: 9999,
              background: isDelivered ? '#D1FAE5' : '#EEF2FF',
              fontFamily: 'Inter, sans-serif',
              fontWeight: 600,
              fontSize: 13,
              lineHeight: '19.5px',
              letterSpacing: '-0.08px',
              color: isDelivered ? '#10B981' : '#4F46E5',
            }}
          >
            {planId} ·{' '}
            {isDelivered ? 'Delivered' : isDelivering ? 'Delivering' : 'Active'}
          </span>
        )}
      </div>

      <p
        style={{
          fontFamily: 'Inter, sans-serif',
          fontWeight: 400,
          fontSize: isActive ? 13 : 15,
          lineHeight: isActive ? '19.5px' : '22.5px',
          letterSpacing: isActive ? '-0.08px' : '-0.23px',
          color: '#6B7280',
        }}
      >
        {subtitle}
      </p>

      <Stepper activeStep={activeStep} />
    </div>
  )
}
