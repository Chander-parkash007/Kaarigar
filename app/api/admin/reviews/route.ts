import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import { verifyAdminToken } from '@/lib/auth'
import { cookies } from 'next/headers'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
)

export async function PATCH(req: NextRequest) {
  try {
    const cookieStore = await cookies()
    const token = cookieStore.get('admin_token')?.value
    if (!token || !verifyAdminToken(token)) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { reviewId, status } = await req.json()
    if (!reviewId || !['approved', 'rejected'].includes(status)) {
      return NextResponse.json({ error: 'Invalid request' }, { status: 400 })
    }

    const { error } = await supabase
      .from('reviews')
      .update({ status })
      .eq('id', reviewId)

    if (error) return NextResponse.json({ error: 'Update failed' }, { status: 500 })

    // If approved, recalculate worker rating
    if (status === 'approved') {
      const { data: review } = await supabase
        .from('reviews')
        .select('worker_id')
        .eq('id', reviewId)
        .single()

      if (review) {
        const { data: stats } = await supabase
          .from('reviews')
          .select('rating')
          .eq('worker_id', review.worker_id)
          .eq('status', 'approved')

        if (stats) {
          const avg = stats.reduce((s, r) => s + r.rating, 0) / stats.length
          await supabase.from('workers').update({
            average_rating: Math.round(avg * 10) / 10,
            review_count: stats.length,
          }).eq('id', review.worker_id)
        }
      }
    }

    return NextResponse.json({ success: true })
  } catch (err) {
    console.error('Review update error:', err)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
