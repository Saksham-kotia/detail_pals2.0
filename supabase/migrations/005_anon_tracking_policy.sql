-- ============================================================
-- DETAIL PALS V2 — Migration: Public Booking Tracking & Realtime
-- File: supabase/migrations/005_anon_tracking_policy.sql
-- ============================================================

-- 1. Allow public select on bookings (necessary for tracking by reference code)
CREATE POLICY "bookings: public select" ON public.bookings
  FOR SELECT USING (true);

-- 2. Allow public select on customers ONLY if they are linked to a booking
CREATE POLICY "customers: public select by booking reference" ON public.customers
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.bookings b
      WHERE b.customer_id = customers.id
    )
  );

-- 3. Enable Realtime replication on the bookings table
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_publication_tables
    WHERE pubname = 'supabase_realtime' AND schemaname = 'public' AND tablename = 'bookings'
  ) THEN
    ALTER PUBLICATION supabase_realtime ADD TABLE public.bookings;
  END IF;
END $$;
