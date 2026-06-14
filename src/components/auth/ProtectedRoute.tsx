/**
 * DETAIL PALS V2 — ProtectedRoute
 * ==================================
 * File: src/components/auth/ProtectedRoute.tsx
 *
 * Wraps any route that requires authentication.
 * Redirects unauthenticated users to /admin/login.
 * Redirects authenticated users without required role to /admin/unauthorized.
 *
 * Three states while auth initializes:
 *   loading=true  → show a minimal dark loading screen (no flash)
 *   no session    → redirect to /admin/login
 *   wrong role    → redirect to /admin/unauthorized
 *   correct role  → render children
 *
 * Usage:
 *   <Route path="/admin/*" element={
 *     <ProtectedRoute requiredRole="admin">
 *       <AdminLayout />
 *     </ProtectedRoute>
 *   } />
 */

import { Navigate, useLocation } from 'react-router-dom'
import { m } from 'framer-motion'
import { useAuth } from '@/context/AuthContext'
import type { UserRole } from '@/lib/supabase/database.types'

interface ProtectedRouteProps {
  children:      React.ReactNode
  requiredRole?: UserRole   // 'admin' | 'staff' — omit for any authenticated user
}

export function ProtectedRoute({ children, requiredRole }: ProtectedRouteProps) {
  const { session, role, initialized } = useAuth()
  const location = useLocation()

  // ── Still initializing — show a dark loading screen ───────
  if (!initialized) {
    return (
      <div className="fixed inset-0 bg-dp-bg flex items-center justify-center" role="status" aria-label="Loading">
        <m.div
          className="flex flex-col items-center gap-4"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.4 }}
        >
          {/* Gold pulse spinner */}
          <m.div
            className="w-8 h-8 rounded-full border border-[var(--dp-border-gold)]"
            animate={{ scale: [1, 1.2, 1], opacity: [0.5, 1, 0.5] }}
            transition={{ duration: 1.5, repeat: Infinity, ease: 'easeInOut' }}
          />
          <p className="font-sans font-light text-xs tracking-[0.18em] uppercase text-dp-text-muted">
            Authenticating
          </p>
        </m.div>
      </div>
    )
  }

  // ── No session — redirect to login ────────────────────────
  if (!session) {
    return (
      <Navigate
        to="/admin/login"
        state={{ from: location.pathname }}
        replace
      />
    )
  }

  // ── Session exists but wrong role ─────────────────────────
  if (requiredRole === 'admin' && role !== 'admin') {
    return <Navigate to="/admin/unauthorized" replace />
  }

  // ── All checks passed — render the protected content ──────
  return <>{children}</>
}
