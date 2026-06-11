/**
 * DETAIL PALS V2 — StatsSection (visual richness upgrade)
 * =========================================================
 * Added:
 *   — AtmosphericBackground (surface variant)
 *   — WaterDroplet SVG positioned as atmosphere left-side
 *   — PolishOrb behind the stats
 *   — Animated counter with spring overshoot
 *   — Floating label indicators above each stat
 *   — data-cursor attributes
 */

import { useRef } from 'react'
import { m, LazyMotion, domAnimation, useInView } from 'framer-motion'
import { clsx } from 'clsx'
import { staggerContainer, fadeUp, springs, GoldRule } from '@/design-system'
import { useCountUp } from '@/hooks'
import { STATS } from '@/data'
import { AtmosphericBackground } from '@/components/ui/AtmosphericBackground'
import { WaterDroplet, PolishOrb } from '@/components/ui/AutomotiveSVGs'

export function StatsSection() {
  const sectionRef = useRef<HTMLElement>(null)
  const isInView   = useInView(sectionRef, { once: true, margin: '-100px' })

  return (
    <LazyMotion features={domAnimation}>
      <section
        ref={sectionRef}
        id="stats"
        className="relative bg-dp-bg py-[var(--dp-pad-y)] px-[var(--dp-pad-x)] overflow-hidden"
        data-cursor="default"
      >
        {/* Animated atmosphere */}
        <AtmosphericBackground variant="surface" intensity={0.9} />

        {/* Water droplet — left atmospheric element */}
        <m.div
          className="absolute left-[-4%] bottom-[10%] w-[28%] max-w-[320px] opacity-[0.12] pointer-events-none"
          aria-hidden="true"
          animate={{ y: [0, -10, 0], opacity: [0.10, 0.16, 0.10] }}
          transition={{ duration: 14, repeat: Infinity, ease: 'easeInOut' }}
        >
          <WaterDroplet />
        </m.div>

        {/* Polish orb — right atmospheric element */}
        <div className="absolute right-[-6%] top-[5%] opacity-60 pointer-events-none" aria-hidden="true">
          <PolishOrb size={280} />
        </div>

        <div className="max-w-[var(--dp-max-w)] mx-auto relative z-10">
          <GoldRule className="mb-16" />

          <m.div
            className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-12 lg:gap-6"
            variants={staggerContainer(0.1, 0.1)}
            initial="hidden"
            animate={isInView ? 'visible' : 'hidden'}
          >
            {STATS.map((stat, i) => (
              <StatItem key={stat.label} stat={stat} active={isInView} delay={i * 0.1} />
            ))}
          </m.div>
        </div>
      </section>
    </LazyMotion>
  )
}

function StatItem({ stat, active, delay }: {
  stat:   typeof STATS[number]
  active: boolean
  delay:  number
}) {
  const isDecimal = stat.value.includes('.')
  const numVal    = parseFloat(stat.value)
  const counted   = useCountUp({ target: numVal, duration: 1800, decimals: isDecimal ? 1 : 0, enabled: active })

  return (
    <m.div
      variants={fadeUp}
      transition={{ ...springs.responsive, delay }}
      className="flex flex-col gap-4"
      data-cursor="hover"
    >
      {/* Floating indicator label */}
      <m.div
        className="flex items-center gap-2"
        animate={{ y: [0, -3, 0] }}
        transition={{ duration: 4 + delay * 2, repeat: Infinity, ease: 'easeInOut', delay }}
      >
        <span className="block w-2 h-px bg-dp-gold opacity-70" aria-hidden="true" />
        <span className="font-sans font-normal text-[9px] tracking-[0.18em] uppercase text-dp-gold opacity-70">
          {stat.label}
        </span>
      </m.div>

      {/* Animated number */}
      <div className="flex items-end gap-1 leading-none">
        <span
          className="font-sans font-light leading-none text-dp-text"
          style={{ fontSize: 'clamp(48px,5vw,72px)', letterSpacing: '-0.02em' }}
        >
          {counted}
        </span>
        {stat.suffix && (
          <span className="font-sans font-light text-[clamp(24px,2.5vw,36px)] text-dp-gold pb-1">
            {stat.suffix}
          </span>
        )}
      </div>

      {/* Gold thread */}
      <m.div
        className="h-px bg-dp-gold"
        style={{ boxShadow: '0 0 6px rgba(201,168,76,0.3)' }}
        initial={{ width: 0 }}
        animate={{ width: active ? 32 : 0 }}
        transition={{ delay: delay + 0.6, duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
        aria-hidden="true"
      />

      <div className="flex flex-col gap-1">
        <p className="font-sans font-normal text-sm text-dp-text">{stat.detail}</p>
      </div>
    </m.div>
  )
}
