// app/properties/[id]/page.tsx - Property Detail Page
'use client'

import { useState, useEffect } from 'react'
import { useParams, useRouter } from 'next/navigation'
import Link from 'next/link'
import { supabase } from '@/lib/supabase'
import {
  ArrowLeft, MapPin, Users, Bed, Bath, Star, ChevronLeft, ChevronRight,
  Wifi, Wind, UtensilsCrossed, Waves, Car, Dumbbell, Tv, Coffee,
  TreePalm, Bike, X
} from 'lucide-react'

interface PropertyDetail {
  id: string
  property_name: string
  property_type: string
  description: string
  municipality: string
  barangay: string
  latitude: number
  longitude: number
  max_guests: number
  bedrooms: number
  bathrooms: number
  amenities: string[]
  pricing: { base_price: number }[]
  photos: { photo_url: string; is_cover: boolean; display_order: number }[]
  reviews: { id: string; overall_rating: number; comment: string; created_at: string }[]
}

const amenityIcons: Record<string, React.ReactNode> = {
  'WiFi': <Wifi className="h-5 w-5" />,
  'AC': <Wind className="h-5 w-5" />,
  'Kitchen': <UtensilsCrossed className="h-5 w-5" />,
  'Shared Kitchen': <UtensilsCrossed className="h-5 w-5" />,
  'Pool': <Waves className="h-5 w-5" />,
  'Parking': <Car className="h-5 w-5" />,
  'Gym': <Dumbbell className="h-5 w-5" />,
  'TV': <Tv className="h-5 w-5" />,
  'Coffee': <Coffee className="h-5 w-5" />,
  'Garden': <TreePalm className="h-5 w-5" />,
  'Motorbike Rental': <Bike className="h-5 w-5" />,
  'Board Rental': <Waves className="h-5 w-5" />,
  'Surfboard Storage': <Waves className="h-5 w-5" />,
  'Kayak': <Waves className="h-5 w-5" />,
}

export default function PropertyDetailPage() {
  const params = useParams()
  const router = useRouter()
  const [property, setProperty] = useState<PropertyDetail | null>(null)
  const [loading, setLoading] = useState(true)
  const [currentPhoto, setCurrentPhoto] = useState(0)
  const [lightboxOpen, setLightboxOpen] = useState(false)
  const [checkIn, setCheckIn] = useState('')
  const [checkOut, setCheckOut] = useState('')
  const [guests, setGuests] = useState(1)
  const [guestName, setGuestName] = useState('')
  const [guestEmail, setGuestEmail] = useState('')
  const [booking, setBooking] = useState(false)
  const [bookingError, setBookingError] = useState('')

  useEffect(() => {
    if (params.id) {
      fetchProperty(params.id as string)
    }
  }, [params.id])

  const fetchProperty = async (id: string) => {
    try {
      const { data, error } = await supabase
        .from('properties')
        .select(`
          id, property_name, property_type, description, municipality, barangay,
          latitude, longitude, max_guests, bedrooms, bathrooms, amenities,
          pricing:property_pricing(base_price),
          photos:property_photos(photo_url, is_cover, display_order),
          reviews(id, overall_rating, comment, created_at)
        `)
        .eq('id', id)
        .single()

      if (error) throw error
      setProperty(data as PropertyDetail)
    } catch (error) {
      console.error('Error fetching property:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleBooking = async () => {
    if (!property) return
    setBookingError('')

    if (!checkIn || !checkOut) {
      setBookingError('Please select check-in and check-out dates')
      return
    }
    if (!guestName.trim()) {
      setBookingError('Please enter your name')
      return
    }
    if (!guestEmail.trim() || !guestEmail.includes('@')) {
      setBookingError('Please enter a valid email')
      return
    }

    const price = property.pricing?.[0]?.base_price || 0
    const nightCount = Math.max(1, Math.ceil((new Date(checkOut).getTime() - new Date(checkIn).getTime()) / (1000 * 60 * 60 * 24)))
    const totalPrice = Math.round(price * nightCount * 1.12)

    setBooking(true)
    try {
      // Step 1: Create booking
      const bookingRes = await fetch('/api/bookings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          property_id: property.id,
          check_in: checkIn,
          check_out: checkOut,
          guests,
          total_price: totalPrice,
          guest_name: guestName,
          guest_email: guestEmail,
        }),
      })

      const bookingData = await bookingRes.json()
      if (!bookingRes.ok) {
        setBookingError(bookingData.error || 'Failed to create booking')
        return
      }

      // Step 2: Create payment
      const paymentRes = await fetch('/api/payments', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ booking_id: bookingData.booking.id }),
      })

      const paymentData = await paymentRes.json()
      if (!paymentRes.ok) {
        // Booking created but payment failed — redirect to confirmation page
        router.push(`/bookings/${bookingData.booking.id}`)
        return
      }

      // Step 3: Redirect to Xendit payment page
      window.location.href = paymentData.invoice_url
    } catch (error) {
      console.error('Booking error:', error)
      setBookingError('Something went wrong. Please try again.')
    } finally {
      setBooking(false)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-cyan-50 via-white to-orange-50 flex items-center justify-center">
        <div className="text-center">
          <Waves className="animate-spin h-12 w-12 text-teal-500 mx-auto" />
          <p className="mt-4 text-gray-600">Loading property...</p>
        </div>
      </div>
    )
  }

  if (!property) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-cyan-50 via-white to-orange-50 flex items-center justify-center">
        <div className="text-center">
          <p className="text-2xl text-gray-700 font-semibold mb-4">Property not found</p>
          <Link href="/" className="text-teal-600 hover:text-teal-700 font-medium">
            Back to Home
          </Link>
        </div>
      </div>
    )
  }

  const price = property.pricing?.[0]?.base_price || 0
  const sortedPhotos = [...(property.photos || [])].sort((a, b) => {
    if (a.is_cover) return -1
    if (b.is_cover) return 1
    return a.display_order - b.display_order
  })
  const avgRating = property.reviews && property.reviews.length > 0
    ? (property.reviews.reduce((sum, r) => sum + r.overall_rating, 0) / property.reviews.length).toFixed(1)
    : null
  const nights = checkIn && checkOut
    ? Math.max(1, Math.ceil((new Date(checkOut).getTime() - new Date(checkIn).getTime()) / (1000 * 60 * 60 * 24)))
    : 0

  const typeColors: Record<string, string> = {
    'Villa': 'from-emerald-500 to-green-600',
    'Homestay': 'from-blue-500 to-blue-600',
    'Hotel': 'from-amber-500 to-orange-600',
    'Hostel': 'from-violet-500 to-purple-600',
    'Apartment': 'from-pink-500 to-rose-600',
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-cyan-50 via-white to-orange-50">
      {/* Back button */}
      <div className="max-w-7xl mx-auto px-4 pt-6 sm:px-6 lg:px-8">
        <button
          onClick={() => router.back()}
          className="inline-flex items-center gap-2 text-gray-600 hover:text-teal-600 transition-colors font-medium"
        >
          <ArrowLeft className="h-5 w-5" />
          Back
        </button>
      </div>

      {/* Photo Gallery */}
      <div className="max-w-7xl mx-auto px-4 pt-4 pb-8 sm:px-6 lg:px-8">
        <div className="relative rounded-2xl overflow-hidden shadow-xl">
          {sortedPhotos.length > 0 ? (
            <>
              <img
                src={sortedPhotos[currentPhoto]?.photo_url}
                alt={`${property.property_name} photo ${currentPhoto + 1}`}
                className="w-full h-[300px] sm:h-[400px] lg:h-[500px] object-cover cursor-pointer"
                onClick={() => setLightboxOpen(true)}
              />
              {/* Photo counter */}
              <div className="absolute bottom-4 right-4 bg-black/60 text-white px-3 py-1.5 rounded-full text-sm font-medium backdrop-blur-sm">
                {currentPhoto + 1} / {sortedPhotos.length}
              </div>
              {/* Navigation arrows */}
              {sortedPhotos.length > 1 && (
                <>
                  <button
                    onClick={() => setCurrentPhoto(prev => prev === 0 ? sortedPhotos.length - 1 : prev - 1)}
                    className="absolute left-3 top-1/2 -translate-y-1/2 bg-white/90 hover:bg-white p-2 rounded-full shadow-lg transition-all hover:scale-110"
                  >
                    <ChevronLeft className="h-5 w-5 text-gray-800" />
                  </button>
                  <button
                    onClick={() => setCurrentPhoto(prev => prev === sortedPhotos.length - 1 ? 0 : prev + 1)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 bg-white/90 hover:bg-white p-2 rounded-full shadow-lg transition-all hover:scale-110"
                  >
                    <ChevronRight className="h-5 w-5 text-gray-800" />
                  </button>
                </>
              )}
              {/* Type badge */}
              <div className={`absolute top-4 left-4 bg-gradient-to-r ${typeColors[property.property_type] || 'from-gray-500 to-gray-600'} text-white px-4 py-1.5 rounded-full text-sm font-bold shadow-lg`}>
                {property.property_type}
              </div>
            </>
          ) : (
            <div className="w-full h-[400px] bg-gray-200 flex items-center justify-center">
              <p className="text-gray-500">No photos available</p>
            </div>
          )}
        </div>

        {/* Photo thumbnails */}
        {sortedPhotos.length > 1 && (
          <div className="flex gap-2 mt-3 overflow-x-auto pb-2">
            {sortedPhotos.map((photo, i) => (
              <button
                key={i}
                onClick={() => setCurrentPhoto(i)}
                className={`flex-shrink-0 rounded-lg overflow-hidden border-2 transition-all ${
                  i === currentPhoto ? 'border-teal-500 shadow-lg scale-105' : 'border-transparent opacity-70 hover:opacity-100'
                }`}
              >
                <img src={photo.photo_url} alt="" className="w-20 h-14 object-cover" />
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 pb-16 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left Column - Property Details */}
          <div className="lg:col-span-2 space-y-8">
            {/* Title & Location */}
            <div>
              <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-3">
                {property.property_name}
              </h1>
              <div className="flex flex-wrap items-center gap-4 text-gray-600">
                <div className="flex items-center gap-1">
                  <MapPin className="h-5 w-5 text-teal-500" />
                  <span>{property.barangay}{property.municipality ? `, ${property.municipality}` : ''}</span>
                </div>
                {avgRating && (
                  <div className="flex items-center gap-1">
                    <Star className="h-5 w-5 text-yellow-400 fill-current" />
                    <span className="font-semibold text-gray-900">{avgRating}</span>
                    <span className="text-gray-500">({property.reviews.length} review{property.reviews.length !== 1 ? 's' : ''})</span>
                  </div>
                )}
              </div>
            </div>

            {/* Quick Stats */}
            <div className="flex flex-wrap gap-4">
              <div className="flex items-center gap-2 bg-white px-4 py-3 rounded-xl shadow-sm border border-gray-100">
                <Users className="h-5 w-5 text-teal-500" />
                <span className="text-gray-700 font-medium">{property.max_guests} guest{property.max_guests !== 1 ? 's' : ''}</span>
              </div>
              <div className="flex items-center gap-2 bg-white px-4 py-3 rounded-xl shadow-sm border border-gray-100">
                <Bed className="h-5 w-5 text-blue-500" />
                <span className="text-gray-700 font-medium">{property.bedrooms} bedroom{property.bedrooms !== 1 ? 's' : ''}</span>
              </div>
              {property.bathrooms && (
                <div className="flex items-center gap-2 bg-white px-4 py-3 rounded-xl shadow-sm border border-gray-100">
                  <Bath className="h-5 w-5 text-purple-500" />
                  <span className="text-gray-700 font-medium">{property.bathrooms} bathroom{property.bathrooms !== 1 ? 's' : ''}</span>
                </div>
              )}
            </div>

            {/* Description */}
            {property.description && (
              <div>
                <h2 className="text-xl font-bold text-gray-900 mb-3">About this place</h2>
                <p className="text-gray-600 leading-relaxed">{property.description}</p>
              </div>
            )}

            {/* Amenities */}
            {property.amenities && property.amenities.length > 0 && (
              <div>
                <h2 className="text-xl font-bold text-gray-900 mb-4">Amenities</h2>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                  {property.amenities.map((amenity) => (
                    <div key={amenity} className="flex items-center gap-3 bg-white px-4 py-3 rounded-xl border border-gray-100 shadow-sm">
                      <span className="text-teal-500">
                        {amenityIcons[amenity] || <Coffee className="h-5 w-5" />}
                      </span>
                      <span className="text-gray-700 text-sm font-medium">{amenity}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Reviews */}
            <div>
              <div className="flex items-center gap-3 mb-4">
                <h2 className="text-xl font-bold text-gray-900">Reviews</h2>
                {avgRating && (
                  <div className="flex items-center gap-1 bg-yellow-50 px-3 py-1 rounded-full border border-yellow-200">
                    <Star className="h-4 w-4 text-yellow-400 fill-current" />
                    <span className="text-sm font-bold text-gray-800">{avgRating}</span>
                  </div>
                )}
              </div>

              {property.reviews && property.reviews.length > 0 ? (
                <div className="space-y-4">
                  {property.reviews.map((review) => (
                    <div key={review.id} className="bg-white p-5 rounded-xl border border-gray-100 shadow-sm">
                      <div className="flex items-center gap-2 mb-3">
                        <div className="flex">
                          {[1, 2, 3, 4, 5].map((star) => (
                            <Star
                              key={star}
                              className={`h-4 w-4 ${star <= review.overall_rating ? 'text-yellow-400 fill-current' : 'text-gray-200'}`}
                            />
                          ))}
                        </div>
                        {review.created_at && (
                          <span className="text-xs text-gray-400">
                            {new Date(review.created_at).toLocaleDateString('en-US', { month: 'short', year: 'numeric' })}
                          </span>
                        )}
                      </div>
                      {review.comment && (
                        <p className="text-gray-600 text-sm leading-relaxed">{review.comment}</p>
                      )}
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-gray-500 bg-white p-5 rounded-xl border border-gray-100">No reviews yet. Be the first to review!</p>
              )}
            </div>
          </div>

          {/* Right Column - Booking Card */}
          <div className="lg:col-span-1">
            <div className="sticky top-24 bg-white rounded-2xl shadow-xl border-2 border-teal-100 p-6">
              {/* Price */}
              <div className="flex items-baseline gap-2 mb-6">
                <span className="text-3xl font-bold bg-gradient-to-r from-teal-600 to-cyan-600 bg-clip-text text-transparent">
                  ₱{price.toLocaleString()}
                </span>
                <span className="text-gray-500">/night</span>
              </div>

              {/* Date Inputs */}
              <div className="grid grid-cols-2 gap-3 mb-4">
                <div>
                  <label className="block text-xs font-semibold text-gray-600 mb-1.5 uppercase tracking-wide">Check-in</label>
                  <input
                    type="date"
                    value={checkIn}
                    onChange={(e) => setCheckIn(e.target.value)}
                    min={new Date().toISOString().split('T')[0]}
                    className="w-full px-3 py-2.5 border-2 border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-teal-500 focus:border-transparent text-gray-900"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-gray-600 mb-1.5 uppercase tracking-wide">Check-out</label>
                  <input
                    type="date"
                    value={checkOut}
                    onChange={(e) => setCheckOut(e.target.value)}
                    min={checkIn || new Date().toISOString().split('T')[0]}
                    className="w-full px-3 py-2.5 border-2 border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-teal-500 focus:border-transparent text-gray-900"
                  />
                </div>
              </div>

              {/* Guests */}
              <div className="mb-4">
                <label className="block text-xs font-semibold text-gray-600 mb-1.5 uppercase tracking-wide">Guests</label>
                <input
                  type="number"
                  min={1}
                  max={property.max_guests}
                  value={guests}
                  onChange={(e) => setGuests(parseInt(e.target.value) || 1)}
                  className="w-full px-3 py-2.5 border-2 border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-teal-500 focus:border-transparent text-gray-900"
                />
                <p className="text-xs text-gray-400 mt-1">{property.max_guests} guests maximum</p>
              </div>

              {/* Guest Info */}
              <div className="mb-4">
                <label className="block text-xs font-semibold text-gray-600 mb-1.5 uppercase tracking-wide">Your Name</label>
                <input
                  type="text"
                  value={guestName}
                  onChange={(e) => setGuestName(e.target.value)}
                  placeholder="Juan Dela Cruz"
                  className="w-full px-3 py-2.5 border-2 border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-teal-500 focus:border-transparent text-gray-900"
                />
              </div>
              <div className="mb-6">
                <label className="block text-xs font-semibold text-gray-600 mb-1.5 uppercase tracking-wide">Email</label>
                <input
                  type="email"
                  value={guestEmail}
                  onChange={(e) => setGuestEmail(e.target.value)}
                  placeholder="you@example.com"
                  className="w-full px-3 py-2.5 border-2 border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-teal-500 focus:border-transparent text-gray-900"
                />
              </div>

              {/* Price Breakdown */}
              {nights > 0 && (
                <div className="border-t border-gray-100 pt-4 mb-6 space-y-2">
                  <div className="flex justify-between text-sm text-gray-600">
                    <span>₱{price.toLocaleString()} x {nights} night{nights !== 1 ? 's' : ''}</span>
                    <span>₱{(price * nights).toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between text-sm text-gray-600">
                    <span>Service fee (12%)</span>
                    <span>₱{Math.round(price * nights * 0.12).toLocaleString()}</span>
                  </div>
                  <div className="border-t border-gray-200 pt-2 flex justify-between font-bold text-gray-900">
                    <span>Total</span>
                    <span>₱{Math.round(price * nights * 1.12).toLocaleString()}</span>
                  </div>
                </div>
              )}

              {/* Error Message */}
              {bookingError && (
                <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-xl text-sm text-red-700">
                  {bookingError}
                </div>
              )}

              {/* Book Button */}
              <button
                onClick={handleBooking}
                disabled={booking || nights === 0}
                className={`w-full py-3.5 rounded-xl font-bold shadow-lg text-lg transition-all ${
                  booking || nights === 0
                    ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                    : 'bg-gradient-to-r from-teal-500 to-cyan-500 text-white hover:from-teal-600 hover:to-cyan-600 transform hover:scale-[1.02]'
                }`}
              >
                {booking ? 'Processing...' : nights === 0 ? 'Select dates to book' : `Reserve Now — ₱${Math.round(price * nights * 1.12).toLocaleString()}`}
              </button>

              <p className="text-center text-xs text-gray-400 mt-3">You'll be redirected to secure payment</p>
            </div>
          </div>
        </div>
      </div>

      {/* Lightbox */}
      {lightboxOpen && sortedPhotos.length > 0 && (
        <div className="fixed inset-0 bg-black/90 z-50 flex items-center justify-center" onClick={() => setLightboxOpen(false)}>
          <button className="absolute top-4 right-4 text-white p-2 hover:bg-white/10 rounded-full transition-colors">
            <X className="h-6 w-6" />
          </button>
          <button
            onClick={(e) => { e.stopPropagation(); setCurrentPhoto(prev => prev === 0 ? sortedPhotos.length - 1 : prev - 1) }}
            className="absolute left-4 text-white p-2 hover:bg-white/10 rounded-full transition-colors"
          >
            <ChevronLeft className="h-8 w-8" />
          </button>
          <img
            src={sortedPhotos[currentPhoto]?.photo_url}
            alt=""
            className="max-h-[85vh] max-w-[90vw] object-contain"
            onClick={(e) => e.stopPropagation()}
          />
          <button
            onClick={(e) => { e.stopPropagation(); setCurrentPhoto(prev => prev === sortedPhotos.length - 1 ? 0 : prev + 1) }}
            className="absolute right-4 text-white p-2 hover:bg-white/10 rounded-full transition-colors"
          >
            <ChevronRight className="h-8 w-8" />
          </button>
          <div className="absolute bottom-6 text-white/70 text-sm">
            {currentPhoto + 1} / {sortedPhotos.length}
          </div>
        </div>
      )}
    </div>
  )
}
