import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import { verifyCustomerToken } from '@/lib/auth'
import { cookies } from 'next/headers'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
)

export async function POST(req: NextRequest) {
  try {
    const cookieStore = await cookies()
    const token = cookieStore.get('customer_token')?.value
    if (!token) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const payload = verifyCustomerToken(token)
    if (!payload) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const { otp } = await req.json()
    if (!otp || otp.length !== 6) {
      return NextResponse.json({ error: 'Please enter the 6-digit code' }, { status: 400 })
    }

    // Get customer OTP
    const { data: customer } = await supabase
      .from('customers')
      .select('email_otp, email_otp_expires_at, is_email_verified')
      .eq('id', payload.customerId)
      .single()

    if (!customer) return NextResponse.json({ error: 'Customer not found' }, { status: 404 })
    if (customer.is_email_verified) return NextResponse.json({ success: true, message: 'Already verified' })

    if (!customer.email_otp) {
      return NextResponse.json({ error: 'No OTP found. Please request a new code.' }, { status: 400 })
    }

    // Check expiry
    if (new Date(customer.email_otp_expires_at) < new Date()) {
      return NextResponse.json({ error: 'Code has expired. Please request a new one.' }, { status: 400 })
    }

    // Check OTP match
    if (customer.email_otp !== otp.trim()) {
      return NextResponse.json({ error: 'Incorrect code. Please try again.' }, { status: 400 })
    }

    // Mark as verified
    await supabase.from('customers').update({
      is_email_verified: true,
      email_otp: null,
      email_otp_expires_at: null,
    }).eq('id', payload.customerId)

    return NextResponse.json({ success: true, message: '✅ Email verified! You can now write reviews.' })
  } catch (err) {
    console.error('Verify OTP error:', err)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
