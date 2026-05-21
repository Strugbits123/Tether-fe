"use client"

import React, { useState, useEffect, Suspense } from 'react'
import Link from 'next/link'
import { useRouter, useSearchParams } from 'next/navigation'
import { useToast } from '@/lib/context/ToastContext'
import { Eye, EyeOff } from 'lucide-react'

function RegisterForm() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const { showToast } = useToast()

  // Read view mode from URL search param (?mode=signin or ?mode=signup)
  const [isSignUp, setIsSignUp] = useState(false)
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [loading, setLoading] = useState(false)

  // Form states
  const [firstName, setFirstName] = useState('')
  const [lastName, setLastName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [agreeTerms, setAgreeTerms] = useState(false)

  useEffect(() => {
    const mode = searchParams.get('mode')
    if (mode === 'signup') {
      setIsSignUp(true)
    } else if (mode === 'signin') {
      setIsSignUp(false)
    }
  }, [searchParams])

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()

    if (!email || !password) {
      showToast('Please fill in all required fields.', 'error')
      return
    }

    if (isSignUp) {
      if (!firstName || !lastName) {
        showToast('Please enter your first and last name.', 'error')
        return
      }
      if (password !== confirmPassword) {
        showToast('Passwords do not match.', 'error')
        return
      }
      if (!agreeTerms) {
        showToast('You must agree to the terms and privacy policy.', 'error')
        return
      }
    }

    setLoading(true)

    // Simulate network latency
    setTimeout(() => {
      setLoading(false)
      if (isSignUp) {
        showToast('Account created successfully! Welcome to Tether.', 'success')
        router.push('/onboarding')
      } else {
        showToast('Welcome back to Tether!', 'success')
        router.push('/')
      }
    }, 1200)
  }

  const toggleMode = () => {
    setIsSignUp(!isSignUp)
    // Clear inputs on toggle
    setFirstName('')
    setLastName('')
    setEmail('')
    setPassword('')
    setConfirmPassword('')
    setAgreeTerms(false)
  }

  return (
    <div className="flex flex-col items-center">
      {/* Centered Logo above the card */}
      <div className="mb-8 flex justify-center cursor-pointer" onClick={() => router.push('/')}>
        <img 
          src="/Logo.png" 
          alt="Tether Logo" 
          className="h-[43px] w-auto select-none" 
        />
      </div>

      {/* Main card */}
      <div 
        className="w-full max-w-[485px] md:w-[485px] min-h-[671px] bg-[#FFFFFF] rounded-[16px] p-8 md:p-[48px] flex flex-col justify-between"
        style={{
          boxShadow: '0px 8px 10px -6px rgba(0,0,0,0.1), 0px 20px 25px -5px rgba(0,0,0,0.1)',
          opacity: 1
        }}
      >
        <div className="space-y-6">
          {/* Card Header Title */}
          <div className="text-center space-y-1">
            <h2 className="font-serif font-normal text-[37px] leading-[48px] text-[#111827]">
              {isSignUp ? 'Create your account' : 'Welcome back to Tether'}
            </h2>
            <p className="font-sans font-normal text-sm text-[#4B5563]">
              {isSignUp ? 'Share what matters most' : 'Continue to your account.'}
            </p>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-4">
            {isSignUp && (
              <div className="grid grid-cols-2 gap-4">
                {/* First Name */}
                <div className="space-y-1.5">
                  <label className="block font-sans font-medium text-sm leading-[20px] tracking-[-0.15px] text-[#374151]">
                    First Name<span className="text-red-500">*</span>
                  </label>
                  <input
                    key="first-name-input"
                    type="text"
                    value={firstName}
                    onChange={(e) => setFirstName(e.target.value)}
                    placeholder="Alan"
                    className="w-full px-4 py-3 bg-white border border-[#D1D5DB] rounded-[10px] text-sm text-[#111827] focus:outline-none focus:border-indigo-600 focus:ring-1 focus:ring-indigo-600 transition-all font-sans h-[50px]"
                  />
                </div>
                {/* Last Name */}
                <div className="space-y-1.5">
                  <label className="block font-sans font-medium text-sm leading-[20px] tracking-[-0.15px] text-[#374151]">
                    Last Name<span className="text-red-500">*</span>
                  </label>
                  <input
                    key="last-name-input"
                    type="text"
                    value={lastName}
                    onChange={(e) => setLastName(e.target.value)}
                    placeholder="Wally"
                    className="w-full px-4 py-3 bg-white border border-[#D1D5DB] rounded-[10px] text-sm text-[#111827] focus:outline-none focus:border-indigo-600 focus:ring-1 focus:ring-indigo-600 transition-all font-sans h-[50px]"
                  />
                </div>
              </div>
            )}

            {/* Email Address */}
            <div className="space-y-1.5">
              <label className="block font-sans font-medium text-sm leading-[20px] tracking-[-0.15px] text-[#374151]">
                Email address<span className="text-red-500">*</span>
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@example.com"
                className="w-full px-4 py-3 bg-white border border-[#D1D5DB] rounded-[10px] text-sm text-[#111827] focus:outline-none focus:border-indigo-600 focus:ring-1 focus:ring-indigo-600 transition-all font-sans h-[50px]"
              />
            </div>

            {/* Password */}
            <div className="space-y-1.5">
              <label className="block font-sans font-medium text-sm leading-[20px] tracking-[-0.15px] text-[#374151]">
                Password<span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <input
                  key="password-input"
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder={isSignUp ? 'Create a strong password' : 'password'}
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

            {/* Confirm Password (only for signup) */}
            {isSignUp && (
              <div className="space-y-1.5">
                <label className="block font-sans font-medium text-sm leading-[20px] tracking-[-0.15px] text-[#374151]">
                  Confirm password<span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <input
                    key="confirm-password-input"
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
            )}

            {/* Form Footer Row */}
            <div className="flex items-center justify-between text-sm py-1">
              {isSignUp ? (
                <div className="flex items-start gap-2">
                  <input
                    key="agree-checkbox"
                    type="checkbox"
                    id="agree"
                    checked={agreeTerms}
                    onChange={(e) => setAgreeTerms(e.target.checked)}
                    className="w-4 h-4 mt-[3px] rounded border-[#D1D5DB] accent-indigo-600 focus:ring-indigo-500"
                  />
                  <label htmlFor="agree" className="text-xs self-center text-[#6B7280] leading-tight select-none">
                    I agree to the{' '}
                    <a href="#" className="font-medium text-[#4F46E5] hover:underline underline-offset-2">
                      Terms of Service
                    </a>{' '}
                    and{' '}
                    <a href="#" className="font-medium text-[#4F46E5] hover:underline underline-offset-2">
                      Privacy Policy
                    </a>
                  </label>
                </div>
              ) : (
                <>
                  <div className="flex items-center gap-2">
                    <input
                      key="remember-checkbox"
                      type="checkbox"
                      id="remember"
                      className="w-4 h-4 rounded border-[#D1D5DB] accent-indigo-600 focus:ring-indigo-500"
                    />
                    <label htmlFor="remember" className="font-sans text-[13px] text-[#4B5563] select-none leading-[19.5px]">
                      Remember me
                    </label>
                  </div>
                  <a 
                    href="#" 
                    className="font-sans font-medium text-[13px] leading-[19.5px] text-[#4F46E5] hover:text-[#4338CA] transition-colors"
                  >
                    Forgot password?
                  </a>
                </>
              )}
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={loading}
              className="w-full h-[48px] bg-[#4F46E5] hover:bg-[#4338CA] text-white font-sans font-medium text-sm rounded-[10px] transition-all flex items-center justify-center gap-2 shadow-sm hover:shadow-md cursor-pointer disabled:bg-indigo-400 mt-2"
            >
              {loading ? (
                <svg className="animate-spin h-5 w-5 text-white" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                </svg>
              ) : (
                <>
                  <span>{isSignUp ? 'Continue' : 'Sign in'}</span>
                  <span className="text-base font-bold">→</span>
                </>
              )}
            </button>
          </form>
        </div>

        {/* Divider and SSO */}
        <div className="space-y-4 pt-4">
          <div className="relative flex items-center justify-center">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-[#E5E7EB]"></div>
            </div>
            <span className="relative px-3 bg-white text-xs font-sans text-[#9CA3AF] uppercase">Or</span>
          </div>

          <div className="space-y-2.5">
            {/* Sign in with Magic Link (Only on Sign In) */}
            {!isSignUp && (
              <button
                type="button"
                className="w-full h-[48px] bg-[#FFFFFF] border-[1.25px] border-[#D1D5DB] hover:bg-[#F9FAFB] rounded-[10px] transition-all flex items-center justify-center text-sm font-sans font-medium text-[#374151] cursor-pointer"
              >
                <img 
                  src="/register/magicIcon.png" 
                  alt="Magic Icon" 
                  className="w-[18px] h-[18px] mr-2 select-none" 
                />
                <span>Sign in with Magic Link</span>
              </button>
            )}

            {/* Continue with Google */}
            <button
              type="button"
              className="w-full h-[48px] bg-[#FFFFFF] border-[1.25px] border-[#D1D5DB] hover:bg-[#F9FAFB] rounded-[10px] transition-all flex items-center justify-center text-sm font-sans font-medium text-[#374151] cursor-pointer"
            >
              <img 
                src="/register/google.png" 
                alt="Google Icon" 
                className="w-[18px] h-[18px] mr-2 select-none" 
              />
              <span>Continue with Google</span>
            </button>
          </div>

          {/* Toggle Tab Footer */}
          <div className="text-center text-sm font-sans text-[#4B5563] pt-2">
            {isSignUp ? 'Already have an account? ' : "Don't have an account? "}
            <button
              type="button"
              onClick={toggleMode}
              className="font-semibold text-[#4F46E5] cursor-pointer hover:text-[#4338CA] hover:underline"
            >
              {isSignUp ? 'Sign in' : 'Sign up'}
            </button>
          </div>
        </div>
      </div>

      {/* Under-card text */}
      <div className="mt-6 flex items-center justify-center gap-2">
        <img 
          src="/register/secure.png" 
          alt="Secure" 
          className="w-4 h-4 object-contain select-none" 
        />
        <span className="font-sans font-normal text-sm leading-[20px] tracking-[-0.15px] text-[#6A7282] text-center">
          Your data is encrypted and secure
        </span>
      </div>
    </div>
  )
}

export default function RegisterPage() {
  return (
    <div 
      className="min-h-screen flex flex-col items-center justify-center px-4 py-8 font-sans"
      style={{
        background: 'linear-gradient(135deg, #EEF2FF 0%, #FFFFFF 50%, #F0FDF4 100%)'
      }}
    >
      <Suspense fallback={
        <div className="w-full max-w-[485px] h-[671px] bg-white rounded-[16px] shadow-lg flex items-center justify-center">
          <svg className="animate-spin h-8 w-8 text-indigo-600" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
          </svg>
        </div>
      }>
        <RegisterForm />
      </Suspense>
    </div>
  )
}
