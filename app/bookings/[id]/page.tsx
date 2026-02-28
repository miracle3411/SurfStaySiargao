// app/bookings/[id]/page.tsx - Booking Confirmation Page
'use client'

import { useState, useEffect } from 'react'
import { useParams, useSearchParams } from 'next/navigation'
import Link from 'next/link'
import { supabase } from '@/lib/supabase'
import { CheckCircle, XCircle, Clock, MapPin, CalendarDays, Users, Waves } from 'lucide-react'

interface BookingDetail {
  id: string
  check_in: string
  check_out: string
  guests: number
  total_price: number
  guest_name: string
  guest_email: string
  status: string
  payment_status: string
  created_at: string
  properties: {
    property_name: string
    property_type: string
    barangay: string
    photos: { photo_url: string; is_cover: boolean }[]
  }
}

export default function BookingConfirmationPage() {
  const params = useParams()
  const searchParams = useSearchParams()
  const paymentStatus = searchParams.get('status')
  const [booking, setBooking] = useState<BookingDetail | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (params.id) {
      fetchBooking(params.id as string)
    }
  }, [params.id])

  // If payment was successful, update booking status
  useEffect(() => {
    if (paymentStatus === 'success' && booking && booking.payment_status === 'pending') {
      updateBookingStatus(booking.id)
    }
  }, [paymentStatus, booking])

  const fetchBooking = async (id: string) => {
    try {
      const { data, error } = await supabase
        .from('bookings')
        .select(`
          id, check_in, check_out, guests, total_price, guest_name, guest_email,
          status, payment_status, created_at,
          properties:property_id(
            property_name, property_type, barangay,
            photos:property_photos(photo_url, is_cover)
          )
        `)
        .eq('id', id)
        .single()

      if (error) throw error
      setBooking(data as unknown as BookingDetail)
    } catch (error) {
      console.error('Error fetching booking:', error)
    } finally {
      setLoading(false)
    }
  }

  const updateBookingStatus = async (id: string) => {
    await supabase
      .from('bookings')
      .update({ status: 'confirmed', payment_status: 'paid' })
      .eq('id', id)

    setBooking(prev => prev ? { ...prev, status: 'confirmed', payment_status: 'paid' } : null)
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-cyan-50 via-white to-orange-50 flex items-center justify-center">
        <div className="text-center">
          <Waves className="animate-spin h-12 w-12 text-teal-500 mx-auto" />
          <p className="mt-4 text-gray-600">Loading booking...</p>
        </div>
      </div>
    )
  }

  if (!booking) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-cyan-50 via-white to-orange-50 flex items-center justify-center">
        <div className="text-center">
          <p className="text-2xl text-gray-700 font-semibold mb-4">Booking not found</p>
          <Link href="/" className="text-teal-600 hover:text-teal-700 font-medium">
            Back to Home
          </Link>
        </div>
      </div>
    )
  }

  const property = booking.properties as any
  const coverPhoto = property?.photos?.find((p: any) => p.is_cover)?.photo_url || property?.photos?.[0]?.photo_url
  const nights = Math.ceil((new Date(booking.check_out).getTime() - new Date(booking.check_in).getTime()) / (1000 * 60 * 60 * 24))

  const isSuccess = paymentStatus === 'success' || booking.payment_status === 'paid'
  const isFailed = paymentStatus === 'failed'
  const isPending = booking.payment_status === 'pending' && !isFailed

  return (
    <div className="min-h-screen bg-gradient-to-b from-cyan-50 via-white to-orange-50">
      <div className="max-w-2xl mx-auto px-4 py-16 sm:px-6">
        {/* Status Header */}
        <div className="text-center mb-8">
          {isSuccess ? (
            <>
              <CheckCircle className="h-20 w-20 text-green-500 mx-auto mb-4" />
              <h1 className="text-3xl font-bold text-gray-900 mb-2">Booking Confirmed!</h1>
              <p className="text-gray-600">Your island adventure awaits. Check your email for details.</p>
            </>
          ) : isFailed ? (
            <>
              <XCircle className="h-20 w-20 text-red-500 mx-auto mb-4" />
              <h1 className="text-3xl font-bold text-gray-900 mb-2">Payment Failed</h1>
              <p className="text-gray-600">Don't worry — your booking is saved. You can try paying again.</p>
            </>
          ) : (
            <>
              <Clock className="h-20 w-20 text-amber-500 mx-auto mb-4" />
              <h1 className="text-3xl font-bold text-gray-900 mb-2">Booking Pending</h1>
              <p className="text-gray-600">Complete your payment to confirm your reservation.</p>
            </>
          )}
        </div>

        {/* Booking Card */}
        <div className="bg-white rounded-2xl shadow-xl border-2 border-teal-100 overflow-hidden">
          {/* Property Photo */}
          {coverPhoto && (
            <img src={coverPhoto} alt={property?.property_name} className="w-full h-48 object-cover" />
          )}

          <div className="p-6">
            {/* Property Info */}
            <h2 className="text-xl font-bold text-gray-900 mb-1">{property?.property_name}</h2>
            <div className="flex items-center text-sm text-gray-500 mb-6">
              <MapPin className="h-4 w-4 mr-1 text-teal-500" />
              {property?.barangay}
            </div>

            {/* Booking Details */}
            <div className="grid grid-cols-2 gap-4 mb-6">
              <div className="bg-gray-50 rounded-xl p-4">
                <div className="flex items-center gap-2 text-xs font-semibold text-gray-500 uppercase mb-1">
                  <CalendarDays className="h-4 w-4" />
                  Check-in
                </div>
                <p className="text-gray-900 font-medium">
                  {new Date(booking.check_in).toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric', year: 'numeric' })}
                </p>
              </div>
              <div className="bg-gray-50 rounded-xl p-4">
                <div className="flex items-center gap-2 text-xs font-semibold text-gray-500 uppercase mb-1">
                  <CalendarDays className="h-4 w-4" />
                  Check-out
                </div>
                <p className="text-gray-900 font-medium">
                  {new Date(booking.check_out).toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric', year: 'numeric' })}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-6 mb-6 text-sm text-gray-600">
              <div className="flex items-center gap-1">
                <Users className="h-4 w-4 text-teal-500" />
                {booking.guests} guest{booking.guests !== 1 ? 's' : ''}
              </div>
              <div>{nights} night{nights !== 1 ? 's' : ''}</div>
            </div>

            {/* Guest Info */}
            <div className="border-t border-gray-100 pt-4 mb-4">
              <p className="text-sm text-gray-500">Guest: <span className="text-gray-900 font-medium">{booking.guest_name}</span></p>
              <p className="text-sm text-gray-500">Email: <span className="text-gray-900 font-medium">{booking.guest_email}</span></p>
            </div>

            {/* Price */}
            <div className="border-t border-gray-100 pt-4 flex justify-between items-center">
              <span className="text-gray-700 font-semibold">Total Paid</span>
              <span className="text-2xl font-bold bg-gradient-to-r from-teal-600 to-cyan-600 bg-clip-text text-transparent">
                ₱{booking.total_price.toLocaleString()}
              </span>
            </div>

            {/* Status Badge */}
            <div className="mt-4 flex justify-center">
              <span className={`px-4 py-1.5 rounded-full text-sm font-semibold ${
                isSuccess
                  ? 'bg-green-50 text-green-700 border border-green-200'
                  : isFailed
                  ? 'bg-red-50 text-red-700 border border-red-200'
                  : 'bg-amber-50 text-amber-700 border border-amber-200'
              }`}>
                {isSuccess ? 'Confirmed & Paid' : isFailed ? 'Payment Failed' : 'Awaiting Payment'}
              </span>
            </div>
          </div>
        </div>

        {/* Actions */}
        <div className="mt-8 flex flex-col sm:flex-row gap-4 justify-center">
          {(isPending || isFailed) && (
            <button
              onClick={async () => {
                const res = await fetch('/api/payments', {
                  method: 'POST',
                  headers: { 'Content-Type': 'application/json' },
                  body: JSON.stringify({ booking_id: booking.id }),
                })
                const data = await res.json()
                if (data.invoice_url) {
                  window.location.href = data.invoice_url
                }
              }}
              className="px-8 py-3 bg-gradient-to-r from-teal-500 to-cyan-500 text-white rounded-xl hover:from-teal-600 hover:to-cyan-600 transition-all font-bold shadow-lg"
            >
              {isFailed ? 'Try Payment Again' : 'Pay Now'}
            </button>
          )}
          <Link
            href="/"
            className="px-8 py-3 bg-white text-gray-700 rounded-xl border-2 border-gray-200 hover:border-teal-300 transition-all font-semibold text-center"
          >
            Back to Home
          </Link>
        </div>

        {/* Booking Reference */}
        <p className="text-center text-xs text-gray-400 mt-6">
          Booking reference: {booking.id}
        </p>
      </div>
    </div>
  )
}
