'use client'
import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { CATEGORIES, CITIES } from '@/lib/constants'
import { Button } from '@/components/ui/Button'
import { useLang } from '@/lib/LangContext'
import { useTranslation } from '@/lib/translations'

interface Props {
  initialParams: { category?: string; city?: string; area?: string; rating?: string; verified?: string; q?: string }
}

export function SearchFilters({ initialParams }: Props) {
  const router = useRouter()
  const { lang } = useLang()
  const tr = useTranslation(lang)
  const [q, setQ] = useState(initialParams.q || '')
  const [category, setCategory] = useState(initialParams.category || '')
  const [city, setCity] = useState(initialParams.city || '')
  const [area, setArea] = useState(initialParams.area || '')
  const [rating, setRating] = useState(initialParams.rating || '')
  const [verified, setVerified] = useState(initialParams.verified === 'true')
  const areas = city ? CITIES[city] || [] : []

  useEffect(() => { if (!areas.includes(area)) setArea('') }, [city])

  function applyFilters() {
    const params = new URLSearchParams()
    if (q) params.set('q', q)
    if (category) params.set('category', category)
    if (city) params.set('city', city)
    if (area) params.set('area', area)
    if (rating) params.set('rating', rating)
    if (verified) params.set('verified', 'true')
    router.push(`/search?${params.toString()}`)
  }

  function resetFilters() {
    setQ(''); setCategory(''); setCity(''); setArea(''); setRating(''); setVerified(false)
    router.push('/search')
  }

  return (
    <div className="bg-white rounded-xl border border-gray-200 p-4 sticky top-20 space-y-4">
      <h3 className="font-semibold text-[#1B3A6B]">{tr('search_filters')}</h3>

      <div>
        <label className="text-xs font-medium text-gray-500 uppercase tracking-wide block mb-1">{tr('search_by_name')}</label>
        <input type="text" value={q} onChange={e => setQ(e.target.value)} placeholder={tr('search_name_placeholder')}
          className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#1B3A6B]"
          onKeyDown={e => e.key === 'Enter' && applyFilters()} />
      </div>

      <div>
        <label className="text-xs font-medium text-gray-500 uppercase tracking-wide block mb-1">{tr('search_service')}</label>
        <select value={category} onChange={e => setCategory(e.target.value)}
          className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#1B3A6B]">
          <option value="">{tr('search_all_services')}</option>
          {CATEGORIES.map(c => <option key={c.value} value={c.value}>{c.icon} {lang === 'ur' ? c.urdu : c.label}</option>)}
        </select>
      </div>

      <div>
        <label className="text-xs font-medium text-gray-500 uppercase tracking-wide block mb-1">{tr('search_city')}</label>
        <select value={city} onChange={e => setCity(e.target.value)}
          className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#1B3A6B]">
          <option value="">{tr('search_all_cities')}</option>
          {Object.keys(CITIES).map(c => <option key={c} value={c}>{c}</option>)}
        </select>
      </div>

      {city && (
        <div>
          <label className="text-xs font-medium text-gray-500 uppercase tracking-wide block mb-1">{tr('search_area')}</label>
          <select value={area} onChange={e => setArea(e.target.value)}
            className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#1B3A6B]">
            <option value="">{tr('search_all_areas')}</option>
            {areas.map(a => <option key={a} value={a}>{a}</option>)}
          </select>
        </div>
      )}

      <div>
        <label className="text-xs font-medium text-gray-500 uppercase tracking-wide block mb-1">{tr('search_min_rating')}</label>
        <select value={rating} onChange={e => setRating(e.target.value)}
          className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#1B3A6B]">
          <option value="">{tr('search_any_rating')}</option>
          <option value="4">4★ & above</option>
          <option value="3">3★ & above</option>
          <option value="2">2★ & above</option>
        </select>
      </div>

      <div className="flex items-center gap-2">
        <input type="checkbox" id="verified-filter" checked={verified} onChange={e => setVerified(e.target.checked)} className="w-4 h-4 accent-[#1B3A6B]" />
        <label htmlFor="verified-filter" className="text-sm text-[#2D2D2D]">{tr('search_verified_only')}</label>
      </div>

      <div className="flex flex-col gap-2 pt-2">
        <Button variant="primary" size="sm" onClick={applyFilters} className="w-full">{tr('search_apply')}</Button>
        <Button variant="ghost" size="sm" onClick={resetFilters} className="w-full">{tr('search_reset')}</Button>
      </div>
    </div>
  )
}
