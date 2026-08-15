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
    const { phone, password } = await req.json()
    if (!phone || !password) return NextResponse.json({ error: 'Phone and password are required' }, { status: 400 })

    const { data: customer } = await supabase.from('customers').select('id, password_hash').eq('phone', phone).single()
    if (!customer) return NextResponse.json({ error: 'Invalid phone or password' }, { status: 401 })

    const valid = await bcrypt.compare(password, customer.password_hash)
    if (!valid) return NextResponse.json({ error: 'Invalid phone or password' }, { status: 401 })

    const token = signCustomerToken(customer.id)
    const response = NextResponse.json({ success: true })
    response.cookies.set('customer_token', token, {
      httpOnly: true, secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax', maxAge: 60 * 60 * 24 * 30, path: '/',
    })
    return response
  } catch (err) {
    console.error('Customer login error:', err)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
