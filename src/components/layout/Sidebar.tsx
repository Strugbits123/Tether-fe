'use client'

import Badge from '@/components/ui/Badge'
import { useAuth } from '@/lib/context/AuthContext'
import { useToast } from '@/lib/context/ToastContext'
import { getInitials } from '@/lib/utils'
import {
  BookOpen,
  FileText,
  HelpCircle,
  Image,
  LayoutDashboard,
  LogOut,
  Settings,
  Users,
  Video,
} from 'lucide-react'
import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'

interface NavItem {
  label: string
  href: string
  icon: React.ElementType
  comingSoon?: boolean
}

const navItems: NavItem[] = [
  { label: 'Dashboard', href: '/dashboard', icon: LayoutDashboard },
  { label: 'Messages', href: '/messages', icon: Video, comingSoon: true },
  { label: 'Documents', href: '/documents', icon: FileText, comingSoon: true },
  { label: 'Photos', href: '/photos', icon: Image, comingSoon: true },
  { label: 'story', href: '/story', icon: BookOpen, comingSoon: true },
  { label: 'Recipients', href: '/recipients', icon: Users, comingSoon: true },
  { label: 'Settings', href: '/settings', icon: Settings },
  { label: 'Help', href: '/help', icon: HelpCircle, comingSoon: true },
]

interface SidebarProps {
  mobileOpen?: boolean
  onClose?: () => void
}

export default function Sidebar({ mobileOpen, onClose }: SidebarProps) {
  const pathname = usePathname()
  const { user, signOut } = useAuth()
  const { showToast } = useToast()
  const router = useRouter()

  const displayName = user?.user_metadata?.full_name || user?.email?.split('@')[0] || 'User'
  const email = user?.email || ''

  const handleNavClick = (item: NavItem, e: React.MouseEvent) => {
    if (item.comingSoon) {
      e.preventDefault()
      showToast('This feature is coming soon.', 'info')
    } else {
      onClose?.()
      router.push(item.href)
    }
  }

  return (
    <>
      {/* Mobile overlay */}
      {mobileOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-20 lg:hidden"
          onClick={onClose}
        />
      )}

      <aside
        className={`
          fixed top-0 left-0 h-full w-64 bg-[#1E293B] flex flex-col z-30
          transition-transform duration-300 ease-in-out
          lg:static lg:translate-x-0
          ${mobileOpen ? 'translate-x-0' : '-translate-x-full'}
        `}
      >
        {/* Logo */}
        <div className="px-5 py-5 border-b border-slate-700">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 bg-[#4338CA] rounded-lg flex items-center justify-center">
              <span className="text-white font-bold text-xs">T</span>
            </div>
            <span className="text-white font-bold text-xl">Tether</span>
          </div>
        </div>

        {/* User info */}
        <div className="px-5 py-4 border-b border-slate-700">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-full bg-[#4338CA] flex items-center justify-center flex-shrink-0">
              <span className="text-white text-sm font-semibold">{getInitials(displayName)}</span>
            </div>
            <div className="min-w-0">
              <p className="text-white text-sm font-medium truncate">{displayName}</p>
              <p className="text-slate-400 text-xs truncate">{email}</p>
            </div>
          </div>
        </div>

        {/* Navigation */}
        <nav className="flex-1 px-3 py-4 space-y-0.5 overflow-y-auto">
          {navItems.map((item) => {
            const Icon = item.icon
            const isActive = pathname === item.href

            return (
              <Link
                key={item.href}
                href={item.comingSoon ? '#' : item.href}
                onClick={(e) => handleNavClick(item, e)}
                className={`
                  flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm transition-colors duration-150
                  ${isActive
                    ? 'bg-[#4338CA] text-white'
                    : item.comingSoon
                      ? 'text-slate-600 cursor-not-allowed'
                      : 'text-slate-400 hover:text-white hover:bg-slate-700'
                  }
                `}
              >
                <Icon className="w-4 h-4 flex-shrink-0" />
                <span className="flex-1">{item.label}</span>
                {item.comingSoon && (
                  <Badge className="text-[10px] px-1.5 py-0 bg-slate-700 text-slate-400 border-0">
                    Soon
                  </Badge>
                )}
              </Link>
            )
          })}
        </nav>

        {/* Bottom section */}
        <div className="px-3 py-4 border-t border-slate-700 space-y-2">
          <div className="flex items-center gap-2 px-3 py-2">
            <div className="w-2 h-2 rounded-full bg-slate-600" />
            <span className="text-xs text-slate-500">Release Manager: Not designated</span>
          </div>
          <button
            onClick={signOut}
            className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm text-slate-400 hover:text-white hover:bg-slate-700 transition-colors w-full"
          >
            <LogOut className="w-4 h-4" />
            <span>Log out</span>
          </button>
        </div>
      </aside>
    </>
  )
}
