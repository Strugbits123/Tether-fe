'use client'

import React, { useState, useEffect } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { useToast } from '@/lib/context/ToastContext'
import { Eye, EyeOff } from 'lucide-react'
import { FiLock } from 'react-icons/fi'
import { createClient } from '@/lib/supabase/client'

export default function UpdatePasswordPage() {
  const router = useRouter()
  const { showToast } = useToast()

  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [loading, setLoading] = useState(false)
  const [invalidLink, setInvalidLink] = useState(false)

  const supabase = createClient()

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (!session) setInvalidLink(true)
    })
  }, []) // eslint-disable-line react-hooks/exhaustive-deps

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!password || !confirmPassword) {
      showToast('Please fill in all fields.', 'error')
      return
    }
    if (password.length < 8) {
      showToast('Password must be at least 8 characters.', 'error')
      return
    }
    if (password !== confirmPassword) {
      showToast('Passwords do not match.', 'error')
      return
    }

    setLoading(true)
    try {
      const { error } = await supabase.auth.updateUser({ password })
      if (error) {
        showToast(error.message, 'error')
        return
      }
      showToast('Password updated successfully.', 'success')
      setTimeout(() => router.push('/dashboard'), 1500)
    } catch (err: any) {
      showToast(err.message || 'Something went wrong.', 'error')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div
      className="min-h-screen flex flex-col items-center justify-center px-4 py-8 font-sans"
      style={{ background: 'linear-gradient(135deg, #EEF2FF 0%, #FFFFFF 50%, #F0FDF4 100%)' }}
    >
      <div className="flex flex-col items-center">
        {/* Logo */}
        <div className="mb-8 flex justify-center cursor-pointer" onClick={() => router.push('/')}>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src="/Logo.png" alt="Tether Logo" className="h-[43px] w-auto select-none" />
        </div>

        {invalidLink ? (
          /* ── Expired link state ── */
          <div
            className="w-full max-w-[448px] md:w-[448px] bg-[#FFFFFF] rounded-[16px] flex flex-col items-center text-center"
            style={{
              padding: '40px',
              gap: '24px',
              boxShadow: '0px 8px 5px 0px rgba(0,0,0,0.10), 0px 20px 12.5px 0px rgba(0,0,0,0.10)',
            }}
          >
            <div
              className="flex items-center justify-center"
              style={{
                width: '56px',
                height: '56px',
                borderRadius: '16px',
                backgroundColor: '#FEF2F2',
              }}
            >
              <FiLock style={{ width: '24px', height: '24px', color: '#EF4444' }} />
            </div>

            <div className="space-y-2">
              <h2
                style={{
                  fontFamily: '"Instrument Serif", Georgia, serif',
                  fontWeight: 400,
                  fontSize: '32px',
                  lineHeight: '40px',
                  color: '#111827',
                  margin: 0,
                }}
              >
                Link expired
              </h2>
              <p
                style={{
                  fontFamily: 'Inter, sans-serif',
                  fontWeight: 400,
                  fontSize: '14px',
                  lineHeight: '22.75px',
                  color: '#4A5565',
                  margin: 0,
                }}
              >
                This reset link has expired. Please request a new one.
              </p>
            </div>

            <Link
              href="/signin"
              className="w-full bg-[#4F46E5] hover:bg-[#4338CA] text-white rounded-[10px] transition-all flex items-center justify-center gap-2 cursor-pointer"
              style={{
                height: '48px',
                fontFamily: 'Inter, sans-serif',
                fontWeight: 500,
                fontSize: '16px',
                lineHeight: '24px',
                color: '#FFFFFF',
              }}
            >
              Back to sign in
            </Link>
          </div>
        ) : (
          /* ── Update password form ── */
          <div
            className="w-full max-w-[448px] md:w-[448px] bg-[#FFFFFF] rounded-[16px] flex flex-col"
            style={{
              padding: '40px',
              gap: '24px',
              boxShadow: '0px 8px 5px 0px rgba(0,0,0,0.10), 0px 20px 12.5px 0px rgba(0,0,0,0.10)',
            }}
          >
            {/* Padlock icon — 56×56 */}
            <div
              className="mx-auto flex items-center justify-center"
              style={{
                width: '56px',
                height: '56px',
                borderRadius: '16px',
                backgroundColor: '#EEF2FF',
              }}
            >
              <FiLock style={{ width: '24px', height: '24px', color: '#4F46E5' }} />
            </div>

            {/* Heading + subtext */}
            <div className="text-center space-y-2">
              <h2
                style={{
                  fontFamily: '"Instrument Serif", Georgia, serif',
                  fontWeight: 400,
                  fontSize: '32px',
                  lineHeight: '40px',
                  color: '#111827',
                  margin: 0,
                }}
              >
                Set a new password
              </h2>
              <p
                style={{
                  fontFamily: 'Inter, sans-serif',
                  fontWeight: 400,
                  fontSize: '14px',
                  lineHeight: '22.75px',
                  color: '#4A5565',
                  margin: 0,
                }}
              >
                Choose a strong password for your Tether account.
              </p>
            </div>

            {/* Form */}
            <form onSubmit={handleSubmit} className="flex flex-col" style={{ gap: '16px' }}>
              {/* New Password */}
              <div className="space-y-1.5">
                <label className="block font-sans font-medium text-sm leading-[20px] tracking-[-0.15px] text-[#374151]">
                  New Password<span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <input
                    type={showPassword ? 'text' : 'password'}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Min. 8 characters"
                    className="w-full pl-4 pr-10 py-3 bg-white border border-[#D1D5DB] rounded-[10px] text-sm text-[#111827] focus:outline-none focus:border-indigo-600 focus:ring-1 focus:ring-indigo-600 transition-all font-sans h-[50px]"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3.5 top-1/2 -translate-y-1/2 p-0.5 text-slate-400 hover:text-slate-600 focus:outline-none"
                  >
                    {showPassword ? <EyeOff className="w-[18px] h-[18px]" /> : <Eye className="w-[18px] h-[18px]" />}
                  </button>
                </div>
              </div>

              {/* Confirm Password */}
              <div className="space-y-1.5">
                <label className="block font-sans font-medium text-sm leading-[20px] tracking-[-0.15px] text-[#374151]">
                  Confirm Password<span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <input
                    type={showConfirmPassword ? 'text' : 'password'}
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    placeholder="Re-enter your password"
                    className="w-full pl-4 pr-10 py-3 bg-white border border-[#D1D5DB] rounded-[10px] text-sm text-[#111827] focus:outline-none focus:border-indigo-600 focus:ring-1 focus:ring-indigo-600 transition-all font-sans h-[50px]"
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    className="absolute right-3.5 top-1/2 -translate-y-1/2 p-0.5 text-slate-400 hover:text-slate-600 focus:outline-none"
                  >
                    {showConfirmPassword ? <EyeOff className="w-[18px] h-[18px]" /> : <Eye className="w-[18px] h-[18px]" />}
                  </button>
                </div>
              </div>

              {/* Submit */}
              <button
                type="submit"
                disabled={loading}
                className="w-full bg-[#4F46E5] hover:bg-[#4338CA] text-white rounded-[10px] transition-all flex items-center justify-center gap-2 cursor-pointer disabled:bg-indigo-400"
                style={{
                  height: '48px',
                  fontFamily: 'Inter, sans-serif',
                  fontWeight: 500,
                  fontSize: '16px',
                  lineHeight: '24px',
                  color: '#FFFFFF',
                }}
              >
                {loading ? (
                  <svg className="animate-spin h-5 w-5 text-white" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                  </svg>
                ) : (
                  <>
                    <span>Update Password</span>
                    <span className="text-base">→</span>
                  </>
                )}
              </button>
            </form>

            <p
              className="text-center"
              style={{
                fontFamily: 'Inter, sans-serif',
                fontWeight: 400,
                fontSize: '12px',
                lineHeight: '19.5px',
                color: '#6A7282',
                margin: 0,
              }}
            >
              Make sure to save your new password somewhere safe.
            </p>
          </div>
        )}

        {/* Under-card text */}
        <div className="mt-6 flex items-center justify-center gap-2">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src="/register/secure.png" alt="Secure" className="w-4 h-4 object-contain select-none" />
          <span className="font-sans font-normal text-sm leading-[20px] tracking-[-0.15px] text-[#6A7282] text-center">
            Your data is encrypted and secure
          </span>
        </div>
      </div>
    </div>
  )
}
