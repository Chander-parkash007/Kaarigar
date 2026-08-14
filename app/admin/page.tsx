import { createClient } from '@supabase/supabase-js'
import { AdminSidebar } from '@/components/admin/AdminSidebar'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
)

export default async function AdminDashboardPage() {
  const now = new Date().toISOString()

  const [
    { count: totalWorkers },
    { count: boostedWorkers },
    { count: verifiedWorkers },
    { count: pendingPayments },
  ] = await Promise.all([
    supabase.from('workers').select('id', { count: 'exact', head: true }).eq('status', 'active'),
    supabase.from('workers').select('id', { count: 'exact', head: true }).gt('boost_expires_at', now),
    supabase.from('workers').select('id', { count: 'exact', head: true }).gt('verified_expires_at', now),
    supabase.from('payment_requests').select('id', { count: 'exact', head: true }).eq('status', 'pending'),
  ])

  const stats = [
    { label: 'Total Workers', value: totalWorkers || 0, icon: '👷', color: 'bg-blue-50 border-blue-200' },
    { label: 'Active Boosts', value: boostedWorkers || 0, icon: '⭐', color: 'bg-orange-50 border-orange-200' },
    { label: 'Verified Workers', value: verifiedWorkers || 0, icon: '✅', color: 'bg-green-50 border-green-200' },
    { label: 'Pending Payments', value: pendingPayments || 0, icon: '💰', color: 'bg-yellow-50 border-yellow-200' },
  ]

  return (
    <div className="flex">
      <AdminSidebar />
      <main className="flex-1 p-8">
        <h1 className="text-2xl font-bold text-[#1B3A6B] mb-6">Dashboard</h1>

        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          {stats.map(stat => (
            <div key={stat.label} className={`rounded-xl border p-5 ${stat.color}`}>
              <div className="text-3xl mb-2">{stat.icon}</div>
              <div className="text-3xl font-bold text-[#2D2D2D]">{stat.value}</div>
              <div className="text-sm text-gray-500 mt-0.5">{stat.label}</div>
            </div>
          ))}
        </div>

        {(pendingPayments || 0) > 0 && (
          <div className="bg-yellow-50 border border-yellow-300 rounded-xl p-4 flex items-center gap-3">
            <span className="text-2xl">⚠️</span>
            <div>
              <p className="font-semibold text-yellow-800">{pendingPayments} payment request{pendingPayments !== 1 ? 's' : ''} awaiting review</p>
              <a href="/admin/pending" className="text-yellow-700 text-sm hover:underline">Review now →</a>
            </div>
          </div>
        )}
      </main>
    </div>
  )
}
