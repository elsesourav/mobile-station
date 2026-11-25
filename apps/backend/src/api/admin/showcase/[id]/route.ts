import type { MedusaRequest, MedusaResponse } from '@medusajs/framework/http'
import {
  updateShowcaseEntrySchema,
  type ApiErrorResponse,
  type ShowcaseDeleteResponse,
  type ShowcaseMutationResponse,
} from '@mobile-station/types'
import { SHOWCASE_MODULE } from '../../../../modules/showcase'
import type { ShowcaseModuleService } from '../../../../modules/showcase/service'
import { ShowcaseCloudinaryMediaService } from '../../../../modules/showcase/cloudinary-media'
import { invalidateShowcaseCache } from '../../../../modules/showcase/cache'
import { formatShowcaseRecord } from '../../../../modules/showcase/query-helpers'
import type { PersistedShowcaseEntry } from '../../../../types/showcase-backend'

export const GET = async (
  req: MedusaRequest,
  res: MedusaResponse<ShowcaseMutationResponse | ApiErrorResponse>
): Promise<MedusaResponse<ShowcaseMutationResponse | ApiErrorResponse>> => {
  const { id } = req.params
  const showcaseService = req.scope.resolve<ShowcaseModuleService>(SHOWCASE_MODULE)
  const foundRows = (await showcaseService.listShowcaseEntries({ id })) as PersistedShowcaseEntry[]
  const existingEntry = foundRows[0]
  if (!existingEntry) {
    return res.status(404).json({ type: 'not_found', message: `Showcase entry ${id} not found` })
  }

  return res.status(200).json({
    item: formatShowcaseRecord(existingEntry),
  })
}

export const PATCH = async (
  req: MedusaRequest,
  res: MedusaResponse<ShowcaseMutationResponse | ApiErrorResponse>
): Promise<MedusaResponse<ShowcaseMutationResponse | ApiErrorResponse>> => {
  const { id } = req.params
  const parsed = updateShowcaseEntrySchema.safeParse(req.body)
  if (!parsed.success) {
    return res.status(400).json({
      type: 'invalid_data',
      message: parsed.error.issues[0]?.message || 'Invalid update payload',
      issues: parsed.error.issues.map((issue) => ({
        path: issue.path,
        message: issue.message,
      })),
    })
  }

  const showcaseService = req.scope.resolve<ShowcaseModuleService>(SHOWCASE_MODULE)
  const existingRows = (await showcaseService.listShowcaseEntries({
    id,
  })) as PersistedShowcaseEntry[]
  const existing = existingRows[0]
  if (!existing) {
    return res.status(404).json({ type: 'not_found', message: `Showcase entry ${id} not found` })
  }

  const { visited_at, ...restData } = parsed.data
  const mediaService = new ShowcaseCloudinaryMediaService()
  const nextMediaKind = restData.media_kind ?? existing.media_kind
  let nextMediaUrl = restData.media_url !== undefined ? restData.media_url : existing.media_url
  let nextThumbnailUrl =
    restData.thumbnail_url !== undefined ? restData.thumbnail_url : existing.thumbnail_url

  if (
    restData.media_public_id &&
    existing.media_public_id &&
    restData.media_public_id !== existing.media_public_id
  ) {
    await mediaService.destroyAsset(existing.media_public_id, existing.media_kind)
  }

  if (restData.media_public_id && nextMediaKind !== 'none') {
    const optimized = mediaService.buildOptimizedMediaUrls({
      public_id: restData.media_public_id,
      media_kind: nextMediaKind,
      fallback_secure_url: nextMediaUrl ?? undefined,
    })
    nextMediaUrl = optimized.media_url || nextMediaUrl
    if (restData.thumbnail_url === undefined) {
      nextThumbnailUrl = optimized.thumbnail_url || nextThumbnailUrl
    }
  }

  const updatedEntry: PersistedShowcaseEntry = await showcaseService.updateShowcaseEntries({
    id,
    ...restData,
    media_url: nextMediaKind === 'none' ? null : nextMediaUrl,
    thumbnail_url: nextMediaKind === 'none' ? null : nextThumbnailUrl,
    ...(visited_at !== undefined ? { visited_at: visited_at ? new Date(visited_at) : null } : {}),
  })

  await invalidateShowcaseCache()

  return res.status(200).json({
    item: formatShowcaseRecord(updatedEntry),
  })
}

export const DELETE = async (
  req: MedusaRequest,
  res: MedusaResponse<ShowcaseDeleteResponse | ApiErrorResponse>
): Promise<MedusaResponse<ShowcaseDeleteResponse | ApiErrorResponse>> => {
  const { id } = req.params
  const showcaseService = req.scope.resolve<ShowcaseModuleService>(SHOWCASE_MODULE)
  const existingRows = (await showcaseService.listShowcaseEntries({
    id,
  })) as PersistedShowcaseEntry[]
  const existing = existingRows[0]
  if (!existing) {
    return res.status(404).json({ type: 'not_found', message: `Showcase entry ${id} not found` })
  }

  if (existing.media_public_id && existing.media_kind !== 'none') {
    const mediaService = new ShowcaseCloudinaryMediaService()
    await mediaService.destroyAsset(existing.media_public_id, existing.media_kind)
  }

  await showcaseService.deleteShowcaseEntries(id)
  await invalidateShowcaseCache()

  return res.status(200).json({ id, deleted: true })
}
