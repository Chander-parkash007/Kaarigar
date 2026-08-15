import { createClient } from '@supabase/supabase-js'
import { AdminSidebar } from '@/components/admin/AdminSidebar'
import { BOOST_PRICE_WEEKLY, VERIFIED_PRICE_MONTHLY } from '@/lib/constants'
import Link from 'next/link'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
)

export default async function AdminDashboardPage() {
  const now = new Date().toISOString()
  const startOfMonth = new Date(new Date().getFullYear(), new Date().getMonth(), 1).toISOString()
  const startOfLastMonth = new Date(new Date().getFullYear(), new Date().getMonth() - 1, 1).toISOString()
  const endOfLastMonth = new Date(new Date().getFullYear(), new Date().getMonth(), 0, 23, 59, 59).toISOString()

  const [
    { count: totalWorkers },
    { count: activeWorkers },
    { count: boostedWorkers },
    { count: verifiedWorkers },
    { count: pendingPayments },
    { count: newWorkersThisMonth },
    { data: approvedPayments },
    { data: approvedLastMonth },
    { data: recentLogs },
    { count: totalBookings },
    { count: pendingBookings },
  ] = await Promise.all([
    supabase.from('workers').select('id', { count: 'exact', head: true }),
    supabase.from('workers').select('id', { count: 'exact', head: true }).eq('status', 'active'),
    supabase.from('workers').select('id', { count: 'exact', head: true }).gt('boost_expires_at', now),
    supabase.from('workers').select('id', { count: 'exact', head: true }).gt('verified_expires_at', now),
    supabase.from('payment_requests').select('id', { count: 'exact', head: true }).eq('status', 'pending'),
    supabase.from('workers').select('id', { count: 'exact', head: true }).gte('created_at', startOfMonth),
    supabase.from('payment_requests').select('payment_type').eq('status', 'approved').gte('reviewed_at', startOfMonth),
    supabase.from('payment_requests').select('payment_type').eq('status', 'approved').gte('reviewed_at', startOfLastMonth).lte('reviewed_at', endOfLastMonth),
    supabase.from('activity_logs').select('*').order('created_at', { ascending: false }).limit(5),
    supabase.from('bookings').select('id', { count: 'exact', head: true }),
    supabase.from('bookings').select('id', { count: 'exact', head: true }).eq('status', 'pending'),
  ])

  // Calculate revenue
  const calcRevenue = (payments: { payment_type: string }[] | null) => {
    if (!payments) return 0
    return payments.reduce((sum, p) => {
      return sum + (p.payment_type === 'boost' ? BOOST_PRICE_WEEKLY : VERIFIED_PRICE_MONTHLY)
    }, 0)
  }

  const revenueThisMonth = calcRevenue(approvedPayments)
  const revenueLastMonth = calcRevenue(approvedLastMonth)
  const revenueGrowth = revenueLastMonth > 0
    ? Math.round(((revenueThisMonth - revenueLastMonth) / revenueLastMonth) * 100)
    : revenueThisMonth > 0 ? 100 : 0

  const stats = [
    { label: 'Total Karigars', value: totalWorkers || 0, sub: `${activeWorkers || 0} active`, icon: '👷', color: 'bg-blue-50 border-blue-200 text-blue-700' },
    { label: 'Active Boosts', value: boostedWorkers || 0, sub: `${verifiedWorkers || 0} verified`, icon: '⭐', color: 'bg-orange-50 border-orange-200 text-orange-700' },
    { label: 'This Month Revenue', value: `Rs. ${revenueThisMonth.toLocaleString()}`, sub: `${revenueGrowth >= 0 ? '↑' : '↓'} ${Math.abs(revenueGrowth)}% vs last month`, icon: '💰', color: 'bg-green-50 border-green-200 text-green-700' },
    { label: 'Pending Reviews', value: pendingPayments || 0, sub: 'Payments awaiting action', icon: '⏳', color: 'bg-yellow-50 border-yellow-200 text-yellow-700' },
  ]

  const ACTION_COLORS: Record<string, string> = {
    BOOST_APPLIED: 'bg-orange-100 text-orange-700',
    VERIFIED_APPLIED: 'bg-green-100 text-green-700',
    DEACTIVATED: 'bg-red-100 text-red-700',
    ACTIVATED: 'bg-blue-100 text-blue-700',
    PAYMENT_REJECTED: 'bg-gray-100 text-gray-600',
  }

  return (
    <div className="flex">
      <AdminSidebar />
      <main className="flex-1 p-6 md:p-8 overflow-auto">
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-2xl font-bold text-[#1B3A6B]">Dashboard</h1>
          <p className="text-sm text-gray-400">{new Date().toLocaleDateString('en-PK', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</p>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
          {stats.map(stat => (
            <div key={stat.label} className={`rounded-xl border p-5 ${stat.color.split(' ').slice(0, 2).join(' ')}`}>
              <div className="flex items-start justify-between mb-3">
                <div className="text-3xl">{stat.icon}</div>
              </div>
              <div className="text-2xl font-bold text-[#1B3A6B]">{stat.value}</div>
              <div className="text-sm font-medium text-gray-600 mt-0.5">{stat.label}</div>
              <div className="text-xs text-gray-400 mt-0.5">{stat.sub}</div>
            </div>
          ))}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
          {/* Revenue Breakdown */}
          <div className="bg-white rounded-xl border border-gray-200 p-5">
            <h2 className="font-semibold text-[#1B3A6B] mb-4">💰 Revenue Breakdown</h2>
            <div className="space-y-3">
              <div className="flex items-center justify-between py-2 border-b border-gray-100">
                <div>
                  <p className="text-sm font-medium text-gray-700">This Month</p>
                  <p className="text-xs text-gray-400">{approvedPayments?.length || 0} payments approved</p>
                </div>
                <p className="text-lg font-bold text-green-600">Rs. {revenueThisMonth.toLocaleString()}</p>
              </div>
              <div className="flex items-center justify-between py-2 border-b border-gray-100">
                <div>
                  <p className="text-sm font-medium text-gray-700">Last Month</p>
                  <p className="text-xs text-gray-400">{approvedLastMonth?.length || 0} payments approved</p>
                </div>
                <p className="text-lg font-bold text-gray-600">Rs. {revenueLastMonth.toLocaleString()}</p>
              </div>
              <div className="flex items-center justify-between py-2">
                <p className="text-sm font-medium text-gray-700">Growth</p>
                <p className={`text-sm font-bold ${revenueGrowth >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                  {revenueGrowth >= 0 ? '↑' : '↓'} {Math.abs(revenueGrowth)}%
                </p>
              </div>
            </div>
            <div className="mt-4 pt-4 border-t border-gray-100 grid grid-cols-2 gap-3 text-center">
              <div className="bg-orange-50 rounded-lg p-3">
                <p className="text-xs text-gray-500">Boosts</p>
                <p className="font-bold text-orange-600">
                  {approvedPayments?.filter(p => p.payment_type === 'boost').length || 0}
                </p>
              </div>
              <div className="bg-green-50 rounded-lg p-3">
                <p className="text-xs text-gray-500">Verified</p>
                <p className="font-bold text-green-600">
                  {approvedPayments?.filter(p => p.payment_type === 'verified_badge').length || 0}
                </p>
              </div>
            </div>
          </div>

          {/* Growth Stats */}
          <div className="bg-white rounded-xl border border-gray-200 p-5">
            <h2 className="font-semibold text-[#1B3A6B] mb-4">📈 Growth</h2>
            <div className="space-y-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center text-xl">👷</div>
                <div className="flex-1">
                  <p className="text-sm font-medium text-gray-700">New Karigars This Month</p>
                  <p className="text-2xl font-bold text-[#1B3A6B]">{newWorkersThisMonth || 0}</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center text-xl">📋</div>
                <div className="flex-1">
                  <p className="text-sm font-medium text-gray-700">Total Bookings</p>
                  <p className="text-2xl font-bold text-[#1B3A6B]">{totalBookings || 0}</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-yellow-100 rounded-lg flex items-center justify-center text-xl">⏳</div>
                <div className="flex-1">
                  <p className="text-sm font-medium text-gray-700">Pending Bookings</p>
                  <p className="text-2xl font-bold text-[#1B3A6B]">{pendingBookings || 0}</p>
                </div>
              </div>
            </div>
            <div className="mt-4 pt-4 border-t border-gray-100">
              <Link href="/admin/bookings" className="text-sm text-[#FF6B00] hover:underline font-medium">
                View all bookings →
              </Link>
            </div>
          </div>

          {/* Quick Actions */}
          <div className="bg-white rounded-xl border border-gray-200 p-5">
            <h2 className="font-semibold text-[#1B3A6B] mb-4">⚡ Quick Actions</h2>
            <div className="space-y-2">
              {[
                { href: '/admin/pending', label: `Review ${pendingPayments || 0} Pending Payments`, icon: '💰', urgent: (pendingPayments || 0) > 0 },
                { href: '/admin/workers', label: 'Manage Karigars', icon: '👷', urgent: false },
                { href: '/admin/bookings', label: `${pendingBookings || 0} Booking Requests`, icon: '📋', urgent: (pendingBookings || 0) > 0 },
                { href: '/admin/logs', label: 'View Activity Log', icon: '📊', urgent: false },
              ].map(action => (
                <Link
                  key={action.href}
                  href={action.href}
                  className={`flex items-center gap-3 p-3 rounded-lg transition-colors ${
                    action.urgent
                      ? 'bg-yellow-50 border border-yellow-200 hover:bg-yellow-100'
                      : 'hover:bg-gray-50 border border-transparent'
                  }`}
                >
                  <span className="text-xl">{action.icon}</span>
                  <span className={`text-sm font-medium ${action.urgent ? 'text-yellow-800' : 'text-gray-700'}`}>
                    {action.label}
                  </span>
                  {action.urgent && <span className="ml-auto w-2 h-2 bg-yellow-500 rounded-full" />}
                </Link>
              ))}
            </div>
          </div>
        </div>

        {/* Recent Activity */}
        <div className="bg-white rounded-xl border border-gray-200 p-5">
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-semibold text-[#1B3A6B]">🕐 Recent Activity</h2>
            <Link href="/admin/logs" className="text-sm text-[#FF6B00] hover:underline">View all →</Link>
          </div>
          {!recentLogs || recentLogs.length === 0 ? (
            <p className="text-gray-400 text-sm text-center py-4">No activity yet.</p>
          ) : (
            <div className="space-y-2">
              {recentLogs.map((log: any) => (
                <div key={log.id} className="flex items-center gap-3 py-2 border-b border-gray-50 last:border-0">
                  <span className={`px-2 py-0.5 rounded text-xs font-medium ${ACTION_COLORS[log.action_type] || 'bg-gray-100 text-gray-600'}`}>
                    {log.action_type}
                  </span>
                  <span className="text-sm text-gray-600 flex-1">{log.action_description}</span>
                  <span className="text-xs text-gray-400 whitespace-nowrap">
                    {new Date(log.created_at).toLocaleTimeString('en-PK', { hour: '2-digit', minute: '2-digit' })}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Pending payment alert */}
        {(pendingPayments || 0) > 0 && (
          <div className="mt-4 bg-yellow-50 border border-yellow-300 rounded-xl p-4 flex items-center gap-3">
            <span className="text-2xl">⚠️</span>
            <div className="flex-1">
              <p className="font-semibold text-yellow-800">{pendingPayments} payment request{pendingPayments !== 1 ? 's' : ''} awaiting review</p>
              <p className="text-yellow-700 text-xs">Approve or reject to keep karigars happy</p>
            </div>
            <Link href="/admin/pending" className="bg-yellow-500 text-white px-4 py-2 rounded-lg text-sm font-semibold hover:bg-yellow-600 transition-colors">
              Review Now
            </Link>
          </div>
        )}
      </main>
    </div>
  )
}
