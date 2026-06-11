/**
 * DETAIL PALS V2 — PageTransitionOverlay
 * ========================================
 * File: src/components/ui/PageTransitionOverlay.tsx
 *
 * A 1px gold thread that sweeps across the screen from left to right
 * during every page transition. Mounted at the app root, it listens
 * to location changes via React Router and triggers on each navigation.
 *
 * The sweep takes 350ms — fast enough to feel responsive, long enough
 * to register as a branded transition moment.
 */

import { useEffect, useState } from 'react'
import { useLocation } from 'react-router-dom'
import { m, AnimatePresence } from 'framer-motion'

export function PageTransitionOverlay() {
  const location  = useLocation()
  const [sweeping, setSweeping] = useState(false)

  useEffect(() => {
    const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches
    if (reduced) return

    setSweeping(true)
    const t = setTimeout(() => setSweeping(false), 500)
    return () => clearTimeout(t)
  }, [location.pathname])

  return (
    <AnimatePresence>
      {sweeping && (
        <m.div
          key={location.pathname}
          className="fixed top-0 left-0 right-0 z-[8000] pointer-events-none overflow-hidden"
          style={{ height: '2px' }}
          aria-hidden="true"
        >
          {/* Gold thread sweep */}
          <m.div
            className="absolute top-0 left-0 h-full bg-dp-gold"
            style={{ boxShadow: 'var(--dp-gold-glow-sm)' }}
            initial={{ width: '0%', x: '0%' }}
            animate={{ width: ['0%', '100%', '100%'], x: ['0%', '0%', '100%'] }}
            transition={{
              duration: 0.5,
              times: [0, 0.6, 1],
              ease: [0.16, 1, 0.3, 1],
            }}
          />
        </m.div>
      )}
    </AnimatePresence>
  )
}
