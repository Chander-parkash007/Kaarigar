import { createClient } from '@supabase/supabase-js'
import { AdminSidebar } from '@/components/admin/AdminSidebar'
import { AdminPendingList } from '@/components/admin/AdminPendingList'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
)

export default async function AdminPendingPage() {
  const { data: requests } = await supabase
    .from('payment_requests')
    .select('*, worker:workers(id, full_name, phone, category, city)')
    .eq('status', 'pending')
    .order('created_at', { ascending: false })

  return (
    <div className="flex">
      <AdminSidebar />
      <main className="flex-1 p-8">
        <h1 className="text-2xl font-bold text-[#1B3A6B] mb-6">
          Pending Payments ({requests?.length || 0})
        </h1>
        <AdminPendingList requests={requests || []} />
      </main>
    </div>
  )
}
