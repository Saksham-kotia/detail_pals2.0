import { useState, useRef, useCallback } from 'react'
import { PageWrapper }           from '@/components/ui/PageWrapper'
import { Footer }                from '@/components/layout/Footer'
import { MobileStickyBar }       from '@/components/ui/MobileStickyBar'
import { ProcessSection }        from '@/components/sections/ProcessSection'
import { AtmosphericBackground } from '@/components/ui/AtmosphericBackground'
import { SplitTextReveal }       from '@/components/ui/SplitTextReveal'
import { InfiniteMarquee }       from '@/components/ui/InfiniteMarquee'
import {
  Eyebrow, staggerContainer, fadeUp, fadeLeft, fadeRight, springs,
  Section, SectionInner, SectionHeadline,
} from '@/design-system'
import { m, LazyMotion, domAnimation } from 'framer-motion'
import { WaterDroplet, PolishOrb, PaintClose } from '@/components/ui/AutomotiveSVGs'
import { TiltCard } from '@/components/ui/TiltCard'

const VALUES = [
  { title: 'Obsessive precision', body: 'Every panel is treated as if it will be judged under a concours inspection light. Because one day, it might be.' },
  { title: 'No shortcuts', body: 'We use only what is correct for each stage of the process. pH-safe chemistry, paint-thickness monitoring, single-panel corrections.' },
  { title: 'Craft over volume', body: 'We take on fewer vehicles than most shops. That is not a limitation — it is a choice. Attention cannot be divided.' },
]

const CERTS = [
  'IDA-Certified Detailer', 'ESCS Ceramic Specialist', 'CARPRO Authorised',
  'GYEON Certified', 'Gtechniq Accredited', 'Meguiar\'s Master Detailer',
]

const EQUIPMENT = [
  { label: 'Correction tools', value: 'Rupes & Flex dual-action' },
  { label: 'Coating', value: 'Gtechniq & GYEON SiO₂' },
  { label: 'Inspection', value: 'PosiTest DFT gauge' },
  { label: 'Lighting', value: '3M Sun Gun Pro' },
  { label: 'Decontamination', value: 'Iron-X & clay system' },
  { label: 'Protection', value: 'STEK DYNOShield PPF' },
]

export function AboutPage() {
  const [sliderPos, setSliderPos] = useState(50)
  const [isDragging, setIsDragging] = useState(false)
  const containerRef = useRef<HTMLDivElement>(null)

  const updatePos = useCallback((clientX: number) => {
    const el = containerRef.current
    if (!el) return
    const { left, width } = el.getBoundingClientRect()
    const pct = Math.max(4, Math.min(96, ((clientX - left) / width) * 100))
    setSliderPos(pct)
  }, [])

  const onPointerDown = (e: React.PointerEvent) => {
    e.preventDefault()
    setIsDragging(true)
    ;(e.currentTarget as HTMLElement).setPointerCapture(e.pointerId)
  }
  const onPointerMove = (e: React.PointerEvent) => {
    if (isDragging) updatePos(e.clientX)
  }
  const onPointerUp = () => setIsDragging(false)

  return (
    <PageWrapper>
      <LazyMotion features={domAnimation}>
        {/* Hero */}
        <section className="relative min-h-[65vh] flex items-end bg-dp-bg pt-[var(--dp-nav-h)] pb-20 px-[var(--dp-pad-x)] overflow-hidden">
          <AtmosphericBackground variant="showroom" intensity={1.0} />

          {/* Visual atmosphere — interactive before/after photo slider on the right side of hero */}
          <div className="absolute right-[var(--dp-pad-x)] top-[18%] bottom-[12%] w-[42%] hidden lg:flex items-center justify-center z-20">
            <div className="relative w-full aspect-[16/11] border border-dp-border hover:border-dp-gold transition-colors duration-500 bg-[#0a0a0a] shadow-gold-sm">
              <div
                ref={containerRef}
                className="w-full h-full relative overflow-hidden cursor-col-resize select-none"
                onPointerDown={onPointerDown}
                onPointerMove={onPointerMove}
                onPointerUp={onPointerUp}
                role="img"
                aria-label="Interactive Car Polish Before After Teaser"
              >
                {/* Before state: Dull, muddy, dusty + circular scratches */}
                <div className="absolute inset-0 w-full h-full">
                  <img
                    src="/audi_polished.png"
                    alt="Before detail"
                    className="w-full h-full object-cover pointer-events-none select-none"
                    style={{ filter: 'grayscale(20%) brightness(44%) contrast(80%) sepia(26%) blur(0.5px)' }}
                  />
                  
                  {/* Detailed dust, mud splatter, and mineral water spot overlay */}
                  <svg 
                    className="absolute inset-0 w-full h-full z-10 pointer-events-none" 
                    viewBox="0 0 640 400" 
                    fill="none"
                    preserveAspectRatio="xMidYMid slice"
                  >
                    {/* Mud splatters near bottom and side edges */}
                    <path
                      d="M-20 350 Q 80 320 140 370 T 320 380 T 480 360 T 660 380 L 660 420 L -20 420 Z"
                      fill="rgba(90, 70, 50, 0.55)"
                      filter="blur(1px)"
                    />
                    <path
                      d="M-10 370 Q 60 340 120 380 T 260 390 T 420 375 T 650 390 L 650 420 L -10 420 Z"
                      fill="rgba(70, 50, 35, 0.7)"
                    />
                    {/* Small random mud spots/flecks */}
                    {[
                      [80, 320, 4], [110, 340, 2.5], [150, 310, 3], [240, 335, 5],
                      [310, 320, 2], [380, 340, 6], [420, 320, 3.5], [490, 330, 4.5],
                      [520, 300, 3], [580, 330, 5.5], [25, 290, 4], [610, 280, 5]
                    ].map(([cx, cy, r], i) => (
                      <circle key={`mud-${i}`} cx={cx} cy={cy} r={r} fill="rgba(85, 65, 45, 0.65)" />
                    ))}

                    {/* Mineral hard-water spots (scale deposits) scattered on hood/windows */}
                    {[
                      [220, 150, 8], [280, 110, 12], [340, 140, 10], [160, 210, 9],
                      [420, 180, 14], [460, 130, 11], [300, 220, 7], [180, 120, 13],
                      [520, 160, 10], [250, 80, 11], [380, 90, 12], [110, 170, 8],
                      [480, 240, 9], [320, 280, 10], [150, 260, 12]
                    ].map(([cx, cy, r], i) => (
                      <g key={`spot-${i}`} opacity="0.22">
                        <circle cx={cx} cy={cy} r={r} stroke="white" strokeWidth="0.8" fill="rgba(255,255,255,0.06)" />
                        <circle cx={cx - 1} cy={cy - 1} r={r - 3} stroke="white" strokeWidth="0.5" strokeDasharray="1,1" />
                      </g>
                    ))}

                    {/* Micro-scratch concentric swirls centered around light highlights */}
                    {[1, 2, 3].map((set) => {
                      const cx = 320
                      const cy = 200
                      return (
                        <g key={`swirl-${set}`} opacity={0.55 / set}>
                          {[35, 65, 95, 130, 170].map((r) => (
                            <circle
                              key={r}
                              cx={cx}
                              cy={cy}
                              r={r}
                              stroke="rgba(255, 255, 255, 0.18)"
                              strokeWidth="0.7"
                              strokeDasharray="8, 3, 2, 3"
                            />
                          ))}
                        </g>
                      )
                    })}
                  </svg>
                  <span className="absolute bottom-3 left-3 font-sans font-normal text-[8px] tracking-widest text-white/50 bg-dp-bg/60 px-2 py-0.5 pointer-events-none">
                    STAGE-1 SURFACE DEGRADATION
                  </span>
                </div>

                {/* After state: Polished/coated Audi RS6 */}
                <div
                  className="absolute inset-0 w-full h-full overflow-hidden"
                  style={{ clipPath: `inset(0 0 0 ${sliderPos}%)` }}
                >
                  <img
                    src="/audi_polished.png"
                    alt="After detail"
                    className="w-full h-full object-cover pointer-events-none select-none"
                  />
                  <div className="absolute inset-0 bg-radial-gradient from-transparent to-dp-surface-deep opacity-30" />
                  <div className="absolute inset-0 pointer-events-none" style={{
                    background: 'radial-gradient(circle 120px at 50% 50%, rgba(201,168,76,0.18) 0%, transparent 80%)'
                  }} />
                  <span className="absolute bottom-3 left-3 font-sans font-normal text-[8px] tracking-widest text-dp-gold bg-dp-gold/15 border border-dp-gold/30 px-2 py-0.5 pointer-events-none">
                    STAGE-3 COATED SHIELD
                  </span>
                </div>

                {/* Slider divider line */}
                <div
                  className="absolute top-0 bottom-0 w-px bg-dp-gold z-10 pointer-events-none"
                  style={{ left: `${sliderPos}%` }}
                >
                  <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-6 h-6 rounded-full bg-dp-surface-2 border border-dp-gold flex items-center justify-center shadow-gold-sm">
                    <svg viewBox="0 0 16 16" className="w-2.5 h-2.5 fill-none stroke-dp-gold" strokeWidth="1.5">
                      <path d="M5 8L2 5M2 5L5 2M2 5H8M11 8L14 5M14 5L11 2M14 5H8" strokeLinecap="round" strokeLinejoin="round"/>
                    </svg>
                  </div>
                </div>

                {/* Labels */}
                <span className="absolute top-3 left-3 font-sans text-[8px] tracking-widest uppercase text-dp-text-muted bg-dp-bg/80 px-2 py-0.5 pointer-events-none">Before</span>
                <span className="absolute top-3 right-3 font-sans text-[8px] tracking-widest uppercase text-dp-gold bg-dp-gold/15 border border-dp-gold/30 px-2 py-0.5 pointer-events-none">After</span>

              </div>
            </div>
          </div>

          <div className="absolute right-0 top-0 bottom-0 w-[45%]" style={{
            background: 'linear-gradient(to right, var(--dp-bg) 20%, transparent 60%)',
          }} aria-hidden="true" />

          <div className="relative z-10 max-w-[var(--dp-max-w)] mx-auto w-full">
            <m.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={springs.responsive}>
              <Eyebrow className="mb-6">The story</Eyebrow>
            </m.div>
            <SplitTextReveal text="Eight years of craft." as="h1" onMount delay={0.1}
              className="font-display font-light text-section text-dp-text block mb-2" />
            <SplitTextReveal text="Not volume." as="h1" onMount delay={0.25}
              className="font-display italic font-light text-section text-dp-text-warm block mb-8" />
            <m.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.5 }}
              className="font-sans font-light text-base text-dp-text-muted max-w-[520px] leading-[1.78]">
              Detail Pals was built on a single conviction: that a vehicle's paint is worth protecting
              with the same attention a watchmaker gives to a movement. We chose craft over scale,
              and have never regretted it.
            </m.p>
          </div>
        </section>

        <InfiniteMarquee items={CERTS} speed="slow" direction="left" highlightEvery={2} />

        {/* Values section */}
        <Section className="bg-dp-surface">
          <SectionInner>
            <m.div
              variants={staggerContainer(0.08)}
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true, margin: '-80px' }}
              className="mb-16"
            >
              <m.div variants={fadeUp}><Eyebrow className="mb-5">What we believe</Eyebrow></m.div>
              <m.div variants={fadeUp}>
                <SectionHeadline>The principles <em>behind the work</em></SectionHeadline>
              </m.div>
            </m.div>

            <m.div
              className="grid grid-cols-1 md:grid-cols-3 gap-6"
              variants={staggerContainer(0.1)}
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true, margin: '-60px' }}
            >
              {VALUES.map(v => (
                <m.div key={v.title} variants={fadeUp}>
                  <TiltCard goldAccent maxTilt={5}
                    className="border border-[var(--dp-border)] p-8 h-full"
                    style={{ background: 'rgba(12,10,6,0.8)', backdropFilter: 'blur(8px)' } as React.CSSProperties}
                    data-cursor="hover"
                  >
                    <div className="w-5 h-px bg-dp-gold mb-5" aria-hidden="true" />
                    <h3 className="font-display font-light text-[22px] text-dp-text mb-4">{v.title}</h3>
                    <p className="font-sans font-light text-sm leading-[1.75] text-dp-text-muted">{v.body}</p>
                  </TiltCard>
                </m.div>
              ))}
            </m.div>
          </SectionInner>
        </Section>

        {/* Detailing Craftsmanship Timeline */}
        <Section className="bg-dp-bg border-t border-b border-dp-border relative overflow-hidden">
          {/* Laser blue glow for contrast highlight */}
          <div className="absolute top-[20%] right-[-10%] w-[350px] h-[350px] rounded-full bg-[#00D2FF]/[0.015] filter blur-[100px] pointer-events-none" />
          
          <SectionInner>
            <m.div
              variants={staggerContainer(0.08)}
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true }}
              className="mb-16 text-center"
            >
              <m.div variants={fadeUp} className="justify-center flex">
                <Eyebrow className="mb-5">Our Journey</Eyebrow>
              </m.div>
              <m.div variants={fadeUp}>
                <SectionHeadline>
                  Evolution of <em>Craftsmanship</em>
                </SectionHeadline>
              </m.div>
              <m.p variants={fadeUp} className="font-sans font-light text-base text-dp-text-muted max-w-[500px] mx-auto mt-4">
                Eight years of steady refinement, growing from a private garage setup to a state-of-the-art clean room facility.
              </m.p>
            </m.div>

            {/* Timeline Steps */}
            <div className="relative border-l border-dp-border/60 ml-4 md:ml-12 space-y-12">
              {[
                {
                  year: '2018',
                  title: 'The Private Garage',
                  desc: 'Began executing paint corrections for local enthusiasts in a single-bay private workspace. Focus was entirely on mastering dual-action leveling theory.',
                },
                {
                  year: '2020',
                  title: 'Professional Accreditation',
                  desc: 'Integrated microscopic paint thickness auditing and secured official certifications from IDA and GYEON. Shifted client list entirely to luxury collectors.',
                },
                {
                  year: '2022',
                  title: 'The Clean-Room Laboratory',
                  desc: 'Built our custom high-intensity lighting bay. Equipped with color-corrected inspection beams to expose defects invisible to the naked eye.',
                },
                {
                  year: '2025',
                  title: 'Bespoke Concours Prep',
                  desc: 'Expanded service stack to include self-healing PPF (Paint Protection Film) templates and custom-made wax mixtures for classic heritage cars.',
                },
              ].map((step, idx) => (
                <m.div
                  key={step.year}
                  className="relative pl-8 md:pl-12 group"
                  initial={{ opacity: 0, x: -20 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true, margin: '-60px' }}
                  transition={{ delay: idx * 0.1, ...springs.responsive }}
                >
                  {/* Timeline Dot Indicator */}
                  <div className="absolute left-[-5px] top-1.5 w-2.5 h-2.5 rounded-full bg-dp-bg border border-dp-text-muted group-hover:border-dp-gold group-hover:bg-dp-gold transition-colors duration-300" />
                  
                  {/* Glowing line connector effect */}
                  <div className="absolute left-[-1px] top-4 bottom-[-48px] w-px bg-gradient-to-b from-dp-gold to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none" />

                  <span className="font-sans font-normal text-xs text-dp-gold tracking-widest block mb-1">
                    {step.year}
                  </span>
                  
                  <h3 className="font-display font-light text-2xl text-dp-text mb-2 group-hover:text-dp-text-warm transition-colors duration-300">
                    {step.title}
                  </h3>
                  
                  <p className="font-sans font-light text-sm leading-relaxed text-dp-text-muted max-w-xl group-hover:text-dp-text-muted/80 transition-colors duration-300">
                    {step.desc}
                  </p>
                </m.div>
              ))}
            </div>
          </SectionInner>
        </Section>

        {/* Equipment section */}
        <Section className="bg-dp-bg">
          <SectionInner>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
              {/* Left: visual */}
              <m.div
                className="relative"
                variants={fadeLeft}
                initial="hidden"
                whileInView="visible"
                viewport={{ once: true }}
              >
                <div className="relative aspect-square max-w-[480px] mx-auto">
                  <PolishOrb size={480} className="absolute inset-0 w-full h-full" />
                  <div className="absolute inset-[15%] flex items-center justify-center">
                    <WaterDroplet className="w-[70%] h-[70%]" />
                  </div>
                </div>
              </m.div>
              {/* Right: equipment list */}
              <m.div
                variants={fadeRight}
                initial="hidden"
                whileInView="visible"
                viewport={{ once: true }}
              >
                <Eyebrow className="mb-5">What we use</Eyebrow>
                <SectionHeadline className="mb-8">
                  Professional-grade<br /><em>equipment only</em>
                </SectionHeadline>
                <div className="flex flex-col gap-0">
                  {EQUIPMENT.map((e, i) => (
                    <m.div
                      key={e.label}
                      className="flex items-baseline justify-between py-4 border-b border-[var(--dp-border)]"
                      initial={{ opacity: 0, x: 20 }}
                      whileInView={{ opacity: 1, x: 0 }}
                      viewport={{ once: true }}
                      transition={{ delay: i * 0.07, ...springs.responsive }}
                    >
                      <span className="font-sans font-normal text-xs tracking-[0.10em] uppercase text-dp-text-muted">{e.label}</span>
                      <span className="font-sans font-light text-sm text-dp-text">{e.value}</span>
                    </m.div>
                  ))}
                </div>
              </m.div>
            </div>
          </SectionInner>
        </Section>

        <ProcessSection />
        <Footer />
        <MobileStickyBar />
      </LazyMotion>
    </PageWrapper>
  )
}
