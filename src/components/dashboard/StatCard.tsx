'use client'

import { cn } from '@/lib/utils'
import { LucideIcon } from 'lucide-react'

interface StatCardProps {
  label: string
  count: number
  icon: LucideIcon
  iconColor: string
  iconBg: string
  index: number
}

export default function StatCard({ label, count, icon: Icon, iconColor, iconBg, index }: StatCardProps) {
  return (
    <div
      className="bg-white rounded-xl shadow-sm p-6 hover:shadow-md transition-shadow duration-200"
      style={{
        animationDelay: `${index * 60}ms`,
        animation: 'pageEnter 300ms ease-out both',
      }}
    >
      <div className="flex items-start justify-between">
        <div>
          <p className="text-xs font-medium text-[#64748B] uppercase tracking-wide mb-2">{label}</p>
          <p className={cn('text-3xl font-bold text-[#1E293B]')}>
            {count === 0 ? '—' : count}
          </p>
        </div>
        <div className={cn('w-10 h-10 rounded-lg flex items-center justify-center', iconBg)}>
          <Icon className={cn('w-5 h-5', iconColor)} />
        </div>
      </div>
    </div>
  )
}
