import type { MedusaRequest, MedusaResponse } from '@medusajs/framework/http'
import { ContainerRegistrationKeys } from '@medusajs/framework/utils'
import type { BackendHealthResponse } from '@mobile-station/types'
import { PrivateDocumentStorageService } from '../../../modules/storage-s3/service'
import { ElectronicsSearchService } from '../../../modules/search-meilisearch/service'

export const AUTHENTICATE = false

export const GET = async (
  req: MedusaRequest,
  res: MedusaResponse<BackendHealthResponse>
): Promise<MedusaResponse<BackendHealthResponse>> => {
  const startedAt = Date.now()

  let dbHealthy = true
  let dbLatencyMs = 0
  const dbStart = Date.now()
  try {
    const query = req.scope.resolve(ContainerRegistrationKeys.QUERY)
    await query.graph({
      entity: 'region',
      fields: ['id'],
      pagination: { take: 1 },
    })
    dbLatencyMs = Date.now() - dbStart
  } catch {
    dbHealthy = false
    dbLatencyMs = Date.now() - dbStart
  }

  const s3Service = new PrivateDocumentStorageService()
  const meiliService = new ElectronicsSearchService()
  const [s3Healthy, meiliHealthy] = await Promise.all([
    s3Service.checkBucketHealth(),
    meiliService.checkHealth(),
  ])

  const status = dbHealthy ? 'healthy' : 'unhealthy'
  return res.status(dbHealthy ? 200 : 503).json({
    status,
    ready: dbHealthy,
    service: 'mobile-station-backend',
    environment: process.env.NODE_ENV || 'development',
    elapsed_ms: Date.now() - startedAt,
    components: {
      postgres: {
        status: dbHealthy ? 'healthy' : 'unhealthy',
        latency_ms: dbLatencyMs,
      },
      redis: {
        status: process.env.REDIS_URL ? 'configured' : 'unconfigured',
      },
      cloudinary_images: {
        status: process.env.CLOUDINARY_CLOUD_NAME ? 'configured' : 'unconfigured',
      },
      s3_private_storage: {
        status: s3Healthy ? 'healthy' : 'degraded',
      },
      meilisearch: {
        status: meiliHealthy ? 'healthy' : 'degraded',
      },
      resend_email: {
        status: process.env.RESEND_API_KEY ? 'configured' : 'mock',
      },
    },
  })
}
