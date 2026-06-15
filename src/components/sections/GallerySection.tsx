import { useState, useRef, useCallback, useEffect } from 'react'
import { m, LazyMotion, domAnimation, AnimatePresence } from 'framer-motion'
import { clsx } from 'clsx'
import { Link } from 'react-router-dom'
import {
  staggerContainer, fadeUp, springs,
  Section, SectionInner, Eyebrow, SectionHeadline,
  PrimaryButton, ArrowRight
} from '@/design-system'
import { GALLERY_ITEMS } from '@/data'
import type { GalleryTag, GalleryItem } from '@/types'
import { usePublicGallery } from '@/hooks/useBackend'

const FILTERS: { id: GalleryTag; label: string }[] = [
  { id: 'all',       label: 'All Vehicles' },
  { id: 'sedan',     label: 'Sedans' },
  { id: 'suv',       label: 'SUVs' },
  { id: 'luxury',    label: 'Luxury' },
  { id: 'ceramic',   label: 'Ceramic' },
  { id: 'correction',label: 'Correction' },
]

function parseTagsFromCaption(caption: string, service: string): GalleryTag[] {
  const tags: GalleryTag[] = ['all'];
  const text = (caption + ' ' + service).toLowerCase();
  
  if (text.includes('sedan')) tags.push('sedan');
  if (text.includes('suv') || text.includes('truck')) tags.push('suv');
  if (text.includes('luxury') || text.includes('ghost') || text.includes('porsche') || text.includes('ferrari') || text.includes('rolls')) tags.push('luxury');
  if (text.includes('ceramic') || text.includes('coat')) tags.push('ceramic');
  if (text.includes('correction') || text.includes('polish') || text.includes('swirl') || text.includes('wax')) tags.push('correction');
  
  if (tags.length === 1) {
    tags.push('correction'); // fallback default
  }
  
  return tags;
}

export function GallerySection() {
  const [activeFilter, setActiveFilter] = useState<GalleryTag>('all')
  const { pairs: dbPairs, singles: dbSingles } = usePublicGallery()
  const [selectedItem, setSelectedItem] = useState<GalleryItem | null>(null)

  const dbItems: GalleryItem[] = [
    ...(dbPairs || []).map(p => {
      const service = p.service || 'Premium Detail';
      const captionText = p.caption || p.after?.caption || p.before?.caption || '';
      const vehicleName = captionText.split('—')[0]?.trim() || 'Vehicle Project';
      const tags = parseTagsFromCaption(captionText, service);
      
      return {
        id: p.pair_id,
        beforeUrl: p.before?.url,
        afterUrl: p.after?.url,
        beforeAlt: captionText || `${vehicleName} before detailing`,
        afterAlt: captionText || `${vehicleName} after detailing`,
        service,
        vehicle: vehicleName,
        hours: 6,
        tag: tags,
        sliderInit: 50,
      };
    }),
    ...(dbSingles || []).map(s => {
      const service = s.service_type || 'Premium Detail';
      const captionText = s.caption || '';
      const vehicleName = captionText.split('—')[0]?.trim() || 'Vehicle Project';
      const tags = parseTagsFromCaption(captionText, service);
      
      return {
        id: s.id,
        beforeUrl: s.tag === 'before' ? s.url : undefined,
        afterUrl: s.tag === 'after' ? s.url : undefined,
        beforeAlt: captionText || `${vehicleName} detailing`,
        afterAlt: captionText || `${vehicleName} detailing`,
        service,
        vehicle: vehicleName,
        hours: 3,
        tag: tags,
        sliderInit: 50,
      };
    })
  ];

  const allItems = [...dbItems, ...GALLERY_ITEMS];

  const filtered = activeFilter === 'all'
    ? GALLERY_ITEMS
    : GALLERY_ITEMS.filter(item => item.tag.includes(activeFilter))

  return (
    <LazyMotion features={domAnimation}>
      <Section id="gallery" className="bg-dp-surface">
        <SectionInner>

          {/* Header */}
          <m.div
            className="mb-12 text-center"
            variants={staggerContainer(0.08)}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: '-80px' }}
          >
            <m.div variants={fadeUp} className="justify-center flex"><Eyebrow className="mb-5">Case Studies</Eyebrow></m.div>
            <m.div variants={fadeUp}>
              <SectionHeadline>
                Before. After. <em>The Difference.</em>
              </SectionHeadline>
            </m.div>
            <m.p variants={fadeUp} className="font-sans font-light text-base text-dp-text-muted max-w-[500px] mx-auto mt-5 leading-[1.75]">
              Hover and drag the comparison sliders below to inspect our paint correction quality.
              Click any project card to reveal the complete technical case report.
            </m.p>
          </m.div>

          {/* Filters */}
          <m.div
            className="flex flex-wrap justify-center gap-2 mb-12"
            initial={{ opacity: 0, y: 12 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={springs.responsive}
          >
            {FILTERS.map(f => (
              <button
                key={f.id}
                onClick={() => setActiveFilter(f.id)}
                className={clsx(
                  'font-sans font-normal text-xs tracking-wider uppercase',
                  'px-5 py-2.5 border cursor-pointer bg-transparent',
                  'transition-all duration-300 ease-dp-out rounded-none',
                  activeFilter === f.id
                    ? 'text-dp-gold border-dp-gold bg-dp-gold/5 shadow-gold-sm'
                    : 'text-dp-text-muted border-dp-border hover:border-dp-border-hover hover:text-dp-text'
                )}
              >
                {f.label}
              </button>
            ))}
          </m.div>

          {/* Grid */}
          <m.div
            layout
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
          >
            <AnimatePresence mode="popLayout">
              {filtered.map((item, i) => (
                <m.div
                  key={item.id}
                  layout
                  initial={{ opacity: 0, scale: 0.96 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.94 }}
                  transition={{ ...springs.responsive, delay: i * 0.05 }}
                  onClick={() => setSelectedItem(item)}
                >
                  <GalleryCard item={item} isFirst={i === 0} />
                </m.div>
              ))}
            </AnimatePresence>
          </m.div>

          {/* Live Showroom / Admin Uploads Section */}
          <div className="mt-24 pt-20 border-t border-dp-border/30">
            <div className="mb-12 text-center">
              <div className="justify-center flex">
                <Eyebrow className="mb-5">Live Showroom</Eyebrow>
              </div>
              <h3 className="font-display font-light text-[28px] text-dp-text tracking-wider uppercase">
                Customer Transformations
              </h3>
              <p className="font-sans font-light text-sm text-dp-text-muted mt-3 max-w-[480px] mx-auto leading-relaxed">
                Real before/after results uploaded directly from our detailing bay.
              </p>
            </div>

            {dbItems.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {dbItems.map((item) => (
                  <div
                    key={item.id}
                    onClick={() => setSelectedItem(item)}
                    className="cursor-pointer"
                  >
                    <GalleryCard item={item} isFirst={false} />
                  </div>
                ))}
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center py-20 px-6 border border-dashed border-dp-border/30 rounded-none bg-dp-surface/20 max-w-[600px] mx-auto">
                <p className="font-display font-light text-base text-dp-gold tracking-[0.2em] uppercase animate-pulse">
                  More transformations soon
                </p>
                <p className="font-sans font-light text-xs text-dp-text-subtle mt-2.5 text-center leading-relaxed max-w-sm">
                  Our technicians upload live project results here straight from the shop floor. Check back soon for new updates!
                </p>
              </div>
            )}
          </div>

          {/* Lightbox / Case Study Details Modal */}
          <AnimatePresence>
            {selectedItem && (
              <CaseStudyModal
                item={selectedItem}
                onClose={() => setSelectedItem(null)}
              />
            )}
          </AnimatePresence>

        </SectionInner>
      </Section>
    </LazyMotion>
  )
}

// ─── Individual Gallery Item Card ───────────────────────────

function GalleryCard({ item, isFirst }: { item: GalleryItem; isFirst: boolean }) {
  const [sliderPos, setSliderPos] = useState(item.sliderInit ?? 50)
  const [isDragging, setIsDragging] = useState(false)
  const [hasAutoRevealed, setHasAutoRevealed] = useState(false)
  const [inView, setInView] = useState(false)
  const containerRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!isFirst || hasAutoRevealed) return
    const el = containerRef.current
    if (!el) return
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setInView(true)
          observer.disconnect()
        }
      },
      { threshold: 0.4 },
    )
    observer.observe(el)
    return () => observer.disconnect()
  }, [isFirst, hasAutoRevealed])

  useEffect(() => {
    if (!inView || hasAutoRevealed || !isFirst) return
    const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches
    if (reduced) { setHasAutoRevealed(true); return }

    let start: number | null = null
    const duration = 1400
    const startPos = 95
    const endPos = item.sliderInit ?? 50

    const tick = (ts: number) => {
      if (start === null) start = ts
      const progress = Math.min((ts - start) / duration, 1)
      const eased = 1 - Math.pow(1 - progress, 3)
      setSliderPos(startPos + (endPos - startPos) * eased)
      if (progress < 1) requestAnimationFrame(tick)
      else setHasAutoRevealed(true)
    }
    requestAnimationFrame(tick)
  }, [inView, hasAutoRevealed, isFirst, item.sliderInit])

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

  const hasBefore = !!item.beforeUrl
  const hasAfter = !!item.afterUrl
  const isSingle = (hasBefore || hasAfter) && !(hasBefore && hasAfter)
  const imgUrl = item.afterUrl || item.beforeUrl || ''

  if (isSingle) {
    return (
      <div className="group flex flex-col border border-dp-border hover:border-dp-gold transition-all duration-300 bg-dp-bg cursor-pointer">
        <div className="relative aspect-[16/10] overflow-hidden bg-dp-bg select-none">
          <img
            src={imgUrl}
            alt={item.afterAlt || item.beforeAlt || 'Showroom Project'}
            className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
          />
          <span className="absolute top-3 left-3 font-sans font-normal text-[9px] tracking-widest uppercase text-dp-gold bg-dp-gold/15 border border-dp-gold/30 px-2 py-0.5 pointer-events-none">
            {item.beforeUrl ? 'Before' : 'Showroom'}
          </span>
        </div>
        <div className="flex items-center justify-between gap-4 px-5 py-4 border-t border-dp-border bg-dp-surface-2">
          <div className="flex items-center gap-3">
            <span className="font-sans font-normal text-[9px] tracking-wider uppercase text-dp-gold border border-dp-border-gold px-2 py-0.5">
              {item.service}
            </span>
            <span className="font-sans font-light text-xs text-dp-text">{item.vehicle}</span>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="group flex flex-col border border-dp-border hover:border-dp-gold transition-colors duration-500 bg-dp-bg cursor-pointer">

      {/* Comparison slider */}
      <div
        ref={containerRef}
        className={clsx(
          'relative aspect-[16/10] overflow-hidden bg-dp-bg select-none touch-none',
          isDragging ? 'cursor-ew-resize' : 'cursor-col-resize',
        )}
        onPointerDown={onPointerDown}
        onPointerMove={onPointerMove}
        onPointerUp={onPointerUp}
        onPointerCancel={() => setIsDragging(false)}
        role="img"
        data-cursor="drag"
        aria-label={`Before and after comparison: ${item.beforeAlt} vs ${item.afterAlt}`}
      >
        {/* Before layer */}
        <div className="absolute inset-0">
          <PaintSim state="before" vehicle={item.vehicle} imgUrl={item.beforeUrl} />
        </div>

        {/* After layer */}
        <div
          className="absolute inset-0 overflow-hidden"
          style={{ clipPath: `inset(0 0 0 ${sliderPos}%)` }}
        >
          <PaintSim state="after" vehicle={item.vehicle} imgUrl={item.afterUrl} />
        </div>

        {/* Labels */}
        <span className="absolute top-3 left-3 font-sans font-normal text-[9px] tracking-widest uppercase text-dp-text-muted bg-dp-bg/80 px-2 py-0.5 pointer-events-none">
          Before
        </span>
        <span className="absolute top-3 right-3 font-sans font-normal text-[9px] tracking-widest uppercase text-dp-gold bg-dp-gold/15 border border-dp-gold/30 px-2 py-0.5 pointer-events-none">
          After
        </span>

        {/* Slider line */}
        <div
          className="absolute top-0 bottom-0 w-px bg-dp-gold z-10 pointer-events-none"
          style={{ left: `${sliderPos}%` }}
        >
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-7 h-7 rounded-full bg-dp-surface-2 border border-dp-gold flex items-center justify-center shadow-gold-sm">
            <svg viewBox="0 0 16 16" className="w-2.5 h-2.5 fill-none stroke-dp-gold" strokeWidth="1.5">
              <path d="M5 8L2 5M2 5L5 2M2 5H8M11 8L14 5M14 5L11 2M14 5H8" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </div>
        </div>
      </div>

      {/* Card Info */}
      <div className="flex items-center justify-between gap-4 px-5 py-4 border-t border-dp-border bg-dp-surface-2">
        <div className="flex items-center gap-3">
          <span className="font-sans font-normal text-[9px] tracking-wider uppercase text-dp-gold border border-dp-border-gold px-2 py-0.5">
            {item.service}
          </span>
          <span className="font-sans font-light text-xs text-dp-text">{item.vehicle}</span>
        </div>
        <span className="font-sans font-light text-[10px] text-dp-text-muted">
          {item.hours} hrs work
        </span>
      </div>
    </div>
  )
}

// ─── Upgraded Paint Surface Simulation (SVG) ─────────────────

const VEHICLE_IMAGES: Record<string, string> = {
  'BMW 5 Series': '/bmw_polished.png',
  'Mercedes C-Class': '/mercedes_polished.png',
  'Porsche Cayenne': '/porsche_polished.png',
  'Land Rover Defender': '/defender_polished.png',
  'Audi RS6': '/audi_polished.png',
  'Rolls-Royce Ghost': '/rolls_polished.png',
}

function PaintSim({ state, vehicle, imgUrl }: { state: 'before' | 'after'; vehicle: string; imgUrl?: string }) {
  const isBefore = state === 'before'
  const imgSrc = imgUrl || VEHICLE_IMAGES[vehicle] || '/porsche_polished.png'

  return (
    <div className="w-full h-full relative overflow-hidden select-none pointer-events-none">
      {isBefore ? (
        <div className="w-full h-full relative">
          <img
            src={imgSrc}
            alt={`${vehicle} before treatment`}
            className="w-full h-full object-cover select-none pointer-events-none"
            draggable={false}
            style={imgUrl ? undefined : { filter: 'grayscale(20%) brightness(44%) contrast(80%) sepia(26%) blur(0.5px)' }}
          />
          
          {/* Detailed dust, mud splatter, and mineral water spot overlay */}
          {!imgUrl && (
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
                const cx = 200 + (set * 80)
                const cy = 110 + (set * 50)
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
          )}
        </div>
      ) : (
        <div className="w-full h-full relative">
          <img
            src={imgSrc}
            alt={`${vehicle} after treatment`}
            className="w-full h-full object-cover select-none pointer-events-none"
            draggable={false}
          />
          {/* Warm specular light reflection accent */}
          {!imgUrl && (
            <div className="absolute inset-0 pointer-events-none" style={{
              background: 'radial-gradient(circle 160px at 70% 30%, rgba(201,168,76,0.2) 0%, transparent 80%)'
            }} />
          )}
        </div>
      )}

      {/* Dynamic technical subtitle overlay */}
      <div className="absolute bottom-3 left-1/2 -translate-x-1/2 pointer-events-none text-center z-10 w-full">
        <span className={clsx(
          "font-sans text-[7.5px] tracking-[0.24em] uppercase font-normal py-0.5 px-2 bg-dp-bg/60 backdrop-blur-[2px]",
          isBefore ? "text-white/20" : "text-dp-gold/40"
        )}>
          {isBefore ? 'STAGE-1 SURFACE DEGRADATION' : 'STAGE-3 CORRECTED COUPLING'}
        </span>
      </div>
    </div>
  )
}

// ─── Case Study Details Lightbox Modal ────────────────────────

function CaseStudyModal({ item, onClose }: { item: GalleryItem; onClose: () => void }) {
  // Setup local slider state inside modal
  const [sliderPos, setSliderPos] = useState(item.sliderInit ?? 50)
  const [isDragging, setIsDragging] = useState(false)
  const sliderRef = useRef<HTMLDivElement>(null)

  const updatePos = useCallback((clientX: number) => {
    const el = sliderRef.current
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

  // Escape key handler
  useEffect(() => {
    const h = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose() }
    window.addEventListener('keydown', h)
    return () => window.removeEventListener('keydown', h)
  }, [onClose])

  return (
    <m.div
      className="fixed inset-0 z-[1100] flex items-center justify-center p-4 md:p-10"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      role="dialog"
      aria-modal="true"
    >
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-dp-bg/90 backdrop-blur-md"
        onClick={onClose}
      />

      {/* Modal Container */}
      <m.div
        className="relative w-full max-w-5xl bg-dp-surface border border-dp-border grid grid-cols-1 lg:grid-cols-2 overflow-hidden z-10 shadow-gold-md"
        initial={{ scale: 0.95, y: 15 }}
        animate={{ scale: 1, y: 0 }}
        exit={{ scale: 0.95, y: 10 }}
        transition={springs.responsive}
      >
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 z-20 w-8 h-8 flex items-center justify-center border border-dp-border hover:border-dp-gold bg-dp-surface text-dp-text hover:text-dp-gold transition-colors duration-300 rounded-none cursor-pointer"
          aria-label="Close case study"
        >
          ✕
        </button>

        {/* Left: Large interactive slider */}
        <div
          ref={sliderRef}
          className={clsx(
            'relative aspect-[16/11] lg:aspect-auto lg:h-full overflow-hidden bg-dp-bg select-none border-b lg:border-b-0 lg:border-r border-dp-border touch-none',
            isDragging ? 'cursor-ew-resize' : 'cursor-col-resize'
          )}
          onPointerDown={onPointerDown}
          onPointerMove={onPointerMove}
          onPointerUp={onPointerUp}
          onPointerCancel={() => setIsDragging(false)}
        >
          {/* Before */}
          <div className="absolute inset-0">
            <PaintSim state="before" vehicle={item.vehicle} imgUrl={item.beforeUrl} />
          </div>

          {/* After */}
          <div
            className="absolute inset-0 overflow-hidden"
            style={{ clipPath: `inset(0 0 0 ${sliderPos}%)` }}
          >
            <PaintSim state="after" vehicle={item.vehicle} imgUrl={item.afterUrl} />
          </div>

          <span className="absolute bottom-4 left-4 font-sans text-[10px] tracking-widest uppercase text-dp-text-muted bg-dp-bg/80 px-3 py-1">
            Before: Dull / Contaminated
          </span>
          <span className="absolute bottom-4 right-4 font-sans text-[10px] tracking-widest uppercase text-dp-gold bg-dp-gold/15 border border-dp-gold/30 px-3 py-1">
            After: Corrected & Coated
          </span>

          {/* Draggable vertical bar */}
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

        {/* Right: Technical Report Summary */}
        <div className="p-8 md:p-10 flex flex-col justify-between overflow-y-auto max-h-[85vh] lg:max-h-none">
          <div className="space-y-6">
            <div>
              <p className="font-sans font-normal text-[10px] tracking-widest text-dp-gold uppercase mb-1">
                Project Report
              </p>
              <h2 className="font-display font-light text-3xl text-dp-text">
                {item.vehicle}
              </h2>
              <div className="w-10 h-px bg-dp-gold mt-3" />
            </div>

            {/* Metrics Checklist */}
            <div className="grid grid-cols-2 gap-4 border-y border-dp-border py-6">
              <div>
                <span className="text-[9px] text-dp-text-subtle uppercase block font-sans tracking-wide">Treatment Tier</span>
                <span className="text-xs text-dp-text font-normal">{item.service}</span>
              </div>
              <div>
                <span className="text-[9px] text-dp-text-subtle uppercase block font-sans tracking-wide">Time Invested</span>
                <span className="text-xs text-dp-text font-normal">{item.hours} Hours Craft</span>
              </div>
              <div>
                <span className="text-[9px] text-dp-text-subtle uppercase block font-sans tracking-wide">Defect Removal</span>
                <span className="text-xs text-dp-gold font-normal">
                  {item.tag.includes('correction') ? '90% - 95%' : '80% - 85%'}
                </span>
              </div>
              <div>
                <span className="text-[9px] text-dp-text-subtle uppercase block font-sans tracking-wide">Paint Layering</span>
                <span className="text-xs text-dp-text font-normal">112μm - 120μm (Stable)</span>
              </div>
            </div>

            {/* Diagnostic Details */}
            <div className="space-y-3">
              <p className="text-[10px] uppercase font-sans tracking-widest text-dp-text-muted">
                Transformation Summary
              </p>
              <p className="text-xs font-sans font-light leading-relaxed text-dp-text-muted">
                Initial evaluation showed heavy surface marring, swirl marks, and paint oxidation.
                We performed a multi-stage paint thickness audit before choosing a dual-action correction pass.
                The clear coat was restored to absolute optical clarity and sealed using a {item.tag.includes('ceramic') ? '5-year professional SiO₂ coating' : 'synthetic hydrophobic sealant'}.
              </p>
            </div>

            {/* Product Stack */}
            <div className="space-y-3">
              <p className="text-[10px] uppercase font-sans tracking-widest text-dp-text-muted">
                Product Stack Used
              </p>
              <div className="flex flex-wrap gap-2">
                {[
                  'Rupes BigFoot DA',
                  'PosiTest DFT Gauge',
                  item.tag.includes('ceramic') ? 'GYEON Q² Mohs EVO' : 'CARPRO Reload Sealant',
                  'pH-Safe Clay Mitt',
                  'Kranzle 1622 Pressure System'
                ].map(p => (
                  <span key={p} className="text-[10px] font-sans font-light text-dp-text-muted border border-dp-border px-3 py-1 bg-dp-surface-2">
                    {p}
                  </span>
                ))}
              </div>
            </div>
          </div>

          <div className="pt-6 border-t border-dp-border mt-8 flex gap-4">
            <PrimaryButton to="/quote" className="text-xs py-3 px-5 flex-1 justify-center" onClick={onClose} data-cursor="cta">
              Configure Your Detail
              <ArrowRight className="w-3 h-3" />
            </PrimaryButton>
          </div>
        </div>
      </m.div>
    </m.div>
  )
}
