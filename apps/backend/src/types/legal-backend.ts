import type { LegalCategory, LegalDocumentStatus } from '@mobile-station/types'

export interface PersistedLegalDocument {
  id: string
  slug: string
  title: string
  badge: string
  category: LegalCategory
  summary: string
  content_markdown: string
  status: LegalDocumentStatus
  show_in_footer: boolean
  display_order: number
  version_label: string
  effective_date: string | null
  updated_by: string | null
  created_at: Date | string
  updated_at: Date | string
  deleted_at?: Date | string | null
}

export interface ListLegalFilters {
  category?: LegalCategory
  status?: LegalDocumentStatus
  footer_only?: boolean
  search?: string
}

export interface LegalQueryWhere {
  category?: LegalCategory
  status?: LegalDocumentStatus
  show_in_footer?: boolean
}
