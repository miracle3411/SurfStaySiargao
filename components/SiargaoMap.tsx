// components/SiargaoMap.tsx - Interactive Map Component (FIXED)
'use client'

import { useEffect, useRef, useState } from 'react'
import L from 'leaflet'
import 'leaflet/dist/leaflet.css'
import { X, Star, Users, Home } from 'lucide-react'

// Fix Leaflet default marker icon issue
delete (L.Icon.Default.prototype as any)._getIconUrl
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
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
  reviews?: {
    overall_rating: number
  }[]
}

interface SiargaoMapProps {
  properties: Property[]
}

export default function SiargaoMap({ properties }: SiargaoMapProps) {
  const mapRef = useRef<L.Map | null>(null)
  const markersRef = useRef<L.Marker[]>([])
  const [selectedProperty, setSelectedProperty] = useState<Property | null>(null)

  useEffect(() => {
    // Initialize map only once
    if (!mapRef.current) {
      // Siargao coordinates (General Luna area)
      const map = L.map('map').setView([9.7667, 126.1500], 12)

      // Add OpenStreetMap tile layer
      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '© OpenStreetMap contributors',
        maxZoom: 18,
      }).addTo(map)

      mapRef.current = map

      // Add Siargao boundary highlight (optional visual)
      const siargaoBounds = L.polygon([
        [9.9, 126.0],
        [9.9, 126.3],
        [9.6, 126.3],
        [9.6, 126.0]
      ], {
        color: '#3b82f6',
        weight: 2,
        fillOpacity: 0.05,
        fillColor: '#3b82f6'
      }).addTo(map)

      // Add labels for key areas
      const areas = [
        { name: 'General Luna', lat: 9.7667, lng: 126.1500 },
        { name: 'Cloud 9', lat: 9.7917, lng: 126.1583 },
        { name: 'Pacifico', lat: 9.7000, lng: 126.1000 },
        { name: 'Dapa', lat: 9.7533, lng: 126.0500 }
      ]

      areas.forEach(area => {
        L.marker([area.lat, area.lng], {
          icon: L.divIcon({
            className: 'area-label',
            html: `<div style="background: rgba(59, 130, 246, 0.9); color: white; padding: 4px 8px; border-radius: 4px; font-size: 12px; font-weight: 600; white-space: nowrap;">${area.name}</div>`,
            iconSize: [0, 0]
          })
        }).addTo(map)
      })
    }

    // Clear existing markers
    markersRef.current.forEach(marker => marker.remove())
    markersRef.current = []

    // Add property markers
    properties.forEach(property => {
      if (property.latitude && property.longitude) {
        const marker = createPropertyMarker(property)
        marker.addTo(mapRef.current!)
        markersRef.current.push(marker)
      }
    })

    // Fit map to show all properties
    if (properties.length > 0) {
      const bounds = properties
        .filter(p => p.latitude && p.longitude)
        .map(p => [p.latitude, p.longitude] as [number, number])
      
      if (bounds.length > 0) {
        mapRef.current?.fitBounds(bounds, { padding: [50, 50] })
      }
    }

    // Cleanup
    return () => {
      // Don't destroy the map, just clean up markers
      markersRef.current.forEach(marker => marker.remove())
      markersRef.current = []
    }
  }, [properties])

  const createPropertyMarker = (property: Property) => {
    const price = property.pricing?.[0]?.base_price || 0
    
    // Create custom marker icon based on property type
    const markerColor = getMarkerColor(property.property_type)
    
    const customIcon = L.divIcon({
      className: 'custom-marker',
      html: `
        <div style="position: relative;">
          <div style="
            background: ${markerColor};
            color: white;
            padding: 6px 10px;
            border-radius: 20px;
            font-weight: 600;
            font-size: 13px;
            box-shadow: 0 2px 8px rgba(0,0,0,0.3);
            white-space: nowrap;
            cursor: pointer;
            border: 2px solid white;
          ">
            ₱${price.toLocaleString()}
          </div>
          <div style="
            width: 0;
            height: 0;
            border-left: 8px solid transparent;
            border-right: 8px solid transparent;
            border-top: 8px solid ${markerColor};
            position: absolute;
            left: 50%;
            transform: translateX(-50%);
          "></div>
        </div>
      `,
      iconSize: [0, 0],
      iconAnchor: [40, 35]
    })

    const marker = L.marker([property.latitude, property.longitude], {
      icon: customIcon
    })

    // Click event to show property details
    marker.on('click', () => {
      setSelectedProperty(property)
    })

    // Hover effect - FIXED TYPE ERROR
    marker.on('mouseover', function(this: L.Marker) {
      const element = this.getElement()
      if (element) {
        element.style.transform = 'scale(1.1)'
        element.style.transition = 'transform 0.2s'
        element.style.zIndex = '1000'
      }
    })

    marker.on('mouseout', function(this: L.Marker) {
      const element = this.getElement()
      if (element) {
        element.style.transform = 'scale(1)'
        element.style.zIndex = '500'
      }
    })

    return marker
  }

  const getMarkerColor = (propertyType: string) => {
    const colors: { [key: string]: string } = {
      'Villa': '#10b981', // green
      'Homestay': '#3b82f6', // blue
      'Hotel': '#f59e0b', // amber
      'Hostel': '#8b5cf6', // purple
      'Apartment': '#ec4899', // pink
    }
    return colors[propertyType] || '#6b7280' // default gray
  }

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
    <div className="relative">
      {/* Map Container */}
      <div id="map" className="w-full h-[600px] rounded-lg" />

      {/* Property Detail Popup */}
      {selectedProperty && (
        <div className="absolute bottom-4 left-4 right-4 md:left-auto md:w-96 bg-white rounded-lg shadow-2xl z-[1000] overflow-hidden">
          <button
            onClick={() => setSelectedProperty(null)}
            className="absolute top-2 right-2 p-2 bg-white rounded-full shadow-md hover:bg-gray-100 z-10"
          >
            <X className="h-4 w-4" />
          </button>

          <div className="relative h-48">
            <img
              src={getCoverPhoto(selectedProperty)}
              alt={selectedProperty.property_name}
              className="w-full h-full object-cover"
            />
            <div className="absolute bottom-2 right-2 bg-white px-3 py-1 rounded-full text-sm font-semibold">
              ₱{selectedProperty.pricing?.[0]?.base_price.toLocaleString()}/night
            </div>
          </div>

          <div className="p-4">
            <h3 className="text-lg font-bold text-gray-900 mb-2">
              {selectedProperty.property_name}
            </h3>
            
            <div className="flex items-center text-sm text-gray-600 mb-2">
              <span className="mr-1">📍</span>
              {selectedProperty.barangay}
            </div>

            <div className="flex items-center text-sm text-gray-600 mb-3">
              <Home className="h-4 w-4 mr-1" />
              {selectedProperty.bedrooms} bedrooms
              <Users className="h-4 w-4 ml-3 mr-1" />
              {selectedProperty.max_guests} guests
            </div>

            {selectedProperty.reviews && selectedProperty.reviews.length > 0 && (
              <div className="flex items-center mb-4">
                <Star className="h-4 w-4 text-yellow-400 fill-current" />
                <span className="ml-1 text-sm font-medium">
                  {getAverageRating(selectedProperty)}
                </span>
                <span className="ml-1 text-sm text-gray-500">
                  ({selectedProperty.reviews.length} reviews)
                </span>
              </div>
            )}

            <button className="w-full py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium">
              View Full Details
            </button>
          </div>
        </div>
      )}

      {/* Legend */}
      <div className="absolute top-4 right-4 bg-white rounded-lg shadow-lg p-4 z-[1000]">
        <h4 className="text-sm font-semibold mb-3">Property Types</h4>
        <div className="space-y-2 text-xs">
          <div className="flex items-center">
            <div className="w-4 h-4 rounded-full bg-[#10b981] mr-2"></div>
            <span>Villa</span>
          </div>
          <div className="flex items-center">
            <div className="w-4 h-4 rounded-full bg-[#3b82f6] mr-2"></div>
            <span>Homestay</span>
          </div>
          <div className="flex items-center">
            <div className="w-4 h-4 rounded-full bg-[#f59e0b] mr-2"></div>
            <span>Hotel</span>
          </div>
          <div className="flex items-center">
            <div className="w-4 h-4 rounded-full bg-[#8b5cf6] mr-2"></div>
            <span>Hostel</span>
          </div>
          <div className="flex items-center">
            <div className="w-4 h-4 rounded-full bg-[#ec4899] mr-2"></div>
            <span>Apartment</span>
          </div>
        </div>
      </div>
    </div>
  )
}