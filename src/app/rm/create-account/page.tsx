'use client'

import { Check } from 'lucide-react'

// Release Manager portal — Create your Tether account. Static signup page with
// the executor 25% discount pre-applied. Wires to billing endpoints later.

const BENEFITS = [
  'You’ve spent time thinking about what happens when someone is gone. You know better than most why this matters.',
  'The people who love you deserve the same thing you just gave to Sarah’s family.',
  'It takes about 10 minutes to set up. Your first message can be recorded today.',
]

export default function CreateAccountPage() {
  return (
    <div className="w-full max-w-[700px] mx-auto flex flex-col gap-5 p-6 sm:p-8">
      {/* Page title */}
      <h1
        className="text-center"
        style={{
          fontFamily: '"Instrument Serif", serif',
          fontWeight: 400,
          fontSize: 36,
          lineHeight: '54px',
          color: '#111827',
        }}
      >
        Protect your own legacy
      </h1>

      {/* Promo card */}
      <div
        className="flex flex-col"
        style={{
          borderRadius: 16,
          padding: 32,
          gap: 16,
          background: 'linear-gradient(135deg, #4F46E5 0%, #6366F1 100%)',
        }}
      >
        <div className="flex items-start justify-between" style={{ gap: 16 }}>
          <h2
            style={{
              fontFamily: '"Instrument Serif", serif',
              fontWeight: 400,
              fontSize: 28,
              lineHeight: '42px',
              color: '#FFFFFF',
            }}
          >
            You&apos;ve seen what Tether does for the people you love. Now do it
            for yours.
          </h2>
          <span
            className="flex items-center justify-center flex-shrink-0"
            style={{
              height: 38,
              padding: '0 16px',
              borderRadius: 9999,
              background: '#10B981',
              fontFamily: 'Inter, sans-serif',
              fontWeight: 700,
              fontSize: 15,
              lineHeight: '22.5px',
              letterSpacing: '-0.23px',
              color: '#FFFFFF',
            }}
          >
            25% OFF
          </span>
        </div>

        <p
          style={{
            fontFamily: 'Inter, sans-serif',
            fontWeight: 400,
            fontSize: 16,
            lineHeight: '24px',
            letterSpacing: '-0.31px',
            color: 'rgba(255,255,255,0.9)',
          }}
        >
          As Sarah&apos;s executor, you get 25% off a lifetime Legacy account —
          applied automatically at signup.
        </p>

        <div className="flex items-baseline" style={{ gap: 12 }}>
          <span
            style={{
              fontFamily: '"Instrument Serif", serif',
              fontWeight: 400,
              fontSize: 40,
              lineHeight: '60px',
              color: '#FFFFFF',
            }}
          >
            $72.75
          </span>
          <span
            style={{
              fontFamily: 'Inter, sans-serif',
              fontWeight: 400,
              fontSize: 24,
              lineHeight: '36px',
              letterSpacing: '0.07px',
              textDecoration: 'line-through',
              color: 'rgba(255,255,255,0.6)',
            }}
          >
            $97
          </span>
        </div>

        <div className="flex flex-col" style={{ gap: 4 }}>
          <span
            style={{
              fontFamily: 'Inter, sans-serif',
              fontWeight: 400,
              fontSize: 14,
              lineHeight: '21px',
              letterSpacing: '-0.15px',
              color: 'rgba(255,255,255,0.8)',
            }}
          >
            One payment, lifetime access. No annual renewal.
          </span>
          <span
            style={{
              fontFamily: 'Inter, sans-serif',
              fontWeight: 400,
              fontSize: 12,
              lineHeight: '18px',
              color: 'rgba(255,255,255,0.6)',
            }}
          >
            This offer is exclusive to executors and recipients of Tether
            accounts.
          </span>
        </div>
      </div>

      {/* Benefit rows */}
      <div className="flex flex-col" style={{ gap: 12 }}>
        {BENEFITS.map((text) => (
          <div
            key={text}
            className="flex items-start"
            style={{
              gap: 12,
              borderRadius: 10,
              border: '1.25px solid #E5E7EB',
              background: '#FFFFFF',
              padding: 16,
            }}
          >
            <span
              className="flex items-center justify-center flex-shrink-0"
              style={{
                width: 24,
                height: 24,
                borderRadius: 9999,
                background: '#D1FAE5',
                marginTop: 1,
              }}
            >
              <Check style={{ width: 16, height: 16, color: '#10B981' }} strokeWidth={2.5} />
            </span>
            <p
              style={{
                fontFamily: 'Inter, sans-serif',
                fontWeight: 400,
                fontSize: 14,
                lineHeight: '22.75px',
                letterSpacing: '-0.15px',
                color: '#374151',
              }}
            >
              {text}
            </p>
          </div>
        ))}
      </div>

      {/* Signup form */}
      <form
        className="flex flex-col"
        style={{
          gap: 20,
          borderRadius: 14,
          border: '0.8px solid #E5E7EB',
          background: '#FFFFFF',
          padding: 32,
        }}
        onSubmit={(e) => e.preventDefault()}
      >
        <h3
          style={{
            fontFamily: 'Inter, sans-serif',
            fontWeight: 600,
            fontSize: 20,
            lineHeight: '30px',
            letterSpacing: '-0.45px',
            color: '#111827',
          }}
        >
          Create your Tether account
        </h3>

        <Field label="First name" />
        <Field label="Last name" />
        <Field label="Email address" type="email" />
        <Field label="Confirm email address" type="email" />
        <Field label="Password" type="password" />
        <Field label="Confirm password" type="password" />

        {/* Payment information */}
        <div
          className="flex flex-col"
          style={{ gap: 16, paddingTop: 16.8, borderTop: '0.8px solid #E5E7EB' }}
        >
          <h4
            style={{
              fontFamily: 'Inter, sans-serif',
              fontWeight: 600,
              fontSize: 16,
              lineHeight: '24px',
              color: '#111827',
            }}
          >
            Payment information
          </h4>

          <Field label="Card number" required placeholder="1234  1234  1234  1234" />

          <div className="flex flex-col sm:flex-row" style={{ gap: 16 }}>
            <div className="flex-1">
              <Field label="Expiration" required placeholder="MM / YY" />
            </div>
            <div className="flex-1">
              <Field label="CVC" required placeholder="CVC" />
            </div>
          </div>

          <Field
            label="Billing ZIP code"
            required
            placeholder="1234  1234  1234  1234"
          />

          {/* Promo code (pre-filled with executor discount) */}
          <div className="flex flex-col" style={{ gap: 8 }}>
            <Label text="Promo code" required />
            <input
              defaultValue="EXECUTOR25"
              className="w-full"
              style={{
                height: 47.5,
                borderRadius: 10,
                border: '0.8px solid #4F46E5',
                background: '#EEF2FF',
                padding: '0 16px',
                fontFamily: 'Inter, sans-serif',
                fontWeight: 500,
                fontSize: 14,
                lineHeight: '21px',
                color: '#4F46E5',
              }}
            />
            <span
              style={{
                fontFamily: 'Inter, sans-serif',
                fontWeight: 400,
                fontSize: 12,
                lineHeight: '18px',
                color: '#10B981',
              }}
            >
              ✓ Your 25% executor discount is applied
            </span>
          </div>
        </div>

        {/* Submit */}
        <button
          type="submit"
          className="flex items-center justify-center cursor-pointer hover:opacity-90 transition-opacity"
          style={{
            height: 56,
            borderRadius: 10,
            background: '#10B981',
            fontFamily: 'Inter, sans-serif',
            fontWeight: 600,
            fontSize: 16,
            lineHeight: '24px',
            letterSpacing: '-0.31px',
            color: '#FFFFFF',
          }}
        >
          Create my Tether account — $72.75
        </button>

        <p
          className="text-center"
          style={{
            fontFamily: 'Inter, sans-serif',
            fontWeight: 400,
            fontSize: 12,
            lineHeight: '18px',
            color: '#9CA3AF',
          }}
        >
          By creating an account you agree to Tether&apos;s{' '}
          <a href="#" style={{ color: '#4F46E5' }}>
            Terms of Service
          </a>{' '}
          and{' '}
          <a href="#" style={{ color: '#4F46E5' }}>
            Privacy Policy
          </a>{' '}
          and{' '}
          <a href="#" style={{ color: '#4F46E5' }}>
            cookie policy
          </a>
        </p>
      </form>

      {/* Reassurance footer */}
      <div
        className="flex items-center"
        style={{
          gap: 12,
          borderRadius: 14,
          border: '1.25px solid #E5E7EB',
          background: '#FFFFFF',
          padding: '24px',
        }}
      >
        <span
          className="flex items-center justify-center flex-shrink-0"
          style={{ width: 20, height: 20, borderRadius: 9999, background: '#D1FAE5' }}
        >
          <Check style={{ width: 12, height: 12, color: '#10B981' }} strokeWidth={3} />
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
          One payment. No subscriptions. No renewal fees.
        </span>
      </div>
    </div>
  )
}

function Label({ text, required }: { text: string; required?: boolean }) {
  return (
    <label
      style={{
        fontFamily: 'Inter, sans-serif',
        fontWeight: 500,
        fontSize: 14,
        lineHeight: '21px',
        letterSpacing: '-0.15px',
        color: '#374151',
      }}
    >
      {text}
      {required && <span style={{ color: '#FF383C' }}> *</span>}
    </label>
  )
}

function Field({
  label,
  type = 'text',
  required,
  placeholder,
}: {
  label: string
  type?: string
  required?: boolean
  placeholder?: string
}) {
  return (
    <div className="flex flex-col" style={{ gap: 8 }}>
      <Label text={label} required={required} />
      <input
        type={type}
        placeholder={placeholder}
        className="w-full focus:outline-none focus:border-[#4F46E5] placeholder:text-[12px] placeholder:text-[#9CA3AF] placeholder:font-medium"
        style={{
          height: 47.5,
          borderRadius: 10,
          border: '0.8px solid #D1D5DB',
          background: '#FFFFFF',
          padding: '0 16px',
          fontFamily: 'Inter, sans-serif',
          fontWeight: 500,
          fontSize: 14,
          lineHeight: '21px',
          color: '#111827',
        }}
      />
    </div>
  )
}
