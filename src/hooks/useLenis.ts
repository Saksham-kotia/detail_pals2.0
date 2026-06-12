/**
 * useLenis — Smooth scroll inertia
 * ==================================
 * Initializes Lenis smooth scroll and synchronises it with
 * Framer Motion's useScroll hooks via a RAF loop.
 *
 * Lenis replaces the browser's default scroll with a physics-based
 * glide — the single biggest perceptual upgrade to the page feel.
 * Every other scroll-driven animation automatically benefits because
 * they all read from the same scroll position.
 *
 * Disabled for prefers-reduced-motion users.
 * Disabled on touch-only devices (native momentum scroll is better).
 */

import { useEffect, useRef } from 'react'
import Lenis from 'lenis'

export function useLenis() {
  const lenisRef = useRef<Lenis | null>(null)

  useEffect(() => {
    const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches
    const isTouch = window.matchMedia('(hover: none)').matches
    if (reduced || isTouch) return

    const lenis = new Lenis({
      duration:   1.3,
      easing:     (t: number) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
      orientation: 'vertical',
      smoothWheel: true,
      wheelMultiplier: 0.9,
      touchMultiplier: 1.8,
    })

    lenisRef.current = lenis
    ;(window as any).lenis = lenis

    // RAF loop
    let rafId: number
    const raf = (time: number) => {
      lenis.raf(time)
      rafId = requestAnimationFrame(raf)
    }
    rafId = requestAnimationFrame(raf)

    return () => {
      cancelAnimationFrame(rafId)
      lenis.destroy()
      lenisRef.current = null
      ;(window as any).lenis = null
    }
  }, [])

  return lenisRef
}
