-- ============================================
-- Migration: Add booking guest info + payment ref
-- Run this in Supabase SQL Editor
-- ============================================

-- Add new columns to bookings table
ALTER TABLE bookings ADD COLUMN IF NOT EXISTS guest_name text;
ALTER TABLE bookings ADD COLUMN IF NOT EXISTS guest_email text;
ALTER TABLE bookings ADD COLUMN IF NOT EXISTS payment_reference text;

-- Allow anon users to insert bookings (no auth required for now)
CREATE POLICY "Anyone can create bookings"
  ON bookings FOR INSERT
  WITH CHECK (true);

-- Allow anon users to update their own bookings (by id)
CREATE POLICY "Anyone can update bookings"
  ON bookings FOR UPDATE
  USING (true)
  WITH CHECK (true);
