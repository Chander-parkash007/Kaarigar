import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import { verifyAdminToken } from '@/lib/auth'
import { cookies } from 'next/headers'
import { BOOST_DURATION_DAYS, VERIFIED_DURATION_DAYS } from '@/lib/constants'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
)

async function logAction(adminUsername: string, actionType: string, description: string, workerId: string, workerName: string) {
  await supabase.from('activity_logs').insert({
    admin_username: adminUsername,
    action_type: actionType,
    action_description: description,
    worker_id: workerId,
    worker_name: workerName,
  })
}

export async function POST(req: NextRequest) {
  try {
    const cookieStore = await cookies()
    const token = cookieStore.get('admin_token')?.value
    if (!token) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const adminPayload = verifyAdminToken(token)
    if (!adminPayload) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const { workerId, workerName, action, paymentId } = await req.json()
    if (!workerId || !action) return NextResponse.json({ error: 'Missing required fields' }, { status: 400 })

    const now = new Date()

    switch (action) {
      case 'boost': {
        const expiry = new Date(now)
        expiry.setDate(expiry.getDate() + BOOST_DURATION_DAYS)
        await supabase.from('workers').update({
          tier: 'boosted',
          boost_expires_at: expiry.toISOString(),
          updated_at: now.toISOString(),
        }).eq('id', workerId)

        if (paymentId) {
          await supabase.from('payment_requests').update({
            status: 'approved',
            reviewed_at: now.toISOString(),
            reviewed_by: adminPayload.username,
          }).eq('id', paymentId)
        }

        await logAction(adminPayload.username, 'BOOST_APPLIED', `Applied 7-day Boost to ${workerName}`, workerId, workerName)
        break
      }

      case 'verify': {
        const expiry = new Date(now)
        expiry.setDate(expiry.getDate() + VERIFIED_DURATION_DAYS)
        await supabase.from('workers').update({
          tier: 'verified',
          verified_expires_at: expiry.toISOString(),
          updated_at: now.toISOString(),
        }).eq('id', workerId)

        if (paymentId) {
          await supabase.from('payment_requests').update({
            status: 'approved',
            reviewed_at: now.toISOString(),
            reviewed_by: adminPayload.username,
          }).eq('id', paymentId)
        }

        await logAction(adminPayload.username, 'VERIFIED_APPLIED', `Applied 30-day Verified Badge to ${workerName}`, workerId, workerName)
        break
      }

      case 'deactivate': {
        await supabase.from('workers').update({
          status: 'inactive',
          updated_at: now.toISOString(),
        }).eq('id', workerId)

        await logAction(adminPayload.username, 'DEACTIVATED', `Deactivated profile of ${workerName}`, workerId, workerName)
        break
      }

      case 'activate': {
        await supabase.from('workers').update({
          status: 'active',
          updated_at: now.toISOString(),
        }).eq('id', workerId)

        await logAction(adminPayload.username, 'ACTIVATED', `Reactivated profile of ${workerName}`, workerId, workerName)
        break
      }

      case 'reject_payment': {
        if (!paymentId) return NextResponse.json({ error: 'Payment ID required' }, { status: 400 })
        await supabase.from('payment_requests').update({
          status: 'rejected',
          reviewed_at: now.toISOString(),
          reviewed_by: adminPayload.username,
        }).eq('id', paymentId)

        await logAction(adminPayload.username, 'PAYMENT_REJECTED', `Rejected payment request from ${workerName}`, workerId, workerName)
        break
      }

      default:
        return NextResponse.json({ error: 'Unknown action' }, { status: 400 })
    }

    return NextResponse.json({ success: true })
  } catch (err) {
    console.error('Admin action error:', err)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
