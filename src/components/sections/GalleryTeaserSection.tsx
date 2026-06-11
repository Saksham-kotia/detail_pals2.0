import { useState, useRef, useCallback } from 'react'
import { m, LazyMotion, domAnimation } from 'framer-motion'
import { clsx } from 'clsx'
import { Link } from 'react-router-dom'
import { AtmosphericBackground } from '@/components/ui/AtmosphericBackground'
import {
  Section,
  SectionInner,
  Eyebrow,
  SectionHeadline,
  PrimaryButton,
  GhostButton,
  ArrowRight,
  springs,
  fadeUp,
  staggerContainer
} from '@/design-system'

export function GalleryTeaserSection() {
  const [sliderPos, setSliderPos] = useState(45)
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
      <Section id="work-teaser" className="bg-dp-surface relative overflow-hidden">
        {/* Slow ambient showroom fog background */}
        <AtmosphericBackground variant="dark-fog" intensity={0.5} />

        {/* Spot ambient blue light on the left corner to add the color upgrade contrast */}
        <div className="absolute top-[-20%] left-[-10%] w-[50%] h-[80%] rounded-full bg-[#00D2FF]/[0.02] filter blur-[120px] pointer-events-none" />
        
        <SectionInner>
          <div className="grid grid-cols-1 lg:grid-cols-5 gap-12 items-center">
            
            {/* Editorial Content (Left 2 columns) */}
            <m.div
              className="lg:col-span-2 space-y-6"
              variants={staggerContainer(0.08)}
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true }}
            >
              <m.div variants={fadeUp}>
                <Eyebrow>Visual Evidence</Eyebrow>
              </m.div>
              <m.div variants={fadeUp}>
                <SectionHeadline>
                  The Art of the <em>Reveal</em>
                </SectionHeadline>
              </m.div>
              <m.p variants={fadeUp} className="font-sans font-light text-base leading-relaxed text-dp-text-muted">
                Drag the interactive inspection lens over the Porsche 911 chassis to reveal the difference between oxidized clear coat and our multi-stage corrected 9H ceramic coating.
              </m.p>
              <m.div variants={fadeUp} className="flex flex-col sm:flex-row items-start sm:items-center gap-5 pt-2">
                <PrimaryButton to="/gallery" data-cursor="cta">
                  Explore full gallery
                  <ArrowRight />
                </PrimaryButton>
                <GhostButton to="/services" data-cursor="hover">
                  View paint services
                </GhostButton>
              </m.div>
            </m.div>

            {/* Slider Teaser Card (Right 3 columns) */}
            <m.div
              className="lg:col-span-3"
              initial={{ opacity: 0, scale: 0.98, y: 30 }}
              whileInView={{ opacity: 1, scale: 1, y: 0 }}
              viewport={{ once: true }}
              transition={springs.responsive}
            >
              <div className="relative border border-dp-border hover:border-dp-gold transition-colors duration-500 bg-dp-bg">
                <div
                  ref={containerRef}
                  className={clsx(
                    'relative aspect-[16/10] overflow-hidden bg-[#0a0a0a] select-none',
                    isDragging ? 'cursor-ew-resize' : 'cursor-col-resize',
                  )}
                  onPointerDown={onPointerDown}
                  onPointerMove={onPointerMove}
                  onPointerUp={onPointerUp}
                  role="img"
                  data-cursor="drag"
                  aria-label="Porsche 911 Before and After Paint Correction Teaser"
                >
                  {/* Before state: Dull, muddy, dusty + circular scratches */}
                  <div className="absolute inset-0 w-full h-full">
                    <div 
                      className="w-full h-full bg-cover bg-center select-none"
                      style={{ 
                        backgroundImage: 'url(/porsche_polished.png)',
                        filter: 'grayscale(20%) brightness(44%) contrast(80%) sepia(26%) blur(0.5px)'
                      }}
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
                        const cx = 350 + (set * 40)
                        const cy = 200 - (set * 20)
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
                    
                    {/* Watermark before */}
                    <span className="absolute bottom-4 left-4 font-sans font-normal text-[8px] tracking-[0.2em] uppercase text-dp-text-muted bg-dp-bg/80 px-2 py-0.5 pointer-events-none">
                      STAGE-1 OXIDIZED CHASSIS
                    </span>
                  </div>

                  {/* After state: Fully polished, glossy, colorful (revealed by clipPath) */}
                  <div
                    className="absolute inset-0 w-full h-full overflow-hidden"
                    style={{ clipPath: `inset(0 0 0 ${sliderPos}%)` }}
                  >
                    <div 
                      className="w-full h-full bg-cover bg-center select-none"
                      style={{ backgroundImage: 'url(/porsche_polished.png)' }}
                    />
                    
                    {/* Bright flare sparks overlay */}
                    <div className="absolute inset-0 pointer-events-none" style={{
                      background: 'radial-gradient(circle 120px at 70% 30%, rgba(201,168,76,0.18) 0%, transparent 80%)'
                    }} />

                    {/* Watermark after */}
                    <span className="absolute bottom-4 left-4 font-sans font-normal text-[8px] tracking-[0.2em] uppercase text-dp-gold bg-dp-gold/15 border border-dp-gold/30 px-2 py-0.5 pointer-events-none">
                      STAGE-3 CERAMIC SHIELD
                    </span>
                  </div>

                  {/* Side-by-side state labels */}
                  <span className="absolute top-4 left-4 font-sans font-normal text-[9px] tracking-widest uppercase text-dp-text-muted bg-dp-bg/85 px-2.5 py-1 pointer-events-none">
                    BEFORE
                  </span>
                  <span className="absolute top-4 right-4 font-sans font-normal text-[9px] tracking-widest uppercase text-dp-gold bg-dp-gold/20 border border-dp-gold/30 px-2.5 py-1 pointer-events-none">
                    AFTER
                  </span>

                  {/* Interactive Slider Bar */}
                  <div
                    className="absolute top-0 bottom-0 w-px bg-dp-gold z-10 pointer-events-none"
                    style={{ left: `${sliderPos}%` }}
                  >
                    <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-8 h-8 rounded-full bg-dp-surface-2 border border-dp-gold flex items-center justify-center shadow-gold-sm">
                      <svg viewBox="0 0 16 16" className="w-3.5 h-3.5 fill-none stroke-dp-gold" strokeWidth="1.5">
                        <path d="M5 8L2 5M2 5L5 2M2 5H8M11 8L14 5M14 5L11 2M14 5H8" strokeLinecap="round" strokeLinejoin="round"/>
                      </svg>
                    </div>
                  </div>
                </div>

                {/* Card footer detail */}
                <div className="flex items-center justify-between px-6 py-4 bg-dp-surface-2 border-t border-dp-border">
                  <div className="flex items-center gap-3">
                    <span className="font-sans font-normal text-[9px] tracking-wider uppercase text-dp-gold border border-dp-border-gold px-2 py-0.5">
                      Case Study Teaser
                    </span>
                    <span className="font-sans font-light text-xs text-dp-text">Porsche 911 Carrera</span>
                  </div>
                  <span className="font-sans font-light text-[10px] text-dp-text-muted">
                    18 hrs investment
                  </span>
                </div>

              </div>
            </m.div>

          </div>
        </SectionInner>
      </Section>
    </LazyMotion>
  )
}
