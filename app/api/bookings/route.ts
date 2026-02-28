import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { property_id, check_in, check_out, guests, total_price, guest_name, guest_email } = body

    // Validate required fields
    if (!property_id || !check_in || !check_out || !guests || !total_price) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 })
    }

    // Validate dates
    const checkInDate = new Date(check_in)
    const checkOutDate = new Date(check_out)
    if (checkOutDate <= checkInDate) {
      return NextResponse.json({ error: 'Check-out must be after check-in' }, { status: 400 })
    }

    // Check property exists
    const { data: property, error: propertyError } = await supabase
      .from('properties')
      .select('id, property_name, max_guests')
      .eq('id', property_id)
      .single()

    if (propertyError || !property) {
      return NextResponse.json({ error: 'Property not found' }, { status: 404 })
    }

    if (guests > property.max_guests) {
      return NextResponse.json({ error: `Maximum ${property.max_guests} guests allowed` }, { status: 400 })
    }

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

    // Create booking
    const { data: booking, error: bookingError } = await supabase
      .from('bookings')
      .insert({
        property_id,
        check_in,
        check_out,
        guests,
        total_price,
        guest_name: guest_name || null,
        guest_email: guest_email || null,
        status: 'pending',
        payment_status: 'pending',
      })
      .select()
      .single()

    if (bookingError) {
      console.error('Booking error:', bookingError)
      return NextResponse.json({ error: 'Failed to create booking' }, { status: 500 })
    }

    return NextResponse.json({ booking, property_name: property.property_name }, { status: 201 })
  } catch (error) {
    console.error('Booking API error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
