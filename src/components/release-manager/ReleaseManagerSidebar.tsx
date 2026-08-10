'use client'

import Image from 'next/image'
import { useEffect, useRef, useState } from 'react'
import { usePathname, useRouter } from 'next/navigation'
import { useAuth } from '@/lib/context/AuthContext'
import { getAccessToken } from '@/lib/supabase/getAccessToken'
import { getRmOverview, getUnreadCount } from '@/lib/api/rm'
import {
  Bell,
  ChevronDown,
  Download,
  FileCheck,
  HelpCircle,
  Home,
  LogOut,
  Package,
  User,
  Users,
  Video,
} from 'lucide-react'

interface ReleaseManagerSidebarProps {
  mobileOpen: boolean
  onClose: () => void
  /** Resolved server-side by the (rm) layout to avoid a client-fetch flicker. */
  hasOwnerAccount: boolean
}

type NavItem = {
  label: string
  icon: typeof Home
  href?: string
  count?: number
  onClick?: () => void
}

const SECONDARY_NAV: NavItem[] = [
  { label: 'Get support', icon: HelpCircle, href: '/rm/help' },
]

// Videos live in Mux and are downloaded individually, everything else comes
// down as one ZIP — two genuinely different flows, so "Download everything"
// expands rather than linking straight to a page.
const DOWNLOAD_CHILDREN: Array<{ label: string; icon: typeof Home; href: string }> = [
  { label: 'Download videos', icon: Video, href: '/rm/downloads/videos' },
  { label: 'Download other content', icon: Package, href: '/rm/downloads' },
]

export default function ReleaseManagerSidebar({
  mobileOpen,
  onClose,
  hasOwnerAccount,
}: ReleaseManagerSidebarProps) {
  const router = useRouter()
  const pathname = usePathname()
  const { profile, signOut, switchAccount, membershipCount } = useAuth()
  const [menuOpen, setMenuOpen] = useState(false)
  // Default is route-driven: expanded whenever a downloads page is open. A click
  // on the header overrides that, but the override is scoped to the pathname it
  // was made on, so it lapses as soon as the user navigates — otherwise
  // collapsing the group once would keep it collapsed forever, including when
  // navigating straight into /rm/downloads. Keyed this way rather than reset in
  // an effect so there's no second render pass on every navigation.
  const [downloadsOverride, setDownloadsOverride] = useState<{
    path: string
    open: boolean
  } | null>(null)
  const [ownerName, setOwnerName] = useState<string | null>(null)
  const [recipientCount, setRecipientCount] = useState<number | null>(null)
  const [unreadCount, setUnreadCount] = useState<number | null>(null)
  const menuRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    let cancelled = false
    ;(async () => {
      const token = await getAccessToken()
      if (!token || cancelled) return
      try {
        const overview = await getRmOverview(token)
        if (!cancelled) {
          setOwnerName(overview.account_owner.name)
          setRecipientCount(overview.content_stats.recipients)
        }
      } catch {
        // Sidebar chrome degrades gracefully without these — pages that need
        // the data will surface their own error state.
      }
    })()
    return () => {
      cancelled = true
    }
  }, [])

  useEffect(() => {
    let cancelled = false
    const poll = async () => {
      const token = await getAccessToken()
      if (!token || cancelled) return
      try {
        const { unread_count } = await getUnreadCount(token)
        if (!cancelled) setUnreadCount(unread_count)
      } catch {
        // Badge just stays hidden if this fails.
      }
    }
    poll()
    const interval = setInterval(poll, 60000)
    return () => {
      cancelled = true
      clearInterval(interval)
    }
  }, [])

  const firstName = profile?.first_name?.trim() || ''
  const lastName = profile?.last_name?.trim() || ''
  const displayName =
    firstName && lastName ? `${firstName} ${lastName}` : firstName || profile?.email?.split('@')[0] || 'Release Manager'
  const initials = firstName && lastName
    ? `${firstName[0]}${lastName[0]}`.toUpperCase()
    : displayName.charAt(0).toUpperCase()

  const PRIMARY_NAV: NavItem[] = [
    { label: 'My Profile', icon: User, href: '/rm/profile' },
    { label: 'Overview', icon: Home, href: '/rm/overview' },
    { label: 'Release Plan', icon: FileCheck, href: '/rm/release-plan' },
    {
      label: 'Recipients',
      icon: Users,
      href: '/rm/recipients',
      count: recipientCount ?? undefined,
    },
    {
      label: 'Notifications',
      icon: Bell,
      href: '/rm/notifications',
      count: unreadCount ? unreadCount : undefined,
    },
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

  const inDownloads = pathname?.startsWith('/rm/downloads') ?? false
  const downloadsExpanded =
    downloadsOverride && downloadsOverride.path === pathname
      ? downloadsOverride.open
      : inDownloads

  const renderDownloadsGroup = () => (
    <div className="flex flex-col" style={{ gap: 4 }}>
      <button
        type="button"
        aria-expanded={downloadsExpanded}
        aria-controls="rm-downloads-subnav"
        onClick={() =>
          setDownloadsOverride({ path: pathname ?? '', open: !downloadsExpanded })
        }
        className="flex items-center w-full text-left rounded-[10px] transition-colors cursor-pointer hover:bg-white/5"
        style={{
          gap: 12,
          padding: '10px 12px',
          // The header is a disclosure control, not a destination, so it never
          // takes the active treatment — the child page owns that.
          background: 'transparent',
          borderLeft: '2px solid transparent',
        }}
      >
        <Download
          className="flex-shrink-0"
          style={{
            width: 16,
            height: 16,
            color: inDownloads ? '#FFFFFF' : 'rgba(255,255,255,0.6)',
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
            color: inDownloads ? '#FFFFFF' : 'rgba(255,255,255,0.6)',
          }}
        >
          Download everything
        </span>
        <ChevronDown
          className={`flex-shrink-0 transition-transform duration-200 ${
            downloadsExpanded ? 'rotate-180' : ''
          }`}
          style={{ width: 15, height: 15, color: 'rgba(255,255,255,0.5)' }}
          strokeWidth={2}
        />
      </button>

      {downloadsExpanded && (
        <div id="rm-downloads-subnav" className="flex flex-col" style={{ gap: 2 }}>
          {DOWNLOAD_CHILDREN.map((child) => {
            const ChildIcon = child.icon
            // Exact match: /rm/downloads/videos must not also light up
            // /rm/downloads.
            const isActive = pathname === child.href
            return (
              <button
                key={child.href}
                type="button"
                onClick={() => {
                  router.push(child.href)
                  onClose()
                }}
                className="flex items-center w-full text-left rounded-[8px] transition-colors cursor-pointer hover:bg-white/5"
                style={{
                  gap: 10,
                  padding: '8px 12px 8px 26px',
                  background: isActive ? 'rgba(255,255,255,0.1)' : 'transparent',
                  borderLeft: isActive ? '2px solid #FFFFFF' : '2px solid transparent',
                }}
              >
                <ChildIcon
                  className="flex-shrink-0"
                  style={{
                    width: 14,
                    height: 14,
                    color: isActive ? '#FFFFFF' : 'rgba(255,255,255,0.5)',
                  }}
                  strokeWidth={2}
                />
                <span
                  className="flex-1"
                  style={{
                    fontFamily: 'Inter, sans-serif',
                    fontWeight: 500,
                    fontSize: 13,
                    lineHeight: '19px',
                    letterSpacing: '-0.12px',
                    color: isActive ? '#FFFFFF' : 'rgba(255,255,255,0.55)',
                  }}
                >
                  {child.label}
                </span>
              </button>
            )
          })}
        </div>
      )}
    </div>
  )

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
            {renderDownloadsGroup()}
            {SECONDARY_NAV.map(renderNavItem)}

            {/* Create my Tether — links back to the main app. Only relevant
                for RMs who don't already have their own owner account. */}
            {!hasOwnerAccount && (
              <button
                type="button"
                onClick={() => {
                  router.push('/rm/create-account')
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
            )}
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
              {membershipCount !== null && membershipCount > 1 && (
                <button
                  type="button"
                  onClick={() => {
                    setMenuOpen(false)
                    switchAccount()
                  }}
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
              )}
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
              {initials}
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
                {displayName}
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
                {ownerName ? `Release Manager for ${ownerName}` : 'Release Manager'}
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
    </>
  )
}
