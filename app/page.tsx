// app/page.tsx - Siargao Vibes Homepage 🏄‍♂️
'use client'

import { useState, useEffect } from 'react'
import dynamic from 'next/dynamic'
import { Search, MapPin, Home, Users, Star, Waves } from 'lucide-react'
import { supabase } from '@/lib/supabase'

// Import Map component dynamically
const SiargaoMap = dynamic(() => import('@/components/SiargaoMap'), {
  ssr: false,
  loading: () => <div className="h-[600px] bg-gradient-to-br from-cyan-50 to-teal-50 animate-pulse rounded-lg" />
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
    <div className="min-h-screen bg-gradient-to-b from-cyan-50 via-white to-orange-50">
      {/* Hero Section - Tropical Sunset Gradient */}
      <div className="relative overflow-hidden bg-gradient-to-br from-teal-400 via-cyan-500 to-blue-500">
        {/* Tropical Pattern Overlay */}
        <div className="absolute inset-0 opacity-10">
          <div className="absolute inset-0" style={{
            backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath d='M30 0l30 30-30 30L0 30z' fill='%23ffffff' fill-opacity='1'/%3E%3C/svg%3E")`,
            backgroundSize: '30px 30px'
          }}></div>
        </div>

        {/* Animated Waves at Bottom */}
        <div className="absolute bottom-0 left-0 right-0">
          <svg className="w-full h-24" viewBox="0 0 1200 120" preserveAspectRatio="none">
            <path d="M0,50 C150,80 350,0 600,50 C850,100 1050,20 1200,50 L1200,120 L0,120 Z" 
                  fill="white" fillOpacity="0.3">
              <animate attributeName="d" 
                       dur="10s" 
                       repeatCount="indefinite"
                       values="M0,50 C150,80 350,0 600,50 C850,100 1050,20 1200,50 L1200,120 L0,120 Z;
                               M0,50 C150,20 350,100 600,50 C850,0 1050,80 1200,50 L1200,120 L0,120 Z;
                               M0,50 C150,80 350,0 600,50 C850,100 1050,20 1200,50 L1200,120 L0,120 Z"/>
            </path>
          </svg>
        </div>

        <div className="relative max-w-7xl mx-auto px-4 py-20 sm:px-6 lg:px-8">
          <div className="text-center">
            {/* Surf Icon */}
            <div className="inline-flex items-center justify-center mb-6">
              <Waves className="h-16 w-16 text-white animate-bounce" />
            </div>

            <h1 className="text-4xl md:text-6xl font-bold mb-6 text-white drop-shadow-lg">
              Find Your Island Paradise in Siargao
            </h1>
            <p className="text-xl md:text-2xl mb-8 text-cyan-50">
              🏄‍♂️ Surf. Relax. Explore. Book local. Pay less. Live aloha. 🌴
            </p>

            {/* Search Bar - Tropical White Card */}
            <div className="max-w-4xl mx-auto bg-white/95 backdrop-blur-sm rounded-2xl shadow-2xl p-6 border-4 border-white">
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    🏝️ Where to?
                  </label>
                  <div className="relative">
                    <MapPin className="absolute left-3 top-3 h-5 w-5 text-teal-500" />
                    <input
                      type="text"
                      placeholder="Cloud 9, General Luna, Pacifico..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="w-full pl-10 pr-4 py-3 border-2 border-teal-200 rounded-xl focus:ring-2 focus:ring-teal-500 focus:border-transparent text-gray-900 hover:border-teal-300 transition-colors"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    👥 Crew Size
                  </label>
                  <div className="relative">
                    <Users className="absolute left-3 top-3 h-5 w-5 text-orange-500" />
                    <input
                      type="number"
                      min="1"
                      value={filters.guests}
                      onChange={(e) => setFilters({...filters, guests: parseInt(e.target.value)})}
                      className="w-full pl-10 pr-4 py-3 border-2 border-orange-200 rounded-xl focus:ring-2 focus:ring-orange-500 focus:border-transparent text-gray-900 hover:border-orange-300 transition-colors"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    🏠 Vibe
                  </label>
                  <select
                    value={filters.propertyType}
                    onChange={(e) => setFilters({...filters, propertyType: e.target.value})}
                    className="w-full px-4 py-3 border-2 border-cyan-200 rounded-xl focus:ring-2 focus:ring-cyan-500 focus:border-transparent text-gray-900 hover:border-cyan-300 transition-colors"
                  >
                    <option value="all">All Vibes</option>
                    <option value="Villa">🏡 Villa</option>
                    <option value="Homestay">🏠 Homestay</option>
                    <option value="Hotel">🏨 Hotel</option>
                    <option value="Hostel">🛏️ Hostel</option>
                    <option value="Apartment">🏢 Apartment</option>
                  </select>
                </div>
              </div>

              {/* View Toggle - Tropical Buttons */}
              <div className="mt-6 flex justify-center gap-4">
                <button
                  onClick={() => setViewMode('grid')}
                  className={`px-8 py-3 rounded-xl font-semibold transition-all transform hover:scale-105 ${
                    viewMode === 'grid'
                      ? 'bg-gradient-to-r from-teal-500 to-cyan-500 text-white shadow-lg'
                      : 'bg-white text-gray-700 border-2 border-gray-200 hover:border-teal-300'
                  }`}
                >
                  🏠 Grid View
                </button>
                <button
                  onClick={() => setViewMode('map')}
                  className={`px-8 py-3 rounded-xl font-semibold transition-all transform hover:scale-105 ${
                    viewMode === 'map'
                      ? 'bg-gradient-to-r from-orange-500 to-pink-500 text-white shadow-lg'
                      : 'bg-white text-gray-700 border-2 border-gray-200 hover:border-orange-300'
                  }`}
                >
                  🗺️ Map View
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Stats Section - Beach Sand Colors */}
      <div className="bg-gradient-to-r from-amber-50 to-orange-50 border-y-4 border-orange-200">
        <div className="max-w-7xl mx-auto px-4 py-12 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
            <div className="transform hover:scale-110 transition-transform">
              <div className="text-4xl font-bold bg-gradient-to-r from-teal-600 to-cyan-600 bg-clip-text text-transparent">
                {properties.length}
              </div>
              <div className="text-gray-700 mt-2 font-medium">🏝️ Island Stays</div>
            </div>
            <div className="transform hover:scale-110 transition-transform">
              <div className="text-4xl font-bold bg-gradient-to-r from-orange-600 to-pink-600 bg-clip-text text-transparent">
                12%
              </div>
              <div className="text-gray-700 mt-2 font-medium">💰 Commission</div>
            </div>
            <div className="transform hover:scale-110 transition-transform">
              <div className="text-4xl font-bold bg-gradient-to-r from-teal-600 to-cyan-600 bg-clip-text text-transparent">
                24hrs
              </div>
              <div className="text-gray-700 mt-2 font-medium">⚡ Payout</div>
            </div>
            <div className="transform hover:scale-110 transition-transform">
              <div className="text-4xl font-bold bg-gradient-to-r from-orange-600 to-pink-600 bg-clip-text text-transparent">
                100%
              </div>
              <div className="text-gray-700 mt-2 font-medium">🌴 Local Love</div>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 py-12 sm:px-6 lg:px-8">
        {loading ? (
          <div className="text-center py-12">
            <Waves className="animate-spin h-12 w-12 text-teal-500 mx-auto" />
            <p className="mt-4 text-gray-600">Loading paradise properties...</p>
          </div>
        ) : (
          <>
            <div className="mb-6 flex justify-between items-center">
              <h2 className="text-3xl font-bold bg-gradient-to-r from-teal-600 to-cyan-600 bg-clip-text text-transparent">
                {filteredProperties.length} Island Vibes Available
              </h2>
            </div>

            {viewMode === 'map' ? (
              // Map View
              <div className="bg-white rounded-2xl shadow-xl overflow-hidden border-4 border-teal-100">
                <SiargaoMap properties={filteredProperties} />
              </div>
            ) : (
              // Grid View - Tropical Cards
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredProperties.map((property) => (
                  <div 
                    key={property.id} 
                    className="group bg-white rounded-2xl shadow-lg overflow-hidden hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-2 border-2 border-transparent hover:border-teal-300"
                  >
                    <div className="relative h-56 overflow-hidden">
                      <img
                        src={getCoverPhoto(property)}
                        alt={property.property_name}
                        className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                      />
                      <div className="absolute top-4 right-4 bg-gradient-to-r from-orange-500 to-pink-500 text-white px-4 py-2 rounded-full text-sm font-bold shadow-lg">
                        ₱{property.pricing?.[0]?.base_price || 0}/night
                      </div>
                      {/* Tropical Badge */}
                      <div className="absolute top-4 left-4 bg-gradient-to-r from-teal-500 to-cyan-500 text-white px-3 py-1 rounded-full text-xs font-semibold">
                        🌴 {property.property_type}
                      </div>
                    </div>
                    <div className="p-5">
                      <h3 className="text-xl font-bold text-gray-900 mb-2 line-clamp-1">
                        {property.property_name}
                      </h3>
                      <div className="flex items-center text-sm text-gray-600 mb-2">
                        <MapPin className="h-4 w-4 mr-1 text-teal-500" />
                        {property.barangay}
                      </div>
                      <div className="flex items-center text-sm text-gray-600 mb-4">
                        <Home className="h-4 w-4 mr-1 text-orange-500" />
                        {property.bedrooms} bed · {property.max_guests} guests
                      </div>
                      <div className="flex items-center justify-between">
                        <div className="flex items-center">
                          <Star className="h-5 w-5 text-yellow-400 fill-current" />
                          <span className="ml-1 text-sm font-semibold text-gray-900">
                            {getAverageRating(property) || 'New'}
                          </span>
                          {property.reviews && property.reviews.length > 0 && (
                            <span className="ml-1 text-sm text-gray-500">
                              ({property.reviews.length})
                            </span>
                          )}
                        </div>
                        <button className="px-5 py-2 bg-gradient-to-r from-teal-500 to-cyan-500 text-white rounded-xl hover:from-teal-600 hover:to-cyan-600 transition-all font-semibold shadow-md hover:shadow-lg transform hover:scale-105">
                          Book Now 🏄‍♂️
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {filteredProperties.length === 0 && !loading && (
              <div className="text-center py-16 bg-gradient-to-br from-cyan-50 to-teal-50 rounded-2xl">
                <Waves className="h-16 w-16 text-teal-400 mx-auto mb-4" />
                <p className="text-2xl text-gray-700 font-semibold">No properties found, bro! 🤙</p>
                <p className="text-gray-500 mt-2">Try adjusting your filters or search.</p>
              </div>
            )}
          </>
        )}
      </div>

      {/* Why SurfStay Section - Sunset Vibes */}
      <div className="bg-gradient-to-r from-orange-100 via-pink-100 to-purple-100 py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-4xl font-bold text-center mb-4 bg-gradient-to-r from-orange-600 to-pink-600 bg-clip-text text-transparent">
            Why Ride with SurfStay? 🏄‍♂️
          </h2>
          <p className="text-center text-gray-600 mb-12 text-lg">Island vibes, local prices, good karma ✌️</p>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="text-center transform hover:scale-105 transition-transform">
              <div className="bg-gradient-to-br from-teal-400 to-cyan-500 text-white w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-4 text-3xl font-bold shadow-xl">
                12%
              </div>
              <h3 className="text-xl font-bold mb-2 text-gray-900">🤙 Lowest Commission</h3>
              <p className="text-gray-600">
                Only 12% vs 15-25% on corporate platforms. More pesos for locals!
              </p>
            </div>
            <div className="text-center transform hover:scale-105 transition-transform">
              <div className="bg-gradient-to-br from-orange-400 to-pink-500 text-white w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-4 text-4xl shadow-xl">
                ⚡
              </div>
              <h3 className="text-xl font-bold mb-2 text-gray-900">⚡ Instant Stoke</h3>
              <p className="text-gray-600">
                Book now, confirmed in seconds. Catch the next wave, not emails!
              </p>
            </div>
            <div className="text-center transform hover:scale-105 transition-transform">
              <div className="bg-gradient-to-br from-green-400 to-teal-500 text-white w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-4 text-4xl shadow-xl">
                🌴
              </div>
              <h3 className="text-xl font-bold mb-2 text-gray-900">🌴 Pure Siargao</h3>
              <p className="text-gray-600">
                Made by locals, for explorers. Authentic island experiences, no corporate BS.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}