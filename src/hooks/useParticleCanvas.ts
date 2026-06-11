/**
 * useParticleCanvas
 * ==================
 * Renders an ambient gold particle field on a <canvas> element.
 * Particles drift upward, wrapping at the top.
 * Respects prefers-reduced-motion — renders nothing if motion is reduced.
 *
 * Returns a ref to attach to a <canvas> element.
 *
 * Usage:
 *   const canvasRef = useParticleCanvas({ count: 80 })
 *   <canvas ref={canvasRef} className="absolute inset-0 w-full h-full" />
 */

import { useRef, useEffect } from 'react'

interface Particle {
  x:    number
  y:    number
  vx:   number
  vy:   number
  size: number
  opacity: number
  life: number
  maxLife: number
}

interface UseParticleCanvasOptions {
  /** Number of particles. Reduce to 30 on mobile. Default 70. */
  count?: number
  /** Gold color. Default #C9A84C. */
  color?: string
  /** Max particle opacity. Default 0.35. */
  maxOpacity?: number
  /** Vertical drift speed per frame (px). Default 0.4. */
  speed?: number
}

export function useParticleCanvas({
  count      = 70,
  color      = '#C9A84C',
  maxOpacity = 0.35,
  speed      = 0.4,
}: UseParticleCanvasOptions = {}) {
  const canvasRef = useRef<HTMLCanvasElement>(null)

  useEffect(() => {
    const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches
    if (reduced) return

    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')
    if (!ctx) return

    let raf: number
    let particles: Particle[] = []

    const resize = () => {
      const { offsetWidth: w, offsetHeight: h } = canvas
      canvas.width  = w
      canvas.height = h
      // Re-scatter particles on resize
      particles = Array.from({ length: count }, () => createParticle(w, h, true))
    }

    const createParticle = (w: number, h: number, scatter = false): Particle => {
      const maxLife = 180 + Math.random() * 240
      return {
        x:       Math.random() * w,
        y:       scatter ? Math.random() * h : h + Math.random() * 40,
        vx:      (Math.random() - 0.5) * 0.25,
        vy:      -(speed * 0.6 + Math.random() * speed),
        size:    0.8 + Math.random() * 1.4,
        opacity: 0,
        life:    scatter ? Math.random() * maxLife : 0,
        maxLife,
      }
    }

    const ro = new ResizeObserver(resize)
    ro.observe(canvas)
    resize()

    const tick = () => {
      const { width: w, height: h } = canvas
      ctx.clearRect(0, 0, w, h)

      for (const p of particles) {
        p.life++
        p.x += p.vx
        p.y += p.vy

        // Fade in / fade out
        const t = p.life / p.maxLife
        p.opacity = t < 0.15
          ? (t / 0.15) * maxOpacity
          : t > 0.75
          ? ((1 - t) / 0.25) * maxOpacity
          : maxOpacity

        // Draw — simple circle, no arc overhead
        ctx.globalAlpha = p.opacity
        ctx.fillStyle   = color
        ctx.beginPath()
        ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2)
        ctx.fill()

        // Recycle when off screen or life ends
        if (p.y < -20 || p.life >= p.maxLife) {
          Object.assign(p, createParticle(w, h))
        }
      }

      ctx.globalAlpha = 1
      raf = requestAnimationFrame(tick)
    }

    raf = requestAnimationFrame(tick)

    return () => {
      cancelAnimationFrame(raf)
      ro.disconnect()
    }
  }, [count, color, maxOpacity, speed])

  return canvasRef
}
