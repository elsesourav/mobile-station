import type {
  ShowcaseCategory,
  ShowcaseEntryDTO,
  ShowcaseEntryType,
  ShowcaseHubLocation,
  ShowcaseSummaryStats,
} from '@mobile-station/types'

export interface ShowcaseQueryOptions {
  entry_type?: ShowcaseEntryType
  product_handle?: string
  featured?: boolean
  limit?: number
}

export interface ShowcaseFeedResult {
  items: ShowcaseEntryDTO[]
  stats: ShowcaseSummaryStats
  source: 'backend' | 'seed'
}

export type FeedbackMediaFilterTab = 'all' | 'video' | 'written'
export type GalleryHubFilterTab = 'all' | 'motijheel-842001' | 'club-road-842002'

export type PublicReviewCategory = Extract<
  ShowcaseCategory,
  'written_review' | 'in_store_pickup' | 'open_box_check'
>

export interface FeedbackSubmissionFormState {
  author_name: string
  author_city: string
  title: string
  quote_or_caption: string
  rating: number
  hub_location: ShowcaseHubLocation
  category: PublicReviewCategory
  product_title: string
}

export interface FeedbackSubmissionAlert {
  ok: boolean
  message: string
}

export interface SpecificationRow {
  key: string
  label: string
  formattedValue: string
}
