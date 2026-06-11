/**
 * DETAIL PALS V2 — App Root (Phase 1+ reference upgrade)
 * =========================================================
 * File: src/App.tsx
 *
 * New additions from Tingly reference study:
 *   — Lenis smooth scroll initialized at root
 *   — CustomCursor mounted globally
 *   — HashRouter (works on any static host)
 *   — AnimatePresence with cinematic page transitions
 *   — PageTransitionOverlay (gold thread sweep)
 *   — IntroSequence (first-visit only)
 */

import { useState, useEffect } from 'react'
import { HashRouter, Routes, Route, useLocation } from 'react-router-dom'
import { AnimatePresence, LazyMotion, domAnimation } from 'framer-motion'

import { Navbar }                 from './components/layout/Navbar'
import { CustomCursor }           from './components/ui/CustomCursor'
import { AudioController }        from './components/ui/AudioController'
import { IntroSequence, shouldShowIntro } from './components/ui/IntroSequence'
import { PageTransitionOverlay }  from './components/ui/PageTransitionOverlay'
import { useLenis }               from './hooks'

import { HomePage }     from './pages/HomePage'
import { ServicesPage } from './pages/ServicesPage'
import { GalleryPage }  from './pages/GalleryPage'
import { QuotePage }    from './pages/QuotePage'
import { ReviewsPage }  from './pages/ReviewsPage'
import { AboutPage }    from './pages/AboutPage'
import { BookingPage }  from './pages/BookingPage'
import { ContactPage }  from './pages/ContactPage'

function AnimatedRoutes() {
  const location = useLocation()
  return (
    <AnimatePresence mode="wait">
      <Routes location={location} key={location.pathname}>
        <Route path="/"         element={<HomePage />}     />
        <Route path="/services" element={<ServicesPage />} />
        <Route path="/gallery"  element={<GalleryPage />}  />
        <Route path="/quote"    element={<QuotePage />}    />
        <Route path="/reviews"  element={<ReviewsPage />}  />
        <Route path="/about"    element={<AboutPage />}    />
        <Route path="/booking"  element={<BookingPage />}  />
        <Route path="/contact"  element={<ContactPage />}  />
        <Route path="*"         element={<HomePage />}     />
      </Routes>
    </AnimatePresence>
  )
}

function AppInner() {
  // Let's scroll Lenis smooth scroll — initialized once inside Router context
  useLenis()
  return (
    <>
      <PageTransitionOverlay />
      <Navbar />
      <AnimatedRoutes />
    </>
  )
}

export default function App() {
  const [introComplete, setIntroComplete] = useState(!shouldShowIntro())

  return (
    <LazyMotion features={domAnimation}>
      {/* Custom cursor — global, above everything */}
      <CustomCursor />

      {/* Ambient Sound drone — floats at bottom-right */}
      <AudioController />

      {/* Intro sequence — slides up to reveal app */}
      {!introComplete && (
        <IntroSequence onComplete={() => setIntroComplete(true)} />
      )}

      <HashRouter>
        <AppInner />
      </HashRouter>
    </LazyMotion>
  )
}
