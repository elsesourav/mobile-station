import type { MedusaRequest, MedusaResponse } from '@medusajs/framework/http'
import { z } from 'zod'
import { SHOWCASE_ENTRY_TYPES } from '@mobile-station/types'
import { ShowcaseCloudinaryMediaService } from '../../../../modules/showcase/cloudinary-media'

const serverUploadSchema = z.object({
  entry_type: z.enum(SHOWCASE_ENTRY_TYPES),
  media_kind: z.enum(['video', 'image']),
  filename: z.string().trim().min(1).max(180).optional(),
  mime_type: z.string().trim().min(3).max(80).optional(),
  content_base64: z.string().min(4, 'Base64 media content is required'),
})

/**
 * POST /admin/showcase/upload
 * Server-side upload fallback for automation / headless callers.
 */
export const POST = async (req: MedusaRequest, res: MedusaResponse): Promise<void> => {
  const parsed = serverUploadSchema.safeParse(req.body)
  if (!parsed.success) {
    res.status(400).json({
      type: 'invalid_data',
      message: parsed.error.issues[0]?.message || 'Invalid media upload payload',
      issues: parsed.error.issues,
    })
    return
  }

  const rawBase64 = parsed.data.content_base64.includes(';base64,')
    ? parsed.data.content_base64.split(';base64,')[1]
    : parsed.data.content_base64

  const buffer = Buffer.from(rawBase64, 'base64')
  const mediaService = new ShowcaseCloudinaryMediaService()
  const uploaded = await mediaService.uploadMediaBuffer({
    entry_type: parsed.data.entry_type,
    media_kind: parsed.data.media_kind,
    filename: parsed.data.filename,
    mime_type: parsed.data.mime_type,
    content: buffer,
  })

  res.status(201).json(uploaded)
}
