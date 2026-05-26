'use client'

import { cn } from '@/lib/utils'
import type { OnboardingStep } from '@/types'
import Link from 'next/link'

interface OnboardingWidgetProps {
  steps: OnboardingStep[]
}

function CheckmarkIcon({ animated }: { animated?: boolean }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" className="w-full h-full">
      <circle cx="12" cy="12" r="12" fill="#16A34A" />
      <path
        d="M7 12.5l3.5 3.5 6-7"
        stroke="white"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        className={animated ? 'animate-checkmark' : ''}
        style={animated ? { strokeDasharray: 100 } : undefined}
      />
    </svg>
  )
}

export default function OnboardingWidget({ steps }: OnboardingWidgetProps) {
  const completedCount = steps.filter((s) => s.completed).length
  const progressPercent = Math.round((completedCount / steps.length) * 100)
  const firstIncompleteIndex = steps.findIndex((s) => !s.completed)

  return (
    <div className="bg-white rounded-xl shadow-sm p-6 mb-6">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h2 className="text-lg font-semibold text-[#1E293B]">Get started with Tether</h2>
          <p className="text-sm text-[#64748B] mt-0.5">
            {completedCount} of {steps.length} steps complete
          </p>
        </div>
        <span className="text-sm font-semibold text-[#4338CA]">{progressPercent}%</span>
      </div>

      {/* Progress bar */}
      <div className="w-full h-2 bg-[#E2E8F0] rounded-full mb-6 overflow-hidden">
        <div
          className="h-full bg-[#4338CA] rounded-full transition-all duration-500"
          style={{ width: `${progressPercent}%` }}
        />
      </div>

      {/* Steps grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3">
        {steps.map((step, i) => {
          const isActive = i === firstIncompleteIndex
          const isFuture = !step.completed && i > firstIncompleteIndex

          return (
            <Link
              key={step.key}
              href={step.href}
              className={cn(
                'flex flex-col items-center text-center p-3 rounded-lg border transition-colors duration-150',
                step.completed && 'border-green-100 bg-green-50 hover:bg-green-100',
                isActive && 'border-indigo-200 bg-indigo-50 hover:bg-indigo-100',
                isFuture && 'border-[#E2E8F0] bg-[#F8FAFC] hover:bg-[#F1F5F9]'
              )}
            >
              {/* Step indicator */}
              <div className="w-8 h-8 mb-2">
                {step.completed ? (
                  <CheckmarkIcon animated />
                ) : (
                  <div
                    className={cn(
                      'w-8 h-8 rounded-full flex items-center justify-center text-sm font-semibold',
                      isActive && 'bg-[#4338CA] text-white',
                      isFuture && 'bg-[#E2E8F0] text-[#94A3B8]'
                    )}
                  >
                    {i + 1}
                  </div>
                )}
              </div>

              <p
                className={cn(
                  'text-xs font-medium leading-tight',
                  step.completed && 'text-[#16A34A]',
                  isActive && 'text-[#4338CA] font-semibold',
                  isFuture && 'text-[#94A3B8]'
                )}
              >
                {step.label}
              </p>
              <p
                className={cn(
                  'text-[10px] mt-0.5 leading-tight',
                  step.completed ? 'text-green-600' : 'text-[#94A3B8]'
                )}
              >
                {step.description}
              </p>
            </Link>
          )
        })}
      </div>
    </div>
  )
}
