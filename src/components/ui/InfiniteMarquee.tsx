/**
 * DETAIL PALS V2 — InfiniteMarquee
 * ===================================
 * File: src/components/ui/InfiniteMarquee.tsx
 *
 * An infinitely scrolling horizontal strip.
 * On tinglygolisoda.in: "POP. FIZZ. REPEAT." loops continuously.
 * On Detail Pals: service names, certifications, brand claims.
 *
 * Slows on hover (communicates interactivity).
 * Supports both left and right scroll directions.
 * Uses CSS animation (no JS RAF) for maximum performance —
 * GPU-composited transform, never paints.
 *
 * Items are duplicated 4× to ensure seamless looping at any
 * viewport width without JavaScript measuring.
 *
 * Used between sections as a visual energy break —
 * it signals to the user "there is more" while maintaining
 * visual continuity between content blocks.
 */

import { m } from 'framer-motion'
import { clsx } from 'clsx'

interface InfiniteMarqueeProps {
  items:      string[]
  direction?: 'left' | 'right'
  speed?:     'slow' | 'normal' | 'fast'
  separator?: string
  className?: string
  /** Gold highlight on every Nth item (0 = no highlights) */
  highlightEvery?: number
}

const SPEEDS = {
  slow:   '60s',
  normal: '35s',
  fast:   '20s',
} as const

export function InfiniteMarquee({
  items,
  direction      = 'left',
  speed          = 'normal',
  separator      = '·',
  className,
  highlightEvery = 0,
}: InfiniteMarqueeProps) {
  // Duplicate 4× for seamless loop
  const repeated = [...items, ...items, ...items, ...items]
  const dur = SPEEDS[speed]
  const animName = direction === 'left' ? 'marqueeLeft' : 'marqueeRight'

  return (
    <div
      className={clsx(
        'relative overflow-hidden w-full',
        'border-t border-b border-[var(--dp-border)]',
        'bg-dp-surface',
        className,
      )}
      aria-hidden="true" // Decorative — not primary content
    >
      {/* Edge fade-out masks */}
      <div
        className="absolute inset-y-0 left-0 w-24 z-10 pointer-events-none"
        style={{ background: 'linear-gradient(to right, var(--dp-surface), transparent)' }}
      />
      <div
        className="absolute inset-y-0 right-0 w-24 z-10 pointer-events-none"
        style={{ background: 'linear-gradient(to left, var(--dp-surface), transparent)' }}
      />

      {/* Scrolling track */}
      <m.div
        className="flex whitespace-nowrap py-4"
        style={{
          animation: `${animName} ${dur} linear infinite`,
          willChange: 'transform',
        }}
        whileHover={{ animationPlayState: 'paused' } as any}
      >
        {repeated.map((item, i) => (
          <span
            key={i}
            className={clsx(
              'inline-flex items-center gap-4 px-4',
              'font-sans font-light text-xs tracking-[0.16em] uppercase',
              highlightEvery > 0 && i % highlightEvery === 0
                ? 'text-dp-gold'
                : 'text-dp-text-muted',
            )}
          >
            {item}
            <span
              className="text-dp-gold opacity-60"
              style={{ fontSize: '8px' }}
            >
              {separator}
            </span>
          </span>
        ))}
      </m.div>

      <style>{`
        @keyframes marqueeLeft  { 0% { transform: translateX(0) } 100% { transform: translateX(-50%) } }
        @keyframes marqueeRight { 0% { transform: translateX(-50%) } 100% { transform: translateX(0) } }
      `}</style>
    </div>
  )
}
