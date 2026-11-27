export const AUTH_COOKIE_NAME = 'ms_customer_token'

export function getMedusaBackendUrl(): string {
  return (
    process.env.MEDUSA_BACKEND_URL ||
    process.env.NEXT_PUBLIC_MEDUSA_BACKEND_URL ||
    'http://127.0.0.1:9000'
  ).replace(/\/$/, '')
}

export function getMedusaPublishableKey(): string {
  return process.env.NEXT_PUBLIC_MEDUSA_PUBLISHABLE_KEY || ''
}

export function getMedusaAuthHeaders(token?: string): Record<string, string> {
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    Accept: 'application/json',
  }
  const publishableKey = getMedusaPublishableKey()
  if (publishableKey) {
    headers['x-publishable-api-key'] = publishableKey
  }
  if (token) {
    headers.Authorization = `Bearer ${token}`
  }
  return headers
}

export function isValidEmail(email: string): boolean {
  const trimmed = email.trim()
  return trimmed.length > 0 && /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(trimmed)
}

export function normalizePhoneDigits(value: string): string {
  return value.replace(/\D/g, '').slice(0, 10)
}

export function isValidIndianMobile(phone: string): boolean {
  return /^[6-9][0-9]{9}$/.test(phone.trim())
}

/**
 * Prevents open redirects by allowing only local relative routes outside `/auth/*`.
 */
export function sanitizeRedirectPath(raw: string | null | undefined): string {
  if (!raw) return '/account'
  const trimmed = raw.trim()
  if (!trimmed.startsWith('/') || trimmed.startsWith('//') || trimmed.startsWith('/auth')) {
    return '/account'
  }
  return trimmed
}

export interface PasswordStrengthResult {
  score: 0 | 1 | 2 | 3 | 4
  label: '' | 'Weak' | 'Fair' | 'Good' | 'Strong'
}

export function evaluatePasswordStrength(password: string): PasswordStrengthResult {
  if (!password) return { score: 0, label: '' }
  let score = 0
  if (password.length >= 8) score += 1
  if (/[A-Z]/.test(password)) score += 1
  if (/[0-9]/.test(password)) score += 1
  if (/[^A-Za-z0-9]/.test(password)) score += 1
  const clamped = Math.min(4, Math.max(1, score)) as 1 | 2 | 3 | 4
  const labels: Record<1 | 2 | 3 | 4, PasswordStrengthResult['label']> = {
    1: 'Weak',
    2: 'Fair',
    3: 'Good',
    4: 'Strong',
  }
  return { score: clamped, label: labels[clamped] }
}

export function validateSignupStep1(input: {
  firstName: string
  lastName: string
  email: string
  phone: string
}): string | null {
  if (input.firstName.trim().length < 2) return 'Please enter first name'
  if (input.lastName.trim().length < 1) return 'Please enter last name'
  if (!isValidEmail(input.email)) return 'Please enter a valid email address'
  if (!isValidIndianMobile(input.phone)) return 'Enter valid 10-digit Indian mobile'
  return null
}

export function formatCustomerInitials(
  customer: { firstName?: string; lastName?: string; email?: string } | null
): string {
  if (!customer) return 'MS'
  const first = customer.firstName?.trim().charAt(0) || ''
  const last = customer.lastName?.trim().charAt(0) || ''
  const combined = `${first}${last}`.toUpperCase()
  if (combined) return combined
  const fallback = customer.email?.trim().slice(0, 2).toUpperCase()
  return fallback || 'MS'
}
