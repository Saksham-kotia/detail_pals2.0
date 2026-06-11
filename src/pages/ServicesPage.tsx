/**
 * DETAIL PALS V2 — Services Page (fully implemented)
 * Full immersive services experience with page hero, all tiers, add-ons
 */
import { PageWrapper }       from '@/components/ui/PageWrapper'
import { Footer }            from '@/components/layout/Footer'
import { MobileStickyBar }   from '@/components/ui/MobileStickyBar'
import { ServicesSection }   from '@/components/sections/ServicesSection'
import { ProcessSection }    from '@/components/sections/ProcessSection'
import { AtmosphericBackground } from '@/components/ui/AtmosphericBackground'
import { InfiniteMarquee }   from '@/components/ui/InfiniteMarquee'
import { SplitTextReveal }   from '@/components/ui/SplitTextReveal'
import { GoldRule, Eyebrow } from '@/design-system'
import { m } from 'framer-motion'
import { springs } from '@/design-system'
import { Link } from 'react-router-dom'

const MARQUEE_ITEMS = [
  'Paint correction', 'Ceramic coating', 'Clay decontamination',
  'Machine polish', 'Sealant protection', 'Swirl removal',
  'Ceramic wheel coat', 'Interior protection', 'Engine bay detail',
]

export function ServicesPage() {
  return (
    <PageWrapper>
      {/* Page hero */}
      <section className="relative min-h-[55vh] flex items-end bg-dp-bg pt-[var(--dp-nav-h)] pb-20 px-[var(--dp-pad-x)] overflow-hidden">
        <AtmosphericBackground variant="showroom" intensity={1.2} />
        <div className="absolute inset-0 z-[1]" style={{
          background: 'radial-gradient(ellipse 80% 60% at 60% 80%, rgba(201,168,76,0.05) 0%, transparent 65%)',
        }} aria-hidden="true" />

        <div className="relative z-10 max-w-[var(--dp-max-w)] mx-auto w-full">
          <m.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={springs.responsive}>
            <Eyebrow className="mb-6">Our services</Eyebrow>
          </m.div>
          <SplitTextReveal text="Obsessive care" as="h1" onMount delay={0.1}
            className="font-display font-light text-section text-dp-text block mb-2" />
          <SplitTextReveal text="for every vehicle." as="h1" onMount delay={0.25}
            className="font-display italic font-light text-section text-dp-text-warm block mb-8" />
          <m.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.5, duration: 0.6 }}
            className="font-sans font-light text-base text-dp-text-muted max-w-[520px] leading-[1.78]">
            Three levels of precision. Choose the treatment your car deserves —
            from foundational care to concours-grade perfection.
          </m.p>
        </div>
      </section>

      <InfiniteMarquee items={MARQUEE_ITEMS} speed="normal" highlightEvery={3} />

      <ServicesSection />
      <ProcessSection />
      <Footer />
      <MobileStickyBar />
    </PageWrapper>
  )
}
