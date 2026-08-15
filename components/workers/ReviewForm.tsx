'use client'
import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { StarRating } from '@/components/ui/StarRating'
import { useLang } from '@/lib/LangContext'
import { useTranslation } from '@/lib/translations'

interface ReviewFormProps { workerId: string; workerName: string }

interface CustomerState {
  id: string
  full_name: string
  is_email_verified: boolean
}

export function ReviewForm({ workerId, workerName }: ReviewFormProps) {
  const { lang } = useLang()
  const tr = useTranslation(lang)
  const [customer, setCustomer] = useState<CustomerState | null>(null)
  const [checkingAuth, setCheckingAuth] = useState(true)

  const [name, setName] = useState('')
  const [rating, setRating] = useState(0)
  const [text, setText] = useState('')
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [loading, setLoading] = useState(false)
  const [submitted, setSubmitted] = useState(false)

  // Check if customer is logged in
  useEffect(() => {
    fetch('/api/customers/me')
      .then(r => r.json())
      .then(data => {
        if (data.customer) {
          setCustomer(data.customer)
          setName(data.customer.full_name)
        }
      })
      .catch(() => {})
      .finally(() => setCheckingAuth(false))
  }, [])

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    const newErrors: Record<string, string> = {}
    if (!name.trim()) newErrors.name = tr('review_name_error')
    if (rating === 0) newErrors.rating = tr('review_rating_error')
    if (setErrors(newErrors), Object.keys(newErrors).length > 0) return

    setLoading(true)
    try {
      const res = await fetch('/api/reviews', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          worker_id: workerId,
          reviewer_name: name.trim(),
          rating,
          review_text: text.trim() || null,
          customer_id: customer?.id || null,
        }),
      })
      if (res.ok) { setSubmitted(true) }
      else { const data = await res.json(); setErrors({ form: data.error || 'Something went wrong' }) }
    } catch { setErrors({ form: tr('network_error') }) }
    finally { setLoading(false) }
  }

  if (checkingAuth) return null

  if (submitted) {
    return (
      <div className="bg-green-50 border border-green-200 rounded-2xl p-6 text-center">
        <div className="text-3xl mb-2">✅</div>
        <h3 className="font-semibold text-green-800">{tr('review_success_title')}</h3>
        <p className="text-green-600 text-sm mt-1">
          {lang === 'ur'
            ? 'آپکا جائزہ منظوری کے بعد ظاہر ہو گا۔'
            : 'Your review will appear after approval.'}
        </p>
      </div>
    )
  }

  // Not logged in — prompt to login
  if (!customer) {
    return (
      <section className="bg-white rounded-2xl shadow-sm border border-gray-200 p-5">
        <h2 className="font-semibold text-[#1B3A6B] text-lg mb-3">{tr('review_title')}</h2>
        <div className="bg-blue-50 border border-blue-200 rounded-xl p-4 text-center">
          <p className="text-blue-800 font-medium mb-1">
            {lang === 'ur' ? 'جائزہ لکھنے کے لیے لاگ ان کریں' : 'Login to write a review'}
          </p>
          <p className="text-blue-600 text-sm mb-3">
            {lang === 'ur'
              ? 'صرف تصدیق شدہ گاہک ہی جائزہ لکھ سکتے ہیں'
              : 'Only verified customers can write reviews to prevent fake reviews'}
          </p>
          <a href="/customer/login"
            className="inline-block bg-[#1B3A6B] text-white px-6 py-2.5 rounded-xl text-sm font-semibold hover:bg-[#152d55] transition-colors">
            {lang === 'ur' ? 'گاہک لاگ ان / رجسٹر' : 'Customer Login / Register'}
          </a>
        </div>
      </section>
    )
  }

  // Logged in but email NOT verified
  if (!customer.is_email_verified) {
    return (
      <section className="bg-white rounded-2xl shadow-sm border border-gray-200 p-5">
        <h2 className="font-semibold text-[#1B3A6B] text-lg mb-3">{tr('review_title')}</h2>
        <div className="bg-yellow-50 border border-yellow-300 rounded-xl p-5 text-center">
          <div className="text-3xl mb-2">📧</div>
          <p className="text-yellow-800 font-semibold mb-1">
            {lang === 'ur' ? 'ای میل تصدیق ضروری ہے' : 'Email verification required'}
          </p>
          <p className="text-yellow-700 text-sm mb-3">
            {lang === 'ur'
              ? 'جعلی جائزوں کو روکنے کے لیے ای میل تصدیق ضروری ہے۔ صرف 2 منٹ لگیں گے!'
              : 'To prevent fake reviews, please verify your email first. Takes only 2 minutes!'}
          </p>
          <a href="/customer"
            className="inline-block bg-[#FF6B00] text-white px-6 py-2.5 rounded-xl text-sm font-semibold hover:bg-[#e05f00] transition-colors">
            {lang === 'ur' ? '✅ ابھی تصدیق کریں' : '✅ Verify Email Now'}
          </a>
        </div>
      </section>
    )
  }

  // Verified — show review form
  return (
    <section className="bg-white rounded-2xl shadow-sm border border-gray-200 p-5">
      <div className="flex items-center justify-between mb-4">
        <h2 className="font-semibold text-[#1B3A6B] text-lg">{tr('review_title')}</h2>
        <span className="text-xs bg-green-100 text-green-700 px-2 py-1 rounded-full font-medium">
          ✅ {lang === 'ur' ? 'تصدیق شدہ گاہک' : 'Verified Customer'}
        </span>
      </div>
      <form onSubmit={handleSubmit} className="space-y-4" noValidate>
        <Input label={tr('review_name')} id="reviewer-name" value={name}
          onChange={e => setName(e.target.value)} placeholder={tr('review_name_placeholder')}
          error={errors.name} maxLength={100} />
        <div>
          <label className="text-sm font-medium text-[#2D2D2D] block mb-1">{tr('review_rating')}</label>
          <StarRating value={rating} onChange={setRating} size="lg" />
          {errors.rating && <p className="text-xs text-red-600 mt-1">{errors.rating}</p>}
        </div>
        <div>
          <label htmlFor="review-text" className="text-sm font-medium text-[#2D2D2D] block mb-1">{tr('review_text')}</label>
          <textarea id="review-text" value={text} onChange={e => setText(e.target.value)}
            placeholder={tr('review_placeholder')} maxLength={1000} rows={3}
            className="w-full px-4 py-2.5 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#1B3A6B] resize-none" />
        </div>
        {errors.form && <p className="text-red-600 text-sm">{errors.form}</p>}
        <Button type="submit" variant="primary" loading={loading}>{tr('review_submit')}</Button>
      </form>
    </section>
  )
}
