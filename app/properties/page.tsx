// app/properties/page.tsx - All Properties Listing
'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { supabase } from '@/lib/supabase'
import type { Property } from '@/lib/types'
import { MapPin, Home, Users, Star, Waves, Search } from 'lucide-react'

export default function PropertiesPage() {
  const [properties, setProperties] = useState<Property[]>([])
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState('')
  const [propertyType, setPropertyType] = useState('all')

  useEffect(() => {
    fetchProperties()
  }, [])

  const fetchProperties = async () => {
    try {
      const { data, error } = await supabase
        .from('properties')
        .select(`
          id, property_name, property_type, barangay, latitude, longitude, max_guests, bedrooms,
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

  const filtered = properties.filter(p => {
    const matchesSearch = p.property_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         p.barangay.toLowerCase().includes(searchQuery.toLowerCase())
    const matchesType = propertyType === 'all' || p.property_type === propertyType
    return matchesSearch && matchesType
  })

  const getCoverPhoto = (p: Property) => {
    const cover = p.photos?.find(ph => ph.is_cover)
    return cover?.photo_url || p.photos?.[0]?.photo_url || '/placeholder.jpg'
  }

  const getAvgRating = (p: Property) => {
    if (!p.reviews || p.reviews.length === 0) return null
    return (p.reviews.reduce((s, r) => s + r.overall_rating, 0) / p.reviews.length).toFixed(1)
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-cyan-50 via-white to-orange-50">
      {/* Header */}
      <div className="bg-gradient-to-r from-teal-500 to-cyan-600 py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h1 className="text-3xl md:text-4xl font-bold text-white mb-2">All Properties</h1>
          <p className="text-cyan-100">Browse all available stays across Siargao Island</p>

          {/* Search & Filter */}
          <div className="mt-6 flex flex-col sm:flex-row gap-3">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-3 h-5 w-5 text-gray-400" />
              <input
                type="text"
                placeholder="Search properties..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-3 rounded-xl border-2 border-white/30 bg-white/95 text-gray-900 focus:ring-2 focus:ring-white focus:border-transparent"
              />
            </div>
            <select
              value={propertyType}
              onChange={(e) => setPropertyType(e.target.value)}
              className="px-4 py-3 rounded-xl border-2 border-white/30 bg-white/95 text-gray-900 focus:ring-2 focus:ring-white focus:border-transparent"
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
      </div>

      {/* Properties Grid */}
      <div className="max-w-7xl mx-auto px-4 py-12 sm:px-6 lg:px-8">
        {loading ? (
          <div className="text-center py-12">
            <Waves className="animate-spin h-12 w-12 text-teal-500 mx-auto" />
            <p className="mt-4 text-gray-600">Loading properties...</p>
          </div>
        ) : (
          <>
            <p className="text-sm text-gray-500 mb-6">{filtered.length} properties found</p>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filtered.map((property) => (
                <Link
                  href={`/properties/${property.id}`}
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
                    <div className="absolute top-4 left-4 bg-gradient-to-r from-teal-500 to-cyan-500 text-white px-3 py-1 rounded-full text-xs font-semibold">
                      {property.property_type}
                    </div>
                  </div>
                  <div className="p-5">
                    <h3 className="text-xl font-bold text-gray-900 mb-2 line-clamp-1">{property.property_name}</h3>
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
                          {getAvgRating(property) || 'New'}
                        </span>
                        {property.reviews && property.reviews.length > 0 && (
                          <span className="ml-1 text-sm text-gray-500">({property.reviews.length})</span>
                        )}
                      </div>
                      <span className="px-5 py-2 bg-gradient-to-r from-teal-500 to-cyan-500 text-white rounded-xl font-semibold text-sm">
                        View Details
                      </span>
                    </div>
                  </div>
                </Link>
              ))}
            </div>

            {filtered.length === 0 && (
              <div className="text-center py-16 bg-gradient-to-br from-cyan-50 to-teal-50 rounded-2xl">
                <Waves className="h-16 w-16 text-teal-400 mx-auto mb-4" />
                <p className="text-2xl text-gray-700 font-semibold">No properties found</p>
                <p className="text-gray-500 mt-2">Try adjusting your search or filters.</p>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  )
}
