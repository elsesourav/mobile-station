import type { MedusaRequest, MedusaResponse } from '@medusajs/framework/http'
import {
  updateLegalDocumentSchema,
  type ApiErrorResponse,
  type LegalDocumentDeleteResponse,
  type LegalDocumentMutationResponse,
} from '@mobile-station/types'
import { LEGAL_MODULE } from '../../../../modules/legal'
import type { LegalModuleService } from '../../../../modules/legal/service'
import { invalidateLegalCache } from '../../../../modules/legal/cache'
import { formatLegalRecord } from '../../../../modules/legal/query-helpers'
import type { PersistedLegalDocument } from '../../../../types/legal-backend'

async function resolveDocumentByParam(
  legalService: LegalModuleService,
  idOrSlug: string
): Promise<PersistedLegalDocument | null> {
  const byId = (await legalService.listLegalDocuments(
    { id: idOrSlug },
    { take: 1 }
  )) as PersistedLegalDocument[]
  if (byId[0]) return byId[0]
  return legalService.findBySlug(idOrSlug, false)
}

export const GET = async (
  req: MedusaRequest,
  res: MedusaResponse<LegalDocumentMutationResponse | ApiErrorResponse>
): Promise<MedusaResponse<LegalDocumentMutationResponse | ApiErrorResponse>> => {
  const legalService = req.scope.resolve<LegalModuleService>(LEGAL_MODULE)
  const doc = await resolveDocumentByParam(legalService, req.params.id)
  if (!doc) {
    return res.status(404).json({
      type: 'not_found',
      message: `Legal document "${req.params.id}" not found`,
    })
  }
  return res.status(200).json({ item: formatLegalRecord(doc) })
}

export const PATCH = async (
  req: MedusaRequest,
  res: MedusaResponse<LegalDocumentMutationResponse | ApiErrorResponse>
): Promise<MedusaResponse<LegalDocumentMutationResponse | ApiErrorResponse>> => {
  const parsed = updateLegalDocumentSchema.safeParse(req.body)
  if (!parsed.success) {
    return res.status(400).json({
      type: 'invalid_data',
      message: parsed.error.issues[0]?.message || 'Invalid legal document update payload',
      issues: parsed.error.issues.map((issue) => ({
        path: issue.path,
        message: issue.message,
      })),
    })
  }

  const legalService = req.scope.resolve<LegalModuleService>(LEGAL_MODULE)
  const existing = await resolveDocumentByParam(legalService, req.params.id)
  if (!existing) {
    return res.status(404).json({
      type: 'not_found',
      message: `Legal document "${req.params.id}" not found`,
    })
  }

  if (parsed.data.slug && parsed.data.slug !== existing.slug) {
    const conflicting = await legalService.findBySlug(parsed.data.slug, false)
    if (conflicting && conflicting.id !== existing.id) {
      return res.status(409).json({
        type: 'duplicate_error',
        message: `Slug "${parsed.data.slug}" is already assigned to "${conflicting.title}".`,
      })
    }
  }

  const updated = (await legalService.updateLegalDocuments({
    id: existing.id,
    ...parsed.data,
  })) as PersistedLegalDocument

  await invalidateLegalCache()

  return res.status(200).json({
    item: formatLegalRecord(updated),
  })
}

export const DELETE = async (
  req: MedusaRequest,
  res: MedusaResponse<LegalDocumentDeleteResponse | ApiErrorResponse>
): Promise<MedusaResponse<LegalDocumentDeleteResponse | ApiErrorResponse>> => {
  const legalService = req.scope.resolve<LegalModuleService>(LEGAL_MODULE)
  const existing = await resolveDocumentByParam(legalService, req.params.id)
  if (!existing) {
    return res.status(404).json({
      type: 'not_found',
      message: `Legal document "${req.params.id}" not found`,
    })
  }

  await legalService.deleteLegalDocuments(existing.id)
  await invalidateLegalCache()

  return res.status(200).json({
    id: existing.id,
    deleted: true,
  })
}
