import type { MedusaRequest, MedusaResponse } from '@medusajs/framework/http'
import {
  recommendationSignalEventSchema,
  type ApiErrorResponse,
  type BackendPopularityResponse,
  type RecommendationTelemetryResponse,
} from '@mobile-station/types'
import {
  getTopPopularitySignals,
  recordRecommendationSignal,
} from '../../../modules/recommendations/cache'

export const AUTHENTICATE = false

export const GET = async (
  req: MedusaRequest,
  res: MedusaResponse<BackendPopularityResponse>
): Promise<MedusaResponse<BackendPopularityResponse>> => {
  const rawLimit = Number(req.query.limit ?? 20)
  const safeLimit = Number.isFinite(rawLimit) ? Math.min(50, Math.max(1, Math.trunc(rawLimit))) : 20

  const result = await getTopPopularitySignals(safeLimit)
  return res.status(200).json(result)
}

export const POST = async (
  req: MedusaRequest,
  res: MedusaResponse<RecommendationTelemetryResponse | ApiErrorResponse>
): Promise<MedusaResponse<RecommendationTelemetryResponse | ApiErrorResponse>> => {
  const parsed = recommendationSignalEventSchema.safeParse(req.body)
  if (!parsed.success) {
    return res.status(400).json({
      type: 'invalid_data',
      message: parsed.error.issues[0]?.message ?? 'Invalid recommendation telemetry signal',
    })
  }

  const recorded = await recordRecommendationSignal({
    productHandle: parsed.data.product_handle,
    signalType: parsed.data.signal_type,
  })

  return res.status(200).json({
    recorded,
    signal_type: parsed.data.signal_type,
  })
}
