'use client'

import { Search, HelpCircle, Bell, Settings, Menu } from 'lucide-react'

interface DashboardTopBarProps {
  onMenuClick: () => void
}

export default function DashboardTopBar({ onMenuClick }: DashboardTopBarProps) {
  return (
    <header
      className="h-16 bg-white flex items-center"
      style={{ borderBottom: '0.8px solid #E5E7EB' }}
    >
      <div className="w-full max-w-[1280px] mx-auto px-4 sm:px-6 flex items-center justify-between gap-3 h-[63.2px]">
        {/* Mobile menu button */}
        <button
          onClick={onMenuClick}
          className="lg:hidden p-2 -ml-2 rounded-lg text-[#4A5565] hover:bg-gray-100 transition-colors flex-shrink-0"
          aria-label="Open menu"
        >
          <Menu className="w-5 h-5" />
        </button>

        {/* Search */}
        <div className="flex-1 max-w-[672px]">
          <div
            className="w-full h-9 px-3 flex items-center gap-2 rounded-lg"
            style={{ background: '#F9FAFB', border: '1px solid #E5E7EB' }}
          >
            <Search className="w-4 h-4 flex-shrink-0 text-[#99A1AF]" strokeWidth={2} />
            <input
              type="text"
              placeholder="Search files and folders"
              className="flex-1 bg-transparent outline-none text-[12.9px] leading-none text-[#101828] placeholder:text-[#717182] min-w-0"
              style={{ fontFamily: 'Inter, sans-serif' }}
            />
          </div>
        </div>

        {/* Actions */}
        <div className="flex items-center gap-2 flex-shrink-0">
          <button
            type="button"
            className="w-9 h-9 rounded-lg flex items-center justify-center hover:bg-gray-100 transition-colors"
            aria-label="Help"
          >
            <HelpCircle className="w-4 h-4 text-[#4A5565]" strokeWidth={2} />
          </button>
          <button
            type="button"
            className="w-9 h-9 rounded-lg flex items-center justify-center hover:bg-gray-100 transition-colors relative"
            aria-label="Notifications"
          >
            <Bell className="w-4 h-4 text-[#4A5565]" strokeWidth={2} />
            <span className="absolute top-2 right-2 w-2 h-2 rounded-full bg-red-500" />
          </button>
          <button
            type="button"
            className="w-9 h-9 rounded-lg flex items-center justify-center hover:bg-gray-100 transition-colors"
            aria-label="Settings"
          >
            <Settings className="w-4 h-4 text-[#4A5565]" strokeWidth={2} />
          </button>
        </div>
      </div>
    </header>
  )
}
