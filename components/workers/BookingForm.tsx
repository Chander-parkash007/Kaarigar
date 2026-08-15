'use client'
import { useState } from 'react'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { useLang } from '@/lib/LangContext'
import { useTranslation } from '@/lib/translations'

interface Props { workerId: string; workerName: string }

export function BookingForm({ workerId, workerName }: Props) {
  const { lang } = useLang()
  const tr = useTranslation(lang)
  const [open, setOpen] = useState(false)
  const [name, setName] = useState('')
  const [phone, setPhone] = useState('')
  const [description, setDescription] = useState('')
  const [date, setDate] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState(false)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError('')
    if (!name.trim() || !phone.trim() || !description.trim()) { setError(tr('booking_fill_all')); return }
    if (!/^03\d{9}$/.test(phone)) { setError(tr('booking_invalid_phone')); return }
    setLoading(true)
    try {
      const res = await fetch('/api/bookings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ worker_id: workerId, customer_name: name, customer_phone: phone, service_description: description, preferred_date: date || null }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error)
      setSuccess(true)
    } catch (err) {
      setError(err instanceof Error ? err.message : tr('network_error'))
    } finally {
      setLoading(false)
    }
  }

  if (success) {
    return (
      <div className="bg-green-50 border border-green-200 rounded-2xl p-6 text-center">
        <div className="text-4xl mb-3">✅</div>
        <h3 className="font-bold text-green-800 text-lg">{tr('booking_success_title')}</h3>
        <p className="text-green-700 text-sm mt-1">{workerName} {tr('booking_will_contact')}</p>
        <button onClick={() => { setSuccess(false); setOpen(false); setName(''); setPhone(''); setDescription(''); setDate('') }}
          className="mt-4 text-sm text-[#FF6B00] hover:underline">{tr('booking_another')}</button>
      </div>
    )
  }

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden">
      <button onClick={() => setOpen(!open)} className="w-full p-5 flex items-center justify-between hover:bg-gray-50 transition-colors">
        <div className="flex items-center gap-3">
          <span className="text-2xl">📋</span>
          <div className="text-left">
            <p className="font-semibold text-[#1B3A6B]">{tr('booking_title')}</p>
            <p className="text-xs text-gray-500">{tr('booking_subtitle')}</p>
          </div>
        </div>
        <span className={`text-gray-400 transition-transform ${open ? 'rotate-180' : ''}`}>▼</span>
      </button>

      {open && (
        <form onSubmit={handleSubmit} className="px-5 pb-5 space-y-4 border-t border-gray-100 pt-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Input label={tr('booking_name')} id="booking-name" value={name} onChange={e => setName(e.target.value)} placeholder="Ahmed Ali" maxLength={100} />
            <Input label={tr('booking_phone')} id="booking-phone" type="tel" value={phone} onChange={e => setPhone(e.target.value)} placeholder="03001234567" maxLength={11} />
          </div>
          <div>
            <label className="text-sm font-medium text-[#2D2D2D] block mb-1">{tr('booking_what')}</label>
            <textarea value={description} onChange={e => setDescription(e.target.value)}
              placeholder={tr('booking_what_placeholder')} rows={3} maxLength={500}
              className="w-full px-4 py-2.5 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#1B3A6B] resize-none" />
          </div>
          <Input label={tr('booking_date')} id="booking-date" type="date" value={date}
            onChange={e => setDate(e.target.value)} min={new Date().toISOString().split('T')[0]} />
          {error && <div className="bg-red-50 border border-red-200 rounded-lg p-3 text-sm text-red-700">{error}</div>}
          <Button type="submit" variant="primary" loading={loading} className="w-full">{tr('booking_submit')}</Button>
          <p className="text-xs text-gray-400 text-center">
            {tr('booking_note')} {workerName} {tr('booking_to_contact')}
          </p>
        </form>
      )}
    </div>
  )
}
