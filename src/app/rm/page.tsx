'use client'

// Release Manager portal — Overview. Static placeholder content for now; wires
// to real data once the RM-facing endpoints exist.

const STATS: { value: string; label: string }[] = [
  { value: '4', label: 'Video messages' },
  { value: '2', label: 'Audio messages' },
  { value: '18', label: 'Documents' },
  { value: '142', label: 'Photos' },
  { value: '12', label: 'Memoir chapters' },
  { value: '3', label: 'Recipients' },
]

const ACTIVITY: { text: string; time: string; color: string }[] = [
  { text: 'Release Manager invitation sent', time: '2 days ago', color: '#4F46E5' },
  { text: 'You accepted executor invitation', time: '2 days ago', color: '#10B981' },
  { text: 'Sarah added 2 new video messages', time: '1 week ago', color: '#4F46E5' },
  { text: 'Sarah completed memoir chapter 12', time: '2 weeks ago', color: '#4F46E5' },
  { text: 'Sarah added Daniel Holder as recipient', time: '3 weeks ago', color: '#4F46E5' },
]

const OWNER_NAME = 'Sarah Holder'
const RELEASE_MANAGER_NAME = 'Marcus Webb'

export default function ReleaseManagerOverviewPage() {
  return (
    <div className="w-full max-w-[1200px] mx-auto flex flex-col gap-8 p-6 sm:p-8">
      {/* Header */}
      <div className="flex flex-col gap-2">
        <h1
          style={{
            fontFamily: '"Instrument Serif", serif',
            fontWeight: 400,
            fontSize: 32,
            lineHeight: '48px',
            color: '#111827',
          }}
        >
          Welcome to Tether, {RELEASE_MANAGER_NAME}
        </h1>
        <p
          style={{
            fontFamily: 'Inter, sans-serif',
            fontWeight: 400,
            fontSize: 15,
            lineHeight: '22.5px',
            letterSpacing: '-0.23px',
            color: '#6B7280',
          }}
        >
          Overview of what {OWNER_NAME} is leaving for family and friends
        </p>
      </div>

      {/* Stat cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {STATS.map((stat) => (
          <div
            key={stat.label}
            className="flex flex-col"
            style={{
              gap: 4,
              borderRadius: 14,
              border: '1.25px solid #E5E7EB',
              background: '#FFFFFF',
              padding: '24px 25px',
            }}
          >
            <span
              style={{
                fontFamily: '"Instrument Serif", serif',
                fontWeight: 400,
                fontSize: 36,
                lineHeight: '54px',
                color: '#111827',
              }}
            >
              {stat.value}
            </span>
            <span
              style={{
                fontFamily: 'Inter, sans-serif',
                fontWeight: 400,
                fontSize: 13,
                lineHeight: '19.5px',
                letterSpacing: '-0.08px',
                color: '#6B7280',
              }}
            >
              {stat.label}
            </span>
          </div>
        ))}
      </div>

      {/* Recent activity */}
      <div
        className="flex flex-col"
        style={{
          gap: 16,
          borderRadius: 14,
          border: '1.25px solid #E5E7EB',
          background: '#FFFFFF',
          padding: '24px 25px',
        }}
      >
        <h2
          style={{
            fontFamily: 'Inter, sans-serif',
            fontWeight: 600,
            fontSize: 18,
            lineHeight: '27px',
            letterSpacing: '-0.44px',
            color: '#111827',
          }}
        >
          Recent activity
        </h2>

        <div className="flex flex-col" style={{ gap: 16 }}>
          {ACTIVITY.map((item) => (
            <div key={item.text} className="flex items-start gap-3">
              <span
                className="flex-shrink-0"
                style={{
                  width: 8,
                  height: 8,
                  borderRadius: 9999,
                  background: item.color,
                  marginTop: 7,
                }}
              />
              <div className="flex-1 min-w-0 flex items-start justify-between gap-3">
                <span
                  style={{
                    fontFamily: 'Inter, sans-serif',
                    fontWeight: 400,
                    fontSize: 14,
                    lineHeight: '21px',
                    letterSpacing: '-0.15px',
                    color: '#374151',
                  }}
                >
                  {item.text}
                </span>
                <span
                  className="flex-shrink-0 whitespace-nowrap"
                  style={{
                    fontFamily: 'Inter, sans-serif',
                    fontWeight: 400,
                    fontSize: 13,
                    lineHeight: '19.5px',
                    letterSpacing: '-0.08px',
                    color: '#9CA3AF',
                  }}
                >
                  {item.time}
                </span>
              </div>
            </div>
          ))}
        </div>

        <button
          type="button"
          className="self-start cursor-pointer hover:opacity-80 mt-1"
          style={{
            fontFamily: 'Inter, sans-serif',
            fontWeight: 500,
            fontSize: 14,
            lineHeight: '21px',
            letterSpacing: '-0.15px',
            color: '#4F46E5',
          }}
        >
          View full notification log →
        </button>
      </div>
    </div>
  )
}
