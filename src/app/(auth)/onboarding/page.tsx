"use client"

import React, { useState } from 'react'
import { useRouter } from 'next/navigation'
import { useToast } from '@/lib/context/ToastContext'
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

  // Step 1: Purpose
  const [purposes, setPurposes] = useState<string[]>([])

  // Step 2: Recipients
  const [recipients, setRecipients] = useState<any[]>([])

  // Step 3: Release Manager
  const [releaseManager, setReleaseManager] = useState<any>(null)

  // Step 4: Message

  const handleStep1Next = (selections: string[]) => {
    setPurposes(selections)
    setCurrentStep(2)
  }

  const handleStep2Next = (recips: any[]) => {
    setRecipients(recips)
    setCurrentStep(3)
  }

  const handleStep2Back = () => {
    setCurrentStep(1)
  }

  const handleStep3Next = (manager: any) => {
    setReleaseManager(manager)
    setCurrentStep(4)
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

  const handleStep5Next = () => {
    setLoading(true)
    if (typeof window !== 'undefined') {
      localStorage.setItem('tether_onboarded', 'true')
    }
    setTimeout(() => {
      setLoading(false)
      showToast('Onboarding completed! Welcome to Tether.', 'success')
      router.push('/')
    }, 1500)
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
        <Step1 onNext={handleStep1Next} />
      )}

      {currentStep === 2 && (
        <Step2 onNext={handleStep2Next} onBack={handleStep2Back} />
      )}

      {currentStep === 3 && (
        <Step3 onNext={handleStep3Next} onBack={handleStep3Back} />
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
