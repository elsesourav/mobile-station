import type { MedusaRequest, MedusaResponse } from '@medusajs/framework/http'
import {
  createLegalDocumentSchema,
  LEGAL_CATEGORIES,
  LEGAL_DOCUMENT_STATUSES,
  type ApiErrorResponse,
  type LegalCategory,
  type LegalDocumentListResponse,
  type LegalDocumentMutationResponse,
  type LegalDocumentStatus,
} from '@mobile-station/types'
import { LEGAL_MODULE } from '../../../modules/legal'
import type { LegalModuleService } from '../../../modules/legal/service'
import { invalidateLegalCache } from '../../../modules/legal/cache'
import { formatLegalRecord } from '../../../modules/legal/query-helpers'
import type { PersistedLegalDocument } from '../../../types/legal-backend'

function matchEnum<T extends string>(raw: unknown, allowed: readonly T[]): T | undefined {
  if (typeof raw !== 'string') return undefined
  const v = raw.trim()
  return (allowed as readonly string[]).includes(v) ? (v as T) : undefined
}

export const GET = async (
  req: MedusaRequest,
  res: MedusaResponse<LegalDocumentListResponse>
): Promise<MedusaResponse<LegalDocumentListResponse>> => {
  const legalService = req.scope.resolve<LegalModuleService>(LEGAL_MODULE)
  const query = req.query ?? {}
  const category = matchEnum<LegalCategory>(query.category, LEGAL_CATEGORIES)
  const status = matchEnum<LegalDocumentStatus>(query.status, LEGAL_DOCUMENT_STATUSES)
  const search = typeof query.q === 'string' ? query.q.trim() : undefined

  const rows = await legalService.listOrdered({ category, status, search })
  return res.status(200).json({
    items: rows.map(formatLegalRecord),
    count: rows.length,
  })
}

export const POST = async (
  req: MedusaRequest,
  res: MedusaResponse<LegalDocumentMutationResponse | ApiErrorResponse>
): Promise<MedusaResponse<LegalDocumentMutationResponse | ApiErrorResponse>> => {
  const parsed = createLegalDocumentSchema.safeParse(req.body)
  if (!parsed.success) {
    return res.status(400).json({
      type: 'invalid_data',
      message: parsed.error.issues[0]?.message || 'Invalid legal document payload',
      issues: parsed.error.issues.map((issue) => ({
        path: issue.path,
        message: issue.message,
      })),
    })
  }

  const legalService = req.scope.resolve<LegalModuleService>(LEGAL_MODULE)
  const existing = await legalService.findBySlug(parsed.data.slug, false)
  if (existing) {
    return res.status(409).json({
      type: 'duplicate_error',
      message: `A legal document with slug "${parsed.data.slug}" already exists.`,
    })
  }

  const created = (await legalService.createLegalDocuments({
    ...parsed.data,
  })) as PersistedLegalDocument

  await invalidateLegalCache()

  return res.status(201).json({
    item: formatLegalRecord(created),
  })
}
