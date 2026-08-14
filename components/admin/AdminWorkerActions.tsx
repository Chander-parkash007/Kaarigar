'use client'
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Worker, PaymentRequest } from '@/lib/types'
import { Button } from '@/components/ui/Button'
import { ConfirmDialog } from '@/components/ui/ConfirmDialog'
import Image from 'next/image'

interface Props {
  worker: Worker
  pendingPayments: PaymentRequest[]
}

interface ActionState {
  type: string
  label: string
  message: string
  variant: 'primary' | 'danger'
  paymentId?: string
}

export function AdminWorkerActions({ worker, pendingPayments }: Props) {
  const router = useRouter()
  const [confirm, setConfirm] = useState<ActionState | null>(null)
  const [loading, setLoading] = useState(false)

  async function execute() {
    if (!confirm) return
    setLoading(true)
    try {
      const res = await fetch('/api/admin/workers/action', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          workerId: worker.id,
          workerName: worker.full_name,
          action: confirm.type,
          paymentId: confirm.paymentId,
        }),
      })
      if (res.ok) { router.refresh() }
      else { alert('Action failed') }
    } catch { alert('Network error') }
    finally { setLoading(false); setConfirm(null) }
  }

  const actions: ActionState[] = [
    {
      type: 'boost',
      label: '⭐ Apply Boost (7 days)',
      message: `Grant 7-day Boost to ${worker.full_name}?`,
      variant: 'primary',
    },
    {
      type: 'verify',
      label: '✅ Apply Verified Badge (30 days)',
      message: `Grant 30-day Verified Badge to ${worker.full_name}?`,
      variant: 'primary',
    },
    {
      type: 'deactivate',
      label: '🚫 Deactivate Profile',
      message: `Deactivate ${worker.full_name}'s profile? They will be hidden from all searches.`,
      variant: 'danger',
    },
  ]

  if (worker.status === 'inactive') {
    actions.push({
      type: 'activate',
      label: '✅ Reactivate Profile',
      message: `Reactivate ${worker.full_name}'s profile?`,
      variant: 'primary',
    })
  }

  return (
    <div className="space-y-4">
      {/* Manual actions */}
      <div className="bg-white rounded-xl border border-gray-200 p-4">
        <h3 className="font-semibold text-[#1B3A6B] mb-3 text-sm">Manual Actions</h3>
        <div className="space-y-2">
          {actions.map(action => (
            <button
              key={action.type}
              onClick={() => setConfirm(action)}
              className={`w-full text-left px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                action.variant === 'danger'
                  ? 'text-red-600 hover:bg-red-50'
                  : 'text-[#1B3A6B] hover:bg-blue-50'
              }`}
            >
              {action.label}
            </button>
          ))}
        </div>
      </div>

      {/* Pending payment requests */}
      {pendingPayments.length > 0 && (
        <div className="bg-yellow-50 border border-yellow-200 rounded-xl p-4">
          <h3 className="font-semibold text-yellow-800 mb-3 text-sm">⏳ Pending Payments ({pendingPayments.length})</h3>
          {pendingPayments.map(payment => (
            <div key={payment.id} className="border border-yellow-200 rounded-lg p-3 mb-2 last:mb-0 bg-white">
              <p className="text-xs font-medium text-gray-700 mb-2">
                {payment.payment_type === 'boost' ? '⭐ Boost Request' : '✅ Verified Badge Request'}
              </p>
              <a
                href={payment.screenshot_url}
                target="_blank"
                rel="noopener noreferrer"
                className="block relative w-full h-28 rounded-lg overflow-hidden mb-2 border border-gray-200"
              >
                <Image src={payment.screenshot_url} alt="Payment screenshot" fill className="object-cover" sizes="200px" />
                <div className="absolute inset-0 bg-black/20 flex items-center justify-center text-white text-xs">
                  Click to view full
                </div>
              </a>
              <div className="flex gap-2">
                <Button
                  variant="primary"
                  size="sm"
                  className="flex-1"
                  onClick={() => setConfirm({
                    type: payment.payment_type === 'boost' ? 'boost' : 'verify',
                    label: 'Approve',
                    message: `Approve this ${payment.payment_type === 'boost' ? 'Boost' : 'Verified Badge'} payment for ${worker.full_name}?`,
                    variant: 'primary',
                    paymentId: payment.id,
                  })}
                >
                  ✅ Approve
                </Button>
                <Button
                  variant="danger"
                  size="sm"
                  className="flex-1"
                  onClick={() => setConfirm({
                    type: 'reject_payment',
                    label: 'Reject',
                    message: `Reject this payment request from ${worker.full_name}?`,
                    variant: 'danger',
                    paymentId: payment.id,
                  })}
                >
                  ❌ Reject
                </Button>
              </div>
            </div>
          ))}
        </div>
      )}

      {confirm && (
        <ConfirmDialog
          isOpen={true}
          title={confirm.label}
          message={confirm.message}
          confirmLabel={loading ? 'Processing...' : 'Confirm'}
          onConfirm={execute}
          onCancel={() => setConfirm(null)}
          variant={confirm.variant}
        />
      )}
    </div>
  )
}
