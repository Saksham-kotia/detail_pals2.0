// ─── Detail Pals V2 — Admin Service ─────────────────────────────────
// Admin-only operations: dashboard stats, customer aggregates, testimonials.
// All calls require an authenticated Supabase session (enforced by RLS).

import { supabase } from '../lib/supabase';
import type {
  DashboardStats,
  CustomerWithStats,
  Testimonial,
  Booking,
} from '../lib/types';
import { mapDbBookingToBooking } from './bookingService';

// ── Dashboard stats ───────────────────────────────────────────────────

export async function getDashboardStats(): Promise<{
  stats: (DashboardStats & { all_bookings: Booking[] }) | null;
  error: string | null;
}> {
  const { data: dbAddons } = await supabase.from('add_ons').select('*');
  const { data: bookings, error } = await supabase
    .from('bookings')
    .select('*, customer:customers(*), service:services(*)')
    .order('created_at', { ascending: false });

  if (error) return { stats: null, error: error.message };

  const all = (bookings as any[] || []).map(b => mapDbBookingToBooking(b, dbAddons || []));

  const total_bookings     = all.length;
  const pending_bookings   = all.filter(b => b.status === 'pending').length;
  const completed_bookings = all.filter(b => b.status === 'completed').length;
  const revenue_estimate   = all
    .filter(b => ['confirmed', 'in-progress', 'completed'].includes(b.status))
    .reduce((sum, b) => sum + Number(b.total_price), 0);

  return {
    stats: {
      total_bookings,
      pending_bookings,
      completed_bookings,
      revenue_estimate: Math.round(revenue_estimate * 100) / 100,
      recent_bookings:  all.slice(0, 10),
      all_bookings:     all,
    },
    error: null,
  };
}

// ── Customer list with aggregated stats ──────────────────────────────

export async function getCustomersWithStats(): Promise<{
  customers: CustomerWithStats[];
  error:     string | null;
}> {
  // Get all customers
  const { data: rawCustomers, error: custErr } = await supabase
    .from('customers')
    .select('*')
    .order('created_at', { ascending: false });

  if (custErr) return { customers: [], error: custErr.message };

  // Get all bookings to compute per-customer stats client-side
  const { data: rawBookings, error: bookErr } = await supabase
    .from('bookings')
    .select('customer_id, quoted_price, created_at, status');

  if (bookErr) return { customers: [], error: bookErr.message };

  const bookings = rawBookings as Array<{
    customer_id: string | null;
    quoted_price: number;
    created_at:  string;
    status:      string;
  }>;

  const customers = rawCustomers.map(c => {
    const cBookings = bookings.filter(b => b.customer_id === c.id);
    const total_spend = cBookings
      .filter(b => ['confirmed', 'in-progress', 'completed'].includes(b.status))
      .reduce((sum, b) => sum + Number(b.quoted_price), 0);
    const sortedDates = cBookings.map(b => b.created_at).sort().reverse();

    return {
      ...c,
      total_bookings: cBookings.length,
      total_spend:    Math.round(total_spend * 100) / 100,
      last_booking:   sortedDates[0] ?? null,
    } as CustomerWithStats;
  });

  return { customers, error: null };
}

// ── Testimonials (admin: all; public hook uses visible filter) ────────

function mapDbTestimonialToTestimonial(t: any): Testimonial {
  return {
    id:         t.id,
    author:     t.author_name ?? 'Anonymous',
    rating:     Number(t.rating ?? 5),
    text:       t.quote ?? '',
    vehicle:    t.vehicle ?? 'Vehicle',
    visible:    t.is_published ?? false,
    created_at: t.created_at || t.review_date || '',
  };
}

export async function getAllTestimonials(): Promise<{
  testimonials: Testimonial[];
  error:        string | null;
}> {
  const { data, error } = await supabase
    .from('testimonials')
    .select('*')
    .order('created_at', { ascending: false });

  return {
    testimonials: (data || []).map(mapDbTestimonialToTestimonial),
    error:        error?.message ?? null,
  };
}

export async function getVisibleTestimonials(): Promise<{
  testimonials: Testimonial[];
  error:        string | null;
}> {
  const { data, error } = await supabase
    .from('testimonials')
    .select('*')
    .eq('is_published', true)
    .order('created_at', { ascending: false });

  return {
    testimonials: (data || []).map(mapDbTestimonialToTestimonial),
    error:        error?.message ?? null,
  };
}

export async function upsertTestimonial(
  payload: Omit<Testimonial, 'created_at'> & { id?: string }
): Promise<{ error: string | null }> {
  const { id, author, text, visible, rating, vehicle } = payload;

  const dbTestimonial = {
    author_name:  author,
    quote:        text,
    is_published: visible,
    rating,
    vehicle,
    review_date:  new Date().toISOString().split('T')[0]
  };

  if (id) {
    const { error } = await supabase
      .from('testimonials')
      .update(dbTestimonial)
      .eq('id', id);
    return { error: error?.message ?? null };
  } else {
    const { error } = await supabase
      .from('testimonials')
      .insert(dbTestimonial);
    return { error: error?.message ?? null };
  }
}

export async function deleteTestimonial(id: string): Promise<{ error: string | null }> {
  const { error } = await supabase
    .from('testimonials')
    .delete()
    .eq('id', id);
  return { error: error?.message ?? null };
}

export async function toggleTestimonialVisibility(
  id:      string,
  visible: boolean
): Promise<{ error: string | null }> {
  const { error } = await supabase
    .from('testimonials')
    .update({ is_published: visible })
    .eq('id', id);
  return { error: error?.message ?? null };
}

// ── Admin: Contacts Management ──────────────────────────────────────

export interface ContactMessage {
  id:          string;
  name:        string;
  email:       string;
  phone:       string;
  vehicle:     string;
  message:     string;
  source:      string;
  status:      'new' | 'responded' | 'archived';
  created_at:  string;
}

export async function getContacts(): Promise<{
  contacts: ContactMessage[];
  error:    string | null;
}> {
  const { data, error } = await supabase
    .from('contacts')
    .select('*')
    .order('created_at', { ascending: false });

  return {
    contacts: (data || []) as ContactMessage[],
    error:    error?.message ?? null,
  };
}

export async function deleteContact(id: string): Promise<{ error: string | null }> {
  const { error } = await supabase
    .from('contacts')
    .delete()
    .eq('id', id);
  return { error: error?.message ?? null };
}

// ── Admin: Email Logs Management ────────────────────────────────────

export interface EmailLogEntry {
  id:         string;
  to_email:   string;
  template:   string;
  booking_id: string | null;
  resend_id:  string | null;
  status:     string;
  error_msg:  string | null;
  sent_at:    string;
}

export async function getEmailLogs(): Promise<{
  logs:  EmailLogEntry[];
  error: string | null;
}> {
  const { data, error } = await supabase
    .from('email_log')
    .select('*')
    .order('sent_at', { ascending: false });

  return {
    logs:  (data || []) as EmailLogEntry[],
    error: error?.message ?? null,
  };
}

export async function clearEmailLogs(): Promise<{ error: string | null }> {
  const { error } = await supabase
    .from('email_log')
    .delete()
    .neq('id', '00000000-0000-0000-0000-000000000000'); // delete all
  return { error: error?.message ?? null };
}
