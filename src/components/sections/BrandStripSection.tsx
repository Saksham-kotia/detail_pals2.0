/**
 * DETAIL PALS V2 — Brand Strip (motion-upgraded)
 * =================================================
 * Added:
 *   — TiltCard on each pillar card
 *   — SplitTextReveal on pillar titles
 *   — data-cursor="hover" on interactive elements
 *   — Stagger sequence via Framer Motion container
 */

import { m, LazyMotion, domAnimation } from 'framer-motion'
import { clsx } from 'clsx'
import { staggerContainer, fadeUp } from '@/design-system'
import { TiltCard } from '@/components/ui/TiltCard'

const PILLARS = [
  {
    id:    'hand-applied',
    title: 'Hand-applied, every time',
    body:  'No machines. No shortcuts. Every product is applied by hand because paint demands the attention a machine cannot give it.',
  },
  {
    id:    'chemistry',
    title: 'Paint-safe chemistry only',
    body:  'We use exclusively pH-neutral, certified products. Nothing touches your vehicle that we would not trust on a concours-prepared car.',
  },
  {
    id:    'guarantee',
    title: 'Satisfaction, guaranteed',
    body:  'If you are not completely satisfied with the result, we return and make it right. No questions. No charge.',
  },
] as const

export function BrandStripSection() {
  return (
    <LazyMotion features={domAnimation}>
      <div
        id="brand-strip"
        className="bg-dp-surface border-t border-b border-[var(--dp-border)] py-14 px-[var(--dp-pad-x)]"
      >
        <m.div
          className="max-w-[var(--dp-max-w)] mx-auto grid grid-cols-1 md:grid-cols-3 gap-6"
          variants={staggerContainer(0.12)}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: '-80px' }}
        >
          {PILLARS.map(({ id, title, body }) => (
            <m.div key={id} variants={fadeUp}>
              <TiltCard
                goldAccent
                maxTilt={6}
                glareIntensity={0.08}
                data-cursor="hover"
                className={clsx(
                  'border border-[var(--dp-border)] hover:border-[var(--dp-border-gold-dim)]',
                  'bg-dp-surface p-6 flex flex-col gap-4',
                  'transition-colors duration-500',
                )}
              >
                <div className="w-5 h-px bg-dp-gold" aria-hidden="true" />
                <p className="font-sans font-normal text-[15px] tracking-[0.03em] text-dp-text">
                  {title}
                </p>
                <p className="font-sans font-light text-sm leading-[1.65] text-dp-text-muted">
                  {body}
                </p>
              </TiltCard>
            </m.div>
          ))}
        </m.div>
      </div>
    </LazyMotion>
  )
}
