/**
 * DETAIL PALS V2 — Mobile Sticky Booking Bar
 * =============================================
 * File: src/components/ui/MobileStickyBar.tsx
 *
 * Appears on mobile after the user scrolls past the hero.
 * Always one tap away from the booking flow.
 * Respects iOS safe-area-inset-bottom.
 *
 * Converts 3-5× better than relying on the hero CTA alone
 * because it's always visible during the consideration phase.
 */

import { useEffect, useState } from 'react'
import { m, LazyMotion, domAnimation, AnimatePresence } from 'framer-motion'
import { clsx } from 'clsx'
import { springs } from '@/design-system'

export function MobileStickyBar() {
  const [visible, setVisible] = useState(false)

  useEffect(() => {
    let ticking = false
    const onScroll = () => {
      if (!ticking) {
        requestAnimationFrame(() => {
          // Show after scrolling past ~80vh
          setVisible(window.scrollY > window.innerHeight * 0.8)
          ticking = false
        })
        ticking = true
      }
    }
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  return (
    <LazyMotion features={domAnimation}>
      <AnimatePresence>
        {visible && (
          <m.div
            className="fixed bottom-0 left-0 right-0 z-[800] md:hidden"
            initial={{ y: '100%' }}
            animate={{ y: 0 }}
            exit={{ y: '100%' }}
            transition={springs.responsive}
            style={{ paddingBottom: 'env(safe-area-inset-bottom, 0px)' }}
          >
            <div className="bg-dp-surface border-t border-dp-border px-4 py-3 flex items-center gap-3">
              <div className="flex-1 min-w-0">
                <p className="font-sans font-normal text-xs tracking-[0.06em] text-dp-text truncate">
                  Detail Pals
                </p>
                <p className="font-sans font-light text-[11px] text-dp-text-muted truncate">
                  From $249 · Available 6 days a week
                </p>
              </div>
              <a
                href="#booking"
                className={clsx(
                  'flex-shrink-0 relative overflow-hidden',
                  'inline-flex items-center gap-2',
                  'font-sans font-normal text-xs tracking-[0.10em] uppercase',
                  'text-dp-bg bg-dp-gold border border-dp-gold',
                  'px-5 py-3 rounded-none',
                  'no-underline group',
                  'transition-[background] duration-200',
                  'hover:bg-dp-gold-light',
                )}
              >
                <span>Book now</span>
                <svg className="w-3 h-3 group-hover:translate-x-[2px] transition-transform duration-200" viewBox="0 0 14 14" fill="none" aria-hidden="true">
                  <path d="M1 7H13M8 2L13 7L8 12" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
              </a>
            </div>
          </m.div>
        )}
      </AnimatePresence>
    </LazyMotion>
  )
}
