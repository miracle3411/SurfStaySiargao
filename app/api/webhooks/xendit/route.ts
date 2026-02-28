import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

// Xendit sends webhook notifications when invoice status changes
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { external_id, status, id: invoiceId } = body

    // external_id format: "booking-{uuid}"
    if (!external_id || !external_id.startsWith('booking-')) {
      return NextResponse.json({ error: 'Invalid external_id' }, { status: 400 })
    }

    const bookingId = external_id.replace('booking-', '')

    if (status === 'PAID' || status === 'SETTLED') {
      // Payment successful — confirm booking
      await supabase
        .from('bookings')
        .update({
          status: 'confirmed',
          payment_status: 'paid',
          payment_reference: invoiceId,
        })
        .eq('id', bookingId)

    } else if (status === 'EXPIRED' || status === 'FAILED') {
      // Payment failed — cancel booking
      await supabase
        .from('bookings')
        .update({
          status: 'cancelled',
          payment_status: 'pending',
        })
        .eq('id', bookingId)
    }

    return NextResponse.json({ received: true })
  } catch (error) {
    console.error('Xendit webhook error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
