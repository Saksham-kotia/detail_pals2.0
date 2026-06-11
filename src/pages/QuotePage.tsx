/**
 * DETAIL PALS V2 — Quote Configurator Page (fully implemented)
 */
import { PageWrapper }       from '@/components/ui/PageWrapper'
import { Footer }            from '@/components/layout/Footer'
import { MobileStickyBar }   from '@/components/ui/MobileStickyBar'
import { QuoteSection }      from '@/components/sections/QuoteSection'
import { AtmosphericBackground } from '@/components/ui/AtmosphericBackground'
import { SplitTextReveal }   from '@/components/ui/SplitTextReveal'
import { Eyebrow }           from '@/design-system'
import { springs }           from '@/design-system'
import { m }                 from 'framer-motion'
import { PolishOrb, ChromeStreak } from '@/components/ui/AutomotiveSVGs'

import { useSearchParams }    from 'react-router-dom'
import { ServiceTier }       from '@/types'

export function QuotePage() {
  const [searchParams] = useSearchParams()
  const preselected = searchParams.get('tier') as ServiceTier | null

  return (
    <PageWrapper>
      {/* Instrument panel hero */}
      <section className="relative min-h-[50vh] flex items-end bg-dp-bg pt-[var(--dp-nav-h)] pb-20 px-[var(--dp-pad-x)] overflow-hidden">
        <AtmosphericBackground variant="surface" intensity={1.0} />

        {/* Decorative orb — suggests the polisher calculating */}
        <div className="absolute right-[5%] top-[10%] opacity-40 pointer-events-none" aria-hidden="true">
          <PolishOrb size={360} />
        </div>
        <div className="absolute left-0 bottom-0 w-full h-px" style={{
          background: 'linear-gradient(to right, transparent, rgba(201,168,76,0.3) 30%, rgba(201,168,76,0.5) 50%, rgba(201,168,76,0.3) 70%, transparent)',
        }} aria-hidden="true"/>

        <div className="relative z-10 max-w-[var(--dp-max-w)] mx-auto w-full">
          <m.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.1 }}>
            <Eyebrow className="mb-6">Your investment</Eyebrow>
          </m.div>
          <SplitTextReveal text="Configure your" as="h1" onMount delay={0.15}
            className="font-display font-light text-section text-dp-text block mb-2" />
          <SplitTextReveal text="perfect detail." as="h1" onMount delay={0.30}
            className="font-display italic font-light text-section text-dp-text-warm block mb-8" />
          <m.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.55, duration: 0.6 }}
            className="font-sans font-light text-base text-dp-text-muted max-w-[480px] leading-[1.78]">
            Select your service tier, vehicle type, and paint condition.
            Your personalised price is calculated instantly — and locked in when you book.
          </m.p>
        </div>
      </section>

      <QuoteSection preselectedTier={preselected} />
      <Footer />
      <MobileStickyBar />
    </PageWrapper>
  )
}
