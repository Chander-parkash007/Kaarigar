import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import { verifyCustomerToken } from '@/lib/auth'
import { cookies } from 'next/headers'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
)

async function getCustomer(req: NextRequest) {
  const cookieStore = await cookies()
  const token = cookieStore.get('customer_token')?.value
  if (!token) return null
  return verifyCustomerToken(token)
}

// GET — list saved karigars
export async function GET(req: NextRequest) {
  const payload = await getCustomer(req)
  if (!payload) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { data } = await supabase
    .from('saved_karigars')
    .select('worker_id, created_at, worker:workers(id, full_name, category, city, area, profile_photo_url, average_rating, review_count, tier, boost_expires_at, verified_expires_at, status)')
    .eq('customer_id', payload.customerId)
    .order('created_at', { ascending: false })

  return NextResponse.json({ saved: data || [] })
}

// POST — save a karigar
export async function POST(req: NextRequest) {
  const payload = await getCustomer(req)
  if (!payload) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { worker_id } = await req.json()
  if (!worker_id) return NextResponse.json({ error: 'Worker ID required' }, { status: 400 })

  const { error } = await supabase.from('saved_karigars').insert({
    customer_id: payload.customerId,
    worker_id,
  })

  if (error?.code === '23505') return NextResponse.json({ error: 'Already saved' }, { status: 409 })
  if (error) return NextResponse.json({ error: 'Failed to save' }, { status: 500 })

  return NextResponse.json({ success: true })
}

// DELETE — unsave a karigar
export async function DELETE(req: NextRequest) {
  const payload = await getCustomer(req)
  if (!payload) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { worker_id } = await req.json()
  if (!worker_id) return NextResponse.json({ error: 'Worker ID required' }, { status: 400 })

  await supabase.from('saved_karigars')
    .delete()
    .eq('customer_id', payload.customerId)
    .eq('worker_id', worker_id)

  return NextResponse.json({ success: true })
}
