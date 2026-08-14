'use client'
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Worker } from '@/lib/types'
import { Badge } from '@/components/ui/Badge'
import { Button } from '@/components/ui/Button'
import { ConfirmDialog } from '@/components/ui/ConfirmDialog'
import { getEffectiveTier, formatDate } from '@/lib/utils'
import { CATEGORIES } from '@/lib/constants'
import Link from 'next/link'

const TABS = [
  { key: 'all', label: 'All' },
  { key: 'verified', label: '✅ Verified' },
  { key: 'boosted', label: '⭐ Boosted' },
  { key: 'pending', label: '⏳ Pending' },
  { key: 'free', label: 'Free' },
]

interface Props {
  workers: Worker[]
  currentTab: string
  currentQ: string
}

interface ActionState {
  type: 'boost' | 'verify' | 'deactivate' | 'activate'
  worker: Worker
}

export function AdminWorkersTable({ workers, currentTab, currentQ }: Props) {
  const router = useRouter()
  const [search, setSearch] = useState(currentQ)
  const [pending, setPending] = useState<ActionState | null>(null)
  const [loading, setLoading] = useState(false)

  function applySearch(e: React.FormEvent) {
    e.preventDefault()
    const params = new URLSearchParams({ tab: currentTab, q: search })
    router.push(`/admin/workers?${params}`)
  }

  function changeTab(tab: string) {
    router.push(`/admin/workers?tab=${tab}&q=${currentQ}`)
  }

  async function executeAction() {
    if (!pending) return
    setLoading(true)
    try {
      const res = await fetch('/api/admin/workers/action', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ workerId: pending.worker.id, workerName: pending.worker.full_name, action: pending.type }),
      })
      if (res.ok) { router.refresh() }
      else { alert('Action failed. Please try again.') }
    } catch { alert('Network error') }
    finally { setLoading(false); setPending(null) }
  }

  const actionMessages = {
    boost: (w: Worker) => `Boost profile of ${w.full_name} for 7 days?`,
    verify: (w: Worker) => `Grant Verified Badge to ${w.full_name} for 30 days?`,
    deactivate: (w: Worker) => `Deactivate ${w.full_name}'s profile? They will no longer appear in search.`,
    activate: (w: Worker) => `Reactivate ${w.full_name}'s profile? They will appear in search again.`,
  }

  return (
    <div>
      {/* Search */}
      <form onSubmit={applySearch} className="flex gap-2 mb-4">
        <input
          value={search}
          onChange={e => setSearch(e.target.value)}
          placeholder="Search by name or phone..."
          className="flex-1 px-4 py-2.5 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#1B3A6B]"
        />
        <Button type="submit" variant="primary" size="sm">Search</Button>
      </form>

      {/* Tabs */}
      <div className="flex gap-1 mb-4 flex-wrap">
        {TABS.map(tab => (
          <button
            key={tab.key}
            onClick={() => changeTab(tab.key)}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
              currentTab === tab.key
                ? 'bg-[#1B3A6B] text-white'
                : 'bg-white border border-gray-200 text-gray-600 hover:bg-gray-50'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Table */}
      {workers.length === 0 ? (
        <div className="bg-white rounded-xl border border-gray-200 p-10 text-center text-gray-500">
          No workers found.
        </div>
      ) : (
        <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
          <table className="w-full text-sm">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="text-left px-4 py-3 font-semibold text-gray-600">Worker</th>
                <th className="text-left px-4 py-3 font-semibold text-gray-600 hidden md:table-cell">Category</th>
                <th className="text-left px-4 py-3 font-semibold text-gray-600 hidden md:table-cell">City</th>
                <th className="text-left px-4 py-3 font-semibold text-gray-600">Status</th>
                <th className="text-left px-4 py-3 font-semibold text-gray-600 hidden lg:table-cell">Joined</th>
                <th className="text-right px-4 py-3 font-semibold text-gray-600">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {workers.map((worker: Worker) => {
                const tier = getEffectiveTier(worker)
                const cat = CATEGORIES.find(c => c.value === worker.category)
                return (
                  <tr key={worker.id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-4 py-3">
                      <div className="font-medium text-[#2D2D2D]">{worker.full_name}</div>
                      <div className="text-gray-400 text-xs">{worker.phone}</div>
                    </td>
                    <td className="px-4 py-3 hidden md:table-cell text-gray-600">
                      {cat?.icon} {cat?.label || worker.category}
                    </td>
                    <td className="px-4 py-3 hidden md:table-cell text-gray-600">{worker.city}</td>
                    <td className="px-4 py-3">
                      <Badge variant={worker.status === 'inactive' ? 'rejected' : tier} />
                    </td>
                    <td className="px-4 py-3 hidden lg:table-cell text-gray-400 text-xs">
                      {formatDate(worker.created_at)}
                    </td>
                    <td className="px-4 py-3 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <Link
                          href={`/admin/workers/${worker.id}`}
                          className="text-xs text-[#1B3A6B] hover:underline font-medium"
                        >
                          View
                        </Link>
                        <button
                          onClick={() => setPending({ type: 'boost', worker })}
                          className="text-xs text-orange-600 hover:underline font-medium"
                        >
                          Boost
                        </button>
                        <button
                          onClick={() => setPending({ type: 'verify', worker })}
                          className="text-xs text-green-700 hover:underline font-medium"
                        >
                          Verify
                        </button>
                        {worker.status === 'active' ? (
                          <button
                            onClick={() => setPending({ type: 'deactivate', worker })}
                            className="text-xs text-red-600 hover:underline font-medium"
                          >
                            Deactivate
                          </button>
                        ) : (
                          <button
                            onClick={() => setPending({ type: 'activate', worker })}
                            className="text-xs text-green-600 hover:underline font-medium"
                          >
                            Activate
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      )}

      {pending && (
        <ConfirmDialog
          isOpen={true}
          title={`Confirm: ${pending.type.charAt(0).toUpperCase() + pending.type.slice(1)}`}
          message={actionMessages[pending.type](pending.worker)}
          confirmLabel={loading ? 'Processing...' : 'Yes, Confirm'}
          onConfirm={executeAction}
          onCancel={() => setPending(null)}
          variant={pending.type === 'deactivate' ? 'danger' : 'primary'}
        />
      )}
    </div>
  )
}
