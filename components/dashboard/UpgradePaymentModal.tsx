'use client'
import { useState } from 'react'
import { Button } from '@/components/ui/Button'
import { 
  BOOST_PRICE_WEEKLY, 
  VERIFIED_PRICE_MONTHLY, 
  PAYMENT_METHODS,
  ADMIN_PAYMENT_NUMBER 
} from '@/lib/constants'

interface Props {
  isOpen: boolean
  onClose: () => void
  upgradeType: 'boost' | 'verified'
  workerName: string
}

export function UpgradePaymentModal({ isOpen, onClose, upgradeType, workerName }: Props) {
  const [paymentMethod, setPaymentMethod] = useState('easypaisa')
  const [screenshot, setScreenshot] = useState<File | null>(null)
  const [previewUrl, setPreviewUrl] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState(false)

  const price = upgradeType === 'boost' ? BOOST_PRICE_WEEKLY : VERIFIED_PRICE_MONTHLY
  const duration = upgradeType === 'boost' ? '7 days' : '30 days'
  const title = upgradeType === 'boost' ? 'Profile Boost' : 'Verified Badge'

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      if (!file.type.startsWith('image/')) {
        setError('Please upload an image file')
        return
      }
      if (file.size > 5 * 1024 * 1024) {
        setError('Image size must be less than 5MB')
        return
      }
      setScreenshot(file)
      setPreviewUrl(URL.createObjectURL(file))
      setError('')
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!screenshot) {
      setError('Please upload payment screenshot')
      return
    }

    setLoading(true)
    setError('')

    const formData = new FormData()
    formData.append('payment_type', upgradeType === 'boost' ? 'boost' : 'verified_badge')
    formData.append('payment_method', paymentMethod)
    formData.append('screenshot', screenshot)

    try {
      const response = await fetch('/api/workers/payment-request', {
        method: 'POST',
        body: formData,
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Failed to submit payment request')
      }

      setSuccess(true)
      setTimeout(() => {
        onClose()
        window.location.reload()
      }, 2000)
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Failed to submit payment request')
    } finally {
      setLoading(false)
    }
  }

  if (!isOpen) return null

  if (success) {
    return (
      <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
        <div className="bg-white rounded-xl p-6 max-w-md w-full text-center">
          <div className="text-5xl mb-4">✅</div>
          <h3 className="text-xl font-bold text-green-600 mb-2">Request Submitted!</h3>
          <p className="text-gray-600">We'll verify your payment and activate your upgrade within 24 hours.</p>
        </div>
      </div>
    )
  }

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4 overflow-y-auto">
      <div className="bg-white rounded-xl p-6 max-w-2xl w-full my-8">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-bold text-[#1B3A6B]">
            {upgradeType === 'boost' ? '🚀' : '✅'} Upgrade to {title}
          </h2>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600 text-2xl">×</button>
        </div>

        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
          <p className="font-semibold text-blue-900 mb-1">Rs. {price} for {duration}</p>
          <p className="text-sm text-blue-700">
            {upgradeType === 'boost' 
              ? '⭐ Appear higher in search results and get more customer calls' 
              : '✅ Get verified badge, appear at top of all results, build maximum trust'}
          </p>
        </div>

        <form onSubmit={handleSubmit}>
          {/* Step 1: Payment Instructions */}
          <div className="mb-6">
            <h3 className="font-semibold text-gray-900 mb-3">📋 Step 1: Send Payment</h3>
            <div className="bg-gray-50 rounded-lg p-4 space-y-3">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Select Payment Method
                </label>
                <div className="grid grid-cols-3 gap-2">
                  {PAYMENT_METHODS.map(method => (
                    <button
                      key={method.value}
                      type="button"
                      onClick={() => setPaymentMethod(method.value)}
                      className={`p-3 rounded-lg border-2 text-center transition-colors ${
                        paymentMethod === method.value
                          ? 'border-[#FF6B00] bg-orange-50'
                          : 'border-gray-200 hover:border-gray-300'
                      }`}
                    >
                      <div className="text-2xl mb-1">{method.icon}</div>
                      <div className="text-xs font-medium">{method.label}</div>
                    </button>
                  ))}
                </div>
              </div>

              <div className="bg-white rounded-lg p-4 border-2 border-green-500">
                <p className="text-sm font-semibold text-gray-900 mb-2">
                  Send Rs. {price} to:
                </p>
                <p className="text-2xl font-bold text-green-600 mb-1">{ADMIN_PAYMENT_NUMBER}</p>
                <p className="text-xs text-gray-600">
                  {paymentMethod === 'easypaisa' && 'Send via Easypaisa app or agent'}
                  {paymentMethod === 'jazzcash' && 'Send via JazzCash app or agent'}
                  {paymentMethod === 'bank' && 'Transfer to our bank account'}
                </p>
              </div>
            </div>
          </div>

          {/* Step 2: Upload Screenshot */}
          <div className="mb-6">
            <h3 className="font-semibold text-gray-900 mb-3">📸 Step 2: Upload Payment Screenshot</h3>
            <div className="bg-gray-50 rounded-lg p-4">
                <label className="block cursor-pointer">
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleFileChange}
                  className="hidden"
                />
                <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center cursor-pointer hover:border-[#FF6B00] transition-colors">
                  {previewUrl ? (
                    <div className="space-y-2">
                      <img src={previewUrl} alt="Payment screenshot" className="max-h-48 mx-auto rounded" />
                      <p className="text-sm text-gray-600">Click to change screenshot</p>
                    </div>
                  ) : (
                    <>
                      <div className="text-4xl mb-2">📷</div>
                      <p className="text-sm text-gray-600 mb-1">Click to upload payment screenshot</p>
                      <p className="text-xs text-gray-500">JPEG or PNG, max 5MB</p>
                    </>
                  )}
                </div>
              </label>
            </div>
          </div>

          {error && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-3 mb-4 text-sm text-red-700">
              {error}
            </div>
          )}

          <div className="flex gap-3">
            <Button type="button" variant="outline" onClick={onClose} className="flex-1" disabled={loading}>
              Cancel
            </Button>
            <Button type="submit" className="flex-1" loading={loading} disabled={!screenshot}>
              {loading ? 'Submitting...' : 'Submit for Approval'}
            </Button>
          </div>

          <p className="text-xs text-gray-500 text-center mt-4">
            ✅ We verify payments within 24 hours. You'll receive a confirmation once approved.
          </p>
        </form>
      </div>
    </div>
  )
}
