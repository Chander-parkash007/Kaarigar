import { createClient } from '@/lib/supabase/server'
import { Worker } from '@/lib/types'
import { WorkerCard } from '@/components/workers/WorkerCard'
import Link from 'next/link'

export async function FeaturedWorkers() {
  const supabase = await createClient()

  const now = new Date().toISOString()

  const { data: workers } = await supabase
    .from('workers')
    .select('*')
    .eq('status', 'active')
    .or(`verified_expires_at.gt.${now},boost_expires_at.gt.${now}`)
    .order('average_rating', { ascending: false })
    .limit(6)

  if (!workers || workers.length === 0) {
    return null
  }

  return (
    <section className="max-w-6xl mx-auto px-4 py-14" aria-label="Featured workers">
      <div className="flex items-center justify-between mb-2">
        <h2 className="text-2xl font-bold text-[#1B3A6B]">⭐ Featured Professionals</h2>
        <Link href="/search" className="text-[#FF6B00] text-sm font-medium hover:underline">
          View all →
        </Link>
      </div>
      <p className="text-gray-500 text-sm mb-8">Top rated and verified workers across Pakistan</p>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {workers.map((worker: Worker) => (
          <WorkerCard key={worker.id} worker={worker} />
        ))}
      </div>
    </section>
  )
}
