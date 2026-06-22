'use client'

import { useState } from 'react'
import RequestGuardianModal from '@/components/release-manager/RequestGuardianModal'
import ReleasePlanHeader, {
  type ReleasePlanView,
} from '@/components/release-manager/release-plan/ReleasePlanHeader'
import IntroView from '@/components/release-manager/release-plan/IntroView'
import Step1View from '@/components/release-manager/release-plan/Step1View'
import Step2View from '@/components/release-manager/release-plan/Step2View'
import Step3View from '@/components/release-manager/release-plan/Step3View'
import Step4View from '@/components/release-manager/release-plan/Step4View'
import Step5View from '@/components/release-manager/release-plan/Step5View'

// Release Manager portal — Release Plan. Orchestrates the step views; each
// step lives in its own component under components/release-manager/release-plan.
export default function ReleasePlanPage() {
  const [view, setView] = useState<ReleasePlanView>('intro')
  const [guardianModalOpen, setGuardianModalOpen] = useState(false)

  return (
    <div className="w-full max-w-[900px] mx-auto flex flex-col gap-8 p-6 sm:p-8">
      <ReleasePlanHeader view={view} />

      {view === 'intro' && (
        <IntroView
          onStart={() => setView('step1')}
          onRequestGuardian={() => setGuardianModalOpen(true)}
        />
      )}
      {view === 'step1' && (
        <Step1View
          onCancel={() => setView('intro')}
          onSubmit={() => setView('step2')}
        />
      )}
      {view === 'step2' && (
        <Step2View
          onCancel={() => setView('intro')}
          onComplete={() => setView('step3')}
        />
      )}
      {view === 'step3' && (
        <Step3View
          onCancel={() => setView('intro')}
          onContinue={() => setView('step4')}
        />
      )}
      {view === 'step4' && <Step4View onComplete={() => setView('step5')} />}
      {view === 'step5' && <Step5View />}

      <RequestGuardianModal
        open={guardianModalOpen}
        onClose={() => setGuardianModalOpen(false)}
      />
    </div>
  )
}
