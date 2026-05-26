'use client'

import { cn } from '@/lib/utils'
import { ArrowRight, LucideIcon } from 'lucide-react'
import Link from 'next/link'

interface QuickActionCardProps {
  title: string
  subtitle: string
  href: string
  icon: LucideIcon
  iconColor: string
  iconBg: string
}

export default function QuickActionCard({ title, subtitle, href, icon: Icon, iconColor, iconBg }: QuickActionCardProps) {
  return (
    <Link
      href={href}
      className={cn(
        'bg-white rounded-xl shadow-sm p-6 flex items-center gap-4',
        'border border-transparent hover:border-[#4338CA] hover:shadow-md',
        'transition-all duration-200 group'
      )}
    >
      <div className={cn('w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0', iconBg)}>
        <Icon className={cn('w-6 h-6', iconColor)} />
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-sm font-semibold text-[#1E293B]">{title}</p>
        <p className="text-xs text-[#64748B] mt-0.5 truncate">{subtitle}</p>
      </div>
      <ArrowRight className="w-4 h-4 text-[#64748B] group-hover:text-[#4338CA] transition-colors flex-shrink-0" />
    </Link>
  )
}
