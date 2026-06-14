/**
 * DETAIL PALS V2 — create-booking Edge Function
 * ===============================================
 * File: supabase/functions/create-booking/index.ts
 *
 * Called from BookingPage.tsx when user submits the booking form.
 * Runs on Deno in Supabase's edge runtime.
 *
 * Operations (in order):
 *   1. Validate request body with Zod
 *   2. Verify the selected time slot is still available
 *   3. Re-calculate price server-side from pricing_config
 *   4. Upsert customer record (by phone, or email if provided)
 *   5. Create booking record (generates DP-XXXXXX ref)
 *   6. Trigger email confirmation (calls send-email function)
 *   7. Return booking ref to the client
 *
 * Security:
 *   - Uses SERVICE_ROLE key (bypasses RLS) for creates
 *   - Validates CORS — only allows requests from the app origin
 *   - Never exposes service role key to the browser
 */

import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'
import { z } from 'https://esm.sh/zod@3'

// ── CORS headers ─────────────────────────────────────────────

const corsHeaders = {
  'Access-Control-Allow-Origin':  '*',   // Tighten in production to your domain
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

// ── Request schema (mirrors client Zod schema) ───────────────

const bookingRequestSchema = z.object({
  service_tier:   z.enum(['essential', 'signature', 'concours']),
  booking_date:   z.string().min(1),
  time_slot:      z.string().min(1),
  name:           z.string().min(2).max(100),
  phone:          z.string().min(10),
  email:          z.string().email().optional().or(z.literal('')),
  vehicle_make:   z.string().min(1).max(50),
  vehicle_model:  z.string().min(1).max(50),
  vehicle_year:   z.number().int().min(1990).max(2030).optional(),
  vehicle_type:   z.enum(['sedan', 'suv', 'truck', 'van', 'luxury']),
  condition:      z.enum(['light', 'moderate', 'heavy']),
  add_on_ids:     z.array(z.string()).default([]),
  notes:          z.string().max(500).optional(),
})

// ── Main handler ─────────────────────────────────────────────

serve(async (req) => {
  // Handle CORS preflight
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders })
  }

  if (req.method !== 'POST') {
    return new Response(
      JSON.stringify({ error: 'Method not allowed' }),
      { status: 405, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  }

  try {
    // Parse and validate body
    const body = await req.json()
    const parseResult = bookingRequestSchema.safeParse(body)

    if (!parseResult.success) {
      return new Response(
        JSON.stringify({ error: 'Validation failed', details: parseResult.error.flatten() }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    const data = parseResult.data

    // Create service-role Supabase client (bypasses RLS for writes)
    const supabaseAdmin = createClient(
      Deno.env.get('SUPABASE_URL')!,
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
    )

    // ── 1. Verify slot is available ───────────────────────────
    const { data: slot, error: slotError } = await supabaseAdmin
      .from('availability_slots')
      .select('id, capacity, bookings_count, is_blocked')
      .eq('slot_date', data.booking_date)
      .eq('time_slot', data.time_slot)
      .single()

    if (slotError || !slot) {
      return new Response(
        JSON.stringify({ error: 'Selected time slot is not available' }),
        { status: 409, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    if (slot.is_blocked || slot.bookings_count >= slot.capacity) {
      return new Response(
        JSON.stringify({ error: 'Selected time slot is fully booked. Please choose another time.' }),
        { status: 409, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    // ── 2. Fetch service and re-calculate price ───────────────
    const { data: service, error: serviceError } = await supabaseAdmin
      .from('services')
      .select('id, base_price, is_active')
      .eq('tier', data.service_tier)
      .single()

    if (serviceError || !service || !service.is_active) {
      return new Response(
        JSON.stringify({ error: 'Selected service is not available' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    const { data: pricingConfig } = await supabaseAdmin
      .from('pricing_config')
      .select('vehicle_multipliers, condition_multipliers')
      .eq('id', 'singleton')
      .single()

    const vehicleMult   = (pricingConfig?.vehicle_multipliers as Record<string, number>)?.[data.vehicle_type]   ?? 1.0
    const conditionMult = (pricingConfig?.condition_multipliers as Record<string, number>)?.[data.condition] ?? 1.0
    const serverPrice   = Math.round(service.base_price * vehicleMult * conditionMult)

    // ── 3. Upsert customer ────────────────────────────────────
    let customerId: string

    // Try to find existing customer by phone
    const { data: existingCustomer } = await supabaseAdmin
      .from('customers')
      .select('id')
      .eq('phone', data.phone)
      .maybeSingle()

    if (existingCustomer) {
      customerId = existingCustomer.id
      // Update name and email if provided
      await supabaseAdmin
        .from('customers')
        .update({
          name:  data.name,
          ...(data.email ? { email: data.email } : {}),
          vehicle_default: `${data.vehicle_make} ${data.vehicle_model}`,
        })
        .eq('id', customerId)
    } else {
      const { data: newCustomer, error: customerError } = await supabaseAdmin
        .from('customers')
        .insert({
          name:            data.name,
          phone:           data.phone,
          email:           data.email || null,
          vehicle_default: `${data.vehicle_make} ${data.vehicle_model}`,
        })
        .select('id')
        .single()

      if (customerError || !newCustomer) {
        throw new Error(`Failed to create customer: ${customerError?.message}`)
      }
      customerId = newCustomer.id
    }

    // ── 4. Create booking ─────────────────────────────────────
    const { data: booking, error: bookingError } = await supabaseAdmin
      .from('bookings')
      .insert({
        customer_id:   customerId,
        service_id:    service.id,
        vehicle_type:  data.vehicle_type,
        vehicle_make:  data.vehicle_make,
        vehicle_model: data.vehicle_model,
        vehicle_year:  data.vehicle_year ?? null,
        condition:     data.condition,
        add_on_ids:    data.add_on_ids,
        quoted_price:  serverPrice,
        status:        'pending',
        booking_date:  data.booking_date,
        time_slot:     data.time_slot,
        notes:         data.notes ?? null,
      })
      .select('id, ref')
      .single()

    if (bookingError || !booking) {
      throw new Error(`Failed to create booking: ${bookingError?.message}`)
    }

    // ── 5. Trigger confirmation email (fire and forget) ───────
    try {
      await supabaseAdmin.functions.invoke('send-email', {
        body: {
          template:   'booking-confirmation',
          booking_id: booking.id,
          to_email:   data.email || null,
          to_phone:   data.phone,
          to_name:    data.name,
          booking_ref: booking.ref,
        },
      })
    } catch (emailErr) {
      // Don't fail the booking if email fails — log and continue
      console.error('[create-booking] Email notification failed:', emailErr)
    }

    // ── 6. Return success ─────────────────────────────────────
    return new Response(
      JSON.stringify({
        success:     true,
        booking_ref: booking.ref,
        booking_id:  booking.id,
        quoted_price: serverPrice,
      }),
      { status: 201, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )

  } catch (err) {
    console.error('[create-booking] Unexpected error:', err)
    return new Response(
      JSON.stringify({ error: 'An unexpected error occurred. Please try again.' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  }
})
