'use client'
import { useState } from 'react'

interface Props {
  customerName: string
}

export function VerifyEmailBanner({ customerName }: Props) {
  const [open, setOpen] = useState(false)
  const [email, setEmail] = useState('')
  const [otp, setOtp] = useState('')
  const [step, setStep] = useState<'email' | 'otp'>('email')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState(false)
  const [dismissed, setDismissed] = useState(false)

  if (dismissed) return null

  async function sendOTP() {
    setError('')
    if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      setError('Please enter a valid email address')
      return
    }
    setLoading(true)
    try {
      const res = await fetch('/api/customers/send-otp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error)
      setStep('otp')
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to send OTP')
    } finally {
      setLoading(false)
    }
  }

  async function verifyOTP() {
    setError('')
    if (!otp || otp.length !== 6) { setError('Enter the 6-digit code'); return }
    setLoading(true)
    try {
      const res = await fetch('/api/customers/verify-otp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ otp }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error)
      setSuccess(true)
      setTimeout(() => window.location.reload(), 1500)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Verification failed')
    } finally {
      setLoading(false)
    }
  }

  return (
    <>
      {/* Banner */}
      <div className="bg-yellow-50 border-b border-yellow-300 px-4 py-3">
        <div className="max-w-6xl mx-auto flex items-center justify-between gap-3 flex-wrap">
          <div className="flex items-center gap-2">
            <span className="text-yellow-600 text-lg">⚠️</span>
            <div>
              <p className="text-yellow-800 text-sm font-semibold">
                آپکا اکاؤنٹ مکمل تصدیق شدہ نہیں ہے
              </p>
              <p className="text-yellow-700 text-xs">
                Your account is not fully verified. You can use KaariGar but cannot write reviews.{' '}
                <button onClick={() => setOpen(true)} className="font-bold underline hover:text-yellow-900">
                  Verify in 2 mins →
                </button>
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button onClick={() => setOpen(true)}
              className="bg-yellow-500 hover:bg-yellow-600 text-white text-xs font-semibold px-4 py-1.5 rounded-lg transition-colors">
              ✅ Verify Now
            </button>
            <button onClick={() => setDismissed(true)} className="text-yellow-500 hover:text-yellow-700 text-lg">×</button>
          </div>
        </div>
      </div>

      {/* Verification Modal */}
      {open && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-xl">
            {success ? (
              <div className="text-center py-4">
                <div className="text-5xl mb-3">✅</div>
                <h3 className="text-xl font-bold text-green-600">Email Verified!</h3>
                <p className="text-gray-600 text-sm mt-1">You can now write reviews. Reloading...</p>
              </div>
            ) : (
              <>
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <h2 className="text-xl font-bold text-[#1B3A6B]">
                      {step === 'email' ? '📧 Verify Your Email' : '🔢 Enter OTP Code'}
                    </h2>
                    <p className="text-gray-500 text-sm mt-0.5">
                      {step === 'email'
                        ? 'Enter your email to receive a verification code'
                        : `6-digit code sent to ${email}`}
                    </p>
                  </div>
                  <button onClick={() => setOpen(false)} className="text-gray-400 hover:text-gray-600 text-2xl">×</button>
                </div>

                {/* Progress */}
                <div className="flex items-center gap-2 mb-5">
                  <div className={`flex-1 h-1.5 rounded-full ${step === 'email' ? 'bg-[#FF6B00]' : 'bg-green-500'}`} />
                  <div className={`flex-1 h-1.5 rounded-full ${step === 'otp' ? 'bg-[#FF6B00]' : 'bg-gray-200'}`} />
                </div>

                {step === 'email' ? (
                  <div className="space-y-4">
                    <div>
                      <label className="text-sm font-medium text-gray-700 block mb-1">Email Address</label>
                      <input
                        type="email"
                        value={email}
                        onChange={e => setEmail(e.target.value)}
                        placeholder="yourname@gmail.com"
                        className="w-full px-4 py-3 border border-gray-300 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#1B3A6B]"
                        onKeyDown={e => e.key === 'Enter' && sendOTP()}
                      />
                    </div>
                    {error && <p className="text-red-600 text-sm bg-red-50 p-2 rounded-lg">{error}</p>}
                    <button onClick={sendOTP} disabled={loading}
                      className="w-full bg-[#1B3A6B] hover:bg-[#152d55] text-white py-3 rounded-xl font-semibold text-sm transition-colors disabled:opacity-50">
                      {loading ? 'Sending...' : 'Send Verification Code →'}
                    </button>
                  </div>
                ) : (
                  <div className="space-y-4">
                    <div>
                      <label className="text-sm font-medium text-gray-700 block mb-1">
                        6-Digit Code
                      </label>
                      <input
                        type="text"
                        value={otp}
                        onChange={e => setOtp(e.target.value.replace(/\D/g, '').slice(0, 6))}
                        placeholder="123456"
                        className="w-full px-4 py-3 border border-gray-300 rounded-xl text-sm text-center text-2xl tracking-widest font-bold focus:outline-none focus:ring-2 focus:ring-[#1B3A6B]"
                        maxLength={6}
                        onKeyDown={e => e.key === 'Enter' && verifyOTP()}
                      />
                      <p className="text-xs text-gray-500 mt-1 text-center">⏰ Code expires in 10 minutes</p>
                    </div>
                    {error && <p className="text-red-600 text-sm bg-red-50 p-2 rounded-lg">{error}</p>}
                    <button onClick={verifyOTP} disabled={loading || otp.length !== 6}
                      className="w-full bg-[#FF6B00] hover:bg-[#e05f00] text-white py-3 rounded-xl font-semibold text-sm transition-colors disabled:opacity-50">
                      {loading ? 'Verifying...' : '✅ Verify Email'}
                    </button>
                    <button onClick={() => { setStep('email'); setOtp(''); setError('') }}
                      className="w-full text-sm text-gray-500 hover:text-gray-700">
                      ← Change email / Resend code
                    </button>
                  </div>
                )}
              </>
            )}
          </div>
        </div>
      )}
    </>
  )
}
