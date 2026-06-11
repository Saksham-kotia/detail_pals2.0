/**
 * DETAIL PALS V2 — Home Page (Phase 1+ motion upgrade)
 * ======================================================
 * File: src/pages/HomePage.tsx
 *
 * Motion density additions from reference study:
 *   — InfiniteMarquee between hero and services (brand energy strip)
 *   — InfiniteMarquee between stats and testimonials (reverse direction)
 *   — SplitTextReveal on section headlines (word-by-word assembly)
 *   — TiltCard on service preview cards
 *   — Staggered scroll reveals on all sections
 *   — data-cursor attributes on interactive elements
 */

import { PageWrapper }             from '@/components/ui/PageWrapper'
import { HeroSection }             from '@/components/sections/HeroSection'
import { BrandStripSection }       from '@/components/sections/BrandStripSection'
import { AnatomyBlueprintSection } from '@/components/sections/AnatomyBlueprintSection'
import { GalleryTeaserSection }    from '@/components/sections/GalleryTeaserSection'
import { ReviewsTrustStripSection } from '@/components/sections/ReviewsTrustStripSection'
import { StatsSection }            from '@/components/sections/StatsSection'
import { ExperiencePortalSection } from '@/components/sections/ExperiencePortalSection'
import { BookingCTASection }       from '@/components/sections/BookingCTASection'
import { Footer }                  from '@/components/layout/Footer'
import { MobileStickyBar }         from '@/components/ui/MobileStickyBar'
import { InfiniteMarquee }         from '@/components/ui/InfiniteMarquee'

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
  return (
    <PageWrapper>
      <HeroSection />
      <BrandStripSection />

      {/* ── First marquee: service vocabulary ── */}
      <InfiniteMarquee
        items={MARQUEE_SERVICES}
        direction="left"
        speed="normal"
        highlightEvery={3}
      />

      {/* Interactive Detailing Anatomy Blueprint Map */}
      <AnatomyBlueprintSection />

      {/* Before/After Single Teaser comparison card */}
      <GalleryTeaserSection />

      {/* Google / Facebook trust badge strip */}
      <ReviewsTrustStripSection />

      {/* Technical metrics / stats panel */}
      <StatsSection />

      {/* ── Second marquee: trust signals, reverse direction ── */}
      <InfiniteMarquee
        items={MARQUEE_TRUST}
        direction="right"
        speed="slow"
        highlightEvery={4}
      />

      {/* Experience portal links to major sub-pages */}
      <ExperiencePortalSection />

      {/* Final booking call-to-action */}
      <BookingCTASection />

      <Footer />
      <MobileStickyBar />
    </PageWrapper>
  )
}

