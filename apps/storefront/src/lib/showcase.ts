import type {
  ShowcaseEntryDTO,
  ShowcaseListResponse,
  ShowcaseSummaryStats,
} from '@mobile-station/types'
import showcaseSeedData from '../../../../data/showcase/showcase-seed.json'
import type { ShowcaseFeedResult, ShowcaseQueryOptions } from '@/types/storefront'

const BACKEND_URL = (
  process.env.MEDUSA_BACKEND_URL ||
  process.env.NEXT_PUBLIC_MEDUSA_BACKEND_URL ||
  'http://127.0.0.1:9000'
).replace(/\/$/, '')

const PUBLISHABLE_KEY = process.env.NEXT_PUBLIC_MEDUSA_PUBLISHABLE_KEY || ''

function computeStatsFromList(rows: ShowcaseEntryDTO[]): ShowcaseSummaryStats {
  const publishedRows = rows.filter((entry) => entry.status === 'published')
  const ratings = publishedRows
    .filter((entry) => entry.entry_type === 'customer_feedback' && typeof entry.rating === 'number')
    .map((entry) => Number(entry.rating))

  return {
    total: publishedRows.length,
    published: publishedRows.length,
    drafts: 0,
    archived: 0,
    feedback_total: publishedRows.filter((entry) => entry.entry_type === 'customer_feedback')
      .length,
    video_feedback_total: publishedRows.filter(
      (entry) => entry.entry_type === 'customer_feedback' && entry.media_kind === 'video'
    ).length,
    store_visit_total: publishedRows.filter((entry) => entry.entry_type === 'store_visit').length,
    avg_rating:
      ratings.length > 0
        ? Math.round((ratings.reduce((sum, score) => sum + score, 0) / ratings.length) * 10) / 10
        : null,
  }
}

export function getSeedShowcaseEntries(options: ShowcaseQueryOptions = {}): ShowcaseFeedResult {
  const seedPayload = showcaseSeedData as { entries: ShowcaseEntryDTO[] }
  const publishedRows = seedPayload.entries.filter((entry) => entry.status === 'published')

  const filtered = publishedRows
    .filter((entry) => {
      if (options.entry_type && entry.entry_type !== options.entry_type) return false
      if (options.product_handle && entry.product_handle !== options.product_handle) return false
      if (options.featured !== undefined && entry.is_featured !== options.featured) return false
      return true
    })
    .sort((first, second) => {
      if (first.is_featured !== second.is_featured) return first.is_featured ? -1 : 1
      return first.display_order - second.display_order
    })

  return {
    items: typeof options.limit === 'number' ? filtered.slice(0, options.limit) : filtered,
    stats: computeStatsFromList(publishedRows),
    source: 'seed',
  }
}

/**
 * Fetches live published Customer Feedback and Store Visit Gallery items from Medusa backend
 * `/store/showcase`, falling back to curated seed data if offline.
 */
export async function fetchShowcaseFeed(
  options: ShowcaseQueryOptions = {}
): Promise<ShowcaseFeedResult> {
  const queryParams = new URLSearchParams()
  if (options.entry_type) queryParams.set('entry_type', options.entry_type)
  if (options.product_handle) queryParams.set('product_handle', options.product_handle)
  if (options.featured !== undefined) queryParams.set('featured', String(options.featured))
  if (options.limit) queryParams.set('limit', String(options.limit))

  const requestUrl = `${BACKEND_URL}/store/showcase${queryParams.toString() ? `?${queryParams.toString()}` : ''}`
  const headers = new Headers({ Accept: 'application/json' })
  if (PUBLISHABLE_KEY) {
    headers.set('x-publishable-api-key', PUBLISHABLE_KEY)
  }

  try {
    const controller = new AbortController()
    const timeout = setTimeout(() => controller.abort(), 2500)
    const response = await fetch(requestUrl, {
      headers,
      cache: 'no-store',
      signal: controller.signal,
    })
    clearTimeout(timeout)

    if (!response.ok) {
      return getSeedShowcaseEntries(options)
    }

    const payload = (await response.json()) as Partial<ShowcaseListResponse>
    if (Array.isArray(payload.items) && payload.items.length > 0) {
      return {
        items: payload.items,
        stats: payload.stats ?? computeStatsFromList(payload.items),
        source: 'backend',
      }
    }

    return getSeedShowcaseEntries(options)
  } catch {
    return getSeedShowcaseEntries(options)
  }
}
