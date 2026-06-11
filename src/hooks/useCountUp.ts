/**
 * useCountUp — Animated number counter
 * ========================================
 * Counts from 0 to a target value using requestAnimationFrame.
 * Triggered when the element enters the viewport.
 * Used in StatsSection for animated stat numbers.
 */

import { useState, useEffect, useRef } from 'react'

interface UseCountUpOptions {
  target:    number
  duration?: number   // ms
  decimals?: number   // decimal places (0 for integers)
  enabled?:  boolean  // trigger control
}

export function useCountUp({
  target,
  duration = 1800,
  decimals = 0,
  enabled  = true,
}: UseCountUpOptions): string {
  const [current, setCurrent] = useState(0)
  const rafRef = useRef<number | null>(null)
  const startRef = useRef<number | null>(null)

  useEffect(() => {
    if (!enabled) return

    // Respect prefers-reduced-motion
    const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches
    if (reduced) {
      setCurrent(target)
      return
    }

    startRef.current = null

    const tick = (timestamp: number) => {
      if (startRef.current === null) startRef.current = timestamp
      const elapsed  = timestamp - startRef.current
      const progress = Math.min(elapsed / duration, 1)

      // Ease-out cubic for natural deceleration
      const eased = 1 - Math.pow(1 - progress, 3)
      setCurrent(eased * target)

      if (progress < 1) {
        rafRef.current = requestAnimationFrame(tick)
      } else {
        setCurrent(target)
      }
    }

    rafRef.current = requestAnimationFrame(tick)
    return () => {
      if (rafRef.current !== null) cancelAnimationFrame(rafRef.current)
    }
  }, [target, duration, enabled])

  return current.toFixed(decimals)
}
