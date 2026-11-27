import type {
  CreateLegalDocumentInput,
  LegalDocumentDTO,
  LegalDocumentListResponse,
  LegalDocumentMutationResponse,
} from '@mobile-station/types'
import legalSeedData from '../../../../data/storefront/legal-seed.json'

const BACKEND_URL = (
  process.env.MEDUSA_BACKEND_URL ||
  process.env.NEXT_PUBLIC_MEDUSA_BACKEND_URL ||
  'http://127.0.0.1:9000'
).replace(/\/$/, '')

const PUBLISHABLE_KEY = process.env.NEXT_PUBLIC_MEDUSA_PUBLISHABLE_KEY || ''

function seedEntryToDto(item: CreateLegalDocumentInput, index: number): LegalDocumentDTO {
  const now = item.effective_date ? `${item.effective_date}T00:00:00.000Z` : '2026-11-01T00:00:00.000Z'
  return {
    id: `seed_legal_${item.slug}`,
    slug: item.slug,
    title: item.title,
    badge: item.badge || 'LEGAL & POLICY',
    category: item.category || 'privacy',
    summary: item.summary,
    content_markdown: item.content_markdown,
    status: item.status || 'published',
    show_in_footer: item.show_in_footer ?? true,
    display_order: item.display_order ?? index + 1,
    version_label: item.version_label || 'v1.0',
    effective_date: item.effective_date ?? null,
    updated_by: item.updated_by ?? 'Mobile Station Compliance',
    created_at: now,
    updated_at: now,
  }
}

export function getSeedLegalDocuments(): LegalDocumentDTO[] {
  const raw = legalSeedData as { documents: CreateLegalDocumentInput[] }
  return raw.documents
    .map(seedEntryToDto)
    .filter((doc) => doc.status === 'published')
    .sort((a, b) => a.display_order - b.display_order)
}

function createStoreHeaders(): Headers {
  const headers = new Headers({ Accept: 'application/json' })
  if (PUBLISHABLE_KEY) {
    headers.set('x-publishable-api-key', PUBLISHABLE_KEY)
  }
  return headers
}

/**
 * Fetches published legal & privacy Markdown documents from Medusa `/store/legal`,
 * seamlessly falling back to curated seed data when backend is offline.
 */
export async function fetchPublishedLegalDocuments(): Promise<{
  items: LegalDocumentDTO[]
  source: 'backend' | 'seed'
}> {
  try {
    const controller = new AbortController()
    const timeout = setTimeout(() => controller.abort(), 2500)
    const response = await fetch(`${BACKEND_URL}/store/legal`, {
      headers: createStoreHeaders(),
      cache: 'no-store',
      signal: controller.signal,
    })
    clearTimeout(timeout)

    if (!response.ok) {
      return { items: getSeedLegalDocuments(), source: 'seed' }
    }

    const payload = (await response.json()) as Partial<LegalDocumentListResponse>
    if (Array.isArray(payload.items) && payload.items.length > 0) {
      return { items: payload.items, source: 'backend' }
    }

    return { items: getSeedLegalDocuments(), source: 'seed' }
  } catch {
    return { items: getSeedLegalDocuments(), source: 'seed' }
  }
}

/**
 * Fetches a single published policy by slug from Medusa `/store/legal/:slug`.
 * Respects live backend 404 (e.g. unpublished draft) while falling back on network error.
 */
export async function fetchLegalDocumentBySlug(
  rawSlug: string
): Promise<LegalDocumentDTO | null> {
  const slug = rawSlug.trim().toLowerCase()
  if (!slug) return null

  try {
    const controller = new AbortController()
    const timeout = setTimeout(() => controller.abort(), 2500)
    const response = await fetch(`${BACKEND_URL}/store/legal/${encodeURIComponent(slug)}`, {
      headers: createStoreHeaders(),
      cache: 'no-store',
      signal: controller.signal,
    })
    clearTimeout(timeout)

    if (response.status === 404) {
      return null
    }

    if (!response.ok) {
      return getSeedLegalDocuments().find((d) => d.slug === slug) ?? null
    }

    const payload = (await response.json()) as Partial<LegalDocumentMutationResponse>
    return payload.item ?? null
  } catch {
    return getSeedLegalDocuments().find((d) => d.slug === slug) ?? null
  }
}
