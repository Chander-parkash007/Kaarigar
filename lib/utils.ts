import { Worker } from './types'

export function getEffectiveTier(worker: Worker): 'free' | 'boosted' | 'verified' {
  const now = new Date()
  const verifiedActive = worker.verified_expires_at && new Date(worker.verified_expires_at) > now
  const boostActive = worker.boost_expires_at && new Date(worker.boost_expires_at) > now

  if (verifiedActive) return 'verified'
  if (boostActive) return 'boosted'
  return 'free'
}

export function formatDate(dateStr: string): string {
  const date = new Date(dateStr)
  return date.toLocaleDateString('en-PK', { day: '2-digit', month: '2-digit', year: 'numeric' })
}

export function formatExpiry(dateStr: string | null): string {
  if (!dateStr) return ''
  return formatDate(dateStr)
}

export function isExpiringSoon(dateStr: string | null): boolean {
  if (!dateStr) return false
  const expiry = new Date(dateStr)
  const threeDaysFromNow = new Date()
  threeDaysFromNow.setDate(threeDaysFromNow.getDate() + 3)
  return expiry > new Date() && expiry <= threeDaysFromNow
}

export function isExpired(dateStr: string | null): boolean {
  if (!dateStr) return true
  return new Date(dateStr) <= new Date()
}

export function getWhatsAppLink(phone: string, message?: string): string {
  // Convert Pakistani number format: 03xx-xxxxxxx -> 923xxxxxxxxx
  const cleaned = phone.replace(/\D/g, '')
  const intl = cleaned.startsWith('0') ? '92' + cleaned.slice(1) : cleaned
  const text = message ? `?text=${encodeURIComponent(message)}` : ''
  return `https://wa.me/${intl}${text}`
}

export function getTelLink(phone: string): string {
  return `tel:${phone}`
}

export function cn(...classes: (string | boolean | undefined | null)[]): string {
  return classes.filter(Boolean).join(' ')
}

export function generateSessionId(): string {
  if (typeof window === 'undefined') return ''
  let sessionId = sessionStorage.getItem('hl_session')
  if (!sessionId) {
    sessionId = Math.random().toString(36).substring(2) + Date.now().toString(36)
    sessionStorage.setItem('hl_session', sessionId)
  }
  return sessionId
}

export function validatePhone(phone: string): boolean {
  return /^03\d{9}$/.test(phone)
}

export function validateFile(file: File): string | null {
  const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png']
  if (!allowedTypes.includes(file.type)) {
    return 'Only JPEG and PNG files are allowed'
  }
  const maxSize = 5 * 1024 * 1024 // 5MB
  if (file.size > maxSize) {
    return 'File size must be under 5MB'
  }
  return null
}
