/**
 * useMagneticHover
 * =================
 * Applies a magnetic attraction effect: the element drifts toward the cursor
 * when the cursor enters its bounding box, and snaps back on leave.
 *
 * Returns a ref to attach to the element and the current x/y offsets
 * as MotionValues so Framer Motion can animate them without re-renders.
 *
 * Usage:
 *   const { ref, x, y } = useMagneticHover({ strength: 12 })
 *   <motion.div ref={ref} style={{ x, y }}>...</motion.div>
 */

import { useRef, useCallback } from 'react'
import { useMotionValue, useSpring } from 'framer-motion'

interface UseMagneticHoverOptions {
  /** Max pixel offset. Default 12. Reduce for subtle cards. */
  strength?: number
  /** Spring stiffness for the return snap. Default 150. */
  stiffness?: number
  /** Spring damping. Default 15. */
  damping?: number
}

export function useMagneticHover({
  strength = 12,
  stiffness = 150,
  damping = 15,
}: UseMagneticHoverOptions = {}) {
  const ref = useRef<HTMLDivElement>(null)

  const rawX = useMotionValue(0)
  const rawY = useMotionValue(0)

  const x = useSpring(rawX, { stiffness, damping, mass: 0.5 })
  const y = useSpring(rawY, { stiffness, damping, mass: 0.5 })

  const onMouseMove = useCallback((e: React.MouseEvent) => {
    const el = ref.current
    if (!el) return
    const { left, top, width, height } = el.getBoundingClientRect()
    const cx = left + width  / 2
    const cy = top  + height / 2
    const dx = (e.clientX - cx) / (width  / 2)
    const dy = (e.clientY - cy) / (height / 2)
    rawX.set(dx * strength)
    rawY.set(dy * strength)
  }, [rawX, rawY, strength])

  const onMouseLeave = useCallback(() => {
    rawX.set(0)
    rawY.set(0)
  }, [rawX, rawY])

  return { ref, x, y, onMouseMove, onMouseLeave }
}
