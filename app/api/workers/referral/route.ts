import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import { verifyWorkerToken } from '@/lib/auth'
import { cookies } from 'next/headers'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
)

export async function POST(req: NextRequest) {
  try {
    const cookieStore = await cookies()
    const token = cookieStore.get('worker_token')?.value
    if (!token) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const payload = verifyWorkerToken(token)
    if (!payload) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const { referred_phone } = await req.json()

    if (!referred_phone || !/^03\d{9}$/.test(referred_phone)) {
      return NextResponse.json({ error: 'Enter a valid Pakistani phone number (03XXXXXXXXX)' }, { status: 400 })
    }

    // Can't refer yourself
    const { data: self } = await supabase
      .from('workers')
      .select('phone')
      .eq('id', payload.workerId)
      .single()

    if (self?.phone === referred_phone) {
      return NextResponse.json({ error: "You can't refer yourself!" }, { status: 400 })
    }

    // Check if already referred
    const { data: existing } = await supabase
      .from('referrals')
      .select('id')
      .eq('referrer_id', payload.workerId)
      .eq('referred_phone', referred_phone)
      .single()

    if (existing) {
      return NextResponse.json({ error: 'You already referred this number.' }, { status: 409 })
    }

    // Check if that phone is already registered
    const { data: alreadyRegistered } = await supabase
      .from('workers')
      .select('id')
      .eq('phone', referred_phone)
      .single()

    if (alreadyRegistered) {
      return NextResponse.json({ error: 'This karigar is already registered on KaariGar.' }, { status: 409 })
    }

    await supabase.from('referrals').insert({
      referrer_id: payload.workerId,
      referred_phone,
      bonus_days: 7,
      status: 'pending',
    })

    return NextResponse.json({
      success: true,
      message: 'Referral saved! When they register using this phone, you both get 7 extra days boost.',
    })
  } catch (err) {
    console.error('Referral error:', err)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
