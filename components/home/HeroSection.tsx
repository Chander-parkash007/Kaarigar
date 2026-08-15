'use client'
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { CATEGORIES, CITIES } from '@/lib/constants'
import { Button } from '@/components/ui/Button'
import { useLang } from '@/lib/LangContext'
import { useTranslation } from '@/lib/translations'

export function HeroSection() {
  const router = useRouter()
  const { lang } = useLang()
  const tr = useTranslation(lang)
  const [category, setCategory] = useState('')
  const [city, setCity] = useState('')
  const [error, setError] = useState('')

  function handleSearch(e: React.FormEvent) {
    e.preventDefault()
    if (!category || !city) { setError(tr('hero_error')); return }
    setError('')
    router.push(`/search?category=${category}&city=${city}`)
  }

  return (
    <section className="relative overflow-hidden bg-[#1B3A6B]" aria-label="Hero section">
      <div className="absolute top-0 right-0 w-96 h-96 bg-[#FF6B00]/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/3 pointer-events-none" />
      <div className="absolute bottom-0 left-0 w-72 h-72 bg-white/5 rounded-full blur-2xl translate-y-1/2 -translate-x-1/4 pointer-events-none" />

      <div className="relative max-w-5xl mx-auto px-4 py-10 md:py-16 text-center">
        <div className="inline-flex items-center gap-2 bg-white/10 border border-white/20 text-white text-xs font-medium px-4 py-1.5 rounded-full mb-3 backdrop-blur-sm">
          <span className="w-2 h-2 bg-green-400 rounded-full animate-pulse" />
          {tr('hero_badge')}
        </div>

        <p className="text-[#FF6B00] font-semibold text-lg mb-2" dir="rtl" lang="ur">آپکا ماہر، آپکے پاس</p>

        <h1 className="text-4xl md:text-5xl font-bold text-white mb-3 leading-tight">
          {lang === 'ur' ? (
            <span dir="rtl">آپکا بھروسہ مند<br /><span className="text-[#FF6B00]">KaariGar</span></span>
          ) : (
            <>Apka Bharosa Mand<br /><span className="text-[#FF6B00]">KaariGar</span></>
          )}
        </h1>

        <p className="text-blue-200 text-base max-w-xl mx-auto mb-6">{tr('hero_subtitle')}</p>

        <form onSubmit={handleSearch} className="bg-white rounded-2xl p-3 shadow-2xl max-w-2xl mx-auto">
          <div className="flex flex-col sm:flex-row gap-2">
            <select value={category} onChange={e => setCategory(e.target.value)}
              className="flex-1 px-4 py-3.5 border border-gray-200 rounded-xl text-[#2D2D2D] text-sm focus:outline-none focus:ring-2 focus:ring-[#1B3A6B] bg-gray-50"
              aria-label={tr('hero_service')}>
              <option value="">{tr('hero_service')}</option>
              {CATEGORIES.map(cat => (
                <option key={cat.value} value={cat.value}>
                  {cat.icon} {lang === 'ur' ? cat.urdu : cat.label}
                </option>
              ))}
            </select>
            <select value={city} onChange={e => setCity(e.target.value)}
              className="flex-1 px-4 py-3.5 border border-gray-200 rounded-xl text-[#2D2D2D] text-sm focus:outline-none focus:ring-2 focus:ring-[#1B3A6B] bg-gray-50"
              aria-label={tr('hero_city')}>
              <option value="">{tr('hero_city')}</option>
              {Object.keys(CITIES).map(c => <option key={c} value={c}>{c}</option>)}
            </select>
            <Button type="submit" variant="secondary" size="lg" className="whitespace-nowrap px-8 rounded-xl">
              {tr('hero_search')}
            </Button>
          </div>
          {error && <p className="text-red-500 text-xs mt-2 text-left px-1">{error}</p>}
        </form>

        <div className="flex flex-wrap justify-center gap-6 mt-6 text-center">
          {[
            { num: '500+', labelKey: 'hero_karigars' as const, icon: '👷' },
            { num: '9', labelKey: 'hero_cities' as const, icon: '🏙️' },
            { num: '10', labelKey: 'hero_services' as const, icon: '🛠️' },
            { num: '100%', labelKey: 'hero_free' as const, icon: '✅' },
          ].map(stat => (
            <div key={stat.labelKey} className="flex flex-col items-center">
              <div className="text-xl mb-0.5">{stat.icon}</div>
              <div className="text-2xl font-bold text-white">{stat.num}</div>
              <div className="text-blue-300 text-xs">{tr(stat.labelKey)}</div>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
