/**
 * DETAIL PALS V2 — Button Primitives (Phase 1 upgrade)
 * ======================================================
 * File: src/design-system/components/Button.tsx
 *
 * Now accepts either:
 *   href  → renders as <a> (external / anchor links)
 *   to    → renders as React Router <Link> (internal navigation)
 *   as="button" → renders as <button> (click handlers)
 *
 * PrimaryButton: gold fill + shimmer sweep + glow on hover
 * GhostButton:   text + gold underline draw
 * ArrowRight:    shared arrow icon
 */

import { forwardRef } from 'react'
import { Link } from 'react-router-dom'
import { clsx } from 'clsx'

type BaseProps = {
  children:   React.ReactNode
  className?: string
  onClick?:   () => void
  disabled?:  boolean
  'aria-label'?: string
  'aria-disabled'?: boolean
}

type AnchorVariant = BaseProps & { href: string;    to?: never; as?: 'a' }
type RouterVariant = BaseProps & { to:   string;    href?: never; as?: 'link' }
type ButtonVariant = BaseProps & { as:   'button';  href?: never; to?: never }

type PolymorphicProps = AnchorVariant | RouterVariant | ButtonVariant

// ── PrimaryButton ──────────────────────────────────────────

export const PrimaryButton = forwardRef<HTMLElement, PolymorphicProps>(
  ({ children, className, onClick, disabled, to, href, as: asType, ...rest }, _ref) => {
    const base = clsx(
      'relative inline-flex items-center justify-center gap-[10px]',
      'overflow-hidden',
      'font-sans font-normal text-sm tracking-nav uppercase',
      'text-dp-bg bg-dp-gold border border-dp-gold',
      'rounded-none px-8 py-[14px]',
      'cursor-pointer select-none no-underline',
      'transition-[background-color,border-color,box-shadow] duration-[300ms] ease-dp-out',
      'hover:bg-dp-gold-light hover:border-dp-gold-light hover:shadow-gold-sm',
      'active:scale-[0.984]',
      'focus-visible:outline focus-visible:outline-2 focus-visible:outline-dp-gold focus-visible:outline-offset-2',
      'disabled:opacity-40 disabled:cursor-not-allowed',
      'group',
      className,
    )

    const inner = (
      <>
        <span
          className="absolute top-0 left-[-100%] w-[60%] h-full pointer-events-none group-hover:left-[160%] transition-[left] duration-500 ease-dp-out"
          style={{ background: 'linear-gradient(105deg, transparent 20%, rgba(255,255,255,0.22) 50%, transparent 80%)' }}
          aria-hidden="true"
        />
        <span className="relative z-10 flex items-center gap-[10px]">{children}</span>
      </>
    )

    if (to) return (
      <Link to={to} className={base} onClick={onClick} {...(rest as any)}>{inner}</Link>
    )
    if (asType === 'button') return (
      <button className={base} onClick={onClick} disabled={disabled} {...(rest as any)}>{inner}</button>
    )
    return (
      <a href={href} className={base} onClick={onClick} {...(rest as any)}>{inner}</a>
    )
  }
)
PrimaryButton.displayName = 'PrimaryButton'

// ── GhostButton ───────────────────────────────────────────

export const GhostButton = forwardRef<HTMLElement, PolymorphicProps>(
  ({ children, className, onClick, to, href, as: asType, ...rest }, _ref) => {
    const base = clsx(
      'relative inline-flex items-center gap-2',
      'font-sans font-light text-sm tracking-[0.06em]',
      'text-[rgba(240,237,230,0.65)] no-underline pb-[2px]',
      'cursor-pointer select-none',
      'transition-colors duration-[300ms] ease-dp-out',
      'hover:text-dp-text',
      'focus-visible:outline focus-visible:outline-2 focus-visible:outline-dp-gold focus-visible:outline-offset-2',
      'group',
      className,
    )

    const inner = (
      <>
        {children}
        <span
          className="absolute bottom-0 left-0 h-px bg-dp-gold w-0 group-hover:w-full transition-[width] duration-[300ms] ease-dp-out"
          aria-hidden="true"
        />
      </>
    )

    if (to) return (
      <Link to={to} className={base} onClick={onClick} {...(rest as any)}>{inner}</Link>
    )
    if (asType === 'button') return (
      <button className={base} onClick={onClick} {...(rest as any)}>{inner}</button>
    )
    return (
      <a href={href} className={base} onClick={onClick} {...(rest as any)}>{inner}</a>
    )
  }
)
GhostButton.displayName = 'GhostButton'

// ── ArrowRight ────────────────────────────────────────────

export function ArrowRight({ className }: { className?: string }) {
  return (
    <svg
      className={clsx(
        'w-[14px] h-[14px] flex-shrink-0',
        'transition-transform duration-[300ms] ease-dp-out',
        'group-hover:translate-x-[3px]',
        className,
      )}
      viewBox="0 0 14 14" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true"
    >
      <path d="M1 7H13M8 2L13 7L8 12" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round"/>
    </svg>
  )
}
