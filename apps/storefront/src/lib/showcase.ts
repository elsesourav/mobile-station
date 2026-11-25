import type {
  ShowcaseEntryDTO,
  ShowcaseEntryType,
  ShowcaseSummaryStats,
} from '@mobile-station/types'
import showcaseSeedData from '../../../../data/showcase/showcase-seed.json'

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

const BACKEND_URL = (
  process.env.MEDUSA_BACKEND_URL ||
  process.env.NEXT_PUBLIC_MEDUSA_BACKEND_URL ||
  'http://127.0.0.1:9000'
).replace(/\/$/, '')

const PUBLISHABLE_KEY = process.env.NEXT_PUBLIC_MEDUSA_PUBLISHABLE_KEY || ''

function computeStatsFromList(rows: ShowcaseEntryDTO[]): ShowcaseSummaryStats {
  const publishedRows = rows.filter((r) => r.status === 'published')
  const ratings = publishedRows
    .filter((r) => r.entry_type === 'customer_feedback' && typeof r.rating === 'number')
    .map((r) => Number(r.rating))

  return {
    total: publishedRows.length,
    published: publishedRows.length,
    drafts: 0,
    archived: 0,
    feedback_total: publishedRows.filter((r) => r.entry_type === 'customer_feedback').length,
    video_feedback_total: publishedRows.filter(
      (r) => r.entry_type === 'customer_feedback' && r.media_kind === 'video'
    ).length,
    store_visit_total: publishedRows.filter((r) => r.entry_type === 'store_visit').length,
    avg_rating:
      ratings.length > 0
        ? Math.round((ratings.reduce((sum, n) => sum + n, 0) / ratings.length) * 10) / 10
        : null,
  }
}

export function getSeedShowcaseEntries(opts: ShowcaseQueryOptions = {}): ShowcaseFeedResult {
  const allRows = (showcaseSeedData as { entries: ShowcaseEntryDTO[] }).entries.filter(
    (item) => item.status === 'published'
  )

  const filtered = allRows
    .filter((item) => {
      if (opts.entry_type && item.entry_type !== opts.entry_type) return false
      if (opts.product_handle && item.product_handle !== opts.product_handle) return false
      if (opts.featured !== undefined && item.is_featured !== opts.featured) return false
      return true
    })
    .sort((a, b) => {
      if (a.is_featured !== b.is_featured) return a.is_featured ? -1 : 1
      return a.display_order - b.display_order
    })

  return {
    items: typeof opts.limit === 'number' ? filtered.slice(0, opts.limit) : filtered,
    stats: computeStatsFromList(allRows),
    source: 'seed',
  }
}

/**
 * Fetches live published Customer Feedback & Store Visit Gallery items from Medusa backend
 * `/store/showcase` (Supabase Postgres + Redis cache), cleanly falling back to curated seed data
 * if storefront is previewed offline without backend running.
 */
export async function fetchShowcaseFeed(
  opts: ShowcaseQueryOptions = {}
): Promise<ShowcaseFeedResult> {
  const qs = new URLSearchParams()
  if (opts.entry_type) qs.set('entry_type', opts.entry_type)
  if (opts.product_handle) qs.set('product_handle', opts.product_handle)
  if (opts.featured !== undefined) qs.set('featured', String(opts.featured))
  if (opts.limit) qs.set('limit', String(opts.limit))

  const url = `${BACKEND_URL}/store/showcase${qs.toString() ? `?${qs.toString()}` : ''}`
  const headers: Record<string, string> = { Accept: 'application/json' }
  if (PUBLISHABLE_KEY) {
    headers['x-publishable-api-key'] = PUBLISHABLE_KEY
  }

  try {
    const controller = new AbortController()
    const timeout = setTimeout(() => controller.abort(), 2500)
    const res = await fetch(url, {
      headers,
      cache: 'no-store',
      signal: controller.signal,
    })
    clearTimeout(timeout)

    if (!res.ok) {
      return getSeedShowcaseEntries(opts)
    }

    const payload = (await res.json()) as {
      items?: ShowcaseEntryDTO[]
      stats?: ShowcaseSummaryStats
    }
    if (Array.isArray(payload.items) && payload.items.length > 0) {
      return {
        items: payload.items,
        stats: payload.stats ?? computeStatsFromList(payload.items),
        source: 'backend',
      }
    }

    // If backend DB hasn't been seeded yet with any published rows, preserve polished seed preview
    const fallback = getSeedShowcaseEntries(opts)
    return fallback
  } catch {
    return getSeedShowcaseEntries(opts)
  }
}
