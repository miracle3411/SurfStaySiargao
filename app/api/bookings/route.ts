import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { property_id, check_in, check_out, guests, guest_name, guest_email } = body

    // Validate required fields
    if (!property_id || !check_in || !check_out || !guests) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 })
    }

    // Require guest info
    if (!guest_name || !guest_name.trim()) {
      return NextResponse.json({ error: 'Guest name is required' }, { status: 400 })
    }
    if (!guest_email || !EMAIL_REGEX.test(guest_email)) {
      return NextResponse.json({ error: 'A valid email address is required' }, { status: 400 })
    }

    // Validate guests is a positive integer
    if (!Number.isInteger(guests) || guests < 1) {
      return NextResponse.json({ error: 'Guest count must be at least 1' }, { status: 400 })
    }

    // Validate dates
    const checkInDate = new Date(check_in)
    const checkOutDate = new Date(check_out)
    if (isNaN(checkInDate.getTime()) || isNaN(checkOutDate.getTime())) {
      return NextResponse.json({ error: 'Invalid date format' }, { status: 400 })
    }
    if (checkOutDate <= checkInDate) {
      return NextResponse.json({ error: 'Check-out must be after check-in' }, { status: 400 })
    }

    // Ensure check-in is not in the past
    const today = new Date()
    today.setHours(0, 0, 0, 0)
    if (checkInDate < today) {
      return NextResponse.json({ error: 'Check-in date cannot be in the past' }, { status: 400 })
    }

    // Check property exists and fetch pricing
    const { data: property, error: propertyError } = await supabase
      .from('properties')
      .select('id, property_name, max_guests, pricing:property_pricing(base_price)')
      .eq('id', property_id)
      .single()

    if (propertyError || !property) {
      return NextResponse.json({ error: 'Property not found' }, { status: 404 })
    }

    if (guests > property.max_guests) {
      return NextResponse.json({ error: `Maximum ${property.max_guests} guests allowed` }, { status: 400 })
    }

    // Calculate price server-side (ignore client-sent total_price)
    const pricing = property.pricing as { base_price: number }[]
    if (!pricing || pricing.length === 0) {
      return NextResponse.json({ error: 'Property pricing not available' }, { status: 400 })
    }
    const basePrice = pricing[0].base_price
    const nightCount = Math.ceil((checkOutDate.getTime() - checkInDate.getTime()) / (1000 * 60 * 60 * 24))
    const totalPrice = Math.round(basePrice * nightCount * 1.12) // 12% service fee

    // Check for overlapping bookings
    const { data: overlapping } = await supabase
      .from('bookings')
      .select('id')
      .eq('property_id', property_id)
      .in('status', ['pending', 'confirmed'])
      .lt('check_in', check_out)
      .gt('check_out', check_in)

    if (overlapping && overlapping.length > 0) {
      return NextResponse.json({ error: 'Property is not available for these dates' }, { status: 409 })
    }

    // Create booking with server-calculated price
    const { data: booking, error: bookingError } = await supabase
      .from('bookings')
      .insert({
        property_id,
        check_in,
        check_out,
        guests,
        total_price: totalPrice,
        guest_name: guest_name.trim(),
        guest_email: guest_email.trim().toLowerCase(),
        status: 'pending',
        payment_status: 'pending',
      })
      .select()
      .single()

    if (bookingError) {
      return NextResponse.json({ error: 'Failed to create booking' }, { status: 500 })
    }

    return NextResponse.json({ booking, property_name: property.property_name }, { status: 201 })
  } catch {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
