import { model } from '@medusajs/framework/utils'
import { LEGAL_CATEGORIES, LEGAL_DOCUMENT_STATUSES } from '@mobile-station/types'

export const LegalDocument = model.define('legal_document', {
  id: model.id().primaryKey(),
  slug: model.text().unique(),
  title: model.text().searchable(),
  badge: model.text().default('LEGAL & POLICY'),
  category: model.enum([...LEGAL_CATEGORIES]).default('privacy'),
  summary: model.text(),
  content_markdown: model.text(),
  status: model.enum([...LEGAL_DOCUMENT_STATUSES]).default('published'),
  show_in_footer: model.boolean().default(true),
  display_order: model.number().default(100),
  version_label: model.text().default('v1.0'),
  effective_date: model.text().nullable(),
  updated_by: model.text().nullable(),
})
