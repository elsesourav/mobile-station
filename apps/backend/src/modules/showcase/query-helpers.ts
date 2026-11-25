import type { MedusaRequest } from '@medusajs/framework/http'
import {
  SHOWCASE_CATEGORIES,
  SHOWCASE_ENTRY_TYPES,
  SHOWCASE_HUB_LOCATIONS,
  SHOWCASE_MEDIA_KINDS,
  SHOWCASE_STATUSES,
  type ShowcaseCategory,
  type ShowcaseEntryDTO,
  type ShowcaseEntryType,
  type ShowcaseHubLocation,
  type ShowcaseMediaKind,
  type ShowcaseStatus,
} from '@mobile-station/types'
import type { ListShowcaseFilters, PersistedShowcaseEntry } from '../../types/showcase-backend'

function matchAllowedEnum<T extends string>(
  rawValue: unknown,
  allowedValues: readonly T[]
): T | undefined {
  if (typeof rawValue !== 'string') return undefined
  const trimmed = rawValue.trim()
  return (allowedValues as readonly string[]).includes(trimmed) ? (trimmed as T) : undefined
}

function toIsoStringOrNull(dateValue: Date | string | null | undefined): string | null {
  if (!dateValue) return null
  if (dateValue instanceof Date) return dateValue.toISOString()
  return String(dateValue)
}

export function parseShowcaseListQuery(
  req: MedusaRequest,
  forcePublishedOnly = false
): ListShowcaseFilters {
  const query = req.query ?? {}
  const featuredRaw = typeof query.featured === 'string' ? query.featured : query.is_featured
  let is_featured: boolean | undefined
  if (featuredRaw === 'true') is_featured = true
  else if (featuredRaw === 'false') is_featured = false

  const limitNum = Number(query.limit)
  const offsetNum = Number(query.offset)
  const searchRaw =
    typeof query.search === 'string'
      ? query.search
      : typeof query.q === 'string'
        ? query.q
        : ''

  return {
    entry_type: matchAllowedEnum<ShowcaseEntryType>(query.entry_type, SHOWCASE_ENTRY_TYPES),
    category: matchAllowedEnum<ShowcaseCategory>(query.category, SHOWCASE_CATEGORIES),
    hub_location: matchAllowedEnum<ShowcaseHubLocation>(query.hub_location, SHOWCASE_HUB_LOCATIONS),
    media_kind: matchAllowedEnum<ShowcaseMediaKind>(query.media_kind, SHOWCASE_MEDIA_KINDS),
    status: forcePublishedOnly
      ? 'published'
      : matchAllowedEnum<ShowcaseStatus>(query.status, SHOWCASE_STATUSES),
    product_handle:
      typeof query.product_handle === 'string' && query.product_handle.trim()
        ? query.product_handle.trim()
        : undefined,
    is_featured,
    search: searchRaw.trim() || undefined,
    limit: Number.isFinite(limitNum) && limitNum > 0 ? Math.min(limitNum, 100) : 50,
    offset: Number.isFinite(offsetNum) && offsetNum >= 0 ? offsetNum : 0,
  }
}

export function formatShowcaseRecord(entry: PersistedShowcaseEntry): ShowcaseEntryDTO {
  return {
    id: entry.id,
    entry_type: entry.entry_type,
    category: entry.category,
    media_kind: entry.media_kind,
    status: entry.status,
    title: entry.title,
    quote_or_caption: entry.quote_or_caption,
    author_name: entry.author_name,
    author_city: entry.author_city,
    hub_location: entry.hub_location,
    rating: entry.rating,
    product_handle: entry.product_handle,
    product_title: entry.product_title,
    media_url: entry.media_url,
    media_public_id: entry.media_public_id,
    thumbnail_url: entry.thumbnail_url,
    duration_seconds: entry.duration_seconds,
    media_width: entry.media_width,
    media_height: entry.media_height,
    mime_type: entry.mime_type,
    is_featured: entry.is_featured,
    is_verified_buyer: entry.is_verified_buyer,
    display_order: entry.display_order,
    visited_at: toIsoStringOrNull(entry.visited_at),
    created_at: toIsoStringOrNull(entry.created_at) ?? new Date().toISOString(),
    updated_at: toIsoStringOrNull(entry.updated_at) ?? new Date().toISOString(),
  }
}
