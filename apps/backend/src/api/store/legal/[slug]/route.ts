import type { MedusaRequest, MedusaResponse } from '@medusajs/framework/http'
import type {
  ApiErrorResponse,
  LegalDocumentMutationResponse,
} from '@mobile-station/types'
import { LEGAL_MODULE } from '../../../../modules/legal'
import type { LegalModuleService } from '../../../../modules/legal/service'
import {
  getCachedLegalPayload,
  setCachedLegalPayload,
} from '../../../../modules/legal/cache'
import { formatLegalRecord } from '../../../../modules/legal/query-helpers'

export const AUTHENTICATE = false

export const GET = async (
  req: MedusaRequest,
  res: MedusaResponse<LegalDocumentMutationResponse | ApiErrorResponse>
): Promise<MedusaResponse<LegalDocumentMutationResponse | ApiErrorResponse>> => {
  const slug = String(req.params.slug || '')
    .trim()
    .toLowerCase()
  const cacheKey = `store:slug:${slug}`

  const cached = await getCachedLegalPayload<LegalDocumentMutationResponse>(cacheKey)
  if (cached) {
    res.setHeader('X-Cache', 'HIT')
    return res.status(200).json(cached)
  }

  const legalService = req.scope.resolve<LegalModuleService>(LEGAL_MODULE)
  const doc = await legalService.findBySlug(slug, true)
  if (!doc) {
    return res.status(404).json({
      type: 'not_found',
      message: `Published legal document "${slug}" not found`,
    })
  }

  const payload: LegalDocumentMutationResponse = {
    item: formatLegalRecord(doc),
  }

  await setCachedLegalPayload(cacheKey, payload, 60)
  res.setHeader('X-Cache', 'MISS')
  return res.status(200).json(payload)
}
