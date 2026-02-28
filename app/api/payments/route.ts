import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { booking_id } = body

    if (!booking_id) {
      return NextResponse.json({ error: 'Missing booking_id' }, { status: 400 })
    }

    // Get booking details
    const { data: booking, error: bookingError } = await supabase
      .from('bookings')
      .select(`
        id, check_in, check_out, guests, total_price, guest_name, guest_email, status,
        properties:property_id(property_name, barangay)
      `)
      .eq('id', booking_id)
      .single()

    if (bookingError || !booking) {
      return NextResponse.json({ error: 'Booking not found' }, { status: 404 })
    }

    if (booking.status !== 'pending') {
      return NextResponse.json({ error: 'Booking is not in pending status' }, { status: 400 })
    }

    const property = booking.properties as any

    // Create Xendit invoice
    const xenditResponse = await fetch('https://api.xendit.co/v2/invoices', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Basic ${Buffer.from(process.env.XENDIT_SECRET_KEY + ':').toString('base64')}`,
      },
      body: JSON.stringify({
        external_id: `booking-${booking.id}`,
        amount: booking.total_price,
        currency: 'PHP',
        description: `SurfStay Siargao - ${property.property_name} (${booking.check_in} to ${booking.check_out})`,
        customer: {
          given_names: booking.guest_name || 'Guest',
          email: booking.guest_email || undefined,
        },
        success_redirect_url: `${process.env.NEXT_PUBLIC_APP_URL}/bookings/${booking.id}?status=success`,
        failure_redirect_url: `${process.env.NEXT_PUBLIC_APP_URL}/bookings/${booking.id}?status=failed`,
        invoice_duration: 3600, // 1 hour expiry
        payment_methods: ['GCASH', 'GRABPAY', 'PAYMAYA', 'CARD', 'BANK_TRANSFER'],
      }),
    })

    if (!xenditResponse.ok) {
      const errorData = await xenditResponse.json()
      console.error('Xendit error:', errorData)
      return NextResponse.json({ error: 'Failed to create payment' }, { status: 500 })
    }

    const invoice = await xenditResponse.json()

    // Update booking with payment reference
    await supabase
      .from('bookings')
      .update({ payment_reference: invoice.id })
      .eq('id', booking.id)

    return NextResponse.json({
      invoice_url: invoice.invoice_url,
      invoice_id: invoice.id,
    })
  } catch (error) {
    console.error('Payment API error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
