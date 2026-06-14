// ─── Detail Pals V2 — Vercel Serverless: Send Email ─────────────────
// POST /api/send-email
//
// Sends transactional emails via Resend (https://resend.com).
// Uses RESEND_API_KEY (server-only secret) — never shipped to browser.
//
// Deploy: this file lives at /api/send-email.ts in the project root.
// Vercel auto-detects it as a serverless function.

import type { VercelRequest, VercelResponse } from '@vercel/node';
import { createClient } from '@supabase/supabase-js';

interface BookingConfirmationPayload {
  type:       'booking_confirmation';
  booking_id: string;
  to:         string;
  name:       string;
  reference:  string;
  date:       string;
  time:       string;
  services:   Array<{ name: string; price: number }>;
  addons:     Array<{ name: string; price: number }>;
  total:      number;
  vehicle:    string;
}

interface BookingStatusUpdatePayload {
  type:       'booking_status_update';
  booking_id: string;
  to:         string;
  name:       string;
  reference:  string;
  status:     string;
  date:       string;
  time:       string;
  services:   Array<{ name: string; price: number }>;
  addons:     Array<{ name: string; price: number }>;
  total:      number;
  vehicle:    string;
}

interface ContactFormPayload {
  type:    'contact_form';
  name:    string;
  to:      string; // customer email
  phone:   string;
  message: string;
}

type EmailPayload = BookingConfirmationPayload | BookingStatusUpdatePayload | ContactFormPayload;

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const resendKey  = process.env.RESEND_API_KEY;
  const emailFrom  = process.env.EMAIL_FROM ?? 'Detail Pals <Detail_pals@resend.dev>';
  const notifyEmail = process.env.BOOKING_NOTIFY_EMAIL;

  const supabaseUrl = process.env.VITE_SUPABASE_URL || '';
  const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || '';

  if (!supabaseUrl || !supabaseServiceKey) {
    return res.status(500).json({ error: 'Supabase URL or Service Role Key is missing in environment variables' });
  }

  const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey, {
    auth: { persistSession: false }
  });

  const payload = req.body as EmailPayload;

  if (!payload?.to || !payload?.type) {
    return res.status(400).json({ error: 'Missing required fields: to, type' });
  }

  // Unified helper to send email via Resend and log results to public.email_log
  async function sendAndLogEmail(
    toEmail: string,
    subject: string,
    html: string,
    template: 'booking-confirmation' | 'staff-notification' | 'contact-reply' | 'booking-reminder',
    bookingId: string | null
  ) {
    let resendId: string | null = null;
    let emailStatus: 'sent' | 'failed' = 'sent';
    let errorMsg: string | null = null;

    if (!resendKey) {
      console.warn(`[send-email] Resend API key is missing — skipping email to ${toEmail}`);
      await supabaseAdmin.from('email_log').insert({
        to_email: toEmail,
        template,
        booking_id: bookingId,
        status: 'failed',
        error_msg: 'RESEND_API_KEY not configured',
      });
      return;
    }

    try {
      const response = await fetch('https://api.resend.com/emails', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${resendKey}`,
        },
        body: JSON.stringify({
          from: emailFrom,
          to: toEmail,
          subject,
          html,
        }),
      });

      const data = await response.json();
      if (response.ok && data.id) {
        resendId = data.id;
      } else {
        emailStatus = 'failed';
        errorMsg = data.message || JSON.stringify(data);
      }
    } catch (err) {
      emailStatus = 'failed';
      errorMsg = String(err);
    }

    await supabaseAdmin.from('email_log').insert({
      to_email: toEmail,
      template,
      booking_id: bookingId,
      resend_id: resendId,
      status: emailStatus,
      error_msg: errorMsg,
    });
  }

  try {
    if (payload.type === 'booking_status_update' || payload.type === 'booking_confirmation') {
      const status = payload.type === 'booking_status_update' ? payload.status : 'pending';
      const html = buildStatusUpdateHtml(payload, status);
      const subject = getStatusSubject(payload.reference, status);
      const bookingId = payload.booking_id || null;

      // 1. Send & log to client
      await sendAndLogEmail(payload.to, subject, html, 'booking-confirmation', bookingId);

      // 2. Send & log to admin
      if (notifyEmail) {
        const staffHtml = `
          <html><body style="font-family:sans-serif;color:#333;padding:20px">
            <h2>Booking Status Update: ${payload.reference}</h2>
            <p><strong>Customer:</strong> ${payload.name} (${payload.to})</p>
            <p><strong>New Status:</strong> ${status}</p>
            <p><strong>Date:</strong> ${payload.date} at ${payload.time}</p>
            <p><strong>Vehicle:</strong> ${payload.vehicle}</p>
            <p><strong>Total:</strong> $${payload.total.toFixed(2)}</p>
            <p><a href="${process.env.VITE_SITE_URL ?? ''}/admin/bookings">View in Admin Panel →</a></p>
          </body></html>
        `;
        await sendAndLogEmail(
          notifyEmail,
          `Booking ${payload.reference} updated to ${status} — ${payload.name}`,
          staffHtml,
          'staff-notification',
          bookingId
        );
      }

      return res.status(200).json({ sent: true });
    }

    if (payload.type === 'contact_form') {
      if (notifyEmail) {
        const contactHtml = `
          <html><body style="font-family:sans-serif;color:#333;padding:20px">
            <h2>New Contact Form Submission</h2>
            <p><strong>Name:</strong> ${payload.name}</p>
            <p><strong>Email:</strong> ${payload.to}</p>
            <p><strong>Phone:</strong> ${payload.phone}</p>
            <p><strong>Message:</strong></p>
            <div style="background:#f9f9f9;padding:15px;border:1px solid #ddd;border-radius:4px;white-space:pre-wrap">
              ${payload.message}
            </div>
          </body></html>
        `;

        await sendAndLogEmail(
          notifyEmail,
          `New Contact Message from ${payload.name} | Detail Pals`,
          contactHtml,
          'contact-reply',
          null
        );
      }

      return res.status(200).json({ sent: true });
    }

    return res.status(400).json({ error: `Unknown email type: ${(payload as any).type}` });
  } catch (err) {
    console.error('[send-email] Unexpected error:', err);
    return res.status(500).json({ error: 'Internal server error' });
  }
}

function getStatusSubject(ref: string, status: string): string {
  if (status === 'pending') return `Booking Awaited — ${ref} | Detail Pals`;
  if (status === 'confirmed') return `Booking Confirmed — ${ref} | Detail Pals`;
  if (status === 'in-progress' || status === 'in_progress') return `Detailing In Progress — ${ref} | Detail Pals`;
  if (status === 'completed') return `Detailing Completed — ${ref} | Detail Pals`;
  if (status === 'cancelled') return `Booking Cancelled — ${ref} | Detail Pals`;
  return `Booking Status Updated — ${ref} | Detail Pals`;
}

function buildStatusUpdateHtml(p: BookingConfirmationPayload | BookingStatusUpdatePayload, status: string): string {
  let statusTitle = '';
  let statusDesc = '';
  let statusColor = '#d4af37';

  if (status === 'pending') {
    statusTitle = 'Booking Awaited';
    statusDesc = `Your booking request has been received and is currently <strong>Awaiting Confirmation</strong>. Our team will review your requested slot shortly.`;
    statusColor = '#c9a84c';
  } else if (status === 'confirmed') {
    statusTitle = 'Booking Confirmed';
    statusDesc = `Your booking has been reviewed and is now officially <strong>Confirmed</strong>! We look forward to detailing your vehicle.`;
    statusColor = '#10b981';
  } else if (status === 'in-progress' || status === 'in_progress') {
    statusTitle = 'Detailing In Progress';
    statusDesc = `Our professional detailing team has begun working on your vehicle! We are restoring it to showroom perfection.`;
    statusColor = '#3b82f6';
  } else if (status === 'completed') {
    statusTitle = 'Detailing Completed';
    statusDesc = `Your vehicle detailing is complete! Your car is ready for pickup/delivery and is looking spectacular.`;
    statusColor = '#d4af37';
  } else if (status === 'cancelled') {
    statusTitle = 'Booking Cancelled';
    statusDesc = `Your booking request has been <strong>Cancelled</strong>. If you believe this is an error or wish to reschedule, please contact us directly.`;
    statusColor = '#ef4444';
  } else {
    statusTitle = 'Booking Status Update';
    statusDesc = `Your booking status has been updated to <strong>${status}</strong>.`;
  }

  const serviceRows = p.services
    .map((s: { name: string; price: number }) => `<tr><td style="padding:4px 0">${s.name}</td><td style="padding:4px 0;text-align:right">$${s.price.toFixed(2)}</td></tr>`)
    .join('');

  const addonRows = p.addons.length > 0
    ? p.addons.map((a: { name: string; price: number }) => `<tr><td style="padding:4px 0;color:#888">${a.name} (add-on)</td><td style="padding:4px 0;text-align:right;color:#888">$${a.price.toFixed(2)}</td></tr>`).join('')
    : '';

  return `
<!DOCTYPE html>
<html>
<head><meta charset="utf-8"><meta name="viewport" content="width=device-width"></head>
<body style="margin:0;padding:0;background:#0a0a0a;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif;color:#f0f0f0">
  <table width="100%" cellpadding="0" cellspacing="0">
    <tr><td align="center" style="padding:40px 20px">
      <table width="600" cellpadding="0" cellspacing="0" style="max-width:600px;width:100%;background:#111;border-radius:12px;overflow:hidden;border:1px solid #222;">
        <tr><td style="background:linear-gradient(135deg,#1a1a1a,#0a0a0a);padding:40px;text-align:center;border-bottom:1px solid #222">
          <h1 style="margin:0;font-size:28px;letter-spacing:4px;color:#fff;font-weight:300">DETAIL PALS</h1>
          <p style="margin:8px 0 0;color:#888;font-size:13px;letter-spacing:2px">PREMIUM AUTO DETAILING</p>
        </td></tr>
        <tr><td style="padding:40px">
          <h2 style="margin:0 0 8px;font-size:22px;font-weight:400;color:${statusColor}">${statusTitle}</h2>
          <p style="margin:0 0 24px;color:#888">Hi ${p.name}, ${statusDesc}</p>
          <table width="100%" cellpadding="0" cellspacing="0" style="background:#1a1a1a;border-radius:8px;padding:20px;margin-bottom:24px;border:1px solid #222;">
            <tr><td style="padding:6px 0">
              <span style="color:#888;font-size:12px;letter-spacing:1px">REFERENCE</span>
              <p style="margin:4px 0 0;font-size:20px;font-weight:600;letter-spacing:2px;color:#d4af37">${p.reference}</p>
            </td></tr>
            <tr><td style="padding:6px 0;border-top:1px solid #222">
              <span style="color:#888;font-size:12px;letter-spacing:1px">DATE & TIME</span>
              <p style="margin:4px 0 0;color:#fff">${p.date} at ${p.time}</p>
            </td></tr>
            <tr><td style="padding:6px 0;border-top:1px solid #222">
              <span style="color:#888;font-size:12px;letter-spacing:1px">VEHICLE</span>
              <p style="margin:4px 0 0;color:#fff">${p.vehicle}</p>
            </td></tr>
          </table>
          <h3 style="margin:0 0 12px;font-size:14px;letter-spacing:1px;color:#888;font-weight:400">SERVICES</h3>
          <table width="100%" cellpadding="0" cellspacing="0" style="margin-bottom:8px">
            ${serviceRows}
            ${addonRows}
            <tr><td colspan="2" style="border-top:1px solid #333;padding-top:8px"></td></tr>
            <tr>
              <td style="padding:8px 0;font-weight:600;font-size:16px;color:#fff">Total</td>
              <td style="padding:8px 0;font-weight:600;font-size:16px;color:#d4af37;text-align:right">$${p.total.toFixed(2)}</td>
            </tr>
          </table>
          <p style="margin:32px 0 0;color:#666;font-size:13px;line-height:1.6">
            Questions? Reply to this email or call us directly at +1 (587) 973-4256.
          </p>
        </td></tr>
        <tr><td style="padding:24px 40px;border-top:1px solid #222;text-align:center">
          <p style="margin:0;color:#555;font-size:12px">© Detail Pals — Your Car's Best Friend</p>
        </td></tr>
      </table>
    </td></tr>
  </table>
</body>
</html>`;
}
