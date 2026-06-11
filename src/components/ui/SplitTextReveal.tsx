/**
 * DETAIL PALS V2 — SplitTextReveal
 * ===================================
 * File: src/components/ui/SplitTextReveal.tsx
 *
 * Splits a headline into individual words and reveals each one
 * with a clip-path wipe + Y translate stagger.
 *
 * This is the "text assembles itself" technique from the reference site.
 * Each word emerges from below its own clip container, creating
 * the impression of precision typesetting happening in real time.
 *
 * Two reveal modes:
 *   'up'    — words slide up into view (default, most impactful for headlines)
 *   'wipe'  — words wipe in via clip-path from left to right (for subtext)
 *
 * Can be triggered either:
 *   - on mount (animate="visible" from the start)
 *   - on scroll entry (whileInView="visible")
 */

import { m } from 'framer-motion'
import { clsx } from 'clsx'
import { useTextSplit } from '@/hooks'

interface SplitTextRevealProps {
  style?: React.CSSProperties
  text:       string
  as?:        'h1' | 'h2' | 'h3' | 'p' | 'span'
  className?: string
  mode?:      'up' | 'wipe'
  /** Delay before the stagger starts, in seconds */
  delay?:     number
  /** Per-word stagger delay, in seconds */
  stagger?:   number
  /** Trigger on mount (true) or scroll entry (false) */
  onMount?:   boolean
}

export function SplitTextReveal({
  text,
  as: Tag   = 'h2',
  className,
  style,
  mode      = 'up',
  delay     = 0,
  stagger   = 0.04,
  onMount   = false,
}: SplitTextRevealProps) {
  const words = useTextSplit(text)

  const containerVariants = {
    hidden:  {},
    visible: {
      transition: {
        staggerChildren: stagger,
        delayChildren:   delay,
      },
    },
  }

  const wordVariantsUp = {
    hidden:  {
      y:       '110%',
      opacity: 0,
      rotateX: 12,
    },
    visible: {
      y:       0,
      opacity: 1,
      rotateX: 0,
      transition: {
        type:      'spring' as const,
        stiffness: 90,
        damping:   18,
        mass:      0.9,
      },
    },
  }

  const wordVariantsWipe = {
    hidden:  {
      clipPath: 'inset(0 100% 0 0)',
      opacity:  0,
    },
    visible: {
      clipPath: 'inset(0 0% 0 0)',
      opacity:  1,
      transition: {
        duration: 0.55,
        ease:     [0.16, 1, 0.3, 1] as any,
      },
    },
  }

  const wordVariants = mode === 'up' ? wordVariantsUp : wordVariantsWipe

  const motionProps = onMount
    ? { initial: 'hidden', animate: 'visible' }
    : { initial: 'hidden', whileInView: 'visible', viewport: { once: true, margin: '-60px' } }

  return (
    <m.div
      variants={containerVariants}
      {...motionProps}
      className="overflow-visible"
    >
      <Tag className={clsx('inline', className)} style={style}>
        {words.map((word, i) => (
          <span
            key={i}
            className="inline-block overflow-hidden"
            style={{
              marginRight: '0.28em',
              verticalAlign: 'bottom',
              // Perspective for rotateX effect (up mode)
              perspective: mode === 'up' ? 600 : undefined,
            }}
          >
            <m.span
              className="inline-block"
              variants={wordVariants}
            >
              {word}
            </m.span>
          </span>
        ))}
      </Tag>
    </m.div>
  )
}
