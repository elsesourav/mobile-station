import type {
  ShowcaseCategory,
  ShowcaseEntryType,
  ShowcaseHubLocation,
  ShowcaseMediaKind,
  ShowcaseStatus,
} from '@mobile-station/types'

export interface PersistedShowcaseEntry {
  id: string
  entry_type: ShowcaseEntryType
  category: ShowcaseCategory
  media_kind: ShowcaseMediaKind
  status: ShowcaseStatus
  title: string
  quote_or_caption: string
  author_name: string
  author_city: string
  hub_location: ShowcaseHubLocation
  rating: number | null
  product_handle: string | null
  product_title: string | null
  media_url: string | null
  media_public_id: string | null
  thumbnail_url: string | null
  duration_seconds: number | null
  media_width: number | null
  media_height: number | null
  mime_type: string | null
  is_featured: boolean
  is_verified_buyer: boolean
  display_order: number
  visited_at: Date | string | null
  created_at?: Date | string | null
  updated_at?: Date | string | null
  deleted_at?: Date | string | null
}

export interface ShowcaseQueryWhere {
  entry_type?: ShowcaseEntryType
  category?: ShowcaseCategory
  hub_location?: ShowcaseHubLocation
  media_kind?: ShowcaseMediaKind
  status?: ShowcaseStatus
  product_handle?: string
  is_featured?: boolean
}

export interface ListShowcaseFilters {
  entry_type?: ShowcaseEntryType
  category?: ShowcaseCategory
  hub_location?: ShowcaseHubLocation
  media_kind?: ShowcaseMediaKind
  status?: ShowcaseStatus
  product_handle?: string
  is_featured?: boolean
  search?: string
  q?: string
  limit?: number
  offset?: number
}

export interface SeedShowcaseEntryInput {
  entry_type: ShowcaseEntryType
  category: ShowcaseCategory
  media_kind: ShowcaseMediaKind
  status: ShowcaseStatus
  title: string
  quote_or_caption: string
  author_name: string
  author_city: string
  hub_location: ShowcaseHubLocation
  rating: number | null
  product_handle: string | null
  product_title: string | null
  media_url: string | null
  media_public_id: string | null
  thumbnail_url: string | null
  duration_seconds: number | null
  media_width: number | null
  media_height: number | null
  mime_type: string | null
  is_featured: boolean
  is_verified_buyer: boolean
  display_order: number
  visited_at: string | null
}

export interface SeedShowcaseDataset {
  entries: SeedShowcaseEntryInput[]
}

export interface ShowcaseRateLimitStatus {
  allowed: boolean
  remaining: number
}

export interface ShowcaseAssetDestructionResult {
  deleted: boolean
  publicId: string | null
}
