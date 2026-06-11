import { useEffect, useState, useCallback, useRef } from 'react'
import { m, AnimatePresence } from 'framer-motion'
import { clsx } from 'clsx'

const SESSION_KEY = 'dp-intro-v3'

type Phase = 'idle' | 'grid' | 'laser' | 'sweep' | 'hold' | 'tagline' | 'exit'

interface IntroSequenceProps {
  onComplete: () => void
}

export function IntroSequence({ onComplete }: IntroSequenceProps) {
  const [visible, setVisible] = useState(true)
  const [phase, setPhase] = useState<Phase>('idle')
  const [canSkip, setCanSkip] = useState(false)
  const canvasRef = useRef<HTMLCanvasElement>(null)

  const dismiss = useCallback(() => {
    if (!canSkip) return
    setPhase('exit')
    setTimeout(() => {
      setVisible(false)
      sessionStorage.setItem(SESSION_KEY, '1')
      onComplete()
    }, 700)
  }, [canSkip, onComplete])

  // Canvas particle logic representing paint contaminants dissolving into gold flakes
  useEffect(() => {
    if (phase === 'exit' || !visible) return
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')
    if (!ctx) return

    let animationFrameId: number
    let width = (canvas.width = window.innerWidth)
    let height = (canvas.height = window.innerHeight)

    const handleResize = () => {
      if (!canvas) return
      width = canvas.width = window.innerWidth
      height = canvas.height = window.innerHeight
    }
    window.addEventListener('resize', handleResize)

    // Particle class
    class Particle {
      x: number
      y: number
      size: number
      speedX: number
      speedY: number
      color: string
      alpha: number
      decay: number

      constructor() {
        this.x = Math.random() * width
        this.y = Math.random() * height
        this.size = Math.random() * 2 + 0.5
        this.speedX = (Math.random() - 0.5) * 0.4
        this.speedY = (Math.random() - 0.5) * 0.4
        // Start as dull grey/white contaminants
        this.color = '200, 200, 200'
        this.alpha = Math.random() * 0.4 + 0.1
        this.decay = Math.random() * 0.002 + 0.001
      }

      update(sweepX: number | null) {
        this.x += this.speedX
        this.y += this.speedY

        // Wrap around bounds
        if (this.x < 0 || this.x > width) this.speedX *= -1
        if (this.y < 0 || this.y > height) this.speedY *= -1

        // If sweep passes over particles, transform them into glowing gold flakes
        if (sweepX !== null && this.x < sweepX) {
          this.color = '201, 168, 76' // Gold
          this.alpha = Math.min(this.alpha + 0.02, 0.8)
          this.size = Math.min(this.size + 0.05, 3)
          // Attract towards the center logo area
          const dx = width / 2 - this.x
          const dy = height / 2 - this.y
          const dist = Math.sqrt(dx * dx + dy * dy)
          if (dist > 50) {
            this.x += (dx / dist) * 0.8
            this.y += (dy / dist) * 0.8
          }
        }
      }

      draw() {
        if (!ctx) return
        ctx.save()
        ctx.globalAlpha = this.alpha
        ctx.fillStyle = `rgb(${this.color})`
        ctx.beginPath()
        ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2)
        ctx.fill()
        ctx.restore()
      }
    }

    const particles: Particle[] = Array.from({ length: 65 }, () => new Particle())

    // Track simulated sweep position
    let sweepProgress = 0
    
    const render = () => {
      ctx.clearRect(0, 0, width, height)
      
      let sweepX: number | null = null
      if (phase === 'sweep' || phase === 'hold' || phase === 'tagline') {
        sweepProgress = Math.min(sweepProgress + 0.008, 1.2)
        sweepX = sweepProgress * width
      }

      particles.forEach((p) => {
        p.update(sweepX)
        p.draw()
      })

      animationFrameId = requestAnimationFrame(render)
    }

    render()

    return () => {
      window.removeEventListener('resize', handleResize)
      cancelAnimationFrame(animationFrameId)
    }
  }, [phase, visible])

  useEffect(() => {
    const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches
    if (reduced) {
      sessionStorage.setItem(SESSION_KEY, '1')
      setVisible(false)
      onComplete()
      return
    }

    const t = [
      setTimeout(() => setPhase('grid'), 100),
      setTimeout(() => setPhase('laser'), 900),
      setTimeout(() => setPhase('sweep'), 1900),
      setTimeout(() => setCanSkip(true), 2000),
      setTimeout(() => setPhase('hold'), 3600),
      setTimeout(() => setPhase('tagline'), 3900),
      setTimeout(() => setPhase('exit'), 4600),
      setTimeout(() => {
        setVisible(false)
        sessionStorage.setItem(SESSION_KEY, '1')
        onComplete()
      }, 5400),
    ]
    return () => t.forEach(clearTimeout)
  }, [onComplete])

  useEffect(() => {
    const h = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && canSkip) dismiss()
    }
    window.addEventListener('keydown', h)
    return () => window.removeEventListener('keydown', h)
  }, [canSkip, dismiss])

  const showGrid = phase !== 'idle'
  const showLaser = phase === 'laser'
  const sweeping = phase === 'sweep' || phase === 'hold' || phase === 'tagline' || phase === 'exit'
  const showing = phase === 'hold' || phase === 'tagline' || phase === 'exit'

  return (
    <AnimatePresence>
      {visible && (
        <m.div
          key="intro"
          className="fixed inset-0 z-[9999] overflow-hidden bg-[#030303]"
          initial={{ y: 0 }}
          animate={{ y: phase === 'exit' ? '-100%' : 0 }}
          transition={{ duration: 0.85, ease: [0.76, 0, 0.24, 1] }}
          onClick={dismiss}
          style={{ cursor: canSkip ? 'pointer' : 'default' }}
          aria-label="Detail Pals intro — futuristic scanning reveal"
          role="dialog"
        >
          {/* ── Particle Canvas ── */}
          <canvas ref={canvasRef} className="absolute inset-0 z-[2] pointer-events-none" />

          {/* ── Blueprint Mapping Grid ── */}
          <m.div
            className="absolute inset-0 pointer-events-none z-[1]"
            initial={{ opacity: 0 }}
            animate={{ opacity: showGrid ? 0.05 : 0 }}
            transition={{ duration: 0.8 }}
            style={{
              backgroundImage: 'radial-gradient(circle, #00D2FF 1px, transparent 1px)',
              backgroundSize: '30px 30px',
            }}
          />

          {/* ── Surface paint direction lines (metallic grain) ── */}
          <svg className="absolute inset-0 w-full h-full opacity-[0.02] z-[1]" aria-hidden="true">
            {Array.from({ length: 24 }).map((_, i) => (
              <line
                key={i}
                x1={-100 + i * 55}
                y1="100%"
                x2={100 + i * 55}
                y2="0%"
                stroke="#C9A84C"
                strokeWidth="0.8"
              />
            ))}
          </svg>

          {/* ── Neon laser scan line sweeping down (Diagnostic Phase) ── */}
          {showLaser && (
            <m.div
              className="absolute left-0 right-0 h-[2px] z-[4] pointer-events-none"
              style={{
                background: 'linear-gradient(to right, transparent, #00D2FF 20%, #ffffff 50%, #00D2FF 80%, transparent)',
                boxShadow: '0 0 15px #00D2FF, 0 0 30px rgba(0, 210, 255, 0.4)',
              }}
              initial={{ top: '0%' }}
              animate={{ top: '100%' }}
              transition={{ duration: 0.9, ease: 'easeInOut' }}
            />
          )}

          {/* ── Laser sweep backdrop color glow (Laser Blue) ── */}
          <m.div
            className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] rounded-full pointer-events-none z-[1]"
            style={{
              background: 'radial-gradient(circle, rgba(0,210,255,0.06) 0%, transparent 70%)',
            }}
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{
              opacity: phase === 'laser' ? 1 : 0,
              scale: phase === 'laser' ? 1.2 : 0.8,
            }}
            transition={{ duration: 0.8 }}
          />

          {/* ── Primary paint correction sweep (Laser Blue into Amber Gold gradient) ── */}
          <m.div
            className="absolute inset-0 pointer-events-none z-[3]"
            aria-hidden="true"
            style={{
              background: sweeping
                ? `linear-gradient(
                    -45deg,
                    transparent 0%,
                    rgba(0,210,255,0.02) 20%,
                    rgba(0,210,255,0.08) 35%,
                    rgba(255,255,255,0.3) 50%,
                    rgba(201,168,76,0.18) 60%,
                    rgba(201,168,76,0.04) 75%,
                    transparent 100%
                  )`
                : 'none',
              backgroundSize: '300% 300%',
            }}
            initial={{ backgroundPosition: '200% 200%' }}
            animate={{
              backgroundPosition: sweeping ? ['200% 200%', '-100% -100%'] : '200% 200%',
            }}
            transition={{ duration: 2.1, ease: [0.22, 1, 0.36, 1] }}
          />

          {/* ── Secondary sweep (Warm Amber Reflection, slight delay) ── */}
          <m.div
            className="absolute inset-0 pointer-events-none z-[3]"
            aria-hidden="true"
            style={{
              background: sweeping
                ? `linear-gradient(
                    -45deg,
                    transparent 0%,
                    rgba(201,168,76,0.01) 30%,
                    rgba(201,168,76,0.08) 46%,
                    rgba(255,255,255,0.12) 50%,
                    rgba(201,168,76,0.08) 54%,
                    transparent 70%,
                    transparent 100%
                  )`
                : 'none',
              backgroundSize: '300% 300%',
            }}
            initial={{ backgroundPosition: '200% 200%' }}
            animate={{
              backgroundPosition: sweeping ? ['200% 200%', '-100% -100%'] : '200% 200%',
            }}
            transition={{ duration: 2.1, ease: [0.22, 1, 0.36, 1], delay: 0.35 }}
          />

          {/* ── Post-sweep Ambient Showroom Lighting ── */}
          <m.div
            className="absolute inset-0 pointer-events-none z-[1]"
            style={{
              background: `
                radial-gradient(ellipse 70% 50% at 65% 35%, rgba(201,168,76,0.07) 0%, transparent 70%),
                radial-gradient(ellipse 40% 40% at 30% 65%, rgba(0,210,255,0.03) 0%, transparent 60%)
              `,
            }}
            initial={{ opacity: 0 }}
            animate={{ opacity: showing ? 1 : 0 }}
            transition={{ duration: 0.8 }}
            aria-hidden="true"
          />

          {/* ── Center content logo wordmark ── */}
          <div className="absolute inset-0 flex flex-col items-center justify-center z-[10]" aria-hidden="true">
            <m.div
              className="relative"
              initial={{ opacity: 0 }}
              animate={{ opacity: sweeping ? 1 : 0 }}
              transition={{ duration: 0.3, delay: 0.4 }}
            >
              {/* Dark base (visible after sweep passes) */}
              <m.p
                className="font-sans font-normal uppercase text-center select-none"
                style={{
                  fontSize: 'clamp(32px,6vw,56px)',
                  letterSpacing: '0.32em',
                  color: 'rgba(240,237,230,0.92)',
                }}
                initial={{ opacity: 0, letterSpacing: '0.05em' }}
                animate={{
                  opacity: showing ? 1 : 0,
                  letterSpacing: showing ? '0.32em' : '0.05em',
                }}
                transition={{ duration: 1.1, ease: [0.16, 1, 0.3, 1] }}
              >
                DETAIL&nbsp;
                <span
                  style={{
                    color: '#C9A84C',
                    fontWeight: 500,
                    textShadow: showing ? '0 0 35px rgba(201,168,76,0.5), 0 0 15px rgba(0,210,255,0.2)' : 'none',
                  }}
                >
                  PALS
                </span>
              </m.p>

              {/* Sweep-bright overlay revealed dynamically */}
              {sweeping && !showing && (
                <m.p
                  className="absolute inset-0 font-sans font-normal uppercase text-center select-none"
                  style={{
                    fontSize: 'clamp(32px,6vw,56px)',
                    letterSpacing: '0.32em',
                    color: 'rgba(255,255,255,0.98)',
                    mixBlendMode: 'screen',
                  }}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: [0, 0.9, 0] }}
                  transition={{ duration: 1.5, ease: [0.25, 0, 0.75, 1], delay: 0.4 }}
                >
                  DETAIL&nbsp;PALS
                </m.p>
              )}
            </m.div>

            {/* Tagline */}
            <m.p
              className="font-sans font-normal uppercase text-center select-none mt-4"
              style={{
                fontSize: 11,
                letterSpacing: '0.24em',
                color: '#C9A84C',
                textShadow: '0 0 10px rgba(201,168,76,0.2)',
              }}
              initial={{ clipPath: 'inset(0 100% 0 0)', opacity: 0 }}
              animate={
                phase === 'tagline' || phase === 'exit'
                  ? { clipPath: 'inset(0 0% 0 0)', opacity: 0.85 }
                  : { clipPath: 'inset(0 100% 0 0)', opacity: 0 }
              }
              transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
            >
              Precision automotive detailing
            </m.p>

            {/* Gold and Neon laser thread under wordmark */}
            <m.div
              className="mt-6 h-px"
              style={{
                background: 'linear-gradient(to right, transparent, rgba(0,210,255,0.4) 20%, rgba(201,168,76,0.8) 50%, rgba(0,210,255,0.4) 80%, transparent)',
                boxShadow: '0 0 10px rgba(201,168,76,0.25), 0 0 6px rgba(0,210,255,0.15)',
              }}
              initial={{ width: 0, opacity: 0 }}
              animate={{
                width: showing ? 'clamp(200px,35vw,360px)' : 0,
                opacity: showing ? 0.75 : 0,
              }}
              transition={{ duration: 0.9, ease: [0.16, 1, 0.3, 1], delay: 0.25 }}
              aria-hidden="true"
            />
          </div>

          {/* ── Skip hint ── */}
          <m.p
            className="absolute bottom-8 left-1/2 -translate-x-1/2 font-sans font-light text-[10px] tracking-[0.20em] uppercase text-dp-text-subtle whitespace-nowrap"
            initial={{ opacity: 0 }}
            animate={{ opacity: canSkip && phase !== 'exit' ? 0.45 : 0 }}
            transition={{ duration: 0.4 }}
          >
            Tap or press Esc to skip
          </m.p>
        </m.div>
      )}
    </AnimatePresence>
  )
}

export function shouldShowIntro(): boolean {
  try {
    return !sessionStorage.getItem(SESSION_KEY)
  } catch {
    return false
  }
}
