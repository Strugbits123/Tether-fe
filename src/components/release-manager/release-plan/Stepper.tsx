import { Fragment } from 'react'
import { Check } from 'lucide-react'
import { STEPS } from './constants'

/**
 * Release Plan progress stepper. Steps before `activeStep` render as completed
 * (green + check), the active step is indigo, and later steps are muted.
 */
export default function Stepper({ activeStep }: { activeStep: number }) {
  return (
    <div className="w-full">
      <div className="flex items-center w-full" style={{ gap: 8 }}>
        {STEPS.map((step, i) => {
          const isCompleted = step.n < activeStep
          const isActive = step.n === activeStep
          const circleBg = isCompleted
            ? '#10B981'
            : isActive
              ? '#4F46E5'
              : '#E5E7EB'
          const labelColor = isCompleted
            ? '#10B981'
            : isActive
              ? '#4F46E5'
              : '#9CA3AF'
          return (
            <Fragment key={step.n}>
              <div className="flex items-center flex-shrink-0" style={{ gap: 8 }}>
                <span
                  className="flex items-center justify-center flex-shrink-0"
                  style={{
                    width: 32,
                    height: 32,
                    borderRadius: 9999,
                    background: circleBg,
                    fontFamily: 'Inter, sans-serif',
                    fontWeight: 600,
                    fontSize: 13,
                    lineHeight: '19.5px',
                    letterSpacing: '-0.08px',
                    color: isActive ? '#FFFFFF' : '#9CA3AF',
                  }}
                >
                  {isCompleted ? (
                    <Check className="w-4 h-4 text-white" strokeWidth={2.5} />
                  ) : (
                    step.n
                  )}
                </span>
                <span
                  className="whitespace-nowrap hidden sm:inline"
                  style={{
                    fontFamily: 'Inter, sans-serif',
                    fontWeight: isCompleted || isActive ? 500 : 400,
                    fontSize: 13,
                    lineHeight: '19.5px',
                    letterSpacing: '-0.08px',
                    color: labelColor,
                  }}
                >
                  {step.label}
                </span>
              </div>
              {i < STEPS.length - 1 && (
                <span
                  className="flex-1"
                  style={{
                    minWidth: 16,
                    height: 2,
                    background: step.n < activeStep ? '#10B981' : '#E5E7EB',
                  }}
                />
              )}
            </Fragment>
          )
        })}
      </div>
    </div>
  )
}
