// ─── Detail Pals V2 — Vercel Serverless: Customer Upsert ────────────
// POST /api/customer-upsert
//
// Uses SUPABASE_SERVICE_ROLE_KEY (server-only secret) to upsert a customer.
// This is the ONLY place service_role is used — never imported in src/.
//
// Deploy: this file lives at /api/customer-upsert.ts in the project root.
// Vercel auto-detects it as a serverless function.

import type { VercelRequest, VercelResponse } from '@vercel/node';
import { createClient } from '@supabase/supabase-js';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  const supabaseUrl = process.env.VITE_SUPABASE_URL;
  const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!supabaseUrl || !supabaseServiceKey) {
    return res.status(500).json({ error: 'Supabase URL or Service Role Key is missing in environment variables' });
  }

  // Service role client — secret, server-only, never shipped to browser
  const supabaseAdmin = createClient(
    supabaseUrl,
    supabaseServiceKey,
    { auth: { persistSession: false } }
  );
  // Only allow POST
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { name, email, phone, vehicle_type, booking_ref } = req.body as {
    name:          string;
    email:         string;
    phone:         string;
    vehicle_type?: string;
    booking_ref?:  string;
  };

  // Basic validation
  if (!name || !email || !phone) {
    return res.status(400).json({ error: 'name, email and phone are required' });
  }

  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    return res.status(400).json({ error: 'Invalid email address' });
  }

  try {
    const upsertData: any = { name, email, phone };
    if (vehicle_type) {
      upsertData.vehicle_default = vehicle_type;
    }
    if (booking_ref) {
      upsertData.notes = `Last Booking Ref: ${booking_ref}`;
    }

    // Upsert: if email exists, update fields; otherwise insert new customer.
    const { data, error } = await supabaseAdmin
      .from('customers')
      .upsert(
        upsertData,
        { onConflict: 'email', ignoreDuplicates: false }
      )
      .select('id')
      .single();

    if (error) {
      console.error('[customer-upsert] Supabase error:', error);
      return res.status(500).json({ error: error.message });
    }

    return res.status(200).json({ customer_id: data.id });
  } catch (err) {
    console.error('[customer-upsert] Unexpected error:', err);
    return res.status(500).json({ error: 'Internal server error' });
  }
}
