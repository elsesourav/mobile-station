import type { MedusaRequest, MedusaResponse } from '@medusajs/framework/http'
import { updateShowcaseEntrySchema } from '@mobile-station/types'
import { SHOWCASE_MODULE } from '../../../../modules/showcase'
import type { ShowcaseModuleService } from '../../../../modules/showcase/service'
import { ShowcaseCloudinaryMediaService } from '../../../../modules/showcase/cloudinary-media'
import { invalidateShowcaseCache } from '../../../../modules/showcase/cache'
import { formatShowcaseRecord } from '../../../../modules/showcase/query-helpers'

export const GET = async (req: MedusaRequest, res: MedusaResponse): Promise<void> => {
  const { id } = req.params
  const showcaseService = req.scope.resolve<ShowcaseModuleService>(SHOWCASE_MODULE)
  const found = await showcaseService.listShowcaseEntries({ id })
  const item = found[0]
  if (!item) {
    res.status(404).json({ type: 'not_found', message: `Showcase entry ${id} not found` })
    return
  }

  res.status(200).json({
    item: formatShowcaseRecord(item as unknown as Record<string, unknown>),
  })
}

export const PATCH = async (req: MedusaRequest, res: MedusaResponse): Promise<void> => {
  const { id } = req.params
  const parsed = updateShowcaseEntrySchema.safeParse(req.body)
  if (!parsed.success) {
    res.status(400).json({
      type: 'invalid_data',
      message: parsed.error.issues[0]?.message || 'Invalid update payload',
      issues: parsed.error.issues,
    })
    return
  }

  const showcaseService = req.scope.resolve<ShowcaseModuleService>(SHOWCASE_MODULE)
  const existingRows = await showcaseService.listShowcaseEntries({ id })
  const existing = existingRows[0]
  if (!existing) {
    res.status(404).json({ type: 'not_found', message: `Showcase entry ${id} not found` })
    return
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

  const updated = await showcaseService.updateShowcaseEntries({
    id,
    ...restData,
    media_url: nextMediaKind === 'none' ? null : nextMediaUrl,
    thumbnail_url: nextMediaKind === 'none' ? null : nextThumbnailUrl,
    ...(visited_at !== undefined
      ? { visited_at: visited_at ? new Date(visited_at) : null }
      : {}),
  })

  await invalidateShowcaseCache()

  res.status(200).json({
    item: formatShowcaseRecord(updated as unknown as Record<string, unknown>),
  })
}

export const DELETE = async (req: MedusaRequest, res: MedusaResponse): Promise<void> => {
  const { id } = req.params
  const showcaseService = req.scope.resolve<ShowcaseModuleService>(SHOWCASE_MODULE)
  const existingRows = await showcaseService.listShowcaseEntries({ id })
  const existing = existingRows[0]
  if (!existing) {
    res.status(404).json({ type: 'not_found', message: `Showcase entry ${id} not found` })
    return
  }

  if (existing.media_public_id && existing.media_kind !== 'none') {
    const mediaService = new ShowcaseCloudinaryMediaService()
    await mediaService.destroyAsset(existing.media_public_id, existing.media_kind)
  }

  await showcaseService.deleteShowcaseEntries(id)
  await invalidateShowcaseCache()

  res.status(200).json({ id, deleted: true })
}
