import { useState, useEffect, useRef } from 'react'
import { m, LazyMotion, domAnimation, AnimatePresence } from 'framer-motion'
import { clsx } from 'clsx'
import {
  Section, SectionInner, Eyebrow, SectionHeadline,
  PrimaryButton, ArrowRight, springs
} from '@/design-system'
import { scrollToElement } from '@/lib/scroll'
import { SERVICES, ADD_ONS, VEHICLE_MULTIPLIERS, CONDITION_MULTIPLIERS } from '@/data'
import type { ServiceTier, VehicleType, VehicleCondition } from '@/types'

const VEHICLE_OPTIONS: { id: VehicleType; label: string }[] = [
  { id: 'sedan',  label: 'Sedan / Coupe'   },
  { id: 'suv',    label: 'SUV / Crossover' },
  { id: 'truck',  label: 'Truck'           },
  { id: 'van',    label: 'Van / Minivan'   },
  { id: 'luxury', label: 'Luxury / Exotic' },
]

const CONDITION_OPTIONS: {
  id: VehicleCondition
  label: string
  description: string
  examples: string
}[] = [
  {
    id: 'light',
    label: 'Lightly soiled',
    description: 'Minor dirt & dust',
    examples: 'Mostly garaged, light daily use',
  },
  {
    id: 'moderate',
    label: 'Moderately soiled',
    description: 'Typical daily wear',
    examples: 'Regular driver, light sand/mud',
  },
  {
    id: 'heavy',
    label: 'Heavily soiled',
    description: 'Deep mud, pet hair, neglect',
    examples: 'Mud-covered, deep stains, or long neglected',
  },
]

interface QuoteSectionProps {
  preselectedTier?: ServiceTier | null
  onContinueToBooking?: (setup: {
    services: Set<ServiceTier>
    vehicle: VehicleType
    condition: VehicleCondition
    addons: Set<string>
  }) => void
}

export function QuoteSection({ preselectedTier, onContinueToBooking }: QuoteSectionProps) {
  const [selectedServices, setSelectedServices] = useState<Set<ServiceTier>>(
    new Set(preselectedTier ? [preselectedTier] : [])
  )
  const [vehicle, setVehicle] = useState<VehicleType | null>(null)
  const [condition, setCondition] = useState<VehicleCondition | null>(null)
  const [selectedAddOns, setSelectedAddOns] = useState<Set<string>>(new Set())
  const [displayedPrice, setDisplayedPrice] = useState(0)

  // Listen to external tier pre-selection changes
  useEffect(() => {
    if (preselectedTier) {
      setSelectedServices(new Set([preselectedTier]))
    }
  }, [preselectedTier])

  const rafRef  = useRef<number | null>(null)
  const prevRef = useRef(0)

  // Calculate prices
  const basePrice = SERVICES
    .filter(s => selectedServices.has(s.id))
    .reduce((sum, s) => sum + s.price, 0)

  const vMult = vehicle ? VEHICLE_MULTIPLIERS[vehicle] : 1
  const cMult = condition ? CONDITION_MULTIPLIERS[condition] : 1
  const addOnTotal = ADD_ONS
    .filter(a => selectedAddOns.has(a.id))
    .reduce((sum, a) => sum + a.price, 0)

  const targetPrice = basePrice > 0
    ? Math.round(basePrice * vMult * cMult) + addOnTotal
    : 0

  // Spring-animate displayed price
  useEffect(() => {
    if (rafRef.current) cancelAnimationFrame(rafRef.current)
    const start = prevRef.current
    const end   = targetPrice
    if (start === end) return

    const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches
    if (reduced) {
      setDisplayedPrice(end)
      prevRef.current = end
      return
    }

    let startTime: number | null = null
    const duration = 500

    const tick = (ts: number) => {
      if (startTime === null) startTime = ts
      const progress = Math.min((ts - startTime) / duration, 1)
      const eased = 1 - Math.pow(1 - progress, 3)
      const current = Math.round(start + (end - start) * eased)
      setDisplayedPrice(current)
      if (progress < 1) {
        rafRef.current = requestAnimationFrame(tick)
      } else {
        prevRef.current = end
      }
    }
    rafRef.current = requestAnimationFrame(tick)
    return () => {
      if (rafRef.current) cancelAnimationFrame(rafRef.current)
    }
  }, [targetPrice])

  const toggleService = (id: ServiceTier) => {
    setSelectedServices(prev => {
      const next = new Set(prev)
      next.has(id) ? next.delete(id) : next.add(id)
      return next
    })
  }

  const toggleAddOn = (id: string) => {
    setSelectedAddOns(prev => {
      const next = new Set(prev)
      next.has(id) ? next.delete(id) : next.add(id)
      return next
    })
  }

  const isConfigured = selectedServices.size > 0 && vehicle && condition
  const industryAvg = basePrice > 0
    ? Math.round((basePrice * 1.35) * vMult * cMult) + addOnTotal
    : 0
  const savings = industryAvg - targetPrice

  return (
    <LazyMotion features={domAnimation}>
      <Section id="quote" className="bg-dp-bg">
        <SectionInner>

          <m.div
            className="mb-12 text-center"
            initial={{ opacity: 0, y: 15 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={springs.responsive}
          >
            <Eyebrow className="mb-4 text-dp-violet-light justify-center">Price Configurator</Eyebrow>
            <SectionHeadline>Get a Custom <em>Estimate</em></SectionHeadline>
          </m.div>

          {/* Configurator instrument panel */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-px border border-dp-border bg-dp-border relative">

            {/* Left: Selectors (occupies 2/3) */}
            <div className="lg:col-span-2 flex flex-col gap-px">
              
              {/* Top Selector Grid: Vehicle Type & Paint Condition side-by-side */}
              <div className="grid grid-cols-1 md:grid-cols-5 gap-px bg-dp-border">
                
                {/* Stage 1: Vehicle type (3/5 width on md) */}
                <div className="md:col-span-3 bg-dp-surface p-6 md:p-8 flex flex-col justify-between">
                  <ConfigStage number={1} label="Select your vehicle">
                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                      {VEHICLE_OPTIONS.map(v => (
                        <button
                          key={v.id}
                          onClick={() => setVehicle(v.id)}
                          className={clsx(
                            'relative flex flex-col items-center justify-center p-3 border bg-transparent transition-all duration-300',
                            vehicle === v.id
                              ? 'border-dp-violet bg-dp-violet/5 text-dp-violet-light shadow-violet-sm'
                              : 'border-dp-border hover:border-dp-border-hover text-dp-text-muted hover:text-dp-text'
                          )}
                          data-cursor="hover"
                        >
                          <VehicleIcon type={v.id} active={vehicle === v.id} />
                          <span className="font-sans font-light text-[9px] tracking-wide mt-2 block text-center uppercase">
                            {v.label.split(' / ')[0]}
                          </span>
                        </button>
                      ))}
                    </div>
                  </ConfigStage>
                </div>

                {/* Stage 2: Paint condition (2/5 width on md) */}
                <div className="md:col-span-2 bg-dp-surface p-6 md:p-8 flex flex-col justify-between">
                  <ConfigStage number={2} label="Select Paint Condition">
                    <div className="flex flex-col gap-2">
                      {CONDITION_OPTIONS.map(c => (
                        <button
                          key={c.id}
                          onClick={() => setCondition(c.id)}
                          className={clsx(
                            'relative p-2.5 border bg-transparent text-left transition-all duration-300 flex items-center justify-between',
                            condition === c.id
                              ? 'border-dp-yellow bg-dp-yellow/5 shadow-yellow-sm'
                              : 'border-dp-border hover:border-dp-border-hover'
                          )}
                          data-cursor="hover"
                        >
                          <div className="min-w-0 pr-2">
                            <p className={clsx(
                              'font-sans font-normal text-[11px] transition-colors duration-200 uppercase tracking-wider',
                              condition === c.id ? 'text-dp-yellow-light' : 'text-dp-text'
                            )}>
                              {c.label.split(' ')[0]}
                            </p>
                            <p className="font-sans font-light text-[9px] text-dp-text-subtle mt-0.5 truncate leading-none">
                              {c.description}
                            </p>
                          </div>
                          
                          {/* Severity dots */}
                          <div className="flex items-center gap-1 flex-shrink-0">
                            {[1, 2, 3].map(i => {
                              const severity = { light: 1, moderate: 2, heavy: 3 }[c.id]
                              return (
                                <span
                                  key={i}
                                  className={clsx(
                                    'w-1 h-1 rounded-full',
                                    i <= severity
                                      ? condition === c.id ? 'bg-dp-yellow' : 'bg-dp-text-muted'
                                      : 'bg-dp-text-subtle'
                                  )}
                                />
                              )
                            })}
                          </div>
                        </button>
                      ))}
                    </div>
                  </ConfigStage>
                </div>

              </div>

              {/* Stage 3: Services grid & Add-ons */}
              <div className="bg-dp-surface p-6 md:p-8 flex flex-col gap-8">
                <ConfigStage number={3} label="Select detailing services">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {SERVICES.map(s => {
                      const isSelected = selectedServices.has(s.id)
                      const isWash = s.id === 'basic_wash' || s.id === 'interior_deep'
                      const isCoat = s.id.includes('coat') || s.id.includes('correct')
                      return (
                        <button
                          key={s.id}
                          onClick={() => toggleService(s.id)}
                          className={clsx(
                            'relative text-left border p-3.5 transition-all duration-300 bg-transparent flex items-start gap-3 justify-between',
                            isSelected
                              ? isWash ? 'border-dp-gold bg-dp-gold/5 shadow-gold-sm' :
                                isCoat ? 'border-dp-yellow bg-dp-yellow/5 shadow-yellow-sm' :
                                'border-dp-violet bg-dp-violet/5 shadow-violet-sm'
                              : 'border-dp-border hover:border-dp-border-hover'
                          )}
                          data-cursor="hover"
                        >
                          <div className="flex items-start gap-3">
                            <div className={clsx(
                              'w-3.5 h-3.5 border rounded-full flex items-center justify-center mt-0.5 transition-all duration-300 flex-shrink-0',
                              isSelected ? (isWash ? 'border-dp-gold bg-dp-gold/20' : isCoat ? 'border-dp-yellow bg-dp-yellow/20' : 'border-dp-violet bg-dp-violet/20') : 'border-dp-border'
                            )}>
                              {isSelected && (
                                <span className={clsx(
                                  'w-1.5 h-1.5 rounded-full',
                                  isWash ? 'bg-dp-gold' : isCoat ? 'bg-dp-yellow' : 'bg-dp-violet'
                                )} />
                              )}
                            </div>
                            <div>
                              <p className={clsx(
                                'font-sans font-normal text-xs transition-colors duration-200',
                                isSelected ? (isWash ? 'text-dp-gold-light' : isCoat ? 'text-dp-yellow-light' : 'text-dp-violet-light') : 'text-dp-text'
                              )}>
                                {s.name}
                              </p>
                              <p className="font-sans font-light text-[10px] text-dp-text-muted mt-0.5">
                                {s.duration}
                              </p>
                            </div>
                          </div>
                          <span className={clsx(
                            'font-sans font-light text-xs flex-shrink-0',
                            isSelected ? (isWash ? 'text-dp-gold' : isCoat ? 'text-dp-yellow' : 'text-dp-violet') : 'text-dp-text-muted'
                          )}>
                            ${s.price}
                          </span>
                        </button>
                      )
                    })}
                  </div>

                  {/* Add-ons block */}
                  <div className="mt-6 pt-6 border-t border-dp-border/60">
                    <p className="font-sans font-normal text-[10px] tracking-widest uppercase text-dp-text-subtle mb-4">
                      Optional Add-ons
                    </p>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                      {ADD_ONS.map(a => {
                        const isSelected = selectedAddOns.has(a.id)
                        return (
                          <button
                            key={a.id}
                            onClick={() => toggleAddOn(a.id)}
                            className={clsx(
                              'relative text-left border px-4 py-2.5 transition-all duration-300 bg-transparent flex items-center justify-between',
                              isSelected
                                ? 'border-dp-violet bg-dp-violet/5 shadow-violet-sm'
                                : 'border-dp-border hover:border-dp-border-hover'
                            )}
                            data-cursor="hover"
                          >
                            <span className={clsx(
                              'font-sans font-light text-xs transition-colors duration-200',
                              isSelected ? 'text-dp-violet-light' : 'text-dp-text'
                            )}>
                              {a.name}
                            </span>
                            <span className={clsx(
                              'font-sans font-normal text-xs flex-shrink-0',
                              isSelected ? 'text-dp-violet-light' : 'text-dp-text-muted'
                            )}>
                              +${a.price}
                            </span>
                          </button>
                        )
                      })}
                    </div>
                  </div>
                </ConfigStage>
              </div>

            </div>

            {/* Right Sticky Summary Column (occupies 1/3, sticky on lg) */}
            <div className="lg:sticky lg:top-[90px] self-start bg-dp-surface-2 p-6 md:p-8 flex flex-col justify-between gap-8 h-fit z-20">
              <div className="space-y-6">
                <p className="font-sans font-normal text-xs tracking-widest uppercase text-dp-text-muted">
                  Your Quote
                </p>

                {/* Price Counter */}
                <div className="py-4 border-y border-dp-border/60 flex flex-col">
                  {selectedServices.size > 0 ? (
                    <div>
                      <span className="font-sans font-light text-5xl leading-none text-dp-text drop-shadow-[0_0_12px_rgba(255,255,255,0.05)]">
                        ${displayedPrice.toLocaleString()}
                      </span>
                      <span className="font-sans font-light text-[10px] text-dp-text-subtle block mt-2 uppercase tracking-wider">
                        Total Estimated Investment
                      </span>
                    </div>
                  ) : (
                    <span className="font-sans font-light text-xs text-dp-text-muted leading-relaxed">
                      Select at least one service to see your price.
                    </span>
                  )}
                </div>

                {/* Industry Comparison & Savings */}
                <AnimatePresence>
                  {isConfigured && (
                    <m.div
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: 'auto' }}
                      exit={{ opacity: 0, height: 0 }}
                      className="overflow-hidden space-y-2 text-[11px] font-sans"
                    >
                      <div className="flex justify-between text-dp-text-subtle font-light">
                        <span>Industry Average:</span>
                        <span>~${industryAvg.toLocaleString()}</span>
                      </div>
                      <div className="flex justify-between text-dp-yellow font-normal">
                        <span>Configurator Savings:</span>
                        <span>~${savings.toLocaleString()}</span>
                      </div>
                    </m.div>
                  )}
                </AnimatePresence>

                {/* Summary Configuration List */}
                <AnimatePresence>
                  {selectedServices.size > 0 && (
                    <m.div
                      initial={{ opacity: 0, y: 8 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0 }}
                      className="space-y-3 pt-4 border-t border-dp-border/60"
                    >
                      <div className="text-[9px] text-dp-text-subtle font-sans tracking-wide uppercase">
                        Configuration Details
                      </div>

                      {/* Vehicle type */}
                      <div className="flex justify-between items-baseline text-xs font-sans">
                        <span className="text-dp-text-muted">Vehicle Type</span>
                        <span className="text-dp-text font-light">
                          {vehicle ? VEHICLE_OPTIONS.find(v => v.id === vehicle)?.label : 'Not Selected'}
                        </span>
                      </div>

                      {/* Condition factor */}
                      <div className="flex justify-between items-baseline text-xs font-sans">
                        <span className="text-dp-text-muted">Condition Factor</span>
                        <span className="text-dp-text font-light">
                          {condition ? CONDITION_OPTIONS.find(c => c.id === condition)?.label : 'Not Selected'}
                        </span>
                      </div>

                      {/* Selected tiers */}
                      <div className="flex flex-col gap-1.5 text-xs font-sans pt-2 border-t border-dp-border/40">
                        <span className="text-dp-text-subtle text-[9px] uppercase tracking-wide">Selected Tiers</span>
                        {SERVICES.filter(s => selectedServices.has(s.id)).map(s => (
                          <div key={s.id} className="flex justify-between items-baseline">
                            <span className="text-dp-text font-light">{s.name}</span>
                            <span className="text-dp-text-muted">${s.price}</span>
                          </div>
                        ))}
                      </div>

                      {/* Add-ons */}
                      {selectedAddOns.size > 0 && (
                        <div className="flex flex-col gap-1.5 text-xs font-sans pt-2 border-t border-dp-border/40">
                          <span className="text-dp-text-subtle text-[9px] uppercase tracking-wide">Surcharges</span>
                          {ADD_ONS.filter(a => selectedAddOns.has(a.id)).map(a => (
                            <div key={a.id} className="flex justify-between items-baseline">
                              <span className="text-dp-text font-light">{a.name}</span>
                              <span className="text-dp-text-muted">+${a.price}</span>
                            </div>
                          ))}
                        </div>
                      )}
                    </m.div>
                  )}
                </AnimatePresence>
              </div>

              {/* Action Booking button */}
              <div className="flex flex-col gap-3 pt-6 border-t border-dp-border/60">
                <PrimaryButton
                  as="button"
                  onClick={() => {
                    if (isConfigured && vehicle && condition) {
                      onContinueToBooking?.({
                        services: selectedServices,
                        vehicle,
                        condition,
                        addons: selectedAddOns,
                      })
                    }
                  }}
                  className={clsx(
                    'w-full justify-center text-xs py-3',
                    !isConfigured && 'opacity-35 pointer-events-none'
                  )}
                  aria-disabled={!isConfigured}
                >
                  Continue to Booking
                  <ArrowRight className="w-3.5 h-3.5" />
                </PrimaryButton>
                <p className="font-sans font-light text-[10px] text-dp-text-subtle text-center leading-normal">
                  Estimates only. Final details are verified on-site.
                </p>
              </div>
            </div>

          </div>

        </SectionInner>
      </Section>
    </LazyMotion>
  )
}

function ConfigStage({ number, label, children }: {
  number: number
  label: string
  children: React.ReactNode
}) {
  return (
    <div className="space-y-4">
      <div className="flex items-center gap-3">
        <span className="font-sans font-normal text-[10px] tracking-widest text-dp-violet-light">0{number}</span>
        <div className="w-4 h-px bg-dp-border/60" aria-hidden="true" />
        <span className="font-sans font-normal text-xs tracking-wider uppercase text-dp-text-muted">
          {label}
        </span>
      </div>
      {children}
    </div>
  )
}

function VehicleIcon({ type, active }: { type: VehicleType; active: boolean }) {
  const col = active ? 'var(--dp-violet-light)' : '#5A5A55'
  const paths: Record<VehicleType, string> = {
    sedan:  'M8 18H2V14L6 10H18L22 14V18H16M8 18a2 2 0 1 0 4 0M14 20a2 2 0 1 0 4-4m-10 2a2 2 0 1 0 0-4',
    suv:    'M5 18H2V12L5 6H19L22 12V18H19M5 18a2 2 0 1 0 4 0M15 18a2 2 0 1 0 4 0M5 6V4h14v2',
    truck:  'M1 12V18H3M3 18a2 2 0 1 0 4 0M7 18H15M15 18a2 2 0 1 0 4 0M19 18H22V12H15V5H4L1 12',
    van:    'M3 18H1V11L4 5H20V18H17M3 18a2 2 0 1 0 4 0M13 18a2 2 0 1 0 4 0M1 13H20',
    luxury: 'M4 18H2V14L5 10H19L22 14V18H20M4 18a2 2 0 1 0 4 0M16 18a2 2 0 1 0 4 0M7 10l2-5h6l2 5',
  }
  return (
    <svg viewBox="0 0 24 24" className="w-8 h-8" fill="none" aria-hidden="true">
      <path d={paths[type]} stroke={col} strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  )
}
