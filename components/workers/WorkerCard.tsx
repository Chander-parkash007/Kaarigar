import Link from 'next/link'
import Image from 'next/image'
import { Worker } from '@/lib/types'
import { getEffectiveTier } from '@/lib/utils'
import { Badge } from '@/components/ui/Badge'
import { StarRating } from '@/components/ui/StarRating'
import { CATEGORIES } from '@/lib/constants'

interface WorkerCardProps {
  worker: Worker
}

export function WorkerCard({ worker }: WorkerCardProps) {
  const tier = getEffectiveTier(worker)
  const categoryInfo = CATEGORIES.find(c => c.value === worker.category)

  return (
    <Link href={`/worker/${worker.id}`}>
      <article className="bg-white rounded-xl border border-gray-200 hover:border-[#1B3A6B] hover:shadow-lg transition-all duration-200 p-4 cursor-pointer group">
        <div className="flex gap-4">
          {/* Profile photo */}
          <div className="relative w-16 h-16 flex-shrink-0">
            {worker.profile_photo_url ? (
              <Image
                src={worker.profile_photo_url}
                alt={`${worker.full_name} profile photo`}
                fill
                className="rounded-full object-cover"
                sizes="64px"
              />
            ) : (
              <div className="w-16 h-16 rounded-full bg-[#1B3A6B]/10 flex items-center justify-center text-2xl">
                {categoryInfo?.icon || '👤'}
              </div>
            )}
          </div>

          {/* Info */}
          <div className="flex-1 min-w-0">
            <div className="flex items-start justify-between gap-2">
              <div>
                <h3 className="font-semibold text-[#2D2D2D] group-hover:text-[#1B3A6B] transition-colors truncate">
                  {worker.full_name}
                </h3>
                <p className="text-sm text-gray-500">{categoryInfo?.label || worker.category} • {worker.area}</p>
              </div>
              <Badge variant={tier} />
            </div>

            <div className="flex items-center gap-2 mt-1">
              <StarRating value={Math.round(worker.average_rating)} readonly size="sm" />
              <span className="text-xs text-gray-500">
                {worker.average_rating > 0 ? `${worker.average_rating} (${worker.review_count})` : 'No reviews'}
              </span>
            </div>

            <p className="text-xs text-gray-400 mt-1">📍 {worker.city}</p>
          </div>
        </div>
      </article>
    </Link>
  )
}
