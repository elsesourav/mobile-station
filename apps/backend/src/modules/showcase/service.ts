import { MedusaService } from '@medusajs/framework/utils'
import type {
  ShowcaseCategory,
  ShowcaseEntryType,
  ShowcaseHubLocation,
  ShowcaseMediaKind,
  ShowcaseStatus,
  ShowcaseSummaryStats,
} from '@mobile-station/types'
import { ShowcaseEntry } from './models/showcase-entry'

export interface ListShowcaseFilters {
  entry_type?: ShowcaseEntryType
  category?: ShowcaseCategory
  hub_location?: ShowcaseHubLocation
  media_kind?: ShowcaseMediaKind
  status?: ShowcaseStatus
  product_handle?: string
  is_featured?: boolean
  q?: string
  limit?: number
  offset?: number
}

export class ShowcaseModuleService extends MedusaService({
  ShowcaseEntry,
}) {
  async listFiltered(filters: ListShowcaseFilters = {}) {
    const where: Record<string, unknown> = {}
    if (filters.entry_type) where.entry_type = filters.entry_type
    if (filters.category) where.category = filters.category
    if (filters.hub_location) where.hub_location = filters.hub_location
    if (filters.media_kind) where.media_kind = filters.media_kind
    if (filters.status) where.status = filters.status
    if (filters.product_handle) where.product_handle = filters.product_handle
    if (filters.is_featured !== undefined) where.is_featured = filters.is_featured

    const allMatching = await this.listShowcaseEntries(where, {
      order: {
        is_featured: 'DESC',
        display_order: 'ASC',
        created_at: 'DESC',
      },
    })

    const needle = (filters.q || '').trim().toLowerCase()
    const searchFiltered = needle
      ? allMatching.filter((item) =>
          [
            item.title,
            item.quote_or_caption,
            item.author_name,
            item.author_city,
            item.product_title || '',
            item.product_handle || '',
          ]
            .join(' ')
            .toLowerCase()
            .includes(needle)
        )
      : allMatching

    const limit = Math.min(Math.max(filters.limit ?? 50, 1), 100)
    const offset = Math.max(filters.offset ?? 0, 0)

    return {
      items: searchFiltered.slice(offset, offset + limit),
      count: searchFiltered.length,
      limit,
      offset,
    }
  }

  async getSummaryStats(onlyPublished = false): Promise<ShowcaseSummaryStats> {
    const where = onlyPublished ? { status: 'published' as const } : {}
    const rows = await this.listShowcaseEntries(where)

    const ratings = rows
      .filter((r) => r.entry_type === 'customer_feedback' && typeof r.rating === 'number')
      .map((r) => Number(r.rating))

    const avgRating =
      ratings.length > 0
        ? Math.round((ratings.reduce((sum, n) => sum + n, 0) / ratings.length) * 10) / 10
        : null

    return {
      total: rows.length,
      published: rows.filter((r) => r.status === 'published').length,
      drafts: rows.filter((r) => r.status === 'draft').length,
      archived: rows.filter((r) => r.status === 'archived').length,
      feedback_total: rows.filter((r) => r.entry_type === 'customer_feedback').length,
      video_feedback_total: rows.filter(
        (r) => r.entry_type === 'customer_feedback' && r.media_kind === 'video'
      ).length,
      store_visit_total: rows.filter((r) => r.entry_type === 'store_visit').length,
      avg_rating: avgRating,
    }
  }
}
