import { Navbar } from '@/components/layout/Navbar'
import { Footer } from '@/components/layout/Footer'
import { SearchResults } from '@/components/search/SearchResults'
import { SearchFilters } from '@/components/search/SearchFilters'
import { Suspense } from 'react'

interface SearchPageProps {
  searchParams: Promise<{ category?: string; city?: string; area?: string; rating?: string; verified?: string; page?: string; q?: string }>
}

export default async function SearchPage({ searchParams }: SearchPageProps) {
  const params = await searchParams

  return (
    <>
      <Navbar />
      <main className="min-h-screen bg-[#F8F9FA]">
        <div className="max-w-6xl mx-auto px-4 py-8">
          <h1 className="text-2xl font-bold text-[#1B3A6B] mb-6">
            {params.category
              ? `${params.category.charAt(0).toUpperCase() + params.category.slice(1).replace('_', ' ')} in ${params.city || 'Pakistan'}`
              : 'Browse Workers'
            }
          </h1>

          <div className="flex flex-col md:flex-row gap-6">
            {/* Filters sidebar */}
            <aside className="md:w-64 flex-shrink-0">
              <SearchFilters initialParams={params} />
            </aside>

            {/* Results */}
            <div className="flex-1">
              <Suspense fallback={<WorkersSkeleton />}>
                <SearchResults params={params} />
              </Suspense>
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </>
  )
}

function WorkersSkeleton() {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
      {[...Array(6)].map((_, i) => (
        <div key={i} className="bg-white rounded-xl border border-gray-200 p-4 animate-pulse">
          <div className="flex gap-4">
            <div className="w-16 h-16 bg-gray-200 rounded-full" />
            <div className="flex-1 space-y-2">
              <div className="h-4 bg-gray-200 rounded w-3/4" />
              <div className="h-3 bg-gray-200 rounded w-1/2" />
              <div className="h-3 bg-gray-200 rounded w-1/4" />
            </div>
          </div>
        </div>
      ))}
    </div>
  )
}
