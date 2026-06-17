import { getCmsContent, getPublicSettings } from '@/lib/api'
import { HeroSection } from '@/components/home/HeroSection'
import { TrustStrip } from '@/components/home/TrustStrip'
import { WhatWeDo } from '@/components/home/WhatWeDo'
import { FeaturedProperties } from '@/components/home/FeaturedProperties'
import { WhyDubai } from '@/components/home/WhyDubai'
import { OurProcess } from '@/components/home/OurProcess'
import { CTABanner } from '@/components/home/CTABanner'

export default async function HomePage() {
  const [cms, settings] = await Promise.all([
    getCmsContent('home'),
    getPublicSettings(),
  ])

  return (
    <>
      <HeroSection cms={cms} bgImage={settings.image_hero} />
      <TrustStrip
        cms={cms}
        partnersJson={settings.partners_list}
        speedSeconds={settings.trust_strip_speed}
        stripLabel={settings.trust_strip_label}
        bgJson={settings.section_bg_trust_strip}
      />
      <WhatWeDo cms={cms} bgJson={settings.section_bg_what_we_do} />
      <FeaturedProperties />
      <WhyDubai cms={cms} bgImage={settings.image_why_dubai} />
      <OurProcess cms={cms} bgJson={settings.section_bg_our_process} />
      <CTABanner cms={cms} bgImage={settings.image_cta} />
    </>
  )
}
