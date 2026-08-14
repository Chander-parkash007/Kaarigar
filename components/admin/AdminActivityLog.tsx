'use client'
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { ActivityLog } from '@/lib/types'
import { Button } from '@/components/ui/Button'

const ACTION_COLORS: Record<string, string> = {
  BOOST_APPLIED: 'bg-orange-100 text-orange-700',
  VERIFIED_APPLIED: 'bg-green-100 text-green-700',
  DEACTIVATED: 'bg-red-100 text-red-700',
  ACTIVATED: 'bg-blue-100 text-blue-700',
  PAYMENT_REJECTED: 'bg-gray-100 text-gray-600',
}

interface Props {
  logs: ActivityLog[]
  currentAdmin?: string
  currentFrom?: string
  currentTo?: string
}

export function AdminActivityLog({ logs, currentAdmin, currentFrom, currentTo }: Props) {
  const router = useRouter()
  const [admin, setAdmin] = useState(currentAdmin || '')
  const [from, setFrom] = useState(currentFrom || '')
  const [to, setTo] = useState(currentTo || '')

  function applyFilters(e: React.FormEvent) {
    e.preventDefault()
    const params = new URLSearchParams()
    if (admin) params.set('admin', admin)
    if (from) params.set('from', from)
    if (to) params.set('to', to)
    router.push(`/admin/logs?${params.toString()}`)
  }

  function reset() {
    setAdmin('')
    setFrom('')
    setTo('')
    router.push('/admin/logs')
  }

  return (
    <div>
      {/* Filters */}
      <form onSubmit={applyFilters} className="bg-white rounded-xl border border-gray-200 p-4 mb-6 flex flex-wrap gap-4 items-end">
        <div>
          <label className="text-xs font-medium text-gray-500 block mb-1">Admin Username</label>
          <input
            value={admin}
            onChange={e => setAdmin(e.target.value)}
            placeholder="Filter by admin..."
            className="px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#1B3A6B] w-48"
          />
        </div>
        <div>
          <label className="text-xs font-medium text-gray-500 block mb-1">From Date</label>
          <input
            type="date"
            value={from}
            onChange={e => setFrom(e.target.value)}
            className="px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#1B3A6B]"
          />
        </div>
        <div>
          <label className="text-xs font-medium text-gray-500 block mb-1">To Date</label>
          <input
            type="date"
            value={to}
            onChange={e => setTo(e.target.value)}
            className="px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#1B3A6B]"
          />
        </div>
        <Button type="submit" variant="primary" size="sm">Apply</Button>
        <Button type="button" variant="ghost" size="sm" onClick={reset}>Reset</Button>
      </form>

      {/* Log table */}
      {logs.length === 0 ? (
        <div className="bg-white rounded-xl border border-gray-200 p-10 text-center text-gray-500">
          No activity logs found.
        </div>
      ) : (
        <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
          <table className="w-full text-sm">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="text-left px-4 py-3 font-semibold text-gray-600">Timestamp</th>
                <th className="text-left px-4 py-3 font-semibold text-gray-600">Admin</th>
                <th className="text-left px-4 py-3 font-semibold text-gray-600">Action</th>
                <th className="text-left px-4 py-3 font-semibold text-gray-600 hidden md:table-cell">Worker</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {logs.map(log => (
                <tr key={log.id} className="hover:bg-gray-50">
                  <td className="px-4 py-3 text-gray-500 text-xs whitespace-nowrap">
                    {new Date(log.created_at).toLocaleString('en-PK', {
                      day: '2-digit', month: 'short', year: 'numeric',
                      hour: '2-digit', minute: '2-digit',
                    })}
                  </td>
                  <td className="px-4 py-3 font-medium text-[#1B3A6B]">
                    {log.admin_username}
                  </td>
                  <td className="px-4 py-3">
                    <div>
                      <span className={`inline-flex px-2 py-0.5 rounded text-xs font-medium ${ACTION_COLORS[log.action_type] || 'bg-gray-100 text-gray-600'}`}>
                        {log.action_type}
                      </span>
                      <p className="text-gray-500 text-xs mt-0.5">{log.action_description}</p>
                    </div>
                  </td>
                  <td className="px-4 py-3 hidden md:table-cell">
                    {log.worker_name ? (
                      <span className="text-gray-600">{log.worker_name}</span>
                    ) : (
                      <span className="text-gray-400">—</span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}
