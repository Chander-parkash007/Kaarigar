import { notFound } from 'next/navigation'
import type { Metadata } from 'next'
import { createClient } from '@/lib/supabase/server'
import { Navbar } from '@/components/layout/Navbar'
import { Footer } from '@/components/layout/Footer'
import { WorkerCard } from '@/components/workers/WorkerCard'
import { CATEGORIES, CITIES } from '@/lib/constants'
import { Worker } from '@/lib/types'
import Link from 'next/link'

interface Props {
  params: Promise<{ city: string; category: string }>
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { city, category } = await params
  const cityName = city.charAt(0).toUpperCase() + city.slice(1)
  const cat = CATEGORIES.find(c => c.value === category)
  if (!cat) return {}

  return {
    title: `Best ${cat.label} in ${cityName} — KaariGar`,
    description: `Find trusted ${cat.label.toLowerCase()} in ${cityName}. Verified professionals, customer reviews, direct contact. ${cat.urdu} in ${cityName} on KaariGar.`,
    keywords: `${cat.label.toLowerCase()} ${cityName}, ${cat.label.toLowerCase()} in ${cityName}, ${cityName} ${cat.label.toLowerCase()}, best ${cat.label.toLowerCase()} ${cityName}`,
  }
}

export default async function CityServicePage({ params }: Props) {
  const { city, category } = await params

  // Validate city and category
  const cityName = Object.keys(CITIES).find(c => c.toLowerCase() === city.toLowerCase())
  const cat = CATEGORIES.find(c => c.value === category)

  if (!cityName || !cat) notFound()

  const supabase = await createClient()
  const now = new Date().toISOString()

  const { data: workers } = await supabase
    .from('workers')
    .select('*')
    .eq('status', 'active')
    .eq('city', cityName)
    .eq('category', category)
    .order('average_rating', { ascending: false })
    .limit(20)

  // Sort: verified → boosted → rating
  const sorted = (workers || []).sort((a: Worker, b: Worker) => {
    const score = (w: Worker) => {
      if (w.verified_expires_at && new Date(w.verified_expires_at) > new Date()) return 2
      if (w.boost_expires_at && new Date(w.boost_expires_at) > new Date()) return 1
      return 0
    }
    return score(b) - score(a) || b.average_rating - a.average_rating
  })

  return (
    <>
      <Navbar />
      <main className="min-h-screen bg-[#F8F9FA]">
        {/* Hero */}
        <div className="bg-[#1B3A6B] text-white py-12 px-4">
          <div className="max-w-4xl mx-auto text-center">
            <div className="text-5xl mb-3">{cat.icon}</div>
            <h1 className="text-3xl md:text-4xl font-bold mb-2">
              Best {cat.label} in {cityName}
            </h1>
            <p className="text-blue-200 text-lg mb-1" dir="rtl" lang="ur">
              {cityName} میں بہترین {cat.urdu}
            </p>
            <p className="text-blue-300 text-sm">
              {sorted.length} verified professional{sorted.length !== 1 ? 's' : ''} found
            </p>
          </div>
        </div>

        <div className="max-w-4xl mx-auto px-4 py-8">
          {/* Breadcrumb */}
          <nav className="flex items-center gap-2 text-sm text-gray-500 mb-6">
            <Link href="/" className="hover:text-[#1B3A6B]">Home</Link>
            <span>›</span>
            <Link href={`/search?city=${cityName}`} className="hover:text-[#1B3A6B]">{cityName}</Link>
            <span>›</span>
            <span className="text-[#1B3A6B] font-medium">{cat.label}</span>
          </nav>

          {sorted.length === 0 ? (
            <div className="bg-white rounded-xl border border-gray-200 p-12 text-center">
              <div className="text-4xl mb-3">{cat.icon}</div>
              <h2 className="font-semibold text-gray-700 mb-2">No {cat.label}s found in {cityName} yet</h2>
              <p className="text-gray-500 text-sm mb-4">Be the first {cat.label} in {cityName}!</p>
              <Link href="/register"
                className="inline-block bg-[#FF6B00] text-white px-6 py-2.5 rounded-xl font-semibold hover:bg-[#e05f00] transition-colors">
                Register Free →
              </Link>
            </div>
          ) : (
            <>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-8">
                {sorted.map((worker: Worker) => (
                  <WorkerCard key={worker.id} worker={worker} />
                ))}
              </div>

              {/* Area links for SEO */}
              <div className="bg-white rounded-xl border border-gray-200 p-5">
                <h2 className="font-semibold text-[#1B3A6B] mb-3">{cat.label} by Area in {cityName}</h2>
                <div className="flex flex-wrap gap-2">
                  {CITIES[cityName]?.map(area => (
                    <Link
                      key={area}
                      href={`/search?category=${category}&city=${cityName}&area=${area}`}
                      className="px-3 py-1.5 bg-gray-100 hover:bg-[#1B3A6B] hover:text-white text-sm rounded-lg transition-colors text-gray-600"
                    >
                      {cat.label} in {area}
                    </Link>
                  ))}
                </div>
              </div>
            </>
          )}

          {/* Other categories CTA */}
          <div className="mt-8 bg-white rounded-xl border border-gray-200 p-5">
            <h2 className="font-semibold text-[#1B3A6B] mb-3">Other Services in {cityName}</h2>
            <div className="flex flex-wrap gap-2">
              {CATEGORIES.filter(c => c.value !== category).map(c => (
                <Link
                  key={c.value}
                  href={`/${city}/${c.value}`}
                  className="px-3 py-1.5 bg-gray-100 hover:bg-[#1B3A6B] hover:text-white text-sm rounded-lg transition-colors text-gray-600"
                >
                  {c.icon} {c.label}
                </Link>
              ))}
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </>
  )
}
