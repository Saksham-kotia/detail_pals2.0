import { useState } from 'react'
import { PageWrapper } from '@/components/ui/PageWrapper'
import { Footer } from '@/components/layout/Footer'
import { MobileStickyBar } from '@/components/ui/MobileStickyBar'
import { AtmosphericBackground } from '@/components/ui/AtmosphericBackground'
import { SplitTextReveal } from '@/components/ui/SplitTextReveal'
import { Eyebrow, springs } from '@/design-system'
import { m, AnimatePresence } from 'framer-motion'

export function ContactPage() {
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [message, setMessage] = useState('')
  const [submitted, setSubmitted] = useState(false)

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (name && email && message) {
      setSubmitted(true)
    }
  }

  return (
    <PageWrapper>
      <div className="relative min-h-screen bg-dp-bg pt-[var(--dp-nav-h)] pb-12 flex flex-col justify-between">
        <AtmosphericBackground variant="showroom" intensity={0.9} />

        <div className="relative z-10 max-w-7xl mx-auto w-full px-6 md:px-12 py-12 flex-1 flex flex-col justify-center">
          {/* Eyebrow and Headline */}
          <div className="text-center mb-4">
            <m.div
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={springs.responsive}
              className="flex justify-center"
            >
              <Eyebrow className="mb-2">CONTACT</Eyebrow>
            </m.div>
            
            <SplitTextReveal
              text="Let's Talk Shine"
              as="h1"
              onMount
              delay={0.1}
              className="font-display font-light text-4xl sm:text-5xl md:text-6xl text-dp-text block mb-12 text-center"
            />
          </div>

          {/* Dual Column Content Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-5 gap-8 lg:gap-12 items-start mt-4">
            
            {/* Left Column: Contact Form (3/5 cols) */}
            <div className="lg:col-span-3">
              <div className="border border-dp-border bg-dp-surface/40 backdrop-blur-md p-8 md:p-10 rounded-2xl relative overflow-hidden">
                <AnimatePresence mode="wait">
                  {!submitted ? (
                    <m.form
                      key="contact-form"
                      onSubmit={handleSubmit}
                      className="space-y-6"
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                      transition={{ duration: 0.3 }}
                    >
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                        <div>
                          <label className="block font-sans font-normal text-[10px] tracking-wider uppercase text-dp-text-muted mb-2">
                            Name
                          </label>
                          <input
                            type="text"
                            required
                            placeholder="Your name"
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                            data-cursor="hide"
                            className="w-full border border-dp-border bg-dp-surface-deep/60 text-dp-text font-sans font-light text-sm px-4 py-3.5 focus:outline-none focus:border-dp-gold transition-colors placeholder:text-dp-text-subtle rounded-none"
                          />
                        </div>
                        <div>
                          <label className="block font-sans font-normal text-[10px] tracking-wider uppercase text-dp-text-muted mb-2">
                            Email
                          </label>
                          <input
                            type="email"
                            required
                            placeholder="you@example.com"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            data-cursor="hide"
                            className="w-full border border-dp-border bg-dp-surface-deep/60 text-dp-text font-sans font-light text-sm px-4 py-3.5 focus:outline-none focus:border-dp-gold transition-colors placeholder:text-dp-text-subtle rounded-none"
                          />
                        </div>
                      </div>

                      <div>
                        <label className="block font-sans font-normal text-[10px] tracking-wider uppercase text-dp-text-muted mb-2">
                          Message
                        </label>
                        <textarea
                          required
                          rows={6}
                          placeholder="Tell us about your vehicle and what it needs..."
                          value={message}
                          onChange={(e) => setMessage(e.target.value)}
                          data-cursor="hide"
                          className="w-full border border-dp-border bg-dp-surface-deep/60 text-dp-text font-sans font-light text-sm px-4 py-3.5 focus:outline-none focus:border-dp-gold transition-colors placeholder:text-dp-text-subtle rounded-none resize-none"
                        />
                      </div>

                      <button
                        type="submit"
                        data-cursor="cta"
                        className="w-full rounded-full bg-dp-gold hover:bg-dp-gold-light text-dp-bg font-sans font-semibold text-sm tracking-widest uppercase py-4 text-center select-none shadow-gold-sm hover:shadow-gold-md transition-all duration-300 active:scale-[0.985] cursor-pointer"
                      >
                        Send Message
                      </button>
                    </m.form>
                  ) : (
                    <m.div
                      key="success-message"
                      initial={{ opacity: 0, scale: 0.96 }}
                      animate={{ opacity: 1, scale: 1 }}
                      transition={springs.gentle}
                      className="text-center py-12"
                    >
                      <div className="w-16 h-16 border border-dp-gold rounded-full flex items-center justify-center mx-auto mb-6 shadow-gold-sm">
                        <span className="text-dp-gold text-2xl">✓</span>
                      </div>
                      <h3 className="font-display font-light text-2xl text-dp-text mb-3">Message Sent</h3>
                      <p className="font-sans font-light text-sm text-dp-text-muted max-w-[360px] mx-auto leading-relaxed">
                        Thank you, {name}. We've received your request and will get back to you within 2 hours.
                      </p>
                      <button
                        onClick={() => {
                          setSubmitted(false)
                          setName('')
                          setEmail('')
                          setMessage('')
                        }}
                        className="mt-8 border border-dp-border px-6 py-3 font-sans text-[10px] uppercase tracking-wider text-dp-text-muted hover:text-dp-text hover:border-dp-border-hover transition-colors bg-transparent cursor-pointer rounded-none"
                      >
                        Send another message
                      </button>
                    </m.div>
                  )}
                </AnimatePresence>
              </div>
            </div>

            {/* Right Column: We Come to You + Map (2/5 cols) */}
            <div className="lg:col-span-2 space-y-6">
              
              {/* Info Card */}
              <div className="border border-dp-border bg-dp-surface/40 backdrop-blur-md p-8 rounded-2xl">
                <h3 className="font-display font-normal text-lg text-dp-gold tracking-wide mb-6">
                  We Come to You
                </h3>
                
                <ul className="space-y-4 list-none p-0 m-0">
                  <li className="flex items-start gap-4">
                    <span className="flex-shrink-0 text-dp-gold mt-0.5">
                      {/* Mobile Van / Detailing Icon */}
                      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="1.5">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M8.25 18.75a1.5 1.5 0 0 1-3 0m3 0a1.5 1.5 0 0 0-3 0m3 0h6m-9 0H3.375a1.125 1.125 0 0 1-1.125-1.125V14.25m17.25 4.5a1.5 1.5 0 0 1-3 0m3 0a1.5 1.5 0 0 0-3 0m3 0h1.125a1.125 1.125 0 0 0 1.125-1.125V9.75M3.75 15.625h16.5m0 0a1.5 1.5 0 0 1-3 0m3 0a1.5 1.5 0 0 0-3 0" />
                        <path strokeLinecap="round" strokeLinejoin="round" d="M16.5 18.75h-2.25m0-11.25V9.75m0 0h1.5m-1.5 0h-3.75V4.875c0-.621.504-1.125 1.125-1.125h3.75c.621 0 1.125 0 1.125 1.125V9.75Z" />
                      </svg>
                    </span>
                    <span className="font-sans font-light text-xs leading-[1.6] text-dp-text-muted">
                      Fully mobile detailing — we bring the shine to your driveway
                    </span>
                  </li>

                  <li className="flex items-start gap-4">
                    <span className="flex-shrink-0 text-dp-gold mt-0.5">
                      {/* Map Pin Icon */}
                      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="1.5">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M15 10.5a3 3 0 1 1-6 0 3 3 0 0 1 6 0Z" />
                        <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 10.5c0 7.142-7.5 11.25-7.5 11.25S4.5 17.642 4.5 10.5a7.5 7.5 0 1 1 15 0Z" />
                      </svg>
                    </span>
                    <span className="font-sans font-light text-xs leading-[1.6] text-dp-text-muted">
                      Serving Calgary & nearby cities
                    </span>
                  </li>

                  <li className="flex items-start gap-4">
                    <span className="flex-shrink-0 text-dp-gold mt-0.5">
                      {/* Phone Icon */}
                      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="1.5">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 6.75c0 8.284 6.716 15 15 15h2.25a2.25 2.25 0 0 0 2.25-2.25v-1.372c0-.516-.351-.966-.852-1.091l-4.423-1.106c-.44-.11-.902.055-1.173.417l-.97 1.293c-2.824-1.802-5.186-4.168-6.99-6.99l1.293-.97c.362-.272.528-.734.417-1.173L6.963 3.102a1.125 1.125 0 0 0-1.091-.852H4.5A2.25 2.25 0 0 0 2.25 4.5v2.25Z" />
                      </svg>
                    </span>
                    <a
                      href="tel:+15879734256"
                      className="font-sans font-light text-xs text-dp-text hover:text-dp-gold transition-colors no-underline"
                    >
                      +1 (587) 973-4256
                    </a>
                  </li>

                  <li className="flex items-start gap-4">
                    <span className="flex-shrink-0 text-dp-gold mt-0.5">
                      {/* Envelope Icon */}
                      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="1.5">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M21.75 6.75v10.5a2.25 2.25 0 0 1-2.25 2.25h-15a2.25 2.25 0 0 1-2.25-2.25V6.75m19.5 0A2.25 2.25 0 0 0 19.5 4.5h-15a2.25 2.25 0 0 0-2.25 2.25m19.5 0v.243a2.25 2.25 0 0 1-1.07 1.916l-7.5 4.615a2.25 2.25 0 0 1-2.36 0L3.32 8.91a2.25 2.25 0 0 1-1.07-1.916V6.75" />
                      </svg>
                    </span>
                    <a
                      href="mailto:ashishphalswal2003@gmail.com"
                      className="font-sans font-light text-xs text-dp-text hover:text-dp-gold transition-colors no-underline break-all"
                    >
                      ashishphalswal2003@gmail.com
                    </a>
                  </li>

                  <li className="flex items-start gap-4">
                    <span className="flex-shrink-0 text-dp-gold mt-0.5">
                      {/* Clock Icon */}
                      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="1.5">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v6h4.5m4.5 0a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z" />
                      </svg>
                    </span>
                    <span className="font-sans font-light text-xs leading-[1.6] text-dp-text-muted">
                      Mon–Sat: 8 AM – 6 PM · Sun: Closed
                    </span>
                  </li>
                </ul>
              </div>

              {/* Map Card */}
              <div className="relative w-full h-[240px] rounded-2xl overflow-hidden border border-dp-border">
                <iframe
                  src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d160533.6496465064!2d-114.24976757695314!3d51.04473309999999!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x537170030f865e9f%3A0x4c8e73b1b61b1d12!2sCalgary%2C%20AB!5e0!3m2!1sen!2sca!4v1718121600000!5m2!1sen!2sca"
                  width="100%"
                  height="100%"
                  style={{ border: 0, filter: 'invert(90%) hue-rotate(180deg) saturate(30%) brightness(90%) contrast(90%)' }}
                  allowFullScreen
                  loading="lazy"
                  referrerPolicy="no-referrer-when-downgrade"
                />
                
                <a
                  href="https://maps.google.com/?q=Calgary,+AB,+Canada"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="absolute top-3 left-3 bg-dp-surface-deep/90 border border-dp-border text-[9px] tracking-wider uppercase text-dp-text-muted hover:text-dp-gold px-2.5 py-1.5 rounded flex items-center gap-1.5 transition-colors no-underline backdrop-blur-sm shadow-sm"
                  data-cursor="hover"
                >
                  <span>Open in Maps</span>
                  <svg viewBox="0 0 16 16" className="w-2.5 h-2.5 fill-none stroke-current" strokeWidth="1.5">
                    <path d="M10 3H13M13 3V6M13 3L7 9M13 10V13C13 13.55 12.55 14 12 14H3C2.45 14 2 13.55 2 13V4C2 3.45 2.45 3 3 3H6" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                </a>
              </div>

            </div>

          </div>
        </div>

        <Footer />
        <MobileStickyBar />
      </div>
    </PageWrapper>
  )
}
