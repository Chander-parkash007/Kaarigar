'use client'
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { StarRating } from '@/components/ui/StarRating'
import { Button } from '@/components/ui/Button'
import Link from 'next/link'

interface Review {
  id: string
  reviewer_name: string
  rating: number
  review_text: string | null
  status: string
  is_customer_verified: boolean
  created_at: string
  worker: { id: string; full_name: string; category: string; city: string } | null
}

interface Props {
  reviews: Review[]
  currentStatus: string
}

const TABS = [
  { key: 'pending', label: '⏳ Pending' },
  { key: 'approved', label: '✅ Approved' },
  { key: 'rejected', label: '❌ Rejected' },
  { key: 'all', label: 'All' },
]

export function AdminReviewsList({ reviews, currentStatus }: Props) {
  const router = useRouter()
  const [loading, setLoading] = useState<string | null>(null)

  async function updateReview(reviewId: string, status: 'approved' | 'rejected') {
    setLoading(reviewId)
    try {
      const res = await fetch('/api/admin/reviews', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ reviewId, status }),
      })
      if (res.ok) router.refresh()
      else alert('Failed to update review')
    } catch { alert('Network error') }
    finally { setLoading(null) }
  }

  return (
    <div>
      {/* Tabs */}
      <div className="flex gap-2 mb-5 flex-wrap">
        {TABS.map(tab => (
          <button key={tab.key} onClick={() => router.push(`/admin/reviews?status=${tab.key}`)}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
              currentStatus === tab.key ? 'bg-[#1B3A6B] text-white' : 'bg-white border border-gray-200 text-gray-600 hover:bg-gray-50'
            }`}>
            {tab.label}
          </button>
        ))}
      </div>

      {reviews.length === 0 ? (
        <div className="bg-white rounded-xl border border-gray-200 p-12 text-center">
          <div className="text-4xl mb-3">⭐</div>
          <p className="font-semibold text-gray-600">No reviews found</p>
        </div>
      ) : (
        <div className="space-y-3">
          {reviews.map(review => (
            <div key={review.id} className={`bg-white rounded-xl border p-4 ${
              review.status === 'pending' ? 'border-yellow-200' :
              review.status === 'approved' ? 'border-green-200' : 'border-red-200'
            }`}>
              <div className="flex items-start justify-between gap-4">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="font-semibold text-[#2D2D2D]">{review.reviewer_name}</span>
                    {review.is_customer_verified && (
                      <span className="text-xs bg-green-100 text-green-700 px-2 py-0.5 rounded-full">✅ Verified</span>
                    )}
                    <span className={`text-xs px-2 py-0.5 rounded-full ${
                      review.status === 'pending' ? 'bg-yellow-100 text-yellow-700' :
                      review.status === 'approved' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
                    }`}>{review.status}</span>
                  </div>
                  <StarRating value={review.rating} readonly size="sm" />
                  {review.review_text && (
                    <p className="text-gray-600 text-sm mt-1">&ldquo;{review.review_text}&rdquo;</p>
                  )}
                  {review.worker && (
                    <p className="text-xs text-gray-400 mt-1">
                      For: <Link href={`/admin/workers/${review.worker.id}`} className="text-[#1B3A6B] hover:underline">{review.worker.full_name}</Link>
                      {' '} • {review.worker.city}
                    </p>
                  )}
                  <p className="text-xs text-gray-400 mt-0.5">
                    {new Date(review.created_at).toLocaleString('en-PK')}
                  </p>
                </div>

                {review.status === 'pending' && (
                  <div className="flex gap-2 flex-shrink-0">
                    <Button size="sm" variant="primary" loading={loading === review.id}
                      onClick={() => updateReview(review.id, 'approved')}>
                      ✅ Approve
                    </Button>
                    <Button size="sm" variant="danger" loading={loading === review.id}
                      onClick={() => updateReview(review.id, 'rejected')}>
                      ❌ Reject
                    </Button>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
