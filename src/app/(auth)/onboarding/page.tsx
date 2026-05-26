"use client"

import React, { useState } from 'react'
import { useRouter } from 'next/navigation'
import { useToast } from '@/lib/context/ToastContext'
import { createClient } from '@/lib/supabase/client'
import { api } from '@/lib/api/client'
import Step1 from '@/components/onboarding/Step1'
import Step2 from '@/components/onboarding/Step2'
import Step3 from '@/components/onboarding/Step3'
import Step4 from '@/components/onboarding/Step4'
import Step5 from '@/components/onboarding/Step5'

export default function OnboardingPage() {
  const router = useRouter()
  const { showToast } = useToast()
  
  const [currentStep, setCurrentStep] = useState(1)
  const [loading, setLoading] = useState(false)
  const [stepLoading, setStepLoading] = useState(false)

  // Step 1: Purpose
  const [purposes, setPurposes] = useState<string[]>([])

  // Step 2: Recipients
  const [recipients, setRecipients] = useState<any[]>([])

  // Step 3: Release Manager
  const [releaseManager, setReleaseManager] = useState<any>(null)

  // Step 4: Message

  const handleStep1Next = async (selections: string[]) => {
    setPurposes(selections)
    setStepLoading(true)
    try {
      const supabase = createClient()
      const { data: { session } } = await supabase.auth.getSession()
      if (session?.access_token) {
        await api.post('/users/onboarding/purposes', { purposes: selections }, session.access_token)
      }
    } catch {
      // Non-blocking — proceed regardless
    } finally {
      setStepLoading(false)
      setCurrentStep(2)
    }
  }

  const handleStep2Next = async (recips: any[]) => {
    setRecipients(recips)
    setStepLoading(true)
    try {
      const supabase = createClient()
      const { data: { session } } = await supabase.auth.getSession()
      const token = session?.access_token
      if (token && recips.length > 0) {
        await Promise.allSettled(
          recips.map((r) =>
            api.post('/recipients', {
              name: `${r.firstName} ${r.lastName}`,
              email: r.email,
              relationship: r.relationship.toLowerCase(),
            }, token)
          )
        )
      }
    } catch {
      // Non-blocking — proceed regardless
    } finally {
      setStepLoading(false)
      setCurrentStep(3)
    }
  }

  const handleStep2Back = () => {
    setCurrentStep(1)
  }

  const handleStep3Next = async (manager: any) => {
    setReleaseManager(manager)
    setStepLoading(true)
    try {
      const supabase = createClient()
      const { data: { session } } = await supabase.auth.getSession()
      const token = session?.access_token
      if (token && manager) {
        await api.post('/release-managers', {
          name: `${manager.firstName} ${manager.lastName}`,
          email: manager.email,
          relationship: manager.relationship.toLowerCase(),
          phone_number: manager.phone || undefined,
        }, token)
      }
    } catch {
      // Non-blocking — proceed regardless
    } finally {
      setStepLoading(false)
      setCurrentStep(4)
    }
  }

  const handleStep3Back = () => {
    setCurrentStep(2)
  }

  const handleStep4Next = () => {
    setCurrentStep(5)
  }

  const handleStep4Back = () => {
    setCurrentStep(3)
  }

  const handleStep5Next = async () => {
    setLoading(true)
    try {
      const supabase = createClient()
      const { data: { session } } = await supabase.auth.getSession()
      const token = session?.access_token

      if (!token) {
        showToast('Session expired. Please sign in again.', 'error')
        router.push('/signin')
        return
      }

      await api.post('/users/onboarding/complete', {}, token)

      showToast('Welcome to Tether!', 'success')
      router.push('/dashboard')
    } catch (err: any) {
      showToast(err.message || 'Something went wrong. Please try again.', 'error')
    } finally {
      setLoading(false)
    }
  }

  const handleStep5Back = () => {
    setCurrentStep(4)
  }

  return (
    <div
      className="min-h-screen font-sans flex items-center justify-center"
      style={{
        background: 'linear-gradient(135deg, #EEF2FF 0%, #FFFFFF 50%, #F0FDF4 100%)',
      }}
    >
      {currentStep === 1 && (
        <Step1 onNext={handleStep1Next} loading={stepLoading} />
      )}

      {currentStep === 2 && (
        <Step2 onNext={handleStep2Next} onBack={handleStep2Back} loading={stepLoading} />
      )}

      {currentStep === 3 && (
        <Step3 onNext={handleStep3Next} onBack={handleStep3Back} loading={stepLoading} />
      )}

      {currentStep === 4 && (
        <Step4 onNext={handleStep4Next} onBack={handleStep4Back} />
      )}

      {currentStep === 5 && (
        <Step5 onNext={handleStep5Next} onBack={handleStep5Back} loading={loading} />
      )}
    </div>
  )
}
