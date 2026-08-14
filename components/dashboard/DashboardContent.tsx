'use client'
import { useState } from 'react'
import Image from 'next/image'
import { Worker, PortfolioPhoto } from '@/lib/types'
import { getEffectiveTier, formatExpiry, isExpiringSoon, isExpired } from '@/lib/utils'
import { Badge } from '@/components/ui/Badge'
import { Button } from '@/components/ui/Button'
import { ADMIN_WHATSAPP, BOOST_PRICE_WEEKLY, VERIFIED_PRICE_MONTHLY, MAX_PORTFOLIO_PHOTOS } from '@/lib/constants'
import { EditProfileModal } from './EditProfileModal'
import { UpgradePaymentModal } from './UpgradePaymentModal'

interface Props {
  worker: Worker
  portfolioPhotos: PortfolioPhoto[]
}

export function DashboardContent({ worker, portfolioPhotos }: Props) {
  const [editOpen, setEditOpen] = useState(false)
  const [paymentModalOpen, setPaymentModalOpen] = useState(false)
  const [upgradeType, setUpgradeType] = useState<'boost' | 'verified'>('boost')
  const tier = getEffectiveTier(worker)
  const verifiedActive = !isExpired(worker.verified_expires_at)
  const boostActive = !isExpired(worker.boost_expires_at)
  const verifiedExpiringSoon = isExpiringSoon(worker.verified_expires_at)
  const boostExpiringSoon = isExpiringSoon(worker.boost_expires_at)

  const whatsappUpgrade = `https://wa.me/${ADMIN_WHATSAPP}?text=${encodeURIComponent(`Hi! I want to upgrade my HireLocal profile. My name is ${worker.full_name} and my phone is ${worker.phone}.`)}`

  const openPaymentModal = (type: 'boost' | 'verified') => {
    setUpgradeType(type)
    setPaymentModalOpen(true)
  }

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      {/* Header */}
      <div className="flex items-center justify-between mb-6 flex-wrap gap-3">
        <div>
          <h1 className="text-2xl font-bold text-[#1B3A6B]">👋 Welcome, {worker.full_name.split(' ')[0]}!</h1>
          <p className="text-gray-500 text-sm">Manage your HireLocal profile</p>
        </div>
        <div className="flex gap-3">
          <Button variant="outline" size="sm" onClick={() => setEditOpen(true)}>✏️ Edit Profile</Button>
          <a href={`/worker/${worker.id}`} target="_blank"
            className="inline-flex items-center gap-1 px-4 py-2 text-sm border-2 border-[#FF6B00] text-[#FF6B00] rounded-lg hover:bg-[#FF6B00] hover:text-white transition-colors font-semibold">
            👁️ View Profile
          </a>
        </div>
      </div>

      {/* Expiry Warnings */}
      {(verifiedExpiringSoon || boostExpiringSoon) && (
        <div className="bg-yellow-50 border border-yellow-300 rounded-xl p-4 mb-6 flex items-start gap-3">
          <span className="text-2xl">⚠️</span>
          <div>
            <p className="font-semibold text-yellow-800">Your upgrade is expiring soon!</p>
            <p className="text-yellow-700 text-sm">
              {verifiedExpiringSoon && `Verified Badge expires on ${formatExpiry(worker.verified_expires_at)}. `}
              {boostExpiringSoon && `Profile Boost expires on ${formatExpiry(worker.boost_expires_at)}. `}
              Renew now to keep your visibility.
            </p>
            <a href={whatsappUpgrade} target="_blank"
              className="inline-block mt-2 text-sm font-medium text-green-700 hover:underline">
              💬 WhatsApp us to renew →
            </a>
          </div>
        </div>
      )}

      {/* Stats Grid */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
        {[
          { label: 'Profile Views', value: worker.profile_views, icon: '👁️' },
          { label: 'Reviews', value: worker.review_count, icon: '⭐' },
          { label: 'Rating', value: worker.average_rating > 0 ? `${worker.average_rating}/5` : '—', icon: '📊' },
          { label: 'Current Plan', value: tier.charAt(0).toUpperCase() + tier.slice(1), icon: '📋' },
        ].map(stat => (
          <div key={stat.label} className="bg-white rounded-xl border border-gray-200 p-4 text-center">
            <div className="text-2xl mb-1">{stat.icon}</div>
            <div className="text-xl font-bold text-[#1B3A6B]">{stat.value}</div>
            <div className="text-xs text-gray-500">{stat.label}</div>
          </div>
        ))}
      </div>

      {/* Current Status */}
      <div className="bg-white rounded-xl border border-gray-200 p-5 mb-6">
        <h2 className="font-semibold text-[#1B3A6B] mb-4">Account Status</h2>
        <div className="flex flex-wrap gap-4">
          <div>
            <p className="text-xs text-gray-500 mb-1">Current Tier</p>
            <Badge variant={tier} />
          </div>
          {verifiedActive && (
            <div>
              <p className="text-xs text-gray-500 mb-1">Verified Until</p>
              <p className="text-sm font-medium text-green-700">{formatExpiry(worker.verified_expires_at)}</p>
            </div>
          )}
          {boostActive && (
            <div>
              <p className="text-xs text-gray-500 mb-1">Boost Until</p>
              <p className="text-sm font-medium text-orange-600">{formatExpiry(worker.boost_expires_at)}</p>
            </div>
          )}
        </div>
      </div>

      {/* Upgrade Section */}
      <div className="bg-gradient-to-br from-[#1B3A6B] to-[#0f2240] rounded-xl text-white p-6 mb-6">
        <h2 className="font-bold text-lg mb-1">🚀 Get More Customers</h2>
        <p className="text-blue-200 text-sm mb-4">Upgrade your profile to appear higher in search results and build trust</p>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4">
          {[
            {
              title: '⭐ Profile Boost',
              price: `Rs. ${BOOST_PRICE_WEEKLY}/week`,
              features: ['Appear higher in search', 'Featured badge', 'More visibility'],
              active: boostActive,
              type: 'boost' as const,
            },
            {
              title: '✅ Verified Badge',
              price: `Rs. ${VERIFIED_PRICE_MONTHLY}/month`,
              features: ['Top of all results', 'Verified ✅ badge', 'Maximum trust'],
              active: verifiedActive,
              type: 'verified' as const,
            },
          ].map(plan => (
            <div key={plan.title} className={`rounded-lg p-4 ${plan.active ? 'bg-green-600/30 border border-green-400' : 'bg-white/10'}`}>
              <div className="font-semibold mb-1">{plan.title} — {plan.price}</div>
              <ul className="text-xs text-blue-200 space-y-1 mb-3">
                {plan.features.map(f => <li key={f}>• {f}</li>)}
              </ul>
              {plan.active ? (
                <span className="text-xs text-green-300 font-medium">✅ Currently Active</span>
              ) : (
                <button
                  onClick={() => openPaymentModal(plan.type)}
                  className="text-xs bg-white text-[#1B3A6B] px-3 py-1.5 rounded-md font-semibold hover:bg-blue-50 transition-colors"
                >
                  Upgrade Now →
                </button>
              )}
            </div>
          ))}
        </div>

        <div className="bg-white/10 rounded-lg p-4 text-sm">
          <p className="font-medium mb-2">📋 Two ways to upgrade:</p>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div className="bg-white/10 rounded-lg p-3">
              <p className="font-semibold text-white mb-1">💳 Online Payment (Fast)</p>
              <p className="text-xs text-blue-200 mb-2">Upload payment screenshot directly</p>
              <button
                onClick={() => openPaymentModal('boost')}
                className="text-xs bg-white text-[#1B3A6B] px-3 py-1.5 rounded-md font-semibold hover:bg-blue-50 transition-colors w-full"
              >
                Upload Payment Screenshot
              </button>
            </div>
            <div className="bg-white/10 rounded-lg p-3">
              <p className="font-semibold text-white mb-1">💬 WhatsApp (Personal)</p>
              <p className="text-xs text-blue-200 mb-2">Chat with us for assistance</p>
              <a
                href={whatsappUpgrade}
                target="_blank"
                className="inline-block text-xs bg-[#25D366] text-white px-3 py-1.5 rounded-md font-semibold hover:bg-[#20b957] transition-colors w-full text-center"
              >
                Message on WhatsApp
              </a>
            </div>
          </div>
        </div>
      </div>

      {/* Portfolio */}
      <div className="bg-white rounded-xl border border-gray-200 p-5">
        <div className="flex items-center justify-between mb-4">
          <h2 className="font-semibold text-[#1B3A6B]">Work Photos ({portfolioPhotos.length}/{MAX_PORTFOLIO_PHOTOS})</h2>
          {portfolioPhotos.length < MAX_PORTFOLIO_PHOTOS && (
            <Button variant="outline" size="sm" onClick={() => setEditOpen(true)}>+ Add Photo</Button>
          )}
        </div>

        {portfolioPhotos.length === 0 ? (
          <div className="text-center py-8 text-gray-400">
            <div className="text-3xl mb-2">📸</div>
            <p className="text-sm">No work photos yet. Add photos to show customers your quality work!</p>
            <Button variant="outline" size="sm" className="mt-3" onClick={() => setEditOpen(true)}>Upload Photos</Button>
          </div>
        ) : (
          <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 gap-3">
            {portfolioPhotos.map(photo => (
              <div key={photo.id} className="relative aspect-square rounded-lg overflow-hidden">
                <Image src={photo.photo_url} alt="Work photo" fill className="object-cover" sizes="100px" />
              </div>
            ))}
          </div>
        )}
      </div>

      {editOpen && (
        <EditProfileModal worker={worker} portfolioPhotos={portfolioPhotos} onClose={() => setEditOpen(false)} />
      )}
      
      {paymentModalOpen && (
        <UpgradePaymentModal
          isOpen={paymentModalOpen}
          onClose={() => setPaymentModalOpen(false)}
          upgradeType={upgradeType}
          workerName={worker.full_name}
        />
      )}
    </div>
  )
}
