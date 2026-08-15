import { createClient } from '@/lib/supabase/server'
import { Worker } from '@/lib/types'
import { WorkerCard } from '@/components/workers/WorkerCard'

interface Props {
  params: { category?: string; city?: string; area?: string; rating?: string; verified?: string; page?: string; q?: string }
}

const PAGE_SIZE = 12

export async function SearchResults({ params }: Props) {
  const supabase = await createClient()
  const now = new Date().toISOString()
  const page = Math.max(1, parseInt(params.page || '1', 10))
  const from = (page - 1) * PAGE_SIZE
  const to = from + PAGE_SIZE - 1

  let query = supabase
    .from('workers')
    .select('*', { count: 'exact' })
    .eq('status', 'active')

  if (params.category) query = query.eq('category', params.category)
  if (params.city) query = query.eq('city', params.city)
  if (params.area) query = query.eq('area', params.area)
  if (params.rating) query = query.gte('average_rating', parseFloat(params.rating))
  if (params.verified === 'true') query = query.gt('verified_expires_at', now)
  // Search by name
  if (params.q) query = query.ilike('full_name', `%${params.q}%`)

  // Server-side ranking: verified first → boosted → rating desc
  // We fetch all and do a stable sort by tier+rating, then paginate
  const { data: allWorkers, error, count } = await query.order('average_rating', { ascending: false })

  if (error) {
    return <p className="text-red-500 text-sm">Error loading workers. Please try again.</p>
  }

  if (!allWorkers || allWorkers.length === 0) {
    return (
      <div className="bg-white rounded-xl border border-gray-200 p-10 text-center">
        <div className="text-4xl mb-3">🔍</div>
        <h3 className="font-semibold text-[#2D2D2D] mb-1">No workers found</h3>
        <p className="text-gray-500 text-sm">Try removing some filters or searching in a different city.</p>
      </div>
    )
  }

  // Sort: verified → boosted → rating
  const ranked = [...allWorkers].sort((a: Worker, b: Worker) => {
    const tierScore = (w: Worker) => {
      if (w.verified_expires_at && new Date(w.verified_expires_at) > new Date()) return 2
      if (w.boost_expires_at && new Date(w.boost_expires_at) > new Date()) return 1
      return 0
    }
    const diff = tierScore(b) - tierScore(a)
    return diff !== 0 ? diff : b.average_rating - a.average_rating
  })

  const paged = ranked.slice(from, to + 1)
  const totalPages = Math.ceil((count || 0) / PAGE_SIZE)

  // Build pagination URL helper
  const buildUrl = (p: number) => {
    const qs = new URLSearchParams()
    if (params.category) qs.set('category', params.category)
    if (params.city) qs.set('city', params.city)
    if (params.area) qs.set('area', params.area)
    if (params.rating) qs.set('rating', params.rating)
    if (params.verified) qs.set('verified', params.verified)
    qs.set('page', String(p))
    return `/search?${qs.toString()}`
  }

  return (
    <div>
      <p className="text-sm text-gray-500 mb-4">
        {count} worker{count !== 1 ? 's' : ''} found
        {totalPages > 1 && ` — page ${page} of ${totalPages}`}
      </p>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {paged.map((worker: Worker) => (
          <WorkerCard key={worker.id} worker={worker} />
        ))}
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-center gap-2 mt-8">
          {page > 1 && (
            <a
              href={buildUrl(page - 1)}
              className="px-4 py-2 border border-gray-300 rounded-lg text-sm text-[#1B3A6B] hover:bg-gray-50 font-medium transition-colors"
            >
              ← Previous
            </a>
          )}

          {Array.from({ length: totalPages }, (_, i) => i + 1)
            .filter(p => p === 1 || p === totalPages || Math.abs(p - page) <= 1)
            .reduce<(number | '...')[]>((acc, p, i, arr) => {
              if (i > 0 && p - (arr[i - 1] as number) > 1) acc.push('...')
              acc.push(p)
              return acc
            }, [])
            .map((item, idx) =>
              item === '...' ? (
                <span key={`ellipsis-${idx}`} className="px-2 text-gray-400 text-sm">…</span>
              ) : (
                <a
                  key={item}
                  href={buildUrl(item as number)}
                  className={`w-9 h-9 flex items-center justify-center rounded-lg text-sm font-medium transition-colors ${
                    item === page
                      ? 'bg-[#1B3A6B] text-white'
                      : 'border border-gray-300 text-[#1B3A6B] hover:bg-gray-50'
                  }`}
                >
                  {item}
                </a>
              )
            )}

          {page < totalPages && (
            <a
              href={buildUrl(page + 1)}
              className="px-4 py-2 border border-gray-300 rounded-lg text-sm text-[#1B3A6B] hover:bg-gray-50 font-medium transition-colors"
            >
              Next →
            </a>
          )}
        </div>
      )}
    </div>
  )
}
