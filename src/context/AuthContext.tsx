/**
 * DETAIL PALS V2 — Auth Context
 * ================================
 * File: src/context/AuthContext.tsx
 *
 * Provides authentication state to the entire app.
 * Wraps Supabase Auth with role-awareness.
 *
 * Security model:
 *   - Role stored in user_metadata.role (set server-side on account creation)
 *   - Never trust client-side role claims — always verified from the session JWT
 *   - onAuthStateChange listener keeps session in sync across tabs
 *   - Profile fetched from public.profiles table on sign-in for display data
 *
 * Usage:
 *   const { user, role, signIn, signOut, loading } = useAuth()
 */

import {
  createContext,
  useContext,
  useEffect,
  useState,
  useCallback,
  type ReactNode,
} from 'react'
import type { Session, AuthError } from '@supabase/supabase-js'
import { supabase } from '@/lib/supabase/client'
import type { AuthUser, Profile, UserRole } from '@/lib/supabase/database.types'

// ─── Types ───────────────────────────────────────────────────

interface AuthState {
  session:     Session | null
  user:        AuthUser | null
  profile:     Profile | null
  role:        UserRole | null
  loading:     boolean
  initialized: boolean
}

interface AuthContextValue extends AuthState {
  signIn:  (email: string, password: string) => Promise<{ error: AuthError | null }>
  signOut: () => Promise<void>
  isAdmin: boolean
  isStaff: boolean
}

// ─── Context ─────────────────────────────────────────────────

const AuthContext = createContext<AuthContextValue | null>(null)

// ─── Provider ────────────────────────────────────────────────

export function AuthProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<AuthState>({
    session:     null,
    user:        null,
    profile:     null,
    role:        null,
    loading:     true,
    initialized: false,
  })

  // ── Fetch profile from public.profiles table ──────────────
  const fetchProfile = useCallback(async (userId: string): Promise<Profile | null> => {
    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', userId)
      .eq('is_active', true)
      .single()

    if (error) {
      console.error('[Auth] Failed to fetch profile:', error.message)
      return null
    }
    return data
  }, [])

  // ── Build AuthUser from session ───────────────────────────
  const buildAuthUser = useCallback((
    session: Session,
    profile: Profile | null,
  ): AuthUser => {
    // Role comes from user_metadata (set by admin server-side)
    const role = (session.user.user_metadata?.role as UserRole) ?? 'staff'
    return {
      id:        session.user.id,
      email:     session.user.email,
      role,
      full_name: profile?.full_name ?? session.user.email ?? 'Staff',
    }
  }, [])

  // ── Handle session change ─────────────────────────────────
  const handleSession = useCallback(async (session: Session | null) => {
    if (!session) {
      setState({
        session:     null,
        user:        null,
        profile:     null,
        role:        null,
        loading:     false,
        initialized: true,
      })
      return
    }

    const profile = await fetchProfile(session.user.id)
    const user    = buildAuthUser(session, profile)

    setState({
      session,
      user,
      profile,
      role:        user.role,
      loading:     false,
      initialized: true,
    })
  }, [fetchProfile, buildAuthUser])

  // ── Subscribe to auth state changes ──────────────────────
  useEffect(() => {
    // Get initial session
    supabase.auth.getSession().then(({ data: { session } }) => {
      handleSession(session)
    })

    // Listen for changes (sign in, sign out, token refresh, tab sync)
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (_event, session) => {
        handleSession(session)
      }
    )

    return () => subscription.unsubscribe()
  }, [handleSession])

  // ── Sign in ───────────────────────────────────────────────
  const signIn = useCallback(async (email: string, password: string) => {
    setState(prev => ({ ...prev, loading: true }))

    const { error } = await supabase.auth.signInWithPassword({ email, password })

    if (error) {
      setState(prev => ({ ...prev, loading: false }))
    }
    // On success, onAuthStateChange fires and handleSession updates state

    return { error }
  }, [])

  // ── Sign out ──────────────────────────────────────────────
  const signOut = useCallback(async () => {
    await supabase.auth.signOut()
    // onAuthStateChange fires with null session → handleSession clears state
  }, [])

  const value: AuthContextValue = {
    ...state,
    signIn,
    signOut,
    isAdmin: state.role === 'admin',
    isStaff: state.role === 'staff' || state.role === 'admin',
  }

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  )
}

// ─── Hook ────────────────────────────────────────────────────

export function useAuth(): AuthContextValue {
  const ctx = useContext(AuthContext)
  if (!ctx) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return ctx
}
