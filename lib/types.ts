export interface Property {
  id: string
  property_name: string
  property_type: 'Villa' | 'Homestay' | 'Hotel' | 'Hostel' | 'Apartment'
  description?: string
  municipality?: string
  barangay: string
  latitude: number
  longitude: number
  max_guests: number
  bedrooms: number
  bathrooms?: number
  amenities?: string[]
  status?: 'pending' | 'approved' | 'rejected'
  owner_id?: string
  created_at?: string
  updated_at?: string
  pricing: {
    base_price: number
  }[]
  photos: {
    photo_url: string
    is_cover: boolean
  }[]
  reviews?: {
    overall_rating: number
  }[]
}

export interface Booking {
  id: string
  property_id: string
  user_id?: string
  check_in: string
  check_out: string
  guests: number
  total_price: number
  status: 'pending' | 'confirmed' | 'cancelled' | 'completed'
  payment_status: 'pending' | 'paid' | 'refunded'
  created_at?: string
}

export interface Review {
  id: string
  property_id: string
  user_id?: string
  overall_rating: number
  comment?: string
  created_at?: string
}
