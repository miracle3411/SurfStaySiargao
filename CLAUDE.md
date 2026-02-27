# Siargao Island Property Rental Platform 🏝️

## Project Overview
A Next.js-based property rental platform specifically for Siargao Island, Philippines. The platform features an interactive map showing available properties (villas, homestays, hotels, hostels, apartments) across the island with real-time availability and booking capabilities.

## Tech Stack
- **Framework**: Next.js (App Router)
- **Language**: TypeScript
- **Styling**: Tailwind CSS
- **Map Library**: Leaflet.js
- **Database**: Supabase (PostgreSQL)
- **UI Components**: Lucide React icons
- **Deployment**: TBD (likely Vercel)

## Current Project Status

### ✅ Completed
1. **Interactive Map Component** (`components/SiargaoMap.tsx`)
   - Leaflet map centered on Siargao Island
   - Ocean blue gradient background
   - Yellow/green island outline with hover effects
   - Custom property markers with pricing
   - Property detail popup cards
   - Area labels for major locations (General Luna, Cloud 9, Pacifico, Dapa)
   - Property type legend

2. **GeoJSON Data** 
   - `SIARGAO_ISLAND_CLEANED.geojson` - Filtered and cleaned Siargao boundaries
   - Removed mainland Mindanao and other non-Siargao areas
   - Fixed problematic General Luna polygon that extended too far north
   - 8 municipalities included: Burgos, Dapa, Del Carmen, General Luna, Pilar, San Benito, San Isidro, Sapao
   - 41 total polygon features

3. **Map Features**
   - Property markers currently disabled (temporary)
   - Tooltips removed to fix incorrect municipality labels
   - Responsive design with mobile support
   - Zoom controls and bounds restrictions

### 🚧 In Progress / Next Steps

#### Immediate Priorities
1. **Database Schema Setup**
   - Properties table (property details, location, pricing, capacity)
   - Photos table (property images with cover photo flag)
   - Reviews table (ratings and guest feedback)
   - Bookings table (reservation system)
   - Users table (property owners and guests)

2. **Property Markers Re-implementation**
   - Enable property markers on map
   - Connect to real Supabase data
   - Dynamic pricing display
   - Filter by property type
   - Click to view property details

3. **Property Detail Pages**
   - Full property information
   - Photo gallery
   - Availability calendar
   - Booking interface
   - Reviews section

4. **Search & Filtering**
   - Date range picker
   - Guest count selector
   - Property type filters
   - Price range slider
   - Barangay/municipality filter

5. **Booking System**
   - Date selection
   - Price calculation
   - Payment integration (GCash, PayPal, credit card)
   - Booking confirmation
   - Email notifications

## File Structure

```
project/
├── components/
│   ├── SiargaoMap.tsx          # Main interactive map component
│   ├── PropertyCard.tsx        # Individual property card (TBD)
│   ├── SearchBar.tsx           # Search and filter controls (TBD)
│   └── BookingForm.tsx         # Booking interface (TBD)
├── public/
│   └── SIARGAO_ISLAND_CLEANED.geojson  # Island boundary data
├── app/
│   ├── page.tsx                # Home page with map
│   ├── properties/
│   │   └── [id]/page.tsx       # Individual property page (TBD)
│   └── layout.tsx              # Root layout
└── lib/
    ├── supabase.ts             # Supabase client (TBD)
    └── types.ts                # TypeScript interfaces
```

## Data Models

### Property Interface (Current)
```typescript
interface Property {
  id: string
  property_name: string
  property_type: 'Villa' | 'Homestay' | 'Hotel' | 'Hostel' | 'Apartment'
  barangay: string              // Location within municipality
  latitude: number              // For map marker
  longitude: number             // For map marker
  max_guests: number
  bedrooms: number
  pricing: {
    base_price: number          // Per night rate
  }[]
  photos: {
    photo_url: string
    is_cover: boolean           // Main listing photo
  }[]
  reviews?: {
    overall_rating: number      // 1-5 stars
  }[]
}
```

### Planned Database Tables

#### properties
- id (uuid, primary key)
- property_name (text)
- property_type (enum: villa, homestay, hotel, hostel, apartment)
- description (text)
- municipality (text)
- barangay (text)
- latitude (decimal)
- longitude (decimal)
- max_guests (integer)
- bedrooms (integer)
- bathrooms (integer)
- amenities (jsonb) - WiFi, AC, Kitchen, Pool, etc.
- base_price (decimal)
- owner_id (uuid, foreign key to users)
- created_at (timestamp)
- updated_at (timestamp)

#### photos
- id (uuid, primary key)
- property_id (uuid, foreign key)
- photo_url (text)
- is_cover (boolean)
- display_order (integer)

#### reviews
- id (uuid, primary key)
- property_id (uuid, foreign key)
- user_id (uuid, foreign key)
- overall_rating (integer 1-5)
- cleanliness_rating (integer 1-5)
- location_rating (integer 1-5)
- value_rating (integer 1-5)
- comment (text)
- created_at (timestamp)

#### bookings
- id (uuid, primary key)
- property_id (uuid, foreign key)
- user_id (uuid, foreign key)
- check_in (date)
- check_out (date)
- guests (integer)
- total_price (decimal)
- status (enum: pending, confirmed, cancelled, completed)
- payment_status (enum: pending, paid, refunded)
- created_at (timestamp)

## Map Configuration

### Current Settings
```typescript
center: [9.80, 126.10]          // Siargao Island center
zoom: 11
minZoom: 10
maxZoom: 16
maxBounds: [
  [9.60, 125.90],               // Southwest corner
  [10.00, 126.30]               // Northeast corner
]
```

### GeoJSON Styling
```typescript
fillColor: 'yellow'
weight: 2
color: 'yellow'
fillOpacity: 0.3
// Hover: fillOpacity: 0.4, weight: 3
```

### Property Marker Colors
- Villa: Green gradient (#10b981 to #059669)
- Homestay: Blue gradient (#3b82f6 to #2563eb)
- Hotel: Amber/Orange gradient (#f59e0b to #d97706)
- Hostel: Purple gradient (#8b5cf6 to #7c3aed)
- Apartment: Pink gradient (#ec4899 to #db2777)

## Important Notes

### GeoJSON Issues Fixed
1. ✅ Removed mainland Mindanao municipalities
2. ✅ Removed other islands (Bukas Grande, etc.)
3. ✅ Deleted problematic General Luna polygon (extended lat 9.7564-9.8455)
4. ✅ Now shows only actual Siargao Island territory
5. ✅ Removed tooltips to prevent incorrect municipality labels

### Known Municipalities in Siargao
- Burgos (north)
- Dapa (west)
- Del Carmen (central-west, largest municipality)
- General Luna (southeast, main tourist area)
- Pilar (central)
- San Benito (northwest)
- San Isidro (north)
- Sapao (far north)

### Major Tourist Areas
- **General Luna** - Main tourist hub, Cloud 9 surf break
- **Cloud 9** - World-famous surf spot (lat 9.7917, lng 126.1583)
- **Pacifico** - Southern surf area (lat 9.7000, lng 126.1000)
- **Dapa** - Airport area, port town (lat 9.7533, lng 126.0500)

## Design Guidelines

### Color Scheme
- **Ocean Background**: Linear gradient #0ea5e9 to #06b6d4 (sky blue to cyan)
- **Island**: Yellow (#FFFF00) with 30% opacity
- **Primary Accent**: Teal/Cyan (#14b8a6, #06b6d4)
- **Secondary Accent**: Orange/Pink for pricing (#f59e0b, #ec4899)

### UI/UX Principles
- Island-first design (map is the main interface)
- Mobile-responsive
- Fast property discovery via map
- Clear pricing visibility
- Minimal clicks to booking

## Future Enhancements

### Phase 2
- [ ] Property owner dashboard
- [ ] Calendar sync (Airbnb, Booking.com)
- [ ] Multi-language support (English, Tagalog, Korean, Chinese)
- [ ] Currency converter
- [ ] Weather integration
- [ ] Surf forecast integration
- [ ] Activity recommendations
- [ ] Transportation booking

### Phase 3
- [ ] Mobile app (React Native)
- [ ] AI chatbot for recommendations
- [ ] Virtual tours (360° photos)
- [ ] Instant booking
- [ ] Host messaging
- [ ] Smart pricing based on demand

## Development Notes

### Current Temporary States
- Property markers are **currently disabled** in the map component (line ~95-110 has early return)
- Using static area labels instead of dynamic property markers
- Tooltips removed to fix municipality label issues

### Files to Update When Enabling Properties
1. `SiargaoMap.tsx` - Remove the early `return` statement in property marker section
2. Create Supabase client and fetch real property data
3. Test property marker rendering and popup functionality

### Critical Paths for Development
1. Set up Supabase project and tables first
2. Add sample property data for testing
3. Re-enable property markers on map
4. Build property detail pages
5. Implement search/filter
6. Build booking flow
7. Add payment processing

## Questions for Development

### To Decide
1. **Payment Gateway**: GCash primary? PayPal? Stripe?
2. **Property Verification**: How to verify property owners?
3. **Minimum Booking**: Nightly? Weekly only?
4. **Cancellation Policy**: Flexible? Moderate? Strict?
5. **Host Commission**: Percentage per booking?
6. **Currency**: PHP only or multi-currency?

### To Research
1. Philippine property rental regulations
2. Tax requirements for short-term rentals
3. Insurance requirements
4. Data privacy compliance (DPA)

## Contact & References

### Siargao Geography
- Total area: ~437 km²
- Population: ~200,000 (approx)
- Main airport: Sayak Airport (IAO) in Del Carmen
- Main port: Dapa port

### Development Resources
- Leaflet docs: https://leafletjs.com/
- Next.js docs: https://nextjs.org/docs
- Supabase docs: https://supabase.com/docs
- Tailwind docs: https://tailwindcss.com/docs

---

**Last Updated**: February 27, 2026
**Project Status**: Early Development / MVP Phase
**Current Focus**: GeoJSON cleanup, map component refinement, database schema design
