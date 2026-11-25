import type {
  ShowcaseCategory,
  ShowcaseEntryType,
  ShowcaseHubLocation,
  ShowcaseMediaKind,
  ShowcaseStatus,
} from '@mobile-station/types'

export type ShowcaseAdminFilterTab = 'all' | 'customer_feedback' | 'store_visit' | 'draft'

export interface ShowcaseFormState {
  entry_type: ShowcaseEntryType
  category: ShowcaseCategory
  media_kind: ShowcaseMediaKind
  status: ShowcaseStatus
  title: string
  quote_or_caption: string
  author_name: string
  author_city: string
  hub_location: ShowcaseHubLocation
  rating: string
  product_handle: string
  product_title: string
  media_url: string
  media_public_id: string
  thumbnail_url: string
  duration_seconds: number | null
  media_width: number | null
  media_height: number | null
  mime_type: string | null
  is_featured: boolean
  is_verified_buyer: boolean
  display_order: string
  visited_at: string
}

export interface CloudinaryDirectUploadResult {
  secure_url: string
  public_id: string
  duration?: number
  width?: number
  height?: number
  format?: string
}
