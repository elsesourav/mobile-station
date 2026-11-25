import type {
  RecommendationSignalType,
  StorefrontProduct,
  UserBehaviorEvent,
  UserBehaviorProfile,
} from '@mobile-station/types'
import { getEffectivePricePaise } from '@/lib/recommendations/similarity'

export const BEHAVIOR_STORAGE_KEY = 'mobile_station_behavior_v1'
export const MAX_STORED_EVENTS = 50
export const SESSION_HALF_LIFE_MS = 30 * 60 * 1000 // 30 minutes exponential decay

export const SIGNAL_ACTION_WEIGHTS: Record<RecommendationSignalType, number> = {
  category_browse: 0.85,
  view: 1.0,
  search: 1.4,
  cart_add: 2.8,
  purchase: 4.5,
}

export const EMPTY_BEHAVIOR_PROFILE: UserBehaviorProfile = {
  events: [],
  preferredCategories: {},
  preferredBrands: {},
  recentlyViewedHandles: [],
  searchKeywords: [],
  priceBand: null,
  totalWeightedScore: 0,
}

/**
 * Exponential time-decay formula: W = exp(-(ln(2) / halfLifeMs) * ageMs).
 * Actions in the last few minutes strongly dominate older clicks in the session.
 */
export function computeTimeDecayWeight(
  eventTimestamp: number,
  currentTimestamp: number,
  halfLifeMs = SESSION_HALF_LIFE_MS
): number {
  const ageMs = Math.max(0, currentTimestamp - eventTimestamp)
  const lambda = Math.LN2 / halfLifeMs
  return Math.exp(-lambda * ageMs)
}

export function getEventCombinedWeight(
  event: UserBehaviorEvent,
  currentTimestamp: number
): number {
  const actionWeight = SIGNAL_ACTION_WEIGHTS[event.signalType] ?? 1.0
  const decayWeight = computeTimeDecayWeight(event.timestamp, currentTimestamp)
  return actionWeight * decayWeight
}

/**
 * Aggregates raw click/view/search/cart telemetry into a weighted UserBehaviorProfile.
 */
export function buildBehaviorProfile(
  events: readonly UserBehaviorEvent[],
  productsByHandle: Map<string, StorefrontProduct>,
  currentTimestamp = Date.now()
): UserBehaviorProfile {
  if (events.length === 0) return EMPTY_BEHAVIOR_PROFILE

  const preferredCategories: Record<string, number> = {}
  const preferredBrands: Record<string, number> = {}
  const viewedSet = new Set<string>()
  const recentlyViewedHandles: string[] = []
  const searchSet = new Set<string>()
  const observedPrices: number[] = []
  let totalWeightedScore = 0

  const orderedNewestFirst = [...events].sort((a, b) => b.timestamp - a.timestamp)

  for (const event of orderedNewestFirst) {
    const weight = getEventCombinedWeight(event, currentTimestamp)
    totalWeightedScore += weight

    const product = event.productHandle ? productsByHandle.get(event.productHandle) : undefined
    const categoryHandle = event.categoryHandle ?? product?.category_handle
    const brandName = event.brand ?? product?.metadata.brand

    if (categoryHandle) {
      preferredCategories[categoryHandle] = (preferredCategories[categoryHandle] ?? 0) + weight
    }
    if (brandName) {
      const normalized = brandName.toLowerCase()
      preferredBrands[normalized] = (preferredBrands[normalized] ?? 0) + weight
    }
    if (product) {
      observedPrices.push(getEffectivePricePaise(product))
    }
    if (event.productHandle && event.signalType === 'view' && !viewedSet.has(event.productHandle)) {
      viewedSet.add(event.productHandle)
      recentlyViewedHandles.push(event.productHandle)
    }
    if (event.searchTerm && !searchSet.has(event.searchTerm.toLowerCase())) {
      searchSet.add(event.searchTerm.toLowerCase())
    }
  }

  let priceBand: UserBehaviorProfile['priceBand'] = null
  if (observedPrices.length > 0) {
    const sorted = [...observedPrices].sort((a, b) => a - b)
    const mid = Math.floor(sorted.length / 2)
    const medianPaise =
      sorted.length % 2 === 1 ? sorted[mid] : Math.round((sorted[mid - 1] + sorted[mid]) / 2)
    priceBand = {
      minPaise: sorted[0],
      maxPaise: sorted[sorted.length - 1],
      medianPaise,
    }
  }

  return {
    events: orderedNewestFirst.slice(0, MAX_STORED_EVENTS),
    preferredCategories,
    preferredBrands,
    recentlyViewedHandles: recentlyViewedHandles.slice(0, 8),
    searchKeywords: Array.from(searchSet).slice(0, 6),
    priceBand,
    totalWeightedScore,
  }
}

export function loadBehaviorEvents(): UserBehaviorEvent[] {
  if (typeof window === 'undefined') return []
  try {
    const raw = window.localStorage.getItem(BEHAVIOR_STORAGE_KEY)
    if (!raw) return []
    const parsed = JSON.parse(raw) as unknown
    if (!Array.isArray(parsed)) return []
    return parsed.filter(
      (item): item is UserBehaviorEvent =>
        Boolean(item) &&
        typeof item === 'object' &&
        typeof (item as UserBehaviorEvent).signalType === 'string' &&
        typeof (item as UserBehaviorEvent).timestamp === 'number'
    )
  } catch {
    return []
  }
}

export function saveBehaviorEvents(events: readonly UserBehaviorEvent[]): void {
  if (typeof window === 'undefined') return
  try {
    window.localStorage.setItem(
      BEHAVIOR_STORAGE_KEY,
      JSON.stringify(events.slice(0, MAX_STORED_EVENTS))
    )
  } catch {
    // Ignore storage quota / private-browsing failures safely
  }
}

export function clearStoredBehaviorEvents(): void {
  if (typeof window === 'undefined') return
  try {
    window.localStorage.removeItem(BEHAVIOR_STORAGE_KEY)
  } catch {
    // Ignore storage failures cleanly
  }
}
