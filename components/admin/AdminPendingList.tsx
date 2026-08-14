'use client'
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Image from 'next/image'
import { PaymentRequest } from '@/lib/types'
import { Button } from '@/components/ui/Button'
import { ConfirmDialog } from '@/components/ui/ConfirmDialog'
import { formatDate } from '@/lib/utils'
import { CATEGORIES } from '@/lib/constants'
import Link from 'next/link'

interface Props {
  requests: (PaymentRequest & { worker?: { id: string; full_name: string; phone: string; category: string; city: string } | null })[]
}

interface Confirm {
  request: PaymentRequest & { worker?: any }
  action: 'approve' | 'reject'
}

export function AdminPendingList({ requests }: Props) {
  const router = useRouter()
  const [confirm, setConfirm] = useState<Confirm | null>(null)
  const [loading, setLoading] = useState(false)

  async function execute() {
    if (!confirm) return
    setLoading(true)
    try {
      const action = confirm.action === 'approve'
        ? (confirm.request.payment_type === 'boost' ? 'boost' : 'verify')
        : 'reject_payment'

      const res = await fetch('/api/admin/workers/action', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          workerId: confirm.request.worker_id,
          workerName: confirm.request.worker?.full_name || 'Unknown',
          action,
          paymentId: confirm.request.id,
        }),
      })
      if (res.ok) router.refresh()
      else alert('Action failed')
    } catch { alert('Network error') }
    finally { setLoading(false); setConfirm(null) }
  }

  if (requests.length === 0) {
    return (
      <div className="bg-white rounded-xl border border-gray-200 p-12 text-center">
        <div className="text-4xl mb-3">✅</div>
        <h3 className="font-semibold text-[#2D2D2D]">All caught up!</h3>
        <p className="text-gray-500 text-sm mt-1">No pending payment requests.</p>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      {requests.map(request => {
        const cat = CATEGORIES.find(c => c.value === request.worker?.category)
        return (
          <div key={request.id} className="bg-white rounded-xl border border-gray-200 p-5">
            <div className="flex flex-col md:flex-row gap-5">
              {/* Screenshot */}
              <a href={request.screenshot_url} target="_blank" rel="noopener noreferrer"
                className="relative w-full md:w-48 h-32 rounded-lg overflow-hidden border border-gray-200 flex-shrink-0 block">
                <Image src={request.screenshot_url} alt="Payment screenshot" fill className="object-cover" sizes="192px" />
                <div className="absolute inset-0 bg-black/20 flex items-center justify-center text-white text-xs font-medium">
                  Click to enlarge
                </div>
              </a>

              {/* Details */}
              <div className="flex-1">
                <div className="flex items-start justify-between gap-3 flex-wrap">
                  <div>
                    <h3 className="font-semibold text-[#2D2D2D] text-lg">
                      {request.worker?.full_name || 'Unknown Worker'}
                    </h3>
                    <p className="text-gray-500 text-sm">
                      {cat?.icon} {cat?.label || request.worker?.category} • {request.worker?.city}
                    </p>
                    <p className="text-gray-400 text-xs mt-0.5">{request.worker?.phone}</p>
                  </div>
                  <div className="text-right">
                    <span className={`inline-flex px-3 py-1 rounded-full text-xs font-semibold ${
                      request.payment_type === 'boost'
                        ? 'bg-orange-100 text-orange-700'
                        : 'bg-green-100 text-green-700'
                    }`}>
                      {request.payment_type === 'boost' ? '⭐ Boost (Rs. 50/week)' : '✅ Verified Badge (Rs. 100/month)'}
                    </span>
                    <p className="text-xs text-gray-400 mt-1">
                      Requested: {formatDate(request.created_at)}
                    </p>
                  </div>
                </div>

                <div className="flex gap-3 mt-4 flex-wrap">
                  <Button
                    variant="primary"
                    size="sm"
                    onClick={() => setConfirm({ request, action: 'approve' })}
                  >
                    ✅ Approve & Activate
                  </Button>
                  <Button
                    variant="danger"
                    size="sm"
                    onClick={() => setConfirm({ request, action: 'reject' })}
                  >
                    ❌ Reject
                  </Button>
                  {request.worker?.id && (
                    <Link
                      href={`/admin/workers/${request.worker.id}`}
                      className="inline-flex items-center px-3 py-1.5 text-sm text-[#1B3A6B] border border-[#1B3A6B] rounded-lg hover:bg-blue-50 transition-colors font-medium"
                    >
                      View Profile
                    </Link>
                  )}
                </div>
              </div>
            </div>
          </div>
        )
      })}

      {confirm && (
        <ConfirmDialog
          isOpen={true}
          title={confirm.action === 'approve' ? 'Approve Payment' : 'Reject Payment'}
          message={
            confirm.action === 'approve'
              ? `Approve ${confirm.request.payment_type === 'boost' ? 'Boost' : 'Verified Badge'} for ${confirm.request.worker?.full_name}? This will activate their upgrade immediately.`
              : `Reject this payment from ${confirm.request.worker?.full_name}? Their profile tier will remain unchanged.`
          }
          confirmLabel={loading ? 'Processing...' : confirm.action === 'approve' ? 'Yes, Approve' : 'Yes, Reject'}
          onConfirm={execute}
          onCancel={() => setConfirm(null)}
          variant={confirm.action === 'reject' ? 'danger' : 'primary'}
        />
      )}
    </div>
  )
}
