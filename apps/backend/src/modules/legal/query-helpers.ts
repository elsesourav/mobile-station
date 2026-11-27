import fs from 'node:fs'
import path from 'node:path'
import type { CreateLegalDocumentInput, LegalDocumentDTO } from '@mobile-station/types'
import type { PersistedLegalDocument } from '../../types/legal-backend'
import type { LegalModuleService } from './service'
import { invalidateLegalCache } from './cache'

function toIsoStringOrNow(value: Date | string | null | undefined): string {
  if (!value) return new Date().toISOString()
  if (value instanceof Date) return value.toISOString()
  return String(value)
}

export function formatLegalRecord(doc: PersistedLegalDocument): LegalDocumentDTO {
  return {
    id: doc.id,
    slug: doc.slug,
    title: doc.title,
    badge: doc.badge,
    category: doc.category,
    summary: doc.summary,
    content_markdown: doc.content_markdown,
    status: doc.status,
    show_in_footer: doc.show_in_footer,
    display_order: doc.display_order,
    version_label: doc.version_label,
    effective_date: doc.effective_date,
    updated_by: doc.updated_by,
    created_at: toIsoStringOrNow(doc.created_at),
    updated_at: toIsoStringOrNow(doc.updated_at),
  }
}

function resolveLegalSeedFilePath(): string {
  const candidates = [
    path.resolve(process.cwd(), '../../data/storefront/legal-seed.json'),
    path.resolve(process.cwd(), 'data/storefront/legal-seed.json'),
    path.resolve(__dirname, '../../../../data/storefront/legal-seed.json'),
  ]
  for (const candidate of candidates) {
    if (fs.existsSync(candidate)) return candidate
  }
  throw new Error('Legal seed JSON missing at data/storefront/legal-seed.json')
}

export async function syncDefaultLegalDocuments(legalService: LegalModuleService): Promise<{
  created: number
  items: LegalDocumentDTO[]
}> {
  const raw = JSON.parse(fs.readFileSync(resolveLegalSeedFilePath(), 'utf8')) as {
    documents: CreateLegalDocumentInput[]
  }

  const existing = (await legalService.listLegalDocuments({}, { take: 200 })) as PersistedLegalDocument[]
  const existingSlugs = new Set(existing.map((doc) => doc.slug.trim().toLowerCase()))

  let created = 0
  for (const item of raw.documents) {
    const slug = item.slug.trim().toLowerCase()
    if (existingSlugs.has(slug)) continue
    await legalService.createLegalDocuments({
      ...item,
      slug,
    })
    existingSlugs.add(slug)
    created++
  }

  if (created > 0) {
    await invalidateLegalCache()
  }

  const ordered = await legalService.listOrdered()
  return {
    created,
    items: ordered.map(formatLegalRecord),
  }
}
