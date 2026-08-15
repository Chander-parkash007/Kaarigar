'use client'
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { Button } from '@/components/ui/Button'
import { CATEGORIES } from '@/lib/constants'

interface Booking {
  id: string
  worker_id: string
  customer_name: string
  customer_phone: string
  service_description: string
  preferred_date: string | null
  status: 'pending' | 'contacted' | 'completed' | 'cancelled'
  created_at: string
  worker?: { id: string; full_name: string; phone: string; category: string; city: string } | null
}

interface Props {
  bookings: Booking[]
  currentStatus: string
}

const STATUS_TABS = [
  { key: 'pending', label: '⏳ Pending', color: 'text-yellow-700 bg-yellow-100' },
  { key: 'contacted', label: '📞 Contacted', color: 'text-blue-700 bg-blue-100' },
  { key: 'completed', label: '✅ Completed', color: 'text-green-700 bg-green-100' },
  { key: 'cancelled', label: '❌ Cancelled', color: 'text-red-700 bg-red-100' },
  { key: 'all', label: 'All', color: 'text-gray-700 bg-gray-100' },
]

export function AdminBookingsList({ bookings, currentStatus }: Props) {
  const router = useRouter()
  const [loading, setLoading] = useState<string | null>(null)

  async function updateStatus(bookingId: string, newStatus: string) {
    setLoading(bookingId)
    try {
      const res = await fetch('/api/admin/bookings', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ bookingId, status: newStatus }),
      })
      if (res.ok) router.refresh()
      else alert('Failed to update status')
    } catch { alert('Network error') }
    finally { setLoading(null) }
  }

  return (
    <div>
      {/* Tabs */}
      <div className="flex gap-2 mb-5 flex-wrap">
        {STATUS_TABS.map(tab => (
          <button
            key={tab.key}
            onClick={() => router.push(`/admin/bookings?status=${tab.key}`)}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
              currentStatus === tab.key
                ? 'bg-[#1B3A6B] text-white'
                : 'bg-white border border-gray-200 text-gray-600 hover:bg-gray-50'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {bookings.length === 0 ? (
        <div className="bg-white rounded-xl border border-gray-200 p-12 text-center">
          <div className="text-4xl mb-3">📋</div>
          <p className="font-semibold text-gray-600">No booking requests</p>
          <p className="text-gray-400 text-sm mt-1">Booking requests from customers will appear here</p>
        </div>
      ) : (
        <div className="space-y-4">
          {bookings.map(booking => {
            const cat = CATEGORIES.find(c => c.value === booking.worker?.category)
            const statusStyle = STATUS_TABS.find(t => t.key === booking.status)?.color || 'text-gray-700 bg-gray-100'

            return (
              <div key={booking.id} className="bg-white rounded-xl border border-gray-200 p-5">
                <div className="flex flex-col md:flex-row gap-4">
                  <div className="flex-1">
                    {/* Customer info */}
                    <div className="flex items-start justify-between gap-3 mb-3">
                      <div>
                        <p className="font-semibold text-[#1B3A6B] text-lg">{booking.customer_name}</p>
                        <a href={`tel:${booking.customer_phone}`} className="text-[#FF6B00] text-sm font-medium hover:underline">
                          📞 {booking.customer_phone}
                        </a>
                      </div>
                      <span className={`px-3 py-1 rounded-full text-xs font-semibold ${statusStyle}`}>
                        {booking.status}
                      </span>
                    </div>

                    {/* Service description */}
                    <p className="text-gray-700 text-sm bg-gray-50 rounded-lg p-3 mb-3">
                      &ldquo;{booking.service_description}&rdquo;
                    </p>

                    <div className="flex flex-wrap gap-4 text-xs text-gray-500">
                      {booking.preferred_date && (
                        <span>📅 Preferred: {booking.preferred_date}</span>
                      )}
                      <span>🕐 {new Date(booking.created_at).toLocaleString('en-PK')}</span>
                    </div>

                    {/* Worker info */}
                    {booking.worker && (
                      <div className="mt-3 pt-3 border-t border-gray-100 flex items-center justify-between">
                        <div className="text-sm text-gray-600">
                          <span className="font-medium">For: </span>
                          {cat?.icon} {booking.worker.full_name} — {booking.worker.city}
                        </div>
                        <Link href={`/admin/workers/${booking.worker.id}`}
                          className="text-xs text-[#1B3A6B] hover:underline">
                          View karigar →
                        </Link>
                      </div>
                    )}
                  </div>

                  {/* Actions */}
                  {booking.status === 'pending' && (
                    <div className="flex md:flex-col gap-2 md:justify-start">
                      <Button size="sm" variant="primary"
                        loading={loading === booking.id}
                        onClick={() => updateStatus(booking.id, 'contacted')}>
                        📞 Mark Contacted
                      </Button>
                      <Button size="sm" variant="outline"
                        loading={loading === booking.id}
                        onClick={() => updateStatus(booking.id, 'completed')}>
                        ✅ Completed
                      </Button>
                      <Button size="sm" variant="danger"
                        loading={loading === booking.id}
                        onClick={() => updateStatus(booking.id, 'cancelled')}>
                        ❌ Cancel
                      </Button>
                    </div>
                  )}
                  {booking.status === 'contacted' && (
                    <div className="flex md:flex-col gap-2">
                      <Button size="sm" variant="primary"
                        loading={loading === booking.id}
                        onClick={() => updateStatus(booking.id, 'completed')}>
                        ✅ Mark Completed
                      </Button>
                    </div>
                  )}
                </div>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}
