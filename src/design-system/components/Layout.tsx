/**
 * DETAIL PALS V2 — Layout Primitives
 * =====================================
 * File: src/design-system/components/Layout.tsx
 *
 * Reusable structural components shared by every section.
 * These encode the spacing system and visual grammar.
 *
 * Components:
 *   <Section>     — full-width section wrapper with consistent padding
 *   <SectionInner> — max-width container
 *   <GoldRule>    — 1px gold horizontal line ("the gold thread" as divider)
 *   <Eyebrow>     — small caps label above section headlines
 */

import { forwardRef } from 'react'
import { clsx } from 'clsx'

// ─────────────────────────────────────────────────────────────
// Section
// ─────────────────────────────────────────────────────────────

type SectionProps = {
  children: React.ReactNode
  className?: string
  id?: string
  /** Remove top padding — useful when stacking sections that share a background */
  noTopPad?: boolean
  /** Remove bottom padding */
  noBottomPad?: boolean
  as?: 'section' | 'div' | 'article'
}

export function Section({
  children,
  className,
  id,
  noTopPad,
  noBottomPad,
  as: Tag = 'section',
}: SectionProps) {
  return (
    <Tag
      id={id}
      className={clsx(
        'relative w-full',
        'px-[var(--dp-pad-x)]',
        !noTopPad    && 'pt-[var(--dp-pad-y)]',
        !noBottomPad && 'pb-[var(--dp-pad-y)]',
        className,
      )}
    >
      {children}
    </Tag>
  )
}

// ─────────────────────────────────────────────────────────────
// SectionInner
// ─────────────────────────────────────────────────────────────

type SectionInnerProps = {
  children: React.ReactNode
  className?: string
  /** Narrow content column (text-heavy sections) */
  narrow?: boolean
}

export function SectionInner({ children, className, narrow }: SectionInnerProps) {
  return (
    <div
      className={clsx(
        'mx-auto w-full',
        narrow ? 'max-w-[var(--dp-max-w-text)]' : 'max-w-[var(--dp-max-w)]',
        className,
      )}
    >
      {children}
    </div>
  )
}

// ─────────────────────────────────────────────────────────────
// GoldRule — the gold thread as a horizontal divider
// ─────────────────────────────────────────────────────────────

type GoldRuleProps = {
  className?: string
  /** 'left' fades right (default), 'center' radiates from center, 'full' solid */
  direction?: 'left' | 'center' | 'full'
}

export function GoldRule({ className, direction = 'left' }: GoldRuleProps) {
  const gradients = {
    left:   'linear-gradient(to right, var(--dp-gold), transparent 70%)',
    center: 'linear-gradient(to right, transparent, var(--dp-gold) 40%, var(--dp-gold) 60%, transparent)',
    full:   'var(--dp-gold)',
  }

  return (
    <div
      className={clsx('w-full h-px', className)}
      style={{ background: gradients[direction] }}
      aria-hidden="true"
    />
  )
}

// ─────────────────────────────────────────────────────────────
// Eyebrow — small caps label above section headlines
// ─────────────────────────────────────────────────────────────

type EyebrowProps = {
  children: React.ReactNode
  className?: string
}

export function Eyebrow({ children, className }: EyebrowProps) {
  return (
    <p
      className={clsx(
        'flex items-center gap-[14px]',
        'font-sans font-normal text-xs tracking-widest2 uppercase',
        'text-dp-gold',
        className,
      )}
    >
      {/* The gold thread as a short horizontal line before the label */}
      <span className="block w-6 h-px bg-dp-gold flex-shrink-0" aria-hidden="true" />
      {children}
    </p>
  )
}

// ─────────────────────────────────────────────────────────────
// SectionHeadline — display serif headline
// ─────────────────────────────────────────────────────────────

type HeadlineProps = {
  children: React.ReactNode
  className?: string
  as?: 'h1' | 'h2' | 'h3'
}

export function SectionHeadline({ children, className, as: Tag = 'h2' }: HeadlineProps) {
  return (
    <Tag
      className={clsx(
        'font-display font-light leading-tight tracking-display',
        'text-section text-dp-text',
        className,
      )}
    >
      {children}
    </Tag>
  )
}

// ─────────────────────────────────────────────────────────────
// BodyText — standard paragraph with correct leading
// ─────────────────────────────────────────────────────────────

type BodyTextProps = {
  children: React.ReactNode
  className?: string
}

export function BodyText({ children, className }: BodyTextProps) {
  return (
    <p
      className={clsx(
        'font-sans font-light text-base',
        'leading-[1.78] tracking-body',
        'text-[rgba(240,237,230,0.55)]',
        className,
      )}
    >
      {children}
    </p>
  )
}
