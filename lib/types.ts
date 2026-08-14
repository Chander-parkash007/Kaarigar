export type WorkerTier = 'free' | 'boosted' | 'verified'
export type WorkerStatus = 'active' | 'inactive'
export type PaymentType = 'boost' | 'verified_badge'
export type PaymentStatus = 'pending' | 'approved' | 'rejected'

export interface Worker {
  id: string
  full_name: string
  phone: string
  category: string
  city: string
  area: string
  about: string
  profile_photo_url: string | null
  tier: WorkerTier
  status: WorkerStatus
  boost_expires_at: string | null
  verified_expires_at: string | null
  average_rating: number
  review_count: number
  profile_views: number
  created_at: string
  updated_at: string
}

export interface Review {
  id: string
  worker_id: string
  reviewer_name: string
  rating: number
  review_text: string | null
  created_at: string
}

export interface PortfolioPhoto {
  id: string
  worker_id: string
  photo_url: string
  created_at: string
}

export interface PaymentRequest {
  id: string
  worker_id: string
  payment_type: PaymentType
  screenshot_url: string
  status: PaymentStatus
  created_at: string
  reviewed_at: string | null
  reviewed_by: string | null
  worker?: {
    id: string
    full_name: string
    phone: string
    category: string
    city: string
  } | null
}

export interface ActivityLog {
  id: string
  admin_username: string
  action_type: string
  action_description: string
  worker_id: string | null
  worker_name: string | null
  created_at: string
}

export interface AdminUser {
  id: string
  username: string
  password_hash: string
  created_at: string
}
