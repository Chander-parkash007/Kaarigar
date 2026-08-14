import { cn } from '@/lib/utils'

interface BadgeProps {
  variant: 'verified' | 'boosted' | 'free' | 'pending' | 'approved' | 'rejected'
  className?: string
}

const config = {
  verified: { label: '✅ Verified', class: 'bg-green-100 text-green-800 border-green-200' },
  boosted: { label: '⭐ Featured', class: 'bg-orange-100 text-orange-700 border-orange-200' },
  free: { label: 'Free', class: 'bg-gray-100 text-gray-600 border-gray-200' },
  pending: { label: '⏳ Pending', class: 'bg-yellow-100 text-yellow-700 border-yellow-200' },
  approved: { label: '✅ Approved', class: 'bg-green-100 text-green-800 border-green-200' },
  rejected: { label: '❌ Rejected', class: 'bg-red-100 text-red-700 border-red-200' },
}

export function Badge({ variant, className }: BadgeProps) {
  const { label, class: cls } = config[variant]
  return (
    <span className={cn('inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border', cls, className)}>
      {label}
    </span>
  )
}
