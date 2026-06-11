import { useState, useEffect, useRef, useCallback } from 'react'
import { m, LazyMotion, domAnimation, AnimatePresence } from 'framer-motion'
import { clsx } from 'clsx'
import {
  staggerContainer, fadeUp, springs,
  Section, SectionInner, Eyebrow, SectionHeadline
} from '@/design-system'
import { TESTIMONIALS } from '@/data'

const PLATFORMS = [
  { name: 'Google Reviews', rating: '4.9', count: '142', url: '#' },
  { name: 'Trustpilot Trust', rating: '5.0', count: '89',  url: '#' },
  { name: 'Facebook Rating',  rating: '5.0', count: '67',  url: '#' },
]

export function TestimonialsSection() {
  const [index, setIndex] = useState(0)
  const [direction, setDirection] = useState(0) // -1 for left, 1 for right
  const [isHovered, setIsHovered] = useState(false)
  const autoPlayRef = useRef<number | null>(null)

  // Carousel cycle logic
  const handleNext = useCallback(() => {
    setDirection(1)
    setIndex(prev => (prev + 1) % TESTIMONIALS.length)
  }, [])

  const handlePrev = useCallback(() => {
    setDirection(-1)
    setIndex(prev => (prev - 1 + TESTIMONIALS.length) % TESTIMONIALS.length)
  }, [])

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

  // Slide animation variants
  const slideVariants = {
    enter: (dir: number) => ({
      x: dir > 0 ? 150 : -150,
      opacity: 0,
    }),
    center: {
      x: 0,
      opacity: 1,
    },
    exit: (dir: number) => ({
      x: dir > 0 ? -150 : 150,
      opacity: 0,
    }),
  }

  const currentTestimonial = TESTIMONIALS[index]

  return (
    <LazyMotion features={domAnimation}>
      <Section id="testimonials" className="bg-dp-surface">
        <SectionInner>

          {/* Section Header */}
          <m.div
            className="mb-14 text-center"
            variants={staggerContainer(0.08)}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: '-80px' }}
          >
            <m.div variants={fadeUp} className="justify-center flex">
              <Eyebrow className="mb-5">Testimonials</Eyebrow>
            </m.div>
            <m.div variants={fadeUp}>
              <SectionHeadline>
                Pals for <em>Life</em>
              </SectionHeadline>
            </m.div>
          </m.div>

          {/* 1. Interactive Testimonial Carousel */}
          <div
            className="relative border border-dp-border bg-dp-bg/60 backdrop-blur-md p-8 md:p-14 mb-16 overflow-hidden flex flex-col items-center justify-center text-center"
            onMouseEnter={() => setIsHovered(true)}
            onMouseLeave={() => setIsHovered(false)}
          >
            {/* Ambient champagne glow */}
            <div
              className="absolute top-0 right-0 w-80 h-80 pointer-events-none opacity-40"
              style={{
                background: 'radial-gradient(ellipse at top right, rgba(201,168,76,0.06) 0%, transparent 70%)',
              }}
              aria-hidden="true"
            />
            
            {/* Double quote watermark */}
            <span
              className="absolute top-4 left-6 font-display font-light text-[140px] leading-none text-dp-gold pointer-events-none select-none opacity-[0.05]"
              aria-hidden="true"
            >
              “
            </span>

            {/* Carousel Core */}
            <div className="relative min-h-[160px] md:min-h-[120px] w-full max-w-[800px] flex items-center justify-center">
              <AnimatePresence initial={false} custom={direction} mode="wait">
                <m.blockquote
                  key={currentTestimonial.id}
                  custom={direction}
                  variants={slideVariants}
                  initial="enter"
                  animate="center"
                  exit="exit"
                  transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
                  className="w-full flex flex-col items-center"
                >
                  {/* Rating Stars */}
                  <div className="flex items-center gap-[3px] text-xs text-dp-gold mb-5">
                    {Array.from({ length: currentTestimonial.rating }).map((_, i) => (
                      <span key={i} className="animate-glow-breathe">★</span>
                    ))}
                  </div>

                  {/* Quote text */}
                  <p className="font-sans font-light text-base md:text-lg italic leading-[1.72] text-dp-text-warm max-w-[700px] mb-6">
                    "{currentTestimonial.quote}"
                  </p>

                  {/* Author */}
                  <footer className="mt-2 text-center">
                    <cite className="not-italic font-sans font-normal text-xs text-dp-gold tracking-widest uppercase">
                      {currentTestimonial.author}
                    </cite>
                    <span className="text-dp-text-muted text-xs font-light ml-2">
                      — {currentTestimonial.vehicle}
                    </span>
                  </footer>
                </m.blockquote>
              </AnimatePresence>
            </div>

            {/* Navigation and Indicators Block */}
            <div className="flex flex-col sm:flex-row items-center gap-6 mt-10 w-full max-w-[800px] justify-between border-t border-dp-border/60 pt-6">
              {/* Previous button */}
              <button
                onClick={handlePrev}
                className="w-10 h-10 border border-dp-border hover:border-dp-gold flex items-center justify-center text-dp-text hover:text-dp-gold bg-transparent transition-all duration-300 rounded-none cursor-pointer"
                aria-label="Previous testimonial"
                data-cursor="hover"
              >
                ←
              </button>

              {/* Indicator dots & pills */}
              <div className="flex items-center gap-2">
                {TESTIMONIALS.map((t, idx) => (
                  <button
                    key={t.id}
                    onClick={() => {
                      setDirection(idx > index ? 1 : -1)
                      setIndex(idx)
                    }}
                    className={clsx(
                      'h-1.5 rounded-full transition-all duration-500 bg-dp-gold',
                      idx === index ? 'w-6 opacity-100' : 'w-1.5 opacity-30 hover:opacity-60'
                    )}
                    aria-label={`Go to slide ${idx + 1}`}
                  />
                ))}
              </div>

              {/* Next button */}
              <button
                onClick={handleNext}
                className="w-10 h-10 border border-dp-border hover:border-dp-gold flex items-center justify-center text-dp-text hover:text-dp-gold bg-transparent transition-all duration-300 rounded-none cursor-pointer"
                aria-label="Next testimonial"
                data-cursor="hover"
              >
                →
              </button>
            </div>
          </div>

          {/* 2. Platform Trust Score Badges */}
          <m.div
            className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-16"
            variants={staggerContainer(0.08)}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: '-60px' }}
          >
            {PLATFORMS.map(p => (
              <m.div
                key={p.name}
                variants={fadeUp}
                className="border border-[var(--dp-border-gold-dim)] bg-dp-bg/40 p-4 flex flex-col justify-center items-center text-center backdrop-blur-sm relative group overflow-hidden"
              >
                {/* Micro amber reflect glow */}
                <div className="absolute inset-0 bg-gradient-to-tr from-transparent via-dp-gold/2 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                <span className="font-sans font-normal text-[9px] tracking-widest text-dp-gold uppercase mb-1">
                  {p.name}
                </span>
                <div className="flex items-baseline gap-2">
                  <span className="font-sans font-light text-2xl text-dp-text">{p.rating}</span>
                  <span className="text-dp-gold text-sm">★</span>
                  <span className="font-sans font-light text-[10px] text-dp-text-muted">({p.count} reviews)</span>
                </div>
              </m.div>
            ))}
          </m.div>

          {/* 3. Wall of Proof Grid */}
          <m.div
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
            variants={staggerContainer(0.06)}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: '-60px' }}
          >
            {TESTIMONIALS.map(t => (
              <m.div key={t.id} variants={fadeUp}>
                <TestimonialCard t={t} />
              </m.div>
            ))}
          </m.div>

        </SectionInner>
      </Section>
    </LazyMotion>
  )
}

// ─── Small grid testimonial card component ───────────────────

function TestimonialCard({ t }: { t: typeof TESTIMONIALS[number] }) {
  const [hovered, setHovered] = useState(false)

  return (
    <div
      className={clsx(
        'group relative border border-dp-border bg-dp-surface/40 p-6 flex flex-col justify-between h-full transition-all duration-500',
        hovered ? 'border-[var(--dp-border-gold-dim)] bg-dp-surface-2/60 scale-[1.02]' : ''
      )}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
    >
      {/* Gold thread - hover sweep line */}
      <m.div
        className="absolute top-0 left-0 h-px bg-dp-gold z-10"
        animate={{ width: hovered ? '100%' : '0%' }}
        transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
        style={{ boxShadow: '0 0 6px rgba(201,168,76,0.4)' }}
        aria-hidden="true"
      />

      {/* Floating subtle ambient light spot inside card */}
      <m.div
        className="absolute inset-0 pointer-events-none"
        animate={{ opacity: hovered ? 1 : 0 }}
        transition={{ duration: 0.4 }}
        style={{
          background: 'radial-gradient(circle at 10% 20%, rgba(201,168,76,0.02) 0%, transparent 60%)',
        }}
        aria-hidden="true"
      />

      <div className="space-y-4">
        {/* Quote mark drop */}
        <span
          className="font-display font-light text-4xl leading-none text-dp-gold block opacity-20"
          aria-hidden="true"
        >
          “
        </span>
        <blockquote className="relative z-10">
          <p className="font-sans font-light text-xs md:text-sm leading-[1.65] text-dp-text-muted">
            "{t.quote}"
          </p>
        </blockquote>
      </div>

      <footer className="border-t border-dp-border/60 pt-4 mt-6 flex items-end justify-between gap-4">
        <div>
          <cite className="not-italic font-sans font-normal text-xs text-dp-text block">
            {t.author}
          </cite>
          <p className="font-sans italic font-light text-[10px] text-dp-text-muted mt-0.5">
            {t.vehicle}
          </p>
        </div>
        <div className="flex flex-col items-end gap-1">
          <div className="flex items-center gap-[2px] text-[8px] text-dp-gold" aria-label="5 stars">
            {Array.from({ length: t.rating }).map((_, i) => (
              <span key={i}>★</span>
            ))}
          </div>
          <span className="text-[9px] text-dp-text-subtle font-light">{t.date}</span>
        </div>
      </footer>
    </div>
  )
}
