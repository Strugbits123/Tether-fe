"use client"

import React, { useState } from 'react'
import { useRouter } from 'next/navigation'
import { useToast } from '@/lib/context/ToastContext'
import { createClient } from '@/lib/supabase/client'
import { api } from '@/lib/api/client'
import { createRecipient, getRecipients } from '@/lib/api/recipients'
import { createReleaseManager, getReleaseManager } from '@/lib/api/release-managers'
import { toRecipientRelationship, toReleaseManagerRelationship } from '@/lib/relationship'
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
  const [fetchedRecipients, setFetchedRecipients] = useState<any[]>([])

  // Step 3: Release Manager
  const [releaseManager, setReleaseManager] = useState<any>(null)
  const [fetchedManager, setFetchedManager] = useState<any>(null)
  const [releaseManagerSaved, setReleaseManagerSaved] = useState(false)

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
            createRecipient(token, {
              firstName: r.firstName,
              lastName: r.lastName,
              email: r.email,
              relationship: toRecipientRelationship(r.relationship),
            })
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
      if (token && manager && !releaseManagerSaved) {
        await createReleaseManager(token, {
          firstName: manager.firstName,
          lastName: manager.lastName,
          email: manager.email,
          phone: manager.phone || undefined,
          relationship: toReleaseManagerRelationship(manager.relationship),
        })
        setReleaseManagerSaved(true)
      }
    } catch {
      // Non-blocking — proceed regardless
    } finally {
      setStepLoading(false)
      setCurrentStep(4)
    }
  }

  const handleStep3Back = async () => {
    try {
      const supabase = createClient()
      const { data: { session } } = await supabase.auth.getSession()
      const token = session?.access_token
      if (token) {
        const fetched = await getRecipients(token)
        setFetchedRecipients(fetched)
      }
    } catch {
      // Non-blocking — show step 2 regardless
    } finally {
      setRecipients([])
      setCurrentStep(2)
    }
  }

  const handleStep4Next = () => {
    setCurrentStep(5)
  }

  const handleStep4Back = async () => {
    try {
      const supabase = createClient()
      const { data: { session } } = await supabase.auth.getSession()
      const token = session?.access_token
      if (token) {
        const fetched = await getReleaseManager(token)
        if (fetched) {
          setFetchedManager(fetched)
          setReleaseManagerSaved(true)
        }
      }
    } catch {
      // Non-blocking — show step 3 regardless
    } finally {
      setCurrentStep(3)
    }
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
      router.push('/dashboard?onboarded=true')
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
        <Step2
          onNext={handleStep2Next}
          onBack={handleStep2Back}
          loading={stepLoading}
          initialRecipients={fetchedRecipients}
        />
      )}

      {currentStep === 3 && (
        <Step3
          onNext={handleStep3Next}
          onBack={handleStep3Back}
          loading={stepLoading}
          initialManager={fetchedManager}
        />
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
