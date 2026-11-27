import { z } from 'zod'

export const LEGAL_DOCUMENT_STATUSES = ['draft', 'published'] as const
export type LegalDocumentStatus = (typeof LEGAL_DOCUMENT_STATUSES)[number]

export const LEGAL_CATEGORIES = [
  'privacy',
  'terms',
  'warranty',
  'shipping',
  'tax_gst',
  'returns',
] as const
export type LegalCategory = (typeof LEGAL_CATEGORIES)[number]

export const LEGAL_CATEGORY_LABELS: Record<LegalCategory, string> = {
  privacy: 'Privacy & Data',
  terms: 'Terms & Conditions',
  warranty: 'Warranty & Care',
  shipping: 'Shipping & Open-Box',
  tax_gst: '18% GST & Billing',
  returns: 'Returns & Refunds',
}

export const LEGAL_STATUS_LABELS: Record<LegalDocumentStatus, string> = {
  draft: 'Draft',
  published: 'Published Live',
}

export interface LegalDocumentDTO {
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
  created_at: string
  updated_at: string
}

export interface LegalDocumentListResponse {
  items: LegalDocumentDTO[]
  count: number
}

export interface LegalDocumentMutationResponse {
  item: LegalDocumentDTO
}

export interface LegalDocumentDeleteResponse {
  id: string
  deleted: boolean
}

export interface LegalSeedSyncResponse {
  created: number
  total: number
  items: LegalDocumentDTO[]
}

export function normalizeLegalSlug(raw: string): string {
  return raw
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9-]+/g, '-')
    .replace(/-{2,}/g, '-')
    .replace(/^-+|-+$/g, '')
}

const SLUG_REGEX = /^[a-z0-9]+(?:-[a-z0-9]+)*$/

export const createLegalDocumentSchema = z.object({
  slug: z
    .string()
    .trim()
    .min(2, 'URL slug must be at least 2 characters')
    .max(80, 'URL slug cannot exceed 80 characters')
    .transform((v) => normalizeLegalSlug(v))
    .refine((v) => SLUG_REGEX.test(v), {
      message: 'Slug can contain lowercase letters, numbers, and hyphens only (e.g. privacy-policy)',
    }),
  title: z.string().trim().min(3, 'Document title must be at least 3 characters').max(160),
  badge: z.string().trim().min(2).max(60).default('LEGAL & POLICY'),
  category: z.enum(LEGAL_CATEGORIES).default('privacy'),
  summary: z.string().trim().min(10, 'Summary must be at least 10 characters').max(500),
  content_markdown: z
    .string()
    .trim()
    .min(20, 'Markdown body must be at least 20 characters')
    .max(80000, 'Markdown body cannot exceed 80,000 characters'),
  status: z.enum(LEGAL_DOCUMENT_STATUSES).default('published'),
  show_in_footer: z.boolean().default(true),
  display_order: z.number().int().min(0).max(10000).default(100),
  version_label: z.string().trim().min(1).max(32).default('v1.0'),
  effective_date: z
    .string()
    .trim()
    .regex(/^\d{4}-\d{2}-\d{2}$/, 'Effective date must follow YYYY-MM-DD')
    .nullable()
    .optional()
    .default(null),
  updated_by: z.string().trim().max(120).nullable().optional().default(null),
})

export const updateLegalDocumentSchema = z.object({
  slug: z
    .string()
    .trim()
    .min(2)
    .max(80)
    .transform((v) => normalizeLegalSlug(v))
    .refine((v) => SLUG_REGEX.test(v), {
      message: 'Slug can contain lowercase letters, numbers, and hyphens only',
    })
    .optional(),
  title: z.string().trim().min(3).max(160).optional(),
  badge: z.string().trim().min(2).max(60).optional(),
  category: z.enum(LEGAL_CATEGORIES).optional(),
  summary: z.string().trim().min(10).max(500).optional(),
  content_markdown: z.string().trim().min(20).max(80000).optional(),
  status: z.enum(LEGAL_DOCUMENT_STATUSES).optional(),
  show_in_footer: z.boolean().optional(),
  display_order: z.number().int().min(0).max(10000).optional(),
  version_label: z.string().trim().min(1).max(32).optional(),
  effective_date: z
    .string()
    .trim()
    .regex(/^\d{4}-\d{2}-\d{2}$/, 'Effective date must follow YYYY-MM-DD')
    .nullable()
    .optional(),
  updated_by: z.string().trim().max(120).nullable().optional(),
})

export type CreateLegalDocumentInput = z.infer<typeof createLegalDocumentSchema>
export type UpdateLegalDocumentInput = z.infer<typeof updateLegalDocumentSchema>
