'use client'
import { useState } from 'react'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { StarRating } from '@/components/ui/StarRating'

interface ReviewFormProps {
  workerId: string
  workerName: string
}

export function ReviewForm({ workerId, workerName }: ReviewFormProps) {
  const [name, setName] = useState('')
  const [rating, setRating] = useState(0)
  const [text, setText] = useState('')
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [loading, setLoading] = useState(false)
  const [submitted, setSubmitted] = useState(false)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    const newErrors: Record<string, string> = {}
    if (!name.trim()) newErrors.name = 'Please enter your name'
    if (rating === 0) newErrors.rating = 'Please select a star rating'
    if (setErrors(newErrors), Object.keys(newErrors).length > 0) return

    setLoading(true)
    try {
      const res = await fetch('/api/reviews', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ worker_id: workerId, reviewer_name: name.trim(), rating, review_text: text.trim() || null }),
      })
      if (res.ok) {
        setSubmitted(true)
      } else {
        const data = await res.json()
        setErrors({ form: data.error || 'Something went wrong' })
      }
    } catch {
      setErrors({ form: 'Network error. Please try again.' })
    } finally {
      setLoading(false)
    }
  }

  if (submitted) {
    return (
      <div className="bg-green-50 border border-green-200 rounded-2xl p-6 text-center">
        <div className="text-3xl mb-2">✅</div>
        <h3 className="font-semibold text-green-800">Review submitted!</h3>
        <p className="text-green-600 text-sm mt-1">Thank you for reviewing {workerName}.</p>
      </div>
    )
  }

  return (
    <section className="bg-white rounded-2xl shadow-sm border border-gray-200 p-5">
      <h2 className="font-semibold text-[#1B3A6B] text-lg mb-4">Leave a Review</h2>
      <form onSubmit={handleSubmit} className="space-y-4" noValidate>
        <Input
          label="Your Name"
          id="reviewer-name"
          value={name}
          onChange={e => setName(e.target.value)}
          placeholder="e.g. Ahmed Ali"
          error={errors.name}
          maxLength={100}
        />

        <div>
          <label className="text-sm font-medium text-[#2D2D2D] block mb-1">Rating *</label>
          <StarRating value={rating} onChange={setRating} size="lg" />
          {errors.rating && <p className="text-xs text-red-600 mt-1">{errors.rating}</p>}
        </div>

        <div>
          <label htmlFor="review-text" className="text-sm font-medium text-[#2D2D2D] block mb-1">
            Review (optional)
          </label>
          <textarea
            id="review-text"
            value={text}
            onChange={e => setText(e.target.value)}
            placeholder="Share your experience..."
            maxLength={1000}
            rows={3}
            className="w-full px-4 py-2.5 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#1B3A6B] focus:border-transparent resize-none"
          />
        </div>

        {errors.form && <p className="text-red-600 text-sm">{errors.form}</p>}

        <Button type="submit" variant="primary" loading={loading}>
          Submit Review
        </Button>
      </form>
    </section>
  )
}
