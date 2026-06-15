-- ============================================================
-- DETAIL PALS V2 — Migration: Secure Booking Access via RPC
-- File: supabase/migrations/011_secure_booking_access.sql
-- ============================================================

-- 1. Drop public select policies that leak PII / allow full scans
DROP POLICY IF EXISTS "bookings: public select" ON public.bookings;
DROP POLICY IF EXISTS "customers: public select by booking reference" ON public.customers;

-- 2. Ensure customers select policy only permits auth staff or owner definer queries
-- Customers can still be inserted by anon (booking creation)
-- Staff read is already handled by "customers: staff read all"

-- 3. Create SECURE RPC: get_booking_by_ref
CREATE OR REPLACE FUNCTION public.get_booking_by_ref(booking_ref text)
RETURNS TABLE (
  id uuid,
  ref text,
  customer_id uuid,
  customer_name text,
  customer_email text,
  customer_phone text,
  vehicle_type text,
  vehicle_make text,
  vehicle_model text,
  vehicle_year integer,
  vehicle_color text,
  condition text,
  notes text,
  quoted_price numeric,
  status text,
  booking_date date,
  time_slot text,
  created_at timestamptz,
  updated_at timestamptz,
  service_id uuid,
  service_name text,
  service_tier text,
  service_price numeric,
  add_on_ids uuid[]
)
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  RETURN QUERY
  SELECT 
    b.id,
    b.ref,
    b.customer_id,
    b.customer_name,
    b.customer_email,
    b.customer_phone,
    b.vehicle_type,
    b.vehicle_make,
    b.vehicle_model,
    b.vehicle_year::integer,
    b.vehicle_color,
    b.condition::text,
    b.notes,
    b.quoted_price,
    b.status::text,
    b.booking_date,
    b.time_slot,
    b.created_at,
    b.updated_at,
    b.service_id,
    s.name AS service_name,
    s.tier::text AS service_tier,
    s.base_price AS service_price,
    b.add_on_ids
  FROM public.bookings b
  JOIN public.customers c ON c.id = b.customer_id
  JOIN public.services s ON s.id = b.service_id
  WHERE b.ref = booking_ref;
END;
$$;

-- 4. Create SECURE RPC: get_occupied_slots
CREATE OR REPLACE FUNCTION public.get_occupied_slots()
RETURNS TABLE (
  booking_date date,
  time_slot text
)
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  RETURN QUERY
  SELECT b.booking_date, b.time_slot
  FROM public.bookings b
  WHERE b.status != 'cancelled';
END;
$$;

-- 5. Create SECURE RPC: check_slot_available
CREATE OR REPLACE FUNCTION public.check_slot_available(check_date date, check_slot text)
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  RETURN NOT EXISTS (
    SELECT 1 FROM public.bookings b
    WHERE b.booking_date = check_date
      AND b.time_slot = check_slot
      AND b.status != 'cancelled'
  );
END;
$$;
