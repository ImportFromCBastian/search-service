import { BackToTop } from './back-to-top'
import { ClientMarquee } from './client-marquee'
import { CtaBanner } from './cta-banner'
import { FaqSection } from './faq-section'
import { FeaturesGrid } from './features-grid'
import { HeroSection } from './hero-section'
import { LandingHeader } from './landing-header'
import { PipelineSection } from './pipeline-section'

export function LandingPage() {
  return (
    <div className="relative min-h-screen bg-grid-overlay flex flex-col">
      <LandingHeader />
      <main className="flex-1">
        <HeroSection />
        <ClientMarquee />
        <FeaturesGrid />
        <PipelineSection />
        <FaqSection />
        <CtaBanner />
      </main>
      <BackToTop />
    </div>
  )
}
