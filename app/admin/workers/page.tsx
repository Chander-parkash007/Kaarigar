import { createClient } from '@supabase/supabase-js'
import { AdminSidebar } from '@/components/admin/AdminSidebar'
import { AdminWorkersTable } from '@/components/admin/AdminWorkersTable'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
)

interface Props {
  searchParams: Promise<{ tab?: string; q?: string }>
}

export default async function AdminWorkersPage({ searchParams }: Props) {
  const { tab = 'all', q = '' } = await searchParams
  const now = new Date().toISOString()

  let query = supabase.from('workers').select('*').order('created_at', { ascending: false })

  if (q) {
    query = query.or(`full_name.ilike.%${q}%,phone.ilike.%${q}%`)
  }

  if (tab === 'boosted') query = query.gt('boost_expires_at', now)
  else if (tab === 'verified') query = query.gt('verified_expires_at', now)
  else if (tab === 'free') query = query.lte('boost_expires_at', now).lte('verified_expires_at', now)
  else if (tab === 'pending') {
    const { data: pendingIds } = await supabase
      .from('payment_requests')
      .select('worker_id')
      .eq('status', 'pending')
    const ids = pendingIds?.map(p => p.worker_id) || []
    if (ids.length > 0) query = query.in('id', ids)
    else return (
      <div className="flex">
        <AdminSidebar />
        <main className="flex-1 p-8">
          <h1 className="text-2xl font-bold text-[#1B3A6B] mb-6">Workers</h1>
          <p className="text-gray-500">No pending payment workers.</p>
        </main>
      </div>
    )
  }

  const { data: workers } = await query

  return (
    <div className="flex">
      <AdminSidebar />
      <main className="flex-1 p-8">
        <h1 className="text-2xl font-bold text-[#1B3A6B] mb-6">Workers</h1>
        <AdminWorkersTable workers={workers || []} currentTab={tab} currentQ={q} />
      </main>
    </div>
  )
}
