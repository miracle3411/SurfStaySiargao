-- ============================================
-- SurfStay Siargao — Database Schema
-- Run this in Supabase SQL Editor
-- ============================================

-- Drop existing tables (in reverse FK order)
DROP TABLE IF EXISTS bookings CASCADE;
DROP TABLE IF EXISTS reviews CASCADE;
DROP TABLE IF EXISTS property_photos CASCADE;
DROP TABLE IF EXISTS property_pricing CASCADE;
DROP TABLE IF EXISTS properties CASCADE;

-- 1. Properties table
CREATE TABLE properties (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  property_name text NOT NULL,
  property_type text NOT NULL CHECK (property_type IN ('Villa', 'Homestay', 'Hotel', 'Hostel', 'Apartment')),
  description text,
  municipality text,
  barangay text NOT NULL,
  latitude decimal(10,7),
  longitude decimal(10,7),
  max_guests integer NOT NULL DEFAULT 2,
  bedrooms integer DEFAULT 1,
  bathrooms integer DEFAULT 1,
  amenities jsonb DEFAULT '[]'::jsonb,
  status text NOT NULL DEFAULT 'approved' CHECK (status IN ('pending', 'approved', 'rejected')),
  owner_id uuid,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- 2. Property pricing table
CREATE TABLE property_pricing (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  property_id uuid NOT NULL REFERENCES properties(id) ON DELETE CASCADE,
  base_price decimal(10,2) NOT NULL,
  created_at timestamptz DEFAULT now()
);

-- 3. Property photos table
CREATE TABLE property_photos (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  property_id uuid NOT NULL REFERENCES properties(id) ON DELETE CASCADE,
  photo_url text NOT NULL,
  is_cover boolean DEFAULT false,
  display_order integer DEFAULT 0
);

-- 4. Reviews table
CREATE TABLE reviews (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  property_id uuid NOT NULL REFERENCES properties(id) ON DELETE CASCADE,
  user_id uuid,
  overall_rating integer NOT NULL CHECK (overall_rating >= 1 AND overall_rating <= 5),
  comment text,
  created_at timestamptz DEFAULT now()
);

-- 5. Bookings table
CREATE TABLE bookings (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  property_id uuid NOT NULL REFERENCES properties(id) ON DELETE CASCADE,
  user_id uuid,
  guest_name text,
  guest_email text,
  check_in date NOT NULL,
  check_out date NOT NULL,
  guests integer NOT NULL DEFAULT 1,
  total_price decimal(10,2),
  status text DEFAULT 'pending' CHECK (status IN ('pending', 'confirmed', 'cancelled', 'completed')),
  payment_status text DEFAULT 'pending' CHECK (payment_status IN ('pending', 'paid', 'refunded')),
  payment_reference text,
  created_at timestamptz DEFAULT now()
);

-- ============================================
-- Indexes
-- ============================================
CREATE INDEX idx_properties_status ON properties(status);
CREATE INDEX idx_properties_type ON properties(property_type);
CREATE INDEX idx_properties_barangay ON properties(barangay);
CREATE INDEX idx_property_pricing_property_id ON property_pricing(property_id);
CREATE INDEX idx_property_photos_property_id ON property_photos(property_id);
CREATE INDEX idx_reviews_property_id ON reviews(property_id);
CREATE INDEX idx_bookings_property_id ON bookings(property_id);

-- ============================================
-- Row Level Security
-- ============================================

-- Enable RLS on all tables
ALTER TABLE properties ENABLE ROW LEVEL SECURITY;
ALTER TABLE property_pricing ENABLE ROW LEVEL SECURITY;
ALTER TABLE property_photos ENABLE ROW LEVEL SECURITY;
ALTER TABLE reviews ENABLE ROW LEVEL SECURITY;
ALTER TABLE bookings ENABLE ROW LEVEL SECURITY;

-- Public read access for property-related tables
CREATE POLICY "Public can view approved properties"
  ON properties FOR SELECT
  USING (status = 'approved');

CREATE POLICY "Public can view property pricing"
  ON property_pricing FOR SELECT
  USING (true);

CREATE POLICY "Public can view property photos"
  ON property_photos FOR SELECT
  USING (true);

CREATE POLICY "Public can view reviews"
  ON reviews FOR SELECT
  USING (true);

CREATE POLICY "Public can view bookings"
  ON bookings FOR SELECT
  USING (true);

-- ============================================
-- Updated_at trigger
-- ============================================
CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER properties_updated_at
  BEFORE UPDATE ON properties
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();
