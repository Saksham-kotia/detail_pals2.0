/**
 * usePageTransition
 * ==================
 * Returns Framer Motion variants for page enter/exit transitions.
 * All page components use these variants so transitions are consistent.
 *
 * Enter: fade in + slight Y rise
 * Exit:  fade out + slight scale recession
 *
 * The gold thread sweep is handled separately in PageTransitionOverlay.
 */

import type { Variants } from 'framer-motion'
import { springs } from '@/design-system/motion'

export const pageVariants: Variants = {
  initial: {
    opacity: 0,
    y: 16,
    filter: 'brightness(0.85)',
  },
  enter: {
    opacity: 1,
    y: 0,
    filter: 'brightness(1)',
    transition: {
      ...springs.responsive,
      opacity: { duration: 0.45, ease: [0.16, 1, 0.3, 1] },
      filter:  { duration: 0.5 },
    },
  },
  exit: {
    opacity: 0,
    scale: 0.985,
    filter: 'brightness(0.7)',
    transition: {
      duration: 0.3,
      ease: [0.4, 0, 1, 1],
    },
  },
}
