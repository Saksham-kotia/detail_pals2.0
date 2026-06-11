/**
 * DETAIL PALS V2 — TiltCard
 * ============================
 * File: src/components/ui/TiltCard.tsx
 *
 * A 3D perspective tilt card powered by useCardTilt.
 * The card rotates up to 8° on X and Y axes as the cursor moves within it.
 * A gold "glare" highlight tracks the cursor as if a light source is
 * moving across the card surface — exactly like polished metallic paint
 * catching a moving light.
 *
 * This is the most direct translation of the Tingly reference effect
 * into automotive language: it makes cards feel like real physical objects
 * with material properties, not flat rectangles on a screen.
 *
 * On touch devices: tilt is disabled. The card gets a gentle float
 * animation instead (the float prop from MagneticCard).
 *
 * Usage:
 *   <TiltCard className="...">
 *     <p>Any content</p>
 *   </TiltCard>
 */

import { m, MotionValue, useTransform } from 'framer-motion'
import { clsx } from 'clsx'
import { useCardTilt } from '@/hooks'

interface TiltCardProps {
  children:      React.ReactNode
  className?:    string
  maxTilt?:      number
  goldAccent?:   boolean
  glareIntensity?: number
  onClick?:      () => void
  onHoverStart?: () => void
  onHoverEnd?:   () => void
  style?:        React.CSSProperties
  'data-cursor'?: string
}

export function TiltCard({
  children,
  className,
  style,
  maxTilt         = 8,
  goldAccent      = false,
  glareIntensity  = 0.12,
  onClick,
  ...rest
}: TiltCardProps) {
  const { ref, rotateX, rotateY, glareX, glareY, onMouseMove, onMouseLeave } = useCardTilt({ maxTilt })

  const isTouchDevice = typeof window !== 'undefined'
    ? window.matchMedia('(hover: none)').matches
    : false

  if (isTouchDevice) {
    return (
      <div className={clsx('relative overflow-hidden', className)} onClick={onClick} {...rest}>
        {children}
      </div>
    )
  }

  return (
    <m.div
      ref={ref}
      className={clsx(
        'relative overflow-hidden',
        onClick && 'cursor-pointer',
        className,
      )}
      style={{
        ...style,
        rotateX,
        rotateY,
        transformPerspective: 800,
        transformStyle: 'preserve-3d',
      }}
      onMouseMove={onMouseMove}
      onMouseLeave={onMouseLeave}
      onClick={onClick}
      {...rest}
    >
      {/* Gold top accent line */}
      {goldAccent && (
        <m.div
          className="absolute top-0 left-0 right-0 h-px bg-dp-gold z-10"
          initial={{ scaleX: 0 }}
          whileHover={{ scaleX: 1 }}
          transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
          style={{ transformOrigin: 'left', boxShadow: '0 0 8px rgba(201,168,76,0.5)' }}
          aria-hidden="true"
        />
      )}

      {/* Glare overlay — the "light hitting paint" effect */}
      <GlareOverlay x={glareX} y={glareY} intensity={glareIntensity} />

      {children}
    </m.div>
  )
}

function GlareOverlay({
  x,
  y,
  intensity,
}: {
  x: MotionValue<number>
  y: MotionValue<number>
  intensity: number
}) {
  const bgX = useTransform(x, v => `${v}%`)
  const bgY = useTransform(y, v => `${v}%`)

  return (
    <m.div
      className="absolute inset-0 pointer-events-none z-10"
      style={{
        background: useTransform(
          [x, y] as MotionValue[],
          ([xv, yv]: number[]) =>
            `radial-gradient(circle at ${xv}% ${yv}%, rgba(201,168,76,${intensity}) 0%, transparent 65%)`,
        ),
      }}
      initial={{ opacity: 0 }}
      whileHover={{ opacity: 1 }}
      transition={{ duration: 0.25 }}
      aria-hidden="true"
    />
  )
}
