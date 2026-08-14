import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import bcrypt from 'bcryptjs'
import { signWorkerToken } from '@/lib/auth'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
)

export async function POST(req: NextRequest) {
  try {
    const { phone, password } = await req.json()

    if (!phone || !password) {
      return NextResponse.json({ error: 'Phone and password are required' }, { status: 400 })
    }

    const { data: worker, error } = await supabase
      .from('workers')
      .select('id, password_hash, status')
      .eq('phone', phone)
      .single()

    if (error || !worker) {
      return NextResponse.json({ error: 'Invalid phone or password' }, { status: 401 })
    }

    if (worker.status === 'inactive') {
      return NextResponse.json({ error: 'Your account has been deactivated. Please contact support.' }, { status: 403 })
    }

    const valid = await bcrypt.compare(password, worker.password_hash)
    if (!valid) {
      return NextResponse.json({ error: 'Invalid phone or password' }, { status: 401 })
    }

    const token = signWorkerToken(worker.id)
    const response = NextResponse.json({ success: true })
    response.cookies.set('worker_token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 60 * 60 * 24 * 7,
      path: '/',
    })

    return response
  } catch (err) {
    console.error('Login error:', err)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
