/**
 * Input Sanitization Utilities
 * Prevents XSS attacks by sanitizing user inputs
 */

// Server-side sanitization
export function sanitizeText(input: string): string {
  if (!input) return ''
  
  return input
    .trim()
    .replace(/[<>]/g, '') // Remove potential HTML tags
    .replace(/javascript:/gi, '') // Remove javascript: protocol
    .replace(/on\w+\s*=/gi, '') // Remove event handlers
    .substring(0, 5000) // Max length limit
}

export function sanitizePhone(phone: string): string {
  // Remove all non-digits
  return phone.replace(/\D/g, '').substring(0, 15)
}

export function sanitizeUrl(url: string): string {
  try {
    const parsed = new URL(url)
    // Only allow http and https protocols
    if (!['http:', 'https:'].includes(parsed.protocol)) {
      return ''
    }
    return parsed.toString()
  } catch {
    return ''
  }
}

// HTML escaping for display
export function escapeHtml(text: string): string {
  const map: Record<string, string> = {
    '&': '&amp;',
    '<': '&lt;',
    '>': '&gt;',
    '"': '&quot;',
    "'": '&#x27;',
    '/': '&#x2F;',
  }
  return text.replace(/[&<>"'/]/g, (char) => map[char])
}

// Validate and sanitize review text
export function sanitizeReviewText(text: string | null): string {
  if (!text) return ''
  return sanitizeText(text).substring(0, 1000) // Max 1000 chars for reviews
}

// Validate category/city inputs against allowed values
export function validateEnum<T extends string>(
  value: string,
  allowedValues: readonly T[]
): T | null {
  if (allowedValues.includes(value as T)) {
    return value as T
  }
  return null
}
