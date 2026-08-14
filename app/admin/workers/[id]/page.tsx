import { notFound } from 'next/navigation'
import Image from 'next/image'
import { createClient } from '@supabase/supabase-js'
import { AdminSidebar } from '@/components/admin/AdminSidebar'
import { Badge } from '@/components/ui/Badge'
import { StarRating } from '@/components/ui/StarRating'
import { AdminWorkerActions } from '@/components/admin/AdminWorkerActions'
import { getEffectiveTier, formatDate, formatExpiry } from '@/lib/utils'
import { CATEGORIES } from '@/lib/constants'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
)

interface Props {
  params: Promise<{ id: string }>
}

export default async function AdminWorkerDetailPage({ params }: Props) {
  const { id } = await params

  const [workerRes, reviewsRes, pendingRes] = await Promise.all([
    supabase.from('workers').select('*').eq('id', id).single(),
    supabase.from('reviews').select('*').eq('worker_id', id).order('created_at', { ascending: false }),
    supabase.from('payment_requests').select('*').eq('worker_id', id).eq('status', 'pending'),
  ])

  if (workerRes.error || !workerRes.data) notFound()

  const worker = workerRes.data
  const reviews = reviewsRes.data || []
  const pendingPayments = pendingRes.data || []
  const tier = getEffectiveTier(worker)
  const cat = CATEGORIES.find(c => c.value === worker.category)

  return (
    <div className="flex">
      <AdminSidebar />
      <main className="flex-1 p-8 max-w-4xl">
        <div className="flex items-center gap-3 mb-6">
          <a href="/admin/workers" className="text-gray-400 hover:text-gray-600 text-sm">← Workers</a>
          <span className="text-gray-300">/</span>
          <span className="text-[#1B3A6B] font-medium text-sm">{worker.full_name}</span>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Profile info */}
          <div className="lg:col-span-2 bg-white rounded-xl border border-gray-200 p-6">
            <div className="flex gap-5 items-start mb-6">
              <div className="relative w-20 h-20 flex-shrink-0">
                {worker.profile_photo_url ? (
                  <Image src={worker.profile_photo_url} alt={worker.full_name} fill className="rounded-full object-cover" sizes="80px" />
                ) : (
                  <div className="w-20 h-20 rounded-full bg-gray-100 flex items-center justify-center text-3xl">{cat?.icon || '👤'}</div>
                )}
              </div>
              <div>
                <h1 className="text-xl font-bold text-[#2D2D2D]">{worker.full_name}</h1>
                <p className="text-gray-500 text-sm">{worker.phone}</p>
                <div className="flex items-center gap-2 mt-2">
                  <Badge variant={worker.status === 'inactive' ? 'rejected' : tier} />
                  <StarRating value={Math.round(worker.average_rating)} readonly size="sm" />
                </div>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4 text-sm mb-4">
              {[
                { label: 'Category', value: `${cat?.icon} ${cat?.label || worker.category}` },
                { label: 'City / Area', value: `${worker.city}, ${worker.area}` },
                { label: 'Joined', value: formatDate(worker.created_at) },
                { label: 'Profile Views', value: worker.profile_views },
                { label: 'Reviews', value: worker.review_count },
                { label: 'Rating', value: worker.average_rating > 0 ? `${worker.average_rating}/5` : 'None' },
              ].map(item => (
                <div key={item.label}>
                  <p className="text-xs text-gray-400 uppercase tracking-wide">{item.label}</p>
                  <p className="font-medium text-[#2D2D2D]">{item.value}</p>
                </div>
              ))}
            </div>

            {(worker.verified_expires_at || worker.boost_expires_at) && (
              <div className="bg-gray-50 rounded-lg p-3 text-sm space-y-1">
                {worker.verified_expires_at && (
                  <p>✅ Verified until: <strong>{formatExpiry(worker.verified_expires_at)}</strong></p>
                )}
                {worker.boost_expires_at && (
                  <p>⭐ Boost until: <strong>{formatExpiry(worker.boost_expires_at)}</strong></p>
                )}
              </div>
            )}

            <div className="mt-4">
              <p className="text-xs text-gray-400 uppercase tracking-wide mb-1">About</p>
              <p className="text-gray-600 text-sm">{worker.about}</p>
            </div>
          </div>

          {/* Actions panel */}
          <div>
            <AdminWorkerActions worker={worker} pendingPayments={pendingPayments} />
          </div>
        </div>

        {/* Recent reviews */}
        {reviews.length > 0 && (
          <div className="mt-6 bg-white rounded-xl border border-gray-200 p-5">
            <h2 className="font-semibold text-[#1B3A6B] mb-3">Reviews ({reviews.length})</h2>
            <div className="space-y-3">
              {reviews.slice(0, 5).map(r => (
                <div key={r.id} className="border-b border-gray-100 last:border-0 pb-2 last:pb-0">
                  <div className="flex justify-between text-xs text-gray-500">
                    <span className="font-medium text-[#2D2D2D]">{r.reviewer_name}</span>
                    <span>{formatDate(r.created_at)}</span>
                  </div>
                  <StarRating value={r.rating} readonly size="sm" />
                  {r.review_text && <p className="text-gray-600 text-xs mt-1">{r.review_text}</p>}
                </div>
              ))}
            </div>
          </div>
        )}
      </main>
    </div>
  )
}
