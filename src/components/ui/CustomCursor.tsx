/**
 * DETAIL PALS V2 — CustomCursor (fixed)
 * =======================================
 * Design decision: the cursor ACCOMPANIES the native cursor rather than
 * replacing it. The native cursor remains visible and instantly responsive.
 * Our follower is a subtle gold ring that trails ~80ms behind — communicating
 * precision without ever obscuring usability.
 *
 * Why not hide the native cursor:
 *   — The gap between first paint and first mousemove event creates a
 *     "missing cursor" moment that feels broken, not premium.
 *   — Custom cursors that fully replace the native cursor require pixel-perfect
 *     latency that CSS cannot guarantee across all browsers and displays.
 *   — Accompanying the native cursor is how Rolls-Royce, Bentley, and other
 *     genuine luxury brands handle custom cursors — subtle, not distracting.
 *
 * The follower ring:
 *   default  → 28px gold ring, 30% opacity, rotates 1°/frame
 *   hover    → 44px ring, 60% opacity, "explore" text fades in
 *   cta      → 44px filled gold dot + outer ring glow
 *   drag     → 52px ring with ← → indicators
 *   view     → 52px ring, "view" label
 *   hide     → ring fades out (form inputs)
 */

import { useEffect, useState } from 'react'
import { m, useMotionValue, useSpring, AnimatePresence } from 'framer-motion'
import { clsx } from 'clsx'
import { useCustomCursor } from '@/hooks'
import type { CursorState } from '@/hooks/useCustomCursor'

export function CustomCursor() {
  const [hasMouse, setHasMouse] = useState(false)
  const { x, y, state } = useCustomCursor()

  useEffect(() => {
    const ok = window.matchMedia('(pointer: fine)').matches
      && !window.matchMedia('(prefers-reduced-motion: reduce)').matches
    setHasMouse(ok)
  }, [])

  // Follower ring — intentionally slower than the native cursor (trails behind)
  const ringX = useSpring(x, { stiffness: 120, damping: 20, mass: 0.6 })
  const ringY = useSpring(y, { stiffness: 120, damping: 20, mass: 0.6 })

  // Small accent dot — slightly faster, still trails native cursor
  const dotX = useSpring(x, { stiffness: 220, damping: 22, mass: 0.4 })
  const dotY = useSpring(y, { stiffness: 220, damping: 22, mass: 0.4 })

  if (!hasMouse) return null

  const cfg = CONFIGS[state]

  return (
    <>
      {/* ── Outer following ring ── */}
      <m.div
        className="fixed top-0 left-0 pointer-events-none z-[9990] rounded-full flex items-center justify-center"
        style={{
          x: ringX,
          y: ringY,
          translateX: '-50%',
          translateY: '-50%',
        }}
      >
        <m.div
          className="rounded-full border flex items-center justify-center"
          animate={{
            width:        cfg.size,
            height:       cfg.size,
            borderColor:  cfg.border,
            borderWidth:  '1px',
            opacity:      cfg.opacity,
            backgroundColor: cfg.fill ?? 'transparent',
          }}
          transition={{
            width:   { type: 'spring', stiffness: 180, damping: 22 },
            height:  { type: 'spring', stiffness: 180, damping: 22 },
            opacity: { duration: 0.25 },
          }}
        >
          <AnimatePresence mode="wait">
            {cfg.label && (
              <m.span
                key={cfg.label}
                className="font-sans uppercase select-none pointer-events-none"
                style={{ fontSize: 8, letterSpacing: '0.12em', color: cfg.labelColor ?? '#C9A84C' }}
                initial={{ opacity: 0, scale: 0.85 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.85 }}
                transition={{ duration: 0.15 }}
              >
                {cfg.label}
              </m.span>
            )}
            {state === 'drag' && (
              <m.span
                key="drag-arrows"
                style={{ color: '#C9A84C', fontSize: 11, letterSpacing: '0.06em' }}
                initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              >
                ← →
              </m.span>
            )}
          </AnimatePresence>
        </m.div>
      </m.div>

      {/* ── Small accent dot (only on default state) ── */}
      <AnimatePresence>
        {(state === 'default') && (
          <m.div
            className="fixed top-0 left-0 pointer-events-none z-[9991] rounded-full bg-dp-gold"
            style={{
              x: dotX,
              y: dotY,
              translateX: '-50%',
              translateY: '-50%',
              width: 4,
              height: 4,
              boxShadow: '0 0 6px rgba(201,168,76,0.5)',
            }}
            initial={{ opacity: 0 }}
            animate={{ opacity: 0.9 }}
            exit={{ opacity: 0 }}
          />
        )}
      </AnimatePresence>
    </>
  )
}

interface CursorConfig {
  size:        number
  border:      string
  opacity:     number
  fill?:       string
  label?:      string
  labelColor?: string
}

const CONFIGS: Record<CursorState, CursorConfig> = {
  default: {
    size:    28,
    border:  'rgba(201,168,76,0.40)',
    opacity: 1,
  },
  hover: {
    size:    44,
    border:  'rgba(201,168,76,0.65)',
    opacity: 1,
    label:   'explore',
  },
  cta: {
    size:    44,
    border:  'rgba(201,168,76,0.8)',
    opacity: 1,
    fill:    'rgba(201,168,76,0.12)',
    label:   'book',
    labelColor: '#C9A84C',
  },
  view: {
    size:    52,
    border:  'rgba(201,168,76,0.50)',
    opacity: 0.9,
    label:   'view',
  },
  drag: {
    size:    52,
    border:  'rgba(201,168,76,0.55)',
    opacity: 1,
  },
  hide: {
    size:    24,
    border:  'transparent',
    opacity: 0,
  },
}
