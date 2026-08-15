import { createClient } from '@supabase/supabase-js'
import { AdminSidebar } from '@/components/admin/AdminSidebar'
import { AdminReviewsList } from '@/components/admin/AdminReviewsList'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
)

interface Props {
  searchParams: Promise<{ status?: string }>
}

export default async function AdminReviewsPage({ searchParams }: Props) {
  const { status = 'pending' } = await searchParams

  let query = supabase
    .from('reviews')
    .select('*, worker:workers(id, full_name, category, city)')
    .order('created_at', { ascending: false })

  if (status !== 'all') query = query.eq('status', status)

  const { data: reviews } = await query.limit(100)

  const { count: pendingCount } = await supabase
    .from('reviews')
    .select('id', { count: 'exact', head: true })
    .eq('status', 'pending')

  return (
    <div className="flex">
      <AdminSidebar />
      <main className="flex-1 p-8">
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-2xl font-bold text-[#1B3A6B]">⭐ Reviews Moderation</h1>
          {(pendingCount || 0) > 0 && (
            <span className="bg-yellow-100 text-yellow-800 text-sm font-semibold px-3 py-1 rounded-full">
              {pendingCount} pending
            </span>
          )}
        </div>
        <AdminReviewsList reviews={reviews || []} currentStatus={status} />
      </main>
    </div>
  )
}
