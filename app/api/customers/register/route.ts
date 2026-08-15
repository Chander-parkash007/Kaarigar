import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import bcrypt from 'bcryptjs'
import { signCustomerToken } from '@/lib/auth'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
)

export async function POST(req: NextRequest) {
  try {
    const { full_name, phone, password } = await req.json()

    if (!full_name?.trim() || !phone?.trim() || !password) {
      return NextResponse.json({ error: 'All fields are required' }, { status: 400 })
    }
    if (!/^03\d{9}$/.test(phone)) {
      return NextResponse.json({ error: 'Enter a valid Pakistani phone number' }, { status: 400 })
    }
    if (password.length < 6) {
      return NextResponse.json({ error: 'Password must be at least 6 characters' }, { status: 400 })
    }

    const { data: existing } = await supabase.from('customers').select('id').eq('phone', phone).single()
    if (existing) return NextResponse.json({ error: 'This phone number is already registered' }, { status: 409 })

    const password_hash = await bcrypt.hash(password, 10)
    const { data: customer, error } = await supabase
      .from('customers').insert({ full_name: full_name.trim(), phone, password_hash }).select('id').single()

    if (error || !customer) return NextResponse.json({ error: 'Registration failed' }, { status: 500 })

    const token = signCustomerToken(customer.id)
    const response = NextResponse.json({ success: true })
    response.cookies.set('customer_token', token, {
      httpOnly: true, secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax', maxAge: 60 * 60 * 24 * 30, path: '/',
    })
    return response
  } catch (err) {
    console.error('Customer register error:', err)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
