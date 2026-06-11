import { useEffect, useState } from 'react'

/**
 * Returns true when window.scrollY exceeds the given threshold.
 * Uses a passive RAF-batched scroll listener for performance.
 */
export function useScrolled(threshold = 80): boolean {
  const [scrolled, setScrolled] = useState(false)

  useEffect(() => {
    let ticking = false

    const onScroll = () => {
      if (!ticking) {
        requestAnimationFrame(() => {
          setScrolled(window.scrollY > threshold)
          ticking = false
        })
        ticking = true
      }
    }

    window.addEventListener('scroll', onScroll, { passive: true })
    onScroll() // sync initial state
    return () => window.removeEventListener('scroll', onScroll)
  }, [threshold])

  return scrolled
}
