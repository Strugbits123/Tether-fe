'use client'

import { useAuth } from '@/lib/context/AuthContext'
import { getInitials } from '@/lib/utils'
import { Bell, Menu } from 'lucide-react'

interface TopBarProps {
  title: string
  onMenuClick: () => void
}

export default function TopBar({ title, onMenuClick }: TopBarProps) {
  const { user } = useAuth()
  const displayName = user?.user_metadata?.full_name || user?.email?.split('@')[0] || 'User'

  return (
    <header className="h-14 bg-white border-b border-[#E2E8F0] px-6 flex items-center justify-between flex-shrink-0">
      <div className="flex items-center gap-3">
        <button
          onClick={onMenuClick}
          className="lg:hidden p-1 rounded-lg text-[#64748B] hover:bg-[#F1F5F9] transition-colors min-h-[44px] min-w-[44px] flex items-center justify-center"
          aria-label="Open menu"
        >
          <Menu className="w-5 h-5" />
        </button>
        <h1 className="text-lg font-semibold text-[#1E293B]">{title}</h1>
      </div>

      <div className="flex items-center gap-3">
        <button
          className="p-2 rounded-lg text-[#64748B] hover:bg-[#F1F5F9] transition-colors relative min-h-[44px] min-w-[44px] flex items-center justify-center"
          aria-label="Notifications"
        >
          <Bell className="w-5 h-5" />
        </button>

        <div className="w-8 h-8 rounded-full bg-[#4338CA] flex items-center justify-center">
          <span className="text-white text-xs font-semibold">{getInitials(displayName)}</span>
        </div>
      </div>
    </header>
  )
}
