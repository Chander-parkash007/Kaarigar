import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
)

// Rate limit: max 3 bookings per phone per day
const bookingAttempts = new Map<string, { count: number; resetAt: number }>()

function isRateLimited(phone: string): boolean {
  const now = Date.now()
  const attempt = bookingAttempts.get(phone)
  if (!attempt || now > attempt.resetAt) {
    bookingAttempts.set(phone, { count: 1, resetAt: now + 24 * 60 * 60 * 1000 })
    return false
  }
  if (attempt.count >= 3) return true
  attempt.count++
  return false
}

export async function POST(req: NextRequest) {
  try {
    const { worker_id, customer_name, customer_phone, service_description, preferred_date } = await req.json()

    if (!worker_id || !customer_name?.trim() || !customer_phone?.trim() || !service_description?.trim()) {
      return NextResponse.json({ error: 'All fields are required' }, { status: 400 })
    }

    if (!/^03\d{9}$/.test(customer_phone)) {
      return NextResponse.json({ error: 'Enter a valid Pakistani phone number (03XXXXXXXXX)' }, { status: 400 })
    }

    if (isRateLimited(customer_phone)) {
      return NextResponse.json({ error: 'Too many requests. Please try again tomorrow.' }, { status: 429 })
    }

    // Verify worker exists and is active
    const { data: worker } = await supabase
      .from('workers')
      .select('id, full_name')
      .eq('id', worker_id)
      .eq('status', 'active')
      .single()

    if (!worker) {
      return NextResponse.json({ error: 'Worker not found' }, { status: 404 })
    }

    const { error } = await supabase.from('bookings').insert({
      worker_id,
      customer_name: customer_name.trim().substring(0, 100),
      customer_phone,
      service_description: service_description.trim().substring(0, 500),
      preferred_date: preferred_date?.trim() || null,
      status: 'pending',
    })

    if (error) {
      console.error('Booking insert error:', error)
      return NextResponse.json({ error: 'Failed to submit request' }, { status: 500 })
    }

    return NextResponse.json({ success: true, message: 'Booking request sent! The karigar will contact you soon.' })
  } catch (err) {
    console.error('Booking error:', err)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
