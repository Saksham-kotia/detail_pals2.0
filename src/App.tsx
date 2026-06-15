/**
 * DETAIL PALS V2 — App Root (Backend Integrated)
 * =========================================================
 * Cinematic frontend preserved exactly as-is.
 * Backend/admin system added safely underneath.
 */

import { useState } from 'react'
import {
  HashRouter,
  Routes,
  Route,
  useLocation,
} from 'react-router-dom'

import {
  AnimatePresence,
  LazyMotion,
  domAnimation,
} from 'framer-motion'

import { lazy, Suspense } from 'react'

import { Navbar } from './components/layout/Navbar'
import { CustomCursor } from './components/ui/CustomCursor'
import { AudioController } from './components/ui/AudioController'
import {
  IntroSequence,
  shouldShowIntro,
} from './components/ui/IntroSequence'

import { PageTransitionOverlay } from './components/ui/PageTransitionOverlay'

import { useLenis } from './hooks'

import { HomePage } from './pages/HomePage'

import { AuthProvider } from './context/AuthContext'
import { ProtectedRoute } from './components/ProtectedRoute'

// ─────────────────────────────────────────────────────────────
// Admin Pages (lazy-loaded → zero impact on cinematic frontend)
// ─────────────────────────────────────────────────────────────

const AdminLogin = lazy(() => import('./admin/pages/AdminLogin'))
const AdminLayout = lazy(() => import('./admin/pages/AdminLayout'))
const AdminDashboard = lazy(() => import('./admin/pages/AdminDashboard'))
const AdminBookings = lazy(() => import('./admin/pages/AdminBookings'))
const AdminHistory = lazy(() => import('./admin/pages/AdminHistory'))
const AdminServices = lazy(() => import('./admin/pages/AdminServices'))
const AdminContacts = lazy(() => import('./admin/pages/AdminContacts'))
const AdminEmailLogs = lazy(() => import('./admin/pages/AdminEmailLogs'))
const AdminOtherPages = {
  AdminCustomers: lazy(() => import('./admin/pages/AdminOtherPages').then(m => ({ default: m.AdminCustomers }))),
  AdminGallery: lazy(() => import('./admin/pages/AdminOtherPages').then(m => ({ default: m.AdminGallery }))),
  AdminTestimonials: lazy(() => import('./admin/pages/AdminOtherPages').then(m => ({ default: m.AdminTestimonials })))
}

function AnimatedRoutes() {
  const location = useLocation()

  return (
    <AnimatePresence mode="wait">
      <Routes location={location} key={location.pathname}>
        {/* ───────────────────────────────────────────── */}
        {/* Public Cinematic Frontend Routes */}
        {/* ───────────────────────────────────────────── */}

        <Route path="/" element={<HomePage />} />
        <Route path="/services" element={<HomePage />} />
        <Route path="/gallery" element={<HomePage />} />
        <Route path="/quote" element={<HomePage />} />
        <Route path="/reviews" element={<HomePage />} />
        <Route path="/about" element={<HomePage />} />
        <Route path="/booking" element={<HomePage />} />
        <Route path="/contact" element={<HomePage />} />

        {/* ───────────────────────────────────────────── */}
        {/* Admin Backend Routes */}
        {/* ───────────────────────────────────────────── */}

        <Route
          path="/admin/login"
          element={
            <Suspense
              fallback={<div className="min-h-screen bg-black" />}
            >
              <AdminLogin />
            </Suspense>
          }
        />

        <Route
          path="/admin"
          element={
            <ProtectedRoute>
              <Suspense
                fallback={<div className="min-h-screen bg-black" />}
              >
                <AdminLayout />
              </Suspense>
            </ProtectedRoute>
          }
        >
          <Route index element={<AdminDashboard />} />
          <Route path="bookings" element={<AdminBookings />} />
          <Route path="history" element={<AdminHistory />} />
          <Route path="services" element={<AdminServices />} />
          <Route path="customers" element={<AdminOtherPages.AdminCustomers />} />
          <Route path="contacts" element={<AdminContacts />} />
          <Route path="email-logs" element={<AdminEmailLogs />} />
          <Route path="gallery" element={<AdminOtherPages.AdminGallery />} />
          <Route path="testimonials" element={<AdminOtherPages.AdminTestimonials />} />
        </Route>

        {/* Fallback */}
        <Route path="*" element={<HomePage />} />
      </Routes>
    </AnimatePresence>
  )
}

function AppInner() {
  useLenis()

  const location = useLocation()

  // Detect admin routes
  const isAdminRoute = location.pathname.startsWith('/admin')

  return (
    <>
      {/* Public cinematic UI only */}
      {!isAdminRoute && (
        <>
          <PageTransitionOverlay />
          <Navbar />
        </>
      )}

      <AnimatedRoutes />
    </>
  )
}

export default function App() {
  const [introComplete, setIntroComplete] = useState(
    !shouldShowIntro()
  )

  return (
    <AuthProvider>
      <LazyMotion features={domAnimation}>
        {/* Global cinematic cursor */}
        <CustomCursor />

        {/* Ambient audio */}
        <AudioController />

        {/* Intro cinematic sequence */}
        {!introComplete && (
          <IntroSequence
            onComplete={() => setIntroComplete(true)}
          />
        )}

        <HashRouter>
          <AppInner />
        </HashRouter>
      </LazyMotion>
    </AuthProvider>
  )
}
