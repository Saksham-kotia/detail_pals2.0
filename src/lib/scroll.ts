/**
 * scroll.ts — Smooth scroll helper with mobile native fallback.
 * ==========================================================
 * Handles smooth scrolling with offset for both Lenis-enabled
 * desktop devices and touch-only mobile devices (native scrolling).
 */

export function scrollToElement(id: string, offset = 0) {
  // Normalize id
  if (!id.startsWith('#') && !id.startsWith('.') && id !== 'body') {
    id = `#${id}`
  }

  const lenis = (window as any).lenis

  // Handle scrolling to top of the page
  if (id === '#hero' || id === '#top' || id === 'body') {
    if (lenis) {
      lenis.scrollTo(0)
    } else {
      window.scrollTo({ top: 0, behavior: 'smooth' })
    }
    return
  }

  const element = document.querySelector(id)
  if (!element) return

  if (lenis) {
    lenis.scrollTo(id, { offset: -offset })
  } else {
    const elementPosition = element.getBoundingClientRect().top + window.scrollY
    const offsetPosition = elementPosition - offset
    window.scrollTo({
      top: offsetPosition,
      behavior: 'smooth'
    })
  }
}
