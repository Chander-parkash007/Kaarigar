'use client'
import { useState } from 'react'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'

export function ReferralSection({ workerPhone }: { workerPhone: string }) {
  const [phone, setPhone] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError('')
    setSuccess('')

    if (!phone || !/^03\d{9}$/.test(phone)) {
      setError('Enter a valid Pakistani phone number (03XXXXXXXXX)')
      return
    }

    setLoading(true)
    try {
      const res = await fetch('/api/workers/referral', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ referred_phone: phone }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error)
      setSuccess(data.message)
      setPhone('')
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to save referral')
    } finally {
      setLoading(false)
    }
  }

  const shareText = `Bhai! KaariGar pe apna free profile banao aur customers pao. Mujhe referral ne 7 extra days diye! Join karo: https://kaarigar-pk.vercel.app/register`

  return (
    <div className="bg-gradient-to-br from-purple-600 to-indigo-700 rounded-xl text-white p-6 mb-6">
      <div className="flex items-start gap-3 mb-4">
        <span className="text-3xl">🎁</span>
        <div>
          <h2 className="font-bold text-lg">Refer a Karigar — Earn Free Days!</h2>
          <p className="text-purple-200 text-sm">Refer another karigar → you both get <strong>7 extra days</strong> of free boost when they join!</p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="flex gap-2 mb-3">
        <input
          type="tel"
          value={phone}
          onChange={e => setPhone(e.target.value)}
          placeholder="Their phone: 03001234567"
          maxLength={11}
          className="flex-1 px-4 py-2.5 rounded-lg text-[#1B3A6B] text-sm focus:outline-none focus:ring-2 focus:ring-white"
        />
        <Button type="submit" loading={loading} className="bg-white text-purple-700 hover:bg-purple-50 font-semibold px-4 py-2.5 rounded-lg text-sm whitespace-nowrap">
          Refer Now
        </Button>
      </form>

      {error && <p className="text-red-300 text-xs mb-2">⚠️ {error}</p>}
      {success && <p className="text-green-300 text-xs mb-2">✅ {success}</p>}

      <a
        href={`https://wa.me/?text=${encodeURIComponent(shareText)}`}
        target="_blank"
        className="inline-flex items-center gap-2 bg-[#25D366] text-white px-4 py-2 rounded-lg text-sm font-semibold hover:bg-[#20b957] transition-colors"
      >
        💬 Share on WhatsApp
      </a>
    </div>
  )
}
