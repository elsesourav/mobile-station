import type { MedusaRequest, MedusaResponse } from '@medusajs/framework/http'
import {
  publicFeedbackSubmitSchema,
  type ApiErrorResponse,
  type PublicFeedbackSubmitResponse,
  type ShowcaseListResponse,
} from '@mobile-station/types'
import { SHOWCASE_MODULE } from '../../../modules/showcase'
import type { ShowcaseModuleService } from '../../../modules/showcase/service'
import {
  checkPublicSubmissionRateLimit,
  getCachedShowcasePayload,
  setCachedShowcasePayload,
} from '../../../modules/showcase/cache'
import {
  formatShowcaseRecord,
  parseShowcaseListQuery,
} from '../../../modules/showcase/query-helpers'

export const AUTHENTICATE = false

export const GET = async (
  req: MedusaRequest,
  res: MedusaResponse<ShowcaseListResponse>
): Promise<MedusaResponse<ShowcaseListResponse>> => {
  const filters = parseShowcaseListQuery(req, true)
  const cacheKey = `list:${JSON.stringify(filters)}`

  const cached = await getCachedShowcasePayload<ShowcaseListResponse>(cacheKey)
  if (cached) {
    res.setHeader('X-Cache', 'HIT')
    return res.status(200).json(cached)
  }

  const showcaseService = req.scope.resolve<ShowcaseModuleService>(SHOWCASE_MODULE)
  const [result, stats] = await Promise.all([
    showcaseService.listFiltered(filters),
    showcaseService.getSummaryStats(true),
  ])

  const payload: ShowcaseListResponse = {
    items: result.items.map(formatShowcaseRecord),
    count: result.count,
    limit: result.limit,
    offset: result.offset,
    stats,
  }

  await setCachedShowcasePayload(cacheKey, payload, 60)
  res.setHeader('X-Cache', 'MISS')
  return res.status(200).json(payload)
}

export const POST = async (
  req: MedusaRequest,
  res: MedusaResponse<PublicFeedbackSubmitResponse | ApiErrorResponse>
): Promise<MedusaResponse<PublicFeedbackSubmitResponse | ApiErrorResponse>> => {
  const clientIp =
    (typeof req.headers['x-forwarded-for'] === 'string'
      ? req.headers['x-forwarded-for'].split(',')[0]?.trim()
      : '') ||
    req.ip ||
    'unknown'

  const rateLimit = await checkPublicSubmissionRateLimit(clientIp, 5, 3600)
  if (!rateLimit.allowed) {
    return res.status(429).json({
      type: 'rate_limit',
      message: 'Too many review submissions from this network. Please try again later.',
    })
  }

  const parsed = publicFeedbackSubmitSchema.safeParse(req.body)
  if (!parsed.success) {
    return res.status(400).json({
      type: 'invalid_data',
      message: parsed.error.issues[0]?.message || 'Invalid customer feedback submission',
      issues: parsed.error.issues.map((issue) => ({
        path: issue.path,
        message: issue.message,
      })),
    })
  }

  const showcaseService = req.scope.resolve<ShowcaseModuleService>(SHOWCASE_MODULE)
  const created = await showcaseService.createShowcaseEntries({
    ...parsed.data,
    media_kind: 'none',
    status: 'draft',
    is_featured: false,
    is_verified_buyer: false,
    display_order: 200,
    media_url: null,
    media_public_id: null,
    thumbnail_url: null,
    duration_seconds: null,
    media_width: null,
    media_height: null,
    mime_type: null,
    visited_at: new Date(),
  })

  return res.status(201).json({
    id: created.id,
    status: created.status,
    message: 'Thank you! Your review has been received and queued for Hub verification.',
  })
}
