import { useState, useEffect } from 'react'
import { AtmosphericBackground } from '@/components/ui/AtmosphericBackground'
import { SplitTextReveal }       from '@/components/ui/SplitTextReveal'
import { TiltCard }              from '@/components/ui/TiltCard'
import {
  Eyebrow, Section, SectionInner,
  PrimaryButton, ArrowRight, staggerContainer, fadeUp, springs,
} from '@/design-system'
import { m, LazyMotion, domAnimation, AnimatePresence } from 'framer-motion'
import { SERVICES, ADD_ONS, VEHICLE_MULTIPLIERS, CONDITION_MULTIPLIERS } from '@/data'
import type { ServiceTier, VehicleType, VehicleCondition } from '@/types'
import { createBooking } from '@/services/bookingService'
import { supabase } from '@/lib/supabase'
import { scrollToElement } from '@/lib/scroll'

type Step = 1 | 2 | 3 | 4

const SLOTS = ['8:00 AM', '9:30 AM', '11:00 AM', '1:00 PM', '2:30 PM', '4:00 PM']
const SLOT_MAP: Record<string, string> = {
  '8:00 AM': '08:00',
  '9:30 AM': '09:30',
  '11:00 AM': '11:00',
  '1:00 PM': '13:00',
  '2:30 PM': '14:30',
  '4:00 PM': '16:00',
};

interface BookingSectionProps {
  preselectedTier?: ServiceTier | null
  preloadedSetup?: {
    services: Set<ServiceTier>
    vehicle: VehicleType
    condition: VehicleCondition
    addons: Set<string>
  } | null
}

export function BookingSection({ preselectedTier, preloadedSetup }: BookingSectionProps) {
  const [step, setStep] = useState<Step>(1)
  const [selTiers, setSelTiers] = useState<Set<ServiceTier>>(new Set())
  const [selAddOns, setSelAddOns] = useState<Set<string>>(new Set())
  
  const [vehicleType, setVehicleType] = useState<VehicleType | null>(null)
  const [conditionVal, setConditionVal] = useState<VehicleCondition | null>(null)

  const [selDate, setSelDate] = useState<Date | null>(null)

  // Dynamically calculate current and next month based on today's date
  const todayRef = new Date()
  const m1 = todayRef.getMonth()
  const y1 = todayRef.getFullYear()
  const nextMonthRef = new Date(y1, m1 + 1, 1)
  const m2 = nextMonthRef.getMonth()
  const y2 = nextMonthRef.getFullYear()

  const m1Label = todayRef.toLocaleString('default', { month: 'long' })
  const m2Label = nextMonthRef.toLocaleString('default', { month: 'long' })

  const [selectedMonth, setSelectedMonth] = useState<number>(m1)
  const [selectedYear, setSelectedYear] = useState<number>(y1)
  const [priority, setPriority] = useState<'standard' | 'express' | 'vip'>('standard')
  const [selSlot, setSelSlot] = useState<string | null>(null)
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [phone, setPhone] = useState('')
  const [vehicleString, setVehicleString] = useState('')
  const [submitted, setSubmitted] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [submitError, setSubmitError] = useState<string | null>(null)
  const [bookingRef, setBookingRef] = useState<string | null>(null)
  const [liveStatus, setLiveStatus] = useState<string>('pending')
  const [existingBookings, setExistingBookings] = useState<Array<{ booking_date: string; time_slot: string }>>([])

  // Load active bookings on mount to dynamically block taken slots
  useEffect(() => {
    async function loadBookings() {
      try {
        const { data, error } = await supabase
          .rpc('get_occupied_slots');
        if (!error && data) {
          setExistingBookings(data);
        }
      } catch (err) {
        console.error('[Detail Pals] Error loading bookings:', err);
      }
    }
    loadBookings();
  }, []);

  // Listen to preselected tier from service cards
  useEffect(() => {
    if (preselectedTier) {
      setSelTiers(new Set([preselectedTier]))
      setSelAddOns(new Set())
      setVehicleType(null)
      setConditionVal(null)
      setStep(2) // Jump to calendar schedule
    }
  }, [preselectedTier])

  // Listen to preloaded setup from quote configurator
  useEffect(() => {
    if (preloadedSetup) {
      setSelTiers(new Set(preloadedSetup.services))
      setSelAddOns(new Set(preloadedSetup.addons))
      setVehicleType(preloadedSetup.vehicle)
      setConditionVal(preloadedSetup.condition)
      setStep(2) // Jump to calendar schedule
    }
  }, [preloadedSetup])

  // Scroll to booking section after state/layout updates to avoid race conditions
  useEffect(() => {
    if (preselectedTier || preloadedSetup) {
      const timer = setTimeout(() => {
        scrollToElement('#booking')
      }, 100)
      return () => clearTimeout(timer)
    }
  }, [preselectedTier, preloadedSetup])

  // Auto-fill vehicle string based on selected type
  useEffect(() => {
    if (vehicleType && !vehicleString) {
      const label = {
        sedan: 'Sedan / Coupe',
        suv: 'SUV / Crossover',
        truck: 'Truck',
        van: 'Van / Minivan',
        luxury: 'Luxury / Exotic'
      }[vehicleType]
      setVehicleString(label)
    }
  }, [vehicleType, vehicleString])

  // Price calculations
  const basePrice = SERVICES
    .filter(s => selTiers.has(s.id))
    .reduce((sum, s) => sum + s.price, 0)
  
  const vMult = vehicleType ? VEHICLE_MULTIPLIERS[vehicleType] : 1
  const cMult = conditionVal ? CONDITION_MULTIPLIERS[conditionVal] : 1
  const addOnTotal = ADD_ONS
    .filter(a => selAddOns.has(a.id))
    .reduce((sum, a) => sum + a.price, 0)

  const priorityPrices = {
    standard: 0,
    express: 50,
    vip: 150,
  }
  const priorityPrice = priorityPrices[priority]

  const finalTotal = basePrice > 0
    ? Math.round(basePrice * vMult * cMult) + addOnTotal + priorityPrice
    : 0

  const canProceed1 = selTiers.size > 0
  const canProceed2 = selDate !== null && !!selSlot
  const canProceed3 = !!name && !!phone && !!email && !!vehicleString

  // Live update subscription for the booked session
  useEffect(() => {
    if (step !== 4 || !bookingRef) return;

    setLiveStatus('pending');

    const channel = supabase
      .channel(`live-booking-${bookingRef}`)
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'bookings',
          filter: `ref=eq.${bookingRef}`,
        },
        (payload) => {
          console.log('[BookingSection] Live status change received:', payload);
          if (payload.new && (payload.new as any).status) {
            setLiveStatus((payload.new as any).status);
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [step, bookingRef]);

  const handleSubmit = async () => {
    setIsSubmitting(true)
    setSubmitError(null)

    // Find the selected service
    const selectedService = SERVICES.find(s => selTiers.has(s.id))
    const selectedServicesList = selectedService ? [{
      id: selectedService.id,
      name: selectedService.name,
      price: selectedService.price,
    }] : []

    // Find selected addons
    const selectedAddons = ADD_ONS.filter(a => selAddOns.has(a.id)).map(a => ({
      id: a.id,
      name: a.name,
      price: a.price,
    }))

    // Format date
    let preferredDate = ''
    if (selDate) {
      const yyyy = selDate.getFullYear()
      const mm = String(selDate.getMonth() + 1).padStart(2, '0')
      const dd = String(selDate.getDate()).padStart(2, '0')
      preferredDate = `${yyyy}-${mm}-${dd}`
    }

    const { booking, reference, error } = await createBooking({
      customer_name: name,
      customer_email: email,
      customer_phone: phone,
      vehicle_type: vehicleType || 'sedan',
      vehicle_make: vehicleString,
      vehicle_model: 'Model',
      vehicle_year: '2026',
      vehicle_color: '',
      vehicle_condition: conditionVal || 'light',
      condition_notes: `Priority: ${priority}`,
      services: selectedServicesList,
      addons: selectedAddons,
      total_price: finalTotal,
      preferred_date: preferredDate,
      preferred_time: selSlot || '8:00 AM',
    })

    setIsSubmitting(false)
    if (error) {
      setSubmitError(error)
    } else {
      if (reference) setBookingRef(reference)
      setSubmitted(true)
      setStep(4)
      scrollToElement('booking')
    }
  }

  const toggleTier = (id: ServiceTier) => {
    setSelTiers(prev => {
      const next = new Set(prev)
      next.has(id) ? next.delete(id) : next.add(id)
      return next
    })
  }

  const toggleAddOn = (id: string) => {
    setSelAddOns(prev => {
      const next = new Set(prev)
      next.has(id) ? next.delete(id) : next.add(id)
      return next
    })
  }

  // Calendar Helpers for June/July 2026
  const getMonthDays = (year: number, monthIndex: number) => {
    const date = new Date(year, monthIndex, 1)
    const days: Date[] = []
    while (date.getMonth() === monthIndex) {
      days.push(new Date(date))
      date.setDate(date.getDate() + 1)
    }
    return days
  }

  const isPast = (date: Date) => {
    const d = new Date(date.getFullYear(), date.getMonth(), date.getDate())
    const today = new Date()
    today.setHours(0, 0, 0, 0)
    return d < today
  }

  const isSunday = (date: Date) => {
    return date.getDay() === 0
  }

  const isDateFullyBooked = (date: Date) => {
    const yyyy = date.getFullYear()
    const mm = String(date.getMonth() + 1).padStart(2, '0')
    const dd = String(date.getDate()).padStart(2, '0')
    const dateStr = `${yyyy}-${mm}-${dd}`
    const bookedForDate = existingBookings.filter(b => b.booking_date === dateStr)
    return bookedForDate.length >= SLOTS.length
  }

  const isSlotBooked = (date: Date, slotLabel: string) => {
    const yyyy = date.getFullYear()
    const mm = String(date.getMonth() + 1).padStart(2, '0')
    const dd = String(date.getDate()).padStart(2, '0')
    const dateStr = `${yyyy}-${mm}-${dd}`
    const time24 = SLOT_MAP[slotLabel]
    return existingBookings.some(b => b.booking_date === dateStr && b.time_slot === time24)
  }

  const isSelected = (date: Date) => {
    if (!selDate) return false
    return (
      date.getFullYear() === selDate.getFullYear() &&
      date.getMonth() === selDate.getMonth() &&
      date.getDate() === selDate.getDate()
    )
  }

  return (
    <LazyMotion features={domAnimation}>
      <div id="booking" className="relative bg-dp-bg border-t border-dp-border">
        {/* Visual Header */}
        <section className="relative min-h-[35vh] flex items-end pb-12 px-[var(--dp-pad-x)] overflow-hidden">
          <AtmosphericBackground variant="showroom" intensity={0.85} />
          <div className="relative z-10 max-w-[var(--dp-max-w)] mx-auto w-full">
            <m.div initial={{ opacity: 0, y: 16 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={springs.responsive}>
              <Eyebrow className="mb-5">Booking Scheduler</Eyebrow>
            </m.div>
            <SplitTextReveal text="Reserve your slot." as="h2" onMount={false} delay={0.1}
              className="font-display font-light text-section text-dp-text block mb-2" />
            <SplitTextReveal text="We'll handle the rest." as="h2" onMount={false} delay={0.25}
              className="font-display italic font-light text-section text-dp-text-warm block" />
          </div>
        </section>

        <Section className="bg-dp-bg" noTopPad>
          <SectionInner>
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">

              {/* Wizard Content Column (occupies 2/3) */}
              <div className="lg:col-span-2">

                {/* Step indicator */}
                <m.div className="flex items-center gap-0 mb-10" initial={{ opacity: 0 }} whileInView={{ opacity: 1 }} viewport={{ once: true }} transition={{ delay: 0.3 }}>
                  {[1,2,3].map((s, i) => (
                    <div key={s} className="flex items-center">
                      <div className={`relative flex items-center justify-center w-8 h-8 border transition-all duration-300 ${
                        step >= s ? 'border-[var(--dp-gold)] bg-[rgba(201,168,76,0.1)] text-dp-gold' : 'border-[var(--dp-border)] text-dp-text-muted'
                      }`}>
                        {step > s
                          ? <span>✓</span>
                          : <span className="font-sans text-xs">{s}</span>
                        }
                        {step === s && (
                          <m.div className="absolute inset-0 border border-[var(--dp-gold)]"
                            animate={{ opacity: [0.4, 1, 0.4] }}
                            transition={{ duration: 2, repeat: Infinity }}
                          />
                        )}
                      </div>
                      {i < 2 && (
                        <m.div
                          className="h-px w-16 transition-colors duration-500"
                          style={{ background: step > s+1 ? 'var(--dp-gold)' : step > s ? 'rgba(201,168,76,0.4)' : 'var(--dp-border)' }}
                        />
                      )}
                    </div>
                  ))}
                  <span className="ml-4 font-sans font-light text-xs text-dp-text-muted">
                    {['Choose services', 'Pick a date', 'Your details'][Math.min(step-1, 2)]}
                  </span>
                </m.div>

                {/* Wizard Steps */}
                <AnimatePresence mode="wait">

                  {step === 1 && (
                    <m.div key="s1" initial={{ opacity:0,x:30 }} animate={{ opacity:1,x:0 }} exit={{ opacity:0,x:-30 }} transition={springs.responsive}>
                      <h3 className="font-display font-light text-[28px] text-dp-text mb-6">Choose your services</h3>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        {SERVICES.map(s => {
                          const isSelected = selTiers.has(s.id)
                          return (
                            <button
                              key={s.id}
                              onClick={() => toggleTier(s.id)}
                              className={`relative text-left border p-5 transition-all duration-300 bg-transparent flex flex-col justify-between ${
                                isSelected ? 'border-[var(--dp-border-gold)] bg-dp-gold/5' : 'border-[var(--dp-border)] hover:border-[var(--dp-border-hover)]'
                              }`}
                              data-cursor="hover"
                            >
                              <div>
                                <p className="font-sans font-normal text-[9px] tracking-widest uppercase text-dp-gold mb-1">
                                  {s.badge ?? `Tier`}
                                </p>
                                <p className="font-display font-light text-xl text-dp-text">{s.name}</p>
                                <p className="font-sans font-light text-[11px] text-dp-text-muted mt-2 leading-relaxed">
                                  {s.description}
                                </p>
                              </div>
                              <div className="flex items-center justify-between border-t border-dp-border/50 pt-4 mt-4 w-full">
                                <span className="font-sans font-light text-xs text-dp-text-muted">{s.duration}</span>
                                <span className={`font-sans font-normal text-sm ${isSelected ? 'text-dp-gold' : 'text-dp-text'}`}>
                                  ${s.price}
                                </span>
                              </div>
                            </button>
                          )
                        })}
                      </div>

                      {/* Add-ons nested block */}
                      <div className="mt-8 pt-6 border-t border-dp-border">
                        <p className="font-sans font-normal text-xs tracking-widest text-dp-text-muted mb-4 uppercase">
                          Enhance your schedule with Add-ons
                        </p>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                          {ADD_ONS.map(a => {
                            const isSelected = selAddOns.has(a.id)
                            return (
                              <button
                                key={a.id}
                                onClick={() => toggleAddOn(a.id)}
                                className={`text-left border px-4 py-3 transition-all duration-200 bg-transparent flex justify-between items-center ${
                                  isSelected ? 'border-dp-gold bg-dp-gold/5' : 'border-dp-border hover:border-dp-border-hover'
                                }`}
                                data-cursor="hover"
                              >
                                <span className="font-sans font-light text-xs text-dp-text">{a.name}</span>
                                <span className="font-sans font-normal text-xs text-dp-gold">+${a.price}</span>
                              </button>
                            )
                          })}
                        </div>
                      </div>

                      <m.div className="mt-8" animate={{ opacity: canProceed1 ? 1 : 0.4 }}>
                        <PrimaryButton as="button" onClick={() => {
                          if (canProceed1) {
                            setStep(2);
                            scrollToElement('booking');
                          }
                        }} className="w-full justify-center" data-cursor="cta">
                          Continue — select date <ArrowRight />
                        </PrimaryButton>
                      </m.div>
                    </m.div>
                  )}

                  {step === 2 && (
                    <m.div key="s2" initial={{ opacity:0,x:30 }} animate={{ opacity:1,x:0 }} exit={{ opacity:0,x:-30 }} transition={springs.responsive}>
                      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
                        <h3 className="font-display font-light text-[28px] text-dp-text">Pick your date</h3>
                        
                        {/* Month Selector Switcher */}
                        <div className="flex items-center gap-2 border border-dp-border p-1 bg-dp-surface/50">
                          <button
                            type="button"
                            disabled={selectedMonth === m1}
                            onClick={() => { setSelectedMonth(m1); setSelectedYear(y1); setSelDate(null); setSelSlot(null); }}
                            className={`px-3 py-1 text-xs font-sans tracking-widest uppercase transition-all duration-200 cursor-pointer ${
                              selectedMonth === m1
                                ? 'bg-dp-gold text-dp-bg font-normal'
                                : 'text-dp-text-muted hover:text-dp-text disabled:opacity-35 disabled:cursor-not-allowed'
                            }`}
                          >
                            {m1Label}
                          </button>
                          <button
                            type="button"
                            disabled={selectedMonth === m2}
                            onClick={() => { setSelectedMonth(m2); setSelectedYear(y2); setSelDate(null); setSelSlot(null); }}
                            className={`px-3 py-1 text-xs font-sans tracking-widest uppercase transition-all duration-200 cursor-pointer ${
                              selectedMonth === m2
                                ? 'bg-dp-gold text-dp-bg font-normal'
                                : 'text-dp-text-muted hover:text-dp-text disabled:opacity-35 disabled:cursor-not-allowed'
                            }`}
                          >
                            {m2Label}
                          </button>
                        </div>
                      </div>

                      {/* Calendar Grid Container */}
                      <div className="border border-dp-border p-4 bg-dp-surface/20 mb-6">
                        <p className="text-center font-display font-light text-xl text-dp-text-warm mb-4 tracking-[0.06em]">
                          {selectedMonth === m1 ? `${m1Label} ${y1}` : `${m2Label} ${y2}`}
                        </p>

                        <div className="grid grid-cols-7 gap-1 text-center mb-2">
                          {['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'].map(w => (
                            <span key={w} className="font-sans font-normal text-[10px] tracking-wider uppercase text-dp-text-subtle py-1">
                              {w}
                            </span>
                          ))}
                        </div>

                        <div className="grid grid-cols-7 gap-1.5">
                          {Array.from({
                            length: (new Date(selectedYear, selectedMonth, 1).getDay() + 6) % 7
                          }).map((_, i) => (
                            <div key={`empty-${i}`} className="bg-transparent h-12" />
                          ))}

                          {getMonthDays(selectedYear, selectedMonth).map(day => {
                            const unavail = isPast(day) || isSunday(day) || isDateFullyBooked(day)
                            const sel = isSelected(day)
                            
                            let statusText = ''
                            if (isSunday(day)) statusText = 'Closed'
                            else if (isDateFullyBooked(day)) statusText = 'Booked'

                            return (
                              <button
                                key={day.toISOString()}
                                type="button"
                                disabled={unavail}
                                onClick={() => setSelDate(day)}
                                className={`h-12 border flex flex-col items-center justify-center relative transition-all duration-200 rounded-none bg-transparent ${
                                  unavail
                                    ? 'border-dp-border/40 opacity-25 cursor-not-allowed'
                                    : sel
                                    ? 'border-dp-border-gold bg-dp-gold/10 text-dp-gold shadow-gold-sm'
                                    : 'border-dp-border hover:border-dp-border-hover hover:bg-white/5 text-dp-text'
                                }`}
                                data-cursor={unavail ? 'default' : 'hover'}
                              >
                                <span className={`font-sans text-xs ${sel ? 'text-dp-gold font-normal' : 'font-light'}`}>
                                  {day.getDate()}
                                </span>
                                {statusText && (
                                  <span className="font-sans text-[7px] text-dp-text-subtle tracking-normal mt-0.5 block">
                                    {statusText}
                                  </span>
                                )}
                              </button>
                            )
                          })}
                        </div>
                      </div>

                      {selDate !== null && (
                        <m.div initial={{ opacity:0,y:10 }} animate={{ opacity:1,y:0 }} className="mb-6">
                          <p className="font-sans text-xs tracking-wider uppercase text-dp-text-muted mb-3">
                            Available times for {selDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                          </p>
                          <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                            {SLOTS.map(slot => {
                              const booked = isSlotBooked(selDate, slot)
                              return (
                                <button
                                  key={slot}
                                  type="button"
                                  disabled={booked}
                                  onClick={() => setSelSlot(slot)}
                                  data-cursor={booked ? 'default' : 'hover'}
                                  className={`border px-4 py-2.5 text-xs font-sans font-light transition-all duration-200 bg-transparent rounded-none ${
                                    booked
                                      ? 'border-dp-border/20 opacity-25 cursor-not-allowed text-dp-text-subtle'
                                      : selSlot === slot
                                      ? 'border-[var(--dp-gold)] text-dp-gold bg-dp-gold/5 shadow-gold-sm'
                                      : 'border-[var(--dp-border)] text-dp-text-muted hover:border-[var(--dp-border-hover)] hover:text-dp-text'
                                  }`}
                                >
                                  {slot} {booked ? '(Booked)' : ''}
                                </button>
                              )
                            })}
                          </div>
                        </m.div>
                      )}

                      <div className="flex gap-3">
                        <button onClick={() => { setStep(1); scrollToElement('booking'); }} type="button" className="border border-[var(--dp-border)] px-6 py-3 font-sans text-xs uppercase tracking-wider text-dp-text-muted hover:text-dp-text hover:border-[var(--dp-border-hover)] transition-colors bg-transparent cursor-pointer rounded-none" data-cursor="hover">
                          Back
                        </button>
                        <m.div className="flex-1" animate={{ opacity: canProceed2 ? 1 : 0.4 }}>
                          <PrimaryButton as="button" onClick={() => {
                            if (canProceed2) {
                              setStep(3);
                              scrollToElement('booking');
                            }
                          }} className="w-full justify-center" data-cursor="cta">
                            Continue — your details <ArrowRight />
                          </PrimaryButton>
                        </m.div>
                      </div>
                    </m.div>
                  )}

                  {step === 3 && (
                    <m.div key="s3" initial={{ opacity:0,x:30 }} animate={{ opacity:1,x:0 }} exit={{ opacity:0,x:-30 }} transition={springs.responsive}>
                      <h3 className="font-display font-light text-[28px] text-dp-text mb-6">Your details</h3>
                      <div className="flex flex-col gap-4">
                        {[
                          { label: 'Full name', value: name, set: setName, placeholder: 'James Mitchell', type: 'text' },
                          { label: 'Email address', value: email, set: setEmail, placeholder: 'james@example.com', type: 'email' },
                          { label: 'Phone number', value: phone, set: setPhone, placeholder: '+1 (555) 000-0000', type: 'tel' },
                          { label: 'Vehicle (make, model, year)', value: vehicleString, set: setVehicleString, placeholder: 'BMW M3 Competition, 2023', type: 'text' },
                        ].map(f => (
                          <div key={f.label}>
                            <label className="block font-sans font-normal text-[10px] tracking-wider uppercase text-dp-text-muted mb-2">{f.label}</label>
                            <input
                              type={f.type} value={f.value} onChange={e => f.set(e.target.value)}
                              placeholder={f.placeholder}
                              data-cursor="hide"
                              className="w-full border border-[var(--dp-border)] bg-[var(--dp-surface)] text-dp-text font-sans font-light text-sm px-4 py-3 focus:outline-none focus:border-[var(--dp-gold)] transition-colors placeholder:text-dp-text-subtle rounded-none"
                            />
                          </div>
                        ))}
                      </div>

                      {/* Detailing Priority Selector */}
                      <div className="mt-8 pt-6 border-t border-dp-border">
                        <label className="block font-sans font-normal text-[10px] tracking-wider uppercase text-dp-text-muted mb-4">
                          Detailing Priority Level
                        </label>
                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                          {[
                            {
                              id: 'standard',
                              name: 'Standard Queue',
                              price: 0,
                              delay: '1–2 days queue',
                              desc: 'Standard intake. Thorough preparation & inspection.',
                            },
                            {
                              id: 'express',
                              name: 'Express Queue',
                              price: 50,
                              delay: 'Same-day turnaround',
                              desc: 'Front-of-line bay placement. Vehicle ready by sunset.',
                            },
                            {
                              id: 'vip',
                              name: 'Concours VIP',
                              price: 150,
                              delay: 'Immediate service bay',
                              desc: 'Dedicated lead detailer. Live photographic progress updates.',
                            },
                          ].map(p => {
                            const isSel = priority === p.id
                            return (
                              <button
                                key={p.id}
                                type="button"
                                onClick={() => setPriority(p.id as any)}
                                className={`text-left p-4 border transition-all duration-300 bg-transparent flex flex-col justify-between h-40 rounded-none ${
                                  isSel
                                    ? 'border-dp-border-gold bg-dp-gold/5 shadow-gold-sm'
                                    : 'border-dp-border hover:border-dp-border-hover'
                                }`}
                                data-cursor="hover"
                              >
                                <div>
                                  <div className="flex justify-between items-start mb-1">
                                    <span className="font-sans font-normal text-xs text-dp-text">{p.name}</span>
                                    <span className={`font-sans font-normal text-xs ${isSel ? 'text-dp-gold' : 'text-dp-text-muted'}`}>
                                      {p.price === 0 ? 'Free' : `+$${p.price}`}
                                    </span>
                                  </div>
                                  <span className="font-sans font-light text-[9px] tracking-wider text-dp-gold uppercase block mb-2">
                                    {p.delay}
                                  </span>
                                  <p className="font-sans font-light text-[11px] text-dp-text-muted leading-snug">
                                    {p.desc}
                                  </p>
                                </div>
                              </button>
                            )
                          })}
                        </div>
                      </div>

                      <div className="flex gap-3 mt-8 flex-col sm:flex-row">
                        <button disabled={isSubmitting} onClick={() => { setStep(2); scrollToElement('booking'); }} type="button" className="border border-[var(--dp-border)] px-6 py-3 font-sans text-xs uppercase tracking-wider text-dp-text-muted hover:text-dp-text hover:border-[var(--dp-border-hover)] transition-colors bg-transparent cursor-pointer rounded-none disabled:opacity-50" data-cursor="hover">
                          Back
                        </button>
                        <m.div className="flex-1" animate={{ opacity: canProceed3 && !isSubmitting ? 1 : 0.4 }}>
                          <PrimaryButton as="button" disabled={!canProceed3 || isSubmitting} onClick={() => canProceed3 && !isSubmitting && handleSubmit()} className="w-full justify-center" data-cursor="cta">
                            {isSubmitting ? 'Scheduling...' : 'Confirm booking'} <ArrowRight />
                          </PrimaryButton>
                        </m.div>
                      </div>
                      {submitError && (
                        <p className="text-red-400 font-sans font-light text-xs mt-3 text-center">{submitError}</p>
                      )}
                    </m.div>
                  )}

                  {step === 4 && (
                    <m.div key="s4" initial={{ opacity:0,scale:0.96 }} animate={{ opacity:1,scale:1 }} transition={springs.gentle}
                      className="text-center py-12">
                      <m.div className={`w-16 h-16 border rounded-none flex items-center justify-center mx-auto mb-8 shadow-gold-sm ${
                        liveStatus === 'confirmed' ? 'border-emerald-500 text-emerald-400 shadow-emerald-sm' :
                        (liveStatus === 'in-progress' || liveStatus === 'in_progress') ? 'border-blue-500 text-blue-400 shadow-blue-sm' :
                        liveStatus === 'completed' ? 'border-dp-gold text-dp-gold shadow-gold-sm' :
                        liveStatus === 'cancelled' ? 'border-red-500 text-red-500 shadow-red-sm' :
                        'border-[var(--dp-gold)] text-dp-gold'
                      }`}
                        animate={{ 
                          boxShadow: liveStatus === 'confirmed' 
                            ? ['0 0 16px rgba(16,185,129,0.25)', '0 0 32px rgba(16,185,129,0.5)', '0 0 16px rgba(16,185,129,0.25)']
                            : liveStatus === 'cancelled'
                            ? ['0 0 16px rgba(239,68,68,0.25)', '0 0 32px rgba(239,68,68,0.5)', '0 0 16px rgba(239,68,68,0.25)']
                            : (liveStatus === 'in-progress' || liveStatus === 'in_progress')
                            ? ['0 0 16px rgba(59,130,246,0.25)', '0 0 32px rgba(59,130,246,0.5)', '0 0 16px rgba(59,130,246,0.25)']
                            : ['0 0 16px rgba(201,168,76,0.25)', '0 0 32px rgba(201,168,76,0.5)', '0 0 16px rgba(201,168,76,0.25)'],
                          scale: [1, 1.05, 1]
                        }}
                        transition={{ duration: 2, repeat: Infinity }}
                      >
                        <span className="text-2xl">
                          {liveStatus === 'confirmed' ? '✓' :
                           liveStatus === 'cancelled' ? '✕' :
                           (liveStatus === 'in-progress' || liveStatus === 'in_progress') ? '⏳' :
                           liveStatus === 'completed' ? '✨' : '✓'}
                        </span>
                      </m.div>

                      {liveStatus === 'pending' && (
                        <>
                          <h3 className="font-display font-light text-[32px] text-dp-text mb-3">Booking Awaited</h3>
                          <p className="font-sans font-light text-sm text-dp-text-muted mb-6 max-w-[440px] mx-auto leading-relaxed">
                            Thank you, {name.split(' ')[0]}. We have received your booking request.
                            Our team will review your slot and send a confirmation email once confirmed.
                          </p>
                        </>
                      )}
                      {liveStatus === 'confirmed' && (
                        <>
                          <h3 className="font-display font-light text-[32px] text-emerald-400 mb-3">Booking Confirmed!</h3>
                          <p className="font-sans font-light text-sm text-dp-text-muted mb-6 max-w-[440px] mx-auto leading-relaxed">
                            Fantastic news, {name.split(' ')[0]}! Your booking is officially <strong>Confirmed</strong>.
                            We've sent a status confirmation email to your address.
                          </p>
                        </>
                      )}
                      {(liveStatus === 'in-progress' || liveStatus === 'in_progress') && (
                        <>
                          <h3 className="font-display font-light text-[32px] text-blue-400 mb-3">Detailing In Progress</h3>
                          <p className="font-sans font-light text-sm text-dp-text-muted mb-6 max-w-[440px] mx-auto leading-relaxed">
                            Our team is currently detailing your vehicle to showroom standards.
                            Sit back and relax!
                          </p>
                        </>
                      )}
                      {liveStatus === 'completed' && (
                        <>
                          <h3 className="font-display font-light text-[32px] text-dp-gold mb-3">Detailing Completed</h3>
                          <p className="font-sans font-light text-sm text-dp-text-muted mb-6 max-w-[440px] mx-auto leading-relaxed">
                            Your vehicle detailing is complete! Your car is looking stunning and is ready for pickup.
                          </p>
                        </>
                      )}
                      {liveStatus === 'cancelled' && (
                        <>
                          <h3 className="font-display font-light text-[32px] text-red-500 mb-3">Booking Cancelled</h3>
                          <p className="font-sans font-light text-sm text-dp-text-muted mb-6 max-w-[440px] mx-auto leading-relaxed">
                            This booking has been cancelled. Please contact us if you need to reschedule or have questions.
                          </p>
                        </>
                      )}

                      {/* Summary inside Confirmation */}
                      <div className="border border-[var(--dp-border-gold-dim)] px-8 py-6 mb-8 max-w-[480px] mx-auto bg-dp-surface/40 text-left space-y-4">
                        <div className="flex justify-between items-baseline border-b border-dp-border pb-2">
                          <span className="font-sans text-[10px] tracking-wider uppercase text-dp-text-muted">Appointment Details</span>
                          <span className="font-sans text-[11px] font-normal text-dp-gold">
                            {priority === 'standard' ? 'Standard' : priority === 'express' ? 'Express' : 'Concours VIP'}
                          </span>
                        </div>
                        <div className="grid grid-cols-2 gap-4 text-xs font-sans">
                          <div>
                            <p className="text-dp-text-muted mb-0.5">📅 Scheduled Date</p>
                            <p className="text-dp-text font-normal">
                              {selDate ? selDate.toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' }) : ''}
                            </p>
                          </div>
                          <div>
                            <p className="text-dp-text-muted mb-0.5">🕒 Allocated Slot</p>
                            <p className="text-dp-text font-normal">{selSlot}</p>
                          </div>
                          <div>
                            <p className="text-dp-text-muted mb-0.5">🚗 Registered Vehicle</p>
                            <p className="text-dp-text font-normal truncate">{vehicleString}</p>
                          </div>
                          <div>
                            <p className="text-dp-text-muted mb-0.5">💰 Final Amount</p>
                            <p className="text-dp-text font-normal">${finalTotal}</p>
                          </div>
                        </div>
                        <div className="border-t border-dp-border pt-4 text-center">
                          <p className="font-sans font-normal text-[9px] tracking-widest uppercase text-dp-gold mb-1">Booking Reference</p>
                          <p className="font-sans font-light text-2xl text-dp-text tracking-wider">
                            {bookingRef || 'DP-XXXXXX'}
                          </p>
                        </div>
                      </div>
                    </m.div>
                  )}

                </AnimatePresence>
              </div>

              {/* Booking Sidebar / Direct contacts (occupies 1/3) */}
              <div className="space-y-6">

                {/* 1. Dynamic Booking summary card */}
                {selTiers.size > 0 && step < 4 && (
                  <m.div
                    className="border border-[var(--dp-border-gold-dim)] bg-dp-surface p-6 shadow-gold-sm space-y-4"
                    initial={{ opacity: 0, y: 15 }}
                    animate={{ opacity: 1, y: 0 }}
                  >
                    <p className="font-sans font-normal text-[9px] tracking-widest uppercase text-dp-gold">
                      Your Configuration
                    </p>
                    <div className="space-y-2 text-xs font-sans">
                      {SERVICES.filter(s => selTiers.has(s.id)).map(s => (
                        <div key={s.id} className="flex justify-between items-baseline">
                          <span className="text-dp-text font-light">{s.name}</span>
                          <span className="text-dp-text-muted">${s.price}</span>
                        </div>
                      ))}
                      {selAddOns.size > 0 && (
                        <div className="pt-2 border-t border-dp-border/40 space-y-1.5">
                          {ADD_ONS.filter(a => selAddOns.has(a.id)).map(a => (
                            <div key={a.id} className="flex justify-between items-baseline text-[11px]">
                              <span className="text-dp-text-muted">{a.name}</span>
                              <span className="text-dp-text-subtle">+${a.price}</span>
                            </div>
                          ))}
                        </div>
                      )}
                      {priority !== 'standard' && (
                        <div className="pt-2 border-t border-dp-border/40 flex justify-between items-baseline text-[11px]">
                          <span className="text-dp-text-muted">
                            {priority === 'express' ? 'Express Priority' : 'Concours VIP Priority'}
                          </span>
                          <span className="text-dp-text-subtle">+${priorityPrice}</span>
                        </div>
                      )}
                      
                      <div className="pt-3 border-t border-dp-border/60 flex justify-between items-baseline">
                        <span className="text-dp-gold font-normal">Est. Total:</span>
                        <span className="text-lg text-dp-text font-normal">${finalTotal}</span>
                      </div>
                      
                      {selDate !== null && (
                        <div className="pt-3 border-t border-dp-border/60 text-[11px] text-dp-text-muted space-y-1">
                          <div>📅 Date: {selDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}</div>
                          {selSlot && <div>🕒 Time: {selSlot}</div>}
                        </div>
                      )}
                    </div>
                  </m.div>
                )}

                {/* 2. Direct Contact cards */}
                <div className="space-y-3">
                  <p className="font-sans font-normal text-[9px] tracking-widest uppercase text-dp-gold">
                    Or reach us directly
                  </p>

                  {[
                    { label: 'Phone Call', value: '+1 (587) 973-4256', href: 'tel:+15879734256', note: 'Mon–Sat, 8am–6pm' },
                    { label: 'WhatsApp', value: 'Message us', href: 'https://wa.me/15879734256', note: 'Fastest response' },
                    { label: 'Email Support', value: 'ashishphalswal2003@gmail.com', href: 'mailto:ashishphalswal2003@gmail.com', note: 'Reply within 2hrs' },
                  ].map(c => (
                    <TiltCard key={c.label} goldAccent maxTilt={3} className="border border-[var(--dp-border)] bg-dp-surface/40 p-5" data-cursor="hover">
                      <p className="font-sans font-normal text-[8px] tracking-widest uppercase text-dp-gold mb-1">{c.label}</p>
                      <a href={c.href}
                        className="font-sans font-light text-sm text-dp-text hover:text-dp-gold transition-colors no-underline block mb-1">
                        {c.value}
                      </a>
                      <p className="font-sans font-light text-xs text-dp-text-muted">{c.note}</p>
                    </TiltCard>
                  ))}

                  <div className="border border-[var(--dp-border)] bg-dp-surface/40 p-5">
                    <p className="font-sans font-normal text-[8px] tracking-widest uppercase text-dp-gold mb-3">Operating Hours</p>
                    {[['Monday – Saturday','8:00am – 6:00pm'],['Sunday','Closed']].map(([d,h]) => (
                      <div key={d} className="flex justify-between items-baseline py-1.5 border-b border-[var(--dp-border)] last:border-0 text-[11px]">
                        <span className="font-sans font-light text-dp-text-muted">{d}</span>
                        <span className="font-sans font-light text-dp-text">{h}</span>
                      </div>
                    ))}
                  </div>
                </div>

              </div>

            </div>
          </SectionInner>
        </Section>
      </div>
    </LazyMotion>
  )
}
