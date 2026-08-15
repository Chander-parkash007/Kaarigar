'use client'
import { useState, useEffect } from 'react'
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

function getDaysLeft(dateStr: string | null): number {
  if (!dateStr) return 0
  const diff = new Date(dateStr).getTime() - Date.now()
  return Math.max(0, Math.ceil(diff / (1000 * 60 * 60 * 24)))
}

export function DashboardContent({ worker, portfolioPhotos }: Props) {
  const [editOpen, setEditOpen] = useState(false)
  const [paymentModalOpen, setPaymentModalOpen] = useState(false)
  const [upgradeType, setUpgradeType] = useState<'boost' | 'verified'>('boost')
  const [dismissed, setDismissed] = useState(false)

  const tier = getEffectiveTier(worker)
  const verifiedActive = !isExpired(worker.verified_expires_at)
  const boostActive = !isExpired(worker.boost_expires_at)
  const verifiedExpiringSoon = isExpiringSoon(worker.verified_expires_at)
  const boostExpiringSoon = isExpiringSoon(worker.boost_expires_at)

  const boostDaysLeft = getDaysLeft(worker.boost_expires_at)
  const verifiedDaysLeft = getDaysLeft(worker.verified_expires_at)

  // Detect if this is the free trial (boost set but tier is still 'free')
  const isOnFreeTrial = worker.tier === 'free' && boostActive && boostDaysLeft > 0

  const whatsappUpgrade = `https://wa.me/${ADMIN_WHATSAPP}?text=${encodeURIComponent(`Hi! I want to upgrade my KaariGar profile. My name is ${worker.full_name} and my phone is ${worker.phone}.`)}`

  const openPaymentModal = (type: 'boost' | 'verified') => {
    setUpgradeType(type)
    setPaymentModalOpen(true)
  }

  // Banner config
  const showTrialBanner = isOnFreeTrial && !dismissed
  const showExpiryBanner = !isOnFreeTrial && (verifiedExpiringSoon || boostExpiringSoon) && !dismissed
  const trialUrgent = boostDaysLeft <= 3
  const trialWarning = boostDaysLeft <= 7 && boostDaysLeft > 3

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      {/* Header */}
      <div className="flex items-center justify-between mb-6 flex-wrap gap-3">
        <div>
          <h1 className="text-2xl font-bold text-[#1B3A6B]">👋 Welcome, {worker.full_name.split(' ')[0]}!</h1>
          <p className="text-gray-500 text-sm">Manage your KaariGar profile</p>
        </div>
        <div className="flex gap-3">
          <Button variant="outline" size="sm" onClick={() => setEditOpen(true)}>✏️ Edit Profile</Button>
          <a href={`/worker/${worker.id}`} target="_blank"
            className="inline-flex items-center gap-1 px-4 py-2 text-sm border-2 border-[#FF6B00] text-[#FF6B00] rounded-lg hover:bg-[#FF6B00] hover:text-white transition-colors font-semibold">
            👁️ View Profile
          </a>
        </div>
      </div>

      {/* ── Trial / Expiry Banner ── */}
      {showTrialBanner && (
        <div className={`relative rounded-xl p-4 mb-6 flex items-start gap-3 border ${
          trialUrgent
            ? 'bg-red-50 border-red-300'
            : trialWarning
            ? 'bg-yellow-50 border-yellow-300'
            : 'bg-blue-50 border-blue-200'
        }`}>
          <span className="text-2xl">{trialUrgent ? '🚨' : trialWarning ? '⚠️' : '🎁'}</span>
          <div className="flex-1">
            {trialUrgent ? (
              <>
                <p className="font-bold text-red-800">Free trial expires in {boostDaysLeft} day{boostDaysLeft !== 1 ? 's' : ''}!</p>
                <p className="text-red-700 text-sm mt-0.5">After this your profile will drop from Featured. Upgrade now to keep getting customers.</p>
              </>
            ) : trialWarning ? (
              <>
                <p className="font-bold text-yellow-800">Free trial ending soon — {boostDaysLeft} days left</p>
                <p className="text-yellow-700 text-sm mt-0.5">You&apos;re currently Featured for free. Upgrade before {formatExpiry(worker.boost_expires_at)} to stay on top.</p>
              </>
            ) : (
              <>
                <p className="font-bold text-blue-800">🎉 You have {boostDaysLeft} days of free Featured listing!</p>
                <p className="text-blue-700 text-sm mt-0.5">Your profile is currently Featured and appearing higher in search. Upgrade before trial ends to keep this advantage.</p>
              </>
            )}
            <div className="flex gap-3 mt-3 flex-wrap">
              <button
                onClick={() => openPaymentModal('boost')}
                className={`text-sm font-semibold px-4 py-1.5 rounded-lg transition-colors ${
                  trialUrgent ? 'bg-red-600 text-white hover:bg-red-700' : 'bg-[#FF6B00] text-white hover:bg-[#e05f00]'
                }`}
              >
                Upgrade Now — Rs. {BOOST_PRICE_WEEKLY}/week
              </button>
              <a href={whatsappUpgrade} target="_blank"
                className="text-sm font-medium text-green-700 hover:underline flex items-center gap-1">
                💬 WhatsApp us
              </a>
            </div>
          </div>
          <button onClick={() => setDismissed(true)} className="text-gray-400 hover:text-gray-600 text-lg leading-none flex-shrink-0">×</button>
        </div>
      )}

      {showExpiryBanner && (
        <div className="relative bg-yellow-50 border border-yellow-300 rounded-xl p-4 mb-6 flex items-start gap-3">
          <span className="text-2xl">⚠️</span>
          <div className="flex-1">
            <p className="font-semibold text-yellow-800">Your upgrade is expiring soon!</p>
            <p className="text-yellow-700 text-sm mt-0.5">
              {verifiedExpiringSoon && `✅ Verified Badge expires in ${verifiedDaysLeft} day${verifiedDaysLeft !== 1 ? 's' : ''} (${formatExpiry(worker.verified_expires_at)}). `}
              {boostExpiringSoon && `⭐ Profile Boost expires in ${boostDaysLeft} day${boostDaysLeft !== 1 ? 's' : ''} (${formatExpiry(worker.boost_expires_at)}). `}
            </p>
            <div className="flex gap-3 mt-2 flex-wrap">
              <button onClick={() => openPaymentModal('boost')}
                className="text-sm font-semibold text-[#FF6B00] hover:underline">
                Renew now →
              </button>
              <a href={whatsappUpgrade} target="_blank" className="text-sm font-medium text-green-700 hover:underline">
                💬 WhatsApp us
              </a>
            </div>
          </div>
          <button onClick={() => setDismissed(true)} className="text-gray-400 hover:text-gray-600 text-lg leading-none flex-shrink-0">×</button>
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
