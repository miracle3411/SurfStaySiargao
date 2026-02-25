// app/page.tsx - Homepage with Interactive Map
'use client'

import { useState, useEffect } from 'react'
import dynamic from 'next/dynamic'
import { Search, MapPin, Home, Users, Star } from 'lucide-react'
import { supabase } from '@/lib/supabase'

// Import Map component dynamically (Leaflet needs window object)
const SiargaoMap = dynamic(() => import('@/components/SiargaoMap'), {
  ssr: false,
  loading: () => <div className="h-[600px] bg-gray-100 animate-pulse rounded-lg" />
})

interface Property {
  id: string
  property_name: string
  property_type: string
  barangay: string
  latitude: number
  longitude: number
  max_guests: number
  bedrooms: number
  pricing: {
    base_price: number
  }[]
  photos: {
    photo_url: string
    is_cover: boolean
  }[]
  _count?: {
    reviews: number
  }
  reviews?: {
    overall_rating: number
  }[]
}

export default function HomePage() {
  const [properties, setProperties] = useState<Property[]>([])
  const [loading, setLoading] = useState(true)
  const [viewMode, setViewMode] = useState<'grid' | 'map'>('grid')
  const [searchQuery, setSearchQuery] = useState('')
  const [filters, setFilters] = useState({
    priceMin: 0,
    priceMax: 20000,
    propertyType: 'all',
    guests: 1
  })

  useEffect(() => {
    fetchProperties()
  }, [])

  const fetchProperties = async () => {
    try {
      const { data, error } = await supabase
        .from('properties')
        .select(`
          id,
          property_name,
          property_type,
          barangay,
          latitude,
          longitude,
          max_guests,
          bedrooms,
          pricing:property_pricing(base_price),
          photos:property_photos(photo_url, is_cover),
          reviews(overall_rating)
        `)
        .eq('status', 'approved')
        .order('created_at', { ascending: false })

      if (error) throw error

      setProperties(data || [])
    } catch (error) {
      console.error('Error fetching properties:', error)
    } finally {
      setLoading(false)
    }
  }

  const filteredProperties = properties.filter(property => {
    const price = property.pricing?.[0]?.base_price || 0
    const matchesSearch = property.property_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         property.barangay.toLowerCase().includes(searchQuery.toLowerCase())
    const matchesPrice = price >= filters.priceMin && price <= filters.priceMax
    const matchesType = filters.propertyType === 'all' || property.property_type === filters.propertyType
    const matchesGuests = property.max_guests >= filters.guests

    return matchesSearch && matchesPrice && matchesType && matchesGuests
  })

  const getCoverPhoto = (property: Property) => {
    const cover = property.photos?.find(p => p.is_cover)
    return cover?.photo_url || property.photos?.[0]?.photo_url || '/placeholder.jpg'
  }

  const getAverageRating = (property: Property) => {
    if (!property.reviews || property.reviews.length === 0) return 0
    const sum = property.reviews.reduce((acc, r) => acc + r.overall_rating, 0)
    return (sum / property.reviews.length).toFixed(1)
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero Section */}
      <div className="relative bg-gradient-to-r from-blue-600 to-blue-800 text-white">
        <div className="absolute inset-0 bg-black/20" />
        <div className="relative max-w-7xl mx-auto px-4 py-20 sm:px-6 lg:px-8">
          <div className="text-center">
            <h1 className="text-4xl md:text-6xl font-bold mb-6">
              Find Your Perfect Stay in Siargao
            </h1>
            <p className="text-xl md:text-2xl mb-8 text-blue-100">
              Book directly with local hosts. Lowest fees. Instant confirmation.
            </p>

            {/* Search Bar */}
            <div className="max-w-4xl mx-auto bg-white rounded-lg shadow-xl p-6">
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Location or Property
                  </label>
                  <div className="relative">
                    <MapPin className="absolute left-3 top-3 h-5 w-5 text-gray-400" />
                    <input
                      type="text"
                      placeholder="General Luna, Cloud 9, Pacifico..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-900"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Guests
                  </label>
                  <div className="relative">
                    <Users className="absolute left-3 top-3 h-5 w-5 text-gray-400" />
                    <input
                      type="number"
                      min="1"
                      value={filters.guests}
                      onChange={(e) => setFilters({...filters, guests: parseInt(e.target.value)})}
                      className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-900"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Property Type
                  </label>
                  <select
                    value={filters.propertyType}
                    onChange={(e) => setFilters({...filters, propertyType: e.target.value})}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-900"
                  >
                    <option value="all">All Types</option>
                    <option value="Villa">Villa</option>
                    <option value="Homestay">Homestay</option>
                    <option value="Hotel">Hotel</option>
                    <option value="Hostel">Hostel</option>
                    <option value="Apartment">Apartment</option>
                  </select>
                </div>
              </div>

              {/* View Toggle */}
              <div className="mt-6 flex justify-center gap-4">
                <button
                  onClick={() => setViewMode('grid')}
                  className={`px-6 py-2 rounded-lg font-medium transition-colors ${
                    viewMode === 'grid'
                      ? 'bg-blue-600 text-white'
                      : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                  }`}
                >
                  Grid View
                </button>
                <button
                  onClick={() => setViewMode('map')}
                  className={`px-6 py-2 rounded-lg font-medium transition-colors ${
                    viewMode === 'map'
                      ? 'bg-blue-600 text-white'
                      : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                  }`}
                >
                  🗺️ Map View
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Stats Section */}
      <div className="bg-white border-b">
        <div className="max-w-7xl mx-auto px-4 py-12 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
            <div>
              <div className="text-3xl font-bold text-blue-600">{properties.length}</div>
              <div className="text-gray-600 mt-2">Properties</div>
            </div>
            <div>
              <div className="text-3xl font-bold text-blue-600">12%</div>
              <div className="text-gray-600 mt-2">Commission</div>
            </div>
            <div>
              <div className="text-3xl font-bold text-blue-600">24hrs</div>
              <div className="text-gray-600 mt-2">Payout Time</div>
            </div>
            <div>
              <div className="text-3xl font-bold text-blue-600">100%</div>
              <div className="text-gray-600 mt-2">Local</div>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 py-12 sm:px-6 lg:px-8">
        {loading ? (
          <div className="text-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
            <p className="mt-4 text-gray-600">Loading amazing properties...</p>
          </div>
        ) : (
          <>
            <div className="mb-6 flex justify-between items-center">
              <h2 className="text-2xl font-bold text-gray-900">
                {filteredProperties.length} Properties Available
              </h2>
            </div>

            {viewMode === 'map' ? (
              // Map View
              <div className="bg-white rounded-lg shadow-lg overflow-hidden">
                <SiargaoMap properties={filteredProperties} />
              </div>
            ) : (
              // Grid View
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredProperties.map((property) => (
                  <div key={property.id} className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-xl transition-shadow">
                    <div className="relative h-48">
                      <img
                        src={getCoverPhoto(property)}
                        alt={property.property_name}
                        className="w-full h-full object-cover"
                      />
                      <div className="absolute top-4 right-4 bg-white px-3 py-1 rounded-full text-sm font-semibold text-gray-900">
                        ₱{property.pricing?.[0]?.base_price || 0}/night
                      </div>
                    </div>
                    <div className="p-4">
                      <h3 className="text-lg font-semibold text-gray-900 mb-2">
                        {property.property_name}
                      </h3>
                      <div className="flex items-center text-sm text-gray-600 mb-2">
                        <MapPin className="h-4 w-4 mr-1" />
                        {property.barangay}
                      </div>
                      <div className="flex items-center text-sm text-gray-600 mb-4">
                        <Home className="h-4 w-4 mr-1" />
                        {property.bedrooms} bedrooms · {property.max_guests} guests
                      </div>
                      <div className="flex items-center justify-between">
                        <div className="flex items-center">
                          <Star className="h-4 w-4 text-yellow-400 fill-current" />
                          <span className="ml-1 text-sm font-medium">
                            {getAverageRating(property) || 'New'}
                          </span>
                          {property.reviews && property.reviews.length > 0 && (
                            <span className="ml-1 text-sm text-gray-500">
                              ({property.reviews.length})
                            </span>
                          )}
                        </div>
                        <button className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors">
                          View Details
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {filteredProperties.length === 0 && !loading && (
              <div className="text-center py-12">
                <p className="text-xl text-gray-600">No properties found matching your criteria.</p>
                <p className="text-gray-500 mt-2">Try adjusting your filters or search terms.</p>
              </div>
            )}
          </>
        )}
      </div>

      {/* Why SurfStay Section */}
      <div className="bg-blue-50 py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl font-bold text-center mb-12">Why Book with SurfStay Siargao?</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="text-center">
              <div className="bg-blue-600 text-white w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4 text-2xl font-bold">
                12%
              </div>
              <h3 className="text-xl font-semibold mb-2">Lowest Commission</h3>
              <p className="text-gray-600">
                Only 12% vs 15-25% on other platforms. Better prices for you!
              </p>
            </div>
            <div className="text-center">
              <div className="bg-blue-600 text-white w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4 text-2xl">
                ⚡
              </div>
              <h3 className="text-xl font-semibold mb-2">Instant Confirmation</h3>
              <p className="text-gray-600">
                Book now, confirmed in seconds. No waiting for host approval.
              </p>
            </div>
            <div className="text-center">
              <div className="bg-blue-600 text-white w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4 text-2xl">
                🏝️
              </div>
              <h3 className="text-xl font-semibold mb-2">Local Expertise</h3>
              <p className="text-gray-600">
                Curated by locals who know Siargao best. Authentic experiences.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}