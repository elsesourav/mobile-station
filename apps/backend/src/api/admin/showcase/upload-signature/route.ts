import type { MedusaRequest, MedusaResponse } from '@medusajs/framework/http'
import { uploadSignatureRequestSchema } from '@mobile-station/types'
import { ShowcaseCloudinaryMediaService } from '../../../../modules/showcase/cloudinary-media'

/**
 * POST /admin/showcase/upload-signature
 * Generates short-lived HMAC signed parameters so Medusa Admin uploads heavy
 * video feedback and store-visit media directly to Cloudinary CDN over HTTPS.
 */
export const POST = async (req: MedusaRequest, res: MedusaResponse): Promise<void> => {
  const parsed = uploadSignatureRequestSchema.safeParse(req.body)
  if (!parsed.success) {
    res.status(400).json({
      type: 'invalid_data',
      message: parsed.error.issues[0]?.message || 'Invalid upload signature request',
      issues: parsed.error.issues,
    })
    return
  }

  const mediaService = new ShowcaseCloudinaryMediaService()
  const payload = mediaService.createSignedUploadSignature(parsed.data)

  res.status(200).json(payload)
}
