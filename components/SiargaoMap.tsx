// components/SiargaoMap.tsx - Using Official Siargao GeoJSON (TypeScript Fixed) 🏝️
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
  const geoJsonLayerRef = useRef<L.GeoJSON | null>(null)
  const markersRef = useRef<L.Marker[]>([])
  const [selectedProperty, setSelectedProperty] = useState<Property | null>(null)

  useEffect(() => {
    if (!mapRef.current) {
      // Initialize map centered on Siargao
      const map = L.map('map', {
        center: [9.80, 126.10],
        zoom: 11,
        minZoom: 10,
        maxZoom: 16,
        maxBounds: [
          [9.60, 125.90],
          [10.00, 126.30]
        ],
        maxBoundsViscosity: 0.7,
      })

      // Ocean blue background
      const style = document.createElement('style')
      style.textContent = `
        .leaflet-container {
          background: linear-gradient(180deg, #0ea5e9 0%, #06b6d4 100%) !important;
        }
        .island-tooltip {
          background: rgba(20, 184, 166, 0.95);
          color: white;
          border: 2px solid white;
          border-radius: 8px;
          padding: 4px 8px;
          font-weight: 600;
          font-size: 11px;
        }
      `
      document.head.appendChild(style)

      mapRef.current = map

      // Siargao island municipalities
      const siargaoMunicipalities = [
        'DAPA', 'DEL CARMEN', 'GENERAL LUNA', 
        'PILAR', 'SAN BENITO', 'SAN ISIDRO', 
        'SOCORRO', 'BURGOS', 'SANTA MONICA'
      ]

      // Load GeoJSON and filter for Siargao only
      fetch('/SURIGAO_DEL_NORTE.geojson')
        .then(response => response.json())
        .then(data => {
          // Filter features to only include Siargao municipalities
          const siargaoFeatures = {
            type: 'FeatureCollection' as const,
            features: data.features.filter((feature: any) =>
              siargaoMunicipalities.includes(feature.properties.MUNICIPALI)
            )
          }

          // Style for Siargao municipalities
          const siargaoStyle = (feature: any) => {
            return {
              fillColor: 'yellow',
              weight: 2,
              color: 'yellow',
            }
          }

          // Add GeoJSON layer for Siargao
          // @ts-ignore - Leaflet GeoJSON accepts this format
          const geoJsonLayer = L.geoJSON(siargaoFeatures, {
            style: siargaoStyle,
            onEachFeature: (feature: any, layer: any) => {
              const municipalityName = feature.properties.MUNICIPALI

              // Hover effects
              layer.on({
                mouseover: () => {
                  layer.setStyle({
                    fillOpacity: 0.4,
                    weight: 3,
                  })
                },
                mouseout: () => {
                  layer.setStyle(siargaoStyle(feature))
                },
              })

              // Tooltip with municipality name
              layer.bindTooltip(municipalityName, {
                permanent: false,
                direction: 'center',
                className: 'island-tooltip'
              })
            },
          }).addTo(map)

          geoJsonLayerRef.current = geoJsonLayer

          // Fit map to Siargao bounds
          const bounds = geoJsonLayer.getBounds()
          map.fitBounds(bounds, { padding: [50, 50] })
        })
        .catch(error => {
          console.error('Error loading GeoJSON:', error)
          console.log('Make sure SURIGAO_DEL_NORTE.geojson is in your public folder!')
        })


    }

    // Clear and add property markers
    // markersRef.current.forEach(marker => marker.remove())
    // markersRef.current = []

    // properties.forEach(property => {
    //   if (property.latitude && property.longitude) {
    //     const marker = createPropertyMarker(property)
    //     marker.addTo(mapRef.current!)
    //     markersRef.current.push(marker)
    //   }
    // })

    return () => {
      markersRef.current.forEach(marker => marker.remove())
      markersRef.current = []
    }
  }, [properties])

  const createPropertyMarker = (property: Property) => {
    const price = property.pricing?.[0]?.base_price || 0
    const markerColor = getMarkerColor(property.property_type)
    
    const customIcon = L.divIcon({
      className: 'property-marker',
      html: `
        <div style="position: relative;">
          <div style="
            background: ${markerColor};
            color: white;
            padding: 8px 14px;
            border-radius: 25px;
            font-weight: 700;
            font-size: 13px;
            box-shadow: 0 4px 15px rgba(0,0,0,0.3);
            white-space: nowrap;
            cursor: pointer;
            border: 3px solid white;
            transition: all 0.2s;
          ">
            ₱${price.toLocaleString()}
          </div>
          <div style="
            width: 0;
            height: 0;
            border-left: 10px solid transparent;
            border-right: 10px solid transparent;
            border-top: 10px solid white;
            position: absolute;
            left: 50%;
            transform: translateX(-50%);
          "></div>
        </div>
      `,
      iconSize: [0, 0],
      iconAnchor: [45, 40]
    })

    const marker = L.marker([property.latitude, property.longitude], {
      icon: customIcon
    })

    marker.on('click', () => setSelectedProperty(property))
    marker.on('mouseover', function(this: L.Marker) {
      const element = this.getElement()
      if (element) {
        element.style.transform = 'scale(1.15)'
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
      'Villa': 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
      'Homestay': 'linear-gradient(135deg, #3b82f6 0%, #2563eb 100%)',
      'Hotel': 'linear-gradient(135deg, #f59e0b 0%, #d97706 100%)',
      'Hostel': 'linear-gradient(135deg, #8b5cf6 0%, #7c3aed 100%)',
      'Apartment': 'linear-gradient(135deg, #ec4899 0%, #db2777 100%)',
    }
    return colors[propertyType] || 'linear-gradient(135deg, #6b7280 0%, #4b5563 100%)'
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
      <div id="map" className="w-full h-[600px] rounded-2xl border-4 border-teal-200 shadow-2xl" />

      {selectedProperty && (
        <div className="absolute bottom-4 left-4 right-4 md:left-auto md:w-96 bg-white rounded-2xl shadow-2xl z-[1000] overflow-hidden border-4 border-teal-300">
          <button onClick={() => setSelectedProperty(null)} className="absolute top-2 right-2 p-2 bg-white rounded-full shadow-lg hover:bg-gray-100 z-10 transition-transform hover:scale-110">
            <X className="h-4 w-4" />
          </button>
          <div className="relative h-48">
            <img src={getCoverPhoto(selectedProperty)} alt={selectedProperty.property_name} className="w-full h-full object-cover" />
            <div className="absolute bottom-2 right-2 bg-gradient-to-r from-orange-500 to-pink-500 text-white px-4 py-2 rounded-full text-sm font-bold shadow-lg">
              ₱{selectedProperty.pricing?.[0]?.base_price.toLocaleString()}/night
            </div>
          </div>
          <div className="p-5">
            <h3 className="text-lg font-bold text-gray-900 mb-2">{selectedProperty.property_name}</h3>
            <div className="flex items-center text-sm text-gray-600 mb-2">
              <span className="mr-1">📍</span>
              {selectedProperty.barangay}
            </div>
            <div className="flex items-center text-sm text-gray-600 mb-3">
              <Home className="h-4 w-4 mr-1 text-teal-500" />
              {selectedProperty.bedrooms} bedrooms
              <Users className="h-4 w-4 ml-3 mr-1 text-orange-500" />
              {selectedProperty.max_guests} guests
            </div>
            {selectedProperty.reviews && selectedProperty.reviews.length > 0 && (
              <div className="flex items-center mb-4">
                <Star className="h-4 w-4 text-yellow-400 fill-current" />
                <span className="ml-1 text-sm font-medium">{getAverageRating(selectedProperty)}</span>
                <span className="ml-1 text-sm text-gray-500">({selectedProperty.reviews.length} reviews)</span>
              </div>
            )}
            <button className="w-full py-3 bg-gradient-to-r from-teal-500 to-cyan-500 text-white rounded-xl hover:from-teal-600 hover:to-cyan-600 transition-all font-bold shadow-lg transform hover:scale-105">
              Book Now 🏄‍♂️
            </button>
          </div>
        </div>
      )}

      <div className="absolute top-4 right-4 bg-white/95 backdrop-blur-sm rounded-2xl shadow-xl p-4 z-[1000] border-2 border-teal-200">
        <h4 className="text-sm font-bold mb-3 text-gray-900">🏝️ Property Types</h4>
        <div className="space-y-2 text-xs">
          {[
            { name: 'Villa', color: 'from-green-400 to-green-600' },
            { name: 'Homestay', color: 'from-blue-400 to-blue-600' },
            { name: 'Hotel', color: 'from-amber-400 to-orange-600' },
            { name: 'Hostel', color: 'from-purple-400 to-purple-600' },
            { name: 'Apartment', color: 'from-pink-400 to-pink-600' }
          ].map(type => (
            <div key={type.name} className="flex items-center">
              <div className={`w-5 h-5 rounded-full bg-gradient-to-br ${type.color} mr-2 border-2 border-white shadow-md`}></div>
              <span className="font-medium">{type.name}</span>
            </div>
          ))}
        </div>
      </div>

      <div className="absolute bottom-4 right-4 bg-gradient-to-r from-teal-500 to-cyan-500 text-white px-5 py-2 rounded-full text-xs font-bold shadow-2xl z-[999] border-2 border-white">
        🏄‍♂️ Siargao Island
      </div>
    </div>
  )
}