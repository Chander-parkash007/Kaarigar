import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import { verifyCustomerToken } from '@/lib/auth'
import { cookies } from 'next/headers'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
)

export async function POST(req: NextRequest) {
  try {
    // Must be a logged-in customer
    const cookieStore = await cookies()
    const token = cookieStore.get('customer_token')?.value
    if (!token) {
      return NextResponse.json({ error: 'Please login to write a review' }, { status: 401 })
    }

    const payload = verifyCustomerToken(token)
    if (!payload) {
      return NextResponse.json({ error: 'Invalid session. Please login again.' }, { status: 401 })
    }

    // Check customer is email-verified
    const { data: customer } = await supabase
      .from('customers')
      .select('id, full_name, is_email_verified')
      .eq('id', payload.customerId)
      .single()

    if (!customer) {
      return NextResponse.json({ error: 'Customer not found' }, { status: 404 })
    }

    if (!customer.is_email_verified) {
      return NextResponse.json({
        error: 'Please verify your email before writing reviews',
        code: 'EMAIL_NOT_VERIFIED'
      }, { status: 403 })
    }

    const { worker_id, reviewer_name, rating, review_text } = await req.json()

    if (!worker_id) return NextResponse.json({ error: 'Worker ID is required' }, { status: 400 })
    if (!reviewer_name?.trim()) return NextResponse.json({ error: 'Reviewer name is required' }, { status: 400 })
    if (!rating || rating < 1 || rating > 5) return NextResponse.json({ error: 'Rating must be between 1 and 5' }, { status: 400 })

    // Verify worker exists and is active
    const { data: worker } = await supabase
      .from('workers')
      .select('id')
      .eq('id', worker_id)
      .eq('status', 'active')
      .single()

    if (!worker) return NextResponse.json({ error: 'Worker not found' }, { status: 404 })

    // 1 review per customer per worker
    const { data: existingReview } = await supabase
      .from('reviews')
      .select('id')
      .eq('worker_id', worker_id)
      .eq('customer_id', payload.customerId)
      .single()

    if (existingReview) {
      return NextResponse.json({ error: 'You have already reviewed this karigar' }, { status: 409 })
    }

    // Insert review as pending (requires admin approval)
    const { error } = await supabase.from('reviews').insert({
      worker_id,
      reviewer_name: reviewer_name.trim().substring(0, 100),
      rating: Math.floor(rating),
      review_text: review_text?.trim()?.substring(0, 1000) || null,
      customer_id: payload.customerId,
      is_customer_verified: true,
      status: 'pending',
    })

    if (error) {
      console.error('Review insert error:', error)
      return NextResponse.json({ error: 'Failed to submit review' }, { status: 500 })
    }

    return NextResponse.json({
      success: true,
      message: 'Review submitted! It will appear after admin approval.'
    })
  } catch (err) {
    console.error('Review error:', err)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
