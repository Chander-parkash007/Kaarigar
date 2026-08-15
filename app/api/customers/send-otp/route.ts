import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import { verifyCustomerToken } from '@/lib/auth'
import { sendOTPEmail } from '@/lib/email'
import { cookies } from 'next/headers'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
)

// Rate limit: 1 OTP per 2 minutes per customer
const otpRateLimit = new Map<string, number>()

export async function POST(req: NextRequest) {
  try {
    const cookieStore = await cookies()
    const token = cookieStore.get('customer_token')?.value
    if (!token) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const payload = verifyCustomerToken(token)
    if (!payload) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    // Rate limit check
    const lastSent = otpRateLimit.get(payload.customerId)
    if (lastSent && Date.now() - lastSent < 2 * 60 * 1000) {
      const secondsLeft = Math.ceil((2 * 60 * 1000 - (Date.now() - lastSent)) / 1000)
      return NextResponse.json({ error: `Please wait ${secondsLeft} seconds before requesting another code.` }, { status: 429 })
    }

    const { email } = await req.json()
    if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      return NextResponse.json({ error: 'Please enter a valid email address' }, { status: 400 })
    }

    // Check email not already used by another customer
    const { data: existing } = await supabase
      .from('customers')
      .select('id')
      .eq('email', email.toLowerCase())
      .neq('id', payload.customerId)
      .single()

    if (existing) {
      return NextResponse.json({ error: 'This email is already used by another account' }, { status: 409 })
    }

    // Get customer name
    const { data: customer } = await supabase
      .from('customers')
      .select('full_name')
      .eq('id', payload.customerId)
      .single()

    // Generate 6-digit OTP
    const otp = Math.floor(100000 + Math.random() * 900000).toString()
    const expiresAt = new Date(Date.now() + 10 * 60 * 1000).toISOString() // 10 min

    // Save OTP to DB
    await supabase.from('customers').update({
      email: email.toLowerCase(),
      email_otp: otp,
      email_otp_expires_at: expiresAt,
    }).eq('id', payload.customerId)

    // Send email
    await sendOTPEmail(email, otp, customer?.full_name || 'User')

    // Record rate limit
    otpRateLimit.set(payload.customerId, Date.now())

    return NextResponse.json({ success: true, message: 'OTP sent to your email' })
  } catch (err) {
    console.error('Send OTP error:', err)
    return NextResponse.json({ error: 'Failed to send OTP. Please check your email and try again.' }, { status: 500 })
  }
}
