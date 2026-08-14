'use client'
import { useState } from 'react'
import { cn } from '@/lib/utils'

interface StarRatingProps {
  value: number
  onChange?: (val: number) => void
  readonly?: boolean
  size?: 'sm' | 'md' | 'lg'
}

export function StarRating({ value, onChange, readonly = false, size = 'md' }: StarRatingProps) {
  const [hovered, setHovered] = useState(0)

  const sizeClass = {
    sm: 'text-sm',
    md: 'text-xl',
    lg: 'text-2xl',
  }[size]

  return (
    <div className={cn('flex gap-0.5', sizeClass)} role={readonly ? 'img' : 'group'} aria-label={`${value} out of 5 stars`}>
      {[1, 2, 3, 4, 5].map(star => (
        <button
          key={star}
          type="button"
          disabled={readonly}
          onClick={() => onChange?.(star)}
          onMouseEnter={() => !readonly && setHovered(star)}
          onMouseLeave={() => !readonly && setHovered(0)}
          className={cn(
            'transition-transform',
            !readonly && 'hover:scale-110 cursor-pointer',
            readonly && 'cursor-default'
          )}
          aria-label={`${star} star${star > 1 ? 's' : ''}`}
        >
          <span className={
            (hovered || value) >= star ? 'text-yellow-400' : 'text-gray-300'
          }>
            ★
          </span>
        </button>
      ))}
    </div>
  )
}
