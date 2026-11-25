import { z } from 'zod'

export const SHOWCASE_ENTRY_TYPES = ['customer_feedback', 'store_visit'] as const
export type ShowcaseEntryType = (typeof SHOWCASE_ENTRY_TYPES)[number]

export const SHOWCASE_MEDIA_KINDS = ['video', 'image', 'none'] as const
export type ShowcaseMediaKind = (typeof SHOWCASE_MEDIA_KINDS)[number]

export const SHOWCASE_STATUSES = ['draft', 'published', 'archived'] as const
export type ShowcaseStatus = (typeof SHOWCASE_STATUSES)[number]

export const SHOWCASE_HUB_LOCATIONS = [
  'motijheel-842001',
  'club-road-842002',
  'online-pan-india',
] as const
export type ShowcaseHubLocation = (typeof SHOWCASE_HUB_LOCATIONS)[number]

export const SHOWCASE_CATEGORIES = [
  'video_unboxing',
  'video_review',
  'in_store_pickup',
  'open_box_check',
  'audio_keyboard_demo',
  'launch_event',
  'customer_selfie',
  'written_review',
] as const
export type ShowcaseCategory = (typeof SHOWCASE_CATEGORIES)[number]

export const SHOWCASE_TYPE_LABELS: Record<ShowcaseEntryType, string> = {
  customer_feedback: 'Customer Feedback',
  store_visit: 'Store Visit Gallery',
}

export const SHOWCASE_CATEGORY_LABELS: Record<ShowcaseCategory, string> = {
  video_unboxing: 'Video Unboxing',
  video_review: 'Video Review',
  in_store_pickup: 'In-Store Pickup',
  open_box_check: 'Open-Box IMEI Check',
  audio_keyboard_demo: 'Audio & Keyboard Demo',
  launch_event: 'Flagship Launch Day',
  customer_selfie: 'Buyer Desk Moment',
  written_review: 'Verified Review',
}

export const SHOWCASE_HUB_LABELS: Record<ShowcaseHubLocation, string> = {
  'motijheel-842001': 'Motijheel Flagship Hub (842001)',
  'club-road-842002': 'Club Road Tech Center (842002)',
  'online-pan-india': 'Pan-India Insured Delivery',
}

export const SHOWCASE_STATUS_LABELS: Record<ShowcaseStatus, string> = {
  draft: 'Draft / Pending Review',
  published: 'Published Live',
  archived: 'Archived',
}

export interface ShowcaseEntryDTO {
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
  visited_at: string | null
  created_at: string
  updated_at: string
}

export interface ShowcaseSummaryStats {
  total: number
  published: number
  drafts: number
  archived: number
  feedback_total: number
  video_feedback_total: number
  store_visit_total: number
  avg_rating: number | null
}

export interface ShowcaseListQueryParams {
  entry_type?: ShowcaseEntryType
  category?: ShowcaseCategory
  hub_location?: ShowcaseHubLocation
  media_kind?: ShowcaseMediaKind
  status?: ShowcaseStatus
  product_handle?: string
  is_featured?: boolean
  search?: string
  limit?: number
  offset?: number
}

export interface ShowcaseListResponse {
  items: ShowcaseEntryDTO[]
  count: number
  limit: number
  offset: number
  stats: ShowcaseSummaryStats
}

export interface ShowcaseMutationResponse {
  item: ShowcaseEntryDTO
}

export interface ShowcaseDeleteResponse {
  id: string
  deleted: boolean
}

export interface PublicFeedbackSubmitResponse {
  id: string
  status: ShowcaseStatus
  message: string
}

export interface ShowcaseSignedUploadPayload {
  cloud_name: string
  api_key: string
  timestamp: number
  signature: string
  folder: string
  resource_type: 'video' | 'image'
  upload_url: string
  tags: string
  eager?: string
  max_file_size_bytes: number
}

export interface ApiValidationIssue {
  path: Array<string | number>
  message: string
}

export interface ApiErrorResponse {
  type: string
  message: string
  issues?: ApiValidationIssue[]
}

export interface ShowcaseUploadMediaResult {
  media_url: string
  media_public_id: string
  thumbnail_url: string
  duration_seconds: number | null
  media_width: number | null
  media_height: number | null
  mime_type: string | null
}

export const createShowcaseEntrySchema = z
  .object({
    entry_type: z.enum(SHOWCASE_ENTRY_TYPES),
    category: z.enum(SHOWCASE_CATEGORIES),
    media_kind: z.enum(SHOWCASE_MEDIA_KINDS).default('video'),
    status: z.enum(SHOWCASE_STATUSES).default('published'),
    title: z.string().trim().min(3, 'Title must be at least 3 characters').max(140),
    quote_or_caption: z
      .string()
      .trim()
      .min(5, 'Feedback or caption must be at least 5 characters')
      .max(1200),
    author_name: z.string().trim().min(2, 'Customer / visitor name is required').max(80),
    author_city: z.string().trim().min(2).max(80).default('Muzaffarpur, Bihar'),
    hub_location: z.enum(SHOWCASE_HUB_LOCATIONS).default('motijheel-842001'),
    rating: z.number().int().min(1).max(5).nullable().optional().default(5),
    product_handle: z.string().trim().max(120).nullable().optional().default(null),
    product_title: z.string().trim().max(160).nullable().optional().default(null),
    media_url: z.string().trim().url('Provide a valid media URL').nullable().optional().default(null),
    media_public_id: z.string().trim().max(240).nullable().optional().default(null),
    thumbnail_url: z.string().trim().url('Provide a valid thumbnail URL').nullable().optional().default(null),
    duration_seconds: z.number().nonnegative().max(3600).nullable().optional().default(null),
    media_width: z.number().int().positive().max(8192).nullable().optional().default(null),
    media_height: z.number().int().positive().max(8192).nullable().optional().default(null),
    mime_type: z.string().trim().max(80).nullable().optional().default(null),
    is_featured: z.boolean().default(false),
    is_verified_buyer: z.boolean().default(true),
    display_order: z.number().int().min(0).max(10000).default(100),
    visited_at: z.string().trim().nullable().optional().default(null),
  })
  .superRefine((val, ctx) => {
    if (val.media_kind !== 'none' && !val.media_url) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ['media_url'],
        message: 'Upload or link a media file when media_kind is video or image',
      })
    }
    if (val.entry_type === 'customer_feedback' && val.rating === null) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ['rating'],
        message: 'Rating (1-5) is required for customer feedback entries',
      })
    }
  })

export const updateShowcaseEntrySchema = z.object({
  entry_type: z.enum(SHOWCASE_ENTRY_TYPES).optional(),
  category: z.enum(SHOWCASE_CATEGORIES).optional(),
  media_kind: z.enum(SHOWCASE_MEDIA_KINDS).optional(),
  status: z.enum(SHOWCASE_STATUSES).optional(),
  title: z.string().trim().min(3).max(140).optional(),
  quote_or_caption: z.string().trim().min(5).max(1200).optional(),
  author_name: z.string().trim().min(2).max(80).optional(),
  author_city: z.string().trim().min(2).max(80).optional(),
  hub_location: z.enum(SHOWCASE_HUB_LOCATIONS).optional(),
  rating: z.number().int().min(1).max(5).nullable().optional(),
  product_handle: z.string().trim().max(120).nullable().optional(),
  product_title: z.string().trim().max(160).nullable().optional(),
  media_url: z.string().trim().url().nullable().optional(),
  media_public_id: z.string().trim().max(240).nullable().optional(),
  thumbnail_url: z.string().trim().url().nullable().optional(),
  duration_seconds: z.number().nonnegative().max(3600).nullable().optional(),
  media_width: z.number().int().positive().max(8192).nullable().optional(),
  media_height: z.number().int().positive().max(8192).nullable().optional(),
  mime_type: z.string().trim().max(80).nullable().optional(),
  is_featured: z.boolean().optional(),
  is_verified_buyer: z.boolean().optional(),
  display_order: z.number().int().min(0).max(10000).optional(),
  visited_at: z.string().trim().nullable().optional(),
})

export const publicFeedbackSubmitSchema = z.object({
  entry_type: z.literal('customer_feedback').default('customer_feedback'),
  category: z
    .enum(['written_review', 'in_store_pickup', 'open_box_check', 'audio_keyboard_demo'])
    .default('written_review'),
  title: z.string().trim().min(4, 'Give your review a concise headline').max(120),
  quote_or_caption: z.string().trim().min(10, 'Share at least 10 characters about your experience').max(800),
  author_name: z.string().trim().min(2, 'Enter your name').max(80),
  author_city: z.string().trim().min(2, 'Enter your city').max(80),
  hub_location: z.enum(SHOWCASE_HUB_LOCATIONS).default('online-pan-india'),
  rating: z.number().int().min(1).max(5),
  product_handle: z.string().trim().max(120).nullable().optional().default(null),
  product_title: z.string().trim().max(160).nullable().optional().default(null),
})

export const uploadSignatureRequestSchema = z.object({
  entry_type: z.enum(SHOWCASE_ENTRY_TYPES),
  media_kind: z.enum(['video', 'image']),
  filename: z.string().trim().min(1).max(180).optional(),
  mime_type: z.string().trim().min(3).max(80).optional(),
  file_size_bytes: z.number().int().positive().max(105 * 1024 * 1024).optional(),
})

export type CreateShowcaseEntryInput = z.infer<typeof createShowcaseEntrySchema>
export type UpdateShowcaseEntryInput = z.infer<typeof updateShowcaseEntrySchema>
export type PublicFeedbackSubmitInput = z.infer<typeof publicFeedbackSubmitSchema>
export type UploadSignatureRequestInput = z.infer<typeof uploadSignatureRequestSchema>
