// ─── Detail Pals V2 — Supabase Browser Client ───────────────────────
// Uses the PUBLIC anon key only — safe to ship in the browser bundle.
// The service_role key is NEVER imported here; it lives in /api/ only.

import { createClient } from '@supabase/supabase-js';

const supabaseUrl  = import.meta.env.VITE_SUPABASE_URL  as string;
const supabaseAnon = import.meta.env.VITE_SUPABASE_ANON_KEY as string;

if (!supabaseUrl || !supabaseAnon) {
  console.warn(
    '[Detail Pals] Supabase env vars missing. ' +
    'Add VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY to .env.local'
  );
}

export const supabase = createClient(supabaseUrl || 'https://placeholder.supabase.co', supabaseAnon || 'placeholder', {
  auth: {
    // Persist session across page reloads
    persistSession: true,
    autoRefreshToken: true,
    // Use sessionStorage for session
    storage: window.sessionStorage,
  },
});

export type { SupabaseClient } from '@supabase/supabase-js';
