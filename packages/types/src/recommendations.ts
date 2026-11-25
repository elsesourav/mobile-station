import { z } from 'zod'
import type { StorefrontProduct } from './store-catalog'

export type RecommendationSignalType =
  | 'view'
  | 'search'
  | 'category_browse'
  | 'cart_add'
  | 'purchase'

export type RecommendationPlacement =
  | 'home_personalized'
  | 'pdp_similar'
  | 'pdp_complete_setup'
  | 'cart_cross_sell'
  | 'search_trending'

export type RecommendationReasonTag =
  | 'Spec Match'
  | 'Same Brand Ecosystem'
  | 'Pairs Well With'
  | 'Accessory Essential'
  | 'Inspired By Browsing'
  | 'Top Value Deal'
  | 'Popular In Hub'

export const recommendationSignalEventSchema = z.object({
  product_handle: z.string().trim().min(1).max(160).optional(),
  category_handle: z.string().trim().min(1).max(80).optional(),
  brand: z.string().trim().min(1).max(80).optional(),
  search_term: z.string().trim().min(1).max(120).optional(),
  signal_type: z.enum(['view', 'search', 'category_browse', 'cart_add', 'purchase']),
})

export type RecommendationSignalPayload = z.infer<typeof recommendationSignalEventSchema>

export interface UserBehaviorEvent {
  id: string
  productHandle?: string
  categoryHandle?: string
  brand?: string
  searchTerm?: string
  signalType: RecommendationSignalType
  timestamp: number
}

export interface PriceBandPreference {
  minPaise: number
  maxPaise: number
  medianPaise: number
}

export interface UserBehaviorProfile {
  events: UserBehaviorEvent[]
  preferredCategories: Record<string, number>
  preferredBrands: Record<string, number>
  recentlyViewedHandles: string[]
  searchKeywords: string[]
  priceBand: PriceBandPreference | null
  totalWeightedScore: number
}

export interface RecommendedProductItem {
  product: StorefrontProduct
  score: number
  reason: RecommendationReasonTag
  explanation: string
}

export interface PdpRecommendationsResult {
  completeSetup: RecommendedProductItem[]
  similarAlternatives: RecommendedProductItem[]
}

export interface BackendPopularityEntry {
  handle: string
  score: number
}

export interface BackendPopularityResponse {
  items: BackendPopularityEntry[]
  source: 'redis' | 'fallback'
}

export interface RecommendationTelemetryResponse {
  recorded: boolean
  signal_type: RecommendationSignalType
}

export interface BehaviorContextValue {
  profile: UserBehaviorProfile
  hasPersonalizedSignals: boolean
  trackProductView: (product: StorefrontProduct) => void
  trackCategoryBrowse: (categoryHandle: string) => void
  trackSearchQuery: (searchTerm: string) => void
  trackCartAdd: (params: {
    productHandle: string
    brand?: string
    categoryHandle?: string
  }) => void
  trackPurchase: (productHandles: string[]) => void
  clearBehaviorHistory: () => void
}
