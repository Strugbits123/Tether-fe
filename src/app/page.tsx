import React from 'react'
import {
  Navbar,
  HeroSection,
  FeaturesBar,
  ProblemSection,
  WhatWeDoSection,
  HowItWorksSection,
  CoreFeaturesSection,
  WhatFamiliesSaySection,
  FinalCTASection,
  Footer,
} from '@/components/landing'

export default function LandingPage() {
  return (
    <div className="min-h-screen font-sans bg-white text-slate-900 overflow-x-hidden">
      <Navbar />
      <HeroSection />
      <FeaturesBar />
      <ProblemSection />
      <WhatWeDoSection />
      <HowItWorksSection />
      <CoreFeaturesSection />
      <WhatFamiliesSaySection />
      <FinalCTASection />
      <Footer />
    </div>
  )
}
