-- ============================================================
-- DETAIL PALS V2 — Migration: Prevent Double Bookings
-- File: supabase/migrations/009_prevent_double_bookings.sql
-- ============================================================

-- Create a unique index on (booking_date, time_slot) where the booking status is active (not cancelled/rejected).
-- In the application:
--   'cancelled' maps to database status 'cancelled'
-- This index enforces database-level race condition protection.
CREATE UNIQUE INDEX IF NOT EXISTS bookings_date_time_slot_idx
ON public.bookings (booking_date, time_slot)
WHERE (status != 'cancelled');
