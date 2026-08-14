import { createClient } from '@supabase/supabase-js'
import { AdminSidebar } from '@/components/admin/AdminSidebar'
import { AdminActivityLog } from '@/components/admin/AdminActivityLog'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
)

interface Props {
  searchParams: Promise<{ admin?: string; from?: string; to?: string }>
}

export default async function AdminLogsPage({ searchParams }: Props) {
  const { admin, from, to } = await searchParams

  let query = supabase
    .from('activity_logs')
    .select('*')
    .order('created_at', { ascending: false })
    .limit(200)

  if (admin) query = query.eq('admin_username', admin)
  if (from) query = query.gte('created_at', new Date(from).toISOString())
  if (to) {
    const toDate = new Date(to)
    toDate.setHours(23, 59, 59, 999)
    query = query.lte('created_at', toDate.toISOString())
  }

  const { data: logs } = await query

  return (
    <div className="flex">
      <AdminSidebar />
      <main className="flex-1 p-8">
        <h1 className="text-2xl font-bold text-[#1B3A6B] mb-6">Activity Log</h1>
        <AdminActivityLog logs={logs || []} currentAdmin={admin} currentFrom={from} currentTo={to} />
      </main>
    </div>
  )
}
