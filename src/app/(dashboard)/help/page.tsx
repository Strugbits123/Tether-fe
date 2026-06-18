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
  Upload,
  Users,
  Video,
  X,
} from 'lucide-react'

const SUPPORT_EMAIL = 'Support@jointether.com'

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
  /** Accent (dark) color — used for the icon-box bg + border when selected, and the icon when unselected. */
  color: string
  /** Light tint — used as the card bg when selected, and the icon-box bg when unselected. */
  lightBg: string
}

const CATEGORIES: FaqCategory[] = [
  { label: 'All Questions', Icon: HelpCircle, color: '#007359', lightBg: '#F0FDFA' },
  { label: 'Documents & Vault', Icon: FileText, color: '#155DFC', lightBg: '#EFF6FF' },
  { label: 'Messages & Videos', Icon: MessageSquare, color: '#00A63E', lightBg: '#F0FDF4' },
  { label: 'Release Managers & Recipients', Icon: Users, color: '#9810FA', lightBg: '#FAF5FF' },
  { label: 'Account & Passwords', Icon: Lock, color: '#E60076', lightBg: '#FDF2F8' },
  { label: 'Billing & Plans', Icon: CreditCard, color: '#4F39F6', lightBg: '#EEF2FF' },
  { label: 'Notifications', Icon: Bell, color: '#D08700', lightBg: '#FEFCE8' },
  { label: 'Legal & Compliance', Icon: Globe, color: '#E7000B', lightBg: '#FEF2F2' },
  { label: 'Security & Privacy', Icon: Shield, color: '#F54900', lightBg: '#FFF7ED' },
]

const FAQS: string[] = [
  'Does naming an executor in Tether replace having a legal will?',
  "What happens if my executor can't access their account?",
  'Can I have more than one executor?',
  'How long does Tether store my information?',
  'What if I want to change my executor?',
]

/* ---------------------- Page ---------------------- */

type ModalKind = 'feedback' | 'feature' | 'bug' | 'thanks' | null

export default function HelpPage() {
  const [activeCategory, setActiveCategory] = useState('All Questions')
  const [openFaq, setOpenFaq] = useState<number | null>(null)
  const [modal, setModal] = useState<ModalKind>(null)

  const openEmail = () => {
    window.location.href = `mailto:${SUPPORT_EMAIL}`
  }

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
            className="flex items-center justify-between cursor-pointer hover:opacity-80"
            style={{ padding: 16, gap: 16, background: 'transparent' }}
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
            <ChevronDown style={{ width: 20, height: 20, flexShrink: 0 }} color="#4F39F6" strokeWidth={2} />
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
            onTitleClick={openEmail}
            onButtonClick={openEmail}
          />
          <ContactCard
            iconBg="rgba(52,199,89,0.1)"
            icon={<Pencil style={{ width: 24, height: 24 }} color="#34C759" strokeWidth={2} />}
            title="General Feedback"
            desc="Tell us about your Tether experience."
            buttonLabel="Tell us your experience"
            onButtonClick={() => setModal('feedback')}
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
            onButtonClick={() => setModal('feature')}
          />
          <ContactCard
            iconBg="#FFE2E2"
            icon={<Bug style={{ width: 24, height: 24 }} color="#E7000B" strokeWidth={2} />}
            title="Report a bug"
            desc="Found something that's not working right? Let us know so we can fix it."
            buttonLabel="Report an issue"
            onButtonClick={() => setModal('bug')}
          />
        </div>
      </section>

      {/* Modals */}
      {modal === 'feedback' && (
        <FeedbackModal onClose={() => setModal(null)} onSubmit={() => setModal('thanks')} />
      )}
      {modal === 'feature' && (
        <FeatureModal onClose={() => setModal(null)} onSubmit={() => setModal('thanks')} />
      )}
      {modal === 'bug' && <BugModal onClose={() => setModal(null)} onSubmit={() => setModal('thanks')} />}
      {modal === 'thanks' && <ThanksModal onClose={() => setModal(null)} />}
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
  const { label, Icon, color, lightBg } = category
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
        border: `1.25px solid ${active ? color : 'rgba(0,0,0,0.1)'}`,
        background: active ? lightBg : '#FFFFFF',
      }}
    >
      <span
        className="flex items-center justify-center flex-shrink-0"
        style={{ width: 47.99, height: 47.99, borderRadius: 10, background: active ? color : lightBg }}
      >
        <Icon style={{ width: 24, height: 24 }} color={active ? '#FFFFFF' : color} strokeWidth={2} />
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
  onButtonClick,
  onTitleClick,
}: {
  iconBg: string
  icon: React.ReactNode
  title: string
  desc: string
  buttonLabel: string
  onButtonClick?: () => void
  onTitleClick?: () => void
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
          onClick={onTitleClick}
          className={onTitleClick ? 'cursor-pointer hover:opacity-80 break-all' : 'break-all'}
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
        onClick={onButtonClick}
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

/* ---------------------- Modal building blocks ---------------------- */

function ModalShell({
  maxWidth,
  onClose,
  children,
}: {
  maxWidth: number
  onClose: () => void
  children: React.ReactNode
}) {
  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      style={{ background: 'rgba(0,0,0,0.5)' }}
      onClick={onClose}
    >
      <div
        role="dialog"
        aria-modal="true"
        className="relative w-full flex flex-col"
        style={{
          maxWidth,
          borderRadius: 10,
          border: '1px solid rgba(0,0,0,0.1)',
          background: '#FFFFFF',
          boxShadow: '0px 10px 15px -3px rgba(0,0,0,0.1), 0px 4px 6px -4px rgba(0,0,0,0.1)',
          padding: 25,
          maxHeight: 'calc(100vh - 32px)',
          overflowY: 'auto',
        }}
        onClick={(e) => e.stopPropagation()}
      >
        <button
          type="button"
          onClick={onClose}
          aria-label="Close"
          className="absolute cursor-pointer hover:opacity-70"
          style={{ top: 25, right: 25, background: 'transparent' }}
        >
          <X style={{ width: 16, height: 16 }} color="#0A0A0A" strokeWidth={2} />
        </button>
        {children}
      </div>
    </div>
  )
}

function ModalHeader({ title, subtitle }: { title: string; subtitle: string }) {
  return (
    <div className="flex flex-col" style={{ gap: 8, paddingRight: 24 }}>
      <h2
        style={{
          fontFamily: 'Inter, sans-serif',
          fontWeight: 600,
          fontSize: 18,
          lineHeight: '18px',
          letterSpacing: '-0.44px',
          color: '#0A0A0A',
        }}
      >
        {title}
      </h2>
      <p
        style={{
          fontFamily: 'Inter, sans-serif',
          fontWeight: 400,
          fontSize: 14,
          lineHeight: '20px',
          letterSpacing: '-0.15px',
          color: '#717182',
        }}
      >
        {subtitle}
      </p>
    </div>
  )
}

function FieldLabel({ children }: { children: React.ReactNode }) {
  return (
    <label
      style={{
        fontFamily: 'Inter, sans-serif',
        fontWeight: 500,
        fontSize: 14,
        lineHeight: '14px',
        letterSpacing: '-0.15px',
        color: '#0A0A0A',
      }}
    >
      {children}
    </label>
  )
}

const FIELD_STYLE: React.CSSProperties = {
  borderRadius: 8,
  border: '1px solid rgba(0,0,0,0.1)',
  background: '#F3F3F5',
  fontFamily: 'Inter, sans-serif',
  fontWeight: 400,
  fontSize: 14,
  lineHeight: '20px',
  letterSpacing: '-0.15px',
  color: '#0A0A0A',
  outline: 'none',
  width: '100%',
}

function TextArea({
  placeholder,
  value,
  onChange,
}: {
  placeholder: string
  value: string
  onChange: (v: string) => void
}) {
  return (
    <textarea
      value={value}
      placeholder={placeholder}
      onChange={(e) => onChange(e.target.value)}
      className="placeholder:text-[#717182] resize-none"
      style={{ ...FIELD_STYLE, height: 64, padding: '8px 12px' }}
    />
  )
}

function Dropdown({
  placeholder,
  options,
  value,
  onChange,
}: {
  placeholder: string
  options: string[]
  value: string
  onChange: (v: string) => void
}) {
  const [open, setOpen] = useState(false)
  return (
    <div className="relative">
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        className="flex items-center justify-between cursor-pointer"
        style={{ ...FIELD_STYLE, height: 36, padding: '8px 12px' }}
      >
        <span
          style={{
            fontFamily: 'Inter, sans-serif',
            fontWeight: 500,
            fontSize: 14,
            lineHeight: '20px',
            letterSpacing: '-0.15px',
            color: value ? '#0A0A0A' : '#717182',
          }}
        >
          {value || placeholder}
        </span>
        <ChevronDown style={{ width: 16, height: 16, flexShrink: 0 }} color="#717182" strokeWidth={2} />
      </button>
      {open && (
        <div
          className="absolute left-0 right-0 z-10 overflow-hidden"
          style={{
            marginTop: 4,
            borderRadius: 8,
            border: '1px solid rgba(0,0,0,0.1)',
            background: '#FFFFFF',
            boxShadow: '0px 10px 15px -3px rgba(0,0,0,0.1), 0px 4px 6px -4px rgba(0,0,0,0.1)',
          }}
        >
          {options.map((o) => (
            <button
              key={o}
              type="button"
              onClick={() => {
                onChange(o)
                setOpen(false)
              }}
              className="flex w-full text-left cursor-pointer hover:bg-gray-50"
              style={{
                padding: '8px 12px',
                background: value === o ? '#F3F3F5' : 'transparent',
                fontFamily: 'Inter, sans-serif',
                fontWeight: 400,
                fontSize: 14,
                lineHeight: '20px',
                letterSpacing: '-0.15px',
                color: '#0A0A0A',
              }}
            >
              {o}
            </button>
          ))}
        </div>
      )}
    </div>
  )
}

function UploadButton() {
  const [fileName, setFileName] = useState<string | null>(null)
  return (
    <label
      className="flex items-center justify-center cursor-pointer hover:bg-gray-50"
      style={{
        height: 36,
        gap: 8,
        borderRadius: 8,
        border: '1px solid rgba(0,0,0,0.1)',
        background: '#FFFFFF',
        width: '100%',
      }}
    >
      <Upload style={{ width: 16, height: 16, flexShrink: 0 }} color="#0A0A0A" strokeWidth={2} />
      <span
        style={{
          fontFamily: 'Inter, sans-serif',
          fontWeight: 500,
          fontSize: 14,
          lineHeight: '20px',
          letterSpacing: '-0.15px',
          textAlign: 'center',
          color: '#0A0A0A',
          maxWidth: '80%',
          overflow: 'hidden',
          textOverflow: 'ellipsis',
          whiteSpace: 'nowrap',
        }}
      >
        {fileName ?? 'Upload screenshot'}
      </span>
      <input
        type="file"
        accept="image/*"
        className="hidden"
        onChange={(e) => setFileName(e.target.files?.[0]?.name ?? null)}
      />
    </label>
  )
}

function ModalFooter({
  onCancel,
  onSubmit,
  submitLabel,
  submitColor,
  disabled,
}: {
  onCancel: () => void
  onSubmit: () => void
  submitLabel: string
  submitColor: string
  disabled: boolean
}) {
  return (
    <div className="flex items-center justify-end" style={{ paddingTop: 8, gap: 12 }}>
      <button
        type="button"
        onClick={onCancel}
        className="cursor-pointer hover:bg-gray-50"
        style={{
          height: 36,
          padding: '8px 16px',
          borderRadius: 8,
          border: '1px solid rgba(0,0,0,0.1)',
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
        Cancel
      </button>
      <button
        type="button"
        onClick={onSubmit}
        disabled={disabled}
        className={disabled ? 'cursor-not-allowed' : 'cursor-pointer hover:opacity-90'}
        style={{
          height: 36,
          padding: '8px 16px',
          borderRadius: 8,
          background: submitColor,
          opacity: disabled ? 0.5 : 1,
          fontFamily: 'Inter, sans-serif',
          fontWeight: 500,
          fontSize: 14,
          lineHeight: '20px',
          letterSpacing: '-0.15px',
          textAlign: 'center',
          color: '#FFFFFF',
        }}
      >
        {submitLabel}
      </button>
    </div>
  )
}

/* ---------------------- Modals ---------------------- */

function FeedbackModal({ onClose, onSubmit }: { onClose: () => void; onSubmit: () => void }) {
  const [type, setType] = useState('')
  const [feedback, setFeedback] = useState('')
  const valid = type !== '' && feedback.trim() !== ''

  return (
    <ModalShell maxWidth={512} onClose={onClose}>
      <ModalHeader title="General Feedback" subtitle="We'd love to hear your thoughts about Tether" />
      <div className="flex flex-col" style={{ paddingTop: 16, gap: 16 }}>
        <div className="flex flex-col" style={{ gap: 8 }}>
          <FieldLabel>Feedback type</FieldLabel>
          <Dropdown
            placeholder="Select a type..."
            options={['Positive Feedback', 'Suggestion', 'Concern', 'Question']}
            value={type}
            onChange={setType}
          />
        </div>
        <div className="flex flex-col" style={{ gap: 8 }}>
          <FieldLabel>Your feedback</FieldLabel>
          <TextArea placeholder="Share your thoughts with us..." value={feedback} onChange={setFeedback} />
        </div>
        <div className="flex flex-col" style={{ gap: 8 }}>
          <FieldLabel>Screenshot (optional)</FieldLabel>
          <UploadButton />
        </div>
        <ModalFooter
          onCancel={onClose}
          onSubmit={onSubmit}
          submitLabel="Submit Feedback"
          submitColor="#00A63E"
          disabled={!valid}
        />
      </div>
    </ModalShell>
  )
}

function FeatureModal({ onClose, onSubmit }: { onClose: () => void; onSubmit: () => void }) {
  const [feature, setFeature] = useState('')
  const [benefit, setBenefit] = useState('')
  const valid = feature.trim() !== '' && benefit.trim() !== ''

  return (
    <ModalShell maxWidth={512} onClose={onClose}>
      <ModalHeader title="Request a Feature" subtitle="Help us improve Tether by sharing your ideas" />
      <div className="flex flex-col" style={{ paddingTop: 16, gap: 16 }}>
        <div className="flex flex-col" style={{ gap: 8 }}>
          <FieldLabel>Tell us about the feature you want</FieldLabel>
          <TextArea placeholder="Describe the feature you'd like to see..." value={feature} onChange={setFeature} />
        </div>
        <div className="flex flex-col" style={{ gap: 8 }}>
          <FieldLabel>How would this feature help you?</FieldLabel>
          <TextArea
            placeholder="Explain how this would improve your experience..."
            value={benefit}
            onChange={setBenefit}
          />
        </div>
        <ModalFooter
          onCancel={onClose}
          onSubmit={onSubmit}
          submitLabel="Submit Feature Request"
          submitColor="#9810FA"
          disabled={!valid}
        />
      </div>
    </ModalShell>
  )
}

function BugModal({ onClose, onSubmit }: { onClose: () => void; onSubmit: () => void }) {
  const [location, setLocation] = useState('')
  const [description, setDescription] = useState('')
  const valid = location !== '' && description.trim() !== ''

  return (
    <ModalShell maxWidth={512} onClose={onClose}>
      <ModalHeader title="Report a Bug" subtitle="Help us fix issues by reporting what's not working" />
      <div className="flex flex-col" style={{ paddingTop: 16, gap: 16 }}>
        <div className="flex flex-col" style={{ gap: 8 }}>
          <FieldLabel>Where did you encounter this bug?</FieldLabel>
          <Dropdown
            placeholder="Select a location..."
            options={['Dashboard/Portal', 'Billing', 'Messages', 'Photos', 'Memoir', 'Other']}
            value={location}
            onChange={setLocation}
          />
        </div>
        <div className="flex flex-col" style={{ gap: 8 }}>
          <FieldLabel>Describe the bug</FieldLabel>
          <TextArea
            placeholder="What happened? What did you expect to happen?"
            value={description}
            onChange={setDescription}
          />
        </div>
        <div className="flex flex-col" style={{ gap: 8 }}>
          <FieldLabel>Screenshot (optional)</FieldLabel>
          <UploadButton />
        </div>
        <ModalFooter
          onCancel={onClose}
          onSubmit={onSubmit}
          submitLabel="Submit Bug Report"
          submitColor="#E7000B"
          disabled={!valid}
        />
      </div>
    </ModalShell>
  )
}

function ThanksModal({ onClose }: { onClose: () => void }) {
  return (
    <ModalShell maxWidth={448} onClose={onClose}>
      <div className="flex flex-col items-center" style={{ gap: 16, padding: '7px 0' }}>
        <span
          className="flex items-center justify-center"
          style={{ width: 64, height: 64, borderRadius: 9999, background: '#DCFCE7' }}
        >
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src="/images/dashboard/tick.svg" alt="" style={{ width: 32, height: 32 }} />
        </span>
        <h2
          style={{
            fontFamily: 'Inter, sans-serif',
            fontWeight: 600,
            fontSize: 24,
            lineHeight: '32px',
            letterSpacing: '0.07px',
            textAlign: 'center',
            color: '#101828',
          }}
        >
          Thank you, RJ.
        </h2>
        <p
          style={{
            fontFamily: 'Inter, sans-serif',
            fontWeight: 400,
            fontSize: 16,
            lineHeight: '24px',
            letterSpacing: '-0.31px',
            textAlign: 'center',
            color: '#4A5565',
          }}
        >
          We appreciate you taking the time to send feedback.
        </p>
      </div>
    </ModalShell>
  )
}
