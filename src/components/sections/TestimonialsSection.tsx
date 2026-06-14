import { useState, useEffect, useRef, useCallback } from 'react'
import { m, LazyMotion, domAnimation, AnimatePresence } from 'framer-motion'
import { clsx } from 'clsx'
import {
  staggerContainer, fadeUp,
  Section, SectionInner, Eyebrow, SectionHeadline
} from '@/design-system'
import { TESTIMONIALS } from '@/data'
import { useTestimonials } from '@/hooks/useBackend'

const PLATFORMS = [
  { name: 'Google Reviews', rating: '4.9', count: '142', url: '#' },
  { name: 'Trustpilot Trust', rating: '5.0', count: '89',  url: '#' },
  { name: 'Facebook Rating',  rating: '5.0', count: '67',  url: '#' },
]

export function TestimonialsSection() {
  const { testimonials: dbTestimonials } = useTestimonials()
  
  const dbItems = (dbTestimonials || []).map(t => ({
    id:      t.id,
    quote:   t.text,
    author:  t.author,
    vehicle: t.vehicle,
    rating:  t.rating,
    date:    t.created_at ? new Date(t.created_at).toLocaleDateString('en-US', { month: 'long', year: 'numeric' }) : '',
  }))

  const testimonials = dbItems.length > 0 ? dbItems : TESTIMONIALS

  const [index, setIndex] = useState(0)
  const [direction, setDirection] = useState(0) // -1 for left, 1 for right
  const [isHovered, setIsHovered] = useState(false)
  const autoPlayRef = useRef<number | null>(null)

  // Carousel cycle logic
  const handleNext = useCallback(() => {
    setDirection(1)
    setIndex(prev => (prev + 1) % testimonials.length)
  }, [testimonials])

  const handlePrev = useCallback(() => {
    setDirection(-1)
    setIndex(prev => (prev - 1 + testimonials.length) % testimonials.length)
  }, [testimonials])

  // Auto-play timer
  useEffect(() => {
    if (isHovered) {
      if (autoPlayRef.current) clearInterval(autoPlayRef.current)
      return
    }
    autoPlayRef.current = setInterval(handleNext, 6000) as unknown as number
    return () => {
      if (autoPlayRef.current) clearInterval(autoPlayRef.current)
    }
  }, [isHovered, handleNext])

  // Reset index if it becomes out of range of dynamic testimonials list
  useEffect(() => {
    if (index >= testimonials.length) {
      setIndex(0)
    }
  }, [testimonials, index])

  // Slide animation variants
  const slideVariants = {
    enter: (dir: number) => ({
      x: dir > 0 ? 80 : -80,
      opacity: 0,
    }),
    center: {
      x: 0,
      opacity: 1,
    },
    exit: (dir: number) => ({
      x: dir > 0 ? -80 : 80,
      opacity: 0,
    }),
  }

  const currentTestimonial = testimonials[index]

  return (
    <LazyMotion features={domAnimation}>
      <Section id="testimonials" className="bg-dp-surface relative overflow-hidden">
        
        {/* Subtle Ambient Showroom Spotlights */}
        <div 
          className="absolute top-10 left-10 w-96 h-96 rounded-full opacity-20 blur-[120px] pointer-events-none" 
          style={{ background: 'radial-gradient(circle, var(--dp-violet) 0%, transparent 70%)' }}
          aria-hidden="true"
        />
        <div 
          className="absolute bottom-10 right-10 w-96 h-96 rounded-full opacity-15 blur-[120px] pointer-events-none" 
          style={{ background: 'radial-gradient(circle, var(--dp-yellow) 0%, transparent 70%)' }}
          aria-hidden="true"
        />

        <SectionInner>
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-12 items-center">
            
            {/* 1. Left Column: Stats & Platform Aggregates */}
            <m.div
              className="lg:col-span-1 space-y-8 relative z-10"
              variants={staggerContainer(0.08)}
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true, margin: '-80px' }}
            >
              <div>
                <m.div variants={fadeUp} className="flex">
                  <Eyebrow className="mb-4 text-dp-violet-light">Testimonials</Eyebrow>
                </m.div>
                <m.div variants={fadeUp}>
                  <SectionHeadline className="text-left">
                    Pals for <em>Life</em>
                  </SectionHeadline>
                </m.div>
              </div>

              {/* Total Aggregate Score Card */}
              <m.div 
                variants={fadeUp}
                className="p-6 border border-dp-border bg-dp-bg/40 backdrop-blur-md relative overflow-hidden group hover:border-dp-violet/40 transition-colors duration-500"
              >
                {/* Glow bar */}
                <div className="absolute top-0 left-0 w-full h-[2px] bg-gradient-to-r from-dp-violet via-dp-gold to-dp-yellow opacity-70" />
                
                <div className="flex items-center gap-5">
                  <span 
                    className="font-display font-light text-5xl leading-none text-transparent bg-clip-text bg-gradient-to-r from-dp-yellow via-dp-gold to-dp-yellow-light drop-shadow-yellow-md select-none"
                    style={{ textShadow: '0 0 16px rgba(251,191,36,0.3)' }}
                  >
                    4.9
                  </span>
                  <div>
                    <div className="flex items-center gap-[2px] text-xs text-dp-yellow">
                      {Array.from({ length: 5 }).map((_, i) => (
                        <span key={i}>★</span>
                      ))}
                    </div>
                    <span className="font-sans font-light text-xs text-dp-text-muted mt-1 block">
                      Average rating based on 290+ reviews
                    </span>
                  </div>
                </div>
              </m.div>

              {/* Platform Trust Badges (Stacked) */}
              <m.div variants={fadeUp} className="flex flex-col gap-3">
                {PLATFORMS.map(p => (
                  <div 
                    key={p.name}
                    className="flex justify-between items-center p-3 border border-dp-border/60 hover:border-dp-violet/60 bg-dp-bg/30 backdrop-blur-sm transition-all duration-300 group hover:shadow-violet-sm"
                  >
                    <div className="flex flex-col">
                      <span className="font-sans font-normal text-[9px] tracking-widest text-dp-text-muted uppercase group-hover:text-dp-violet-light transition-colors duration-300">
                        {p.name}
                      </span>
                      <span className="font-sans font-light text-[10px] text-dp-text-subtle mt-0.5">
                        {p.count} verified reviews
                      </span>
                    </div>
                    <div className="flex items-center gap-1.5 bg-dp-surface/80 px-2.5 py-1 border border-dp-border group-hover:border-dp-yellow/50 transition-colors duration-300">
                      <span className="text-xs font-normal text-dp-text group-hover:text-dp-yellow-light transition-colors duration-300">
                        {p.rating}
                      </span>
                      <span className="text-dp-yellow text-[10px]">★</span>
                    </div>
                  </div>
                ))}
              </m.div>
            </m.div>

            {/* 2. Right Column: Testimonial Carousel */}
            <div className="lg:col-span-2 relative z-10">
              <div
                className="relative border border-dp-border bg-dp-bg/60 backdrop-blur-md p-8 md:p-12 overflow-hidden flex flex-col justify-between min-h-[350px] md:min-h-[310px] shadow-violet-sm"
                onMouseEnter={() => setIsHovered(true)}
                onMouseLeave={() => setIsHovered(false)}
              >
                {/* Ambient spot overlays inside card */}
                <div
                  className="absolute top-0 right-0 w-64 h-64 pointer-events-none opacity-40"
                  style={{
                    background: 'radial-gradient(ellipse at top right, rgba(124,58,237,0.05) 0%, transparent 70%)',
                  }}
                  aria-hidden="true"
                />
                <div
                  className="absolute bottom-0 left-0 w-64 h-64 pointer-events-none opacity-40"
                  style={{
                    background: 'radial-gradient(ellipse at bottom left, rgba(251,191,36,0.04) 0%, transparent 70%)',
                  }}
                  aria-hidden="true"
                />
                
                {/* Double quote watermark */}
                <span
                  className="absolute top-2 left-5 font-display font-light text-[130px] leading-none text-dp-violet pointer-events-none select-none opacity-[0.05]"
                  aria-hidden="true"
                >
                  “
                </span>

                {/* Carousel Core */}
                <div className="relative w-full flex-grow flex items-center">
                  <AnimatePresence initial={false} custom={direction} mode="wait">
                    <m.blockquote
                      key={currentTestimonial.id}
                      custom={direction}
                      variants={slideVariants}
                      initial="enter"
                      animate="center"
                      exit="exit"
                      transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
                      className="w-full flex flex-col justify-between h-full"
                    >
                      <div>
                        {/* Rating Stars */}
                        <div className="flex items-center gap-[3px] text-xs text-dp-yellow mb-5">
                          {Array.from({ length: currentTestimonial.rating }).map((_, i) => (
                            <span key={i} className="animate-glow-breathe drop-shadow-[0_0_4px_rgba(251,191,36,0.6)]">★</span>
                          ))}
                        </div>

                        {/* Quote text */}
                        <p className="font-sans font-light text-base md:text-[17px] italic leading-[1.78] text-dp-text-warm">
                          "{currentTestimonial.quote}"
                        </p>
                      </div>

                      {/* Author */}
                      <footer className="mt-8 border-t border-dp-border/40 pt-4 flex items-baseline justify-between">
                        <div>
                          <cite className="not-italic font-sans font-normal text-xs text-dp-yellow tracking-widest uppercase">
                            {currentTestimonial.author}
                          </cite>
                          <span className="text-dp-text-muted text-xs font-light ml-2">
                            — {currentTestimonial.vehicle}
                          </span>
                        </div>
                        <span className="text-[10px] text-dp-text-subtle font-light uppercase tracking-wider hidden sm:inline-block">
                          {currentTestimonial.date}
                        </span>
                      </footer>
                    </m.blockquote>
                  </AnimatePresence>
                </div>

                {/* Navigation and Indicators Block */}
                <div className="flex items-center gap-6 mt-8 border-t border-dp-border/40 pt-5 justify-between">
                  {/* Previous button */}
                  <button
                    onClick={handlePrev}
                    className="w-10 h-10 border border-dp-border hover:border-dp-violet flex items-center justify-center text-dp-text hover:text-dp-violet-light bg-transparent transition-all duration-300 rounded-none cursor-pointer hover:shadow-violet-sm"
                    aria-label="Previous testimonial"
                    data-cursor="hover"
                  >
                    ←
                  </button>

                  {/* Indicator dots */}
                  <div className="flex items-center gap-2">
                    {testimonials.map((t, idx) => (
                      <button
                        key={t.id}
                        onClick={() => {
                          setDirection(idx > index ? 1 : -1)
                          setIndex(idx)
                        }}
                        className={clsx(
                          'h-1 rounded-full transition-all duration-500 bg-dp-violet',
                          idx === index ? 'w-6 bg-gradient-to-r from-dp-violet to-dp-yellow opacity-100' : 'w-1 opacity-20 hover:opacity-50'
                        )}
                        aria-label={`Go to slide ${idx + 1}`}
                      />
                    ))}
                  </div>

                  {/* Next button */}
                  <button
                    onClick={handleNext}
                    className="w-10 h-10 border border-dp-border hover:border-dp-violet flex items-center justify-center text-dp-text hover:text-dp-violet-light bg-transparent transition-all duration-300 rounded-none cursor-pointer hover:shadow-violet-sm"
                    aria-label="Next testimonial"
                    data-cursor="hover"
                  >
                    →
                  </button>
                </div>

              </div>
            </div>

          </div>
        </SectionInner>
      </Section>
    </LazyMotion>
  )
}
