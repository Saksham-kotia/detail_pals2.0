// ─── Detail Pals V2 — Protected Route ───────────────────────────────
// Drop-in replacement for old project's middleware.ts auth guard.
// Wraps any route that requires authentication (admin/staff pages).
//
// Usage in App.tsx:
//   <Route path="/admin/*" element={<ProtectedRoute><AdminLayout /></ProtectedRoute>} />

import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

interface Props {
  children: React.ReactNode;
  /** Where to redirect unauthenticated users. Defaults to /admin/login */
  loginPath?: string;
}

export function ProtectedRoute({ children, loginPath = '/admin/login' }: Props) {
  const { user, loading } = useAuth();
  const location = useLocation();

  // Show nothing while the session is being hydrated from localStorage.
  // Prevents a flash of the login page on reload when the user IS logged in.
  if (loading) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-white/20 border-t-white rounded-full animate-spin" />
      </div>
    );
  }

  if (!user) {
    // Preserve the attempted URL so we can redirect back after login
    return <Navigate to={loginPath} state={{ from: location }} replace />;
  }

  return <>{children}</>;
}
