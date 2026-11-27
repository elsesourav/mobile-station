import type { ExecArgs } from '@medusajs/framework/types'
import { LEGAL_MODULE } from '../modules/legal'
import type { LegalModuleService } from '../modules/legal/service'
import { syncDefaultLegalDocuments } from '../modules/legal/query-helpers'

export default async function seedLegalDocuments({ container }: ExecArgs): Promise<void> {
  const logger = container.resolve('logger')
  const legalService = container.resolve<LegalModuleService>(LEGAL_MODULE)

  const { created, items } = await syncDefaultLegalDocuments(legalService)
  logger.info(
    `[Mobile Station Legal Seed] Seeded ${created} new policy documents (${items.length} total).`
  )
}
