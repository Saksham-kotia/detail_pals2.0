/**
 * useCardTilt — 3D perspective tilt
 * =====================================
 * Maps cursor position within a card to rotateX/rotateY transforms,
 * creating a depth-of-field illusion that makes cards feel physical.
 *
 * On Tingly: the flavour cards tilt as you hover across them.
 * On Detail Pals: service cards, gallery cards, testimonial cards.
 *
 * Returns MotionValues for rotateX, rotateY, and a glare overlay
 * position (a bright spot that moves with the "light source").
 *
 * Usage:
 *   const { ref, rotateX, rotateY, glareX, glareY } = useCardTilt()
 *   <motion.div ref={ref} style={{ rotateX, rotateY, transformPerspective: 800 }}>
 *     <GlareOverlay x={glareX} y={glareY} />
 *   </motion.div>
 */

import { useRef, useCallback } from 'react'
import { useMotionValue, useSpring } from 'framer-motion'

interface UseCardTiltOptions {
  /** Max rotation in degrees. Default 8. */
  maxTilt?: number
  /** Spring stiffness. Default 200. */
  stiffness?: number
  /** Spring damping. Default 20. */
  damping?: number
}

export function useCardTilt({
  maxTilt   = 8,
  stiffness = 200,
  damping   = 20,
}: UseCardTiltOptions = {}) {
  const ref = useRef<HTMLDivElement>(null)

  const rawX = useMotionValue(0)
  const rawY = useMotionValue(0)
  const rawGX = useMotionValue(50)
  const rawGY = useMotionValue(50)

  const rotateX  = useSpring(rawX,  { stiffness, damping, mass: 0.6 })
  const rotateY  = useSpring(rawY,  { stiffness, damping, mass: 0.6 })
  const glareX   = useSpring(rawGX, { stiffness: 120, damping: 15 })
  const glareY   = useSpring(rawGY, { stiffness: 120, damping: 15 })

  const onMouseMove = useCallback((e: React.MouseEvent) => {
    const el = ref.current
    if (!el) return
    const { left, top, width, height } = el.getBoundingClientRect()
    const nx = (e.clientX - left)  / width   // 0-1
    const ny = (e.clientY - top)   / height  // 0-1
    rawY.set((nx - 0.5) * maxTilt * 2)
    rawX.set((ny - 0.5) * maxTilt * -2)
    rawGX.set(nx * 100)
    rawGY.set(ny * 100)
  }, [rawX, rawY, rawGX, rawGY, maxTilt])

  const onMouseLeave = useCallback(() => {
    rawX.set(0)
    rawY.set(0)
    rawGX.set(50)
    rawGY.set(50)
  }, [rawX, rawY, rawGX, rawGY])

  return { ref, rotateX, rotateY, glareX, glareY, onMouseMove, onMouseLeave }
}
