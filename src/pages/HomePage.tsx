/**
 * DETAIL PALS V2 — Home Page (Refactored Single-Page Upgrade)
 * ==========================================================
 * File: src/pages/HomePage.tsx
 *
 * Modified to support:
 * — Continuous single-page scroll layout containing all visual modules
 * — Lifted state synchronization: Services/Quote selection preloads to Booking Scheduler
 */

import { useState, useEffect } from 'react'
import { useLocation } from 'react-router-dom'
import { PageWrapper }             from '@/components/ui/PageWrapper'
import { HeroSection }             from '@/components/sections/HeroSection'
import { BrandStripSection }       from '@/components/sections/BrandStripSection'
import { AnatomyBlueprintSection } from '@/components/sections/AnatomyBlueprintSection'
import { ServicesSection }         from '@/components/sections/ServicesSection'
import { ProcessSection }          from '@/components/sections/ProcessSection'
import { QuoteSection }            from '@/components/sections/QuoteSection'
import { GallerySection }          from '@/components/sections/GallerySection'
import { ReviewsTrustStripSection } from '@/components/sections/ReviewsTrustStripSection'
import { StatsSection }            from '@/components/sections/StatsSection'
import { TestimonialsSection }     from '@/components/sections/TestimonialsSection'
import { AboutSection }            from '@/components/sections/AboutSection'
import { BookingSection }          from '@/components/sections/BookingSection'
import { ContactSection }          from '@/components/sections/ContactSection'
import { Footer }                  from '@/components/layout/Footer'
import { MobileStickyBar }         from '@/components/ui/MobileStickyBar'
import { InfiniteMarquee }         from '@/components/ui/InfiniteMarquee'

import type { ServiceTier, VehicleType, VehicleCondition } from '@/types'

const MARQUEE_SERVICES = [
  'Paint correction',
  'Ceramic coating',
  'Interior detailing',
  'Swirl removal',
  'Paint sealant',
  'Clay decontamination',
  'Wheel restoration',
  'Headlight restoration',
  'Engine bay detail',
  'Concours preparation',
]

const MARQUEE_TRUST = [
  'Certified detailers',
  '200+ vehicles',
  '4.9★ rating',
  'pH-safe chemistry',
  'Fully insured',
  '8 years of craft',
  'Satisfaction guaranteed',
  'Hand-applied always',
]

export function HomePage() {
  const location = useLocation()

  // Lifted selection state for scheduler
  const [preselectedTier, setPreselectedTier] = useState<ServiceTier | null>(null)
  const [preloadedSetup, setPreloadedSetup] = useState<{
    services: Set<ServiceTier>
    vehicle: VehicleType
    condition: VehicleCondition
    addons: Set<string>
  } | null>(null)

  // Sync scroll positioning with legacy URL paths
  useEffect(() => {
    const path = location.pathname.replace('/', '')
    if (path) {
      const timer = setTimeout(() => {
        const sectionId = path === 'reviews' ? 'reviews' : path
        const el = document.getElementById(sectionId)
        if (el) {
          // @ts-ignore
          window.lenis?.scrollTo(`#${sectionId}`, { offset: -80, immediate: true })
        }
      }, 500)
      return () => clearTimeout(timer)
    }
  }, [location.pathname])

  const handleSelectTier = (tier: ServiceTier) => {
    setPreselectedTier(tier)
    setPreloadedSetup(null) // clear quote-based loading path
  }

  const handleContinueToBooking = (setup: {
    services: Set<ServiceTier>
    vehicle: VehicleType
    condition: VehicleCondition
    addons: Set<string>
  }) => {
    setPreloadedSetup(setup)
    setPreselectedTier(null) // clear single card loading path
  }

  return (
    <PageWrapper>
      {/* 1. Hero Section */}
      <div id="hero">
        <HeroSection />
      </div>
      <BrandStripSection />

      {/* Service vocabulary marquee banner */}
      <InfiniteMarquee
        items={MARQUEE_SERVICES}
        direction="left"
        speed="normal"
        highlightEvery={3}
      />

      {/* 2. Services Section */}
      <ServicesSection onSelectTier={handleSelectTier} />

      {/* 3. Draggable Before/After Work Gallery */}
      <GallerySection />

      {/* Detailing stages infographic */}
      <ProcessSection />

      {/* 4. Paint Anatomy & Blueprint Interactive Map */}
      <AnatomyBlueprintSection />

      {/* 5. Pricing Quote Calculator Configurator */}
      <QuoteSection
        preselectedTier={preselectedTier}
        onContinueToBooking={handleContinueToBooking}
      />

      {/* Trust badges strip */}
      <ReviewsTrustStripSection />

      {/* 6. Testimonials Carousel & Stats Counters */}
      <div id="reviews" className="relative bg-dp-bg border-t border-dp-border">
        <TestimonialsSection />
        <StatsSection />
      </div>

      {/* Trust signals marquee banner */}
      <InfiniteMarquee
        items={MARQUEE_TRUST}
        direction="right"
        speed="slow"
        highlightEvery={4}
      />

      {/* 7. About Brand Story, Timeline & Accreditations */}
      <AboutSection />

      {/* 8. Booking Scheduler Wizard */}
      <BookingSection
        preselectedTier={preselectedTier}
        preloadedSetup={preloadedSetup}
      />

      {/* 9. Contact Details & Maps Form */}
      <ContactSection />

      <Footer />
      <MobileStickyBar />
    </PageWrapper>
  )
}
