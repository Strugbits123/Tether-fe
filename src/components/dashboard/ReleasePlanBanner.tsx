'use client'

import Button from '@/components/ui/Button'
import { AlertTriangle } from 'lucide-react'

interface ReleasePlan {
  id: string
  scheduled_delivery_date: string
}

interface ReleasePlanBannerProps {
  plan: ReleasePlan | null
}

export default function ReleasePlanBanner({ plan }: ReleasePlanBannerProps) {
  if (!plan) return null

  const deliveryDate = new Date(plan.scheduled_delivery_date).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  })

  return (
    <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 flex items-center gap-4 mb-6">
      <AlertTriangle className="w-5 h-5 text-[#D97706] flex-shrink-0" />
      <div className="flex-1">
        <p className="text-sm font-semibold text-[#92400E]">
          Active Release Plan — {plan.id}
        </p>
        <p className="text-xs text-[#92400E] mt-0.5">
          Scheduled delivery: {deliveryDate}
        </p>
      </div>
      <Button variant="danger" size="sm">
        Cancel
      </Button>
    </div>
  )
}
