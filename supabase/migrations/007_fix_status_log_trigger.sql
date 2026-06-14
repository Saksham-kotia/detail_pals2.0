-- ============================================================
-- DETAIL PALS V2 — Migration: Fix status log trigger RLS violation
-- File: supabase/migrations/007_fix_status_log_trigger.sql
-- ============================================================

-- Re-create the trigger function with SECURITY DEFINER privileges.
-- This allows the trigger to execute with the bypass privileges of the database owner,
-- allowing writes to the RLS-protected booking_status_log table.
CREATE OR REPLACE FUNCTION public.log_booking_status_change()
RETURNS trigger
SECURITY DEFINER
SET search_path = public
LANGUAGE plpgsql
AS $$
BEGIN
  IF old.status IS DISTINCT FROM new.status THEN
    INSERT INTO public.booking_status_log (booking_id, from_status, to_status, changed_by)
    VALUES (new.id, old.status, new.status, auth.uid());
  END IF;
  RETURN new;
END;
$$;
