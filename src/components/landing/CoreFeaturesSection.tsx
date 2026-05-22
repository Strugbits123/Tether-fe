import React from 'react'
import Image from 'next/image'
import { FiCheck } from 'react-icons/fi'
import MessagesMockup from './MessagesMockup'
import DocsFilesMockup from './DocsFilesMockup'
import PhotosMockup from './PhotosMockup'
import MemoirMockup from './MemoirMockup'

const HEADING_SERIF = '"Instrument Serif", Georgia, "Times New Roman", serif'

/* ─── Reusable pill badge (with violet dot + uppercase label) ─── */
function PillBadge({ label }: { label: string }) {
  return (
    <div
      className="flex items-center w-fit"
      style={{
        gap: '8px',
        padding: '4px 12px',
        borderRadius: '41943000px',
        backgroundColor: '#EEF2FF',
      }}
    >
      <span
        style={{
          width: '6px',
          height: '6px',
          borderRadius: '41943000px',
          backgroundColor: '#4F46E5',
          flexShrink: 0,
        }}
      />
      <span
        style={{
          fontFamily: 'Inter, sans-serif',
          fontWeight: 600,
          fontSize: '12px',
          lineHeight: '18px',
          letterSpacing: '0.6px',
          textTransform: 'uppercase',
          color: '#4F46E5',
        }}
      >
        {label}
      </span>
    </div>
  )
}

/* ─── Bullet row with green check chip ─── */
function BulletItem({ text }: { text: string }) {
  return (
    <li className="flex items-center" style={{ gap: '12px' }}>
      <span
        className="flex items-center justify-center flex-shrink-0"
        style={{
          width: '20px',
          height: '20px',
          padding: '0 4px',
          borderRadius: '41943000px',
          backgroundColor: '#D1FAE5',
        }}
      >
        <FiCheck style={{ width: '12px', height: '12px', color: '#065F46', strokeWidth: 3 }} />
      </span>
      <span
        style={{
          fontFamily: 'Inter, sans-serif',
          fontWeight: 400,
          fontSize: '14px',
          lineHeight: '21px',
          color: '#4A5565',
        }}
      >
        {text}
      </span>
    </li>
  )
}

/* ─── Feature row (text + image|mockup, sides swap via `imageOnRight`) ─── */
type Feature = {
  badge: string
  heading: string
  italicHeading: string
  description: string
  bullets: string[]
  image?: string
  imageAlt?: string
  mockup?: React.ReactNode
  imageOnRight: boolean
}

function FeatureRow({
  badge,
  heading,
  italicHeading,
  description,
  bullets,
  image,
  imageAlt,
  mockup,
  imageOnRight,
}: Feature) {
  const text = (
    <div
      className="flex flex-col w-full max-w-[508px]"
      style={{ gap: '15px' }}
    >
      <PillBadge label={badge} />

      {/* Heading */}
      <h3
        className="text-[22px] sm:text-[26px] lg:text-[28px]"
        style={{
          fontFamily: HEADING_SERIF,
          fontWeight: 400,
          lineHeight: '1.4',
          letterSpacing: '0px',
          color: '#111827',
          margin: 0,
        }}
      >
        {heading}
        <br />
        <em style={{ color: '#4F46E5', fontStyle: 'italic' }}>
          {italicHeading}
        </em>
      </h3>

      {/* Description */}
      <p
        style={{
          fontFamily: 'Inter, sans-serif',
          fontWeight: 400,
          fontSize: '15px',
          lineHeight: '25.5px',
          letterSpacing: '0px',
          color: '#6B7280',
          margin: 0,
        }}
      >
        {description}
      </p>

      {/* Bullets */}
      <ul
        className="flex flex-col list-none p-0 m-0"
        style={{ gap: '11.99px', marginTop: '4px' }}
      >
        {bullets.map((b, i) => (
          <BulletItem key={i} text={b} />
        ))}
      </ul>
    </div>
  )

  /* If a custom mockup is supplied, use that; otherwise fall back to the image */
  const visual = mockup ? (
    <div className="w-full max-w-[508px] flex-shrink-0">
      {mockup}
    </div>
  ) : (
    <div className="relative w-full max-w-[508px] aspect-[508/406] flex-shrink-0">
      <Image
        src={image ?? ''}
        alt={imageAlt ?? ''}
        fill
        className="object-contain"
        sizes="(max-width: 1024px) 90vw, 508px"
      />
    </div>
  )

  return (
    <div
      className={`
        flex
        flex-col
        ${imageOnRight ? 'lg:flex-row' : 'lg:flex-row-reverse'}
        items-center
        gap-10
        lg:gap-[80px]
        w-full
      `}
    >
      {text}
      {visual}
    </div>
  )
}

/* ─── Features list ─── */
const FEATURES: Feature[] = [
  {
    badge: 'Messages',
    heading: 'Everything you want to say.',
    italicHeading: 'To everyone who needs to hear it.',
    description:
      'Record video, audio, and written messages for the people who matter most. Assign them to to any or all of your recipients.',
    bullets: [
      'Browser-native recording — no app needed',
      'Record unlimited video and audio files',
      'Encrypted storage — only designated recipients can access',
      'Supported formats: audio, video, and written letters',
    ],
    mockup: <MessagesMockup />,
    imageOnRight: true,
  },
  {
    badge: 'Docs & Files',
    heading: 'One place for every document and file.',
    italicHeading: 'Automated access when they need it.',
    description:
      'Wills, insurance policies, account credentials, property deeds — organized into 6 guided categories so nothing gets left behind. Upload once. Your family finds everything instantly.',
    bullets: [
      '6 smart categories with guided checklists',
      'Up to 50 GB encrypted file storage',
      'Granular per-document recipient permissions',
      'Drag-and-drop upload, any file type',
    ],
    mockup: <DocsFilesMockup />,
    imageOnRight: false,
  },
  {
    badge: 'Release Manager',
    heading: 'The people you love',
    italicHeading: 'deserve a guide, not a burden.',
    description:
      'When the time comes, your Release Manager will have everything they need — a dedicated portal, clear instructions, and a step-by-step path forward. No confusion. No overwhelm.',
    bullets: [
      'Dedicated portal built for your Release Manager',
      'Guided delivery of your messages, photos, and documents',
      'Built-in review window for safety and peace of mind',
      'Every action logged and permanently on record',
    ],
    image: '/images/landingpage/corefeaturesection/Img3.png',
    imageAlt: 'Release Manager feature',
    imageOnRight: true,
  },
  {
    badge: 'Photos',
    heading: 'Every picture tells the story.',
    italicHeading: 'More than memories — a piece of you.',
    description:
      "The photos you've collected over a lifetime deserve more than a camera roll or Instagram. Upload your most meaningful images, organize them by person or moment, and let your family receive them exactly when it matters.",
    bullets: [
      'Upload and organize photos by recipient or life event',
      'Add personal notes or voice captions to any image',
      'Encrypted storage — only your designated people can access',
      'Delivered automatically alongside your messages and documents',
    ],
    mockup: <PhotosMockup />,
    imageOnRight: false,
  },
  {
    badge: 'Memoir',
    heading: 'The story only you can tell.',
    italicHeading: 'The chapters only you can write.',
    description:
      'Your experiences, your wisdom, your truth. Create a memoir that captures the moments that shaped you — in your own words, on your own timeline. Share it with the people who matter most.',
    bullets: [
      'Write or record chapters about the big moments of your life',
      'Add photos and personal notes to bring stories to life',
      'Control who receives the whole memoir or specific chapters',
      'Professional book-style reading and listening experience for recipients',
    ],
    mockup: <MemoirMockup />,
    imageOnRight: true,
  },
]

export default function CoreFeaturesSection() {
  return (
    <section className="w-full bg-white" >
      {/* Outer wrapper is intentionally wide (1700px) so the long heading
         can sit on one line on xl+ screens — inner content blocks below
         constrain themselves to ~1160px for visual consistency. */}
      <div
        className="mx-auto w-full"
        style={{
          maxWidth: '1700px',
          paddingTop: '100px',
          paddingBottom: '100px',
          paddingLeft: '32px',
          paddingRight: '32px',
        }}
      >
        <div className="flex flex-col items-center" style={{ gap: '60px' }}>

          {/* ─── HEADING BLOCK ─── */}
          <div className="flex flex-col items-center w-full" style={{ gap: '15px' }}>
            <PillBadge label="Core Feature" />

            <h2
              className="
                text-[24px]
                sm:text-[28px]
                md:text-[30px]
                lg:text-[32px]
                xl:text-[34px]
                2xl:text-[40px]
                text-center
                xl:whitespace-nowrap
              "
              style={{
                fontFamily: HEADING_SERIF,
                fontWeight: 400,
                lineHeight: 1.2,
                letterSpacing: '0px',
                color: '#111827',
                margin: 0,
              }}
            >
              Core features that make{' '}
              <em style={{ color: '#4F46E5', fontStyle: 'italic' }}>
                building your digital legacy simple, enjoyable, and lasting
              </em>
            </h2>
          </div>

          {/* ─── 5 FEATURE ROWS (gap: 96px) ─── */}
          <div
            className="flex flex-col w-full"
            style={{ gap: '96px', maxWidth: '1096.5px' }}
          >
            {FEATURES.map((f, i) => (
              <FeatureRow key={i} {...f} />
            ))}
          </div>

        </div>
      </div>
    </section>
  )
}
