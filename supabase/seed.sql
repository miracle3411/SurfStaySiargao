-- ============================================
-- SurfStay Siargao — Seed Data
-- Run this AFTER schema.sql in Supabase SQL Editor
-- ============================================

-- Use fixed UUIDs so we can reference them for pricing/photos/reviews
-- Property 1: Cloud 9 Beach House (Villa, General Luna)
INSERT INTO properties (id, property_name, property_type, description, municipality, barangay, latitude, longitude, max_guests, bedrooms, bathrooms, amenities, status)
VALUES (
  'a1b2c3d4-1111-4000-a000-000000000001',
  'Cloud 9 Beach House',
  'Villa',
  'Stunning beachfront villa just steps from the legendary Cloud 9 surf break. Wake up to ocean views, enjoy the private pool, and walk to the best waves in Southeast Asia.',
  'General Luna',
  'Cloud 9, General Luna',
  9.7750, 126.1650,
  8, 3, 2,
  '["WiFi", "Pool", "Kitchen", "AC", "Ocean View", "Surfboard Storage"]'::jsonb,
  'approved'
);

-- Property 2: Surf Shack GL (Hostel, General Luna)
INSERT INTO properties (id, property_name, property_type, description, municipality, barangay, latitude, longitude, max_guests, bedrooms, bathrooms, amenities, status)
VALUES (
  'a1b2c3d4-2222-4000-a000-000000000002',
  'Surf Shack GL',
  'Hostel',
  'Chill hostel in the heart of General Luna. Perfect for solo travelers and surf crews. Common area with hammocks, shared kitchen, and board rentals available.',
  'General Luna',
  'Tourism Road, General Luna',
  9.7950, 126.1500,
  12, 4, 3,
  '["WiFi", "Shared Kitchen", "Hammocks", "Board Rental", "Fan"]'::jsonb,
  'approved'
);

-- Property 3: Pacifico Hideaway (Homestay, San Isidro)
INSERT INTO properties (id, property_name, property_type, description, municipality, barangay, latitude, longitude, max_guests, bedrooms, bathrooms, amenities, status)
VALUES (
  'a1b2c3d4-3333-4000-a000-000000000003',
  'Pacifico Hideaway',
  'Homestay',
  'Quiet homestay near Pacifico Beach. Run by a warm local family who will cook fresh seafood for you. Ideal for surfers looking for uncrowded waves.',
  'San Isidro',
  'Pacifico, San Isidro',
  9.8600, 126.1200,
  4, 2, 1,
  '["WiFi", "Home-cooked Meals", "Fan", "Garden", "Motorbike Rental"]'::jsonb,
  'approved'
);

-- Property 4: Dapa Port Inn (Hotel, Dapa)
INSERT INTO properties (id, property_name, property_type, description, municipality, barangay, latitude, longitude, max_guests, bedrooms, bathrooms, amenities, status)
VALUES (
  'a1b2c3d4-4444-4000-a000-000000000004',
  'Dapa Port Inn',
  'Hotel',
  'Convenient hotel near Dapa port and Sayak Airport transfer point. Clean rooms, reliable AC, and helpful staff for island orientation.',
  'Dapa',
  'Poblacion, Dapa',
  9.7600, 126.0550,
  2, 1, 1,
  '["WiFi", "AC", "TV", "Restaurant", "Airport Transfer"]'::jsonb,
  'approved'
);

-- Property 5: Island View Apartment (Apartment, General Luna)
INSERT INTO properties (id, property_name, property_type, description, municipality, barangay, latitude, longitude, max_guests, bedrooms, bathrooms, amenities, status)
VALUES (
  'a1b2c3d4-5555-4000-a000-000000000005',
  'Island View Apartment',
  'Apartment',
  'Modern apartment with a balcony overlooking the mangroves. Fully equipped kitchen, fast WiFi for remote workers, and walking distance to GL restaurants.',
  'General Luna',
  'Catangnan, General Luna',
  9.7900, 126.1580,
  4, 2, 1,
  '["WiFi", "AC", "Kitchen", "Balcony", "Washing Machine", "Work Desk"]'::jsonb,
  'approved'
);

-- Property 6: Bamboo Villa Del Carmen (Villa, Del Carmen)
INSERT INTO properties (id, property_name, property_type, description, municipality, barangay, latitude, longitude, max_guests, bedrooms, bathrooms, amenities, status)
VALUES (
  'a1b2c3d4-6666-4000-a000-000000000006',
  'Bamboo Villa Del Carmen',
  'Villa',
  'Eco-luxury bamboo villa surrounded by coconut palms. Features a saltwater pool, open-air living, and easy access to Del Carmen mangrove tours.',
  'Del Carmen',
  'Poblacion, Del Carmen',
  9.8600, 126.0400,
  6, 2, 2,
  '["WiFi", "Pool", "Kitchen", "AC", "Garden", "Kayak"]'::jsonb,
  'approved'
);

-- Property 7: Sunrise Homestay (Homestay, General Luna)
INSERT INTO properties (id, property_name, property_type, description, municipality, barangay, latitude, longitude, max_guests, bedrooms, bathrooms, amenities, status)
VALUES (
  'a1b2c3d4-7777-4000-a000-000000000007',
  'Sunrise Homestay',
  'Homestay',
  'Cozy beachside homestay with sunrise views. Family-run with authentic Filipino hospitality. Fresh breakfast included daily.',
  'General Luna',
  'Malinao, General Luna',
  9.7850, 126.1620,
  3, 1, 1,
  '["WiFi", "Breakfast Included", "Fan", "Beach Access"]'::jsonb,
  'approved'
);

-- Property 8: Backpacker Base (Hostel, General Luna)
INSERT INTO properties (id, property_name, property_type, description, municipality, barangay, latitude, longitude, max_guests, bedrooms, bathrooms, amenities, status)
VALUES (
  'a1b2c3d4-8888-4000-a000-000000000008',
  'Backpacker Base',
  'Hostel',
  'Budget-friendly hostel with dorm beds and private rooms. Rooftop bar, movie nights, and island tour bookings. The social hub of GL!',
  'General Luna',
  'Tourism Road, General Luna',
  9.7930, 126.1480,
  16, 6, 4,
  '["WiFi", "Rooftop Bar", "Shared Kitchen", "Laundry", "Tour Desk"]'::jsonb,
  'approved'
);

-- ============================================
-- Pricing (one per property)
-- ============================================
INSERT INTO property_pricing (property_id, base_price) VALUES
  ('a1b2c3d4-1111-4000-a000-000000000001', 4500.00),
  ('a1b2c3d4-2222-4000-a000-000000000002', 800.00),
  ('a1b2c3d4-3333-4000-a000-000000000003', 2200.00),
  ('a1b2c3d4-4444-4000-a000-000000000004', 1800.00),
  ('a1b2c3d4-5555-4000-a000-000000000005', 3000.00),
  ('a1b2c3d4-6666-4000-a000-000000000006', 5500.00),
  ('a1b2c3d4-7777-4000-a000-000000000007', 1500.00),
  ('a1b2c3d4-8888-4000-a000-000000000008', 600.00);

-- ============================================
-- Photos (2-3 per property, using placeholder URLs)
-- Replace these with real Cloudinary URLs later
-- ============================================
INSERT INTO property_photos (property_id, photo_url, is_cover, display_order) VALUES
  -- Cloud 9 Beach House
  ('a1b2c3d4-1111-4000-a000-000000000001', 'https://images.unsplash.com/photo-1499793983690-e29da59ef1c2?w=800', true, 1),
  ('a1b2c3d4-1111-4000-a000-000000000001', 'https://images.unsplash.com/photo-1520250497591-112f2f40a3f4?w=800', false, 2),
  ('a1b2c3d4-1111-4000-a000-000000000001', 'https://images.unsplash.com/photo-1571896349842-33c89424de2d?w=800', false, 3),
  -- Surf Shack GL
  ('a1b2c3d4-2222-4000-a000-000000000002', 'https://images.unsplash.com/photo-1555854877-bab0e564b8d5?w=800', true, 1),
  ('a1b2c3d4-2222-4000-a000-000000000002', 'https://images.unsplash.com/photo-1520277739336-7bf67edfa768?w=800', false, 2),
  -- Pacifico Hideaway
  ('a1b2c3d4-3333-4000-a000-000000000003', 'https://images.unsplash.com/photo-1518780664697-55e3ad937233?w=800', true, 1),
  ('a1b2c3d4-3333-4000-a000-000000000003', 'https://images.unsplash.com/photo-1564013799919-ab600027ffc6?w=800', false, 2),
  -- Dapa Port Inn
  ('a1b2c3d4-4444-4000-a000-000000000004', 'https://images.unsplash.com/photo-1566073771259-6a8506099945?w=800', true, 1),
  ('a1b2c3d4-4444-4000-a000-000000000004', 'https://images.unsplash.com/photo-1582719508461-905c673771fd?w=800', false, 2),
  -- Island View Apartment
  ('a1b2c3d4-5555-4000-a000-000000000005', 'https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?w=800', true, 1),
  ('a1b2c3d4-5555-4000-a000-000000000005', 'https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?w=800', false, 2),
  -- Bamboo Villa Del Carmen
  ('a1b2c3d4-6666-4000-a000-000000000006', 'https://images.unsplash.com/photo-1587061949409-02df41d5e562?w=800', true, 1),
  ('a1b2c3d4-6666-4000-a000-000000000006', 'https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?w=800', false, 2),
  ('a1b2c3d4-6666-4000-a000-000000000006', 'https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?w=800', false, 3),
  -- Sunrise Homestay
  ('a1b2c3d4-7777-4000-a000-000000000007', 'https://images.unsplash.com/photo-1510798831971-661eb04b3739?w=800', true, 1),
  ('a1b2c3d4-7777-4000-a000-000000000007', 'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?w=800', false, 2),
  -- Backpacker Base
  ('a1b2c3d4-8888-4000-a000-000000000008', 'https://images.unsplash.com/photo-1520277739336-7bf67edfa768?w=800', true, 1),
  ('a1b2c3d4-8888-4000-a000-000000000008', 'https://images.unsplash.com/photo-1590490360182-c33d57733427?w=800', false, 2);

-- ============================================
-- Reviews (2-3 per property)
-- ============================================
INSERT INTO reviews (property_id, overall_rating, comment) VALUES
  -- Cloud 9 Beach House
  ('a1b2c3d4-1111-4000-a000-000000000001', 5, 'Absolutely incredible! Woke up to perfect waves every morning. The villa is spotless and the pool is a bonus.'),
  ('a1b2c3d4-1111-4000-a000-000000000001', 4, 'Great location right at Cloud 9. Only wish the kitchen was a bit bigger. Would definitely come back!'),
  ('a1b2c3d4-1111-4000-a000-000000000001', 5, 'Best stay in Siargao. The host arranged surf lessons and island hopping for us. 10/10!'),
  -- Surf Shack GL
  ('a1b2c3d4-2222-4000-a000-000000000002', 4, 'Perfect for solo travelers! Met amazing people here. The hammock area is chef''s kiss.'),
  ('a1b2c3d4-2222-4000-a000-000000000002', 5, 'Best value hostel in GL. Clean, fun vibes, and the staff are super helpful with surf tips.'),
  -- Pacifico Hideaway
  ('a1b2c3d4-3333-4000-a000-000000000003', 5, 'The family is so welcoming! Lola''s cooking is the best on the island. Pacifico waves were uncrowded.'),
  ('a1b2c3d4-3333-4000-a000-000000000003', 4, 'Peaceful and authentic. No AC but the breeze is enough. Loved the home-cooked meals.'),
  -- Dapa Port Inn
  ('a1b2c3d4-4444-4000-a000-000000000004', 3, 'Basic but clean. Good for a night near the port. Staff helped arrange our habal-habal to GL.'),
  ('a1b2c3d4-4444-4000-a000-000000000004', 4, 'Convenient location near the port. AC works well. Good value for money.'),
  -- Island View Apartment
  ('a1b2c3d4-5555-4000-a000-000000000005', 5, 'Worked remotely here for 2 weeks. Fast WiFi, great kitchen, and the balcony view is stunning.'),
  ('a1b2c3d4-5555-4000-a000-000000000005', 4, 'Modern and well-maintained. Walking distance to restaurants. Perfect for longer stays.'),
  -- Bamboo Villa Del Carmen
  ('a1b2c3d4-6666-4000-a000-000000000006', 5, 'Eco-paradise! The bamboo architecture is gorgeous. Did the mangrove tour right from here.'),
  ('a1b2c3d4-6666-4000-a000-000000000006', 5, 'One of the most unique stays I''ve ever had. The saltwater pool is amazing. Very Instagram-worthy!'),
  -- Sunrise Homestay
  ('a1b2c3d4-7777-4000-a000-000000000007', 4, 'Simple but lovely. The sunrise from the beach is magical. Breakfast was delicious.'),
  ('a1b2c3d4-7777-4000-a000-000000000007', 5, 'Felt like staying with family. The hosts are genuinely kind. Will come back next surf season.'),
  -- Backpacker Base
  ('a1b2c3d4-8888-4000-a000-000000000008', 4, 'Best social hostel in GL! Rooftop bar has the best sunset views. Dorm beds are comfy.'),
  ('a1b2c3d4-8888-4000-a000-000000000008', 3, 'Fun atmosphere but can be noisy at night. Good if you want to party, not ideal for light sleepers.');
