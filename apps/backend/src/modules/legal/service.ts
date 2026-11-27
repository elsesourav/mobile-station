import { MedusaService } from '@medusajs/framework/utils'
import type {
  LegalQueryWhere,
  ListLegalFilters,
  PersistedLegalDocument,
} from '../../types/legal-backend'
import { LegalDocument } from './models/legal-document'

export class LegalModuleService extends MedusaService({
  LegalDocument,
}) {
  async listOrdered(filters: ListLegalFilters = {}): Promise<PersistedLegalDocument[]> {
    const where: LegalQueryWhere = {}
    if (filters.category) where.category = filters.category
    if (filters.status) where.status = filters.status
    if (filters.footer_only) where.show_in_footer = true

    const rows = (await this.listLegalDocuments(where, {
      order: {
        display_order: 'ASC',
        created_at: 'ASC',
      },
      take: 100,
    })) as PersistedLegalDocument[]

    const needle = filters.search?.trim().toLowerCase()
    if (!needle) return rows

    return rows.filter((doc) =>
      [doc.slug, doc.title, doc.badge, doc.summary, doc.content_markdown]
        .join(' ')
        .toLowerCase()
        .includes(needle)
    )
  }

  async findBySlug(slug: string, publishedOnly = false): Promise<PersistedLegalDocument | null> {
    const normalized = slug.trim().toLowerCase()
    if (!normalized) return null

    const where: { slug: string; status?: 'published' } = { slug: normalized }
    if (publishedOnly) where.status = 'published'

    const rows = (await this.listLegalDocuments(where, { take: 1 })) as PersistedLegalDocument[]
    return rows[0] ?? null
  }
}
