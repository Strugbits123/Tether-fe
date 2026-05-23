'use client'

import { useState, useRef, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/lib/context/AuthContext'
import {
  Home,
  FileText,
  Image as ImageIcon,
  MessageSquare,
  BookOpen,
  Shield,
  Activity,
  User,
  Users,
  LogOut,
  ChevronDown,
  X,
} from 'lucide-react'

interface DashboardSidebarProps {
  mobileOpen: boolean
  onClose: () => void
}

const navItems = [
  { label: 'Home', icon: Home, active: true },
  { label: 'Docs & Files', icon: FileText },
  { label: 'Photos', icon: ImageIcon },
  { label: 'Messages', icon: MessageSquare },
  { label: 'My Memoir', icon: BookOpen },
  { label: 'Access', icon: Shield },
  { label: 'Activity', icon: Activity },
]

export default function DashboardSidebar({ mobileOpen, onClose }: DashboardSidebarProps) {
  const router = useRouter()
  const { profile, signOut } = useAuth()
  const [menuOpen, setMenuOpen] = useState(false)
  const menuRef = useRef<HTMLDivElement>(null)

  const firstName = profile?.first_name?.trim() || ''
  const lastName = profile?.last_name?.trim() || ''
  const displayName = firstName && lastName
    ? `${firstName} ${lastName}`
    : firstName || profile?.email?.split('@')[0] || 'User'
  const initials = firstName && lastName
    ? `${firstName[0]}${lastName[0]}`.toUpperCase()
    : displayName.charAt(0).toUpperCase()

  // Close dropdown when clicking outside
  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setMenuOpen(false)
      }
    }
    if (menuOpen) {
      document.addEventListener('mousedown', handleClickOutside)
    }
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [menuOpen])

  return (
    <>
      {/* Mobile overlay */}
      {mobileOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-30 lg:hidden"
          onClick={onClose}
          aria-hidden="true"
        />
      )}

      <aside
        className={`
          fixed lg:sticky top-0 left-0 h-screen w-64 z-40
          flex flex-col flex-shrink-0
          bg-[#4F46E5]
          transition-transform duration-300 ease-in-out
          ${mobileOpen ? 'translate-x-0' : '-translate-x-full'}
          lg:translate-x-0
        `}
        style={{
          background: 'linear-gradient(180deg, #4F46E5 0%, #4338CA 100%)',
        }}
      >
        {/* Logo row */}
        <div
          className="h-16 px-4 flex items-center justify-between flex-shrink-0"
          style={{ borderBottom: '0.8px solid rgba(255,255,255,0.1)' }}
        >
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src="/Logo.png"
            alt="Tether"
            className="h-[30px] w-auto select-none brightness-0 invert"
          />
          <button
            onClick={onClose}
            className="lg:hidden text-white/80 hover:text-white p-1"
            aria-label="Close menu"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Scrollable middle */}
        <div className="flex-1 overflow-y-auto flex flex-col">
          {/* Nav items */}
          <nav className="p-3 flex flex-col gap-1">
            {navItems.map((item) => {
              const Icon = item.icon
              return (
                <button
                  key={item.label}
                  type="button"
                  className={`
                    flex items-center gap-3 px-4 py-3 rounded-lg w-full text-left
                    text-white text-[16px] font-semibold leading-6
                    transition-colors cursor-pointer
                    ${
                      item.active
                        ? 'bg-white/10 border-l-2 border-white'
                        : 'hover:bg-white/5 border-l-2 border-transparent'
                    }
                  `}
                  style={{ fontFamily: 'Inter, sans-serif' }}
                >
                  <Icon className="w-5 h-5 flex-shrink-0" strokeWidth={1.75} />
                  <span className="flex-1">{item.label}</span>
                </button>
              )
            })}
          </nav>

          <div className="flex-1" />
        </div>

        {/* Account footer with dropdown */}
        <div
          ref={menuRef}
          className="p-4 flex flex-col gap-2 flex-shrink-0 relative"
          style={{ borderTop: '0.8px solid rgba(255,255,255,0.1)' }}
        >
          {/* Dropdown menu — appears above the button */}
          {menuOpen && (
            <div
              className="absolute bottom-full left-4 right-4 mb-2 bg-white rounded-[10px] overflow-hidden"
              style={{
                borderTop: '1.25px solid #E5E7EB',
                boxShadow:
                  '0px 4px 6px -4px rgba(0,0,0,0.1), 0px 10px 15px -3px rgba(0,0,0,0.1)',
              }}
            >
              <button
                type="button"
                className="w-full flex items-center gap-3 px-4 py-[10px] hover:bg-gray-50 transition-colors cursor-pointer"
                style={{ borderBottom: '1px solid #E5E7EB' }}
              >
                <User className="w-4 h-4 text-[#364153]" strokeWidth={1.75} />
                <span
                  className="text-[14px] font-medium text-[#364153] leading-5"
                  style={{ fontFamily: 'Inter, sans-serif', letterSpacing: '-0.15px' }}
                >
                  My Settings
                </span>
              </button>

              <button
                type="button"
                className="w-full flex items-center gap-3 px-4 py-[10px] hover:bg-gray-50 transition-colors cursor-pointer"
                style={{ borderBottom: '1.25px solid #E5E7EB' }}
              >
                <Users className="w-[18px] h-[18px] text-[#364153]" strokeWidth={1.75} />
                <span
                  className="text-[14px] font-medium text-[#364153] leading-5"
                  style={{ fontFamily: 'Inter, sans-serif', letterSpacing: '-0.15px' }}
                >
                  Switch Account
                </span>
              </button>

              <button
                type="button"
                onClick={() => { setMenuOpen(false); signOut() }}
                className="w-full flex items-center gap-3 px-[18px] py-[10px] hover:bg-red-50 transition-colors cursor-pointer"
              >
                <LogOut className="w-[15px] h-[15px] text-[#FF0000]" strokeWidth={2} />
                <span
                  className="text-[14px] font-medium text-[#FF0000] leading-5"
                  style={{ fontFamily: 'Inter, sans-serif', letterSpacing: '-0.15px' }}
                >
                  Log out
                </span>
              </button>
            </div>
          )}

          <p
            className="text-[11.1px] leading-4 text-white/60"
            style={{ fontFamily: 'Inter, sans-serif' }}
          >
            Your Account
          </p>
          <button
            type="button"
            onClick={() => setMenuOpen((prev) => !prev)}
            className="flex items-center gap-2 p-2 rounded-lg hover:bg-white/5 transition-colors w-full cursor-pointer"
          >
            <div className="w-8 h-8 rounded-full bg-white/20 flex items-center justify-center flex-shrink-0">
              <span
                className="text-white font-semibold text-[13px] leading-5"
                style={{ fontFamily: 'Inter, sans-serif' }}
              >
                {initials}
              </span>
            </div>
            <span
              className="flex-1 text-left text-white font-semibold text-[14px] leading-5 truncate"
              style={{ fontFamily: 'Inter, sans-serif' }}
            >
              {displayName}
            </span>
            <ChevronDown
              className={`w-4 h-4 text-white/70 transition-transform duration-200 ${menuOpen ? 'rotate-180' : ''}`}
              strokeWidth={2}
            />
          </button>
        </div>
      </aside>
    </>
  )
}
