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

interface BulkActionState {
  type: string
  label: string
  count: number
}

export function AdminWorkersTable({ workers, currentTab, currentQ }: Props) {
  const router = useRouter()
  const [search, setSearch] = useState(currentQ)
  const [pending, setPending] = useState<ActionState | null>(null)
  const [loading, setLoading] = useState(false)
  const [selected, setSelected] = useState<Set<string>>(new Set())
  const [bulkPending, setBulkPending] = useState<BulkActionState | null>(null)
  const [bulkLoading, setBulkLoading] = useState(false)

  function applySearch(e: React.FormEvent) {
    e.preventDefault()
    const params = new URLSearchParams({ tab: currentTab, q: search })
    router.push(`/admin/workers?${params}`)
  }

  function changeTab(tab: string) {
    setSelected(new Set())
    router.push(`/admin/workers?tab=${tab}&q=${currentQ}`)
  }

  function toggleSelect(id: string) {
    setSelected(prev => {
      const next = new Set(prev)
      next.has(id) ? next.delete(id) : next.add(id)
      return next
    })
  }

  function toggleSelectAll() {
    if (selected.size === workers.length) {
      setSelected(new Set())
    } else {
      setSelected(new Set(workers.map(w => w.id)))
    }
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

  async function executeBulkAction() {
    if (!bulkPending) return
    setBulkLoading(true)
    try {
      const res = await fetch('/api/admin/workers/bulk', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ workerIds: Array.from(selected), action: bulkPending.type }),
      })
      const data = await res.json()
      if (res.ok) {
        setSelected(new Set())
        router.refresh()
      } else {
        alert(data.error || 'Bulk action failed')
      }
    } catch { alert('Network error') }
    finally { setBulkLoading(false); setBulkPending(null) }
  }

  const actionMessages = {
    boost: (w: Worker) => `Boost profile of ${w.full_name} for 7 days?`,
    verify: (w: Worker) => `Grant Verified Badge to ${w.full_name} for 30 days?`,
    deactivate: (w: Worker) => `Deactivate ${w.full_name}'s profile? They will no longer appear in search.`,
    activate: (w: Worker) => `Reactivate ${w.full_name}'s profile? They will appear in search again.`,
  }

  const allSelected = workers.length > 0 && selected.size === workers.length
  const someSelected = selected.size > 0

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

      {/* Bulk Actions Bar */}
      {someSelected && (
        <div className="bg-[#1B3A6B] text-white rounded-xl p-3 mb-4 flex items-center gap-3 flex-wrap">
          <span className="text-sm font-medium">{selected.size} selected</span>
          <div className="flex gap-2 flex-wrap">
            <button
              onClick={() => setBulkPending({ type: 'bulk_boost', label: 'Boost', count: selected.size })}
              className="bg-orange-500 hover:bg-orange-600 text-white px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors"
            >
              ⭐ Bulk Boost
            </button>
            <button
              onClick={() => setBulkPending({ type: 'bulk_verify', label: 'Verify', count: selected.size })}
              className="bg-green-600 hover:bg-green-700 text-white px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors"
            >
              ✅ Bulk Verify
            </button>
            <button
              onClick={() => setBulkPending({ type: 'bulk_activate', label: 'Activate', count: selected.size })}
              className="bg-blue-500 hover:bg-blue-600 text-white px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors"
            >
              ▶️ Bulk Activate
            </button>
            <button
              onClick={() => setBulkPending({ type: 'bulk_deactivate', label: 'Deactivate', count: selected.size })}
              className="bg-red-500 hover:bg-red-600 text-white px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors"
            >
              🚫 Bulk Deactivate
            </button>
          </div>
          <button
            onClick={() => setSelected(new Set())}
            className="ml-auto text-blue-300 hover:text-white text-xs"
          >
            Clear selection
          </button>
        </div>
      )}

      {/* Table */}
      {workers.length === 0 ? (
        <div className="bg-white rounded-xl border border-gray-200 p-10 text-center text-gray-500">
          No karigars found.
        </div>
      ) : (
        <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
          <table className="w-full text-sm">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="px-4 py-3 w-10">
                  <input
                    type="checkbox"
                    checked={allSelected}
                    onChange={toggleSelectAll}
                    className="w-4 h-4 accent-[#1B3A6B] cursor-pointer"
                    aria-label="Select all"
                  />
                </th>
                <th className="text-left px-4 py-3 font-semibold text-gray-600">Karigar</th>
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
                const isSelected = selected.has(worker.id)
                return (
                  <tr key={worker.id} className={`hover:bg-gray-50 transition-colors ${isSelected ? 'bg-blue-50' : ''}`}>
                    <td className="px-4 py-3">
                      <input
                        type="checkbox"
                        checked={isSelected}
                        onChange={() => toggleSelect(worker.id)}
                        className="w-4 h-4 accent-[#1B3A6B] cursor-pointer"
                        aria-label={`Select ${worker.full_name}`}
                      />
                    </td>
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
                        <Link href={`/admin/workers/${worker.id}`} className="text-xs text-[#1B3A6B] hover:underline font-medium">View</Link>
                        <button onClick={() => setPending({ type: 'boost', worker })} className="text-xs text-orange-600 hover:underline font-medium">Boost</button>
                        <button onClick={() => setPending({ type: 'verify', worker })} className="text-xs text-green-700 hover:underline font-medium">Verify</button>
                        {worker.status === 'active' ? (
                          <button onClick={() => setPending({ type: 'deactivate', worker })} className="text-xs text-red-600 hover:underline font-medium">Deactivate</button>
                        ) : (
                          <button onClick={() => setPending({ type: 'activate', worker })} className="text-xs text-green-600 hover:underline font-medium">Activate</button>
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

      {/* Single action confirm */}
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

      {/* Bulk action confirm */}
      {bulkPending && (
        <ConfirmDialog
          isOpen={true}
          title={`Bulk ${bulkPending.label}`}
          message={`Apply "${bulkPending.label}" to ${bulkPending.count} selected karigars? This cannot be undone easily.`}
          confirmLabel={bulkLoading ? 'Processing...' : `Yes, ${bulkPending.label} All`}
          onConfirm={executeBulkAction}
          onCancel={() => setBulkPending(null)}
          variant={bulkPending.type === 'bulk_deactivate' ? 'danger' : 'primary'}
        />
      )}
    </div>
  )
}
