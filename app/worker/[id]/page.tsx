import { notFound } from 'next/navigation'
import Image from 'next/image'
import { createClient } from '@/lib/supabase/server'
import { Navbar } from '@/components/layout/Navbar'
import { Footer } from '@/components/layout/Footer'
import { Badge } from '@/components/ui/Badge'
import { StarRating } from '@/components/ui/StarRating'
import { ReviewForm } from '@/components/workers/ReviewForm'
import { getEffectiveTier, getWhatsAppLink, getTelLink, formatDate } from '@/lib/utils'
import { CATEGORIES } from '@/lib/constants'
import { Worker, Review, PortfolioPhoto } from '@/lib/types'
import { ProfileViewTracker } from '@/components/workers/ProfileViewTracker'

interface Props {
  params: Promise<{ id: string }>
}

export default async function WorkerProfilePage({ params }: Props) {
  const { id } = await params
  const supabase = await createClient()

  const [workerRes, reviewsRes, photosRes] = await Promise.all([
    supabase.from('workers').select('*').eq('id', id).eq('status', 'active').single(),
    supabase.from('reviews').select('*').eq('worker_id', id).order('created_at', { ascending: false }),
    supabase.from('portfolio_photos').select('*').eq('worker_id', id).order('created_at', { ascending: false }),
  ])

  if (workerRes.error || !workerRes.data) {
    notFound()
  }

  const worker: Worker = workerRes.data
  const reviews: Review[] = reviewsRes.data || []
  const photos: PortfolioPhoto[] = photosRes.data || []
  const tier = getEffectiveTier(worker)
  const categoryInfo = CATEGORIES.find(c => c.value === worker.category)

  return (
    <>
      <Navbar />
      <ProfileViewTracker workerId={id} />
      <main className="min-h-screen bg-[#F8F9FA]">
        <div className="max-w-4xl mx-auto px-4 py-8">

          {/* Profile Card */}
          <article className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden mb-6">
            {/* Header */}
            <div className="bg-gradient-to-r from-[#1B3A6B] to-[#0f2240] p-6 text-white">
              <div className="flex flex-col sm:flex-row gap-5 items-start sm:items-center">
                {/* Photo */}
                <div className="relative w-24 h-24 flex-shrink-0">
                  {worker.profile_photo_url ? (
                    <Image
                      src={worker.profile_photo_url}
                      alt={`${worker.full_name} profile photo`}
                      fill
                      className="rounded-full object-cover border-4 border-white/30"
                      sizes="96px"
                      priority
                    />
                  ) : (
                    <div className="w-24 h-24 rounded-full bg-white/20 flex items-center justify-center text-4xl border-4 border-white/30">
                      {categoryInfo?.icon || '👤'}
                    </div>
                  )}
                </div>

                {/* Info */}
                <div className="flex-1">
                  <div className="flex flex-wrap items-center gap-3 mb-1">
                    <h1 className="text-2xl font-bold">{worker.full_name}</h1>
                    <Badge variant={tier} />
                  </div>
                  <p className="text-blue-200 mb-2">
                    {categoryInfo?.icon} {categoryInfo?.label || worker.category}
                  </p>
                  <div className="flex items-center gap-3">
                    <StarRating value={Math.round(worker.average_rating)} readonly size="md" />
                    <span className="text-blue-200 text-sm">
                      {worker.average_rating > 0
                        ? `${worker.average_rating} (${worker.review_count} review${worker.review_count !== 1 ? 's' : ''})`
                        : 'No reviews yet'
                      }
                    </span>
                  </div>
                  <p className="text-blue-200 text-sm mt-1">📍 {worker.area}, {worker.city}</p>
                </div>
              </div>
            </div>

            {/* CTA Buttons */}
            <div className="p-5 flex flex-col sm:flex-row gap-3 border-b border-gray-100">
              <a
                href={getTelLink(worker.phone)}
                className="flex-1 bg-[#1B3A6B] text-white rounded-xl py-3.5 px-6 font-semibold text-center hover:bg-[#152d55] transition-colors flex items-center justify-center gap-2"
                aria-label={`Call ${worker.full_name}`}
              >
                📞 Call Now
              </a>
              <a
                href={getWhatsAppLink(worker.phone, `Hi, I found your profile on KaariGar. I need ${categoryInfo?.label || worker.category} service.`)}
                target="_blank"
                rel="noopener noreferrer"
                className="flex-1 bg-[#25D366] text-white rounded-xl py-3.5 px-6 font-semibold text-center hover:bg-[#20b957] transition-colors flex items-center justify-center gap-2"
                aria-label={`WhatsApp ${worker.full_name}`}
              >
                💬 WhatsApp
              </a>
              <a
                href={`https://wa.me/?text=${encodeURIComponent(`${worker.full_name} - ${categoryInfo?.label || worker.category} in ${worker.city}\n\nFind them on KaariGar: ${process.env.NEXT_PUBLIC_SITE_URL || 'https://kaarigar-pk.vercel.app'}/worker/${worker.id}`)}`}
                target="_blank"
                rel="noopener noreferrer"
                className="sm:flex-none bg-gray-100 text-gray-700 rounded-xl py-3.5 px-5 font-semibold text-center hover:bg-gray-200 transition-colors flex items-center justify-center gap-2"
                aria-label="Share this profile"
              >
                🔗 Share
              </a>
            </div>

            {/* About */}
            <div className="p-5 border-b border-gray-100">
              <h2 className="font-semibold text-[#1B3A6B] mb-2">About</h2>
              <p className="text-gray-600 text-sm leading-relaxed">{worker.about}</p>
            </div>

            {/* Portfolio */}
            {photos.length > 0 && (
              <div className="p-5 border-b border-gray-100">
                <h2 className="font-semibold text-[#1B3A6B] mb-3">Work Photos</h2>
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
                  {photos.map((photo: PortfolioPhoto) => (
                    <div key={photo.id} className="relative aspect-square rounded-lg overflow-hidden">
                      <Image
                        src={photo.photo_url}
                        alt={`Work photo by ${worker.full_name}`}
                        fill
                        className="object-cover hover:scale-105 transition-transform"
                        sizes="(max-width: 640px) 50vw, 25vw"
                      />
                    </div>
                  ))}
                </div>
              </div>
            )}

            {photos.length === 0 && (
              <div className="p-5 border-b border-gray-100">
                <h2 className="font-semibold text-[#1B3A6B] mb-2">Work Photos</h2>
                <p className="text-gray-400 text-sm">No work photos yet.</p>
              </div>
            )}
          </article>

          {/* Reviews */}
          <section className="bg-white rounded-2xl shadow-sm border border-gray-200 p-5 mb-6">
            <h2 className="font-semibold text-[#1B3A6B] text-lg mb-4">
              Reviews ({reviews.length})
            </h2>

            {reviews.length === 0 ? (
              <p className="text-gray-400 text-sm">No reviews yet. Be the first to review!</p>
            ) : (
              <div className="space-y-4">
                {reviews.map((review: Review) => (
                  <div key={review.id} className="border-b border-gray-100 last:border-0 pb-4 last:pb-0">
                    <div className="flex items-start justify-between gap-2">
                      <div>
                        <p className="font-medium text-sm text-[#2D2D2D]">{review.reviewer_name}</p>
                        <StarRating value={review.rating} readonly size="sm" />
                      </div>
                      <span className="text-xs text-gray-400 whitespace-nowrap">{formatDate(review.created_at)}</span>
                    </div>
                    {review.review_text && (
                      <p className="text-gray-600 text-sm mt-2">{review.review_text}</p>
                    )}
                  </div>
                ))}
              </div>
            )}
          </section>

          {/* Review Form */}
          <ReviewForm workerId={id} workerName={worker.full_name} />
        </div>
      </main>
      <Footer />
    </>
  )
}
