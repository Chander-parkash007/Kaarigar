'use client'
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Image from 'next/image'
import Link from 'next/link'
import { useLang } from '@/lib/LangContext'
import { useTranslation } from '@/lib/translations'
import { getEffectiveTier } from '@/lib/utils'
import { Badge } from '@/components/ui/Badge'
import { StarRating } from '@/components/ui/StarRating'
import { CATEGORIES } from '@/lib/constants'

interface Customer {
  id: string
  full_name: string
  phone: string
  created_at: string
}

interface SavedKarigar {
  worker_id: string
  created_at: string
  worker: {
    id: string
    full_name: string
    category: string
    city: string
    area: string
    profile_photo_url: string | null
    average_rating: number
    review_count: number
    tier: string
    boost_expires_at: string | null
    verified_expires_at: string | null
    status: string
  } | null
}

interface Props {
  customer: Customer
  savedKarigars: SavedKarigar[]
}

export function CustomerDashboard({ customer, savedKarigars }: Props) {
  const { lang } = useLang()
  const tr = useTranslation(lang)
  const router = useRouter()
  const [removingId, setRemovingId] = useState<string | null>(null)

  async function handleLogout() {
    await fetch('/api/customers/logout', { method: 'POST' })
    window.location.href = '/customer/login'
  }

  async function removeKarigar(workerId: string) {
    setRemovingId(workerId)
    try {
      await fetch('/api/customers/saved', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ worker_id: workerId }),
      })
      router.refresh()
    } finally {
      setRemovingId(null)
    }
  }

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      {/* Header */}
      <div className="flex items-center justify-between mb-6 flex-wrap gap-3">
        <div>
          <h1 className="text-2xl font-bold text-[#1B3A6B]">
            👋 {lang === 'ur' ? 'خوش آمدید' : 'Welcome'}, {customer.full_name.split(' ')[0]}!
          </h1>
          <p className="text-gray-500 text-sm">{customer.phone}</p>
        </div>
        <button onClick={handleLogout}
          className="px-4 py-2 text-sm border border-gray-300 rounded-lg text-gray-600 hover:bg-gray-50 transition-colors">
          {tr('cust_logout')}
        </button>
      </div>

      {/* Saved Karigars */}
      <div className="bg-white rounded-xl border border-gray-200 p-5">
        <div className="flex items-center justify-between mb-4">
          <h2 className="font-semibold text-[#1B3A6B] text-lg">
            ❤️ {tr('cust_my_karigars')} ({savedKarigars.length})
          </h2>
          <Link href="/search" className="text-sm text-[#FF6B00] hover:underline font-medium">
            {lang === 'ur' ? '+ مزید تلاش کریں' : '+ Find more →'}
          </Link>
        </div>

        {savedKarigars.length === 0 ? (
          <div className="text-center py-10 text-gray-400">
            <div className="text-4xl mb-3">❤️</div>
            <p className="text-sm font-medium">{tr('cust_no_saved')}</p>
            <Link href="/search"
              className="inline-block mt-4 bg-[#1B3A6B] text-white px-5 py-2 rounded-lg text-sm font-semibold hover:bg-[#152d55] transition-colors">
              {lang === 'ur' ? 'کاریگر تلاش کریں' : 'Browse Karigars'}
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {savedKarigars.map(({ worker_id, worker }) => {
              if (!worker || worker.status !== 'active') return null
              const tier = getEffectiveTier(worker as any)
              const cat = CATEGORIES.find(c => c.value === worker.category)
              return (
                <div key={worker_id} className="border border-gray-200 rounded-xl p-4 hover:border-[#1B3A6B] transition-colors">
                  <div className="flex gap-3">
                    <div className="relative w-14 h-14 flex-shrink-0">
                      {worker.profile_photo_url ? (
                        <Image src={worker.profile_photo_url} alt={worker.full_name} fill className="rounded-full object-cover" sizes="56px" />
                      ) : (
                        <div className="w-14 h-14 rounded-full bg-[#1B3A6B]/10 flex items-center justify-center text-xl">{cat?.icon || '👤'}</div>
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-2">
                        <div>
                          <p className="font-semibold text-[#2D2D2D] text-sm truncate">{worker.full_name}</p>
                          <p className="text-xs text-gray-500">{lang === 'ur' ? cat?.urdu : cat?.label} • {worker.city}</p>
                        </div>
                        <Badge variant={tier} />
                      </div>
                      <div className="flex items-center gap-1 mt-1">
                        <StarRating value={Math.round(worker.average_rating)} readonly size="sm" />
                        <span className="text-xs text-gray-400">({worker.review_count})</span>
                      </div>
                    </div>
                  </div>
                  <div className="flex gap-2 mt-3">
                    <Link href={`/worker/${worker.id}`}
                      className="flex-1 text-center py-1.5 text-xs font-semibold bg-[#1B3A6B] text-white rounded-lg hover:bg-[#152d55] transition-colors">
                      {lang === 'ur' ? 'پروفائل دیکھیں' : 'View Profile'}
                    </Link>
                    <button onClick={() => removeKarigar(worker_id)} disabled={removingId === worker_id}
                      className="px-3 py-1.5 text-xs text-red-600 border border-red-200 rounded-lg hover:bg-red-50 transition-colors disabled:opacity-50">
                      {removingId === worker_id ? '...' : (lang === 'ur' ? 'ہٹائیں' : 'Remove')}
                    </button>
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </div>
    </div>
  )
}
