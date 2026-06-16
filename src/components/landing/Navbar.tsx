"use client"

import React, { useState } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { FiMenu, FiX } from 'react-icons/fi'
import { useAuth } from '@/lib/context/AuthContext'

const NAV_LINKS = [
  { label: 'Home',         href: '#home' },
  { label: 'How it works', href: '#how-it-works' },
  { label: 'About Us',     href: '#about' },
  { label: 'Pricing',      href: '#pricing' },
]

export default function Navbar() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const { session } = useAuth()
  const signedIn = !!session

  return (
    <header className="sticky top-0 z-50 bg-white border-b border-slate-100">

      {/* Outer container: max 1095px, height 59px, space-between */}
      <div className="max-w-[1095px] mx-auto h-[59px] px-4 xl:px-0 flex items-center justify-between">

        {/* ── DESKTOP XL: exact spec layout (gap: 184px between 3 groups) ── */}
        <div className="hidden xl:flex items-center w-full" style={{ gap: '184px' }}>

          {/* Logo: 145×30 */}
          <div className="flex-shrink-0">
            <Image src="/Logo.png" width={145} height={30} alt="Tether" priority />
          </div>

          {/* Nav links: height 33, gap: 3.98px, padding 6px 13px, border-radius 10px */}
          <nav className="flex items-center flex-shrink-0" style={{ gap: '3.98px' }}>
            {NAV_LINKS.map(({ label, href }) => (
              <Link
                key={label}
                href={href}
                className="flex items-center justify-center rounded-[10px] hover:bg-slate-50 transition-colors whitespace-nowrap"
                style={{
                  height: '33px',
                  padding: '6px 13px',
                  fontFamily: 'Inter, sans-serif',
                  fontWeight: 400,
                  fontSize: '14px',
                  lineHeight: '21px',
                  letterSpacing: '0px',
                  color: '#626262',
                }}
              >
                {label}
              </Link>
            ))}
          </nav>

          {/* CTA buttons: width 208, height 35, gap: 11.99px */}
          <div className="flex items-center flex-shrink-0" style={{ gap: '11.99px' }}>
            {signedIn ? (
              <Link
                href="/dashboard"
                className="flex items-center justify-center rounded-[10px] bg-[#4F46E5] hover:bg-[#4338CA] transition-colors flex-shrink-0"
                style={{
                  height: '35px',
                  padding: '7px 18px',
                  boxShadow: '0px 1px 2px 0px #4F46E54D',
                  fontFamily: 'Inter, sans-serif',
                  fontWeight: 500,
                  fontSize: '13px',
                  lineHeight: '19.5px',
                  color: '#FFFFFF',
                  textAlign: 'center',
                }}
              >
                Go to Portal
              </Link>
            ) : (
              <>
                {/* Sign in: 76×35, border #374151 */}
                <Link
                  href="/signin"
                  className="flex items-center justify-center rounded-[10px] border border-[#374151] hover:bg-slate-50 transition-colors flex-shrink-0"
                  style={{
                    width: '78px',
                    height: '35px',
                    padding: '7px 15px',
                    fontFamily: 'Inter, sans-serif',
                    fontWeight: 500,
                    fontSize: '14px',
                    lineHeight: '21px',
                    color: '#374151',
                  }}
                >
                  Sign in
                </Link>
                {/* Start free trial: 122×35, bg #4F46E5 */}
                <Link
                  href="/signup"
                  className="flex items-center justify-center rounded-[10px] bg-[#4F46E5] hover:bg-[#4338CA] transition-colors flex-shrink-0"
                  style={{
                    width: '122px',
                    height: '35px',
                    padding: '7px 14px',
                    boxShadow: '0px 1px 2px 0px #4F46E54D',
                    fontFamily: 'Inter, sans-serif',
                    fontWeight: 500,
                    fontSize: '13px',
                    lineHeight: '19.5px',
                    color: '#FFFFFF',
                    textAlign: 'center',
                  }}
                >
                  Start free trial
                </Link>
              </>
            )}
          </div>
        </div>

        {/* ── TABLET MD–XL: compressed horizontal layout ── */}
        <div className="hidden md:flex xl:hidden items-center justify-between w-full">
          <Image src="/Logo.png" width={130} height={27} alt="Tether" priority />
          <nav className="flex items-center gap-1">
            {NAV_LINKS.map(({ label, href }) => (
              <Link
                key={label}
                href={href}
                className="px-3 py-1.5 rounded-[10px] hover:bg-slate-50 transition-colors whitespace-nowrap text-[14px] text-[#626262]"
              >
                {label}
              </Link>
            ))}
          </nav>
          <div className="flex items-center gap-2">
            {signedIn ? (
              <Link
                href="/dashboard"
                className="flex items-center justify-center px-[18px] py-[7px] rounded-[10px] bg-[#4F46E5] hover:bg-[#4338CA] text-white text-[13px] font-medium transition-colors"
                style={{ boxShadow: '0px 1px 2px 0px #4F46E54D' }}
              >
                Go to Portal
              </Link>
            ) : (
              <>
                <Link
                  href="/signin"
                  className="flex items-center justify-center px-[15px] py-[7px] rounded-[10px] border border-[#374151] text-[#374151] text-[14px] font-medium hover:bg-slate-50 transition-colors"
                >
                  Sign in
                </Link>
                <Link
                  href="/signup"
                  className="flex items-center justify-center px-[14px] py-[7px] rounded-[10px] bg-[#4F46E5] hover:bg-[#4338CA] text-white text-[13px] font-medium transition-colors"
                  style={{ boxShadow: '0px 1px 2px 0px #4F46E54D' }}
                >
                  Start free trial
                </Link>
              </>
            )}
          </div>
        </div>

        {/* ── MOBILE: logo + hamburger ── */}
        <div className="flex md:hidden items-center justify-between w-full">
          <Image src="/Logo.png" width={120} height={25} alt="Tether" priority />
          <button className="p-2 cursor-pointer" onClick={() => setMobileMenuOpen(!mobileMenuOpen)} aria-label="Toggle menu">
            {mobileMenuOpen
              ? <FiX className="w-6 h-6 text-slate-700" />
              : <FiMenu className="w-6 h-6 text-slate-700" />}
          </button>
        </div>
      </div>

      {/* Mobile dropdown */}
      {mobileMenuOpen && (
        <div className="md:hidden bg-white border-t border-slate-100 px-6 py-4 flex flex-col gap-3">
          {NAV_LINKS.map(({ label, href }) => (
            <Link
              key={label}
              href={href}
              className="text-[#626262] text-[14px] py-2 border-b border-slate-50"
              onClick={() => setMobileMenuOpen(false)}
            >
              {label}
            </Link>
          ))}
          {signedIn ? (
            <Link
              href="/dashboard"
              className="mt-2 text-center py-2.5 bg-[#4F46E5] rounded-[10px] text-white text-[13px] font-medium hover:bg-[#4338CA] transition-colors"
              style={{ boxShadow: '0px 1px 2px 0px #4F46E54D' }}
              onClick={() => setMobileMenuOpen(false)}
            >
              Go to Portal
            </Link>
          ) : (
            <>
              <Link
                href="/signin"
                className="mt-2 text-center py-2.5 border border-[#374151] rounded-[10px] text-[#374151] text-[14px] font-medium hover:bg-slate-50 transition-colors"
                onClick={() => setMobileMenuOpen(false)}
              >
                Sign in
              </Link>
              <Link
                href="/signup"
                className="text-center py-2.5 bg-[#4F46E5] rounded-[10px] text-white text-[13px] font-medium hover:bg-[#4338CA] transition-colors"
                style={{ boxShadow: '0px 1px 2px 0px #4F46E54D' }}
                onClick={() => setMobileMenuOpen(false)}
              >
                Start free trial
              </Link>
            </>
          )}
        </div>
      )}
    </header>
  )
}
