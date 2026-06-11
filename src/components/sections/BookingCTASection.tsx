/**
 * DETAIL PALS V2 — Booking CTA (motion-upgraded)
 * =================================================
 * Added:
 *   — SplitTextReveal on the editorial headline
 *   — data-cursor="cta" on primary CTA
 *   — Ambient particle density increase in this section
 *   — Trust signals animate in with stagger
 *   — Background glow breathes subtly
 */

import { m, LazyMotion, domAnimation } from 'framer-motion'
import { clsx } from 'clsx'
import { staggerContainer, fadeUp, springs, Section, SectionInner, GoldRule } from '@/design-system'
import { PrimaryButton, ArrowRight } from '@/design-system'
import { SplitTextReveal } from '@/components/ui/SplitTextReveal'
import { AtmosphericBackground } from '@/components/ui/AtmosphericBackground'

export function BookingCTASection() {
  return (
    <LazyMotion features={domAnimation}>
      <section
        id="booking"
        className="relative bg-dp-bg py-[var(--dp-pad-y)] px-[var(--dp-pad-x)] overflow-hidden"
      >
        {/* Slow ambient showroom fog background */}
        <AtmosphericBackground variant="showroom" intensity={0.5} />
        {/* Breathing gold glow — ambient energy */}
        <m.div
          className="absolute inset-0 pointer-events-none"
          animate={{ opacity: [0.6, 1, 0.6] }}
          transition={{ duration: 6, repeat: Infinity, ease: 'easeInOut' }}
          style={{
            background: `
              radial-gradient(ellipse 50% 70% at 50% 0%,  rgba(201,168,76,0.06) 0%, transparent 65%),
              radial-gradient(ellipse 30% 40% at 50% 5%,  rgba(201,168,76,0.04) 0%, transparent 50%)
            `,
          }}
          aria-hidden="true"
        />

        <div className="max-w-[var(--dp-max-w)] mx-auto relative z-10">
          <GoldRule direction="center" className="mb-16" />

          <m.div
            className="flex flex-col items-center text-center gap-8"
            variants={staggerContainer(0.1)}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: '-80px' }}
          >
            {/* Eyebrow */}
            <m.p
              variants={fadeUp}
              className="font-sans font-normal text-xs tracking-[0.22em] uppercase text-dp-gold flex items-center gap-3"
            >
              <span className="block w-6 h-px bg-dp-gold" aria-hidden="true" />
              Ready when you are
              <span className="block w-6 h-px bg-dp-gold" aria-hidden="true" />
            </m.p>

            {/* Split text headline */}
            <m.div variants={fadeUp} className="max-w-[560px]">
              <SplitTextReveal
                text="Your car is waiting"
                as="h2"
                className={clsx(
                  'font-display font-light leading-tight tracking-[-0.01em] text-section text-dp-text',
                  'block mb-2',
                )}
                stagger={0.06}
              />
              <SplitTextReveal
                text="for its transformation."
                as="h2"
                className={clsx(
                  'font-display italic font-light leading-tight tracking-[-0.01em] text-section text-dp-text-warm',
                  'block',
                )}
                stagger={0.05}
                delay={0.3}
              />
            </m.div>

            <m.p
              variants={fadeUp}
              className="font-sans font-light text-base text-dp-text-muted max-w-[420px] leading-[1.75]"
            >
              Slots fill quickly. Book your detail now or call us directly —
              we will talk you through the right service for your vehicle.
            </m.p>

            {/* CTAs */}
            <m.div
              variants={fadeUp}
              className="flex flex-col sm:flex-row items-center gap-4 sm:gap-6"
            >
              <PrimaryButton
                href="/booking"
                data-cursor="cta"
                className="text-sm px-10 py-4"
              >
                Book online
                <ArrowRight />
              </PrimaryButton>

              <a
                href="tel:+15879734256"
                data-cursor="hover"
                className={clsx(
                  'relative inline-flex items-center gap-3',
                  'font-sans font-light text-sm tracking-[0.06em]',
                  'text-[rgba(240,237,230,0.65)] hover:text-dp-text',
                  'no-underline pb-[2px] transition-colors duration-300 group',
                )}
              >
                <PhoneIcon />
                +1 (587) 973-4256
                <span
                  className="absolute bottom-0 left-0 h-px bg-dp-gold w-0 group-hover:w-full transition-[width] duration-300 ease-dp-out"
                  aria-hidden="true"
                />
              </a>
            </m.div>

            {/* Trust signals with stagger */}
            <m.div
              variants={staggerContainer(0.06)}
              className="flex flex-wrap items-center justify-center gap-6 pt-2"
            >
              {['No hidden fees', 'Available 6 days a week', 'Satisfaction guaranteed', 'Fully insured'].map(signal => (
                <m.span
                  key={signal}
                  variants={fadeUp}
                  className="flex items-center gap-2 font-sans font-light text-xs text-dp-text-muted"
                >
                  <span className="block w-2 h-px bg-dp-gold" aria-hidden="true" />
                  {signal}
                </m.span>
              ))}
            </m.div>
          </m.div>
        </div>
      </section>
    </LazyMotion>
  )
}

function PhoneIcon() {
  return (
    <svg className="w-4 h-4 flex-shrink-0 transition-transform duration-300 group-hover:scale-110" viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path d="M6.62 10.79c1.44 2.83 3.76 5.14 6.59 6.59l2.2-2.2c.27-.27.67-.36 1.02-.24 1.12.37 2.33.57 3.57.57.55 0 1 .45 1 1V20c0 .55-.45 1-1 1-9.39 0-17-7.61-17-17 0-.55.45-1 1-1h3.5c.55 0 1 .45 1 1 0 1.25.2 2.45.57 3.57.11.35.03.74-.25 1.02l-2.2 2.2z" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round"/>
    </svg>
  )
}
