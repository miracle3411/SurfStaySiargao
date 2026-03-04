-- ============================================
-- Migration: Fix overly permissive booking RLS policies
-- Run this in Supabase SQL Editor
-- ============================================

-- Drop the old overly permissive policies
DROP POLICY IF EXISTS "Public can view bookings" ON bookings;
DROP POLICY IF EXISTS "Anyone can create bookings" ON bookings;
DROP POLICY IF EXISTS "Anyone can update bookings" ON bookings;

-- Bookings: only authenticated users can view their own bookings
-- API routes use service_role key which bypasses RLS
CREATE POLICY "Users can view own bookings"
  ON bookings FOR SELECT
  USING (auth.uid() = user_id);

-- Allow anyone to insert bookings (guest_email required by API validation)
CREATE POLICY "Anyone can create bookings"
  ON bookings FOR INSERT
  WITH CHECK (true);

-- No public UPDATE policy — only service_role (API routes/webhooks) can update bookings
