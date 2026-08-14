import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import { sanitizeText, sanitizeReviewText } from '@/lib/sanitize'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
)

// Simple rate limiting for reviews (prevent spam)
const reviewAttempts = new Map<string, { count: number; resetAt: number }>()

function isReviewRateLimited(workerId: string, ip: string): boolean {
  const key = `${workerId}-${ip}`
  const now = Date.now()
  const attempt = reviewAttempts.get(key)
  
  if (!attempt) {
    reviewAttempts.set(key, { count: 1, resetAt: now + 60 * 60 * 1000 }) // 1 hour
    return false
  }
  
  if (now > attempt.resetAt) {
    reviewAttempts.set(key, { count: 1, resetAt: now + 60 * 60 * 1000 })
    return false
  }
  
  if (attempt.count >= 3) { // Max 3 reviews per hour per IP per worker
    return true
  }
  
  attempt.count++
  return false
}

export async function POST(req: NextRequest) {
  try {
    const { worker_id, reviewer_name, rating, review_text } = await req.json()

    // Get IP for rate limiting
    const ip = req.headers.get('x-forwarded-for') || req.headers.get('x-real-ip') || 'unknown'

    // Validation
    if (!worker_id) return NextResponse.json({ error: 'Worker ID is required' }, { status: 400 })
    if (!reviewer_name?.trim()) return NextResponse.json({ error: 'Reviewer name is required' }, { status: 400 })
    if (!rating || rating < 1 || rating > 5) return NextResponse.json({ error: 'Rating must be between 1 and 5' }, { status: 400 })

    // Rate limiting
    if (isReviewRateLimited(worker_id, ip)) {
      return NextResponse.json({ 
        error: 'You have submitted too many reviews. Please try again later.' 
      }, { status: 429 })
    }

    // Verify worker exists
    const { data: worker } = await supabase.from('workers').select('id').eq('id', worker_id).single()
    if (!worker) return NextResponse.json({ error: 'Worker not found' }, { status: 404 })

    // Sanitize inputs
    const sanitizedName = sanitizeText(reviewer_name).substring(0, 100)
    const sanitizedReview = review_text ? sanitizeReviewText(review_text) : null

    const { error } = await supabase.from('reviews').insert({
      worker_id,
      reviewer_name: sanitizedName,
      rating: Math.floor(rating),
      review_text: sanitizedReview,
    })

    if (error) {
      console.error('Review insert error:', error)
      return NextResponse.json({ error: 'Failed to submit review' }, { status: 500 })
    }

    return NextResponse.json({ success: true, message: 'Review submitted successfully' })
  } catch (err) {
    console.error('Review submission error:', err)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
