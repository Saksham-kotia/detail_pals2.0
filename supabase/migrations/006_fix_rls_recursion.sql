-- ============================================================
-- DETAIL PALS V2 — Migration: Fix RLS Infinite Recursion Loop
-- File: supabase/migrations/006_fix_rls_recursion.sql
-- ============================================================

-- 1. Create a security definer helper to check admin role
-- Since it is SECURITY DEFINER, it bypasses RLS on the profiles table, preventing loop errors.
CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS boolean
SECURITY DEFINER
SET search_path = public
LANGUAGE plpgsql
AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM public.profiles
    WHERE id = auth.uid() AND role = 'admin'
  );
END;
$$;

-- 2. Drop the recursive select and update policies on profiles
DROP POLICY IF EXISTS "profiles: admin read all" ON public.profiles;
DROP POLICY IF EXISTS "profiles: admin update all" ON public.profiles;

-- 3. Re-create profiles policies using the non-recursive function
CREATE POLICY "profiles: admin read all"
  ON public.profiles FOR SELECT
  USING (public.is_admin());

CREATE POLICY "profiles: admin update all"
  ON public.profiles FOR UPDATE
  USING (public.is_admin());

-- 4. Drop and re-create bookings policy using the function
DROP POLICY IF EXISTS "bookings: admin all" ON public.bookings;
CREATE POLICY "bookings: admin all"
  ON public.bookings FOR ALL
  USING (public.is_admin());

-- 5. Drop and re-create customers policy using the function
DROP POLICY IF EXISTS "customers: admin modify" ON public.customers;
CREATE POLICY "customers: admin modify"
  ON public.customers FOR UPDATE
  USING (public.is_admin());
