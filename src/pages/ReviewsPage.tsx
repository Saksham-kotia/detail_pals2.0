/**
 * DETAIL PALS V2 — Reviews Page (fully implemented)
 */
import { PageWrapper }          from '@/components/ui/PageWrapper'
import { Footer }               from '@/components/layout/Footer'
import { MobileStickyBar }      from '@/components/ui/MobileStickyBar'
import { TestimonialsSection }  from '@/components/sections/TestimonialsSection'
import { StatsSection }         from '@/components/sections/StatsSection'
import { AtmosphericBackground } from '@/components/ui/AtmosphericBackground'
import { SplitTextReveal }      from '@/components/ui/SplitTextReveal'
import { Eyebrow, GoldRule, staggerContainer, fadeUp } from '@/design-system'
import { m, LazyMotion, domAnimation } from 'framer-motion'
import { springs } from '@/design-system'
import { TESTIMONIALS } from '@/data'

const PLATFORMS = [
  { name: 'Google',      rating: '4.9', count: '142' },
  { name: 'Trustpilot',  rating: '5.0', count: '89'  },
  { name: 'Facebook',    rating: '5.0', count: '67'  },
]

export function ReviewsPage() {
  return (
    <PageWrapper>
      <LazyMotion features={domAnimation}>
        {/* Page hero */}
        <section className="relative min-h-[50vh] flex items-end bg-dp-bg pt-[var(--dp-nav-h)] pb-20 px-[var(--dp-pad-x)] overflow-hidden">
          <AtmosphericBackground variant="showroom" intensity={0.9} />
          <div className="relative z-10 max-w-[var(--dp-max-w)] mx-auto w-full">
            <m.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={springs.responsive}>
              <Eyebrow className="mb-6">Client voices</Eyebrow>
            </m.div>
            <SplitTextReveal text="Trusted by owners" as="h1" onMount delay={0.1}
              className="font-display font-light text-section text-dp-text block mb-2" />
            <SplitTextReveal text="who expect the best." as="h1" onMount delay={0.25}
              className="font-display italic font-light text-section text-dp-text-warm block mb-8" />

            {/* Platform rating badges */}
            <m.div
              className="flex flex-wrap gap-4 mt-6"
              variants={staggerContainer(0.08)}
              initial="hidden"
              animate="visible"
            >
              {PLATFORMS.map(p => (
                <m.div key={p.name} variants={fadeUp}
                  className="border border-[var(--dp-border-gold-dim)] px-5 py-3 flex flex-col gap-1"
                  style={{ background: 'rgba(12,10,6,0.7)', backdropFilter: 'blur(10px)' }}
                >
                  <p className="font-sans font-normal text-[9px] tracking-[0.16em] uppercase text-dp-gold">{p.name}</p>
                  <div className="flex items-baseline gap-2">
                    <span className="font-sans font-light text-xl text-dp-text">{p.rating}</span>
                    <span className="text-dp-gold text-sm">★</span>
                    <span className="font-sans font-light text-xs text-dp-text-muted">({p.count} reviews)</span>
                  </div>
                </m.div>
              ))}
            </m.div>
          </div>
        </section>

        <TestimonialsSection />
        <StatsSection />
        <Footer />
        <MobileStickyBar />
      </LazyMotion>
    </PageWrapper>
  )
}
