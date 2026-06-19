'use client'

import Image from 'next/image'
import { useEffect, useRef, useState } from 'react'
import { usePathname, useRouter } from 'next/navigation'
import { useAuth } from '@/lib/context/AuthContext'
import FinishProfileModal from '@/components/dashboard/FinishProfileModal'
import {
  Bell,
  ChevronDown,
  Download,
  FileCheck,
  HelpCircle,
  Home,
  LogOut,
  User,
  Users,
} from 'lucide-react'

interface ReleaseManagerSidebarProps {
  mobileOpen: boolean
  onClose: () => void
}

type NavItem = {
  label: string
  icon: typeof Home
  href?: string
  count?: number
  onClick?: () => void
}

const SECONDARY_NAV: NavItem[] = [
  { label: 'Download everything', icon: Download },
  { label: 'Get support', icon: HelpCircle },
]

export default function ReleaseManagerSidebar({
  mobileOpen,
  onClose,
}: ReleaseManagerSidebarProps) {
  const router = useRouter()
  const pathname = usePathname()
  const { signOut } = useAuth()
  const [menuOpen, setMenuOpen] = useState(false)
  const [profileOpen, setProfileOpen] = useState(false)
  const menuRef = useRef<HTMLDivElement>(null)

  // My Profile opens the shared profile modal; Overview and Release Plan are
  // live pages. The rest are static for now.
  const PRIMARY_NAV: NavItem[] = [
    { label: 'My Profile', icon: User, onClick: () => setProfileOpen(true) },
    { label: 'Overview', icon: Home, href: '/rm' },
    { label: 'Release Plan', icon: FileCheck, href: '/rm/release-plan' },
    { label: 'Recipients', icon: Users, count: 3 },
    { label: 'Notifications', icon: Bell },
  ]

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setMenuOpen(false)
      }
    }
    if (menuOpen) document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [menuOpen])

  const renderNavItem = (item: NavItem) => {
    const Icon = item.icon
    const isActive = !!item.href && pathname === item.href
    return (
      <button
        key={item.label}
        type="button"
        onClick={() => {
          if (item.href) router.push(item.href)
          item.onClick?.()
          onClose()
        }}
        className="flex items-center w-full text-left rounded-[10px] transition-colors cursor-pointer hover:bg-white/5"
        style={{
          gap: 12,
          padding: '10px 12px',
          background: isActive ? 'rgba(255,255,255,0.1)' : 'transparent',
          borderLeft: isActive
            ? '2px solid #FFFFFF'
            : '2px solid transparent',
        }}
      >
        <Icon
          className="flex-shrink-0"
          style={{
            width: 16,
            height: 16,
            color: isActive ? '#FFFFFF' : 'rgba(255,255,255,0.6)',
          }}
          strokeWidth={2}
        />
        <span
          className="flex-1"
          style={{
            fontFamily: 'Inter, sans-serif',
            fontWeight: 500,
            fontSize: 14,
            lineHeight: '21px',
            letterSpacing: '-0.15px',
            color: isActive ? '#FFFFFF' : 'rgba(255,255,255,0.6)',
          }}
        >
          {item.label}
        </span>
        {typeof item.count === 'number' && (
          <span
            className="flex items-center justify-center flex-shrink-0"
            style={{
              minWidth: 23,
              height: 20,
              padding: '0 6px',
              borderRadius: 9999,
              background: 'rgba(255,255,255,0.2)',
              fontFamily: 'Inter, sans-serif',
              fontWeight: 600,
              fontSize: 11,
              lineHeight: '16.5px',
              letterSpacing: '0.06px',
              color: '#FFFFFF',
            }}
          >
            {item.count}
          </span>
        )}
      </button>
    )
  }

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
          fixed lg:sticky top-0 left-0 h-screen w-60 z-40
          flex flex-col flex-shrink-0
          transition-transform duration-300 ease-in-out
          ${mobileOpen ? 'translate-x-0' : '-translate-x-full'}
          lg:translate-x-0
        `}
        style={{ background: '#2D3142' }}
      >
        {/* Logo / portal label */}
        <div
          className="flex-shrink-0"
          style={{
            padding: '20px 24px',
            borderBottom: '1.25px solid rgba(255,255,255,0.1)',
          }}
        >
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src="/Logo.png"
            alt="Tether"
            className="h-[33px] w-auto select-none brightness-0 invert"
          />
          <p
            className="mt-1"
            style={{
              fontFamily: 'Inter, sans-serif',
              fontWeight: 600,
              fontSize: 11,
              lineHeight: '16.5px',
              letterSpacing: '0.61px',
              textTransform: 'uppercase',
              color: 'rgba(255,255,255,0.6)',
            }}
          >
            Release Manager Portal
          </p>
        </div>

        {/* Nav */}
        <div className="flex-1 overflow-y-auto flex flex-col" style={{ padding: '24px 16px', gap: 24 }}>
          <nav className="flex flex-col" style={{ gap: 4 }}>
            {PRIMARY_NAV.map(renderNavItem)}
          </nav>

          <div style={{ height: 1, background: 'rgba(255,255,255,0.1)' }} />

          <nav className="flex flex-col" style={{ gap: 4 }}>
            {SECONDARY_NAV.map(renderNavItem)}

            {/* Create my Tether — links back to the main app */}
            <button
              type="button"
              onClick={() => {
                router.push('/dashboard')
                onClose()
              }}
              className="flex items-center w-full text-left rounded-[10px] hover:bg-white/5 transition-colors cursor-pointer"
              style={{ gap: 10, padding: '10px 12px' }}
            >
              <Image
                src="/images/Dashboard/Greet.svg"
                alt=""
                width={17}
                height={17}
                className="flex-shrink-0"
              />
              <span
                className="flex-1"
                style={{
                  fontFamily: 'Inter, sans-serif',
                  fontWeight: 500,
                  fontSize: 14,
                  lineHeight: '19px',
                  letterSpacing: '-0.15px',
                  color: 'rgba(255,255,255,0.6)',
                }}
              >
                Create my Tether
              </span>
              <span
                className="flex items-center justify-center flex-shrink-0"
                style={{
                  height: 19,
                  padding: '0 8px',
                  borderRadius: 9999,
                  background: '#10B981',
                  fontFamily: 'Inter, sans-serif',
                  fontWeight: 700,
                  fontSize: 10,
                  lineHeight: '15px',
                  letterSpacing: '0.12px',
                  color: '#FFFFFF',
                }}
              >
                25% off
              </span>
            </button>
          </nav>
        </div>

        {/* Account footer with dropdown */}
        <div
          ref={menuRef}
          className="flex-shrink-0 relative"
          style={{
            padding: '17px 16px',
            borderTop: '1.25px solid rgba(255,255,255,0.1)',
          }}
        >
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
                onClick={() => {
                  setMenuOpen(false)
                  signOut()
                }}
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

          <button
            type="button"
            onClick={() => setMenuOpen((prev) => !prev)}
            className="flex items-center w-full rounded-lg hover:bg-white/5 transition-colors cursor-pointer"
            style={{ gap: 12 }}
          >
            <div
              className="flex items-center justify-center flex-shrink-0"
              style={{
                width: 40,
                height: 40,
                borderRadius: 9999,
                background: '#FEF3C7',
                fontFamily: 'Inter, sans-serif',
                fontWeight: 600,
                fontSize: 13,
                lineHeight: '19.5px',
                letterSpacing: '-0.08px',
                color: '#92400E',
              }}
            >
              MW
            </div>
            <div className="flex-1 min-w-0 text-left">
              <p
                className="truncate"
                style={{
                  fontFamily: 'Inter, sans-serif',
                  fontWeight: 500,
                  fontSize: 14,
                  lineHeight: '21px',
                  letterSpacing: '-0.15px',
                  color: '#FFFFFF',
                }}
              >
                Marcus Webb
              </p>
              <p
                className="truncate"
                style={{
                  fontFamily: 'Inter, sans-serif',
                  fontWeight: 400,
                  fontSize: 12,
                  lineHeight: '18px',
                  color: 'rgba(255,255,255,0.5)',
                }}
              >
                Executor for Sarah Holder
              </p>
            </div>
            <ChevronDown
              className={`w-4 h-4 flex-shrink-0 transition-transform duration-200 ${menuOpen ? 'rotate-180' : ''}`}
              style={{ color: 'rgba(255,255,255,0.7)' }}
              strokeWidth={2}
            />
          </button>
        </div>
      </aside>

      <FinishProfileModal
        open={profileOpen}
        onClose={() => setProfileOpen(false)}
        title="My Profile"
        phoneHelpText="We will use this for important account info - never for marketing. See our Privacy Policy for additional details."
      />
    </>
  )
}
