-- ============================================================
-- DETAIL PALS V2 — Migration: Add booking customer fields
-- File: supabase/migrations/008_add_booking_customer_fields.sql
-- ============================================================

-- 1. Add columns to bookings
ALTER TABLE public.bookings ADD COLUMN IF NOT EXISTS customer_name text;
ALTER TABLE public.bookings ADD COLUMN IF NOT EXISTS customer_phone text;
ALTER TABLE public.bookings ADD COLUMN IF NOT EXISTS customer_email text;

-- 2. Populate columns for existing bookings from the customers table
UPDATE public.bookings b
SET customer_name = c.name,
    customer_phone = c.phone,
    customer_email = c.email
FROM public.customers c
WHERE b.customer_id = c.id;

-- 3. Make the columns NOT NULL
ALTER TABLE public.bookings ALTER COLUMN customer_name SET NOT NULL;
ALTER TABLE public.bookings ALTER COLUMN customer_phone SET NOT NULL;
ALTER TABLE public.bookings ALTER COLUMN customer_email SET NOT NULL;

-- 4. Recreate the bookings_view to read directly from bookings table
CREATE OR REPLACE VIEW public.bookings_view AS
SELECT
  b.id,
  b.ref,
  b.status,
  b.booking_date,
  b.time_slot,
  b.quoted_price,
  b.final_price,
  b.vehicle_type,
  b.vehicle_make,
  b.vehicle_model,
  b.condition,
  b.add_on_ids,
  b.notes,
  b.created_at,
  b.customer_name,
  b.customer_phone,
  b.customer_email,
  s.name    AS service_name,
  s.tier    AS service_tier,
  p.full_name AS staff_name
FROM
  public.bookings b
  JOIN public.services  s  ON s.id = b.service_id
  LEFT JOIN public.profiles p ON p.id = b.staff_id;
