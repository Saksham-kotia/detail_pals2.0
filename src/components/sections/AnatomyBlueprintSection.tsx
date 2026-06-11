import { useState } from 'react'
import { clsx } from 'clsx'
import { m, LazyMotion, domAnimation, AnimatePresence } from 'framer-motion'
import { CarSilhouette } from '@/components/ui/AutomotiveSVGs'
import { AtmosphericBackground } from '@/components/ui/AtmosphericBackground'
import {
  Eyebrow,
  Section,
  SectionInner,
  SectionHeadline,
  springs,
  fadeUp,
  staggerContainer
} from '@/design-system'

type Hotspot = {
  id: string
  title: string
  desc: string
  stat: string
  metric: string
  x: number // percentage
  y: number // percentage
}

const ANATOMY_HOTSPOTS: Hotspot[] = [
  {
    id: 'bonnet',
    title: 'Self-Healing Shield (PPF)',
    desc: 'Bespoke hand-cut STEK film protecting front bumpers and bonnets from paint stone chips and bug etching.',
    stat: '8.0 mils',
    metric: 'Elastomeric thickness',
    x: 82,
    y: 60
  },
  {
    id: 'paint',
    title: 'Paint Correction Pass',
    desc: 'Precision leveling of clear coat using micro-abrasives to eliminate scratches and restore a perfectly flat mirror finish.',
    stat: '95%+',
    metric: 'Defect removal rate',
    x: 42,
    y: 65
  },
  {
    id: 'glass',
    title: 'Glass Hydrophobic Guard',
    desc: 'Ceramic fluorine coating bonded to front and rear windscreens to ensure water rolls off above 40mph.',
    stat: '110°',
    metric: 'Water sliding angle',
    x: 52,
    y: 35
  },
  {
    id: 'wheels',
    title: '9H Ceramic Wheel Coat',
    desc: 'High-temperature resistant silica baked onto alloy face and brake calipers to repel abrasive metallic brake dust.',
    stat: '800°F',
    metric: 'Thermal threshold',
    x: 72,
    y: 78
  },
  {
    id: 'cabin',
    title: 'Leather Deep Nourishment',
    desc: 'pH-neutral cleaning followed by beeswax conditioning to replenish hide oils, preventing cracks and UV fading.',
    stat: '99.9%',
    metric: 'Cabin dust sanitized',
    x: 48,
    y: 44
  }
]

export function AnatomyBlueprintSection() {
  const [activeHotspot, setActiveHotspot] = useState<Hotspot>(ANATOMY_HOTSPOTS[0])

  return (
    <LazyMotion features={domAnimation}>
      <Section id="showroom-blueprint" className="bg-dp-bg border-t border-b border-dp-border relative overflow-hidden">
        {/* Slow ambient showroom fog background */}
        <AtmosphericBackground variant="surface" intensity={0.6} />

        {/* Ambient background decoration */}
        <div className="absolute inset-0 opacity-[0.02] pointer-events-none" style={{
          backgroundImage: 'radial-gradient(circle, var(--dp-gold) 1.5px, transparent 1.5px)',
          backgroundSize: '32px 32px'
        }} />
        
        <SectionInner>
          <m.div
            variants={staggerContainer(0.08)}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            className="mb-14 text-center relative z-10"
          >
            <m.div variants={fadeUp} className="justify-center flex">
              <Eyebrow className="mb-5">Detailing Anatomy</Eyebrow>
            </m.div>
            <m.div variants={fadeUp}>
              <SectionHeadline>
                The Blueprint of <em>Restoration</em>
              </SectionHeadline>
            </m.div>
            <m.p variants={fadeUp} className="font-sans font-light text-base text-dp-text-muted max-w-[500px] mx-auto mt-4">
              Hover or select any diagnostic hotspot across the vehicle chassis blueprint to inspect clear coat parameters.
            </m.p>
          </m.div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-10 items-center relative z-10">
            {/* Interactive blueprint container (occupies 2/3) */}
            <div className="lg:col-span-2 relative border border-dp-border bg-dp-surface/40 p-6 md:p-12 aspect-[16/9] flex items-center justify-center overflow-hidden">
              {/* Backdrop vector grid lines */}
              <div className="absolute inset-0 opacity-[0.03]" style={{
                backgroundImage: 'radial-gradient(circle, var(--dp-gold) 1px, transparent 1px)',
                backgroundSize: '24px 24px'
              }} />

              {/* Car Silhouette blueprint */}
              <div className="relative w-full h-full opacity-60">
                <CarSilhouette className="w-full h-full object-contain" />
              </div>

              {/* Hotspot triggers overlay */}
              {ANATOMY_HOTSPOTS.map(h => {
                const isActive = activeHotspot.id === h.id
                return (
                  <button
                    key={h.id}
                    onClick={() => setActiveHotspot(h)}
                    onMouseEnter={() => setActiveHotspot(h)}
                    className="absolute w-8 h-8 -translate-x-1/2 -translate-y-1/2 flex items-center justify-center cursor-pointer bg-transparent border-none z-20 focus:outline-none"
                    style={{ left: `${h.x}%`, top: `${h.y}%` }}
                    data-cursor="hover"
                    aria-label={`Inspect ${h.title}`}
                  >
                    {/* Ring */}
                    <m.div
                      className={clsx(
                        'w-6 h-6 rounded-full border flex items-center justify-center transition-all duration-300',
                        isActive ? 'border-dp-gold bg-dp-gold/15 shadow-gold-sm' : 'border-dp-text-muted bg-dp-bg/40'
                      )}
                      animate={isActive ? { scale: [1, 1.2, 1] } : {}}
                      transition={{ repeat: Infinity, duration: 2 }}
                    >
                      {/* Dot */}
                      <div className={clsx('w-2 h-2 rounded-full', isActive ? 'bg-dp-gold' : 'bg-dp-text-muted')} />
                    </m.div>
                  </button>
                )
              })}
            </div>

            {/* Hotspot details sidebar (occupies 1/3) */}
            <div className="h-full flex flex-col justify-center">
              <AnimatePresence mode="wait">
                <m.div
                  key={activeHotspot.id}
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  transition={springs.responsive}
                  className="border border-[var(--dp-border-gold-dim)] bg-dp-surface-2 p-8 space-y-6 shadow-gold-sm"
                >
                  <div>
                    <span className="text-[9px] font-sans font-normal text-dp-gold uppercase tracking-widest block mb-1">
                      Diagnostic Node
                    </span>
                    <h3 className="font-display font-light text-2xl text-dp-text">
                      {activeHotspot.title}
                    </h3>
                    <div className="w-8 h-px bg-dp-gold mt-3" />
                  </div>

                  <p className="font-sans font-light text-xs leading-relaxed text-dp-text-muted">
                    {activeHotspot.desc}
                  </p>

                  <div className="border-t border-dp-border/60 pt-4 flex justify-between items-baseline">
                    <div>
                      <span className="text-[8px] text-dp-text-subtle uppercase block font-sans tracking-wide">Metric</span>
                      <span className="text-xs text-dp-text font-normal">{activeHotspot.metric}</span>
                    </div>
                    <div className="text-right">
                      <span className="text-[8px] text-dp-text-subtle uppercase block font-sans tracking-wide">Target Spec</span>
                      <span className="text-lg text-dp-gold font-normal">{activeHotspot.stat}</span>
                    </div>
                  </div>
                </m.div>
              </AnimatePresence>
            </div>
          </div>
        </SectionInner>
      </Section>
    </LazyMotion>
  )
}
