import type { MedusaRequest, MedusaResponse } from '@medusajs/framework/http'
import type { LegalSeedSyncResponse } from '@mobile-station/types'
import { LEGAL_MODULE } from '../../../../modules/legal'
import type { LegalModuleService } from '../../../../modules/legal/service'
import { syncDefaultLegalDocuments } from '../../../../modules/legal/query-helpers'

export const POST = async (
  req: MedusaRequest,
  res: MedusaResponse<LegalSeedSyncResponse>
): Promise<MedusaResponse<LegalSeedSyncResponse>> => {
  const legalService = req.scope.resolve<LegalModuleService>(LEGAL_MODULE)
  const { created, items } = await syncDefaultLegalDocuments(legalService)

  return res.status(200).json({
    created,
    total: items.length,
    items,
  })
}
