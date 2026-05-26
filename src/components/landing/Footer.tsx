import React from 'react'
import Link from 'next/link'
import Image from 'next/image'

type LinkItem = { label: string; href: string }

const PRODUCT_LINKS: LinkItem[] = [
  { label: 'How it works', href: '#how-it-works' },
  { label: 'FAQ',          href: '#faq' },
]

const COMPANY_LINKS: LinkItem[] = [
  { label: 'About',   href: '#about' },
  { label: 'Press',   href: '#press' },
  { label: 'Contact', href: '#contact' },
]

const LEGAL_LINKS: LinkItem[] = [
  { label: 'Privacy Policy',  href: '#privacy' },
  { label: 'Terms of Service', href: '#terms' },
  { label: 'Security',         href: '#security' },
  { label: 'Cookie Policy',    href: '#cookies' },
]

/* ─── Single link column ─── */
function LinkColumn({ title, links }: { title: string; links: LinkItem[] }) {
  return (
    <div className="flex flex-col" style={{ gap: '16px' }}>
      {/* Column heading */}
      <h5
        style={{
          fontFamily: 'Inter, "Geist", sans-serif',
          fontWeight: 600,
          fontSize: '11px',
          lineHeight: '16.5px',
          letterSpacing: '0.88px',
          textTransform: 'uppercase',
          color: '#111827',
          margin: 0,
        }}
      >
        {title}
      </h5>

      {/* Column links */}
      <div className="flex flex-col" style={{ gap: '10px' }}>
        {links.map(({ label, href }) => (
          <Link
            key={label}
            href={href}
            className="hover:text-[#111827] transition-colors"
            style={{
              fontFamily: 'Inter, sans-serif',
              fontWeight: 400,
              fontSize: '14px',
              lineHeight: '20.25px',
              color: 'rgba(17, 24, 39, 0.5)',
              textDecoration: 'none',
            }}
          >
            {label}
          </Link>
        ))}
      </div>
    </div>
  )
}

export default function Footer() {
  return (
    <footer className="w-full" style={{ backgroundColor: '#FFFDF9' }}>
      <div
        className="mx-auto w-full"
        style={{
          maxWidth: '1160.5px',
          paddingTop: '56px',
          paddingBottom: '32px',
          paddingLeft: '32px',
          paddingRight: '32px',
        }}
      >
        {/* ─── Top row: brand + 2 link columns ─── */}
        <div
          className="
            flex
            flex-col
            md:flex-row
            md:items-start
            md:justify-between
            w-full
            gap-10
          "
        >
          {/* Brand block */}
          <div className="flex flex-col" style={{ gap: '14px', maxWidth: '320px' }}>
            {/* Logo: 167×35 from public/Logo.png */}
            <Image
              src="/Logo.png"
              width={167}
              height={35}
              alt="Tether"
              priority={false}
            />
            <p
              style={{
                fontFamily: 'Inter, "Geist", sans-serif',
                fontWeight: 400,
                fontSize: '13px',
                lineHeight: '24px',
                color: 'rgba(17, 24, 39, 0.7)',
                margin: 0,
              }}
            >
              Your Legacy. Planned Beautifully. Remembered Forever.
            </p>
            <p
              style={{
                fontFamily: 'Inter, "Geist", sans-serif',
                fontWeight: 400,
                fontSize: '13px',
                lineHeight: '24px',
                color: 'rgba(17, 24, 39, 0.7)',
                margin: 0,
              }}
            >
              Delaware Public Benefit Corporation
            </p>
          </div>

          {/* Link columns — gap 116px on desktop */}
          <div
            className="flex flex-wrap"
            style={{ gap: '116px' }}
          >
            <LinkColumn title="Product" links={PRODUCT_LINKS} />
            <LinkColumn title="Company" links={COMPANY_LINKS} />
          </div>
        </div>

        {/* ─── Bottom strip ─── */}
        <div
          className="
            mt-12
            flex
            flex-col
            md:flex-row
            md:items-center
            md:justify-between
            gap-4
          "
          style={{
            borderTop: '1.25px solid rgba(17, 24, 39, 0.06)',
            paddingTop: '28px',
          }}
        >
          {/* Copyright */}
          <p
            style={{
              fontFamily: 'Inter, sans-serif',
              fontWeight: 400,
              fontSize: '12px',
              lineHeight: '18px',
              color: 'rgba(17, 24, 39, 0.5)',
              margin: 0,
            }}
          >
            © {new Date().getFullYear()} Tether, Inc. All rights reserved.
          </p>

          {/* Legal links */}
          <nav className="flex flex-wrap items-center" style={{ gap: '20px' }}>
            {LEGAL_LINKS.map(({ label, href }) => (
              <Link
                key={label}
                href={href}
                className="hover:text-[#111827] transition-colors"
                style={{
                  fontFamily: 'Inter, sans-serif',
                  fontWeight: 400,
                  fontSize: '12px',
                  lineHeight: '18px',
                  color: 'rgba(17, 24, 39, 0.5)',
                  textDecoration: 'none',
                  whiteSpace: 'nowrap',
                }}
              >
                {label}
              </Link>
            ))}
          </nav>
        </div>
      </div>
    </footer>
  )
}
