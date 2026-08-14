import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import bcrypt from 'bcryptjs'
import { signAdminToken } from '@/lib/auth'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
)

const LOCKOUT_ATTEMPTS = 3
const LOCKOUT_WINDOW_MS = 15 * 60 * 1000 // 15 minutes

export async function POST(req: NextRequest) {
  try {
    const ip = req.headers.get('x-forwarded-for') || req.headers.get('x-real-ip') || 'unknown'
    const { username, password } = await req.json()

    // Check lockout
    const windowStart = new Date(Date.now() - LOCKOUT_WINDOW_MS).toISOString()
    const { count } = await supabase
      .from('login_attempts')
      .select('id', { count: 'exact', head: true })
      .eq('ip_address', ip)
      .gte('attempted_at', windowStart)

    if ((count || 0) >= LOCKOUT_ATTEMPTS) {
      return NextResponse.json(
        { error: 'Too many failed attempts. Please try again in 15 minutes.' },
        { status: 429 }
      )
    }

    if (!username || !password) {
      return NextResponse.json({ error: 'Invalid credentials' }, { status: 401 })
    }

    // Look up admin user
    const { data: admin } = await supabase
      .from('admin_users')
      .select('username, password_hash')
      .eq('username', username)
      .single()

    const valid = admin && await bcrypt.compare(password, admin.password_hash)

    if (!valid) {
      // Record failed attempt
      await supabase.from('login_attempts').insert({ ip_address: ip })
      return NextResponse.json({ error: 'Invalid credentials' }, { status: 401 })
    }

    const token = signAdminToken(admin.username)
    const response = NextResponse.json({ success: true })
    response.cookies.set('admin_token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 60 * 60 * 8, // 8 hours
      path: '/admin',
    })

    return response
  } catch (err) {
    console.error('Admin login error:', err)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
