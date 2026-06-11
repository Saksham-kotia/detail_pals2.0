import { useState, useEffect, useRef } from 'react'
import { m, LazyMotion, domAnimation, AnimatePresence } from 'framer-motion'
import { clsx } from 'clsx'
import { Link } from 'react-router-dom'
import {
  staggerContainer, fadeUp, springs,
  Section, SectionInner, Eyebrow, SectionHeadline,
  PrimaryButton, ArrowRight
} from '@/design-system'
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
}

export function QuoteSection({ preselectedTier }: QuoteSectionProps) {
  const [selectedServices, setSelectedServices] = useState<Set<ServiceTier>>(
    new Set(preselectedTier ? [preselectedTier] : [])
  )
  const [vehicle, setVehicle] = useState<VehicleType | null>(null)
  const [condition, setCondition] = useState<VehicleCondition | null>(null)
  const [selectedAddOns, setSelectedAddOns] = useState<Set<string>>(new Set())
  const [displayedPrice, setDisplayedPrice] = useState(0)

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

  // Build URL parameters for booking transition
  const bookingParams = new URLSearchParams()
  if (selectedServices.size > 0) {
    bookingParams.set('services', Array.from(selectedServices).join(','))
  }
  if (vehicle) bookingParams.set('vehicle', vehicle)
  if (condition) bookingParams.set('condition', condition)
  if (selectedAddOns.size > 0) {
    bookingParams.set('addons', Array.from(selectedAddOns).join(','))
  }

  return (
    <LazyMotion features={domAnimation}>
      <Section id="quote" className="bg-dp-bg">
        <SectionInner>

          {/* Configurator instrument panel */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-px border border-dp-border bg-dp-border">

            {/* Left: selectors (occupies 2/3) */}
            <div className="lg:col-span-2 bg-dp-surface p-6 md:p-10 flex flex-col gap-10">

              {/* Stage 1: Vehicle type */}
              <ConfigStage number={1} label="Select your vehicle">
                <div className="grid grid-cols-2 sm:grid-cols-5 gap-2">
                  {VEHICLE_OPTIONS.map(v => (
                    <button
                      key={v.id}
                      onClick={() => setVehicle(v.id)}
                      className={clsx(
                        'relative flex flex-col items-center justify-center p-3 border bg-transparent transition-all duration-300',
                        vehicle === v.id
                          ? 'border-dp-gold bg-dp-gold/5 text-dp-gold shadow-gold-sm'
                          : 'border-dp-border hover:border-dp-border-hover text-dp-text-muted hover:text-dp-text'
                      )}
                      data-cursor="hover"
                    >
                      <VehicleIcon type={v.id} active={vehicle === v.id} />
                      <span className="font-sans font-light text-[10px] tracking-wide mt-2 block text-center">
                        {v.label}
                      </span>
                    </button>
                  ))}
                </div>
              </ConfigStage>

              {/* Stage 2: Paint condition */}
              <ConfigStage number={2} label="Select Paint Condition">
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                  {CONDITION_OPTIONS.map(c => (
                    <button
                      key={c.id}
                      onClick={() => setCondition(c.id)}
                      className={clsx(
                        'relative p-4 border bg-transparent text-left transition-all duration-300 flex flex-col justify-between h-24',
                        condition === c.id
                          ? 'border-dp-gold bg-dp-gold/5 shadow-gold-sm'
                          : 'border-dp-border hover:border-dp-border-hover'
                      )}
                      data-cursor="hover"
                    >
                      <div>
                        <p className={clsx(
                          'font-sans font-normal text-xs transition-colors duration-200',
                          condition === c.id ? 'text-dp-gold' : 'text-dp-text'
                        )}>
                          {c.label}
                        </p>
                        <p className="font-sans font-light text-[10px] text-dp-text-muted mt-1 leading-normal">
                          {c.description}
                        </p>
                      </div>
                      <div className="flex items-center gap-1 mt-2">
                        {[1, 2, 3].map(i => {
                          const severity = { light: 1, moderate: 2, heavy: 3 }[c.id]
                          return (
                            <span
                              key={i}
                              className={clsx(
                                'w-1.5 h-1.5 rounded-full',
                                i <= severity
                                  ? condition === c.id ? 'bg-dp-gold' : 'bg-dp-text-muted'
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

              {/* Stage 3: Services grid */}
              <ConfigStage number={3} label="Select detailing services">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {SERVICES.map(s => {
                    const isSelected = selectedServices.has(s.id)
                    return (
                      <button
                        key={s.id}
                        onClick={() => toggleService(s.id)}
                        className={clsx(
                          'relative text-left border p-4 transition-all duration-300 bg-transparent flex items-start gap-3 justify-between',
                          isSelected
                            ? 'border-dp-gold bg-dp-gold/5 shadow-gold-sm'
                            : 'border-dp-border hover:border-dp-border-hover'
                        )}
                        data-cursor="hover"
                      >
                        <div className="flex items-start gap-3">
                          <div className={clsx(
                            'w-4 h-4 border rounded-full flex items-center justify-center mt-0.5 transition-all duration-300 flex-shrink-0',
                            isSelected ? 'border-dp-gold bg-dp-gold/20' : 'border-dp-border'
                          )}>
                            {isSelected && <span className="w-1.5 h-1.5 rounded-full bg-dp-gold" />}
                          </div>
                          <div>
                            <p className={clsx(
                              'font-sans font-normal text-xs transition-colors duration-200',
                              isSelected ? 'text-dp-gold' : 'text-dp-text'
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
                          isSelected ? 'text-dp-gold' : 'text-dp-text-muted'
                        )}>
                          ${s.price}
                        </span>
                      </button>
                    )
                  })}
                </div>

                {/* Add-ons block */}
                <div className="mt-8 pt-6 border-t border-dp-border">
                  <p className="font-sans font-normal text-[10px] tracking-widest uppercase text-dp-text-muted mb-4">
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
                            'relative text-left border px-4 py-3 transition-all duration-300 bg-transparent flex items-center justify-between',
                            isSelected
                              ? 'border-dp-gold bg-dp-gold/5 shadow-gold-sm'
                              : 'border-dp-border hover:border-dp-border-hover'
                          )}
                          data-cursor="hover"
                        >
                          <span className={clsx(
                            'font-sans font-light text-xs transition-colors duration-200',
                            isSelected ? 'text-dp-gold' : 'text-dp-text'
                          )}>
                            {a.name}
                          </span>
                          <span className={clsx(
                            'font-sans font-normal text-xs flex-shrink-0',
                            isSelected ? 'text-dp-gold' : 'text-dp-text-muted'
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

            {/* Right: sticky summary (occupies 1/3) */}
            <div className="bg-dp-surface-2 p-6 md:p-10 flex flex-col justify-between gap-8 h-full">
              <div className="space-y-6">
                <p className="font-sans font-normal text-xs tracking-widest uppercase text-dp-text-muted">
                  Your Quote
                </p>

                {/* Animated Price Counter */}
                <div className="py-4 border-y border-dp-border flex flex-col">
                  {selectedServices.size > 0 ? (
                    <div>
                      <span className="font-sans font-light text-5xl leading-none text-dp-text">
                        ${displayedPrice.toLocaleString()}
                      </span>
                      <span className="font-sans font-light text-xs text-dp-text-muted block mt-2">
                        Total Estimated Investment
                      </span>
                    </div>
                  ) : (
                    <span className="font-sans font-light text-sm text-dp-text-muted leading-relaxed">
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
                      className="overflow-hidden space-y-2"
                    >
                      <div className="flex justify-between text-[11px] text-dp-text-muted font-sans font-light">
                        <span>Industry Average:</span>
                        <span>~${industryAvg.toLocaleString()}</span>
                      </div>
                      <div className="flex justify-between text-xs text-dp-gold font-sans font-normal">
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
                      className="space-y-3 pt-4 border-t border-dp-border"
                    >
                      <div className="text-[10px] text-dp-text-subtle font-sans tracking-wide uppercase">
                        Configuration Details
                      </div>

                      {/* Vehicle summary */}
                      <div className="flex justify-between items-baseline text-xs font-sans">
                        <span className="text-dp-text-muted">Vehicle Type</span>
                        <span className="text-dp-text font-light">
                          {vehicle ? VEHICLE_OPTIONS.find(v => v.id === vehicle)?.label : 'Not Selected'}
                        </span>
                      </div>

                      {/* Condition summary */}
                      <div className="flex justify-between items-baseline text-xs font-sans">
                        <span className="text-dp-text-muted">Condition Factor</span>
                        <span className="text-dp-text font-light">
                          {condition ? CONDITION_OPTIONS.find(c => c.id === condition)?.label : 'Not Selected'}
                        </span>
                      </div>

                      {/* Services summary */}
                      <div className="flex flex-col gap-1.5 text-xs font-sans pt-2 border-t border-dp-border/40">
                        <span className="text-dp-text-muted text-[10px] uppercase tracking-wide">Selected Tiers</span>
                        {SERVICES.filter(s => selectedServices.has(s.id)).map(s => (
                          <div key={s.id} className="flex justify-between items-baseline">
                            <span className="text-dp-text font-light">{s.name}</span>
                            <span className="text-dp-text-muted">${s.price}</span>
                          </div>
                        ))}
                      </div>

                      {/* Add-ons summary */}
                      {selectedAddOns.size > 0 && (
                        <div className="flex flex-col gap-1.5 text-xs font-sans pt-2 border-t border-dp-border/40">
                          <span className="text-dp-text-muted text-[10px] uppercase tracking-wide">Surcharges</span>
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

              {/* Action Booking Button */}
              <div className="flex flex-col gap-3 pt-6 border-t border-dp-border">
                <PrimaryButton
                  to={isConfigured ? `/booking?${bookingParams.toString()}` : '#'}
                  className={clsx(
                    'w-full justify-center text-xs py-3.5',
                    !isConfigured && 'opacity-35 pointer-events-none'
                  )}
                  aria-disabled={!isConfigured}
                >
                  Continue to Booking
                  <ArrowRight className="w-3.5 h-3.5" />
                </PrimaryButton>
                <p className="font-sans font-light text-xs text-dp-text-muted text-center leading-normal">
                  Values are estimates. Final quote details are confirmed upon check-in.
                </p>
              </div>
            </div>

          </div>

        </SectionInner>
      </Section>
    </LazyMotion>
  )
}

// ─── Stage Heading ───────────────────────────────────────────

function ConfigStage({ number, label, children }: {
  number: number
  label: string
  children: React.ReactNode
}) {
  return (
    <div className="space-y-4">
      <div className="flex items-center gap-3">
        <span className="font-sans font-normal text-[10px] tracking-widest text-dp-gold">0{number}</span>
        <div className="w-4 h-px bg-dp-border" aria-hidden="true" />
        <span className="font-sans font-normal text-xs tracking-wider uppercase text-dp-text-muted">
          {label}
        </span>
      </div>
      {children}
    </div>
  )
}

// ─── Vehicle SVG Silhouettes ──────────────────────────────────

function VehicleIcon({ type, active }: { type: VehicleType; active: boolean }) {
  const col = active ? 'var(--dp-gold)' : '#5A5A55'
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
