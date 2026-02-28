// components/SiargaoMap.tsx - Using Official Siargao GeoJSON (TypeScript Fixed) 🏝️
'use client'

import { useEffect, useRef, useState } from 'react'
import L from 'leaflet'
import 'leaflet/dist/leaflet.css'
import { X, Star, Users, Home } from 'lucide-react'
import type { Property } from '@/lib/types'

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
        center: [9.845, 126.065],
        zoom: 11,
        minZoom: 10,
        maxZoom: 16,
        maxBounds: [
          [9.55, 125.80],
          [10.15, 126.40]
        ],
        maxBoundsViscosity: 0.7,
        attributionControl: false,
      })

      // Premium ocean + island styles injected into Leaflet
      const style = document.createElement('style')
      style.textContent = `
        /* === Deep Ocean Background === */
        .leaflet-container {
          background: linear-gradient(
            175deg,
            #0c1e3a 0%,
            #0f3460 25%,
            #1a5276 50%,
            #1a7a8a 75%,
            #148fa8 100%
          ) !important;
          font-family: Inter, sans-serif !important;
        }

        /* === Island Glow (applied to entire SVG overlay layer) === */
        .leaflet-overlay-pane svg {
          filter: drop-shadow(0 0 18px rgba(64, 145, 108, 0.55))
                  drop-shadow(0 0 6px rgba(45, 106, 79, 0.35));
        }

        /* === Custom Zoom Controls === */
        .leaflet-bar {
          border: none !important;
          box-shadow: 0 4px 24px rgba(0, 0, 0, 0.4) !important;
          border-radius: 14px !important;
          overflow: hidden !important;
          background: transparent !important;
        }
        .leaflet-bar a {
          background: rgba(15, 52, 96, 0.85) !important;
          backdrop-filter: blur(8px) !important;
          -webkit-backdrop-filter: blur(8px) !important;
          color: #7dd3fc !important;
          border-bottom: 1px solid rgba(255, 255, 255, 0.1) !important;
          width: 36px !important;
          height: 36px !important;
          line-height: 34px !important;
          font-size: 20px !important;
          font-weight: 300 !important;
          transition: background 0.2s ease, color 0.2s ease !important;
        }
        .leaflet-bar a:hover,
        .leaflet-bar a:focus {
          background: rgba(20, 184, 166, 0.85) !important;
          color: white !important;
        }
        .leaflet-bar a:first-child {
          border-radius: 14px 14px 0 0 !important;
        }
        .leaflet-bar a:last-child {
          border-radius: 0 0 14px 14px !important;
          border-bottom: none !important;
        }
        .leaflet-top.leaflet-left {
          top: auto !important;
          bottom: 60px !important;
          left: 16px !important;
        }

        /* === Area Label DivIcons — clear Leaflet defaults === */
        .area-label,
        .leaflet-div-icon.area-label {
          background: transparent !important;
          border: none !important;
          box-shadow: none !important;
        }

        /* === Property Marker DivIcons — clear Leaflet defaults === */
        .property-marker,
        .leaflet-div-icon.property-marker {
          background: transparent !important;
          border: none !important;
          box-shadow: none !important;
        }

        /* === Island tooltip (keep for potential re-enable) === */
        .island-tooltip {
          background: rgba(15, 52, 96, 0.9);
          color: #e0f7fa;
          border: 1px solid rgba(255, 255, 255, 0.2);
          border-radius: 8px;
          padding: 4px 10px;
          font-weight: 600;
          font-size: 11px;
          box-shadow: 0 4px 12px rgba(0, 0, 0, 0.3);
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

      // Island style — tropical forest green
      const siargaoStyle = (_feature: any) => ({
        fillColor: '#2d6a4f',
        weight: 1.5,
        opacity: 0.9,
        color: '#52b788',
        dashArray: '4, 2',
        fillOpacity: 0.72,
      })

      // Load GeoJSON and filter for Siargao only
      fetch('/SURIGAO_DEL_NORTE.geojson')
        .then(response => response.json())
        .then(data => {
          const siargaoFeatures = {
            type: 'FeatureCollection' as const,
            features: data.features.filter((feature: any) =>
              siargaoMunicipalities.includes(feature.properties.MUNICIPALI)
            )
          }

          // @ts-ignore - Leaflet GeoJSON accepts this format
          const geoJsonLayer = L.geoJSON(siargaoFeatures, {
            style: siargaoStyle,
            onEachFeature: (feature: any, layer: any) => {
              // Override tooltip labels for known offshore islands
              const islandNames: { [objectId: number]: string } = {
                1733: 'DAKU',
                1734: 'DAKU',
              }
              const objectId = feature.properties.OBJECTID
              const tooltipLabel = islandNames[objectId] ?? feature.properties.MUNICIPALI

              layer.on({
                mouseover: () => {
                  layer.setStyle({
                    fillColor: '#52b788',
                    fillOpacity: 0.85,
                    weight: 2.5,
                    color: '#74c69d',
                    dashArray: '',
                  })
                },
                mouseout: () => {
                  layer.setStyle(siargaoStyle(feature))
                },
              })

              layer.bindTooltip(tooltipLabel, {
                permanent: false,
                direction: 'center',
                className: 'island-tooltip'
              })
            },
          }).addTo(map)

          geoJsonLayerRef.current = geoJsonLayer

          // Bounds calculated but map stays fixed at the configured center
          geoJsonLayer.getBounds()

          // ---- Static Location Labels ----
          const createAreaLabel = (
            coords: [number, number],
            name: string,
            subtitle: string,
            style: 'town' | 'surf'
          ) => {
            const isTown = style === 'town'
            const html = isTown
              ? `<div style="
                    font-family: Inter, sans-serif;
                    background: rgba(12, 30, 58, 0.82);
                    backdrop-filter: blur(6px);
                    -webkit-backdrop-filter: blur(6px);
                    color: #e0f7fa;
                    padding: 5px 10px 5px 8px;
                    border-radius: 20px;
                    border: 1px solid rgba(255,255,255,0.22);
                    font-size: 11px;
                    font-weight: 700;
                    letter-spacing: 0.5px;
                    white-space: nowrap;
                    box-shadow: 0 2px 12px rgba(0,0,0,0.45);
                    display: flex;
                    align-items: center;
                    gap: 5px;
                    text-transform: uppercase;
                    pointer-events: none;
                  ">
                    <span style="font-size:10px;">📍</span>
                    ${name}
                    ${subtitle ? `<span style="font-weight:400; opacity:0.7; font-size:9px; text-transform:none; margin-left:2px;">${subtitle}</span>` : ''}
                  </div>`
              : `<div style="
                    font-family: Inter, sans-serif;
                    background: linear-gradient(135deg, rgba(234,88,12,0.88), rgba(219,39,119,0.88));
                    backdrop-filter: blur(6px);
                    -webkit-backdrop-filter: blur(6px);
                    color: white;
                    padding: 4px 10px;
                    border-radius: 20px;
                    border: 1px solid rgba(255,255,255,0.3);
                    font-size: 11px;
                    font-weight: 800;
                    white-space: nowrap;
                    box-shadow: 0 2px 12px rgba(234,88,12,0.4);
                    display: flex;
                    align-items: center;
                    gap: 5px;
                    pointer-events: none;
                  ">
                    🏄‍♂️ ${name}
                  </div>`

            return L.marker(coords, {
              icon: L.divIcon({
                className: 'area-label',
                html,
                iconSize: [0, 0],
                iconAnchor: [0, 0],
              }),
              interactive: false,
              zIndexOffset: -100,
            })
          }
        })
        .catch(error => {
          console.error('Error loading GeoJSON:', error)
          console.log('Make sure SURIGAO_DEL_NORTE.geojson is in your public folder!')
        })
    }

    // Clear old markers before adding new ones
    markersRef.current.forEach(marker => marker.remove())
    markersRef.current = []

    properties.forEach(property => {
      if (property.latitude && property.longitude) {
        const marker = createPropertyMarker(property)
        marker.addTo(mapRef.current!)
        markersRef.current.push(marker)
      }
    })

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
      {/* Gradient border wrapper — 3px padding reveals gradient as border */}
      <div
        style={{
          background: 'linear-gradient(135deg, #0ea5e9, #14b8a6, #10b981, #f59e0b)',
          borderRadius: '20px',
          padding: '3px',
          boxShadow: '0 20px 60px rgba(14, 165, 233, 0.3), 0 8px 24px rgba(0, 0, 0, 0.25)',
        }}
      >
        <div
          id="map"
          className="w-full"
          style={{
            height: '620px',
            borderRadius: '17px',
            overflow: 'hidden',
          }}
        />
      </div>

      {/* Vignette overlay for ocean depth — sits above map, below controls */}
      <div
        style={{
          position: 'absolute',
          inset: '3px',
          borderRadius: '17px',
          background: 'radial-gradient(ellipse at center, transparent 45%, rgba(0,0,0,0.32) 100%)',
          pointerEvents: 'none',
          zIndex: 500,
        }}
      />

      {/* Floating title bar — centered top */}
      <div
        style={{
          position: 'absolute',
          top: '20px',
          left: '50%',
          transform: 'translateX(-50%)',
          zIndex: 1000,
          background: 'rgba(12, 30, 58, 0.78)',
          backdropFilter: 'blur(10px)',
          WebkitBackdropFilter: 'blur(10px)',
          border: '1px solid rgba(255,255,255,0.18)',
          borderRadius: '30px',
          padding: '8px 22px',
          display: 'flex',
          alignItems: 'center',
          gap: '10px',
          boxShadow: '0 4px 20px rgba(0,0,0,0.35)',
          whiteSpace: 'nowrap',
          pointerEvents: 'none',
        }}
      >
        <span style={{ fontSize: '15px' }}>🏝️</span>
        <span style={{ color: '#e0f7fa', fontSize: '13px', fontWeight: 700, letterSpacing: '0.4px' }}>
          Siargao Island
        </span>
        <span style={{ width: '4px', height: '4px', borderRadius: '50%', background: '#14b8a6', display: 'inline-block' }} />
        <span style={{ color: '#94d2bd', fontSize: '11px', fontWeight: 500 }}>
          Philippines
        </span>
      </div>

      {/* Property detail popup */}
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
            <a href={`/properties/${selectedProperty.id}`} className="block w-full py-3 bg-gradient-to-r from-teal-500 to-cyan-500 text-white rounded-xl hover:from-teal-600 hover:to-cyan-600 transition-all font-bold shadow-lg transform hover:scale-105 text-center">
              View Details 🏄‍♂️
            </a>
          </div>
        </div>
      )}

      {/* Dark glassmorphism legend — top right */}
      <div style={{ position: 'absolute', top: '16px', right: '16px', zIndex: 1000 }}>
        <div
          style={{
            background: 'rgba(12, 30, 58, 0.82)',
            backdropFilter: 'blur(12px)',
            WebkitBackdropFilter: 'blur(12px)',
            border: '1px solid rgba(255,255,255,0.15)',
            borderRadius: '16px',
            padding: '14px 16px',
            boxShadow: '0 8px 32px rgba(0,0,0,0.4), inset 0 1px 0 rgba(255,255,255,0.08)',
            minWidth: '148px',
          }}
        >
          {/* Header */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '10px' }}>
            <span style={{ fontSize: '13px' }}>🏝️</span>
            <span style={{
              fontSize: '10px',
              fontWeight: 700,
              letterSpacing: '1.2px',
              textTransform: 'uppercase' as const,
              color: '#94d2bd',
            }}>
              Stay Types
            </span>
          </div>

          {/* Divider */}
          <div style={{
            height: '1px',
            background: 'linear-gradient(90deg, rgba(255,255,255,0.15), transparent)',
            marginBottom: '10px',
          }} />

          {/* Items */}
          {[
            { name: 'Villa',      color: '#10b981', glow: 'rgba(16,185,129,0.45)' },
            { name: 'Homestay',   color: '#3b82f6', glow: 'rgba(59,130,246,0.45)' },
            { name: 'Hotel',      color: '#f59e0b', glow: 'rgba(245,158,11,0.45)' },
            { name: 'Hostel',     color: '#8b5cf6', glow: 'rgba(139,92,246,0.45)' },
            { name: 'Apartment',  color: '#ec4899', glow: 'rgba(236,72,153,0.45)' },
          ].map((type, i) => (
            <div key={type.name} style={{
              display: 'flex',
              alignItems: 'center',
              gap: '10px',
              marginBottom: i < 4 ? '8px' : '0',
            }}>
              <div style={{
                width: '10px',
                height: '10px',
                borderRadius: '50%',
                background: type.color,
                boxShadow: `0 0 8px ${type.glow}`,
                flexShrink: 0,
              }} />
              <span style={{ fontSize: '12px', color: '#e0f7fa', fontWeight: 500 }}>
                {type.name}
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
