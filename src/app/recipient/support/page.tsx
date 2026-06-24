'use client'

// Recipient portal — Get support. Email support, response-time + reassurance
// cards, a short FAQ, and the shared "Still need help?" / "Give Feedback"
// cards with their feedback / feature / bug / thanks modals (mirrored from the
// dashboard Help page). Static placeholder content for now.

import { useState } from 'react'
import {
  Bug,
  ChevronDown,
  Copy,
  HelpCircle,
  Lightbulb,
  Mail,
  Pencil,
  Upload,
  X,
} from 'lucide-react'

const SANS = 'Inter, sans-serif'
const SERIF = '"Instrument Serif", serif'
const SUPPORT_EMAIL = 'support@jointether.com'

const FAQS: { q: string; a: string }[] = [
  {
    q: 'Will my access expire?',
    a: 'No. Your access to this portal never expires. Everything left for you is yours to keep forever.',
  },
  {
    q: 'Can I download everything?',
    a: 'Yes. You can download audio messages, documents, photos, transcripts, and the memoir as a complete package. Video messages remain accessible in your portal but cannot be downloaded.',
  },
  {
    q: 'Can I share this with family members?',
    a: 'The content in your portal was specifically left for you. We do not recommend sending content to others. See our Terms of Service for more information.',
  },
  {
    q: 'What if I lose my login information?',
    a: `Contact us at ${SUPPORT_EMAIL} and we'll help you regain access to your portal.`,
  },
]

type ModalKind = 'feedback' | 'feature' | 'bug' | 'thanks' | null

export default function RecipientSupportPage() {
  const [modal, setModal] = useState<ModalKind>(null)
  const [copied, setCopied] = useState(false)

  const openEmail = () => {
    window.location.href = `mailto:${SUPPORT_EMAIL}`
  }

  const copyEmail = async () => {
    try {
      await navigator.clipboard.writeText(SUPPORT_EMAIL)
      setCopied(true)
      setTimeout(() => setCopied(false), 1500)
    } catch {
      /* clipboard unavailable — no-op */
    }
  }

  return (
    <div className="w-full p-4 sm:p-6 lg:p-8">
      <div className="mx-auto w-full flex flex-col" style={{ maxWidth: 887, gap: 31.99 }}>
        {/* Header */}
        <div className="flex flex-col" style={{ gap: 11.99 }}>
          <h1
            style={{
              fontFamily: SERIF,
              fontWeight: 400,
              fontSize: 36,
              lineHeight: '54px',
              color: '#111827',
              margin: 0,
            }}
          >
            Get support
          </h1>
          <p
            style={{
              fontFamily: SANS,
              fontWeight: 400,
              fontSize: 15,
              lineHeight: '22.5px',
              letterSpacing: '-0.23px',
              color: '#6B7280',
              margin: 0,
            }}
          >
            If something isn&apos;t working or you have a question, we&apos;re here.
          </p>
        </div>

        {/* Email support card */}
        <div
          className="flex items-start"
          style={{
            gap: 16,
            padding: '25.23px',
            borderRadius: 14,
            border: '1.25px solid #E5E7EB',
            background: '#FFFFFF',
          }}
        >
          <span
            className="flex items-center justify-center flex-shrink-0"
            style={{ width: 47.99, height: 47.99, borderRadius: 10, background: '#EEF2FF' }}
          >
            <Mail style={{ width: 24, height: 24 }} color="#4F46E5" strokeWidth={2} />
          </span>

          <div className="flex flex-col min-w-0" style={{ gap: 12 }}>
            <div className="flex flex-col" style={{ gap: 4 }}>
              <h2
                style={{
                  fontFamily: SANS,
                  fontWeight: 600,
                  fontSize: 18,
                  lineHeight: '27px',
                  letterSpacing: '-0.44px',
                  color: '#111827',
                  margin: 0,
                }}
              >
                Email support
              </h2>
              <p
                style={{
                  fontFamily: SANS,
                  fontWeight: 400,
                  fontSize: 14,
                  lineHeight: '21px',
                  letterSpacing: '-0.15px',
                  color: '#6B7280',
                  margin: 0,
                }}
              >
                Send us an email and we&apos;ll respond as soon as possible
              </p>
            </div>

            {/* Actions */}
            <div className="flex items-center flex-wrap" style={{ gap: 11.99 }}>
              <button
                type="button"
                onClick={openEmail}
                className="flex items-center justify-center cursor-pointer transition-opacity hover:opacity-90"
                style={{
                  height: 36.97,
                  padding: '0 16px',
                  borderRadius: 10,
                  background: '#4F46E5',
                  fontFamily: SANS,
                  fontWeight: 600,
                  fontSize: 14,
                  lineHeight: '21px',
                  letterSpacing: '-0.15px',
                  color: '#FFFFFF',
                }}
              >
                Send email
              </button>

              <button
                type="button"
                onClick={copyEmail}
                className="flex items-center cursor-pointer transition-opacity hover:opacity-70"
                style={{ gap: 7.99 }}
              >
                <Copy style={{ width: 16, height: 16 }} color="#6B7280" strokeWidth={2} />
                <span
                  style={{
                    fontFamily: SANS,
                    fontWeight: 500,
                    fontSize: 14,
                    lineHeight: '21px',
                    letterSpacing: '-0.15px',
                    textAlign: 'center',
                    color: '#6B7280',
                  }}
                >
                  {copied ? 'Copied!' : 'Copy address'}
                </span>
              </button>
            </div>

            <p
              style={{
                fontFamily: SANS,
                fontWeight: 400,
                fontSize: 13,
                lineHeight: '19.5px',
                letterSpacing: '-0.08px',
                color: '#9CA3AF',
                margin: 0,
              }}
            >
              {SUPPORT_EMAIL}
            </p>
          </div>
        </div>

        {/* Response time card */}
        <div
          className="flex flex-col"
          style={{
            gap: 7.99,
            padding: '25.23px',
            borderRadius: 14,
            border: '1.25px solid #E5E7EB',
            background: '#F9FAFB',
          }}
        >
          <h2
            style={{
              fontFamily: SANS,
              fontWeight: 600,
              fontSize: 15,
              lineHeight: '22.5px',
              letterSpacing: '-0.23px',
              color: '#111827',
              margin: 0,
            }}
          >
            Response time
          </h2>
          <p
            style={{
              fontFamily: SANS,
              fontWeight: 400,
              fontSize: 14,
              lineHeight: '21px',
              letterSpacing: '-0.15px',
              color: '#6B7280',
              margin: 0,
            }}
          >
            We typically respond within one business day. For urgent issues, please mention
            &quot;urgent&quot; in your subject line.
          </p>
        </div>

        {/* Your access is safe — gradient card */}
        <div
          className="flex items-start"
          style={{
            gap: 16,
            padding: '23.98px',
            borderRadius: 14,
            background:
              'linear-gradient(135deg, #4F46E5 0%, #5552E8 50%, #6366F1 100%)',
          }}
        >
          <HelpCircle
            className="flex-shrink-0"
            style={{ width: 24, height: 24 }}
            color="#FFFFFF"
            strokeWidth={2}
          />
          <div className="flex flex-col min-w-0" style={{ gap: 7.99 }}>
            <h2
              style={{
                fontFamily: SANS,
                fontWeight: 600,
                fontSize: 16,
                lineHeight: '24px',
                letterSpacing: '-0.31px',
                color: '#FFFFFF',
                margin: 0,
              }}
            >
              Your access is safe
            </h2>
            <p
              style={{
                fontFamily: SANS,
                fontWeight: 400,
                fontSize: 14,
                lineHeight: '23.8px',
                letterSpacing: '-0.15px',
                color: 'rgba(255,255,255,0.9)',
                margin: 0,
              }}
            >
              Your access to this portal is not at risk. If something is missing or incorrect, we
              will help you find it. Everything left for you is preserved and protected.
            </p>
          </div>
        </div>

        {/* Common questions */}
        <section className="flex flex-col" style={{ gap: 23.98 }}>
          <h2
            style={{
              fontFamily: SERIF,
              fontWeight: 400,
              fontSize: 20,
              lineHeight: '30px',
              color: '#111827',
              margin: 0,
            }}
          >
            Common questions
          </h2>

          <div className="flex flex-col" style={{ gap: 23.98 }}>
            {FAQS.map((item, i) => (
              <div
                key={item.q}
                className="flex flex-col"
                style={{
                  gap: 7.99,
                  paddingBottom: i < FAQS.length - 1 ? 24 : 0,
                  borderBottom:
                    i < FAQS.length - 1 ? '1.25px solid #E5E7EB' : undefined,
                }}
              >
                <h3
                  style={{
                    fontFamily: SANS,
                    fontWeight: 600,
                    fontSize: 15,
                    lineHeight: '22.5px',
                    letterSpacing: '-0.23px',
                    color: '#111827',
                    margin: 0,
                  }}
                >
                  {item.q}
                </h3>
                <p
                  style={{
                    fontFamily: SANS,
                    fontWeight: 400,
                    fontSize: 14,
                    lineHeight: '23.8px',
                    letterSpacing: '-0.15px',
                    color: '#6B7280',
                    margin: 0,
                  }}
                >
                  {item.a}
                </p>
              </div>
            ))}
          </div>
        </section>

        {/* Still need help */}
        <section className="flex flex-col" style={{ gap: 23.98 }}>
          <h2 style={sectionHeading}>Still need help?</h2>
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
          <h2 style={sectionHeading}>Give Feedback</h2>
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
      </div>

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

const sectionHeading: React.CSSProperties = {
  fontFamily: SANS,
  fontWeight: 700,
  fontSize: 24,
  lineHeight: '32px',
  letterSpacing: '0.07px',
  color: '#101828',
  margin: 0,
}

/* ---------------------- Contact card ---------------------- */

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
            fontFamily: SANS,
            fontWeight: 600,
            fontSize: 18,
            lineHeight: '27px',
            letterSpacing: '-0.44px',
            color: '#101828',
            margin: 0,
          }}
        >
          {title}
        </h3>
        <p
          style={{
            fontFamily: SANS,
            fontWeight: 400,
            fontSize: 14,
            lineHeight: '20px',
            letterSpacing: '-0.15px',
            color: '#4A5565',
            margin: 0,
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
          fontFamily: SANS,
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
          fontFamily: SANS,
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
          fontFamily: SANS,
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
        fontFamily: SANS,
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
  fontFamily: SANS,
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
            fontFamily: SANS,
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
                fontFamily: SANS,
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
          fontFamily: SANS,
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
          fontFamily: SANS,
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
          fontFamily: SANS,
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
            options={['Dashboard/Portal', 'Messages', 'Docs & Files', 'Memories', 'Memoir', 'Other']}
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
          <img src="/images/Dashboard/Tick.svg" alt="" style={{ width: 32, height: 32 }} />
        </span>
        <h2
          style={{
            fontFamily: SANS,
            fontWeight: 600,
            fontSize: 24,
            lineHeight: '32px',
            letterSpacing: '0.07px',
            textAlign: 'center',
            color: '#101828',
          }}
        >
          Thank you.
        </h2>
        <p
          style={{
            fontFamily: SANS,
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
