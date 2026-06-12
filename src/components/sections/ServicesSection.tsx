import { useState, useCallback } from 'react'
import { m, LazyMotion, domAnimation, AnimatePresence } from 'framer-motion'
import { clsx } from 'clsx'
import { Link } from 'react-router-dom'
import {
  staggerContainer, fadeUp, springs,
  Section, SectionInner, Eyebrow, SectionHeadline,
  PrimaryButton, ArrowRight
} from '@/design-system'
import { TiltCard } from '@/components/ui/TiltCard'
import { SERVICES, ADD_ONS } from '@/data'
import type { ServiceTier } from '@/types'
import {
  WaterDroplet, PaintClose, CeramicCoatingVisual,
  WheelDetail, ChromeStreak, PolishOrb, CarSilhouette
} from '@/components/ui/AutomotiveSVGs'

interface ServicesSectionProps {
  onSelectTier?: (tier: ServiceTier) => void
}

export function ServicesSection({ onSelectTier }: ServicesSectionProps) {
  const [selectedAddOns, setSelectedAddOns] = useState<Set<string>>(new Set())
  const [addOnsOpen, setAddOnsOpen] = useState(true)

  const toggleAddOn = useCallback((id: string) => {
    setSelectedAddOns(prev => {
      const next = new Set(prev)
      next.has(id) ? next.delete(id) : next.add(id)
      return next
    })
  }, [])

  const addOnTotal = ADD_ONS
    .filter(a => selectedAddOns.has(a.id))
    .reduce((sum, a) => sum + a.price, 0)

  return (
    <LazyMotion features={domAnimation}>
      <Section id="services" className="bg-dp-bg relative overflow-hidden">
        {/* Neon studio lights color layers */}
        <div className="absolute top-[10%] left-[-15%] w-[45%] h-[50%] rounded-full bg-[#00D2FF]/[0.018] filter blur-[120px] pointer-events-none" />
        <div className="absolute bottom-[10%] right-[-15%] w-[45%] h-[50%] rounded-full bg-[#FF2D55]/[0.015] filter blur-[120px] pointer-events-none" />
        <div className="absolute top-[40%] right-[10%] w-[30%] h-[40%] rounded-full bg-[#C9A84C]/[0.015] filter blur-[100px] pointer-events-none" />

        <SectionInner className="relative z-10">

          {/* Section Header */}
          <m.div
            className="mb-16 text-center"
            variants={staggerContainer(0.08)}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: '-100px' }}
          >
            <m.div variants={fadeUp} className="justify-center flex">
              <Eyebrow className="mb-5">Our Services</Eyebrow>
            </m.div>
            <m.div variants={fadeUp}>
              <SectionHeadline className="mx-auto max-w-[620px]">
                Detailing Packages, <em>Perfected</em>
              </SectionHeadline>
            </m.div>
            <m.p variants={fadeUp} className="font-sans font-light text-base leading-[1.78] text-dp-text-muted max-w-[540px] mx-auto mt-5">
              Six signature packages — from a quick refresh to a full concours-level
              transformation. Prices shown for sedans; final pricing adjusts to your vehicle.
            </m.p>
          </m.div>

          {/* Services Grid */}
          <m.div
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
            variants={staggerContainer(0.08)}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: '-60px' }}
          >
            {SERVICES.map((service, index) => (
              <m.div key={service.id} variants={fadeUp} className="h-full">
                <ServiceGridCard
                  service={service}
                  index={index}
                  onSelect={() => onSelectTier?.(service.id)}
                />
              </m.div>
            ))}
          </m.div>

          {/* Add-ons Section */}
          <m.div
            className="mt-16 border-t border-dp-border pt-12"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ ...springs.responsive, delay: 0.1 }}
          >
            <button
              onClick={() => setAddOnsOpen(v => !v)}
              className="w-full flex items-center justify-between font-sans font-normal text-sm tracking-[0.08em] uppercase text-dp-text-muted hover:text-dp-text transition-colors duration-300 bg-transparent border-none cursor-pointer py-2 text-left"
              data-cursor="hover"
            >
              <span className="flex items-center gap-3">
                <span className="block w-4 h-px bg-dp-gold" aria-hidden="true" />
                Enhance your detail — optional add-ons
              </span>
              <m.span animate={{ rotate: addOnsOpen ? 45 : 0 }} transition={springs.snappy} className="text-dp-gold text-xl leading-none" aria-hidden="true">+</m.span>
            </button>

            <AnimatePresence>
              {addOnsOpen && (
                <m.div
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: 'auto', opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  transition={springs.responsive}
                  className="overflow-hidden"
                >
                  <div className="pt-8 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                    {ADD_ONS.map(addOn => (
                      <AddOnCard
                        key={addOn.id}
                        addOn={addOn}
                        selected={selectedAddOns.has(addOn.id)}
                        onToggle={() => toggleAddOn(addOn.id)}
                      />
                    ))}
                  </div>
                  {selectedAddOns.size > 0 && (
                    <m.div
                      initial={{ opacity: 0, y: 8 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="mt-6 flex items-center justify-between border-t border-dp-border pt-5"
                    >
                      <span className="font-sans font-light text-sm text-dp-text-muted">
                        {selectedAddOns.size} add-on{selectedAddOns.size > 1 ? 's' : ''} selected
                      </span>
                      <span className="font-sans font-normal text-lg text-dp-gold">+${addOnTotal} added</span>
                    </m.div>
                  )}
                </m.div>
              )}
            </AnimatePresence>
          </m.div>

        </SectionInner>
      </Section>
    </LazyMotion>
  )
}

const getServiceColor = (id: string) => {
  if (id === 'basic_wash' || id === 'interior_deep') return {
    border: 'group-hover:border-dp-gold/40',
    borderActive: 'border-dp-gold',
    text: 'group-hover:text-dp-gold-light',
    textActive: 'text-dp-gold',
    bg: 'bg-dp-gold/10',
    glow: 'shadow-gold-sm',
    accentColor: 'var(--dp-gold)',
    laser: 'linear-gradient(to bottom, transparent, var(--dp-gold) 30%, #ffffff 50%, var(--dp-gold) 70%, transparent)',
    laserBoxShadow: '0 0 10px var(--dp-gold), 0 0 4px rgba(255,255,255,0.8)',
    spotlight: 'radial-gradient(ellipse 60% 50% at 50% 50%, rgba(201,168,76,0.03) 0%, transparent 80%)'
  }
  if (id === 'exterior_polish' || id === 'full_detail') return {
    border: 'group-hover:border-dp-violet/40',
    borderActive: 'border-dp-violet',
    text: 'group-hover:text-dp-violet-light',
    textActive: 'text-dp-violet',
    bg: 'bg-dp-violet/10',
    glow: 'shadow-violet-sm',
    accentColor: 'var(--dp-violet)',
    laser: 'linear-gradient(to bottom, transparent, var(--dp-violet) 30%, #ffffff 50%, var(--dp-violet) 70%, transparent)',
    laserBoxShadow: '0 0 10px var(--dp-violet), 0 0 4px rgba(255,255,255,0.8)',
    spotlight: 'radial-gradient(ellipse 60% 50% at 50% 50%, rgba(124,58,237,0.03) 0%, transparent 80%)'
  }
  return { // ceramic_coating and paint_correction
    border: 'group-hover:border-dp-yellow/40',
    borderActive: 'border-dp-yellow',
    text: 'group-hover:text-dp-yellow-light',
    textActive: 'text-dp-yellow',
    bg: 'bg-dp-yellow/10',
    glow: 'shadow-yellow-sm',
    accentColor: 'var(--dp-yellow)',
    laser: 'linear-gradient(to bottom, transparent, var(--dp-yellow) 30%, #ffffff 50%, var(--dp-yellow) 70%, transparent)',
    laserBoxShadow: '0 0 10px var(--dp-yellow), 0 0 4px rgba(255,255,255,0.8)',
    spotlight: 'radial-gradient(ellipse 60% 50% at 50% 50%, rgba(251,191,36,0.02) 0%, transparent 80%)'
  }
}

// ─── Service grid card component ─────────────────────────────

interface ServiceGridCardProps {
  service: typeof SERVICES[number]
  index:   number
  onSelect: () => void
}

function ServiceGridCard({ service, index, onSelect }: ServiceGridCardProps) {
  const [hovered, setHovered] = useState(false)
  const colors = getServiceColor(service.id)

  return (
    <TiltCard
      goldAccent={service.id === 'basic_wash' || service.id === 'interior_deep'}
      maxTilt={6}
      glareIntensity={0.16}
      onClick={onSelect}
      className={clsx(
        'group relative border border-dp-border flex flex-col h-full bg-dp-surface/50 backdrop-blur-md transition-all duration-500',
        hovered ? `${colors.border} ${colors.glow}` : ''
      )}
      onHoverStart={() => setHovered(true)}
      onHoverEnd={() => setHovered(false)}
      data-cursor="hover"
    >
      {/* Visual Header */}
      <div className="relative h-36 overflow-hidden bg-dp-surface-deep border-b border-dp-border" aria-hidden="true">
        <TierGridVisualPanel id={service.id} hovered={hovered} />
        {/* Cinematic gradient overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-dp-surface via-transparent to-transparent opacity-80" />
      </div>

      {/* Card Content */}
      <div className="relative p-6 flex flex-col flex-1">
        {/* Floating background glow */}
        <m.div
          className="absolute inset-0 pointer-events-none"
          animate={{ opacity: hovered ? 1 : 0 }}
          transition={{ duration: 0.5 }}
          style={{
            background: colors.spotlight,
          }}
          aria-hidden="true"
        />

        {/* Header Block: Icon & Title */}
        <div className="flex items-start gap-4 mb-4 z-10">
          <div className={clsx(
            'flex items-center justify-center w-10 h-10 border transition-all duration-500 rounded-none flex-shrink-0',
            hovered ? `${colors.borderActive} ${colors.textActive} ${colors.bg} ${colors.glow}` : 'border-dp-border text-dp-text-muted'
          )}>
            <ServiceIcon id={service.id} className="w-5 h-5" />
          </div>
          <div className="flex-1 min-w-0">
            {service.badge && (
              <span className={clsx(
                "inline-block mb-1 font-sans font-normal text-[8px] tracking-[0.16em] uppercase border px-2 py-0.5 transition-colors duration-300",
                hovered ? `border-transparent bg-${service.id.includes('coat') ? 'dp-yellow' : 'dp-violet'}/20 text-white` : 'text-dp-gold border-[var(--dp-border-gold-dim)]'
              )}>
                {service.badge}
              </span>
            )}
            <h3 className={clsx(
              "font-display font-light text-xl leading-snug text-dp-text transition-colors duration-300",
              hovered ? colors.textActive : ""
            )}>
              {service.name}
            </h3>
          </div>
        </div>

        {/* Description */}
        <p className="font-sans font-light text-xs leading-[1.6] text-dp-text-muted mb-4 flex-1">
          {service.description}
        </p>

        {/* Hidden/Revealing inclusions list to preserve clean layout but show high density */}
        <div className="mt-2 mb-6 border-t border-dp-border pt-4 min-h-[92px]">
          <ul className="flex flex-col gap-1.5">
            {service.includes.slice(0, 3).map((item) => (
              <li key={item} className="flex items-center gap-2 font-sans font-light text-[10px] text-dp-text-muted">
                <span className="block w-2 h-px bg-dp-gold flex-shrink-0" aria-hidden="true" />
                {item}
              </li>
            ))}
            {service.includes.length > 3 && (
              <li className="font-sans font-light text-[9px] text-dp-gold tracking-wide italic mt-0.5">
                + {service.includes.length - 3} more treatment stages
              </li>
            )}
          </ul>
        </div>

        {/* Pricing, Duration, & CTA */}
        <div className="mt-auto pt-4 border-t border-dp-border flex items-center justify-between z-10">
          <div>
            <span className="font-sans font-light text-[9px] text-dp-text-subtle tracking-wider uppercase block">From</span>
            <div className="flex items-baseline gap-1">
              <span className={clsx(
                "font-sans font-light text-2xl text-dp-text transition-colors duration-300",
                hovered ? colors.textActive : ""
              )}>
                ${service.price}
              </span>
              <span className="font-sans font-light text-[10px] text-dp-text-subtle">/{service.duration.replace(' hours', 'h').replace(' hour', 'h')}</span>
            </div>
          </div>

          <PrimaryButton
            as="button"
            onClick={() => {
              onSelect()
              // @ts-ignore
              window.lenis?.scrollTo('#booking', { offset: -80 })
            }}
            className="text-[10px] py-2 px-4 flex items-center gap-1.5"
            data-cursor="cta"
          >
            Book
            <ArrowRight className="w-3 h-3" />
          </PrimaryButton>
        </div>
      </div>
    </TiltCard>
  )
}

// ─── Service Specific Gold-outline Icons ──────────────────────

function ServiceIcon({ id, className }: { id: ServiceTier; className?: string }) {
  switch (id) {
    case 'basic_wash':
      return (
        <svg viewBox="0 0 24 24" className={className} fill="none" stroke="currentColor" strokeWidth="1.5">
          <path d="M12 2.69l5.66 5.66a8 8 0 1 1-11.31 0z" strokeLinecap="round" strokeLinejoin="round"/>
        </svg>
      )
    case 'interior_deep':
      return (
        <svg viewBox="0 0 24 24" className={className} fill="none" stroke="currentColor" strokeWidth="1.5">
          <circle cx="12" cy="12" r="9" />
          <circle cx="12" cy="12" r="3" />
          <path d="M12 9v6M9 12h6" strokeLinecap="round" />
        </svg>
      )
    case 'exterior_polish':
      return (
        <svg viewBox="0 0 24 24" className={className} fill="none" stroke="currentColor" strokeWidth="1.5">
          <circle cx="12" cy="12" r="5" />
          {[0, 45, 90, 135, 180, 225, 270, 315].map(a => {
            const rad = a * Math.PI / 180
            return (
              <line key={a}
                x1={12 + 7 * Math.cos(rad)}
                y1={12 + 7 * Math.sin(rad)}
                x2={12 + 9.5 * Math.cos(rad)}
                y2={12 + 9.5 * Math.sin(rad)}
                strokeLinecap="round"
              />
            )
          })}
        </svg>
      )
    case 'full_detail':
      return (
        <svg viewBox="0 0 24 24" className={className} fill="none" stroke="currentColor" strokeWidth="1.5">
          <path d="M2 4l3 12h14l3-12-6 7-4-7-4 7z" strokeLinecap="round" strokeLinejoin="round"/>
          <path d="M5 20h14" strokeLinecap="round" />
        </svg>
      )
    case 'ceramic_coating':
      return (
        <svg viewBox="0 0 24 24" className={className} fill="none" stroke="currentColor" strokeWidth="1.5">
          <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" strokeLinecap="round" strokeLinejoin="round"/>
        </svg>
      )
    case 'paint_correction':
      return (
        <svg viewBox="0 0 24 24" className={className} fill="none" stroke="currentColor" strokeWidth="1.5">
          <path d="M18 3l3 3M14 7l7 7M3 18l5-5-2-2-5 5z" strokeLinecap="round" strokeLinejoin="round" />
          <circle cx="15.5" cy="8.5" r="3" />
        </svg>
      )
  }
}

// ─── Rich Image Visual Panels inside Card Headers with Hover Before/After ───

const TIER_IMAGES: Record<string, string> = {
  basic_wash: '/bmw_polished.png',
  interior_deep: '/audi_polished.png',
  exterior_polish: '/porsche_polished.png',
  full_detail: '/mercedes_polished.png',
  ceramic_coating: '/defender_polished.png',
  paint_correction: '/rolls_polished.png',
}

function TierGridVisualPanel({ id, hovered }: { id: ServiceTier; hovered: boolean }) {
  const imgSrc = TIER_IMAGES[id] || '/porsche_polished.png'
  const colors = getServiceColor(id)

  return (
    <div className="w-full h-full relative overflow-hidden select-none pointer-events-none">
      {/* 1. BEFORE STATE LAYER (Dull, scratched, muddy paint) */}
      <div className="absolute inset-0">
        <img
          src={imgSrc}
          alt="Before Detail"
          className="w-full h-full object-cover"
          style={{ filter: 'grayscale(20%) brightness(44%) contrast(80%) sepia(26%) blur(0.5px)' }}
        />
        
        {/* Mud, water spot scale, and swirl scratch SVG overlay */}
        <svg 
          className="absolute inset-0 w-full h-full z-10 pointer-events-none" 
          viewBox="0 0 200 100" 
          fill="none"
          preserveAspectRatio="xMidYMid slice"
        >
          {/* Mud splatter near bottom edge */}
          <path
            d="M-10 85 Q 30 75 60 90 T 130 92 T 210 90 L 210 105 L -10 105 Z"
            fill="rgba(90, 70, 50, 0.5)"
          />
          {/* Small mud spots */}
          <circle cx="25" cy="72" r="1.5" fill="rgba(85, 65, 45, 0.6)" />
          <circle cx="55" cy="78" r="2" fill="rgba(85, 65, 45, 0.6)" />
          <circle cx="115" cy="80" r="1" fill="rgba(85, 65, 45, 0.6)" />
          <circle cx="165" cy="75" r="2.5" fill="rgba(85, 65, 45, 0.6)" />

          {/* Hard water mineral spot circles */}
          {[
            [40, 30, 4.5], [60, 20, 3.5], [90, 40, 5], [130, 25, 4],
            [160, 45, 5.5], [100, 15, 3], [70, 50, 4], [150, 15, 4.5]
          ].map(([cx, cy, r], i) => (
            <g key={`spot-${i}`} opacity="0.2">
              <circle cx={cx} cy={cy} r={r} stroke="white" strokeWidth="0.5" fill="rgba(255,255,255,0.05)" />
            </g>
          ))}

        </svg>
      </div>

      {/* 2. AFTER STATE LAYER (Glossy, rich color, sweeps in on hover) */}
      <div
        className="absolute inset-0 transition-[clip-path] duration-700 ease-dp-out"
        style={{ clipPath: hovered ? 'inset(0 0% 0 0)' : 'inset(0 100% 0 0)' }}
      >
        <img
          src={imgSrc}
          alt="After Detail"
          className="w-full h-full object-cover"
        />
        {/* Specular Caustic / Glow overlay */}
        <div className="absolute inset-0 bg-gradient-to-tr from-transparent via-dp-gold/10 to-transparent" />
        <div className="absolute inset-0 pointer-events-none" style={{
          background: `radial-gradient(circle 100px at 60% 40%, ${colors.accentColor}18 0%, transparent 80%)`
        }} />
      </div>

      {/* 3. DYNAMIC LASER SCANNING BEAM ON HOVER */}
      <div
        className="absolute top-0 bottom-0 w-[2px] transition-[left] duration-700 ease-dp-out pointer-events-none z-10"
        style={{
          left: hovered ? '100%' : '0%',
          opacity: hovered ? 1 : 0,
          background: colors.laser,
          boxShadow: colors.laserBoxShadow,
        }}
      />
      
      {/* Before / After indicator labels in header */}
      <div className="absolute bottom-2 right-3 z-20 flex gap-1.5 items-center bg-dp-bg/60 backdrop-blur-[2px] px-1.5 py-0.5 border border-dp-border">
        <span className={clsx(
          "text-[7px] tracking-widest font-sans uppercase transition-colors duration-500",
          hovered ? "text-dp-gold font-normal" : "text-dp-text-muted"
        )}>
          {hovered ? "Corrected" : "Swirled / Dull"}
        </span>
      </div>
    </div>
  )
}

// ─── AddOn card component ────────────────────────────────────

function AddOnCard({ addOn, selected, onToggle }: {
  addOn: typeof ADD_ONS[number]; selected: boolean; onToggle: () => void
}) {
  return (
    <button
      onClick={onToggle}
      data-cursor="hover"
      className={clsx(
        'relative text-left border p-5 cursor-pointer bg-transparent',
        'transition-colors duration-300',
        'focus-visible:outline focus-visible:outline-2 focus-visible:outline-dp-gold',
        selected ? 'border-[var(--dp-border-gold)] bg-dp-surface' : 'border-[var(--dp-border)] hover:border-[var(--dp-border-hover)]',
      )}
    >
      <m.div className="absolute top-0 left-0 h-px bg-dp-gold"
        animate={{ width: selected ? '100%' : '0%' }}
        transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
        aria-hidden="true"
      />
      <div className="flex items-start justify-between gap-3 mb-2">
        <span className="font-sans font-normal text-sm text-dp-text">{addOn.name}</span>
        <span className={clsx('font-sans font-normal text-sm flex-shrink-0 transition-colors duration-200', selected ? 'text-dp-gold' : 'text-dp-text-muted')}>
          +${addOn.price}
        </span>
      </div>
      <p className="font-sans font-light text-xs leading-[1.6] text-dp-text-muted">{addOn.description}</p>
    </button>
  )
}
