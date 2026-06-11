/**
 * DETAIL PALS V2 — MagneticCard
 * ================================
 * File: src/design-system/components/MagneticCard.tsx
 *
 * The core visual primitive for the "showroom" aesthetic.
 * Combines:
 *   — glass-morphism surface (rgba dark + backdrop-filter blur)
 *   — gold border that brightens on hover
 *   — gold glow that appears on hover
 *   — magnetic cursor attraction (useMagneticHover)
 *   — optional floating Y-oscillation animation
 *   — optional gold top-line accent (the gold thread motif)
 *
 * Used by: stat cards, service preview cards, testimonial cards,
 *          gallery metadata overlays, floating badges.
 *
 * On touch devices: magnetic effect is disabled, hover → press states only.
 */

import { m, LazyMotion, domAnimation } from 'framer-motion'
import { clsx } from 'clsx'
import { useMagneticHover } from '@/hooks'

interface MagneticCardProps {
  children:       React.ReactNode
  className?:     string
  /** Magnetic pull strength in px. 0 = disabled. Default 10. */
  magnetStrength?: number
  /** Animate a slow Y float. Default false. */
  float?:         boolean
  /** Show gold top-line accent. Default false. */
  goldAccent?:    boolean
  /** Additional glow intensity. 'none' | 'sm' | 'md'. Default 'none'. */
  glow?:          'none' | 'sm' | 'md'
  onClick?:       () => void
  as?:            'div' | 'article' | 'button'
  role?:          string
  'aria-label'?:  string
}

const GLOW_MAP = {
  none: '',
  sm:   'shadow-gold-sm',
  md:   'shadow-gold-md',
} as const

export function MagneticCard({
  children,
  className,
  magnetStrength = 10,
  float = false,
  goldAccent = false,
  glow = 'none',
  onClick,
  as: Tag = 'div',
  ...rest
}: MagneticCardProps) {
  const isMobile = typeof window !== 'undefined'
    ? window.matchMedia('(hover: none)').matches
    : false

  const { ref, x, y, onMouseMove, onMouseLeave } = useMagneticHover({
    strength: isMobile ? 0 : magnetStrength,
  })

  const floatAnimation = float
    ? {
        y: ['0px', '-8px', '0px'],
        transition: { duration: 4, repeat: Infinity, ease: 'easeInOut' as const },
      }
    : {}

  return (
    <LazyMotion features={domAnimation}>
      <m.div
        // @ts-ignore — ref typing with polymorphic element
        ref={ref}
        className={clsx(
          'relative overflow-hidden',
          'border transition-[border-color,box-shadow] duration-[400ms] ease-dp-out',
          'border-[var(--dp-border-gold-dim)] hover:border-[var(--dp-border-gold)]',
          glow !== 'none' ? GLOW_MAP[glow] : '',
          'hover:shadow-gold-sm',
          onClick && 'cursor-pointer',
          className,
        )}
        style={{
          x,
          y: float ? undefined : y,
          backgroundColor: 'var(--dp-surface-glass)',
          backdropFilter: 'var(--dp-glass-blur)',
          WebkitBackdropFilter: 'var(--dp-glass-blur)',
        }}
        animate={float ? floatAnimation : undefined}
        onMouseMove={onMouseMove}
        onMouseLeave={onMouseLeave}
        onClick={onClick}
        whileHover={{ scale: onClick ? 1.01 : 1 }}
        transition={{ type: 'spring', stiffness: 300, damping: 24 }}
        {...rest}
      >
        {/* Gold top accent line — the gold thread motif */}
        {goldAccent && (
          <m.div
            className="absolute top-0 left-0 right-0 h-px bg-dp-gold"
            initial={{ scaleX: 0 }}
            whileHover={{ scaleX: 1 }}
            transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
            style={{ transformOrigin: 'left' }}
            aria-hidden="true"
          />
        )}

        {/* Hover glow overlay */}
        <m.div
          className="absolute inset-0 pointer-events-none"
          initial={{ opacity: 0 }}
          whileHover={{ opacity: 1 }}
          transition={{ duration: 0.3 }}
          style={{
            background: 'radial-gradient(ellipse 60% 40% at 50% 0%, rgba(201,168,76,0.05) 0%, transparent 70%)',
          }}
          aria-hidden="true"
        />

        {children}
      </m.div>
    </LazyMotion>
  )
}
