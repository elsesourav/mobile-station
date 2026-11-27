import type { MedusaRequest, MedusaResponse } from '@medusajs/framework/http'
import {
  LEGAL_CATEGORIES,
  type LegalCategory,
  type LegalDocumentListResponse,
} from '@mobile-station/types'
import { LEGAL_MODULE } from '../../../modules/legal'
import type { LegalModuleService } from '../../../modules/legal/service'
import {
  getCachedLegalPayload,
  setCachedLegalPayload,
} from '../../../modules/legal/cache'
import { formatLegalRecord } from '../../../modules/legal/query-helpers'

export const AUTHENTICATE = false

export const GET = async (
  req: MedusaRequest,
  res: MedusaResponse<LegalDocumentListResponse>
): Promise<MedusaResponse<LegalDocumentListResponse>> => {
  const query = req.query ?? {}
  const category =
    typeof query.category === 'string' &&
    (LEGAL_CATEGORIES as readonly string[]).includes(query.category.trim())
      ? (query.category.trim() as LegalCategory)
      : undefined
  const footerOnly = query.footer_only === 'true'

  const cacheKey = `store:list:${category || 'all'}:${footerOnly ? 'footer' : 'all'}`
  const cached = await getCachedLegalPayload<LegalDocumentListResponse>(cacheKey)
  if (cached) {
    res.setHeader('X-Cache', 'HIT')
    return res.status(200).json(cached)
  }

  const legalService = req.scope.resolve<LegalModuleService>(LEGAL_MODULE)
  const rows = await legalService.listOrdered({
    status: 'published',
    category,
    footer_only: footerOnly,
  })

  const payload: LegalDocumentListResponse = {
    items: rows.map(formatLegalRecord),
    count: rows.length,
  }

  await setCachedLegalPayload(cacheKey, payload, 60)
  res.setHeader('X-Cache', 'MISS')
  return res.status(200).json(payload)
}
