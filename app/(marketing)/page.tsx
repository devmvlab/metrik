import { HeroSection } from '@/components/marketing/HeroSection'
import { ProblemSection } from '@/components/marketing/ProblemSection'
import { SolutionSection } from '@/components/marketing/SolutionSection'
import { FeaturesSection } from '@/components/marketing/FeaturesSection'
import { PricingSection } from '@/components/marketing/PricingSection'
import { FaqSection } from '@/components/marketing/FaqSection'
import { Footer } from '@/components/marketing/Footer'

export default function HomePage() {
  return (
    <div className="min-h-screen bg-slate-950 text-white">
      <HeroSection />
      <ProblemSection />
      <SolutionSection />
      <FeaturesSection />
      <PricingSection />
      <FaqSection />
      <Footer />
    </div>
  )
}
