import type { MedusaRequest, MedusaResponse } from '@medusajs/framework/http'
import {
  createShowcaseEntrySchema,
  type ApiErrorResponse,
  type ShowcaseListResponse,
  type ShowcaseMutationResponse,
} from '@mobile-station/types'
import { SHOWCASE_MODULE } from '../../../modules/showcase'
import type { ShowcaseModuleService } from '../../../modules/showcase/service'
import { ShowcaseCloudinaryMediaService } from '../../../modules/showcase/cloudinary-media'
import { invalidateShowcaseCache } from '../../../modules/showcase/cache'
import {
  formatShowcaseRecord,
  parseShowcaseListQuery,
} from '../../../modules/showcase/query-helpers'
import type { PersistedShowcaseEntry } from '../../../types/showcase-backend'

export const GET = async (
  req: MedusaRequest,
  res: MedusaResponse<ShowcaseListResponse>
): Promise<MedusaResponse<ShowcaseListResponse>> => {
  const showcaseService = req.scope.resolve<ShowcaseModuleService>(SHOWCASE_MODULE)
  const filters = parseShowcaseListQuery(req, false)
  const [result, stats] = await Promise.all([
    showcaseService.listFiltered(filters),
    showcaseService.getSummaryStats(false),
  ])

  return res.status(200).json({
    items: result.items.map(formatShowcaseRecord),
    count: result.count,
    limit: result.limit,
    offset: result.offset,
    stats,
  })
}

export const POST = async (
  req: MedusaRequest,
  res: MedusaResponse<ShowcaseMutationResponse | ApiErrorResponse>
): Promise<MedusaResponse<ShowcaseMutationResponse | ApiErrorResponse>> => {
  const parsed = createShowcaseEntrySchema.safeParse(req.body)
  if (!parsed.success) {
    return res.status(400).json({
      type: 'invalid_data',
      message: parsed.error.issues[0]?.message || 'Invalid showcase entry payload',
      issues: parsed.error.issues.map((issue) => ({
        path: issue.path,
        message: issue.message,
      })),
    })
  }

  const input = parsed.data
  const mediaService = new ShowcaseCloudinaryMediaService()

  let mediaUrl = input.media_url
  let thumbnailUrl = input.thumbnail_url
  if (input.media_public_id && input.media_kind !== 'none') {
    const optimized = mediaService.buildOptimizedMediaUrls({
      public_id: input.media_public_id,
      media_kind: input.media_kind,
      fallback_secure_url: input.media_url ?? undefined,
    })
    mediaUrl = optimized.media_url || mediaUrl
    thumbnailUrl = thumbnailUrl || optimized.thumbnail_url || null
  } else if (input.media_kind === 'image' && input.media_url && !thumbnailUrl) {
    thumbnailUrl = input.media_url
  }

  const showcaseService = req.scope.resolve<ShowcaseModuleService>(SHOWCASE_MODULE)
  const createdEntry: PersistedShowcaseEntry = await showcaseService.createShowcaseEntries({
    ...input,
    media_url: input.media_kind === 'none' ? null : mediaUrl,
    thumbnail_url: input.media_kind === 'none' ? null : thumbnailUrl,
    visited_at: input.visited_at ? new Date(input.visited_at) : null,
  })

  await invalidateShowcaseCache()

  return res.status(201).json({
    item: formatShowcaseRecord(createdEntry),
  })
}
