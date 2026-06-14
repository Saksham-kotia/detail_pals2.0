'use client'
/**
 * DETAIL PALS V2 — Navbar (Single-Page Upgrade)
 * ===========================================
 * File: src/components/layout/Navbar.tsx
 *
 * Modified to support:
 * — Smooth scrolling via global Lenis instance
 * — IntersectionObserver-based active section tracking (scroll spy)
 * — Pure single-page anchoring
 */

import { useState, useEffect } from 'react'
import { m, AnimatePresence, useScroll, useTransform, LazyMotion, domAnimation } from 'framer-motion'
import { clsx } from 'clsx'
import { useScrolled } from '@/hooks'
import { scrollToElement } from '@/lib/scroll'

const NAV_LINKS = [
  { href: '#services', label: 'Services'  },
  { href: '#quote',    label: 'Get a Quote' },
  { href: '#gallery',  label: 'Gallery'   },
  { href: '#reviews',  label: 'Reviews'   },
  { href: '#about',    label: 'About'     },
  { href: '#contact',  label: 'Contact'   },
] as const

export function Navbar() {
  const scrolled    = useScrolled(80)
  const [open, setOpen] = useState(false)
  const [activeSection, setActiveSection] = useState('')

  const { scrollYProgress } = useScroll()
  const scaleX = useTransform(scrollYProgress, [0, 1], [0, 1])

  useEffect(() => {
    document.body.style.overflow = open ? 'hidden' : ''
    return () => { document.body.style.overflow = '' }
  }, [open])

  useEffect(() => {
    const h = (e: KeyboardEvent) => { if (e.key === 'Escape') setOpen(false) }
    window.addEventListener('keydown', h)
    return () => window.removeEventListener('keydown', h)
  }, [])

  // IntersectionObserver scroll-spy setup
  useEffect(() => {
    const sections = ['services', 'quote', 'gallery', 'reviews', 'about', 'contact', 'booking']
    
    const observers = sections.map(id => {
      const el = document.getElementById(id)
      if (!el) return null
      
      const observer = new IntersectionObserver(
        ([entry]) => {
          if (entry.isIntersecting) {
            setActiveSection(`#${id}`)
          }
        },
        { rootMargin: '-35% 0px -55% 0px' } // active when occupying the viewport center
      )
      observer.observe(el)
      return { observer, el }
    })

    return () => {
      observers.forEach(o => {
        if (o) o.observer.unobserve(o.el)
      })
    }
  }, [])

  const handleScrollTo = (e: React.MouseEvent, href: string) => {
    e.preventDefault()
    setOpen(false)
    scrollToElement(href)
  }

  return (
    <LazyMotion features={domAnimation}>

      {/* ── Scroll progress gold thread ── */}
      <m.div
        className="fixed top-0 left-0 right-0 h-px z-[1000] origin-left"
        style={{
          scaleX,
          backgroundColor: 'var(--dp-gold)',
          boxShadow: '0 0 8px rgba(201,168,76,0.6)',
        }}
        aria-hidden="true"
      />

      {/* ── Main nav ── */}
      <header
        className={clsx(
          'fixed top-0 left-0 right-0 z-[900]',
          'flex items-center h-[var(--dp-nav-h)]',
          'px-[var(--dp-pad-x)]',
          'transition-[background-color,border-color] duration-[600ms] ease-dp-out',
          scrolled
            ? 'border-b border-[var(--dp-border)] bg-[rgba(7,7,7,0.88)]'
            : 'border-b border-transparent bg-transparent',
        )}
        style={scrolled ? { backdropFilter: 'var(--dp-glass-blur)', WebkitBackdropFilter: 'var(--dp-glass-blur)' } : {}}
        role="banner"
      >
        <div className="w-full max-w-[var(--dp-max-w)] mx-auto flex items-center justify-between">

          {/* Logo */}
          <a
            href="#hero"
            onClick={(e) => handleScrollTo(e, '#hero')}
            className="font-sans font-normal text-xs tracking-[0.28em] uppercase text-dp-text no-underline select-none transition-colors duration-300 hover:text-dp-gold"
            aria-label="Detail Pals — Home"
          >
            DETAIL&nbsp;
            <span
              className="text-dp-gold font-medium"
              style={{ textShadow: scrolled ? 'var(--dp-gold-text-glow)' : 'none', transition: 'text-shadow 0.4s' }}
            >
              PALS
            </span>
          </a>

          {/* Desktop links */}
          <nav className="hidden lg:flex items-center gap-8" aria-label="Primary navigation">
            {NAV_LINKS.map(({ href, label }) => {
              const isActive = activeSection === href
              return (
                <a
                  key={href}
                  href={href}
                  onClick={(e) => handleScrollTo(e, href)}
                  className={clsx(
                    'relative font-sans font-light text-sm tracking-nav no-underline pb-[2px]',
                    'transition-colors duration-300 ease-dp-out group',
                    isActive
                      ? 'text-dp-gold'
                      : 'text-[rgba(240,237,230,0.65)] hover:text-dp-text',
                  )}
                >
                  {label}
                  {/* Gold thread underline */}
                  <span
                    className={clsx(
                      'absolute bottom-[-1px] left-0 w-full h-px bg-dp-gold',
                      'transition-[transform,opacity] duration-300 ease-dp-out origin-left',
                      isActive
                        ? 'scale-x-100 opacity-100'
                        : 'scale-x-0 opacity-0 group-hover:scale-x-100 group-hover:opacity-100',
                    )}
                    style={isActive ? { boxShadow: '0 0 6px rgba(201,168,76,0.5)' } : {}}
                    aria-hidden="true"
                  />
                </a>
              )
            })}
          </nav>

          {/* Desktop CTA */}
          <a
            href="#booking"
            onClick={(e) => handleScrollTo(e, '#booking')}
            className="hidden lg:inline-flex group"
            aria-label="Book a detail"
          >
            <span className={clsx(
              'relative overflow-hidden inline-flex items-center',
              'font-sans font-normal text-sm tracking-nav',
              'text-dp-gold border border-[var(--dp-border-gold)]',
              'px-[22px] py-[9px] rounded-none',
              'transition-colors duration-300 ease-dp-out cursor-pointer',
              scrolled && 'animate-glow-breathe',
            )}>
              <span className="absolute inset-0 bg-dp-gold scale-x-0 group-hover:scale-x-100 origin-left transition-transform duration-300 ease-dp-out z-0" aria-hidden="true"/>
              <span className="relative z-10 group-hover:text-dp-bg transition-colors duration-300">Book Now</span>
            </span>
          </a>

          {/* Hamburger */}
          <button
            className="lg:hidden flex flex-col gap-[5px] p-2 bg-transparent border-none cursor-pointer z-[1010]"
            onClick={() => setOpen(v => !v)}
            aria-label={open ? 'Close navigation' : 'Open navigation'}
            aria-expanded={open}
            aria-controls="mobile-nav"
          >
            {[0, 1, 2].map(i => (
              <m.span
                key={i}
                className="block w-6 h-px bg-dp-text"
                animate={
                  i === 0 ? (open ? { y: 6,  rotate: 45  } : { y: 0, rotate: 0  }) :
                  i === 1 ? (open ? { opacity: 0, scaleX: 0 } : { opacity: 1, scaleX: 1 }) :
                            (open ? { y: -6, rotate: -45 } : { y: 0, rotate: 0  })
                }
                transition={{ duration: 0.25, ease: [0.16,1,0.3,1] }}
              />
            ))}
          </button>
        </div>
      </header>

      {/* ── Mobile overlay ── */}
      <AnimatePresence>
        {open && (
          <m.nav
            id="mobile-nav"
            className="fixed inset-0 z-[950] flex flex-col justify-center items-center gap-3"
            style={{ backgroundColor: 'rgba(7,7,7,0.97)', backdropFilter: 'var(--dp-glass-blur)' }}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3, ease: [0.16,1,0.3,1] }}
            aria-label="Mobile navigation"
          >
            {NAV_LINKS.map(({ href, label }, i) => {
              const isActive = activeSection === href
              return (
                <m.div
                  key={href}
                  initial={{ opacity: 0, y: 14 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: 8 }}
                  transition={{ delay: i * 0.06, duration: 0.4, ease: [0.16,1,0.3,1] }}
                >
                  <a
                    href={href}
                    onClick={(e) => handleScrollTo(e, href)}
                    className={clsx(
                      'block font-display font-light text-[clamp(28px,5.5vw,44px)] tracking-[0.04em]',
                      'no-underline py-2 transition-colors duration-200 text-center',
                      isActive ? 'text-dp-gold' : 'text-dp-text hover:text-dp-gold',
                    )}
                  >
                    {label}
                  </a>
                </m.div>
              )
            })}
            <m.div
              className="w-px h-10 my-2"
              style={{ backgroundColor: 'var(--dp-gold)' }}
              initial={{ opacity: 0 }} animate={{ opacity: 0.4 }} transition={{ delay: 0.4 }}
              aria-hidden="true"
            />
            <m.div
              initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.44, duration: 0.4, ease: [0.16,1,0.3,1] }}
            >
              <a
                href="#booking"
                onClick={(e) => handleScrollTo(e, '#booking')}
                className="block font-sans font-normal text-[13px] tracking-[0.16em] uppercase text-dp-gold border border-[var(--dp-border-gold)] px-9 py-4 mt-2 hover:bg-dp-gold hover:text-dp-bg transition-colors duration-200 no-underline text-center"
              >
                Book Now
              </a>
            </m.div>
          </m.nav>
        )}
      </AnimatePresence>

    </LazyMotion>
  )
}
