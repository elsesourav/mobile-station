export const ACCOUNT_STORAGE_KEY = 'mobile_station_account_v1'

export type PreferredHub = 'motijheel-842001' | 'club-road-842002'

export interface CustomerAccountProfile {
  fullName: string
  email: string
  phone: string
  pincode: string
  cityAddress: string
  gstin: string
  businessName: string
  preferredHub: PreferredHub
  signedInAt: string
}

export const DEFAULT_ACCOUNT_PROFILE: CustomerAccountProfile = {
  fullName: '',
  email: '',
  phone: '',
  pincode: '842001',
  cityAddress: '',
  gstin: '',
  businessName: '',
  preferredHub: 'motijheel-842001',
  signedInAt: '',
}

/**
 * Safely reads the locally persisted customer profile for `/account` and `/menu`.
 */
export function readStoredAccountProfile(): CustomerAccountProfile | null {
  if (typeof window === 'undefined') return null
  try {
    const raw = window.localStorage.getItem(ACCOUNT_STORAGE_KEY)
    if (!raw) return null
    const parsed = JSON.parse(raw) as Partial<CustomerAccountProfile>
    if (!parsed || typeof parsed.email !== 'string' || !parsed.email.trim()) {
      return null
    }
    return {
      ...DEFAULT_ACCOUNT_PROFILE,
      ...parsed,
      fullName: typeof parsed.fullName === 'string' && parsed.fullName.trim() ? parsed.fullName : 'Customer',
      email: parsed.email.trim(),
      phone: typeof parsed.phone === 'string' ? parsed.phone : '',
      pincode: typeof parsed.pincode === 'string' && parsed.pincode.trim() ? parsed.pincode : '842001',
      preferredHub: parsed.preferredHub === 'club-road-842002' ? 'club-road-842002' : 'motijheel-842001',
    }
  } catch {
    return null
  }
}

/**
 * Persists or clears the local customer profile in storage.
 */
export function persistStoredAccountProfile(profile: CustomerAccountProfile | null): void {
  if (typeof window === 'undefined') return
  try {
    if (profile) {
      window.localStorage.setItem(ACCOUNT_STORAGE_KEY, JSON.stringify(profile))
    } else {
      window.localStorage.removeItem(ACCOUNT_STORAGE_KEY)
    }
  } catch {
    // Ignore storage write failures cleanly
  }
}

export function getProfileInitials(profile: CustomerAccountProfile | null): string {
  if (!profile) return 'MS'
  const parts = profile.fullName.trim().split(/\s+/).filter(Boolean)
  if (parts.length >= 2) {
    return `${parts[0][0]}${parts[parts.length - 1][0]}`.toUpperCase()
  }
  return (parts[0]?.slice(0, 2) || profile.email.slice(0, 2) || 'MS').toUpperCase()
}
