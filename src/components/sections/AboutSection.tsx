import { useState, useRef, useCallback } from 'react'
import { AtmosphericBackground } from '@/components/ui/AtmosphericBackground'
import { SplitTextReveal }       from '@/components/ui/SplitTextReveal'
import { InfiniteMarquee }       from '@/components/ui/InfiniteMarquee'
import {
  Eyebrow, staggerContainer, fadeUp, springs,
  Section, SectionInner, SectionHeadline,
} from '@/design-system'
import { m, LazyMotion, domAnimation } from 'framer-motion'
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

export function AboutSection() {
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
    <LazyMotion features={domAnimation}>
      {/* Container wrapper for scrolling target */}
      <div id="about" className="relative bg-dp-bg border-t border-dp-border">
        
        {/* Story Section */}
        <section className="relative min-h-[55vh] flex items-center pt-24 pb-20 px-[var(--dp-pad-x)] overflow-hidden">
          <AtmosphericBackground variant="showroom" intensity={0.9} />

          {/* Before/after slider on the right side of story */}
          <div className="absolute right-[var(--dp-pad-x)] top-[18%] bottom-[12%] w-[42%] hidden lg:flex items-center justify-center z-20">
            <div className="relative w-full aspect-[16/11] border border-dp-border hover:border-dp-violet transition-[colors,box-shadow] duration-500 bg-[#0a0a0a] shadow-gold-sm hover:shadow-violet-md">
              <div
                ref={containerRef}
                className="w-full h-full relative overflow-hidden cursor-col-resize select-none"
                onPointerDown={onPointerDown}
                onPointerMove={onPointerMove}
                onPointerUp={onPointerUp}
                role="img"
                aria-label="Interactive Car Polish Before After Teaser"
              >
                {/* 1. After state (bottom layer, clean and polished) */}
                <div className="absolute inset-0 w-full h-full overflow-hidden">
                  <img
                    src="/audi_polished.png"
                    alt="After detail"
                    className="w-full h-full object-cover pointer-events-none select-none"
                  />
                  <div className="absolute inset-0 bg-radial-gradient from-transparent to-dp-surface-deep opacity-30" />
                  <div className="absolute inset-0 pointer-events-none" style={{
                    background: 'radial-gradient(circle 120px at 50% 50%, rgba(124, 58, 237, 0.15) 0%, rgba(201, 168, 76, 0.10) 60%, transparent 100%)'
                  }} />
                  <span className="absolute bottom-3 right-3 font-sans font-normal text-[8px] tracking-widest text-dp-yellow bg-dp-yellow/15 border border-dp-yellow/30 px-2 py-0.5 pointer-events-none">
                    STAGE-3 COATED SHIELD
                  </span>
                </div>

                {/* 2. Before state (top layer, dirty, clipped from the right to reveal clean underneath) */}
                <div
                  className="absolute inset-0 w-full h-full overflow-hidden"
                  style={{ clipPath: `inset(0 ${100 - sliderPos}% 0 0)` }}
                >
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
                    <path
                      d="M-20 350 Q 80 320 140 370 T 320 380 T 480 360 T 660 380 L 660 420 L -20 420 Z"
                      fill="rgba(90, 70, 50, 0.55)"
                      filter="blur(1px)"
                    />
                    <path
                      d="M-10 370 Q 60 340 120 380 T 260 390 T 420 375 T 650 390 L 650 420 L -10 420 Z"
                      fill="rgba(70, 50, 35, 0.7)"
                    />
                    {[
                      [80, 320, 4], [110, 340, 2.5], [150, 310, 3], [240, 335, 5],
                      [310, 320, 2], [380, 340, 6], [420, 320, 3.5], [490, 330, 4.5],
                      [520, 300, 3], [580, 330, 5.5], [25, 290, 4], [610, 280, 5]
                    ].map(([cx, cy, r], i) => (
                      <circle key={`mud-${i}`} cx={cx} cy={cy} r={r} fill="rgba(85, 65, 45, 0.65)" />
                    ))}

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
                  <span className="absolute bottom-3 left-3 font-sans font-normal text-[8px] tracking-widest text-dp-text bg-dp-bg/70 px-2 py-0.5 pointer-events-none">
                    STAGE-1 SURFACE DEGRADATION
                  </span>
                </div>

                {/* Slider divider line */}
                <div
                  className="absolute top-0 bottom-0 w-px bg-dp-violet z-10 pointer-events-none"
                  style={{ left: `${sliderPos}%` }}
                >
                  <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-6 h-6 rounded-full bg-dp-surface-2 border border-dp-violet flex items-center justify-center shadow-violet-sm">
                    <svg viewBox="0 0 16 16" className="w-2.5 h-2.5 fill-none stroke-dp-violet-light" strokeWidth="1.5">
                      <path d="M5 8L2 5M2 5L5 2M2 5H8M11 8L14 5M14 5L11 2M14 5H8" strokeLinecap="round" strokeLinejoin="round"/>
                    </svg>
                  </div>
                </div>

                {/* Labels */}
                <span className="absolute top-3 left-3 font-sans text-[8px] tracking-widest uppercase text-dp-text-muted bg-dp-bg/80 px-2 py-0.5 pointer-events-none">Before</span>
                <span className="absolute top-3 right-3 font-sans text-[8px] tracking-widest uppercase text-dp-yellow bg-dp-yellow/15 border border-dp-yellow/30 px-2 py-0.5 pointer-events-none">After</span>

              </div>
            </div>
          </div>

          <div className="absolute right-0 top-0 bottom-0 w-[45%]" style={{
            background: 'linear-gradient(to right, var(--dp-bg) 20%, transparent 60%)',
          }} aria-hidden="true" />

          <div className="relative z-10 max-w-[var(--dp-max-w)] mx-auto w-full">
            <m.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={springs.responsive}>
              <Eyebrow className="mb-6 text-dp-violet-light">The story</Eyebrow>
            </m.div>
            <SplitTextReveal text="Eight years of craft." as="h2" onMount={false} delay={0.1}
              className="font-display font-light text-section text-dp-text block mb-2" />
            <SplitTextReveal text="Not volume." as="h2" onMount={false} delay={0.25}
              className="font-display italic font-light text-section text-dp-text-warm block mb-8" />
            <m.p initial={{ opacity: 0 }} whileInView={{ opacity: 1 }} viewport={{ once: true }} transition={{ delay: 0.4 }}
              className="font-sans font-light text-base text-dp-text-muted max-w-[520px] leading-[1.78]">
              Detail Pals was built on a single conviction: that a vehicle's paint is worth protecting
              with the same attention a watchmaker gives to a movement. We chose craft over scale,
              and have never regretted it.
            </m.p>
          </div>
        </section>

        <InfiniteMarquee items={CERTS} speed="slow" direction="left" highlightEvery={2} />

        {/* Values Section */}
        <Section className="bg-dp-surface">
          <SectionInner>
            <m.div
              variants={staggerContainer(0.08)}
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true, margin: '-80px' }}
              className="mb-16"
            >
              <m.div variants={fadeUp}><Eyebrow className="mb-5 text-dp-violet-light">What we believe</Eyebrow></m.div>
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
                    className="border border-[var(--dp-border)] p-8 h-full bg-dp-bg/80 backdrop-blur-sm"
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

        {/* Equipment Section */}
        <Section className="bg-dp-bg">
          <SectionInner>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
              
              {/* Left Column: Visual Spec Deck */}
              <m.div
                className="relative"
                initial={{ opacity: 0, x: -30 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={springs.responsive}
              >
                <VisualSpecDeck />
              </m.div>
              
              {/* Right Column: Equipment specs list */}
              <m.div
                initial={{ opacity: 0, x: 30 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={springs.responsive}
              >
                <Eyebrow className="mb-5 text-dp-violet-light">What we use</Eyebrow>
                <SectionHeadline className="mb-8">
                  Professional-grade<br /><em>equipment only</em>
                </SectionHeadline>
                
                <div className="flex flex-col gap-0 border-t border-dp-border/60">
                  {EQUIPMENT.map((e, i) => (
                    <m.div
                      key={e.label}
                      className="group relative flex items-baseline justify-between py-4 px-4 border-b border-dp-border/60 hover:border-dp-violet/60 transition-all duration-300 cursor-pointer overflow-hidden"
                      initial={{ opacity: 0, x: 20 }}
                      whileInView={{ opacity: 1, x: 0 }}
                      viewport={{ once: true }}
                      transition={{ delay: i * 0.07, ...springs.responsive }}
                      data-cursor="hover"
                    >
                      {/* Violet/Gold glowing background sweep */}
                      <div className="absolute inset-0 bg-gradient-to-r from-dp-violet/10 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none" />
                      <div className="absolute left-0 top-0 bottom-0 w-[2px] bg-dp-yellow scale-y-0 group-hover:scale-y-100 transition-transform duration-300 origin-center pointer-events-none" />

                      <span className="font-sans font-normal text-xs tracking-[0.10em] uppercase text-dp-text-muted group-hover:text-dp-yellow-light transition-colors duration-300 relative z-10">
                        {e.label}
                      </span>
                      <span className="font-sans font-light text-sm text-dp-text group-hover:text-white transition-colors duration-300 relative z-10">
                        {e.value}
                      </span>
                    </m.div>
                  ))}
                </div>
              </m.div>

            </div>
          </SectionInner>
        </Section>

      </div>
    </LazyMotion>
  )
}

// ─── Visual Spec Deck component ──────────────────────────────

function VisualSpecDeck() {
  return (
    <div className="relative w-full aspect-square max-w-[420px] mx-auto min-h-[390px] flex items-center justify-center select-none">
      
      {/* Decorative center ambient spotlight and grid */}
      <div 
        className="absolute inset-[10%] rounded-full opacity-20 blur-[60px] pointer-events-none" 
        style={{ background: 'radial-gradient(circle, var(--dp-violet) 0%, var(--dp-yellow) 100%)' }}
      />
      <div className="absolute inset-0 opacity-[0.03] rounded-full pointer-events-none" style={{
        backgroundImage: 'radial-gradient(circle, var(--dp-violet) 1px, transparent 1px)',
        backgroundSize: '20px 20px'
      }} />

      {/* Card 1: Paint Profiler (Violet Theme) */}
      <m.div
        className="absolute w-[230px] p-4 border border-dp-violet/40 bg-dp-surface/95 backdrop-blur-md shadow-violet-sm z-30"
        style={{ left: '2%', top: '2%' }}
        animate={{ y: [0, -6, 0], rotate: [-3, -4, -3] }}
        transition={{ duration: 4, repeat: Infinity, ease: 'easeInOut' }}
        whileHover={{ scale: 1.05, zIndex: 40, borderColor: 'var(--dp-violet-light)', boxShadow: 'var(--dp-violet-glow-md)' }}
      >
        <div className="flex justify-between items-baseline mb-2">
          <span className="font-sans text-[8px] tracking-[0.15em] text-dp-violet-light font-normal uppercase">SYSTEM PROFILE</span>
          <span className="w-1.5 h-1.5 rounded-full bg-dp-violet animate-pulse" />
        </div>
        <h4 className="font-sans text-[11px] font-normal text-dp-text">Paint-Thickness Gauge</h4>
        
        <div className="my-3 flex items-baseline gap-1">
          <span className="font-display font-light text-2xl text-dp-text">124</span>
          <span className="font-sans text-[10px] text-dp-violet-light font-light uppercase">μm (Nominal)</span>
        </div>

        {/* Visual Graph Line */}
        <div className="h-7 w-full bg-dp-bg/60 border border-dp-border/40 p-1 flex items-end justify-between gap-[2px]">
          {[18, 12, 15, 22, 19, 14, 16, 20, 15, 17, 13, 19, 23, 16, 12].map((h, i) => (
            <div
              key={i}
              className="bg-dp-violet-light/70 w-full transition-all duration-300"
              style={{ height: `${h * 4}%` }}
            />
          ))}
        </div>
        <div className="mt-2 flex justify-between text-[7px] text-dp-text-subtle font-sans tracking-wide">
          <span>BASE METAL</span>
          <span>CLEARCOAT PROFILE</span>
        </div>
      </m.div>

      {/* Card 2: Rotary Polisher Telemetry (Gold Theme) */}
      <m.div
        className="absolute w-[220px] p-4 border border-dp-gold/40 bg-dp-surface/95 backdrop-blur-md shadow-gold-sm z-20"
        style={{ right: '2%', top: '22%' }}
        animate={{ y: [0, -8, 0], rotate: [2, 3, 2] }}
        transition={{ duration: 4.5, repeat: Infinity, ease: 'easeInOut', delay: 0.5 }}
        whileHover={{ scale: 1.05, zIndex: 40, borderColor: 'var(--dp-gold-light)' }}
      >
        <div className="flex justify-between items-baseline mb-2">
          <span className="font-sans text-[8px] tracking-[0.15em] text-dp-gold-light font-normal uppercase">ACTUATOR TELEMETRY</span>
          <span className="w-1.5 h-1.5 rounded-full bg-dp-gold" />
        </div>
        <h4 className="font-sans text-[11px] font-normal text-dp-text">Rupes LHR21 Orbit</h4>
        
        <div className="my-3 flex items-baseline gap-1">
          <span className="font-display font-light text-2xl text-dp-text">4,500</span>
          <span className="font-sans text-[10px] text-dp-gold-light font-light uppercase">RPM (Target)</span>
        </div>
        
        <div className="flex justify-between border-t border-dp-border/40 pt-2 text-[8px] text-dp-text-muted font-sans">
          <span>ORBITAL TRAVEL</span>
          <span className="text-dp-gold font-normal">21mm DUO</span>
        </div>
      </m.div>

      {/* Card 3: Ceramic SiO2 Matrix (Yellow Theme) */}
      <m.div
        className="absolute w-[230px] p-4 border border-dp-yellow/40 bg-dp-surface/95 backdrop-blur-md shadow-yellow-md z-10"
        style={{ left: '8%', bottom: '2%' }}
        animate={{ y: [0, -5, 0], rotate: [-1, 1, -1] }}
        transition={{ duration: 3.8, repeat: Infinity, ease: 'easeInOut', delay: 1.0 }}
        whileHover={{ scale: 1.05, zIndex: 40, borderColor: 'var(--dp-yellow-light)', boxShadow: 'var(--dp-yellow-glow-md)' }}
      >
        <div className="flex justify-between items-baseline mb-2">
          <span className="font-sans text-[8px] tracking-[0.15em] text-dp-yellow-light font-normal uppercase">CHEMISTRY SHIELD</span>
          <span className="w-1.5 h-1.5 rounded-full bg-dp-yellow animate-ping" />
        </div>
        <h4 className="font-sans text-[11px] font-normal text-dp-text">Gtechniq Crystal Serum</h4>
        
        <div className="my-3 flex items-baseline gap-1">
          <span className="font-display font-light text-2xl text-dp-text">9H</span>
          <span className="font-sans text-[10px] text-dp-yellow-light font-light uppercase">Hardness Scale</span>
        </div>
        
        <div className="flex justify-between border-t border-dp-border/40 pt-2 text-[8px] text-dp-text-muted font-sans">
          <span>SiO2 MATRIX CONCENTRATION</span>
          <span className="text-dp-yellow font-normal">92% DENSITY</span>
        </div>
      </m.div>

    </div>
  )
}
