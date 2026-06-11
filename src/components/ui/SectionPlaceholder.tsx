/**
 * DETAIL PALS V2 — Section Placeholder
 * =======================================
 * Renders a clearly-labeled placeholder for sections not yet built.
 * Shows phase number, section name, and status.
 * Maintains correct section IDs so navigation links work immediately.
 */

import { clsx } from 'clsx'

type Props = {
  id: string
  phase: number
  name: string
  status?: 'next' | 'planned'
}

export function SectionPlaceholder({ id, phase, name, status = 'planned' }: Props) {
  return (
    <section
      id={id}
      className="px-[var(--dp-pad-x)] py-16"
      aria-label={`${name} — coming in phase ${phase}`}
    >
      <div className="max-w-[var(--dp-max-w)] mx-auto">
        {/* Gold rule — the gold thread as structural device */}
        <div
          className="w-full h-px mb-12"
          style={{ background: 'linear-gradient(to right, var(--dp-gold), transparent 70%)' }}
          aria-hidden="true"
        />
        <div className={clsx(
          'flex items-center justify-between gap-5 flex-wrap',
          'bg-dp-surface border border-[var(--dp-border)]',
          'border-t border-t-[var(--dp-border-gold)]',
          'px-10 py-8',
        )}>
          <div>
            <p className="font-sans font-normal text-[11px] tracking-[0.20em] uppercase text-dp-gold mb-2">
              Phase {phase}
            </p>
            <p className="font-display font-light text-[28px] text-dp-text-muted opacity-40">
              {name}
            </p>
          </div>
          <span className={clsx(
            'font-sans font-normal text-[11px] tracking-[0.14em] uppercase',
            'border px-3 py-1 whitespace-nowrap',
            status === 'next'
              ? 'text-dp-gold border-[var(--dp-border-gold)]'
              : 'text-dp-text-subtle border-[var(--dp-text-subtle)]',
          )}>
            {status === 'next' ? 'Up next' : 'Planned'}
          </span>
        </div>
      </div>
    </section>
  )
}
