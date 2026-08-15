import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import { verifyAdminToken } from '@/lib/auth'
import { cookies } from 'next/headers'
import { BOOST_DURATION_DAYS, VERIFIED_DURATION_DAYS } from '@/lib/constants'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
)

export async function POST(req: NextRequest) {
  try {
    const cookieStore = await cookies()
    const token = cookieStore.get('admin_token')?.value
    if (!token) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const adminPayload = verifyAdminToken(token)
    if (!adminPayload) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const { workerIds, action } = await req.json()

    if (!workerIds?.length || !action) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 })
    }

    if (workerIds.length > 50) {
      return NextResponse.json({ error: 'Maximum 50 workers per bulk action' }, { status: 400 })
    }

    const now = new Date()

    switch (action) {
      case 'bulk_boost': {
        const expiry = new Date(now)
        expiry.setDate(expiry.getDate() + BOOST_DURATION_DAYS)
        await supabase.from('workers')
          .update({ tier: 'boosted', boost_expires_at: expiry.toISOString(), updated_at: now.toISOString() })
          .in('id', workerIds)
        await supabase.from('activity_logs').insert({
          admin_username: adminPayload.username,
          action_type: 'BULK_BOOST',
          action_description: `Bulk boost applied to ${workerIds.length} karigars`,
          worker_id: null,
          worker_name: `${workerIds.length} karigars`,
        })
        break
      }
      case 'bulk_verify': {
        const expiry = new Date(now)
        expiry.setDate(expiry.getDate() + VERIFIED_DURATION_DAYS)
        await supabase.from('workers')
          .update({ tier: 'verified', verified_expires_at: expiry.toISOString(), updated_at: now.toISOString() })
          .in('id', workerIds)
        await supabase.from('activity_logs').insert({
          admin_username: adminPayload.username,
          action_type: 'BULK_VERIFY',
          action_description: `Bulk verified badge applied to ${workerIds.length} karigars`,
          worker_id: null,
          worker_name: `${workerIds.length} karigars`,
        })
        break
      }
      case 'bulk_deactivate': {
        await supabase.from('workers')
          .update({ status: 'inactive', updated_at: now.toISOString() })
          .in('id', workerIds)
        await supabase.from('activity_logs').insert({
          admin_username: adminPayload.username,
          action_type: 'BULK_DEACTIVATED',
          action_description: `Bulk deactivated ${workerIds.length} karigars`,
          worker_id: null,
          worker_name: `${workerIds.length} karigars`,
        })
        break
      }
      case 'bulk_activate': {
        await supabase.from('workers')
          .update({ status: 'active', updated_at: now.toISOString() })
          .in('id', workerIds)
        await supabase.from('activity_logs').insert({
          admin_username: adminPayload.username,
          action_type: 'BULK_ACTIVATED',
          action_description: `Bulk activated ${workerIds.length} karigars`,
          worker_id: null,
          worker_name: `${workerIds.length} karigars`,
        })
        break
      }
      default:
        return NextResponse.json({ error: 'Unknown action' }, { status: 400 })
    }

    return NextResponse.json({ success: true, count: workerIds.length })
  } catch (err) {
    console.error('Bulk action error:', err)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
