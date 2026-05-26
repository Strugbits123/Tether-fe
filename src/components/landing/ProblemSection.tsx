import React from 'react'

/* ─── Shared style tokens ─── */
const LABEL_TEXT = {
  fontFamily: 'Inter, sans-serif',
  fontWeight: 600,
  fontSize: '12px',
  lineHeight: '18px',
  letterSpacing: '0.6px',
  textTransform: 'uppercase' as const,
  color: '#525252',
}

const BODY_TEXT = {
  fontFamily: 'Inter, sans-serif',
  fontWeight: 400,
  fontSize: '17px',
  lineHeight: '28.9px',
  letterSpacing: '0px',
  color: '#1118278C',
}

const HEADING_SERIF = '"Instrument Serif", Georgia, "Times New Roman", serif'

/* ─── Small reusable badge ─── */
function PillBadge({ label }: { label: string }) {
  return (
    <div
      className="flex items-center w-fit"
      style={{
        gap: '8px',
        padding: '4px 12px',
        borderRadius: '41943000px',
        backgroundColor: '#F0E8E0',
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
      <span style={LABEL_TEXT}>{label}</span>
    </div>
  )
}

/* ─── Problem stats ─── */
const PROBLEM_STATS = [
  {
    stat: '55%',
    desc: "of Americans have no will or estate plan — not because they don't care, but because no one has made it easy enough.",
  },
  {
    stat: '$150,000',
    desc: 'is the average financial loss a family experiences in the year following an unprepared death, due to unclaimed accounts, legal fees, and lost benefits.',
  },
  {
    stat: '86%',
    desc: 'of Americans say legacy planning is important, yet only 24% have actually taken action.',
  },
]

export default function ProblemSection() {
  return (
    <section className="w-full" style={{ backgroundColor: '#FFFDF9' }}>
      <div
        className="mx-auto w-full"
        style={{
          maxWidth: '1160.5px',
          paddingLeft: '32px',
          paddingRight: '32px',
          paddingTop: '80px',
          paddingBottom: '80px',
        }}
      >

        {/* ════════ THE PROBLEM ════════ */}
        <div
          className="flex flex-col"
          style={{ gap: '15px', maxWidth: '1096.5px' }}
        >
          <PillBadge label="The problem" />

          {/* Heading */}
          <h2
            className="text-[30px] sm:text-[36px] lg:text-[40px]"
            style={{
              fontFamily: HEADING_SERIF,
              fontWeight: 400,
              lineHeight: 1.15,
              letterSpacing: '0px',
              color: '#111827',
              margin: 0,
            }}
          >
            The problem{' '}
            <em style={{ color: '#4F46E5', fontStyle: 'italic' }}>
              we are solving
            </em>
          </h2>

          {/* Body paragraph */}
          <p
            className="text-[15px] sm:text-[16px] lg:text-[17px]"
            style={{
              fontFamily: BODY_TEXT.fontFamily,
              fontWeight: BODY_TEXT.fontWeight,
              lineHeight: '28.9px',
              color: BODY_TEXT.color,
              margin: 0,
            }}
          >
            Most families are completely unprepared for the moment that changes everything. When someone dies without a plan, their family often spends months searching for important documents that no one can find. Financial accounts may go unclaimed, final wishes remain unheard, and many of the things that mattered most go unsaid. Legacy planning exists to prevent all of this, but it has never been simple enough, affordable enough, or personal enough for ordinary families.
          </p>
        </div>

        {/* ─── Problem Stats card ─── */}
        <div
          className="grid grid-cols-1 md:grid-cols-3"
          style={{
            marginTop: '40px',
            borderRadius: '24px',
            border: '1.25px solid #5252521A',
            backgroundColor: '#F5EDE3',
            overflow: 'hidden',
          }}
        >
          {PROBLEM_STATS.map((s, i) => (
            <div
              key={i}
              style={{
                padding: '36px',
                display: 'flex',
                flexDirection: 'column',
                gap: '7.99px',
              }}
            >
              {/* Big stat */}
              <div
                className="text-[40px] sm:text-[44px] lg:text-[48px]"
                style={{
                  fontFamily: HEADING_SERIF,
                  fontWeight: 400,
                  fontStyle: 'italic',
                  lineHeight: '72px',
                  color: '#4F46E5',
                }}
              >
                {s.stat}
              </div>
              {/* Description */}
              <p
                style={{
                  fontFamily: 'Inter, sans-serif',
                  fontWeight: 400,
                  fontSize: '14px',
                  lineHeight: '22px',
                  color: '#525252',
                  margin: 0,
                }}
              >
                {s.desc}
              </p>
            </div>
          ))}
        </div>

        {/* ════════ THE PROMISE ════════ */}
        <div
          className="flex flex-col"
          style={{
            gap: '15px',
            maxWidth: '1096.5px',
            marginTop: '80px',
          }}
        >
          <PillBadge label="The promise" />

          {/* Heading */}
          <h2
            className="text-[30px] sm:text-[36px] lg:text-[40px]"
            style={{
              fontFamily: HEADING_SERIF,
              fontWeight: 400,
              lineHeight: 1.15,
              letterSpacing: '0px',
              color: '#111827',
              margin: 0,
            }}
          >
            The promise{' '}
            <em style={{ color: '#4F46E5', fontStyle: 'italic' }}>
              tether makes possible
            </em>
          </h2>

          {/* Paragraph 1 */}
          <p
            className="text-[15px] sm:text-[16px] lg:text-[17px]"
            style={{
              fontFamily: BODY_TEXT.fontFamily,
              fontWeight: BODY_TEXT.fontWeight,
              lineHeight: '28.9px',
              color: BODY_TEXT.color,
              margin: 0,
            }}
          >
            Tether is a place where a person stores everything that matters – their voice, their story, their documents, important photos – and ensures it reaches the right people at the right time, exactly the way they intended.
          </p>

          {/* Paragraph 2 */}
          <p
            className="text-[15px] sm:text-[16px] lg:text-[17px]"
            style={{
              fontFamily: BODY_TEXT.fontFamily,
              fontWeight: BODY_TEXT.fontWeight,
              lineHeight: '28.9px',
              color: BODY_TEXT.color,
              margin: 0,
            }}
          >
            The vision is not a product feature. It is a promise. Every person who uses Tether makes a quiet, powerful promise to the people they love. No lawyers needed. No complexity. No awkward conversations. Just an easy to use and very affordable tool for busy people.
          </p>
        </div>

        {/* ─── Testimonial card ─── */}
        <div
          style={{
            marginTop: '25px',
            borderRadius: '24px',
            border: '1.25px solid #5252521A',
            backgroundColor: '#F5EDE3',
            padding: '32px 35px',
          }}
        >
          {/* Quote */}
          <p
            className="text-[16px] sm:text-[18px] lg:text-[19px]"
            style={{
              fontFamily: HEADING_SERIF,
              fontWeight: 400,
              fontStyle: 'italic',
              lineHeight: '29.45px',
              color: '#111827CC',
              margin: 0,
              marginBottom: '14px',
            }}
          >
            &ldquo;Thanks to Tether, my family will not be lost when I am gone. I prepared for this moment. I thought about my family and friends. They will have everything they need, when they need it.&rdquo;
          </p>
          {/* Attribution */}
          <p
            style={{
              fontFamily: 'Inter, sans-serif',
              fontWeight: 400,
              fontSize: '13px',
              lineHeight: '19.5px',
              color: '#11182759',
              margin: 0,
            }}
          >
            — Diana M., Tether beta user
          </p>
        </div>

      </div>
    </section>
  )
}
