import { getCmsContent } from '@/lib/api'
import { HeroSection } from '@/components/home/HeroSection'
import { TrustStrip } from '@/components/home/TrustStrip'
import { WhatWeDo } from '@/components/home/WhatWeDo'
import { FeaturedProperties } from '@/components/home/FeaturedProperties'
import { WhyDubai } from '@/components/home/WhyDubai'
import { OurProcess } from '@/components/home/OurProcess'
import { CTABanner } from '@/components/home/CTABanner'

export default async function HomePage() {
  const cms = await getCmsContent('home')

  return (
    <>
      <HeroSection cms={cms} />
      <TrustStrip cms={cms} />
      <WhatWeDo cms={cms} />
      <FeaturedProperties />
      <WhyDubai cms={cms} />
      <OurProcess cms={cms} />
      <CTABanner cms={cms} />
    </>
  )
}
