'use client'

import { Check } from 'lucide-react'

type Step = {
  label: string
  cta: string
  done: boolean
  index: number
}

const steps: Step[] = [
  { label: 'Finish Your Profile', cta: 'Finish', done: true, index: 1 },
  { label: 'Add a Release Manager', cta: 'Add', done: true, index: 2 },
  { label: 'Add Recipients', cta: 'Add', done: true, index: 3 },
  { label: 'Add Photos', cta: 'Upload', done: false, index: 4 },
  { label: 'Create a Message', cta: 'Start', done: false, index: 5 },
]

export default function SetupSteps() {
  const completed = steps.filter((s) => s.done).length
  const total = steps.length
  const percent = (completed / total) * 100

  return (
    <div
      className="w-full rounded-[14px] bg-white p-5 sm:p-6"
      style={{ border: '1px solid rgba(0,0,0,0.1)' }}
    >
      {/* Header */}
      <div className="pb-5">
        <div className="flex flex-wrap items-center justify-between gap-2 mb-3">
          <h3
            className="text-[17px] font-semibold text-[#101828] leading-7"
            style={{ fontFamily: 'Inter, sans-serif' }}
          >
            Let&apos;s get you set up
          </h3>
          <p
            className="text-[13.3px] font-semibold text-[#4A5565] leading-5"
            style={{ fontFamily: 'Inter, sans-serif' }}
          >
            Complete your setup — {completed} of {total} done
          </p>
        </div>
        {/* Progress bar */}
        <div className="w-full h-1.5 bg-gray-200 rounded-full overflow-hidden">
          <div
            className="h-full rounded-full transition-all duration-500"
            style={{
              width: `${percent}%`,
              background: 'linear-gradient(90deg, #4F46E5 0%, #6366F1 100%)',
            }}
          />
        </div>
      </div>

      {/* Steps */}
      <div className="flex flex-col gap-3">
        {steps.map((step) => (
          <StepRow key={step.index} step={step} />
        ))}
      </div>
    </div>
  )
}

function StepRow({ step }: { step: Step }) {
  const isDone = step.done

  return (
    <div
      className={`flex items-center gap-3 sm:gap-4 rounded-[10px] p-3 sm:p-4`}
      style={{
        background: isDone ? '#F0FDF4' : '#FFFFFF',
        border: isDone ? '1px solid #B9F8CF' : '1px solid #E5E7EB',
      }}
    >
      {/* Icon / number */}
      <div
        className="w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0"
        style={{ background: isDone ? '#00C950' : '#E5E7EB' }}
      >
        {isDone ? (
          <Check className="w-5 h-5 text-white" strokeWidth={3} />
        ) : (
          <span
            className="text-[14px] font-semibold leading-5 text-[#6A7282]"
            style={{ fontFamily: 'Inter, sans-serif' }}
          >
            {step.index}
          </span>
        )}
      </div>

      {/* Label */}
      <p
        className="flex-1 min-w-0 text-[14px] sm:text-[16.9px] font-semibold text-[#364153] leading-5 sm:leading-7 break-words"
        style={{ fontFamily: 'Inter, sans-serif' }}
      >
        {step.label}
      </p>

      {/* CTA */}
      <button
        type="button"
        className={`flex-shrink-0 px-3 h-8 rounded-lg text-white text-[13px] font-semibold leading-none transition-opacity hover:opacity-90`}
        style={{
          background: isDone ? 'rgba(79,70,229,0.5)' : '#4F46E5',
          minWidth: 75,
          fontFamily: 'Inter, sans-serif',
        }}
      >
        {step.cta}
      </button>
    </div>
  )
}
