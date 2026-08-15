'use client'
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { CATEGORIES, CITIES } from '@/lib/constants'
import { Button } from '@/components/ui/Button'

export function HeroSection() {
  const router = useRouter()
  const [category, setCategory] = useState('')
  const [city, setCity] = useState('')
  const [error, setError] = useState('')

  function handleSearch(e: React.FormEvent) {
    e.preventDefault()
    if (!category || !city) {
      setError('Please select both a service and a city')
      return
    }
    setError('')
    router.push(`/search?category=${category}&city=${city}`)
  }

  return (
    <section className="relative overflow-hidden bg-[#1B3A6B]" aria-label="Hero section">
      {/* Decorative blobs */}
      <div className="absolute top-0 right-0 w-96 h-96 bg-[#FF6B00]/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/3 pointer-events-none" />
      <div className="absolute bottom-0 left-0 w-72 h-72 bg-white/5 rounded-full blur-2xl translate-y-1/2 -translate-x-1/4 pointer-events-none" />

      <div className="relative max-w-5xl mx-auto px-4 py-10 md:py-16 text-center">
        {/* Badge */}
        <div className="inline-flex items-center gap-2 bg-white/10 border border-white/20 text-white text-xs font-medium px-4 py-1.5 rounded-full mb-3 backdrop-blur-sm">
          <span className="w-2 h-2 bg-green-400 rounded-full animate-pulse" />
          Pakistan ka #1 Karigar Platform
        </div>

        {/* Urdu tagline */}
        <p className="text-[#FF6B00] font-semibold text-lg mb-2" dir="rtl" lang="ur">
          آپکا ماہر، آپکے پاس
        </p>

        <h1 className="text-4xl md:text-5xl font-bold text-white mb-3 leading-tight">
          Apka Bharosa Mand<br />
          <span className="text-[#FF6B00]">KaariGar</span>
        </h1>

        <p className="text-blue-200 text-base max-w-xl mx-auto mb-6">
          Plumbers, electricians, tutors & more — apke sheher mein. Seedha call karein. Cash mein payment.
        </p>

        {/* Search Card */}
        <form
          onSubmit={handleSearch}
          className="bg-white rounded-2xl p-3 shadow-2xl max-w-2xl mx-auto"
        >
          <div className="flex flex-col sm:flex-row gap-2">
            <select
              value={category}
              onChange={e => setCategory(e.target.value)}
              className="flex-1 px-4 py-3.5 border border-gray-200 rounded-xl text-[#2D2D2D] text-sm focus:outline-none focus:ring-2 focus:ring-[#1B3A6B] bg-gray-50"
              aria-label="Select service"
            >
              <option value="">🔍 What service do you need?</option>
              {CATEGORIES.map(cat => (
                <option key={cat.value} value={cat.value}>
                  {cat.icon} {cat.label}
                </option>
              ))}
            </select>

            <select
              value={city}
              onChange={e => setCity(e.target.value)}
              className="flex-1 px-4 py-3.5 border border-gray-200 rounded-xl text-[#2D2D2D] text-sm focus:outline-none focus:ring-2 focus:ring-[#1B3A6B] bg-gray-50"
              aria-label="Select city"
            >
              <option value="">📍 Select your city</option>
              {Object.keys(CITIES).map(c => (
                <option key={c} value={c}>{c}</option>
              ))}
            </select>

            <Button type="submit" variant="secondary" size="lg" className="whitespace-nowrap px-8 rounded-xl">
              Search
            </Button>
          </div>
          {error && <p className="text-red-500 text-xs mt-2 text-left px-1">{error}</p>}
        </form>

        {/* Trust stats */}
        <div className="flex flex-wrap justify-center gap-6 mt-6 text-center">
          {[
            { num: '500+', label: 'Karigars', icon: '👷' },
            { num: '9', label: 'Cities', icon: '🏙️' },
            { num: '10', label: 'Services', icon: '🛠️' },
            { num: '100%', label: 'Free to Join', icon: '✅' },
          ].map(stat => (
            <div key={stat.label} className="flex flex-col items-center">
              <div className="text-xl mb-0.5">{stat.icon}</div>
              <div className="text-2xl font-bold text-white">{stat.num}</div>
              <div className="text-blue-300 text-xs">{stat.label}</div>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
