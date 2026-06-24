import { getTranslations } from 'next-intl/server'
import { ScrollReveal } from '@/components/ui/ScrollReveal'
import { SectionBackground } from '@/components/ui/SectionBackground'

export async function OurProcess({ bgJson }: { cms?: Record<string, unknown>; bgJson?: string | null }) {
  const t = await getTranslations('process')

  const eyebrow  = t('eyebrow')
  const headLine1 = t('headline1')
  const headLine2 = t('headline2')
  const stepLabel = t('step')

  const STEPS = [
    { number: '01', title: t('step1Title'), description: t('step1Desc') },
    { number: '02', title: t('step2Title'), description: t('step2Desc') },
    { number: '03', title: t('step3Title'), description: t('step3Desc') },
    { number: '04', title: t('step4Title'), description: t('step4Desc') },
  ]

  return (
    <section className="py-24 bg-brand relative overflow-hidden">
      <SectionBackground bgJson={bgJson} opacity={20} />
      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <ScrollReveal>
          <div className="text-center mb-16">
            <div className="inline-flex items-center gap-3 mb-5">
              <div className="h-px w-10 bg-gold" />
              <span className="text-gold text-xs tracking-[0.3em] uppercase">{eyebrow}</span>
              <div className="h-px w-10 bg-gold" />
            </div>
            <h2 className="font-serif text-4xl sm:text-5xl font-bold text-white">
              {headLine1}
              <br />
              <span className="text-gold-gradient italic">{headLine2}</span>
            </h2>
          </div>
        </ScrollReveal>

        {/* Desktop: horizontal stepper */}
        <div className="hidden md:grid grid-cols-4 gap-0 relative">
          {/* Connector line */}
          <div className="absolute top-10 left-[12.5%] right-[12.5%] h-px bg-gradient-to-r from-transparent via-gold/40 to-transparent" />

          {STEPS.map((step, i) => (
            <ScrollReveal key={step.number} delay={i * 0.15}>
              <div className="relative flex flex-col items-center text-center px-6">
                {/* Step circle */}
                <div className="relative z-10 w-20 h-20 rounded-full border-2 border-gold-border bg-brand flex flex-col items-center justify-center mb-6 group-hover:border-gold transition-colors">
                  <span className="text-gold text-[10px] tracking-widest uppercase">{stepLabel}</span>
                  <span className="text-gold font-serif text-2xl font-bold leading-none">{step.number}</span>
                </div>
                <h3 className="text-white font-semibold text-lg mb-3 tracking-wide">
                  {step.title}
                </h3>
                <p className="text-muted text-sm leading-relaxed">{step.description}</p>
              </div>
            </ScrollReveal>
          ))}
        </div>

        {/* Mobile: vertical */}
        <div className="md:hidden space-y-6">
          {STEPS.map((step, i) => (
            <ScrollReveal key={step.number} delay={i * 0.1}>
              <div className="flex gap-5 p-6 border border-white/5 rounded-sm bg-brand-section/30">
                <div className="shrink-0 w-14 h-14 rounded-full border border-gold-border flex flex-col items-center justify-center">
                  <span className="text-gold text-[9px] tracking-widest uppercase">{stepLabel}</span>
                  <span className="text-gold font-serif text-xl font-bold leading-none">{step.number}</span>
                </div>
                <div>
                  <h3 className="text-white font-semibold mb-1">{step.title}</h3>
                  <p className="text-muted text-sm leading-relaxed">{step.description}</p>
                </div>
              </div>
            </ScrollReveal>
          ))}
        </div>
      </div>
    </section>
  )
}
