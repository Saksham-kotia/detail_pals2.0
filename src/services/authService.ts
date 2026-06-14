// ─── Detail Pals V2 — Auth Service ──────────────────────────────────
// Thin wrapper around Supabase auth — use the useAuth() hook for
// component-level auth state; use this service for direct calls.

import { supabase } from '../lib/supabase';

export async function signIn(email: string, password: string) {
  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password,
  });
  return { user: data.user, session: data.session, error };
}

export async function signOut() {
  const { error } = await supabase.auth.signOut();
  return { error };
}

export async function getSession() {
  const { data, error } = await supabase.auth.getSession();
  return { session: data.session, error };
}

export async function getCurrentUser() {
  const { data, error } = await supabase.auth.getUser();
  return { user: data.user, error };
}
