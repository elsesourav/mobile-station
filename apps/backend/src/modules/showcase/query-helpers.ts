import type { MedusaRequest } from '@medusajs/framework/http'
import {
  SHOWCASE_CATEGORIES,
  SHOWCASE_ENTRY_TYPES,
  SHOWCASE_HUB_LOCATIONS,
  SHOWCASE_MEDIA_KINDS,
  SHOWCASE_STATUSES,
  type ShowcaseCategory,
  type ShowcaseEntryType,
  type ShowcaseHubLocation,
  type ShowcaseMediaKind,
  type ShowcaseStatus,
} from '@mobile-station/types'
import type { ListShowcaseFilters } from './service'

function oneOf<T extends string>(val: unknown, allowed: readonly T[]): T | undefined {
  if (typeof val !== 'string') return undefined
  const trimmed = val.trim()
  return (allowed as readonly string[]).includes(trimmed) ? (trimmed as T) : undefined
}

export function parseShowcaseListQuery(
  req: MedusaRequest,
  forcePublishedOnly = false
): ListShowcaseFilters {
  const q = req.query ?? {}
  const featuredRaw = typeof q.featured === 'string' ? q.featured : q.is_featured
  let is_featured: boolean | undefined
  if (featuredRaw === 'true') is_featured = true
  else if (featuredRaw === 'false') is_featured = false

  const limitNum = Number(q.limit)
  const offsetNum = Number(q.offset)

  return {
    entry_type: oneOf<ShowcaseEntryType>(q.entry_type, SHOWCASE_ENTRY_TYPES),
    category: oneOf<ShowcaseCategory>(q.category, SHOWCASE_CATEGORIES),
    hub_location: oneOf<ShowcaseHubLocation>(q.hub_location, SHOWCASE_HUB_LOCATIONS),
    media_kind: oneOf<ShowcaseMediaKind>(q.media_kind, SHOWCASE_MEDIA_KINDS),
    status: forcePublishedOnly ? 'published' : oneOf<ShowcaseStatus>(q.status, SHOWCASE_STATUSES),
    product_handle:
      typeof q.product_handle === 'string' && q.product_handle.trim()
        ? q.product_handle.trim()
        : undefined,
    is_featured,
    q: typeof q.q === 'string' && q.q.trim() ? q.q.trim() : undefined,
    limit: Number.isFinite(limitNum) && limitNum > 0 ? Math.min(limitNum, 100) : 50,
    offset: Number.isFinite(offsetNum) && offsetNum >= 0 ? offsetNum : 0,
  }
}

export function formatShowcaseRecord(row: Record<string, unknown>) {
  const isoOrNull = (v: unknown) => {
    if (!v) return null
    if (v instanceof Date) return v.toISOString()
    return String(v)
  }

  return {
    ...row,
    visited_at: isoOrNull(row.visited_at),
    created_at: isoOrNull(row.created_at) ?? new Date().toISOString(),
    updated_at: isoOrNull(row.updated_at) ?? new Date().toISOString(),
  }
}
