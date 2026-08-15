'use client'
import { useState } from 'react'
import { useLang } from '@/lib/LangContext'
import { useTranslation } from '@/lib/translations'

export function ReferralSection({ workerPhone }: { workerPhone: string }) {
  const { lang } = useLang()
  const tr = useTranslation(lang)
  const [phone, setPhone] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError('')
    setSuccess('')
    if (!phone || !/^03\d{9}$/.test(phone)) { setError(tr('ref_invalid_phone')); return }
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
      setError(err instanceof Error ? err.message : tr('network_error'))
    } finally { setLoading(false) }
  }

  const shareText = lang === 'ur'
    ? `بھائی! KaariGar پر اپنا مفت پروفائل بنائیں اور گاہک پائیں۔ رجسٹر کریں: https://kaarigar-pk.vercel.app/register`
    : `Bhai! KaariGar pe apna free profile banao aur customers pao. Join karo: https://kaarigar-pk.vercel.app/register`

  return (
    <div className="bg-gradient-to-br from-purple-600 to-indigo-700 rounded-xl text-white p-6 mb-6">
      <div className="flex items-start gap-3 mb-4">
        <span className="text-3xl">🎁</span>
        <div>
          <h2 className="font-bold text-lg">{tr('ref_title')}</h2>
          <p className="text-purple-200 text-sm">
            {tr('ref_sub')} <strong>{tr('ref_days')}</strong> {tr('ref_join')}
          </p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="flex gap-2 mb-3">
        <input
          type="tel"
          value={phone}
          onChange={e => setPhone(e.target.value)}
          placeholder={tr('ref_placeholder')}
          maxLength={11}
          className="flex-1 px-4 py-2.5 rounded-lg text-[#1B3A6B] text-sm focus:outline-none focus:ring-2 focus:ring-white"
        />
        <button type="submit" disabled={loading}
          className="bg-white text-purple-700 hover:bg-purple-50 font-semibold px-4 py-2.5 rounded-lg text-sm whitespace-nowrap disabled:opacity-50 transition-colors">
          {loading ? tr('ref_saving') : tr('ref_btn')}
        </button>
      </form>

      {error && <p className="text-red-300 text-xs mb-2">⚠️ {error}</p>}
      {success && <p className="text-green-300 text-xs mb-2">✅ {success}</p>}

      <a href={`https://wa.me/?text=${encodeURIComponent(shareText)}`} target="_blank"
        className="inline-flex items-center gap-2 bg-[#25D366] text-white px-4 py-2 rounded-lg text-sm font-semibold hover:bg-[#20b957] transition-colors">
        {tr('ref_share')}
      </a>
    </div>
  )
}
