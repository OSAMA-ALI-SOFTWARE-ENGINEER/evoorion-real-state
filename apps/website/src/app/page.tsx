import { HeroSection } from '@/components/home/HeroSection'
import { TrustStrip } from '@/components/home/TrustStrip'
import { WhatWeDo } from '@/components/home/WhatWeDo'
import { FeaturedProperties } from '@/components/home/FeaturedProperties'
import { WhyDubai } from '@/components/home/WhyDubai'
import { OurProcess } from '@/components/home/OurProcess'
import { CTABanner } from '@/components/home/CTABanner'

export default function HomePage() {
  return (
    <>
      <HeroSection />
      <TrustStrip />
      <WhatWeDo />
      <FeaturedProperties />
      <WhyDubai />
      <OurProcess />
      <CTABanner />
    </>
  )
}
