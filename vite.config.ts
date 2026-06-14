import { defineConfig, loadEnv } from 'vite'
import react from '@vitejs/plugin-react'
import path from 'path'
import { createClient } from '@supabase/supabase-js'

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '')

  return {
    plugins: [
      react(),
      {
        name: 'local-api-emulator',
        configureServer(server) {
          server.middlewares.use(async (req, res, next) => {
            if (req.url?.startsWith('/api/customer-upsert') && req.method === 'POST') {
              let body = '';
              req.on('data', chunk => { body += chunk; });
              req.on('end', async () => {
                try {
                  const { name, email, phone, vehicle_type, booking_ref } = JSON.parse(body);
                  const supabaseUrl = env.VITE_SUPABASE_URL || '';
                  const supabaseServiceKey = env.SUPABASE_SERVICE_ROLE_KEY || '';

                  if (!supabaseUrl || !supabaseServiceKey) {
                    res.statusCode = 500;
                    res.setHeader('Content-Type', 'application/json');
                    res.end(JSON.stringify({ error: 'Supabase URL or Service Role Key is missing in env' }));
                    return;
                  }

                  const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey, {
                    auth: { persistSession: false }
                  });

                  const upsertData: any = { name, email, phone };
                  if (vehicle_type) {
                    upsertData.vehicle_default = vehicle_type;
                  }
                  if (booking_ref) {
                    upsertData.notes = `Last Booking Ref: ${booking_ref}`;
                  }

                  const { data, error } = await supabaseAdmin
                    .from('customers')
                    .upsert(
                      upsertData,
                      { onConflict: 'email', ignoreDuplicates: false }
                    )
                    .select('id')
                    .single();

                  if (error) {
                    res.statusCode = 500;
                    res.setHeader('Content-Type', 'application/json');
                    res.end(JSON.stringify({ error: error.message }));
                  } else {
                    res.statusCode = 200;
                    res.setHeader('Content-Type', 'application/json');
                    res.end(JSON.stringify({ customer_id: data.id }));
                  }
                } catch (err) {
                  res.statusCode = 500;
                  res.setHeader('Content-Type', 'application/json');
                  res.end(JSON.stringify({ error: String(err) }));
                }
              });
              return;
            }

            if (req.url?.startsWith('/api/send-email') && req.method === 'POST') {
              let body = '';
              req.on('data', chunk => { body += chunk; });
              req.on('end', async () => {
                try {
                  const payload = JSON.parse(body);
                  const resendKey = env.RESEND_API_KEY;
                  const emailFrom = env.EMAIL_FROM || 'Detail Pals <onboarding@resend.dev>';
                  const notifyEmail = env.BOOKING_NOTIFY_EMAIL;
                  const supabaseUrl = env.VITE_SUPABASE_URL || '';
                  const supabaseServiceKey = env.SUPABASE_SERVICE_ROLE_KEY || '';

                  if (!supabaseUrl || !supabaseServiceKey) {
                    res.statusCode = 500;
                    res.setHeader('Content-Type', 'application/json');
                    res.end(JSON.stringify({ error: 'Supabase URL or Service Role Key is missing in env' }));
                    return;
                  }

                  const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey, {
                    auth: { persistSession: false }
                  });

                  // Log helper for emulator
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
                      console.log(`[local-api-emulator] RESEND_API_KEY not set — simulated log to ${toEmail}`);
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

                  if (payload.type === 'booking_status_update' || payload.type === 'booking_confirmation') {
                    const status = payload.type === 'booking_status_update' ? payload.status : 'pending';
                    let subject = '';
                    let statusTitle = '';
                    let statusDesc = '';
                    let statusColor = '#d4af37';

                    if (status === 'pending') {
                      subject = `Booking Awaited — ${payload.reference} | Detail Pals`;
                      statusTitle = 'Booking Awaited';
                      statusDesc = `Your booking request has been received and is currently <strong>Awaiting Confirmation</strong>. Our team will review your requested slot shortly.`;
                      statusColor = '#c9a84c';
                    } else if (status === 'confirmed') {
                      subject = `Booking Confirmed — ${payload.reference} | Detail Pals`;
                      statusTitle = 'Booking Confirmed';
                      statusDesc = `Your booking has been reviewed and is now officially <strong>Confirmed</strong>! We look forward to detailing your vehicle.`;
                      statusColor = '#10b981';
                    } else if (status === 'in-progress' || status === 'in_progress') {
                      subject = `Detailing In Progress — ${payload.reference} | Detail Pals`;
                      statusTitle = 'Detailing In Progress';
                      statusDesc = `Our professional detailing team has begun working on your vehicle! We are restoring it to showroom perfection.`;
                      statusColor = '#3b82f6';
                    } else if (status === 'completed') {
                      subject = `Detailing Completed — ${payload.reference} | Detail Pals`;
                      statusTitle = 'Detailing Completed';
                      statusDesc = `Your vehicle detailing is complete! Your car is ready for pickup/delivery and is looking spectacular.`;
                      statusColor = '#d4af37';
                    } else if (status === 'cancelled') {
                      subject = `Booking Cancelled — ${payload.reference} | Detail Pals`;
                      statusTitle = 'Booking Cancelled';
                      statusDesc = `Your booking request has been <strong>Cancelled</strong>. If you believe this is an error or wish to reschedule, please contact us directly.`;
                      statusColor = '#ef4444';
                    } else {
                      subject = `Booking Status Updated — ${payload.reference} | Detail Pals`;
                      statusTitle = 'Booking Status Update';
                      statusDesc = `Your booking status has been updated to <strong>${status}</strong>.`;
                    }

                    const bookingId = payload.booking_id || null;
                    const customerHtml = `
                      <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; background-color: #0a0a0a; color: #f0f0f0; border-radius: 8px; border: 1px solid #222;">
                        <h2 style="color: ${statusColor}; border-bottom: 1px solid #222; padding-bottom: 10px; font-weight: 300;">${statusTitle}</h2>
                        <p>Hi ${payload.name},</p>
                        <p>${statusDesc}</p>
                        <div style="background-color: #111; padding: 15px; border-radius: 6px; border: 1px solid #222; margin: 20px 0;">
                          <p style="margin: 4px 0;"><strong>Reference:</strong> <span style="color: #d4af37; font-family: monospace;">${payload.reference}</span></p>
                          <p style="margin: 4px 0;"><strong>Date & Time:</strong> ${payload.date} at ${payload.time}</p>
                          <p style="margin: 4px 0;"><strong>Vehicle:</strong> ${payload.vehicle}</p>
                          <p style="margin: 4px 0;"><strong>Total Amount:</strong> $${payload.total}</p>
                        </div>
                        <p style="color: #888; font-size: 12px; margin-top: 30px;">Thank you for choosing Detail Pals. If you have questions, please reply to this email or call us at +1 (587) 973-4256.</p>
                      </div>
                    `;

                    // 1. Send & log email to the customer
                    await sendAndLogEmail(
                      payload.to,
                      subject,
                      customerHtml,
                      'booking-confirmation',
                      bookingId
                    );

                    // 2. Send & log email to the admin
                    if (notifyEmail) {
                      const staffHtml = `
                        <h2>Booking Status Update</h2>
                        <p><strong>Customer:</strong> ${payload.name} (${payload.to})</p>
                        <p><strong>Reference:</strong> ${payload.reference}</p>
                        <p><strong>New Status:</strong> ${status}</p>
                        <p><strong>Vehicle:</strong> ${payload.vehicle}</p>
                        <p><strong>Total:</strong> $${payload.total}</p>
                      `;
                      await sendAndLogEmail(
                        notifyEmail,
                        `Booking ${payload.reference} updated to ${status} — ${payload.name}`,
                        staffHtml,
                        'staff-notification',
                        bookingId
                      );
                    }
                  }

                  if (payload.type === 'contact_form') {
                    if (notifyEmail) {
                      const contactHtml = `
                        <h2>New Contact Form Submission</h2>
                        <p><strong>Name:</strong> ${payload.name}</p>
                        <p><strong>Email:</strong> ${payload.to}</p>
                        <p><strong>Phone:</strong> ${payload.phone}</p>
                        <p><strong>Message:</strong></p>
                        <div style="background:#f9f9f9;padding:15px;border:1px solid #ddd;border-radius:4px;white-space:pre-wrap">
                          ${payload.message}
                        </div>
                      `;

                      await sendAndLogEmail(
                        notifyEmail,
                        `New Contact Message from ${payload.name} | Detail Pals`,
                        contactHtml,
                        'contact-reply',
                        null
                      );
                    }
                  }

                  res.statusCode = 200;
                  res.setHeader('Content-Type', 'application/json');
                  res.end(JSON.stringify({ sent: true }));
                } catch (err) {
                  res.statusCode = 500;
                  res.setHeader('Content-Type', 'application/json');
                  res.end(JSON.stringify({ error: String(err) }));
                }
              });
              return;
            }

            next();
          });
        }
      }
    ],
    resolve: {
      alias: {
        '@': path.resolve(__dirname, './src'),
      },
    },
  }
})
