'use client'

import { useState } from 'react'
import {
  Bell,
  Bug,
  Calendar,
  ChevronDown,
  Clock,
  CreditCard,
  FileText,
  Globe,
  HelpCircle,
  Lightbulb,
  Lock,
  Mail,
  MessageSquare,
  Pencil,
  Play,
  Search,
  Shield,
  Users,
  Video,
} from 'lucide-react'

/* ---------------------- Data ---------------------- */

interface VideoTutorial {
  duration: string
  title: string
  desc: string
}

const VIDEOS: VideoTutorial[] = [
  { duration: '4:32', title: 'Getting Started with Tether', desc: 'Complete walkthrough of your first steps' },
  { duration: '3:15', title: 'Uploading & Organizing Documents', desc: 'How to manage your vault effectively' },
  { duration: '5:20', title: 'Recording Legacy Messages', desc: 'Video, audio, and written messages' },
  { duration: '2:45', title: 'Setting Up Your Executor', desc: 'Who should it be and how to invite them' },
  { duration: '3:50', title: 'Managing Access Control', desc: 'Control who sees what and when' },
  { duration: '6:10', title: 'Using the AI Memoir Builder', desc: 'Let AI help you tell your story' },
]

interface FaqCategory {
  label: string
  Icon: React.ComponentType<{ style?: React.CSSProperties; color?: string; strokeWidth?: number }>
  iconColor: string
  iconBg: string
}

const CATEGORIES: FaqCategory[] = [
  { label: 'All Questions', Icon: HelpCircle, iconColor: '#FFFFFF', iconBg: '#007359' },
  { label: 'Documents & Vault', Icon: FileText, iconColor: '#155DFC', iconBg: '#EFF6FF' },
  { label: 'Messages & Videos', Icon: MessageSquare, iconColor: '#00A63E', iconBg: '#F0FDF4' },
  { label: 'Release Managers & Recipients', Icon: Users, iconColor: '#9810FA', iconBg: '#FAF5FF' },
  { label: 'Account & Passwords', Icon: Lock, iconColor: '#E60076', iconBg: '#FDF2F8' },
  { label: 'Billing & Plans', Icon: CreditCard, iconColor: '#4F39F6', iconBg: '#EEF2FF' },
  { label: 'Notifications', Icon: Bell, iconColor: '#D08700', iconBg: '#FEFCE8' },
  { label: 'Legal & Compliance', Icon: Globe, iconColor: '#E7000B', iconBg: '#FEF2F2' },
  { label: 'Security & Privacy', Icon: Shield, iconColor: '#F54900', iconBg: '#FFF7ED' },
]

const FAQS: string[] = [
  'Does naming an executor in Tether replace having a legal will?',
  "What happens if my executor can't access their account?",
  'Can I have more than one executor?',
  'How long does Tether store my information?',
  'What if I want to change my executor?',
]

/* ---------------------- Page ---------------------- */

export default function HelpPage() {
  const [activeCategory, setActiveCategory] = useState('All Questions')
  const [openFaq, setOpenFaq] = useState<number | null>(null)

  return (
    <div className="mx-auto w-full flex flex-col" style={{ maxWidth: 1152, gap: 31.99 }}>
      {/* Hero */}
      <div
        className="flex flex-col items-center"
        style={{
          borderRadius: 14,
          background: 'linear-gradient(90deg, #4F39F6 0%, #432DD7 100%)',
          padding: 'clamp(28px, 5vw, 47.99px) clamp(16px, 5vw, 48px)',
        }}
      >
        <div className="flex flex-col items-center w-full" style={{ maxWidth: 768, gap: 23.98 }}>
          <div className="flex flex-col items-center" style={{ gap: 12 }}>
            <h1
              style={{
                fontFamily: 'Inter, sans-serif',
                fontWeight: 700,
                fontSize: 'clamp(26px, 5vw, 36px)',
                lineHeight: 1.1,
                letterSpacing: '0.37px',
                textAlign: 'center',
                color: '#FFFFFF',
              }}
            >
              How can we help you?
            </h1>
            <p
              style={{
                fontFamily: 'Inter, sans-serif',
                fontWeight: 400,
                fontSize: 18,
                lineHeight: '28px',
                letterSpacing: '-0.44px',
                textAlign: 'center',
                color: '#E0E7FF',
              }}
            >
              Search our help center for answers, guides, and tutorials
            </p>
          </div>

          {/* Search input */}
          <div
            className="flex items-center w-full"
            style={{
              height: 48,
              borderRadius: 8,
              background: '#FFFFFF',
              padding: '0 16px 0 16px',
              gap: 12,
              boxShadow: '0px 10px 15px -3px rgba(0,0,0,0.1), 0px 4px 6px -4px rgba(0,0,0,0.1)',
            }}
          >
            <Search style={{ width: 20, height: 20, flexShrink: 0 }} color="#99A1AF" strokeWidth={2} />
            <input
              type="text"
              placeholder="Search for help articles, topics, or questions..."
              className="flex-1 min-w-0 bg-transparent outline-none"
              style={{
                fontFamily: 'Inter, sans-serif',
                fontWeight: 400,
                fontSize: 14,
                letterSpacing: '-0.15px',
                color: '#101828',
              }}
            />
          </div>
        </div>
      </div>

      {/* Schedule a call */}
      <div
        className="flex flex-col"
        style={{
          borderRadius: 14,
          border: '1.25px solid rgba(0,0,0,0.1)',
          background: '#FFFFFF',
          padding: 20,
          gap: 20,
        }}
      >
        <div className="flex items-start" style={{ gap: 20 }}>
          <div
            className="flex items-center justify-center flex-shrink-0"
            style={{
              width: 38.48,
              height: 38.48,
              borderRadius: 10,
              border: '1.25px solid rgba(79,70,229,0.3)',
              background: 'rgba(79,70,229,0.2)',
            }}
          >
            <Calendar style={{ width: 20, height: 20 }} color="#4F46E5" strokeWidth={2} />
          </div>
          <div className="flex flex-col min-w-0" style={{ gap: 3.98 }}>
            <h2
              style={{
                fontFamily: 'Inter, sans-serif',
                fontWeight: 700,
                fontSize: 20,
                lineHeight: '28px',
                letterSpacing: '-0.45px',
                color: '#101828',
              }}
            >
              Schedule a call with our team
            </h2>
            <p
              style={{
                fontFamily: 'Inter, sans-serif',
                fontWeight: 400,
                fontSize: 14,
                lineHeight: '20px',
                letterSpacing: '-0.15px',
                color: '#4A5565',
              }}
            >
              Get personalized help from a Tether expert. We&apos;ll walk you through any questions about your
              account, security, or legacy planning.
            </p>
          </div>
        </div>

        {/* Detail row */}
        <div
          className="flex flex-col sm:flex-row sm:items-center"
          style={{ paddingTop: 15, gap: 12, borderTop: '1.25px solid rgba(0,0,0,0.2)' }}
        >
          <ScheduleDetail
            icon={<Clock style={{ width: 16, height: 16 }} color="#4A5565" strokeWidth={2} />}
            title="20 minutes"
            sub="One-on-one call"
            divider
          />
          <ScheduleDetail
            icon={<Calendar style={{ width: 16, height: 16 }} color="#4A5565" strokeWidth={2} />}
            title="Mon–Fri"
            sub="9am–6pm ET"
            divider
          />
          <ScheduleDetail
            icon={<Video style={{ width: 16, height: 16 }} color="#4A5565" strokeWidth={2} />}
            title="Video"
            sub="Online meeting"
          />
        </div>

        {/* Book a time */}
        <button
          type="button"
          className="cursor-pointer hover:opacity-90 self-start"
          style={{
            height: 36,
            padding: '8px 16px',
            borderRadius: 8,
            background: '#4F39F6',
            fontFamily: 'Inter, sans-serif',
            fontWeight: 500,
            fontSize: 14,
            lineHeight: '20px',
            letterSpacing: '-0.15px',
            color: '#FFFFFF',
          }}
        >
          Book a time
        </button>
      </div>

      {/* Video tutorials */}
      <section className="flex flex-col" style={{ gap: 23.98 }}>
        <h2
          style={{
            fontFamily: 'Inter, sans-serif',
            fontWeight: 700,
            fontSize: 24,
            lineHeight: '32px',
            letterSpacing: '0.07px',
            color: '#101828',
          }}
        >
          Video tutorials
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3" style={{ gap: 23.98 }}>
          {VIDEOS.map((v) => (
            <VideoCard key={v.title} video={v} />
          ))}
        </div>
      </section>

      {/* FAQ */}
      <section className="flex flex-col" style={{ gap: 23.98 }}>
        <h2
          style={{
            fontFamily: 'Inter, sans-serif',
            fontWeight: 700,
            fontSize: 24,
            lineHeight: '32px',
            letterSpacing: '0.07px',
            color: '#101828',
          }}
        >
          Frequently asked questions
        </h2>

        {/* Category cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3" style={{ gap: 16 }}>
          {CATEGORIES.map((c) => (
            <CategoryCard
              key={c.label}
              category={c}
              active={activeCategory === c.label}
              onClick={() => setActiveCategory(c.label)}
            />
          ))}
        </div>

        {/* FAQ list */}
        <div
          className="flex flex-col"
          style={{ borderRadius: 14, border: '1.25px solid rgba(0,0,0,0.1)', background: '#FFFFFF' }}
        >
          {FAQS.map((q, i) => (
            <FaqRow key={q} question={q} open={openFaq === i} onToggle={() => setOpenFaq(openFaq === i ? null : i)} />
          ))}
          <button
            type="button"
            className="flex items-center cursor-pointer hover:opacity-80"
            style={{ padding: 16, background: 'transparent' }}
          >
            <span
              style={{
                fontFamily: 'Inter, sans-serif',
                fontWeight: 500,
                fontSize: 16,
                lineHeight: '24px',
                letterSpacing: '-0.31px',
                color: '#4F39F6',
              }}
            >
              Load More
            </span>
          </button>
        </div>
      </section>

      {/* Still need help */}
      <section className="flex flex-col" style={{ gap: 23.98 }}>
        <h2
          style={{
            fontFamily: 'Inter, sans-serif',
            fontWeight: 700,
            fontSize: 24,
            lineHeight: '32px',
            letterSpacing: '0.07px',
            color: '#101828',
          }}
        >
          Still need help?
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2" style={{ gap: 24 }}>
          <ContactCard
            iconBg="#DBEAFE"
            icon={<Mail style={{ width: 24, height: 24 }} color="#155DFC" strokeWidth={2} />}
            title="Support@jointether.com"
            desc="Get help via email. We typically respond within 4 hours during business hours."
            buttonLabel="Send us an email"
          />
          <ContactCard
            iconBg="rgba(52,199,89,0.1)"
            icon={<Pencil style={{ width: 24, height: 24 }} color="#34C759" strokeWidth={2} />}
            title="General Feedback"
            desc="Tell us about your Tether experience."
            buttonLabel="Tell us your experience"
          />
        </div>
      </section>

      {/* Give feedback */}
      <section className="flex flex-col" style={{ gap: 23.98 }}>
        <h2
          style={{
            fontFamily: 'Inter, sans-serif',
            fontWeight: 700,
            fontSize: 24,
            lineHeight: '32px',
            letterSpacing: '0.07px',
            color: '#101828',
          }}
        >
          Give Feedback
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2" style={{ gap: 24 }}>
          <ContactCard
            iconBg="#F3E8FF"
            icon={<Lightbulb style={{ width: 24, height: 24 }} color="#9810FA" strokeWidth={2} />}
            title="Request a feature"
            desc="Have an idea for how we can improve Tether? We'd love to hear it."
            buttonLabel="Submit an idea"
          />
          <ContactCard
            iconBg="#FFE2E2"
            icon={<Bug style={{ width: 24, height: 24 }} color="#E7000B" strokeWidth={2} />}
            title="Report a bug"
            desc="Found something that's not working right? Let us know so we can fix it."
            buttonLabel="Report an issue"
          />
        </div>
      </section>
    </div>
  )
}

/* ---------------------- Building blocks ---------------------- */

function ScheduleDetail({
  icon,
  title,
  sub,
  divider,
}: {
  icon: React.ReactNode
  title: string
  sub: string
  divider?: boolean
}) {
  return (
    <div
      className="flex items-center flex-1 min-w-0"
      style={{
        gap: 7.99,
        paddingRight: divider ? 12 : 0,
        borderRight: divider ? '1.25px solid rgba(0,0,0,0.2)' : undefined,
      }}
    >
      <span className="flex-shrink-0">{icon}</span>
      <div className="flex flex-col min-w-0">
        <span
          style={{
            fontFamily: 'Inter, sans-serif',
            fontWeight: 500,
            fontSize: 14,
            lineHeight: '20px',
            letterSpacing: '-0.15px',
            color: '#101828',
          }}
        >
          {title}
        </span>
        <span
          style={{
            fontFamily: 'Inter, sans-serif',
            fontWeight: 400,
            fontSize: 12,
            lineHeight: '16px',
            color: '#4A5565',
          }}
        >
          {sub}
        </span>
      </div>
    </div>
  )
}

function VideoCard({ video }: { video: VideoTutorial }) {
  return (
    <div
      className="flex flex-col cursor-pointer hover:shadow-sm transition-shadow overflow-hidden"
      style={{ borderRadius: 14, border: '1.25px solid rgba(0,0,0,0.1)', background: '#FFFFFF' }}
    >
      {/* Thumbnail */}
      <div className="relative" style={{ height: 205.59, background: '#2B7FFF' }}>
        <div className="absolute inset-0 flex items-center justify-center">
          <div
            className="flex items-center justify-center"
            style={{ width: 64, height: 64, borderRadius: 9999, background: 'rgba(255,255,255,0.9)' }}
          >
            <Play style={{ width: 28, height: 28, marginLeft: 3 }} color="#101828" fill="#101828" />
          </div>
        </div>
        <span
          className="absolute flex items-center justify-center"
          style={{
            right: 12,
            bottom: 12,
            height: 23.95,
            padding: '0 8px',
            borderRadius: 4,
            background: 'rgba(0,0,0,0.6)',
            fontFamily: 'Inter, sans-serif',
            fontWeight: 400,
            fontSize: 12,
            lineHeight: '16px',
            color: '#FFFFFF',
          }}
        >
          {video.duration}
        </span>
      </div>

      {/* Text */}
      <div className="flex flex-col" style={{ padding: 16, gap: 3.98 }}>
        <h3
          style={{
            fontFamily: 'Inter, sans-serif',
            fontWeight: 600,
            fontSize: 18,
            lineHeight: '27px',
            letterSpacing: '-0.44px',
            color: '#101828',
          }}
        >
          {video.title}
        </h3>
        <p
          style={{
            fontFamily: 'Inter, sans-serif',
            fontWeight: 400,
            fontSize: 14,
            lineHeight: '20px',
            letterSpacing: '-0.15px',
            color: '#4A5565',
          }}
        >
          {video.desc}
        </p>
      </div>
    </div>
  )
}

function CategoryCard({
  category,
  active,
  onClick,
}: {
  category: FaqCategory
  active: boolean
  onClick: () => void
}) {
  const { label, Icon, iconColor, iconBg } = category
  return (
    <button
      type="button"
      onClick={onClick}
      className="flex items-center cursor-pointer hover:shadow-sm transition-shadow text-left"
      style={{
        minHeight: 75,
        padding: '11px 25px',
        gap: 12,
        borderRadius: 14,
        border: active ? '1.25px solid #007359' : '1.25px solid rgba(0,0,0,0.1)',
        background: active ? '#F0FDFA' : '#FFFFFF',
      }}
    >
      <span
        className="flex items-center justify-center flex-shrink-0"
        style={{ width: 47.99, height: 47.99, borderRadius: 10, background: iconBg }}
      >
        <Icon style={{ width: 24, height: 24 }} color={iconColor} strokeWidth={2} />
      </span>
      <span
        style={{
          fontFamily: 'Inter, sans-serif',
          fontWeight: 600,
          fontSize: 18,
          lineHeight: '27px',
          letterSpacing: '-0.44px',
          color: '#101828',
        }}
      >
        {label}
      </span>
    </button>
  )
}

function FaqRow({ question, open, onToggle }: { question: string; open: boolean; onToggle: () => void }) {
  return (
    <div style={{ borderBottom: '1.25px solid rgba(0,0,0,0.1)' }}>
      <button
        type="button"
        onClick={onToggle}
        className="flex items-center justify-between w-full cursor-pointer hover:opacity-80 text-left"
        style={{ padding: 16, gap: 16, background: 'transparent' }}
      >
        <span
          style={{
            fontFamily: 'Inter, sans-serif',
            fontWeight: 500,
            fontSize: 16,
            lineHeight: '24px',
            letterSpacing: '-0.31px',
            color: '#101828',
          }}
        >
          {question}
        </span>
        <ChevronDown
          style={{
            width: 20,
            height: 20,
            flexShrink: 0,
            transition: 'transform 0.2s',
            transform: open ? 'rotate(180deg)' : 'none',
          }}
          color="#99A1AF"
          strokeWidth={2}
        />
      </button>
      {open && (
        <p
          style={{
            padding: '0 16px 16px',
            fontFamily: 'Inter, sans-serif',
            fontWeight: 400,
            fontSize: 14,
            lineHeight: '20px',
            letterSpacing: '-0.15px',
            color: '#4A5565',
          }}
        >
          Our support team can help you with this. Schedule a call or send us an email and we&apos;ll get back to you.
        </p>
      )}
    </div>
  )
}

function ContactCard({
  iconBg,
  icon,
  title,
  desc,
  buttonLabel,
}: {
  iconBg: string
  icon: React.ReactNode
  title: string
  desc: string
  buttonLabel: string
}) {
  return (
    <div
      className="flex flex-col"
      style={{
        borderRadius: 14,
        border: '1.25px solid rgba(0,0,0,0.1)',
        background: '#FFFFFF',
        padding: '30px 25px',
        gap: 20,
      }}
    >
      <span
        className="flex items-center justify-center flex-shrink-0"
        style={{ width: 47.99, height: 47.99, borderRadius: 10, background: iconBg }}
      >
        {icon}
      </span>
      <div className="flex flex-col" style={{ gap: 8 }}>
        <h3
          style={{
            fontFamily: 'Inter, sans-serif',
            fontWeight: 600,
            fontSize: 18,
            lineHeight: '27px',
            letterSpacing: '-0.44px',
            color: '#101828',
          }}
        >
          {title}
        </h3>
        <p
          style={{
            fontFamily: 'Inter, sans-serif',
            fontWeight: 400,
            fontSize: 14,
            lineHeight: '20px',
            letterSpacing: '-0.15px',
            color: '#4A5565',
          }}
        >
          {desc}
        </p>
      </div>
      <button
        type="button"
        className="cursor-pointer hover:bg-gray-50"
        style={{
          height: 36,
          padding: '8px 16px',
          borderRadius: 8,
          border: '1.25px solid rgba(0,0,0,0.1)',
          background: '#FFFFFF',
          fontFamily: 'Inter, sans-serif',
          fontWeight: 500,
          fontSize: 14,
          lineHeight: '20px',
          letterSpacing: '-0.15px',
          textAlign: 'center',
          color: '#0A0A0A',
        }}
      >
        {buttonLabel}
      </button>
    </div>
  )
}
