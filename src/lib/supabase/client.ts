/**
 * DETAIL PALS V2 — Supabase Browser Client
 * ==========================================
 * File: src/lib/supabase/client.ts
 *
 * Creates a single typed Supabase client for the browser.
 * Uses ONLY the anon key — RLS is the trust boundary.
 * The service role key lives in Edge Functions only, never here.
 *
 * Usage:
 *   import { supabase } from '@/lib/supabase/client'
 *   const { data } = await supabase.from('gallery').select('*').eq('is_published', true)
 */

import { createClient } from '@supabase/supabase-js'
import type { Database } from './database.types'

const supabaseUrl  = import.meta.env.VITE_SUPABASE_URL  as string
const supabaseAnon = import.meta.env.VITE_SUPABASE_ANON_KEY as string

if (!supabaseUrl || !supabaseAnon) {
  throw new Error(
    'Missing Supabase env vars. Create .env.local with VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY'
  )
}

export const supabase = createClient<Database>(supabaseUrl, supabaseAnon, {
  auth: {
    autoRefreshToken:    true,
    persistSession:      true,
    detectSessionInUrl:  true,
    storage:             localStorage,
  },
})
