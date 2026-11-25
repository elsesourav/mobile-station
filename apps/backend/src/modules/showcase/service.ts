import { MedusaService } from '@medusajs/framework/utils'
import type { ShowcaseSummaryStats } from '@mobile-station/types'
import type {
  ListShowcaseFilters,
  PersistedShowcaseEntry,
  ShowcaseQueryWhere,
} from '../../types/showcase-backend'
import { ShowcaseEntry } from './models/showcase-entry'

export class ShowcaseModuleService extends MedusaService({
  ShowcaseEntry,
}) {
  async listFiltered(filters: ListShowcaseFilters = {}): Promise<{
    items: PersistedShowcaseEntry[]
    count: number
    limit: number
    offset: number
  }> {
    const where: ShowcaseQueryWhere = {}
    if (filters.entry_type) where.entry_type = filters.entry_type
    if (filters.category) where.category = filters.category
    if (filters.hub_location) where.hub_location = filters.hub_location
    if (filters.media_kind) where.media_kind = filters.media_kind
    if (filters.status) where.status = filters.status
    if (filters.product_handle) where.product_handle = filters.product_handle
    if (filters.is_featured !== undefined) where.is_featured = filters.is_featured

    const allMatching = (await this.listShowcaseEntries(where, {
      order: {
        is_featured: 'DESC',
        display_order: 'ASC',
        created_at: 'DESC',
      },
    })) as PersistedShowcaseEntry[]

    const searchNeedle = (filters.search || filters.q || '').trim().toLowerCase()
    const matchingEntries = searchNeedle
      ? allMatching.filter((entry) =>
          [
            entry.title,
            entry.quote_or_caption,
            entry.author_name,
            entry.author_city,
            entry.product_title || '',
            entry.product_handle || '',
          ]
            .join(' ')
            .toLowerCase()
            .includes(searchNeedle)
        )
      : allMatching

    const limit = Math.min(Math.max(filters.limit ?? 50, 1), 100)
    const offset = Math.max(filters.offset ?? 0, 0)

    return {
      items: matchingEntries.slice(offset, offset + limit),
      count: matchingEntries.length,
      limit,
      offset,
    }
  }

  async getSummaryStats(onlyPublished = false): Promise<ShowcaseSummaryStats> {
    const where: ShowcaseQueryWhere = onlyPublished ? { status: 'published' } : {}
    const rows = (await this.listShowcaseEntries(where)) as PersistedShowcaseEntry[]

    const ratings = rows
      .filter((entry) => entry.entry_type === 'customer_feedback' && typeof entry.rating === 'number')
      .map((entry) => Number(entry.rating))

    const avgRating =
      ratings.length > 0
        ? Math.round((ratings.reduce((sum, score) => sum + score, 0) / ratings.length) * 10) / 10
        : null

    return {
      total: rows.length,
      published: rows.filter((entry) => entry.status === 'published').length,
      drafts: rows.filter((entry) => entry.status === 'draft').length,
      archived: rows.filter((entry) => entry.status === 'archived').length,
      feedback_total: rows.filter((entry) => entry.entry_type === 'customer_feedback').length,
      video_feedback_total: rows.filter(
        (entry) => entry.entry_type === 'customer_feedback' && entry.media_kind === 'video'
      ).length,
      store_visit_total: rows.filter((entry) => entry.entry_type === 'store_visit').length,
      avg_rating: avgRating,
    }
  }
}
