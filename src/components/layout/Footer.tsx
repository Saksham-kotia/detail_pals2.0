/**
 * DETAIL PALS V2 — Enhanced Footer (Single-Page Upgrade)
 * =====================================================
 * File: src/components/layout/Footer.tsx
 *
 * Modified to support:
 * — Smooth scrolling to sections on clicking links
 * — Dynamic quote/booking anchoring on same page
 */

import { m, LazyMotion, domAnimation } from 'framer-motion'
import { clsx } from 'clsx'
import { staggerContainer, fadeUp, GoldRule } from '@/design-system'
import { scrollToElement } from '@/lib/scroll'

const FOOTER_EXPLORE = [
  { label: 'Services',       href: '#services' },
  { label: 'Get a Quote',     href: '#quote'    },
  { label: 'Book Online',    href: '#booking'  },
  { label: 'Before & After', href: '#gallery'  },
  { label: 'Reviews',        href: '#reviews'  },
  { label: 'Track Booking',  href: '#track-booking' },
]

const YEAR = new Date().getFullYear()

export function Footer() {
  const handleScrollTo = (e: React.MouseEvent, href: string) => {
    e.preventDefault()
    scrollToElement(href)
  }

  return (
    <LazyMotion features={domAnimation}>
      <footer
        className="bg-dp-bg border-t border-dp-border mt-16 relative overflow-hidden"
        role="contentinfo"
        aria-label="Site footer"
      >
        {/* ── Background Ambient Studio Lights ── */}
        <div className="absolute top-[10%] right-[10%] w-[35%] h-[50%] rounded-full bg-[#C9A84C]/[0.025] filter blur-[100px] pointer-events-none" />
        <div className="absolute bottom-[-10%] left-[5%] w-[40%] h-[50%] rounded-full bg-[#00D2FF]/[0.015] filter blur-[120px] pointer-events-none" />

        {/* ── Background Blueprint Vector Grid Overlay ── */}
        <svg 
          className="absolute inset-0 w-full h-full opacity-[0.022] pointer-events-none z-0" 
          xmlns="http://www.w3.org/2000/svg"
          aria-hidden="true"
        >
          <defs>
            <pattern id="footer-blueprint-grid" width="50" height="50" patternUnits="userSpaceOnUse">
              <path d="M 50 0 L 0 0 0 50" fill="none" stroke="rgba(240, 237, 230, 0.4)" strokeWidth="0.5" />
              <circle cx="0" cy="0" r="1.0" fill="#C9A84C" />
            </pattern>
          </defs>
          <rect width="100%" height="100%" fill="url(#footer-blueprint-grid)" />
        </svg>

        {/* Main Footer Grid Container */}
        <div className="px-[var(--dp-pad-x)] py-20 relative z-10">
          <m.div
            className="max-w-[var(--dp-max-w)] mx-auto grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-12"
            variants={staggerContainer(0.07)}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: '-60px' }}
          >
            {/* Column 1: Brand / Description */}
            <m.div variants={fadeUp} className="flex flex-col gap-6">
              <div className="flex items-center gap-3.5 select-none">
                <div className="bg-dp-gold text-dp-bg font-extrabold rounded p-1 w-7 h-7 flex items-center justify-center text-xs tracking-wider leading-none shadow-gold-sm">
                  DP
                </div>
                <span className="font-sans font-semibold text-sm tracking-[0.22em] uppercase text-dp-text">
                  Detail Pals
                </span>
              </div>
              <p className="font-sans font-light text-sm leading-[1.8] text-dp-text-muted max-w-[280px]">
                Your Car's Best Friend. Premium detailing, honest pricing, showroom results — every single time.
              </p>
            </m.div>

            {/* Column 2: Explore Links */}
            <m.div variants={fadeUp}>
              <p className="font-sans font-bold text-[11px] tracking-[0.25em] uppercase text-dp-gold mb-6">
                Explore
              </p>
              <ul className="flex flex-col gap-3.5 list-none p-0 m-0">
                {FOOTER_EXPLORE.map(({ label, href }) => (
                  <li key={label}>
                    <FooterLink href={href}>{label}</FooterLink>
                  </li>
                ))}
              </ul>
            </m.div>

            {/* Column 3: Contact Details */}
            <m.div variants={fadeUp} className="flex flex-col gap-4">
              <p className="font-sans font-bold text-[11px] tracking-[0.25em] uppercase text-dp-gold mb-2">
                Contact
              </p>
              <a
                href="tel:+15879734256"
                className="font-sans font-light text-sm text-dp-text hover:text-dp-gold transition-colors duration-250 no-underline self-start flex items-center gap-2"
                data-cursor="hover"
              >
                +1 (587) 973-4256
              </a>
              <a
                href="mailto:ashishphalswal2003@gmail.com"
                className="font-sans font-light text-sm text-dp-text hover:text-dp-gold transition-colors duration-250 no-underline self-start break-all"
                data-cursor="hover"
              >
                ashishphalswal2003@gmail.com
              </a>
              <p className="font-sans font-light text-sm text-dp-text-muted leading-[1.6] mt-1">
                Mobile service — Calgary & nearby cities
              </p>
              <p className="font-sans font-light text-sm text-dp-text-muted">
                Mon–Sat: 8 AM – 6 PM
              </p>
            </m.div>

            {/* Column 4: CTA and Socials */}
            <m.div variants={fadeUp} className="flex flex-col gap-5">
              <p className="font-sans font-bold text-[11px] tracking-[0.25em] uppercase text-dp-gold mb-1">
                Ready to Shine?
              </p>
              <p className="font-sans font-light text-sm leading-[1.65] text-dp-text-muted">
                Get an instant quote in under 60 seconds.
              </p>
              
              {/* Pulsing Pill CTA */}
              <a
                href="#quote"
                onClick={(e) => handleScrollTo(e, '#quote')}
                className="inline-flex items-center justify-center font-sans font-semibold text-xs tracking-widest uppercase text-dp-bg bg-dp-gold hover:bg-dp-gold-light px-7 py-3.5 rounded-full shadow-gold-sm hover:shadow-gold-md hover:scale-[1.03] active:scale-[0.985] transition-all duration-300 select-none no-underline max-w-max border border-dp-gold animate-glow-breathe cursor-pointer"
                data-cursor="cta"
              >
                Get My Quote
              </a>

              {/* Social Buttons */}
              <div className="flex items-center gap-3.5 mt-2">
                {[
                  {
                    label: 'Instagram',
                    href: '#',
                    svg: (
                      <svg className="w-4 h-4 fill-none stroke-current" strokeWidth="1.5" viewBox="0 0 24 24">
                        <rect x="2" y="2" width="20" height="20" rx="5" ry="5" />
                        <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z" />
                        <line x1="17.5" y1="6.5" x2="17.51" y2="6.5" />
                      </svg>
                    )
                  },
                  {
                    label: 'Facebook',
                    href: '#',
                    svg: (
                      <svg className="w-4 h-4 fill-none stroke-current" strokeWidth="1.5" viewBox="0 0 24 24">
                        <path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z" />
                      </svg>
                    )
                  },
                  {
                    label: 'TikTok',
                    href: '#',
                    svg: (
                      <svg className="w-4 h-4 fill-none stroke-current" strokeWidth="1.5" viewBox="0 0 24 24">
                        <path d="M9 12a4 4 0 1 0 4 4V4a5 5 0 0 0 5 5" strokeLinecap="round" strokeLinejoin="round" />
                      </svg>
                    )
                  }
                ].map(s => (
                  <a
                    key={s.label}
                    href={s.href}
                    className="w-9 h-9 rounded-full border border-dp-border flex items-center justify-center text-dp-text-muted hover:text-dp-gold hover:border-dp-gold hover:scale-110 active:scale-95 transition-all duration-300 no-underline"
                    aria-label={`Follow us on ${s.label}`}
                    data-cursor="hover"
                  >
                    {s.svg}
                  </a>
                ))}
              </div>
            </m.div>
          </m.div>
        </div>

        {/* Bottom bar + final gold rule */}
        <div className="px-[var(--dp-pad-x)] pb-10 relative z-10">
          <div className="max-w-[var(--dp-max-w)] mx-auto">
            <GoldRule className="mb-6" />
            <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-2">
              <p className="font-sans font-light text-xs text-dp-text-muted">
                © {YEAR} Detail Pals. All rights reserved.
              </p>
              <a
                href="#/admin/login"
                className="font-sans font-light text-xs text-dp-text-muted hover:text-dp-gold transition-colors duration-200 no-underline"
                data-cursor="hover"
              >
                Staff Login
              </a>
            </div>
          </div>
        </div>
      </footer>
    </LazyMotion>
  )
}

function FooterLink({ href, children }: { href: string; children: React.ReactNode }) {
  const handleScroll = (e: React.MouseEvent) => {
    e.preventDefault()
    scrollToElement(href)
  }

  return (
    <a
      href={href}
      onClick={handleScroll}
      className={clsx(
        'relative font-sans font-light text-sm text-dp-text-muted',
        'hover:text-dp-text no-underline',
        'transition-colors duration-250',
        'group inline-block',
      )}
      data-cursor="hover"
    >
      {children}
      <span
        className="absolute bottom-0 left-0 h-px bg-dp-gold w-0 group-hover:w-full transition-[width] duration-300 ease-dp-out"
        aria-hidden="true"
      />
    </a>
  )
}
