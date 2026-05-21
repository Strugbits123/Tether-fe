"use client"

import React, { useState } from 'react'
import { useRouter } from 'next/navigation'
import { useToast } from '@/lib/context/ToastContext'
import Step1 from '@/components/onboarding/Step1'
import Step2 from '@/components/onboarding/Step2'

export default function OnboardingPage() {
  const router = useRouter()
  const { showToast } = useToast()
  
  const [currentStep, setCurrentStep] = useState(1)
  const [loading, setLoading] = useState(false)

  // Step 1: Purpose
  const [purposes, setPurposes] = useState<string[]>([])

  // Step 2: Recipients
  const [recipients, setRecipients] = useState<any[]>([])

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
        <div className="text-center text-slate-500">
          <p className="text-lg">Step 3 coming soon...</p>
        </div>
      )}

      {currentStep === 4 && (
        <div className="text-center text-slate-500">
          <p className="text-lg">Step 4 coming soon...</p>
        </div>
      )}

      {currentStep === 5 && (
        <div className="text-center text-slate-500">
          <p className="text-lg">Step 5 coming soon...</p>
        </div>
      )}
    </div>
  )
}
