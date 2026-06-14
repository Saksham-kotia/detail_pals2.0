/**
 * DETAIL PALS V2 — send-email Edge Function
 * ===========================================
 * File: supabase/functions/send-email/index.ts
 *
 * Handles all transactional email via Resend.
 * Called internally by other Edge Functions (not directly from the browser).
 *
 * Required Supabase secrets:
 *   supabase secrets set RESEND_API_KEY=re_xxxx
 *   supabase secrets set FROM_EMAIL=noreply@detailpals.com
 *   supabase secrets set STAFF_EMAIL=hello@detailpals.com
 */

import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin':  '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

// ── Email templates ───────────────────────────────────────────

function bookingConfirmationHtml(params: {
  name:        string
  booking_ref: string
  service:     string
  date:        string
  time:        string
  vehicle:     string
  price:       string
}): string {
  return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <style>
    body { background:#070707; color:#F0EDE6; font-family:'DM Sans',Arial,sans-serif; margin:0; padding:0; }
    .container { max-width:560px; margin:40px auto; padding:0 24px; }
    .logo { font-size:13px; letter-spacing:0.24em; text-transform:uppercase; margin-bottom:32px; }
    .logo span { color:#C9A84C; }
    .divider { height:1px; background:linear-gradient(to right,transparent,#C9A84C,transparent); margin:24px 0; }
    h1 { font-weight:300; font-size:28px; margin:0 0 8px; }
    p { color:#888780; font-size:14px; line-height:1.7; margin:0 0 16px; }
    .ref { display:inline-block; border:1px solid rgba(201,168,76,0.4); padding:8px 20px; font-size:13px; letter-spacing:0.12em; color:#C9A84C; margin:16px 0; }
    .detail-row { display:flex; justify-content:space-between; padding:10px 0; border-bottom:1px solid rgba(255,255,255,0.06); font-size:13px; }
    .detail-label { color:#6B6B6B; }
    .footer { margin-top:40px; font-size:12px; color:#3A3A3A; }
  </style>
</head>
<body>
  <div class="container">
    <p class="logo">DETAIL <span>PALS</span></p>
    <div class="divider"></div>
    <h1>Booking confirmed</h1>
    <p>Thank you, ${params.name}. We've received your booking and will be in touch to confirm your appointment.</p>
    <div class="ref">${params.booking_ref}</div>
    <div>
      <div class="detail-row"><span class="detail-label">Service</span><span>${params.service}</span></div>
      <div class="detail-row"><span class="detail-label">Date</span><span>${params.date}</span></div>
      <div class="detail-row"><span class="detail-label">Time</span><span>${params.time}</span></div>
      <div class="detail-row"><span class="detail-label">Vehicle</span><span>${params.vehicle}</span></div>
      <div class="detail-row"><span class="detail-label">Estimated price</span><span style="color:#C9A84C">${params.price}</span></div>
    </div>
    <div class="divider"></div>
    <p>If you need to change or cancel your booking, please call us at <strong style="color:#C9A84C">(555) 555-0123</strong>.</p>
    <div class="footer">
      <p>Detail Pals · Precision Automotive Detailing</p>
      <p>This is an automated confirmation. Please do not reply to this email.</p>
    </div>
  </div>
</body>
</html>
`
}

// ── Main handler ──────────────────────────────────────────────

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders })
  }

  const RESEND_API_KEY = Deno.env.get('RESEND_API_KEY')
  const FROM_EMAIL     = Deno.env.get('FROM_EMAIL') ?? 'noreply@detailpals.com'
  const STAFF_EMAIL    = Deno.env.get('STAFF_EMAIL') ?? 'hello@detailpals.com'

  if (!RESEND_API_KEY) {
    console.error('[send-email] RESEND_API_KEY not configured')
    return new Response(
      JSON.stringify({ error: 'Email service not configured' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  }

  const supabaseAdmin = createClient(
    Deno.env.get('SUPABASE_URL')!,
    Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
  )

  try {
    const body = await req.json()
    const { template, booking_id, to_email, to_name, booking_ref } = body

    if (template === 'booking-confirmation') {
      // Fetch booking details for the email
      const { data: bookingView } = await supabaseAdmin
        .from('bookings_view')
        .select('*')
        .eq('id', booking_id)
        .single()

      const emailHtml = bookingConfirmationHtml({
        name:        to_name ?? bookingView?.customer_name ?? 'Valued client',
        booking_ref: booking_ref ?? bookingView?.ref ?? 'DP-UNKNOWN',
        service:     bookingView?.service_name ?? 'Detail',
        date:        bookingView?.booking_date ?? '',
        time:        bookingView?.time_slot ?? '',
        vehicle:     `${bookingView?.vehicle_make} ${bookingView?.vehicle_model}`,
        price:       `$${bookingView?.quoted_price?.toLocaleString() ?? '—'}`,
      })

      const emails: { to: string; subject: string; html: string }[] = []

      // Send to customer if they provided email
      if (to_email) {
        emails.push({
          to:      to_email,
          subject: `Booking confirmed — ${booking_ref}`,
          html:    emailHtml,
        })
      }

      // Always notify staff
      emails.push({
        to:      STAFF_EMAIL,
        subject: `New booking: ${booking_ref} — ${bookingView?.customer_name}`,
        html:    emailHtml,
      })

      // Send via Resend
      const sentIds: string[] = []
      for (const email of emails) {
        const res = await fetch('https://api.resend.com/emails', {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${RESEND_API_KEY}`,
            'Content-Type':  'application/json',
          },
          body: JSON.stringify({
            from:    FROM_EMAIL,
            to:      email.to,
            subject: email.subject,
            html:    email.html,
          }),
        })

        const resendData = await res.json() as { id?: string }
        if (resendData.id) sentIds.push(resendData.id)

        // Log the email
        await supabaseAdmin.from('email_log').insert({
          to_email:   email.to,
          template:   'booking-confirmation',
          booking_id: booking_id,
          resend_id:  resendData.id ?? null,
          status:     res.ok ? 'sent' : 'failed',
        })
      }

      return new Response(
        JSON.stringify({ success: true, sent: sentIds.length }),
        { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    return new Response(
      JSON.stringify({ error: `Unknown template: ${template}` }),
      { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )

  } catch (err) {
    console.error('[send-email] Error:', err)
    return new Response(
      JSON.stringify({ error: 'Failed to send email' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  }
})
