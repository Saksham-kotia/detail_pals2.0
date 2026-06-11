/**
 * DETAIL PALS V2 — Motion System (Phase 1+ upgrade)
 * ====================================================
 * All spring configs and animation variants.
 * Reference influence: tinglygolisoda.in motion density.
 * Translated to: cinematic automotive showroom language.
 */

import type { Variants } from 'framer-motion'

// ─── Springs ──────────────────────────────────────────────────

export const springs = {
  /** Heavy, premium — like a car door closing. ~1.2s. */
  gentle: {
    type: 'spring' as const,
    stiffness: 60,
    damping: 20,
    mass: 1,
  },
  /** Attentive, section entrances. ~0.7s. */
  responsive: {
    type: 'spring' as const,
    stiffness: 120,
    damping: 18,
    mass: 0.9,
  },
  /** Micro-interactions, hovers. ~0.2s. */
  snappy: {
    type: 'spring' as const,
    stiffness: 300,
    damping: 24,
    mass: 0.7,
  },
  /** Stats counter — slight overshoot for "settling" feel. */
  counter: {
    type: 'spring' as const,
    stiffness: 80,
    damping: 15,
    mass: 1,
  },
  /** 3D tilt and glare. */
  tilt: {
    type: 'spring' as const,
    stiffness: 200,
    damping: 20,
    mass: 0.6,
  },
} as const

// ─── Hero entrance delays ────────────────────────────────────

export const heroDelays = {
  eyebrow: 0.15,
  line1:   0.28,
  line2:   0.42,
  sub:     0.56,
  ctas:    0.70,
  stats:   0.85,
  scroll:  1.00,
  paint:   0.40,
} as const

// ─── Standard section variants ───────────────────────────────

export const fadeUp: Variants = {
  hidden:  { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0, transition: springs.responsive },
}

export const fadeIn = (delay = 0): Variants => ({
  hidden:  { opacity: 0 },
  visible: { opacity: 1, transition: { duration: 0.6, ease: [0.16, 1, 0.3, 1], delay } },
})

export const fadeLeft: Variants = {
  hidden:  { opacity: 0, x: -30 },
  visible: { opacity: 1, x: 0, transition: springs.responsive },
}

export const fadeRight: Variants = {
  hidden:  { opacity: 0, x: 30 },
  visible: { opacity: 1, x: 0, transition: springs.responsive },
}

export const scaleIn: Variants = {
  hidden:  { opacity: 0, scale: 0.92 },
  visible: {
    opacity: 1,
    scale: 1,
    transition: { ...springs.responsive, duration: 0.5 },
  },
}

// ─── Hero-specific variants ──────────────────────────────────

export const heroFadeUp = (delay: number): Variants => ({
  hidden:  { opacity: 0, y: 24 },
  visible: { opacity: 1, y: 0, transition: { ...springs.gentle, delay } },
})

export const slideInRight = (delay = 0.4): Variants => ({
  hidden:  { opacity: 0, x: 30, scale: 0.97 },
  visible: { opacity: 1, x: 0, scale: 1, transition: { ...springs.gentle, delay } },
})

// ─── Stagger container ───────────────────────────────────────

export const staggerContainer = (
  staggerChildren = 0.08,
  delayChildren   = 0,
): Variants => ({
  hidden:  {},
  visible: { transition: { staggerChildren, delayChildren } },
})

// ─── Page transitions ────────────────────────────────────────

export const stepForward: Variants = {
  hidden:  { opacity: 0, x: 40 },
  visible: { opacity: 1, x: 0, transition: springs.responsive },
  exit:    { opacity: 0, x: -40, transition: { duration: 0.2, ease: [0.45, 0, 0.15, 1] } },
}

export const stepBack: Variants = {
  hidden:  { opacity: 0, x: -40 },
  visible: { opacity: 1, x: 0, transition: springs.responsive },
  exit:    { opacity: 0, x: 40, transition: { duration: 0.2, ease: [0.45, 0, 0.15, 1] } },
}

// ─── Panel reveal (pinned scroll storytelling) ───────────────

/** For scroll-pinned sections: content flies in as user scrolls into panel */
export const panelReveal: Variants = {
  hidden:  { opacity: 0, y: 60, scale: 0.95 },
  visible: {
    opacity: 1,
    y: 0,
    scale: 1,
    transition: { ...springs.gentle, delay: 0.1 },
  },
}

// ─── Reduced motion helper ───────────────────────────────────

export function withReducedMotion(variants: Variants): Variants {
  if (typeof window === 'undefined') return variants
  const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches
  if (!reduced) return variants
  return {
    hidden:  { opacity: 0 },
    visible: { opacity: 1, transition: { duration: 0.01 } },
    exit:    { opacity: 0, transition: { duration: 0.01 } },
  }
}
