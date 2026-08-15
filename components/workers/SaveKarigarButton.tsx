'use client'
import { useState, useEffect } from 'react'
import { useLang } from '@/lib/LangContext'
import { useTranslation } from '@/lib/translations'

export function SaveKarigarButton({ workerId }: { workerId: string }) {
  const { lang } = useLang()
  const tr = useTranslation(lang)
  const [saved, setSaved] = useState(false)
  const [loading, setLoading] = useState(false)
  const [isLoggedIn, setIsLoggedIn] = useState(false)

  useEffect(() => {
    // Check if customer is logged in
    fetch('/api/customers/me').then(r => r.json()).then(data => {
      if (data.customer) {
        setIsLoggedIn(true)
        // Check if already saved
        fetch('/api/customers/saved').then(r => r.json()).then(d => {
          const ids = (d.saved || []).map((s: any) => s.worker_id)
          setSaved(ids.includes(workerId))
        }).catch(() => {})
      }
    }).catch(() => {})
  }, [workerId])

  async function toggle() {
    if (!isLoggedIn) {
      window.location.href = '/customer/login'
      return
    }
    setLoading(true)
    try {
      const method = saved ? 'DELETE' : 'POST'
      await fetch('/api/customers/saved', {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ worker_id: workerId }),
      })
      setSaved(!saved)
    } catch {} finally { setLoading(false) }
  }

  return (
    <button
      onClick={toggle}
      disabled={loading}
      className={`sm:flex-none rounded-xl py-3.5 px-5 font-semibold text-center transition-colors flex items-center justify-center gap-2 disabled:opacity-50 ${
        saved
          ? 'bg-red-100 text-red-600 hover:bg-red-200'
          : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
      }`}
      aria-label={saved ? 'Unsave karigar' : 'Save karigar'}
    >
      {saved ? '❤️' : '🤍'} {saved ? tr('cust_saved') : tr('cust_save_karigar')}
    </button>
  )
}
