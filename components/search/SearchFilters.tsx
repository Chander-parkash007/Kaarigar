'use client'
import { useState, useEffect } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { CATEGORIES, CITIES } from '@/lib/constants'
import { Button } from '@/components/ui/Button'

interface Props {
  initialParams: { category?: string; city?: string; area?: string; rating?: string; verified?: string; q?: string }
}

export function SearchFilters({ initialParams }: Props) {
  const router = useRouter()
  const searchParams = useSearchParams()

  const [q, setQ] = useState(initialParams.q || '')
  const [category, setCategory] = useState(initialParams.category || '')
  const [city, setCity] = useState(initialParams.city || '')
  const [area, setArea] = useState(initialParams.area || '')
  const [rating, setRating] = useState(initialParams.rating || '')
  const [verified, setVerified] = useState(initialParams.verified === 'true')

  const areas = city ? CITIES[city] || [] : []

  useEffect(() => {
    if (!areas.includes(area)) setArea('')
  }, [city])

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
    setQ('')
    setCategory('')
    setCity('')
    setArea('')
    setRating('')
    setVerified(false)
    router.push('/search')
  }

  return (
    <div className="bg-white rounded-xl border border-gray-200 p-4 sticky top-20 space-y-4">
      <h3 className="font-semibold text-[#1B3A6B]">Filters</h3>

      {/* Name search */}
      <div>
        <label className="text-xs font-medium text-gray-500 uppercase tracking-wide block mb-1">Search by Name</label>
        <input
          type="text"
          value={q}
          onChange={e => setQ(e.target.value)}
          placeholder="e.g. Ahmed Ali..."
          className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#1B3A6B]"
          onKeyDown={e => e.key === 'Enter' && applyFilters()}
        />
      </div>

      {/* Category */}
      <div>
        <label className="text-xs font-medium text-gray-500 uppercase tracking-wide block mb-1">Service</label>
        <select
          value={category}
          onChange={e => setCategory(e.target.value)}
          className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#1B3A6B]"
        >
          <option value="">All Services</option>
          {CATEGORIES.map(c => (
            <option key={c.value} value={c.value}>{c.icon} {c.label}</option>
          ))}
        </select>
      </div>

      {/* City */}
      <div>
        <label className="text-xs font-medium text-gray-500 uppercase tracking-wide block mb-1">City</label>
        <select
          value={city}
          onChange={e => setCity(e.target.value)}
          className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#1B3A6B]"
        >
          <option value="">All Cities</option>
          {Object.keys(CITIES).map(c => (
            <option key={c} value={c}>{c}</option>
          ))}
        </select>
      </div>

      {/* Area */}
      {city && (
        <div>
          <label className="text-xs font-medium text-gray-500 uppercase tracking-wide block mb-1">Area</label>
          <select
            value={area}
            onChange={e => setArea(e.target.value)}
            className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#1B3A6B]"
          >
            <option value="">All Areas</option>
            {areas.map(a => (
              <option key={a} value={a}>{a}</option>
            ))}
          </select>
        </div>
      )}

      {/* Min Rating */}
      <div>
        <label className="text-xs font-medium text-gray-500 uppercase tracking-wide block mb-1">Min Rating</label>
        <select
          value={rating}
          onChange={e => setRating(e.target.value)}
          className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#1B3A6B]"
        >
          <option value="">Any Rating</option>
          <option value="4">4★ & above</option>
          <option value="3">3★ & above</option>
          <option value="2">2★ & above</option>
        </select>
      </div>

      {/* Verified only */}
      <div className="flex items-center gap-2">
        <input
          type="checkbox"
          id="verified-filter"
          checked={verified}
          onChange={e => setVerified(e.target.checked)}
          className="w-4 h-4 accent-[#1B3A6B]"
        />
        <label htmlFor="verified-filter" className="text-sm text-[#2D2D2D]">✅ Verified only</label>
      </div>

      <div className="flex flex-col gap-2 pt-2">
        <Button variant="primary" size="sm" onClick={applyFilters} className="w-full">Apply Filters</Button>
        <Button variant="ghost" size="sm" onClick={resetFilters} className="w-full">Reset</Button>
      </div>
    </div>
  )
}
