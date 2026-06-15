// ─── Detail Pals V2 — Booking Service ───────────────────────────────
// All booking-related Supabase operations.
// Public: createBooking (anon insert)
// Admin:  getBookings, getBooking, updateBookingStatus, deleteBooking

import { supabase } from '../lib/supabase';
import type { Booking, BookingStatus, CreateBookingPayload, BookingServiceItem } from '../lib/types';
import { generateBookingReference } from '../lib/pricing';

export interface CreateBookingResult {
  booking:   Booking | null;
  reference: string | null;
  error:     string | null;
}

// Convert "8:00 AM" or "4:00 PM" -> "08:00" or "16:00"
function convertTo24Hour(timeStr: string): string {
  const [time, modifier] = timeStr.split(' ');
  let [hours, minutes] = time.split(':');
  if (hours === '12') {
    hours = modifier === 'PM' ? '12' : '00';
  } else if (modifier === 'PM') {
    hours = String(parseInt(hours, 10) + 12);
  }
  return `${hours.padStart(2, '0')}:${minutes}`;
}

export function mapDbBookingToBooking(b: any, dbAddons: any[]): Booking {
  const addons: BookingServiceItem[] = [];
  if (b.add_on_ids && dbAddons) {
    for (const id of b.add_on_ids) {
      const matched = dbAddons.find(a => a.id === id);
      if (matched) {
        addons.push({
          id: matched.id,
          name: matched.name,
          price: Number(matched.price)
        });
      }
    }
  }

  let timeDisplay = b.time_slot;
  if (b.time_slot && b.time_slot.includes(':')) {
    const parts = b.time_slot.split(':');
    let h = parseInt(parts[0], 10);
    const m = parts[1];
    const ampm = h >= 12 ? 'PM' : 'AM';
    h = h % 12;
    if (h === 0) h = 12;
    timeDisplay = `${h}:${m} ${ampm}`;
  }

  return {
    id: b.id,
    reference: b.ref,
    customer_id: b.customer_id,
    customer_name: b.customer_name ?? b.customer?.name ?? 'Unknown',
    customer_email: b.customer_email ?? b.customer?.email ?? '',
    customer_phone: b.customer_phone ?? b.customer?.phone ?? '',
    vehicle_type: b.vehicle_type,
    vehicle_make: b.vehicle_make,
    vehicle_model: b.vehicle_model,
    vehicle_year: String(b.vehicle_year ?? ''),
    vehicle_color: b.vehicle_color || '',
    vehicle_condition: b.condition,
    condition_notes: b.notes ?? '',
    services: b.service ? [{
      id: b.service.id,
      name: b.service.name,
      price: Number(b.service.base_price)
    }] : [],
    addons,
    total_price: Number(b.quoted_price),
    preferred_date: b.booking_date,
    preferred_time: timeDisplay,
    status: b.status,
    created_at: b.created_at,
    updated_at: b.updated_at
  };
}

// ── Public: submit a new booking ─────────────────────────────────────

export async function createBooking(
  payload: CreateBookingPayload
): Promise<CreateBookingResult> {
  try {
    const reference = generateBookingReference();

    // 1. Upsert customer record via API function
    let customer_id: string | null = null;
    try {
      const res = await fetch('/api/customer-upsert', {
        method:  'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name:  payload.customer_name,
          email: payload.customer_email,
          phone: payload.customer_phone,
          vehicle_type: payload.vehicle_type,
          booking_ref: reference,
        }),
      });
      if (res.ok) {
        const data = await res.json() as { customer_id: string };
        customer_id = data.customer_id;
      }
    } catch (err) {
      console.warn('[Detail Pals] Customer upsert failed:', err);
    }

    if (!customer_id) {
      // Fallback direct query/insert if API function fails or is unreachable
      const { data: existingCust } = await supabase
        .from('customers')
        .select('id')
        .eq('email', payload.customer_email)
        .maybeSingle();

      if (existingCust) {
        customer_id = existingCust.id;
        // Update customer details, vehicle preference and last booking ref
        await supabase
          .from('customers')
          .update({
            name: payload.customer_name,
            phone: payload.customer_phone,
            vehicle_default: payload.vehicle_type,
            notes: `Last Booking Ref: ${reference}`,
          })
          .eq('id', customer_id);
      } else {
        const { data: custData, error: custErr } = await supabase
          .from('customers')
          .insert({
            name: payload.customer_name,
            email: payload.customer_email,
            phone: payload.customer_phone,
            vehicle_default: payload.vehicle_type,
            notes: `Last Booking Ref: ${reference}`,
          })
          .select('id')
          .single();
        if (!custErr && custData) {
          customer_id = custData.id;
        } else {
          return { booking: null, reference: null, error: custErr?.message || 'Failed to create customer record' };
        }
      }
    }

    // Fetch services and add_ons to resolve matching IDs
    const { data: dbServices } = await supabase.from('services').select('id, tier, name');
    const { data: dbAddons } = await supabase.from('add_ons').select('id, name');

    // Resolve main service ID
    let service_id = '';
    const selectedService = payload.services[0];
    if (selectedService && dbServices) {
      const fsId = selectedService.id;
      const matched = dbServices.find(s => s.tier === fsId);
      if (matched) service_id = matched.id;
    }
    if (!service_id && dbServices && dbServices.length > 0) {
      service_id = dbServices[0].id;
    }

    // Resolve addon IDs
    const add_on_ids: string[] = [];
    if (payload.addons && dbAddons) {
      for (const addon of payload.addons) {
        const matched = dbAddons.find(a => {
          const nameLower = a.name.toLowerCase();
          const targetLower = addon.name.toLowerCase();
          return nameLower.includes(targetLower) || targetLower.includes(nameLower) ||
                 (addon.id === 'engine' && nameLower.includes('engine')) ||
                 (addon.id === 'ozone' && nameLower.includes('odour')) ||
                 (addon.id === 'ozone' && nameLower.includes('odor')) ||
                 (addon.id === 'headlight' && nameLower.includes('headlight')) ||
                 (addon.id === 'pet' && nameLower.includes('pet')) ||
                 (addon.id === 'rim-tire' && nameLower.includes('rim')) ||
                 (addon.id === 'rim-tire' && nameLower.includes('tire')) ||
                 (addon.id === 'glass-rain' && nameLower.includes('glass')) ||
                 (addon.id === 'glass-rain' && nameLower.includes('rain')) ||
                 (addon.id === 'glass-rain' && nameLower.includes('repellent'));
        });
        if (matched) add_on_ids.push(matched.id);
      }
    }

    // Parse vehicle details
    let vehicle_make = 'Unknown';
    let vehicle_model = 'Unknown';
    let vehicle_year = 2026;
    if (payload.vehicle_make) {
      const parts = payload.vehicle_make.split(',');
      const mainPart = parts[0].trim();
      const firstWord = mainPart.split(' ')[0];
      vehicle_make = firstWord;
      vehicle_model = mainPart.substring(firstWord.length).trim() || 'Model';
      const yearMatch = payload.vehicle_make.match(/\b(19\d{2}|20\d{2})\b/);
      if (yearMatch) vehicle_year = parseInt(yearMatch[0], 10);
    }
    if (payload.vehicle_model && vehicle_model === 'Model') {
      vehicle_model = payload.vehicle_model;
    }
    if (payload.vehicle_year) {
      const yr = parseInt(payload.vehicle_year, 10);
      if (!isNaN(yr)) vehicle_year = yr;
    }

    // Convert time slot to 24 hour
    const booking_time = convertTo24Hour(payload.preferred_time);

    // Check if slot is already occupied
    const { data: isAvailable, error: checkError } = await supabase
      .rpc('check_slot_available', {
        check_date: payload.preferred_date,
        check_slot: booking_time
      });

    if (checkError) {
      console.error('[Detail Pals] Double booking check error:', checkError);
      return { booking: null, reference: null, error: checkError.message };
    }

    if (isAvailable === false) {
      return { booking: null, reference: null, error: 'This time slot is already reserved. Please select another slot.' };
    }

    // Save notes
    let notes = payload.condition_notes || '';
    if (payload.vehicle_color) {
      notes = `Color: ${payload.vehicle_color}. ${notes}`;
    }

    // 2. Insert booking
    const { data, error } = await supabase
      .from('bookings')
      .insert({
        ref:             reference,
        customer_id,
        service_id,
        customer_name:   payload.customer_name,
        customer_phone:  payload.customer_phone,
        customer_email:  payload.customer_email,
        vehicle_type:    payload.vehicle_type,
        vehicle_make,
        vehicle_model,
        vehicle_year,
        condition:       payload.vehicle_condition,
        add_on_ids,
        quoted_price:    payload.total_price,
        status:          'pending', // Starts as awaited (pending)
        booking_date:    payload.preferred_date,
        time_slot:       booking_time,
        notes,
      })
      .select('*, customer:customers(*), service:services(*)')
      .single();

    if (error) {
      console.error('[Detail Pals] Booking insert error:', error);
      return { booking: null, reference: null, error: error.message };
    }

    const mappedBooking = mapDbBookingToBooking(data, dbAddons || []);

    // Trigger initial booking confirmation (awaited) email
    try {
      await fetch('/api/send-email', {
        method:  'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          type:      'booking_confirmation',
          booking_id: data.id,
          to:        mappedBooking.customer_email,
          name:      mappedBooking.customer_name,
          reference: reference,
          date:      mappedBooking.preferred_date,
          time:      mappedBooking.preferred_time,
          services:  mappedBooking.services,
          addons:    mappedBooking.addons,
          total:     mappedBooking.total_price,
          vehicle:   `${mappedBooking.vehicle_make} ${mappedBooking.vehicle_model}`,
        }),
      });
    } catch (err) {
      console.warn('[Detail Pals] Initial booking email trigger failed:', err);
    }

    return { booking: mappedBooking, reference, error: null };
  } catch (err) {
    return { booking: null, reference: null, error: String(err) };
  }
}

// ── Admin: fetch all bookings with optional filters ──────────────────

export interface BookingFilters {
  status?   : BookingStatus | 'all';
  search?   : string;
  dateFrom? : string;
  dateTo?   : string;
  page?     : number;
  pageSize? : number;
}

export async function getBookings(filters: BookingFilters = {}): Promise<{
  bookings: Booking[];
  count:    number;
  error:    string | null;
}> {
  const {
    status   = 'all',
    search   = '',
    dateFrom,
    dateTo,
    page     = 1,
    pageSize = 25,
  } = filters;

  const { data: dbAddons } = await supabase.from('add_ons').select('*');

  let query = supabase
    .from('bookings')
    .select('*, customer:customers(*), service:services(*)', { count: 'exact' });

  if (status !== 'all') {
    query = query.eq('status', status);
  }

  if (search) {
    query = query.ilike('ref', `%${search}%`);
  }

  if (dateFrom) query = query.gte('booking_date', dateFrom);
  if (dateTo)   query = query.lte('booking_date', dateTo);

  const from = (page - 1) * pageSize;
  query = query
    .order('created_at', { ascending: false })
    .range(from, from + pageSize - 1);

  const { data, count, error } = await query;

  const mappedBookings = (data as any[])?.map(b => mapDbBookingToBooking(b, dbAddons || [])) ?? [];

  return {
    bookings: mappedBookings,
    count:    count ?? 0,
    error:    error?.message ?? null,
  };
}

// ── Admin: single booking ────────────────────────────────────────────

export async function getBooking(id: string): Promise<{
  booking: Booking | null;
  error:   string | null;
}> {
  const { data: dbAddons } = await supabase.from('add_ons').select('*');
  const { data, error } = await supabase
    .from('bookings')
    .select('*, customer:customers(*), service:services(*)')
    .eq('id', id)
    .single();

  return {
    booking: data ? mapDbBookingToBooking(data, dbAddons || []) : null,
    error:   error?.message ?? null,
  };
}

// ── Admin: update booking status ─────────────────────────────────────

export async function updateBookingStatus(
  id: string,
  status: BookingStatus
): Promise<{ error: string | null }> {
  const { data, error } = await supabase
    .from('bookings')
    .update({ status })
    .eq('id', id)
    .select('*, customer:customers(*), service:services(*)')
    .single();

  if (error) return { error: error.message };

  // Trigger confirmation email via serverless function when status changes to 'confirmed'
  if (data) {
    try {
      const { data: dbAddons } = await supabase.from('add_ons').select('*');
      const mappedBooking = mapDbBookingToBooking(data, dbAddons || []);

      await fetch('/api/send-email', {
        method:  'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          type:      'booking_status_update',
          to:        mappedBooking.customer_email,
          name:      mappedBooking.customer_name,
          reference: mappedBooking.reference,
          status:    status,
          date:      mappedBooking.preferred_date,
          time:      mappedBooking.preferred_time,
          services:  mappedBooking.services,
          addons:    mappedBooking.addons,
          total:     mappedBooking.total_price,
          vehicle:   `${mappedBooking.vehicle_make} ${mappedBooking.vehicle_model}`,
        }),
      });
    } catch (err) {
      console.warn('[Detail Pals] Status update email failed to send:', err);
    }
  }

  return { error: null };
}

// ── Admin: delete booking ────────────────────────────────────────────

export async function deleteBooking(id: string): Promise<{ error: string | null }> {
  const { error } = await supabase
    .from('bookings')
    .delete()
    .eq('id', id);

  return { error: error?.message ?? null };
}

// ── Public: submit a contact form ────────────────────────────────────

export async function submitContact(payload: {
  name:    string;
  email:   string;
  phone:   string;
  message: string;
}): Promise<{ error: string | null }> {
  const { error } = await supabase
    .from('contacts')
    .insert({
      name:    payload.name,
      email:   payload.email,
      phone:   payload.phone,
      message: payload.message,
      source:  'contact-form',
      status:  'new',
    });

  if (!error) {
    try {
      await fetch('/api/send-email', {
        method:  'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          type:    'contact_form',
          name:    payload.name,
          to:      payload.email,
          phone:   payload.phone,
          message: payload.message,
        }),
      });
    } catch (err) {
      console.warn('[Detail Pals] Contact email trigger failed:', err);
    }
  }

  return { error: error?.message ?? null };
}

