import { useState, useRef } from 'react'
import { LazyMotion, domAnimation, m, useScroll, useTransform } from 'framer-motion'
import { Link } from 'react-router-dom'
import { clsx } from 'clsx'
import { heroDelays, heroFadeUp, springs, MagneticCard } from '@/design-system'
import { PrimaryButton, GhostButton, ArrowRight } from '@/design-system'
import { scrollToElement } from '@/lib/scroll'
import { useParticleCanvas } from '@/hooks'
import {
  CarSilhouette,
  ChromeStreak,
  PolishOrb,
  FloatingSpecCard,
} from '@/components/ui/AutomotiveSVGs'
import { AtmosphericBackground } from '@/components/ui/AtmosphericBackground'
import { SplitTextReveal } from '@/components/ui/SplitTextReveal'

export function HeroSection() {
  const sectionRef = useRef<HTMLElement>(null)
  
  // Interactive Color Theme Configurator state
  const [colorTheme, setColorTheme] = useState<'amber' | 'blue' | 'champagne' | 'chrome' | 'obsidian'>('amber')
  const [mousePos, setMousePos] = useState({ x: 50, y: 50 })

  // Two particle layers
  const fineParticles   = useParticleCanvas({ count: 55, maxOpacity: 0.28, speed: 0.42 })
  const coarseParticles = useParticleCanvas({ count: 18, maxOpacity: 0.18, speed: 0.15 })

  const { scrollYProgress } = useScroll({
    target: sectionRef,
    offset: ['start start', 'end start'],
  })

  const carY           = useTransform(scrollYProgress, [0, 1], ['0%', '18%'])
  const particleY      = useTransform(scrollYProgress, [0, 1], ['0%', '10%'])
  const contentOpacity = useTransform(scrollYProgress, [0, 0.55], [1, 0])
  const contentY       = useTransform(scrollYProgress, [0, 0.55], ['0%', '-6%'])
  const statsY         = useTransform(scrollYProgress, [0, 0.4], ['0%', '8%'])

  // Tracker mouse move spotlight position
  const handleMouseMove = (e: React.MouseEvent) => {
    const rect = e.currentTarget.getBoundingClientRect()
    const x = ((e.clientX - rect.left) / rect.width) * 100
    const y = ((e.clientY - rect.top) / rect.height) * 100
    setMousePos({ x, y })
  }

  const spotlightColor = {
    amber: 'rgba(201,168,76,0.06)',
    blue: 'rgba(0,210,255,0.08)',
    champagne: 'rgba(240,224,176,0.06)',
    chrome: 'rgba(255,255,255,0.06)',
    obsidian: 'rgba(255,45,85,0.06)',
  }[colorTheme]

  return (
    <LazyMotion features={domAnimation}>
      <section
        ref={sectionRef}
        className="relative w-full h-svh min-h-[640px] overflow-hidden flex flex-col justify-center select-none"
        aria-label="Detail Pals — Precision automotive detailing"
        onMouseMove={handleMouseMove}
        data-cursor="default"
      >
        {/* Base Layer */}
        <div className="absolute inset-0 bg-dp-bg" aria-hidden="true" />

        {/* Animated showroom atmosphere */}
        <AtmosphericBackground variant="showroom" intensity={1} colorTheme={colorTheme} />

        {/* Film grain layer */}
        <div
          className="absolute inset-0 z-[3] pointer-events-none opacity-[0.025]"
          aria-hidden="true"
          style={{
            backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 512 512' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.75' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E")`,
            backgroundSize: '256px 256px',
          }}
        />

        {/* Fine particles */}
        <m.div className="absolute inset-0 z-[4] pointer-events-none" style={{ y: particleY }} aria-hidden="true">
          <canvas ref={fineParticles} className="w-full h-full" />
        </m.div>

        {/* Coarse particles */}
        <m.div className="absolute inset-0 z-[5] pointer-events-none" style={{ y: particleY }} aria-hidden="true">
          <canvas ref={coarseParticles} className="w-full h-full" />
        </m.div>

        {/* Polisher orb - circular light caustic behind car */}
        <m.div
          className="absolute z-[6] pointer-events-none"
          style={{ right: '5%', top: '28%', y: carY }}
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.5, duration: 1.5, ease: [0.16, 1, 0.3, 1] }}
          aria-hidden="true"
        >
          <m.div
            animate={{ scale: [1, 1.04, 1], opacity: [0.7, 1, 0.7] }}
            transition={{ duration: 8, repeat: Infinity, ease: 'easeInOut' }}
          >
            <PolishOrb size={420} />
          </m.div>
        </m.div>

        {/* Car silhouette */}
        <m.div
          className="absolute z-[7] pointer-events-none"
          style={{
            right: '-4%',
            bottom: '8%',
            width: 'clamp(480px, 58vw, 840px)',
            y: carY,
          }}
          initial={{ opacity: 0, x: 60 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: heroDelays.paint, duration: 1.4, ease: [0.16, 1, 0.3, 1] }}
          aria-hidden="true"
        >
          <CarSilhouette colorTheme={colorTheme} opacity={0.92} />
        </m.div>

        {/* Chrome light sweeps */}
        <m.div
          className="absolute z-[8] pointer-events-none"
          style={{ right: '0%', top: '38%', width: '50%' }}
          aria-hidden="true"
        >
          <m.div
            initial={{ opacity: 0, x: '-30%' }}
            animate={{ opacity: [0, 0.7, 0.5, 0], x: ['-30%', '130%'] }}
            transition={{
              duration: 2.8,
              repeat: Infinity,
              repeatDelay: 7,
              delay: 2,
              ease: [0.25, 0.1, 0.25, 1],
              times: [0, 0.3, 0.8, 1],
            }}
          >
            <ChromeStreak angle={-14} />
          </m.div>
        </m.div>

        {/* Scanning laser line */}
        <div className="absolute inset-0 z-[9] pointer-events-none overflow-hidden" aria-hidden="true">
          <m.div
            className="absolute top-0 bottom-0"
            style={{
              width: 2,
              background: 'linear-gradient(to bottom, transparent, rgba(201,168,76,0.7) 25%, rgba(201,168,76,0.9) 50%, rgba(201,168,76,0.7) 75%, transparent)',
              boxShadow: '0 0 16px rgba(201,168,76,0.45), 0 0 40px rgba(201,168,76,0.18)',
            }}
            animate={{
              x: ['-2vw', '102vw'],
              opacity: [0, 1, 1, 0],
            }}
            transition={{
              duration: 3.0,
              repeat: Infinity,
              repeatDelay: 5.5,
              ease: [0.16, 1, 0.3, 1],
              times: [0, 0.05, 0.9, 1],
            }}
          />
        </div>

        {/* Interactive laser spotlight following mouse */}
        <m.div
          className="absolute inset-0 z-[12] pointer-events-none opacity-30 mix-blend-screen"
          animate={{
            background: `radial-gradient(circle 350px at ${mousePos.x}% ${mousePos.y}%, ${spotlightColor} 0%, transparent 80%)`,
          }}
          transition={{ duration: 0.1 }}
          aria-hidden="true"
        />

        {/* Vignette */}
        <div
          className="absolute inset-0 z-[10] pointer-events-none"
          aria-hidden="true"
          style={{ background: 'radial-gradient(ellipse 100% 90% at 50% 50%, transparent 35%, rgba(7,7,7,0.72) 100%)' }}
        />

        {/* Bottom fade */}
        <div
          className="absolute bottom-0 left-0 right-0 h-[40%] z-[11] pointer-events-none"
          aria-hidden="true"
          style={{ background: 'linear-gradient(to bottom, transparent, var(--dp-bg))' }}
        />

        {/* Text Content */}
        <m.div
          className="relative z-[20] w-full max-w-[var(--dp-max-w)] mx-auto px-[var(--dp-pad-x)] pt-[var(--dp-nav-h)] flex flex-col"
          style={{ opacity: contentOpacity, y: contentY }}
        >
          {/* Eyebrow */}
          <m.p
            className="flex items-center gap-3 font-sans font-normal text-xs tracking-[0.22em] uppercase text-dp-gold mb-6"
            initial="hidden" animate="visible"
            variants={heroFadeUp(heroDelays.eyebrow)}
          >
            <span className="block w-8 h-px bg-dp-gold flex-shrink-0" style={{ boxShadow: '0 0 6px rgba(201,168,76,0.5)' }} aria-hidden="true" />
            Precision automotive detailing
          </m.p>

          {/* Headline */}
          <div className="mb-2">
            <SplitTextReveal
              text="Your car deserves"
              as="h1"
              onMount
              delay={heroDelays.line1}
              stagger={0.055}
              className="font-sans font-light text-hero leading-tight tracking-[-0.025em] text-dp-text block"
            />
          </div>
          <div className="mb-6 pl-[clamp(12px,2vw,32px)]">
            <SplitTextReveal
              text="obsessive care."
              as="h1"
              onMount
              delay={heroDelays.line2}
              stagger={0.065}
              className="font-display italic font-light leading-tight tracking-[-0.01em] text-dp-text-warm block"
              style={{ fontSize: 'calc(var(--dp-text-hero) * 1.05)', textShadow: '0 0 40px rgba(201,168,76,0.25)' } as React.CSSProperties}
            />
          </div>

          {/* Subtext */}
          <m.p
            className="font-sans font-light text-[clamp(15px,1.5vw,18px)] leading-[1.72] text-[rgba(240,237,230,0.52)] max-w-[440px] mb-8"
            initial="hidden" animate="visible"
            variants={heroFadeUp(heroDelays.sub)}
          >
            Hand-applied precision detailing for vehicles that deserve nothing less than perfection. Every pass. Every time.
          </m.p>

          {/* Interactive Color Switcher */}
          <m.div
            className="mb-8 flex flex-col gap-2.5"
            initial="hidden" animate="visible"
            variants={heroFadeUp(heroDelays.sub + 0.15)}
          >
            <span className="font-sans font-normal text-[9px] tracking-widest uppercase text-dp-text-muted">
              Select Showroom Theme
            </span>
            <div className="flex items-center gap-3">
              {[
                { id: 'amber',     label: 'Amber Glow',      color: 'bg-[#C9A84C]', glow: 'shadow-[#C9A84C]/50' },
                { id: 'blue',      label: 'Laser Blue',      color: 'bg-[#00D2FF]', glow: 'shadow-[#00D2FF]/50' },
                { id: 'champagne', label: 'Champagne Mist',  color: 'bg-[#F0E0B0]', glow: 'shadow-[#F0E0B0]/50' },
                { id: 'chrome',    label: 'Chrome Silver',   color: 'bg-[#FFFFFF]', glow: 'shadow-[#FFFFFF]/50' },
                { id: 'obsidian',  label: 'Obsidian Crimson', color: 'bg-[#FF2D55]', glow: 'shadow-[#FF2D55]/50' },
              ].map(theme => (
                <button
                  key={theme.id}
                  onClick={() => setColorTheme(theme.id as any)}
                  className={clsx(
                    'w-6 h-6 rounded-full border transition-all duration-300 flex items-center justify-center bg-transparent cursor-pointer',
                    colorTheme === theme.id ? 'border-dp-text scale-110 shadow' : 'border-dp-border hover:border-dp-text-muted'
                  )}
                  title={theme.label}
                  data-cursor="hover"
                >
                  <span className={clsx('w-3.5 h-3.5 rounded-full block', theme.color, colorTheme === theme.id && `shadow-sm ${theme.glow}`)} />
                </button>
              ))}
            </div>
          </m.div>

          {/* CTAs */}
          <m.div
            className="flex items-center gap-5 flex-wrap"
            initial="hidden" animate="visible"
            variants={heroFadeUp(heroDelays.ctas)}
          >
            <PrimaryButton
              as="button"
              onClick={() => {
                scrollToElement('#quote')
              }}
              data-cursor="cta"
            >
              Configure your detail
              <ArrowRight />
            </PrimaryButton>
            <GhostButton
              as="button"
              onClick={() => {
                scrollToElement('#gallery')
              }}
              data-cursor="hover"
            >
              See our work
              <m.span className="inline-flex" animate={{ y: [0, 3, 0] }} transition={{ duration: 2, repeat: Infinity }} aria-hidden="true">↓</m.span>
            </GhostButton>
          </m.div>
        </m.div>

        {/* Floating Spec Cards */}
        <m.div
          className="absolute right-[var(--dp-pad-x)] z-[20] hidden xl:flex flex-col gap-3 top-1/2 -translate-y-1/2"
          style={{ y: statsY }}
          aria-label="Key statistics"
        >
          <FloatingSpecCard label="Vehicles transformed" value="200+"   delay={heroDelays.stats}        />
          <FloatingSpecCard label="Average client rating" value="4.9"   unit="★" delay={heroDelays.stats + 0.15} />
          <FloatingSpecCard label="Years of craft"        value="8"     unit="yr" delay={heroDelays.stats + 0.3}  />
        </m.div>

        {/* Scroll indicator */}
        <m.button
          className="absolute bottom-10 left-1/2 -translate-x-1/2 z-[20] flex flex-col items-center gap-2 cursor-pointer bg-transparent border-none p-2"
          initial={{ opacity: 0 }} animate={{ opacity: 1 }}
          transition={{ delay: heroDelays.scroll, duration: 0.6 }}
          onClick={() => {
            scrollToElement('#services')
          }}
          aria-label="Scroll to explore"
          data-cursor="hover"
        >
          <m.div
            style={{
              width: 1,
              height: 44,
              background: 'linear-gradient(to bottom, var(--dp-gold), transparent)',
              boxShadow: '0 0 8px rgba(201,168,76,0.45)',
            }}
            animate={{ opacity: [0.3, 1, 0.3], scaleY: [0.7, 1, 0.7] }}
            transition={{ duration: 2.2, repeat: Infinity, ease: 'easeInOut' }}
          />
          <span className="font-sans font-normal text-[9px] tracking-[0.22em] uppercase text-dp-gold opacity-70">Scroll</span>
        </m.button>

      </section>
    </LazyMotion>
  )
}
