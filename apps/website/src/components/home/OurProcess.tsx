import { ScrollReveal } from '@/components/ui/ScrollReveal'

const DEFAULT_STEPS = [
  { number: '01', title: 'Discover', description: 'We conduct a thorough discovery session to understand your investment goals, risk profile, and preferences.' },
  { number: '02', title: 'Select',   description: 'Our advisors curate a bespoke shortlist of off-market and listed properties matched to your criteria.' },
  { number: '03', title: 'Acquire',  description: 'We handle negotiations, legal due diligence, SPA drafting, and DLD registration — end to end.' },
  { number: '04', title: 'Manage',   description: 'Post-acquisition, our team ensures your asset is tenanted, managed, and optimised for maximum yield.' },
]

export function OurProcess({ cms }: { cms?: Record<string, unknown> }) {
  const eyebrow = (cms?.our_process_eyebrow as string) ?? 'The Process'
  const rawHeadline = (cms?.our_process_headline as string) ?? "A Seamless\nInvestment Journey"
  const [headLine1, headLine2] = rawHeadline.split('\n')
  const STEPS = (cms?.our_process_steps as typeof DEFAULT_STEPS) ?? DEFAULT_STEPS
  return (
    <section className="py-24 bg-brand">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
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
                  <span className="text-gold text-[10px] tracking-widest uppercase">Step</span>
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
                  <span className="text-gold text-[9px] tracking-widest uppercase">Step</span>
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
